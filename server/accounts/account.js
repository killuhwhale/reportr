const crypto = require("crypto");
const db = require('../db/accounts/accounts')
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { verifyToken, needsHacker, needsAdmin, needsSelfOrAdmin, getCompanySecret, verifyRefreshToken } = require("../utils/middleware")
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
    app.post(`/${api}/create`, verifyToken, needsAdmin, (req, res) => {
        const { user } = req
        const { user: { email, password, username, account_type, company_id } } = req.body

        if (account_type >= ROLES.HACKER) {
            return res.json({ error: `Cannot create user with account type: ${account_type}` })
        }

        // Check that this request is by a company admin account, and the user company_id is same as the id in the request
        if (user && user.account_type === ROLES.ADMIN) {
            if (company_id !== user.company_id) {
                return res.json({ error: 'Cannot create Account for another company.' })
            }

            bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function (err, hash) {
                db.insertAccount(email, hash, username, account_type, company_id, (err, result) => {
                    if (!err) {
                        res.json({ "data": result.rows })
                    } else {
                        res.json({ "error": err })
                    }
                })
            });
        } else {
            res.json({ "error": "Must be an Admin to add account." })
        }

    })

    // This will be for the dashboard only 
    app.post(`/${api}/register`, verifyToken, needsHacker, (req, res) => {
        const { email, password, company_id } = req.body
        const { user } = req
        if (user.account_type !== ROLES.HACKER) {
            return res.json({ error: 'Permission denied.' })
        }

        bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function (err, hash) {
            if (!err) {
                db.insertOwnerAccount(email, hash, company_id, (dbErr, result) => {
                    if (!dbErr) {
                        res.json({ data: { user } })


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


    // Register ROLES.HACKER
    app.post(`/${api}/registerAdmin`, (req, res) => {
        const { email, password, SECRET } = req.body
        const _SECRET = "1337mostdope#@!123(*)89098&^%%^65blud"
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

        // TODO Lookup user by pk and check their account_type 
        //   - check if current_account type is less than ROLES.ADMIN (should not alter ADMIN or HACKER roles)

        let new_account_type = user.account_type // init value is the current account_type or old account_type
        // If requesting user is updating their own information do not allow to change account level
        if (pk !== user.pk) {
            new_account_type = account_type  // new account 
        }

        const values = [username, email, new_account_type, pk]
        db.updateAccount(values, (dbErr, result) => {
            if (!dbErr) {
                const data = result.rows.length > 0 ? result.rows[0] : {}
                res.json({ 'data': data })
            } else {
                console.log(dbErr)
                res.json({ "error": dbErr })
            }
        })
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

    app.post(`/${api}/changePassword`, verifyToken, (req, res) => {
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
        } else if ((user.account_type === ROLES.ADMIN && user.company_id === company_id) || user.account_type === ROLES.HACKER) {
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

    app.get(`/${api}/all/:company_id`, verifyToken, (req, res) => {
        const { company_id } = req.params
        const { user } = req
        console.log(`Acct type: ${user.account_type} user_comp_id: ${user.company_id} company_id: ${company_id} `)
        if (parseInt(user.account_type) === ROLES.ADMIN && parseInt(user.company_id) === parseInt(company_id) || user.account_type === ROLES.HACKER) {
            db.getAccounts(company_id, (err, result) => {
                if (!err) {
                    res.json({ "data": result.rows })
                } else {
                    res.json({ "error": err })
                }
            })
        } else {
            res.json({ "error": `Permission denied: all accounts for company id (${company_id}).` })
        }

    })

    app.post(`/${api}/delete`, verifyToken, (req, res) => {
        const { pk, company_id } = req.body
        const { user } = req

        if (pk === user.pk || (user.account_type === ROLES.ADMIN && user.company_id === parseInt(company_id))) {

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
        } else {
            res.json({ "error": 'Permission denied: Cannot delete user.' })
        }
    })

    const genRandomChars = (len) => {
        const allCapsAlpha = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
        const allLowerAlpha = [..."abcdefghijklmnopqrstuvwxyz"];
        const allUniqueChars = [...`~!@#$%^&*()_+-=[]\{}|;:'",./<>?`];
        const allNumbers = [..."0123456789"];
        const base = [...allCapsAlpha, ...allNumbers, ...allLowerAlpha, ...allUniqueChars];
        return [...Array(len)]
            .map(i => base[Math.random() * base.length | 0])
            .join('');
    };

    app.get(`/${api}/companies`, verifyToken, needsHacker, (req, res) => {
        db.getCompanies(null,
            (err, result) => {
                if (!err) {
                    res.json(result.rows)
                    return;
                }
                res.json({ "error": "Get comapnies unsuccessful", err: err });
            })
    });
    app.get(`/${api}/companies/:pk`, verifyToken, needsHacker, (req, res) => {
        db.getCompany(req.params.pk,
            (err, result) => {
                if (!err) {
                    res.json(result.rows)
                    return;
                }
                res.json({ "error": "Get company unsuccessful", err: err });
            })
    });

    app.post(`/${api}/companies/create`, verifyToken, needsHacker, (req, res) => {
        const {
            title
        } = req.body
        const secret = genRandomChars(42)
        const eSecret = encrypt(secret)

        console.log("Created company w/ secret", secret, eSecret)

        db.insertCompany([title, eSecret], (err, result) => {
            if (!err) {
                return res.json({ "data": "Inserted company successfully" });
            }
            console.log(err)
            res.json({ "error": "Inserted company unsuccessful", code: err.code });
        })

    });
    app.post(`/${api}/companies/update`, verifyToken, needsHacker, (req, res) => {
        const {
            title, pk
        } = req.body

        db.updateCompany([
            title, pk
        ], (err, result) => {

            if (!err) {
                res.json(result);
                return;
            }
            console.log(err)
            res.json({ "error": "Updated company unsuccessful" });
        })
    });
    app.post(`/${api}/companies/delete`, verifyToken, needsHacker, (req, res) => {
        db.rmCompany(req.body.pk, (err, result) => {

            if (!err) {
                res.json({ "error": "Deleted company successfully" });
                return;
            }
            console.log(err)
            res.json({ "error": "Deleted company unsuccessful" });
        })
    });
}