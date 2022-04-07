const jwt = require("jsonwebtoken");
const companyDB = require('../db/company/company')
const { getCompanyIDByDairyID, getCompanyIDByDairyBaseID } = require("../db");
const { ROLES } = require("../constants");
const { decrypt } = require('./crypt')


const getCompanySecret = (company_id) => {
    return new Promise((resolve, reject) => {
        companyDB.getCompanySecret(company_id, (err, result) => {
            if (!err) {
                if (result && result.rows && result.rows[0]) {
                    const secret = result.rows[0].company_secret
                    const dSecret = decrypt(secret)
                    resolve({ secret: dSecret })

                } else {
                    resolve({ error: `Secret not found for company_id: ${company_id}` })
                }
            } else {
                console.log("getCompanySecret Error: ", err)
                resolve({ error: err })
            }
        })
    })
}
exports.getCompanySecret = getCompanySecret

const decodeToken = (token, company_id) => {
    console.log("Decoding token for company id: ", company_id)
    return new Promise(async (res, rej) => {
        const secretRes = await getCompanySecret(company_id)
        if (secretRes.error) return rej({ error: `Failed to decode token: ${secretRes.error}` })
        const dSecret = secretRes.secret

        jwt.verify(token, dSecret, (err, decoded) => {
            if (!err) {
                const { user } = decoded
                return res({ user })
            } else if (err.name === 'TokenExpiredError') {
                return rej({ error: `Expired token: ${err.message}`, code: 'Expired' })
            }
            return rej({ error: `Failed to decode token: ${err}` })
        })

    })
}

exports.verifyRefreshToken = async (req, res, next) => {

    const bearerToken = req.headers['authorization']
    const companyID = req.headers['authorization-companyid']
    console.log("Verifying refresh token: ", bearerToken)

    if (bearerToken && companyID) {
        try {
            const token = bearerToken.split(" ")[1]
            const company_id = companyID.split(" ")[1]
            req.refreshToken = token
            req.company_id = company_id
            console.log("Verifying refresh token: ", token)
            const result = await decodeToken(token, company_id)
            console.log("Verifying refresh token decode result: ", result)
            if (result.error) {
                return res.json({ error: `Permission denied: ${result.error}` })
            }

            req.user = result.user
            return next()
        } catch (e) {
            console.log('err: refreshToken ', e)
        }
    }
    res.sendStatus(403)

}

const _getCompanyIDByDairyBaseID = (dairyBaseID) => {
    return new Promise((resolve, reject) => {
        getCompanyIDByDairyBaseID(dairyBaseID, (err, result) => {
            if (!err) {
                console.log(result.rows)
                if (result && result.rows.length > 0) {
                    return resolve(result.rows[0].company_id)
                }
                console.log(result.rows)
                return reject(`Error w/ result`)
            }
            reject(`Error, ${err.message}`)
        })
    })
}

exports.verifyUserFromCompanyByDairyBaseID = async (req, res, next) => {
    const { user: { company_id } } = req
    const dairyBaseID = req.params.dairyBaseID || req.body.dairyBaseID || null

    if (!dairyBaseID) return res.status(403).json({ error: `dairyBaseID not found.` })
    if (!company_id) return res.status(403).json({ error: `User's comapny_id not found.` })

    // Get company id from baseDairy
    // Write SQL: select company_id from dairy_base where pk=;
    const companyIDByDairyBaseID = await _getCompanyIDByDairyBaseID(dairyBaseID)
    if (parseInt(companyIDByDairyBaseID) === parseInt(company_id)) return next()

    return res.status(403).json({ error: 'User not a part of company via dairy base ID.' })
}


