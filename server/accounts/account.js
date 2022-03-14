const db = require('../db/accounts/accounts')
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const api = 'accounts'
const { WHITE_LIST, JWT_SECRET_KEY, JWT_OPTIONS, BCRYPT_SALT_ROUNDS } = require("../specific")


const verifyToken = (req, res, next) => {
    const bearerToken = req.headers['authorization']
    if (bearerToken) {
        const token = bearerToken.split(" ")[1]
        req.token = token
        next()
    } else {
        res.sendStatus(403)
    }

}

module.exports = (app) => {
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
                            res.json({ "error": { msg: "Passowrd compare error", code: 'auth/compare-error' } })
                            return
                        }
                        if (valid) {
                            delete user['password']

                            jwt.sign({ user }, JWT_SECRET_KEY, JWT_OPTIONS, (err, token) => {
                                if (!err) {
                                    res.json({ "data": { token, user } })
                                } else {
                                    res.json({ "error": { msg: "Invalid password", code: 'auth/token-error' } })
                                }

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
    app.post(`/${api}/create`, verifyToken, (req, res) => {

        jwt.verify(req.token, JWT_SECRET_KEY, (err, decoded) => {
            if (!err) {
                const { user } = decoded
                // Check that this request is by a company admin account, and the user company_id is same as the id in the request
                if (user && user.account_type === 2) {
                    const { new_user } = req.body
                    const { email, password, username, company_id } = new_user
                    if (company_id !== user.company_id) {
                        return res.json({ error: 'Cannot create Account for another company.' })
                    }

                    bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function (err, hash) {
                        db.insertAccount(email, hash, username, (err, result) => {
                            if (!err) {
                                res.json({ "data": result.rows })
                            } else {
                                res.json({ "error": err })
                            }
                        })
                    });
                } else {
                    res.json({ "error": 'Permission denied' })
                }
            } else {
                res.json({ "error": err })
            }
        })

    })



    // This will be for the dashboard only 
    app.post(`/${api}/register`, verifyToken, (req, res) => {
        const { email, password, company_id } = req.body
        jwt.verify(req.token, JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.json({ error: err })
            }

            const { user } = decoded
            if (user.account_type !== 3) {
                return res.json({ error: 'Permission denied.' })
            }

            bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function (err, hash) {
                if (!err) {
                    db.insertOwnerAccount(email, hash, company_id, (dbErr, result) => {
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
    })

    app.post(`/${api}/registerAdmin`, (req, res) => {
        const { email, password, SECRET } = req.body
        if (SECRET !== "1337mostdope#@!123(*)89098&^%%^65blud") {
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
        const { token } = req
        jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
            if (!err) {
                const { user } = decoded
                db.getAccount(user.pk, (dbErr, result) => {
                    if (!dbErr) {
                        const data = result.rows.length > 0 ? result.rows[0] : {}
                        res.json({ 'data': data })
                    } else {
                        res.json({ "error": dbErr })
                    }
                })

            } else {
                res.json({ "error": err })
            }
        })


    })

    // Update account information
    app.post(`/${api}/update`, verifyToken, (req, res) => {
        const { token } = req
        const updatedUserInfo = req.body.user
        console.log("Update ", updatedUserInfo)
        jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
            if (!err) {
                const { user } = decoded
                console.log("Token user", user)
                // If owner or user is updating their own username
                if (updatedUserInfo.pk === user.pk || (user.account_type === 2 && user.company_id === updatedUserInfo.company_id)) {
                    const { username, email, pk } = updatedUserInfo
                    db.updateAccount([username, email, pk], (dbErr, result) => {
                        console.log("Done inserting")
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
                }

            } else {
                res.json({ "error": err })
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


        jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
            if (!err) {
                const { user: userToken } = decoded // Current signed in user

                // IF user is updating password, require the currentPassword
                if (pk === userToken.pk) {
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
                } else if ((userToken.account_type === 2 && userToken.company_id === company_id) || userToken.account_type === 3) {
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

            } else {
                res.json({ "error": err })
            }
        })


    })


    app.get(`/${api}/all/:company_id`, verifyToken, (req, res) => {
        // Check authN first
        const token = req.token
        const { company_id } = req.params

        jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
            if (!err) {
                const { user } = decoded
                console.log(user)
                if ((user.account_type === 2 && user.company_id === company_id) || user.account_type === 3) {
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
            } else {
                res.json({ "error": 'Invalid Token' })
            }

        })
    })

    app.post(`/${api}/delete`, verifyToken, (req, res) => {
        const { token } = req
        const { pk, company_id } = req.body
        console.log("pk ", pk)

        jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
            if (!err) {
                const { user } = decoded
                console.log("Token user", user)
                // If owner or user is updating their own username
                if (pk === user.pk || (user.account_type === 2 && user.company_id === company_id)) {

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
                }

            } else {
                res.json({ "error": err })
            }
        })


    })
}