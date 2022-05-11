/** Orchestrates Annual Report PDF File
 * 
 * 1. Get Annual Report Data
 * 2. use pdfCharts.js to generated images
 * 3. Send images and AR Data to pdfDD.js to format document
 * 4. Create pdf with DD
 *  
 */
const PdfPrinter = require('pdfmake');
var fs = require('fs');
const { verifyToken, verifyUserFromCompanyByDairyID, needsRead } = require('../utils/middleware');
const { Spaces } = require('../spaces/spaces')
const { annualReportData } = require('./annualReportData')
const { ChartGenerater } = require('./pdfCharts')
const { docDef } = require('./pdfDD');
const { NO_LOGO } = require('../constants');
const api = 'annualReportPDF'
const fonts = {
    Roboto: {
        normal: 'fonts/Roboto/Roboto-Regular.ttf',
        bold: 'fonts/Roboto/Roboto-Bold.ttf',
        italics: 'fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'fonts/Roboto/Roboto-BoldItalic.ttf'
    }
}
const printer = new PdfPrinter(fonts);

const getms = () => {
    return new Date().getTime()
}

const msdif = (start) => {
    console.log(`Took: ${(new Date().getTime() - start) / 1000}sec`)
}

// Generate and return raw file
const generateAnnualReportPDF = async (dairy_id, company_id, asBufferArray = false) => {
    let perfStart = getms()
    // 1. Get Annual Report Data
    console.log("Getting AR Data.")
    const arData = await annualReportData(dairy_id)
    if (arData.error) return res.json(arData.error)
    msdif(perfStart)
    perfStart = getms()

    // 2. use pdfCharts.js to generated images
    console.log("Generating charts....")
    const nutrientBudgetB = arData.nutrientBudgetB.allEvents
    const summary = arData.naprbalA
    ChartGenerater.setData(nutrientBudgetB, summary)
    const images = await ChartGenerater.generateCharts()
    msdif(perfStart)
    perfStart = getms()

    console.log("Getting company logo")
    let logo = await Spaces.getCompanyLogo(company_id, true)

    if (logo.error) {
        console.log(logo.error)
        logo = NO_LOGO
    }

    msdif(perfStart)
    perfStart = getms()

    console.log("Generating AR DocDef")
    // 3. Send images and AR Data to pdfDD.js to format document
    const docDefinition = docDef(arData, images, logo)
    msdif(perfStart)
    perfStart = getms()

    console.log("Generating PDF!")
    // 4. Create pdf with DD
    let pdfDoc = printer.createPdfKitDocument(docDefinition);
    msdif(perfStart)
    perfStart = getms()

    if (asBufferArray) {
        let chunks = [];
        return await new Promise((resolve, reject) => {
            pdfDoc.on('data', (chunk) => {
                chunks.push(chunk)
            });

            pdfDoc.on('end', () => {
                console.log("Done buffering")
                resolve(Buffer.concat(chunks))
            })
            pdfDoc.on('error', (err) => {
                console.log("On error", err)
            })
            pdfDoc.end()
        })
    } else {
        return pdfDoc
    }
}

module.exports = (app) => {
    // Returns PDF
    app.get(`/${api}/dairy/:dairy_id`, verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        const dairy_id = req.params.dairy_id
        try {

            // Check cache....
            const pdf = await generateAnnualReportPDF(dairy_id, req.user.company_id, true)
            if (pdf.error) return res.status(500).send(pdf.error)
            res.send(pdf)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Error generating annual report data...")
        }
    })
}

module.exports.generateAnnualReportPDF = generateAnnualReportPDF