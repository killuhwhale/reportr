const XLSX = require('xlsx')
const PdfPrinter = require('pdfmake');
const {
    createHeaderMap, HARVEST, PROCESS_WASTEWATER, FRESHWATER, SOLIDMANURE, FERTILIZER,
    SOIL, PLOWDOWN_CREDIT, DRAIN, DISCHARGE, MANURE, WASTEWATER
} = require('../tsv/serverTsv')
const { TSVDD } = require('./tsvDD.js')


const fonts = {
    Roboto: {
        normal: 'fonts/Roboto/Roboto-Regular.ttf',
        bold: 'fonts/Roboto/Roboto-Bold.ttf',
        italics: 'fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'fonts/Roboto/Roboto-BoldItalic.ttf'
    }
}
const printer = new PdfPrinter(fonts);

const TSV_PRINT_COLS = {
    [PROCESS_WASTEWATER]:
        [
            "Application Date",
            "Field",
            "Acres Planted",
            "Crop",
            "Sample Description",
            "N (mg/L)",
            "P (mg/L)",
            "K (mg/L)",
            "EC (umhos/cm)",
            "TDS (mg/L)",
            "Application Rate (GPM)",
            "Run Time (Hours)",
            "Total Gallons Applied",
            "Application Rate per acre (Gallons/ acre)",
            'N (Lbs/ Acre)',
            'P (Lbs/ Acre)',
            'K (Lbs/ Acre)',
        ],
    [FRESHWATER]:
        [
            "Application Date",
            "Field",
            "Acres Planted",
            "Crop",
            "Source Description",
            "Application Rate (GPM)",
            "Run Time (Hours)",
            "Total Gallons Applied",
            "Application Rate per Acre (Gallons/acre)",
            "N (mg/L)",
            "EC (umhos/cm)",
            "TDS (mg/L)",
            "Lbs/Acre N"
        ],
    [SOLIDMANURE]:
        [
            "Application Date",
            "Field",
            "Acres Planted",
            "Crop",
            "Source Description",
            "Application Rate per Acre (Tons/acre)",
            "% Moisture",
            "% N",
            "% P",
            "% K",
            "% TFS",
            "Lbs/Acre N",
            "Lbs/Acre P",
            "Lbs/Acre K",
            "Lbs/Acre Salt",
        ],
    [FERTILIZER]:
        [
            "Application Date",
            "Field",
            "Acres Planted",
            "Crop",
            "Import Description",
            "Application Rate (Lbs/Acre)",
            "% Moisture",
            "% N",
            "% P",
            "% K",
            "Lbs/Acre N",
            "Lbs/Acre P",
            "Lbs/Acre K",
        ],
    [HARVEST]: [
        'Field',
        'Acres Planted',
        'Crop',
        'Plant Date',
        'Harvest Dates',
        'Expected Yield Tons/Acre',
        'Actual Yield Tons/Acre',
        'Actual Yield Total Tons',
        'Reporting Method',
        '% Moisture',
        '% N',
        '% P',
        '% K',
        '% TFS Salt (Dry Basis)',
        'Lbs/Acre N',
        'Lbs/Acre P',
        'Lbs/Acre K',
        'Lbs/Acre Salt',
    ],

    [SOIL]: ['Application Date', 'Field', 'Acres Planted', 'Crop', 'Sample Date1', 'Sample Date2', 'Sample Date3'],
    [PLOWDOWN_CREDIT]: ['Application Date', 'Field', 'Acres Planted', 'Crop', 'App Method', 'Source Description', 'N lbs/ acre', 'P lbs/ acre', 'K lbs/ acre', 'Salt lbs/ acre'],
    [DRAIN]: ['Source Description', 'Sample Date', 'Sample Description', 'NH4-N (mg/L)', 'NO3-N (mg/L)', 'P (mg/L)', 'EC (umhos/cm)', 'TDS (mg/L)'],
    [DISCHARGE]: ['Type', 'Date Time', 'Location', 'Volume discharged', 'Volume Unit', 'Duration of Discharge (mins)', 'Discharge Source', 'Method of Measuring', 'Rationale for Sample Location', 'Reference Number for Discharge Site'],


    [MANURE]: [
        "Date",
        "Recipient",
        "Destination Street",
        "Amount (Tons)",
        "Material Type",
        "% Moisture",
        "% N",
        "% P",
        "% K",
        "% TFS",
        'Lbs of N Removed',
        'Lbs of P Removed',
        'Lbs of K Removed',
        'Lbs of Salt Removed',
    ], // Exports
    [WASTEWATER]: [
        "Date",
        "Recipient",
        "Destination Street",
        "Hours",
        "GPM",
        "Amount (Gals)",
        "Source Description",
        "N (PPM)",
        "P (PPM)",
        "K (PPM)",
        "EC (umhos/cm)",
        "TDS (mg/L)",
        'Lbs of N Removed',
        'Lbs of P Removed',
        'Lbs of K Removed',
    ], // Exports
}



