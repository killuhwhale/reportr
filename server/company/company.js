const { verifyToken, needsHacker } = require("../utils/middleware")
const db = require('../db/company/company')
const { encrypt } = require('../utils/crypt')

const api = 'company'

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

module.exports = (app) => {
    // Companies HACKER use only
    app.get(`/${api}`, verifyToken, needsHacker, (req, res) => {
        db.getCompanies(null,
            (err, result) => {
                if (!err) {
                    res.json(result.rows)
                    return;
                }
                res.json({ "error": "Get comapnies unsuccessful", err: err });
            })
    });
    app.get(`/${api}/:pk`, verifyToken, needsHacker, (req, res) => {
        const pk = req.params.pk
        db.getCompany(pk,
            (err, result) => {
                if (!err) {
                    if (result.rows[0])
                        return res.json(result.rows[0])
                    return res.json({ error: `Company not found w/ pk: ${pk}` })
                }
                res.json({ "error": "Get company unsuccessful", err: err });
            })
    });

    app.post(`/${api}/create`, verifyToken, needsHacker, (req, res) => {
        console.log("Creating company...")
        const {
            title
        } = req.body
        const secret = genRandomChars(42)
        console.log("Company secret: ", secret)
        const eSecret = encrypt(secret)

        console.log("Created company w/ secret", secret, eSecret)

        db.insertCompany([title, eSecret], (err, result) => {
            if (!err) {
                console.log('Inserting Company', title)
                if (result.rows.length > 0) {
                    return res.json({ "data": result.rows[0] });
                } else {
                    console.log(result)
                    return res.json({ "error": 'Inserting returned no rows' });
                }
            }
            console.log(err)
            res.json({ "error": "Inserted company unsuccessful", code: err.code });
        })

    });
    app.post(`/${api}/update`, verifyToken, needsHacker, (req, res) => {
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
    app.post(`/${api}/delete`, verifyToken, needsHacker, (req, res) => {
        db.rmCompany(req.body.pk, (err, result) => {
            if (!err) {
                return res.json({ 'res': "Deleted company successfully" });
            }
            console.log(err)
            res.json({ "error": "Deleted company unsuccessful" });
        })
    });

}
