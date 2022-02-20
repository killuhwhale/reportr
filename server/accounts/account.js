
const db = require('../db/accounts/accounts')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require("jsonwebtoken");


const api = 'accounts'
const SECRET_KEY = '133742069'
const JWT_OPTIONS = {
    expiresIn: "10h"
}

const WHITE_LIST = ['t@g.com'].map(email => email.toLocaleLowerCase()) // White list of emails for owner accounts

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
        console.log("Logging in", email, password)
        db.login(email, (err, response) => {
            if (!err) {
                const { rows } = response
                const user = rows[0] ?? {}
                const hash = user.password
                if (user && hash) {
                    bcrypt.compare(password, hash, function (err, valid) {
                        console.log(err, email, password, hash, valid)
                        if (err) {
                            res.json({ "error": { msg: "Passowrd compare error", code: 'auth/compare-error' } })
                            return
                        }
                        if (valid) {
                            delete user['password']

                            jwt.sign({ user }, SECRET_KEY, JWT_OPTIONS, (err, token) => {
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


    app.post(`/${api}/create`, verifyToken, (req, res) => {

        jwt.verify(req.token, SECRET_KEY, (err, decoded) => {
            if (!err) {
                const { user } = decoded
                if (user && user.account_type < 1) {
                    const { user } = req.body
                    const { email, password, username } = user

                    bcrypt.hash(password, saltRounds, function (err, hash) {
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

    app.post(`/${api}/register`, (req, res) => {
        const { email, password } = req.body

        if (WHITE_LIST.indexOf(email.toLocaleLowerCase()) >= 0) {
            bcrypt.hash(password, saltRounds, function (err, hash) {
                if (!err) {
                    db.insertOwnerAccount(email, hash, (dbErr, result) => {
                        if (!dbErr) {
                            const user = result && result.rows.length > 0 ? result.rows[0] : {}
                            jwt.sign({ user }, SECRET_KEY, JWT_OPTIONS, (err, token) => {
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

        } else {
            res.json({ "error": "Email not on the white list" })
        }

    })

    app.post(`/${api}/currentUser`, verifyToken, (req, res) => {
        const { token } = req
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (!err) {
                const { user } = decoded
                db.getAccount(user.pk, (dbErr, result) => {
                    if (!dbErr) {
                        console.log(result.rows)
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


    app.post(`/${api}/update`, verifyToken, (req, res) => {
        const { token } = req
        const updatedUserInfo = req.body.user
        console.log("Update ", updatedUserInfo)
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (!err) {
                const { user } = decoded
                console.log("Token user", user)
                // If owner or user is updating their own username
                if (updatedUserInfo.pk === user.pk || user.account_type < 1) {
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
            bcrypt.hash(password, saltRounds, function (err, hash) {
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
            bcrypt.hash(password, saltRounds, function (err, hash) {
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
        const { currentPassword, newPassword, pk } = req.body.userPassword // account data to update password


        jwt.verify(token, SECRET_KEY, (err, decoded) => {
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
                } else if (userToken.account_type < 1) {
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


    app.get(`/${api}/all`, verifyToken, (req, res) => {
        // Check authN first
        const token = req.token
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (!err) {
                const { user } = decoded
                if (user.account_type < 1) {
                    db.getAccounts((err, result) => {
                        if (!err) {
                            res.json({ "data": result.rows })
                        } else {
                            res.json({ "error": err })
                        }
                    })
                } else {
                    res.json({ "error": 'Permission denied.' })
                }
            } else {
                res.json({ "error": 'Invalid Token' })
            }

        })
    })

    app.post(`/${api}/delete`, verifyToken, (req, res) => {
        const { token } = req
        const pk = req.body.pk
        console.log("pk ", pk)

        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (!err) {
                const { user } = decoded
                console.log("Token user", user)
                // If owner or user is updating their own username
                if (pk === user.pk || user.account_type < 1) {

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