/** Converts TSV Text from DB to a PDF
 *  DB -> Text -> 2d array filtered by columns(data)) -> create Document Definition DD (Styling) -> pdfmake create PDF (Buffer)
 */
class TSVToPDF {

    constructor(dairyTitle, company_id) {
        this.company_id = company_id
        this.dairyTitle = dairyTitle
        this.wb = null
        this.tsvText = null
        this.tsvTitle = null
        this.tsvType = null

        this.aboveHeader = null
        this.printCols = null
        this.dataRows = null
        this.docDefinition = null
        this.buffer = null

    }

    setTSV(tsvObj, tsvType) {
        this.tsvObj = tsvObj
        this.tsvType = tsvType
        this.tsvText = tsvObj.data
        this.tsvTitle = tsvObj.title

        const [aboveHeader, printCols, dataRows] = this.tsvTextToRows(tsvObj.data)
        this.aboveHeader = aboveHeader
        this.printCols = printCols
        this.dataRows = dataRows
    }

    tsvTextToRows(tsvText) {
        let printCols = TSV_PRINT_COLS[this.tsvType]  // List of ints representing indices to print from TSV
        let dataStarted = false
        let rows = []
        let aboveHeader = []
        let header = []
        let dataRows = []
        let headerMap = {}

        let splitText = tsvText.split('\n')

        splitText.forEach((row, i) => {
            // Need a function to extract the cols I need
            if (i === 0) {
                // let _col = row && row.length > 0 ? row.split('\t') : [] // List of all Cols
                // console.log(row, _col)
            }
            let _cols = row && row.length > 0 ? row.split('\t') : [] // List of all Cols

            // Ensure the row has more cols than what is going to be printed

            if (dataStarted) {
                const cols = printCols.map(key => _cols[headerMap[key]]) // For each print col index, get the data from the row 
                if (cols[0] !== undefined)
                    dataRows.push(cols)
            } else {
                if (_cols[0] === "Start" && !dataStarted) {
                    // We only know the row w/ header info is just before the start row.
                    header = splitText[Math.max(0, i - 1)].split('\t')
                    headerMap = createHeaderMap(header, false)
                    dataStarted = true
                } else {
                    if (i === 0) {
                        _cols = this.moveYearToEndOfRow(_cols, printCols.length)
                    } else if (i === 1) {
                        _cols = this.formatAboveHeaderRow(_cols, printCols)
                    }
                    aboveHeader.push(_cols.slice(0, printCols.length))
                }
            }
        })
        return [aboveHeader.slice(0, -1)/** Removes OG header row*/, printCols /** Filter header */, dataRows]
    }

    moveYearToEndOfRow(firstRow, rowLength) {
        //ONLY FOR ABOVE HEADER ROW aka FIRSTROW
        // firstRow is the whole row containing the year and the value
        // headerRow is the row of headers which is the true length of cols

        // search firstRow for year
        // move to position determined by headerro
        let newRow = new Array(rowLength).fill(' ')
        // Filter empty cols
        firstRow = firstRow.filter(el => typeof el === typeof '' && el.length > 0)

        newRow[0] = firstRow[0]
        newRow[3] = firstRow[1]
        newRow[newRow.length - 2] = firstRow[2]
        newRow[newRow.length - 1] = firstRow[3]
        return newRow
    }

    formatAboveHeaderRow(row, headerRow) {
        let res = new Array(headerRow.length).fill(' ')
        row = row.filter(el => typeof el === typeof '' && el.length > 0)
        res[0] = row[0]
        res[3] = row[1]
        return res
    }

    async createDD() {
        const tsvDD = new TSVDD(this.dairyTitle, this.tsvType, this.aboveHeader, this.printCols, this.dataRows, this.company_id)
        this.docDefinition = await tsvDD.generateDD()
        return this
    }

    setBuffer(buffer) {
        this.buffer = buffer
    }

    async createPDF() {
        if (!this.docDefinition) throw ("Need to call createDD First")

        let pdfDoc = printer.createPdfKitDocument(this.docDefinition);
        let chunks = [];


        await new Promise((resolve, reject) => {
            pdfDoc.on('data', (chunk) => {
                chunks.push(chunk)
            });

            pdfDoc.on('end', () => {
                resolve(this.setBuffer(Buffer.concat(chunks)))
                // resolve(Buffer.concat(chunks))
            })
            pdfDoc.on('error', (err) => {
                console.log("On error", err)
            })
            pdfDoc.end()
        })
        return this
    }


}

module.exports.TSVToPDF = TSVToPDF