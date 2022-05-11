const format = require('pg-format');
const { pool } = require('../index')


module.exports = {
    getCompanies: (_, callback) => {
        return pool.query(
            "SELECT title, pk FROM companies",
            [],
            callback
        )
    },

    getCompany: (company_id, callback) => {
        return pool.query(
            "SELECT title, pk FROM companies where pk=$1",
            [company_id],
            callback
        )
    },
    getCompanySecret: (company_id, callback) => {
        return pool.query(
            "SELECT company_secret FROM companies where pk=$1",
            [company_id],
            callback
        )
    },
    insertCompany: (values, callback) => {
        return pool.query(
            format("INSERT INTO companies(title, company_secret) VALUES (%L) RETURNING *", values),
            [],
            callback
        )
    },
    updateCompany: (values, callback) => {
        return pool.query(`UPDATE companies SET
        title = $1
        WHERE pk=$2 RETURNING *`,
            values,
            callback
        )
    },
    rmCompany: (id, callback) => {
        return pool.query(
            format("DELETE FROM companies where pk = %L", id),
            [],
            callback
        )
    },



}