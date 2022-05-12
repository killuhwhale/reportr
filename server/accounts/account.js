const db = require('../db/accounts/accounts')
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { verifyToken, needsHacker, needsAdmin, needsSelfOrAdmin, getCompanySecret,
    verifyRefreshToken, verifyUserFromCompanyByCompanyID, verifyUserFromCompanyByUserID
} = require("../utils/middleware")
const { JWT_ACCESS_OPTIONS, JWT_REFRESH_OPTIONS, BCRYPT_SALT_ROUNDS } = require("../specific");
const { ROLES } = require('../constants')

const api = 'accounts'

/** Auth Process
 *  createCompany
 *      - Create company secret
 * 
 * 
 * 
 *  onLogin
 *      - user submits email & password to get user info
 *      - Get company secret via user.company_id from DB
 
*      - Generate two tokens:
 *          1. Access Token payload company_secret_key, accessOptions
 *          2. Refresh Token payload company_secret_key, refreshOptions
 * 
 * 
 * 
 */


const refreshAccessToken = async (user, company_id) => {
    const SECRET = await getCompanySecret(company_id)
    if (SECRET.error) return { error: SECRET.error }

    const accessToken = await generateAccessToken(user, SECRET.secret)
    if (accessToken.error) return { error: accessToken.error }
    return accessToken
}

const generateAccessToken = (payload, company_secret) => {
    return new Promise((resolve, reject) => {
        console.log("Signing access token w/ secret: ", company_secret, payload)

        jwt.sign({ user: payload }, company_secret, JWT_ACCESS_OPTIONS, (err, token) => {
            console.log("Created access token: ")
            console.log(token)
            if (!err) {
                resolve({ token })
            } else {
                resolve({ error: err })
            }
        })
    })

}

const generateRefreshToken = (payload, company_secret) => {
    return new Promise((resolve, reject) => {
        jwt.sign({ user: payload }, company_secret, JWT_REFRESH_OPTIONS, (err, token) => {
            if (!err) {
                resolve({ token })
            } else {
                resolve({ error: err })
            }
        })
    })
}

const generateLoginTokens = (user) => {
    return new Promise(async (resolve, reject) => {
        const SECRET = await getCompanySecret(user.company_id)
        if (SECRET.error) return reject(SECRET.error)

        const accessToken = await generateAccessToken(user, SECRET.secret)
        if (accessToken.error) return reject(accessToken.error)

        const refreshToken = await generateRefreshToken(user, SECRET.secret)
        if (refreshToken.error) return reject(refreshToken.error)

        resolve({ accessToken, refreshToken })

    })
}