// Verifies token and adds user to request obj
exports.verifyToken = async (req, res, next) => {
    const bearerToken = req.headers['authorization']
    const companyID = req.headers['authorization-companyid']
    if (bearerToken && companyID) {
        try {
            const token = bearerToken.split(" ")[1]
            const company_id = companyID.split(" ")[1]
            req.token = token
            req.company_id = company_id
            const result = await decodeToken(token, company_id)

            if (result.error) {
                return res.json({ error: `Permission denied: ${result.error}` })
            }

            req.user = result.user
            return next()
        } catch (e) {
            if (e.code === 'Expired') {
                console.log("Token Expired.....")
                return res.status(403).json({ error: `Expired` })
            }
        }
    }
    res.status(403).json({ error: `Permission denied` })

}

// Checks user is from same company as requested entity
exports.verifyUserFromCompanyByCompanyID = (req, res, next) => {
    const { user } = req
    const company_id = req.params.company_id || req.body.company_id || (req.body.userPassword || req.body.userPassword ? req.body.userPassword.company_id : null) || (req.body.user ? req.body.user.company_id : null) || null

    if (!company_id) {
        return res.status(403).json({ error: 'User not a part of company.' })
    }
    if (parseInt(user.company_id) === parseInt(company_id)) {
        return next()
    }

    return res.status(403).json({ error: 'User not a part of company.' })
}

// Checks user is from same company as requested entity by DairyID to lookup CompanyID
exports.verifyUserFromCompanyByDairyID = async (req, res, next) => {
    const { user: { company_id } } = req
    const dairy_id = req.params.dairy_id || req.body.dairy_id || (req.body.data ? req.body.data.dairy_id : null) || null

    console.log("verifyUserFromCompanyByDairyID::Looking up dairy with id: ", dairy_id)

    if (!dairy_id) {
        return res.status(403).json({ error: 'Permission denied: user not apart of company. No dairy id' })
    }

    getCompanyIDByDairyID(dairy_id, (dbErr, dbRes) => {
        if (dbErr) {
            console.log("dbErr", dbErr)
            return res.status(403).json({ error: 'Permission denied: user not apart of company, error' })
        }
        const rows = dbRes.rows
        if (rows[0]) {
            const { company_id: dairy_company_id } = rows[0]
            console.log("CorrectCompany Res: ", company_id, dairy_company_id)
            if (parseInt(company_id) === dairy_company_id) {
                console.log("Verified user is from company")
                return next()
            }
            return res.status(403).json({ error: 'Permission denied: user not apart of company.' })
        } else {
            console.log("No dbRes: ", dbRes)
            res.status(403).json({ error: 'Permission denied: user not apart of company, no results' })
        }
    })

}

// TODO Add a couple more verifyUserFromCompanyBy.... 
// - updates and deletes are by PK, so to do the lookups is a bit more complicated...


exports.needsRead = async (req, res, next) => {
    const { user } = req
    if (user && user.account_type >= ROLES.READ) { return next() }
    res.status(403).json({ error: 'You need permission: READ' })
}

// Role Based Permissions
exports.needsWrite = async (req, res, next) => {
    const { user } = req
    if (user && user.account_type >= ROLES.WRITE) { return next() }
    res.status(403).json({ error: 'You need permission: WRITE' })
}

exports.needsDelete = async (req, res, next) => {
    const { user } = req
    if (user && user.account_type >= ROLES.DELETE) { console.log('User can delete...'); return next() }
    res.status(403).json({ error: 'You need permission: DELETE' })
}

exports.needsAdmin = async (req, res, next) => {
    const { user } = req
    if (user && user.account_type >= ROLES.ADMIN) { return next() }
    res.status(403).json({ error: 'You need permission: ADMIN' })
}

exports.needsHacker = async (req, res, next) => {
    const { user } = req
    if (user && user.account_type >= ROLES.HACKER) { return next() }
    res.status(403).json({ error: 'You need permission: HACKER' })
}


exports.needsSelfOrAdmin = async (req, res, next) => {
    const { username, email, account_type, company_id, pk } = req.body.user
    const { user } = req

    if (user &&
        user.account_type >= ROLES.ADMIN ||
        parseInt(user.pk) === parseInt(pk)
    ) { return next() }
    res.status(403).json({ error: 'You need permission: ADMIN or Self' })
}