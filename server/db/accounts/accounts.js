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
            "SELECT username, email, account_type FROM accounts",
            [],
            callback
        )
    },
    getAccount: (account_id, callback) => {
        return pool.query(
            "SELECT * FROM accounts where pk = $1",
            [account_id],
            callback
        )
    },
    insertAccount: (email, password, callback) => {
        return pool.query(
            "INSERT INTO accounts(email, password) VALUES ($1, $2)",
            [email, password],
            callback
        )
    },
    insertOwnerAccount: (email, password, callback) => {
        return pool.query(
            "INSERT INTO accounts(email, password, account_type) VALUES ($1, $2, $3)",
            [email, password, 0],
            callback
        )
    },
    updateAccount: (values, callback) => {

        return pool.query(`UPDATE accounts SET
        username = $1,
        email = $2
        WHERE pk=$3 RETURNING *`,
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