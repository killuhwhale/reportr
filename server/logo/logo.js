
const { verifyToken, needsRead, verifyUserFromCompanyByCompanyID, needsDelete } = require('../utils/middleware');
const { Spaces } = require('../spaces/spaces')
const api = 'logo'








module.exports = (app) => {
    app.get(`/${api}/:company_id`, verifyToken, verifyUserFromCompanyByCompanyID, needsDelete, async (req, res) => {
        const logo = await Spaces.getCompanyLogo(req.company_id)
        if (logo.error) return res.json(logo)

        return res.json({ url: logo })
    })

    app.post(`/${api}/upload`, verifyToken, verifyUserFromCompanyByCompanyID, needsRead, async (req, res) => {
        console.log("Upload request: ", req.body, req.files.file, req.body.company_id, req.body.filetype)

        const spaces = await Spaces.uploadFile(req.company_id, req.files.file.data.buffer)
        console.log("Spaces res: ", spaces)

        return res.json({ msg: `Uploading file for company ${req.body.company_id}` })
    })

    app.post(`/${api}/delete`, verifyToken, verifyUserFromCompanyByCompanyID, needsRead, async (req, res) => {
        return res.json({ msg: `Deleting file for company ${req.body.company_id}` })
    })

}