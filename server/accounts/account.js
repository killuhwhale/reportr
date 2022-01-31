
const db = require('../db/accounts/accounts')
var crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require("jsonwebtoken")


const api = 'accounts'
const SECRET_KEY = '133742069'
const WHITE_LIST = ['testUser@g.com'].map(email => email.toLocaleLowerCase())

const verfiyToken = (req, res, next) => {
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
                const user = rows[0]
                const hash = user.password
                if (user && hash) {
                    bcrypt.compare(password, hash, function (err, valid) {
                        if (valid) {
                            delete user['password']

                            jwt.sign({ user }, SECRET_KEY, (err, token) => {
                                res.json({ "data": token })
                            })

                        } else {
                            res.json({ "error": "Invalid password" })
                        }
                    });
                } else {
                    res.json({ "error": "Error loggin in." })
                }
            } else {
                res.json({ "error": err })
            }
        })
    })


    app.post(`/${api}/create`, verfiyToken, (req, res) => {

        jwt.verify(req.token, SECRET_KEY, (err, decoded) => {
            if (!err) {
                const { user } = decoded
                if (user && user.account_type < 1) {
                    const { email, password } = req.body
                    bcrypt.hash(password, saltRounds, function (err, hash) {
                        db.insertAccount(email, hash, (err, result) => {
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
                db.insertOwnerAccount(email, hash, (err, result) => {
                    if (!err) {
                        res.json({ "data": result.rows })
                    } else {
                        res.json({ "error": err })
                    }
                })
            });

        } else {
            res.json({ "error": "Email not on the white list" })
        }

    })


    app.get(`/${api}/all`, verfiyToken, (req, res) => {
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
}