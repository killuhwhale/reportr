const { pool } = require('../index')

module.exports = {

    login: (email, callback) => {
        return pool.query(
            "SELECT * FROM accounts where email = $1",
            [email],
            callback
        )
    },

    getAccounts: (callback) => {
        return pool.query(
            "SELECT pk, username, email, account_type FROM accounts",
            [],
            callback
        )
    },
    getAccount: (account_id, callback) => {
        return pool.query(
            "SELECT pk, username, email, account_type FROM accounts where pk = $1 LIMIT 1",
            [account_id],
            callback
        )
    },
    getAccountWithPassword: (account_id, callback) => {
        return pool.query(
            "SELECT pk, username, email, account_type, password FROM accounts where pk = $1 LIMIT 1",
            [account_id],
            callback
        )
    },
    insertAccount: (email, password, username, callback) => {
        return pool.query(
            "INSERT INTO accounts(email, password, username) VALUES ($1, $2, $3) RETURNING pk, username, email, account_type",
            [email, password, username],
            callback
        )
    },
    insertOwnerAccount: (email, password, callback) => {
        return pool.query(
            "INSERT INTO accounts(email, password, account_type) VALUES ($1, $2, $3) RETURNING pk, username, email, account_type",
            [email, password, 0],
            callback
        )
    },
    updateAccount: (values, callback) => {

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