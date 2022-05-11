const format = require('pg-format');
const { ROLES } = require('../../constants')
const { pool } = require('../index')


module.exports = {

    login: (email, callback) => {
        return pool.query(
            "SELECT * FROM accounts where email = $1",
            [email],
            callback
        )
    },

    getAccounts: (company_id, callback) => {
        return pool.query(
            "SELECT pk, username, email, account_type, company_id FROM accounts where company_id=$1",
            [company_id],
            callback
        )
    },
    getAccount: (account_id, callback) => {
        return pool.query(
            "SELECT pk, username, email, account_type, company_id FROM accounts where pk = $1 LIMIT 1",
            [account_id],
            callback
        )
    },
    getAccountWithPassword: (account_id, callback) => {
        return pool.query(
            "SELECT pk, username, email, account_type, company_id, password FROM accounts where pk = $1 LIMIT 1",
            [account_id],
            callback
        )
    },
    insertAccount: (email, password, username, account_type, company_id, callback) => {
        return pool.query(
            "INSERT INTO accounts(email, password, username, account_type, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING pk, username, email, account_type, company_id",
            [email, password, username, account_type, company_id],
            callback
        )
    },
    insertOwnerAccount: (email, password, company_id, callback) => {
        return pool.query(
            "INSERT INTO accounts(email, password, account_type, company_id) VALUES ($1, $2, $3, $4) RETURNING pk, username, email, account_type, company_id",
            [email, password, ROLES.ADMIN, company_id],
            callback
        )
    },
    insertAdminAccount: (email, password, callback) => {
        return pool.query(
            "INSERT INTO accounts(email, password, account_type, company_id) VALUES ($1, $2, $3, $4) RETURNING pk, username, email, account_type, company_id",
            [email, password, ROLES.HACKER, 1],
            callback
        )
    },
    updateAccount: (values, callback) => {

        return pool.query(`UPDATE accounts SET
        username = $1, email = $2, account_type = $3
        WHERE pk=$4 RETURNING pk, username, email, account_type`,
            values,
            callback
        )
    },
    updateAccountForUser: (values, callback) => {

        return pool.query(`UPDATE accounts SET
        username = $1, email = $2
        WHERE pk=$3 RETURNING pk, username, email, account_type`,
            values,
            callback
        )
    },
    changePassword: (values, callback) => {

        return pool.query(`UPDATE accounts SET
        password = $1
        WHERE pk=$2 RETURNING pk, username, email, account_type`,
            values,
            callback
        )
    },
    rmAccount: (id, callback) => {
        return pool.query(
            "DELETE FROM accounts where pk = $1",
            [id],
            callback
        )
    },

}