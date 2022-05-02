const { verifyToken, needsHacker, needsRead } = require("../utils/middleware")
const { getTSVs } = require('../db/index')
const { generateAnnualReportPDF } = require('../pdf/annualReportPDF')
const { SHEET_NAMES } = require('../tsv/serverTsv')
const { TSVToPDF } = require('./tsvToPDF')
const AdmZip = require("adm-zip");

const api = 'files'

module.exports = (app) => {

    app.get(`/${api}/dairyFileSummary/:title/:dairy_id`, verifyToken, needsRead, async (req, res) => {
        const { title, dairy_id } = req.params
        const { company_id } = req.user
        try {
            const zip = new AdmZip()
            // AR PDF
            const promises = [zipAnnualReport(zip, dairy_id, req.user.company_id)]
            // const promises = [] // Testing purposes: skip dairy

            // TSV PDFs
            const ttp = new TSVToPDF(title, company_id)

            for (let tsvType of SHEET_NAMES) {
                console.log("Generating tsv:", tsvType)
                promises.push(zipTsv(zip, ttp, dairy_id, tsvType))
            }

            // Once PDFs are done wirting to zip file
            const promiseRes = await Promise.all(promises)

            // Send zip file buffer to client
            const zipFile = zip.toBuffer()
            console.log("SENT!!!!!!!")
            console.log(zipFile.byteLength)
            return res.end(zipFile, 'binary')

        } catch (e) {
            console.log('Error dairyFileSummary: ', e)
            return res.json({ error: "Get all TSVs unsuccessful", err: e })
        }
    });
}



const zipAnnualReport = async (zip, dairy_id, company_id) => {
    const pdf = await generateAnnualReportPDF(dairy_id, company_id, true)
    if (pdf.error) throw pdf.error

    zip.addFile('AnnualReport.pdf', pdf)
    return { success: 'AR PDF zipped' }
}


const zipTsv = async (zip, ttp, dairy_id, tsvType) => {
    try {
        const tsvRes = await getTSVs(dairy_id, tsvType) // TSV text from DB
        if (tsvRes.error) throw (tsvRes.error)
        if (!tsvRes[0]) throw (`No TSV found for:  ${tsvType}`)

        ttp.setTSV(tsvRes[0], tsvType)  // Set TSV data and type
        await ttp.createDD()            // Create Doc definition
        await ttp.createPDF()           // Create PDF

        zip.addFile(`${tsvType}.pdf`, ttp.buffer)
        return { success: `${tsvType} zipped!` }
    } catch (e) {
        console.log('Error', e)
        return { error: e }
    }
}