module.exports = (app) => {
    app.post(`/${api}/accessToken`, verifyRefreshToken, async (req, res) => {
        const accessToken = await refreshAccessToken(req.user, req.company_id)
        if (accessToken.error) return res.json({ error: accessToken.error })
        return res.json(accessToken)
    })

    app.post(`/${api}/login`, (req, res) => {
        const { email, password } = req.body
        db.login(email, (err, response) => {
            if (!err) {
                const { rows } = response
                const user = rows[0] ?? {}
                const hash = user.password
                if (user && hash) {
                    bcrypt.compare(password, hash, function (err, valid) {
                        if (err) {
                            return res.json({ "error": { msg: "Passowrd compare error", code: 'auth/compare-error' } })
                        }

                        if (valid) {
                            delete user['password']

                            generateLoginTokens(user)
                                .then(result => {
                                    const { refreshToken, accessToken } = result
                                    console.log("Generate login tokens: ", result)
                                    res.json({ "data": { token: accessToken.token, user, accessToken, refreshToken } })
                                })
                                .catch(err => {
                                    console.log('TokenGenError', err)
                                    res.json({ "error": { msg: "Invalid password", code: 'auth/token-error' } })
                                })

                        } else {
                            res.json({ "error": { msg: "Invalid password", code: 'auth/wrong-password' } })
                            console.error({ msg: "Invalid password", code: 'auth/wrong-password' })
                        }
                    });
                } else {
                    res.json({ "error": { msg: "Error logging in, info not found.", code: 'auth/user-not-found' } })
                    console.error("Error logging in, info not found.")
                }
            } else {
                res.json({ "error": `auth/db-error ${err.code}` })
                console.error(`auth/db-error ${err.code}`)

            }
        })
    })

    // Allows Company admins to create user accounts for their company
    app.post(`/${api}/create`, verifyToken, needsAdmin, verifyUserFromCompanyByCompanyID, (req, res) => {
        const { user } = req
        const { email, password, username, account_type, company_id } = req.body

        // Ensure new account cannot be HACKER role
        if (account_type >= ROLES.HACKER) {
            return res.json({ error: `Cannot create user with account type: ${account_type}` })
        }

        bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function (err, hash) {
            db.insertAccount(email, hash, username, account_type, company_id, (err, result) => {
                if (!err) {
                    if (result.rows.length > 0) {
                        res.json(result.rows[0])
                    }
                } else {
                    res.json({ "error": err })
                }
            })
        });
    })

    // This will be for the dashboard only, register admins to a company
    app.post(`/${api}/register`, verifyToken, needsHacker, (req, res) => {
        const { email, password, company_id } = req.body
        const { user } = req

        bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function (err, hash) {
            if (!err) {
                db.insertOwnerAccount(email, hash, company_id, (dbErr, result) => {
                    if (!dbErr) {
                        if (result.rows.length > 0) {
                            res.json(result.rows[0])
                        }
                    } else {
                        if (dbErr.code === "23505") {
                            res.json({ "error": "User with email already exists." })
                        } else {
                            res.json({ "error": dbErr.detail })
                        }
                    }
                })
            } else {
                res.json({ "error": err })
            }
        });

    })


    app.post(`/${api}/currentUser`, verifyToken, (req, res) => {
        // Based on current token, get the user information
        const { user } = req
        db.getAccount(user.pk, (dbErr, result) => {
            if (!dbErr) {
                const data = result.rows.length > 0 ? result.rows[0] : {}
                res.json({ 'data': data })
            } else {
                res.json({ "error": dbErr })
            }
        })



    })

    // Update account information
    app.post(`/${api}/update`, verifyToken, verifyUserFromCompanyByUserID, needsSelfOrAdmin, (req, res) => {
        const { username, email, account_type, company_id, pk } = req.body // Updating user
        const { user } = req // current user

        // Create a new query to update account w/out account_type to ensure account_type isnt change by the user.
        // If requesting user is updating their own information do not allow to change account level
        if (pk === user.pk) {
            const values = [username, email, pk]
            // db.updateAccountForUser // excludes account_type
            db.updateAccountForUser(values, (dbErr, result) => {
                if (!dbErr) {
                    const data = result.rows.length > 0 ? result.rows[0] : {}
                    res.json({ 'data': data })
                } else {
                    console.log(dbErr)
                    res.json({ "error": dbErr })
                }
            })
        } else {
            const values = [username, email, account_type, pk]
            db.updateAccount(values, (dbErr, result) => {
                if (!dbErr) {
                    const data = result.rows.length > 0 ? result.rows[0] : {}
                    res.json({ 'data': data })
                } else {
                    console.log(dbErr)
                    res.json({ "error": dbErr })
                }
            })
        }

    })

    const hashPassword = (password) => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function (err, hash) {
                if (!err) {
                    resolve(hash)
                } else {
                    reject(err)
                }
            })
        })
    }

    const _changePassword = (password, pk) => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function (err, hash) {
                if (!err) {
                    db.changePassword([hash, pk], (dbErr, result) => {
                        console.log("Done changing passowrd")
                        if (!dbErr) {
                            console.log(result.rows)
                            const data = result.rows.length > 0 ? result.rows[0] : {}
                            resolve(data)
                        } else {
                            console.log(dbErr)
                            reject(dbErr)
                        }
                    })

                } else {
                    console.log(err)
                    reject(err)
                }

            })
        })
    }

    app.post(`/${api}/changePassword`, verifyToken, needsSelfOrAdmin, verifyUserFromCompanyByCompanyID, (req, res) => {
        const { token } = req
        const { currentPassword, newPassword, pk, company_id } = req.body.userPassword // account data to update password
        const { user } = req // Current signed in user

        if (parseInt(company_id) !== user.company_id) {
            return res.json({ error: 'Permission denied: User must be from same company.' })
        }

        // IF user is updating password, require the currentPassword
        if (pk === user.pk) {
            db.getAccountWithPassword(pk)
                .then(result => {

                    const account = result.rows[0] ?? {}
                    hashPassword(currentPassword)
                        .then(currentPasswordHash => {
                            bcrypt.compare(account.password, currentPasswordHash, function (err, valid) {
                                if (!err) {
                                    // Common code
                                    _changePassword(newPassword, pk)
                                        .then(user => {
                                            res.json({ "data": user })
                                        })
                                        .catch(err => {
                                            res.json({ "error": "Error updating password for user" })
                                        })
                                } else {
                                    console.log("Current passwords do not match: ", currentPassword, currentPasswordHash, account)
                                    res.json({ "error": "Password given does not match current password" })
                                    return
                                }
                            })

                        })

                })
                .catch(err => {
                    console.log(err)
                })
        } else if (user.account_type >= ROLES.ADMIN) {
            // hash newPassword and update
            // commonCode
            _changePassword(newPassword, pk)
                .then(user => {
                    res.json({ "data": user })
                })
                .catch(err => {
                    res.json({ "error": "Error updating password for owner" })
                })
        }


    })

    app.get(`/${api}/all/:company_id`, verifyToken, needsAdmin, verifyUserFromCompanyByCompanyID, (req, res) => {
        const { company_id } = req.params
        const { user } = req
        // TODO() Allow HACKER ROLE to access
        db.getAccounts(company_id, (err, result) => {
            if (!err) {
                res.json({ "data": result.rows })
            } else {
                res.json({ "error": err })
            }
        })
    })

    app.post(`/${api}/delete`, verifyToken, verifyUserFromCompanyByCompanyID, needsSelfOrAdmin, (req, res) => {
        const { pk, company_id } = req.body
        const { user } = req
        db.rmAccount(pk, (dbErr, result) => {
            console.log("Done deleteing")
            if (!dbErr) {
                console.log(result.rows)
                console.log("No dbErr")
                const data = result.rows.length > 0 ? result.rows[0] : {}
                res.json({ 'data': data })
            } else {
                console.log(dbErr)
                res.json({ "error": dbErr })
            }
        })
    })





}