const crypto = require("crypto");
const db = require('../db/accounts/accounts')
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { verifyToken, needsHacker, needsAdmin, needsSelfOrAdmin, getCompanySecret, verifyRefreshToken, verifyUserFromCompanyByCompanyID } = require("../utils/middleware")
const api = 'accounts'
const { JWT_SECRET_KEY, JWT_OPTIONS, BCRYPT_SALT_ROUNDS } = require("../specific");
const { ROLES } = require('../constants')
const { encrypt, decrypt } = require('../utils/crypt')

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

const accessOptions = {
    expiresIn: '10h'
}

const refreshOptions = {
    expiresIn: '10h'
}

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

        jwt.sign({ user: payload }, company_secret, accessOptions, (err, token) => {
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
        jwt.sign({ user: payload }, company_secret, refreshOptions, (err, token) => {
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

                            // TODO() Create Access token, Refresh token
                            // Create endpoint /accessToken to generate new access tokens
                            //  verifyToken Middleware to attempt to get new AccessToken based on RefreshToken if TokenExpired Error
                            generateLoginTokens(user)
                                .then(result => {
                                    const { refreshToken, accessToken } = result
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
                            console.log("Found sum data: ", result.rows)
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


    // Register ROLES.HACKER TODO() lock this route down somehow.... maybe password protected....
    app.post(`/${api}/registerAdmin`, (req, res) => {
        const { email, password, SECRET } = req.body
        const _SECRET = "1337mostdope#@!123(*)89098&^%%^65blud"
        // const _SECRET =  `d82de250-c4a1-4a1c-86d4-667242ed652247a28da4-9216-46dd-8a92-b9c923779849b3ed06f7-ef55-49b1-929b-142c594aee06bddcb758-1a27-406a-8275-444c5b41e16f9391848b-7bd1-41ab-b103-ea673513308a057c6897-689f-433f-9805-0920116d7983245c2197-4460-4089-86ad-37d4c29f32252c7cad82-9c38-4257-8fd8-440bb3408764d1da3c03-3cf7-4c7b-9b4e-1333ad426cb00d831121-04be-4c39-ba0c-5c5554165dc67ab0574a-27ed-4440-9b1f-3175f5e9eedde96b40bf-cbd3-4b79-98c9-6f16ebc0c9849e12f143-b2b1-41be-83da-22ab54eb11a314584881-3775-446c-87cb-e3e8e0ff087749fe5d64-cd81-45e3-b1ad-ee8206e881d6c8e5903a-290a-421c-911b-63ffcd699108e46354f0-98a8-4d43-8fec-3296d05e7674a4e402d6-d51c-40e1-86e2-b7edadd39e27eca54950-1aad-4fd5-808d-2bdb4b1a2b2644061078-8078-4439-b936-11782ea4e05e97ab7295-8cee-4934-8980-1609017a51b9f5b5dec2-d98e-4674-90bd-6cdf06041a10e89d7506-088b-4b38-844a-c2fd4e7bd2a90c5fab8e-cc6d-4bf4-a004-7ad0c37b80981be24ec4-a789-47a6-b33f-8d726b35eb00f7930c2a-ab69-4ee7-92f7-18f584dd026ec8c1cfcc-048f-4f15-bc6e-c3ce998b3de379ecbb38-4290-44e7-b3ce-eccae32592a54239af36-7099-445c-8367-04cb87c0b59af3083e82-d48e-4607-a9c0-adef937368b0c8eb82eb-bbf1-4c10-9a0d-2aef289a6f3b8113e683-b55f-495f-a49b-26941b7a8c8b65aa2e3e-dc33-4b4b-89e4-a3ba55b8c77e1bbf5609-580c-4555-9e9a-bc11a71d8dffd48e2bab-c56f-41a7-a008-c6ca7f2e6af288aeffa9-54b3-4589-9c82-8ae3f3187578cbc24a04-e30d-4528-a199-eaf8a3a3c57efc5e640f-17d0-4f9f-aaab-8960dd4e3b13216c240e-df58-442f-97b0-2f949831ae813c67c204-e422-4073-9a74-c805f7522596`
        console.log("TODO() Secret is exposed, add to variable from environment: ", SECRET)

        if (SECRET !== _SECRET) {
            console.log("Denied Secret")
            return res.json({ error: "Permission denied" })
        }

        bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function (err, hash) {
            if (!err) {
                console.log("Inserting Admin Account")
                db.insertAdminAccount(email, hash, (dbErr, result) => {
                    console.log("After insert")
                    if (!dbErr) {
                        const user = result && result.rows.length > 0 ? result.rows[0] : {}
                        jwt.sign({ user }, JWT_SECRET_KEY, JWT_OPTIONS, (err, token) => {
                            res.json({ "data": { token, user } })
                        })

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
    app.post(`/${api}/update`, verifyToken, needsSelfOrAdmin, (req, res) => {
        const { username, email, account_type, company_id, pk } = req.body.user // Updating user
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