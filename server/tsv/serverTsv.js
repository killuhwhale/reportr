const XLSX = require('xlsx')
const { toFloat } = require('../utils/convertUtil');
const {
    harvestTemplate, wwTemplate, fwTemplate, smTemplate, cfTemplate, smExportTemplate,
    wwExportTemplate, soilTemplate, plowdownTemplate, tiledrainageTemplate, dischargeTemplate
} = require('./serverTsvTemplates')
const db = require('../db/index')
const logger = require('../logs/logging')
const { verifyToken, verifyUserFromCompanyByDairyID } = require('../utils/middleware')
const { uploadTSVToDB } = require('./uploadTSVFile')
const { lazyGet } = require('./lazyGet')

const { naturalSortBy } = require('../utils/format')

const api = 'tsv'

// Each Tab/Sheet Name is linked to a TSV Type
// When uploading a Workbook, the sheetName determines which TSV Type the sheet represents and must match one of the following
const HARVEST = 'Production Records'
const PROCESS_WASTEWATER = 'WW Applications'
const FRESHWATER = 'FW Applications'
const SOLIDMANURE = 'SM Applications'
const FERTILIZER = 'Commercial Fertilizer'
const SOIL = 'Soil Analyses'
const PLOWDOWN_CREDIT = 'Plowdown Credit'
const DRAIN = 'Tile Drainage Systems'
const DISCHARGE = 'Discharges'
const MANURE = 'SM Exports'
const WASTEWATER = 'WW Exports'

const SHEET_NAMES = [
    HARVEST, PROCESS_WASTEWATER, FRESHWATER, SOLIDMANURE, FERTILIZER, SOIL, PLOWDOWN_CREDIT, DRAIN, DISCHARGE, MANURE, WASTEWATER,
]

const TSV_INFO = {
    [DISCHARGE]: {
        tsvType: DISCHARGE,
        template: dischargeTemplate,
        aliases: [DISCHARGE],
    },
    [DRAIN]: {
        tsvType: DRAIN,
        template: tiledrainageTemplate,
        aliases: [DRAIN],
    },
    [PLOWDOWN_CREDIT]: {
        tsvType: PLOWDOWN_CREDIT,
        template: plowdownTemplate,
        aliases: [PLOWDOWN_CREDIT],
    },
    [SOIL]: {
        tsvType: SOIL,
        template: soilTemplate,
        aliases: [SOIL],
    },
    [HARVEST]: {
        tsvType: HARVEST,
        template: harvestTemplate,
        aliases: [HARVEST],
    },
    [PROCESS_WASTEWATER]: {
        tsvType: PROCESS_WASTEWATER,
        aliases: [PROCESS_WASTEWATER],
        template: wwTemplate,
    },
    [FRESHWATER]: {
        tsvType: FRESHWATER,
        aliases: [FRESHWATER],
        template: fwTemplate,
    },
    [SOLIDMANURE]: {
        tsvType: SOLIDMANURE,
        aliases: [SOLIDMANURE],
        template: smTemplate,
    },
    [FERTILIZER]: {
        tsvType: FERTILIZER,
        aliases: [FERTILIZER],
        template: cfTemplate,
    },
    [MANURE]: { // exports
        tsvType: MANURE,
        aliases: [MANURE, "Manure Calculation records table"],
        template: smExportTemplate,
    },
    [WASTEWATER]: { // exports
        tsvType: WASTEWATER,
        aliases: [WASTEWATER, "WasteWater Collection Sheet"],
        template: wwExportTemplate,
    }
}

//Used to search for a tsvType given an alias
const convertAliasesToArrayOfObjects = () => {
    const allAliases = []
    for (let sheetName of SHEET_NAMES) {
        for (let alias of TSV_INFO[sheetName].aliases) {
            allAliases.push({
                title: alias,
                tsvType: TSV_INFO[sheetName].tsvType
            })
        }
    }
    return allAliases.sort((a, b) => naturalSortBy(a, b, 'title'))
}

const ALL_ALIASES = convertAliasesToArrayOfObjects()

const createHeaderMap = (headerRow, indexAsKey = true) => {
    const header = {}
    const invalidChars = ['\b', '\f', '\n', '\r', '\t', '\v']
    headerRow.forEach((item, i) => {
        item = item.trim()
        if (item && item.length > 0 && invalidChars.indexOf(item) < 0) {
            if (indexAsKey) {
                header[i] = item
            } else {
                header[item] = i
            }
        }
    })
    return header
}

const checkEmpty = (val) => {
    // If value is empty, return 0 to avoid error in DB.
    let f = 0
    try {
        f = toFloat(val)
    } catch (err) {
        logger.info(`Failed w/ val: ${val}`)
    }
    return f
}

// Take in TsvText 
// Parse Text into 2d array of maps, representing the data in the tsv row
class SheetParser {
    #tsvText
    #tsvType

    constructor(tsvText, tsvType) {
        this.#tsvText = tsvText
        this.#tsvType = tsvType
        this.data = null
    }

    getRawData() {
        this.#processTSVTextAsMap()
        return this.data
    }

    #processTSVTextAsMap() {
        let lines = this.#tsvText.split("\n")
        let started = false
        let rows = [] // Each row of the TSV file containing data as a Map 
        let headerMap = {} // Maps column index to a String that is the header for that column e.g. '0': "Application Date"
        const template = TSV_INFO[this.#tsvType].template

        lines.forEach((line, i) => {
            let cols = line.split("\t")
            if (cols[0]) { // skips rows without info in col 0
                if (started && headerMap && Object.keys(headerMap).length > 0) {
                    rows.push(this.#mapsColToTemplate(cols, headerMap, template))
                }
                else if (cols[0] == "Start") {  // waits until a row with the word "Start" is in the first col. The data will be on proceeding line
                    started = true
                    const headerRow = lines[i - 1].split("\t")
                    headerMap = createHeaderMap(headerRow)
                }
            }
        })
        this.data = rows
        return this
    }

    #mapsColToTemplate(cols, headerMap, template) {
        const rowTemplate = { ...template }
        cols.forEach((item, i) => {
            const key = headerMap[i]
            if (key && rowTemplate[key] != undefined) {
                rowTemplate[key] = item
            } else {
            }
        })
        return rowTemplate
    }
}

/**
 * Takes in a the dairy ID
 * 
 * Set a file representing a workbook .XLSX file or a single .TSV file
 * 
 * Once set, call uploadXLSX() or uploadTSVSheet()
 */
class XLSXUpload {
    #workbook
    #uploadTSVText
    #filename
    #dairy_id
    #tsvType
    #TAG_NAME

    // Uploads works books and single sheets.
    constructor(dairy_id) {
        this.#workbook = null // Work book, .XLSX file
        this.#uploadTSVText = null  // Single sheet to upload
        this.#filename = null
        this.#dairy_id = dairy_id
        this.#TAG_NAME = 'XLSXUpload'
    }

    setWorkbook(file) {
        this.#workbook = XLSX.read(file)
        return this
    }

    setUploadSheet(file, filename, tsvType) {
        const sheet = XLSX.read(file).Sheets.Sheet1
        this.#uploadTSVText = XLSX.utils.sheet_to_csv(sheet, { FS: '\t', blankrows: false })
        this.#filename = filename
        this.#tsvType = tsvType
        return this
    }

    async uploadTSVSheet() {
        if (!this.#uploadTSVText || !this.#filename || !this.#tsvType) return console.log("Need to setUploadSheet()")
        return await this.#uploadSheet(this.#uploadTSVText, this.#tsvType, this.#filename)
    }

    async uploadXLSX() {
        const sheets = this.#workbook && this.#workbook.Sheets ? this.#workbook.Sheets : null
        if (!sheets) {
            return console.log("No sheets found.")
        }

        let promises = []
        // Given some random Sheet name, alias, known to belong to some tsvType
        // Find the tsvType based on the alias    
        this.#workbook.SheetNames.forEach(sheetName => {
            const tsvType = this.#getTsvTypeByAlias(sheetName)

            if (tsvType.error) return console.log('TsvType Error:', tsvType.error)

            // const tsvType = TSV_INFO[sheetName].tsvType
            const tsvText = XLSX.utils.sheet_to_csv(sheets[sheetName], { FS: '\t', blankrows: false })
            console.log("Uploading ", tsvType)
            promises.push(
                this.#uploadSheet(tsvText, tsvType, sheetName)
            )
        })

        try {
            const result = await Promise.all(promises)
            return result
        } catch (e) {
            console.log(this.#TAG_NAME, ' error uploadXLSX')
            return { error: `${this.#TAG_NAME} error uploadXLSX` }
        }
    }

    async #uploadSheet(tsvText, tsvType, uploadedFilename) {
        try {
            const parser = new SheetParser(tsvText, tsvType)
            const rows = parser.getRawData()
            const uploader = new UploadTSVData(rows, tsvType, this.#dairy_id)
            const results = await uploader.uploadTSVByType()

            // Check results here
            let error = null
            for (let result of results) {

                if (result && result.error) {
                    error = result
                }
            }
            if (error) return { tsvType, uploadedFilename, error }

            const saveTSVresult = await uploadTSVToDB(uploadedFilename, tsvText, this.#dairy_id, tsvType)
            if (saveTSVresult.error) return { tsvType, uploadedFilename, error: saveTSVresult.error }

            return { tsvType, uploadedFilename, data: 'Complete' }
        } catch (e) {
            logger.info(e)
            return { tsvType, uploadedFilename, error: e.toString() }
        }
    }

    #binarySearch(arr, target) {
        let start = 0
        let end = arr.length - 1

        while (start <= end) {
            let half = parseInt(start + ((end - start) / 2))
            const val = arr[half].title
            if (val === target) {
                return half
            }
            else if (target < val) {
                end = half - 1
            } else {
                start = half + 1
            }

        }


    }

    #getTsvTypeByAlias(alias) {
        const idx = this.#binarySearch(ALL_ALIASES, alias)
        if (idx >= 0 || idx < ALL_ALIASES.length) {
            return ALL_ALIASES[idx].tsvType
        }
        return { error: `TsvType not found: ${alias}` }
    }
}

class UploadTSVData {
    #rows
    #dairy_id
    #tsvType

    constructor(rows, tsvType, dairy_id) {
        this.#rows = rows
        this.#dairy_id = dairy_id
        this.#tsvType = tsvType
    }

    uploadTSVByType() {
        const nutrientAppTypes = [PROCESS_WASTEWATER, FRESHWATER, SOLIDMANURE, FERTILIZER, SOIL, PLOWDOWN_CREDIT]
        let promise = null


        if (this.#tsvType === MANURE || this.#tsvType === WASTEWATER) {
            promise = this.#uploadExportTSV()
        }
        if (this.#tsvType === HARVEST) {
            promise = this.#uploadHarvestTSV()
        }
        if (this.#tsvType === DISCHARGE) {
            promise = this.#uploadDischargeTSV()
        }
        if (this.#tsvType === DRAIN) {
            promise = this.#uploadTileDrainage()
        }
        if (nutrientAppTypes.indexOf(this.#tsvType) >= 0) {
            promise = this.#uploadNutrientApp()
        }
        return promise
    }

    // Remove TSV Text and get the Rows From SHeet Parser.data

    async #uploadNutrientApp() {
        // Create a set of fields to ensure duplicates are not attempted.
        try {
            let fields = this.#createFieldSetFromMap(this.#rows)
            const fieldResult = await Promise.all(fields.map(field => lazyGet('fields', [field.title], field, this.#dairy_id)))
            let promises = this.#rows.map((row, i) => {
                return DataPrep.createDataFromTSVListRowMap(row, i, this.#dairy_id, this.#tsvType)
            })

            return await Promise.all(promises)
        } catch (e) {

            logger.info(e)
            return { error: e.toString() }
        }
    }

    async #uploadExportTSV() {
        return await Promise.all(
            this.#rows.map((row, i) => {
                if (this.#tsvType == WASTEWATER) {
                    return DataPrep.createDataFromWastewaterExportTSVListRowMap(row, i, this.#dairy_id)
                }
                if (this.#tsvType === MANURE) {
                    return DataPrep.createDataFromManureExportTSVListRowMap(row, i, this.#dairy_id)
                }
            })
        )

    }

    async #uploadHarvestTSV() {
        // Create a set of fields to ensure duplicates are not attempted.
        // let fields = createFieldSetFromMap(rows)
        return await Promise.all(
            this.#rows.map((row, i) => {
                return DataPrep.createDataFromHarvestTSVListRowMap(row, i, this.#dairy_id)    // Create entries for ea row in TSV file
            })
        )
    }

    // Direct upload, no data prep
    async #uploadDischargeTSV() {
        return await Promise.all(
            this.#rows.map((row, i) => {

                const discharge_type = row["Type"]
                const discharge_datetime = row["Date Time"]
                const discharge_loc = row["Location"]
                const vol = row["Volume discharged"]
                const vol_unit = row["Volume Unit"]
                const duration_of_discharge = row["Duration of Discharge (mins)"]
                const discharge_src = row["Discharge Source"]
                const method_of_measuring = row["Method of Measuring"]
                const sample_location_reason = row["Rationale for Sample Location"]
                const ref_number = row["Reference Number for Discharge Site"]

                return new Promise((resolve, reject) => {
                    try {
                        db.insertDischarge(
                            [
                                this.#dairy_id,
                                discharge_type,
                                discharge_datetime,
                                discharge_loc,
                                toFloat(vol),
                                vol_unit,
                                toFloat(duration_of_discharge),
                                discharge_src,
                                method_of_measuring,
                                sample_location_reason,
                                ref_number
                            ],
                            (err, result) => {
                                if (!err) {
                                    if (result.rows && result.rows[0]) {
                                        resolve(result.rows[0])
                                    } else {
                                        resolve({})
                                    }
                                } else if (err.code === '23505') {
                                    resolve(null)
                                } else {
                                    logger.info(err)
                                    reject({ "error": "Created discharge unsuccessful", err });
                                }
                            }
                        )
                    } catch (err) {
                        reject({ err: err, message: "errororororo" })
                    }

                })
            })
        )
    }

    // Direct upload, no data prep
    async #uploadTileDrainage() {
        return await Promise.all(
            this.#rows.map((row, i) => {

                const src_desc = row["Source Description"]
                const sample_date = row["Sample Date"]
                const sample_desc = row["Sample Description"]
                const src_of_analysis = row["Source of Analysis"]
                const nh4_con = row["NH4-N (mg/L)"]
                const no2_con = row["NO3-N (mg/L)"]
                const p_con = row["P (mg/L)"]
                const ec = row["EC (umhos/cm)"]
                const tds = row["TDS (mg/L)"]
                const nh4_dl = row["NH4-N DL"]
                const no2_dl = row["NO3-N DL"]
                const p_dl = row["P DL"]
                const ec_dl = row["EC DL"]
                const tds_dl = row["TDS DL"]


                let drainSourceData = {
                    dairy_id: this.#dairy_id,
                    src_desc
                }

                return new Promise((resolve, reject) => {
                    lazyGet('drain_source', { src_desc }, drainSourceData, this.#dairy_id)
                        .then((drainSource) => {

                            db.insertDrainAnalysis(
                                [
                                    this.#dairy_id,
                                    drainSource.pk,
                                    sample_date,
                                    sample_desc,
                                    src_of_analysis,
                                    nh4_con,
                                    no2_con,
                                    p_con,
                                    ec,
                                    tds,
                                    nh4_dl,
                                    no2_dl,
                                    p_dl,
                                    ec_dl,
                                    tds_dl
                                ],
                                (err, result) => {

                                    if (!err) {
                                        if (result.rows[0] ?? false) {
                                            resolve(result.rows[0])
                                        }
                                    } else if (err.code === '23505') {
                                        resolve(null)
                                    } else if (err.code === '1000') {
                                        console.log(err)
                                        reject({ error: err.msg })
                                    } else {
                                        logger.info(err)
                                        reject({ "error": "Created drain_analysis unsuccessful" });
                                    }
                                }
                            )
                        })
                        .catch(err => {
                            logger.info(err)
                            reject(err)
                        })
                })
            })
        )

    }


    #createFieldSetFromMap(rows) {
        /**
         * Returns list of list where each list is [title, acres, planted] the minimum required info
         */

        let fields = []
        let fieldSet = new Set()
        // Create a set of fields to ensure duplicates are not attempted.
        rows.forEach(row => {
            const title = row['Field']
            const acres = row['Total Acres']
            const cropable = row['Cropable']

            if (!fieldSet.has(title)) {
                fields.push({ title, acres, cropable })
                fieldSet.add(title)
            }
        })
        return fields
    }

}

class DataPrep {
    // Harvests
    static createDataFromHarvestTSVListRowMap(row, i, dairy_id) {

        // Spreadsheet headers (used db col names)
        const field_title = row['Field']
        const acres_planted = row['Acres Planted']
        const cropable = row['Cropable']
        const acres = row['Total Acres']
        const crop_title = row['Crop']
        const plant_date = row['Plant Date']
        const harvest_date = row['Harvest Dates']
        const expected_yield_tons_acre = row['Expected Yield Tons/Acre']
        const actual_yield = row['Actual Yield Total Tons']
        const actual_yield_tons_per_acre = row['Actual Yield Tons/Acre']
        const sample_date = row['Sample Date']
        const src_of_analysis = row['Source of Analysis']
        const method_of_reporting = row['Reporting Method']
        const moisture = row['% Moisture']
        const n = row['% N']
        const p = row['% P']
        const k = row['% K']
        const tfs = row['% TFS Salt (Dry Basis)']
        const n_dl = row['N DL']
        const p_dl = row['P DL']
        const k_dl = row['K DL']
        const tfs_dl = row['TFS DL']

        let fieldData = {
            title: field_title,
            cropable: cropable,
            acres: acres,
            dairy_id: dairy_id
        }
        return new Promise((resolve, rej) => {
            // Get Field and Crop
            Promise.all([
                lazyGet('fields', [field_title], fieldData, dairy_id),
                this.#getCropByTitle(crop_title) // list of crops in DB are predefined based on spreadsheet. HARDCODED
            ])
                .then(([fieldObj, cropObj]) => {
                    if (fieldObj) {
                        if (cropObj) {
                            const { typical_yield, moisture: typical_moisture, n: typical_n, p: typical_p, k: typical_k, salt } = cropObj
                            let searchValue = { fieldPK: fieldObj.pk, cropPK: cropObj.pk, plant_date }
                            let field_crop_data = {
                                dairy_id: dairy_id,
                                field_id: fieldObj.pk,
                                crop_id: cropObj.pk,
                                plant_date: plant_date,
                                acres_planted: acres_planted,
                                typical_yield: typical_yield,
                                moisture: typical_moisture,
                                n: typical_n,
                                p: typical_p,
                                k: typical_k,
                                salt: salt
                            }
                            // Before lazy getting field_crop
                            // Make sure acres_planted is less than croppable acres
                            lazyGet('field_crop', searchValue, field_crop_data, dairy_id)
                                .then(fieldCropObj => {

                                    if (!fieldCropObj) {
                                        rej({ error: 'Field Crop not found' })
                                        return
                                    }
                                    // TODO(valid) Validate Data Here Before Insert

                                    db.insertFieldCropHarvest(
                                        [
                                            dairy_id,
                                            fieldCropObj.pk,
                                            sample_date,
                                            harvest_date,
                                            expected_yield_tons_acre,
                                            method_of_reporting,
                                            toFloat(actual_yield),
                                            src_of_analysis,
                                            moisture,
                                            toFloat(n),
                                            toFloat(p),
                                            toFloat(k),
                                            toFloat(tfs),
                                            toFloat(n_dl),
                                            toFloat(p_dl),
                                            toFloat(k_dl),
                                            toFloat(tfs_dl)
                                        ],
                                        (err, result) => {

                                            if (!err) {
                                                if (result.rows[0] ?? false) {
                                                    resolve(result.rows[0])
                                                } else {
                                                    rej({ error: 'Insert field_crop_harvest failed to return data' })
                                                }
                                                // res.json({"error": "Created field_crop_harvest successfully"});

                                            } else if (err.code === '23505') {
                                                resolve(null)
                                            } else if (err.code === '1000') {
                                                rej({ error: err.msg })
                                            } else {
                                                logger.info(err)
                                                rej({ "error": "Created field_crop_harvest unsuccessful" });
                                            }
                                        })
                                })
                                .catch(field_crop_err => {
                                    rej(field_crop_err)
                                })
                        } else {
                            rej({ err: `Crop not found ${field_title} / ${crop_title} ${plant_date}` })
                        }
                    } else {
                        rej({ err: `Field not found ${field_title} ${plant_date}` })
                    }
                })
                .catch(err => {
                    rej(err)
                })
        })

    }

    static async #getCropByTitle(title) {
        try {
            const crops = await db.getCropsByTitle(title)
            if (crops.error) return crops.error
            return crops[0]
        } catch (e) {
            return { error: "Get crops by Title unsuccessful" }
        }
    }

    // Nutrient Apps
    static async createDataFromTSVListRowMap(row, i, dairy_id, tsvType) {
        /**
        * 
        *  For all TSV sheets, the data relies on a Field, Field_crop, Field_crop_app. 
        *  This part will lazily create everything based on the first 7 entries on the sheet.
        */

        try {

            const field_crop_app = await this.#getFieldCropAppFromMap(row, dairy_id, tsvType)

            let result = null
            if (tsvType === PROCESS_WASTEWATER) {
                result = await this.#createProcessWastewaterApplicationFromMap(row, field_crop_app, dairy_id)
            } else if (tsvType === FRESHWATER) {
                // Creates source, analysis and event
                result = await this.#createFreshwaterApplicationFromMap(row, field_crop_app, dairy_id)
            } else if (tsvType === SOLIDMANURE) {
                // Creates source, analysis and event
                result = await this.#createSolidmanureApplicationFromMap(row, field_crop_app, dairy_id)
            }
            else if (tsvType === FERTILIZER) {
                // Creates Nutrient Import, Fertilizer
                result = await this.#createFertilizerApplicationFromMap(row, field_crop_app, dairy_id)
            }
            else if (tsvType === SOIL) {
                // Creates Nutrient Import, Fertilizer
                result = await this.#createSoilApplicationFromMap(row, field_crop_app, dairy_id)
            } else if (tsvType === PLOWDOWN_CREDIT) {
                // Creates Nutrient Import, Fertilizer
                // resolve(createPlowdownCreditApplication(row, field_crop_app, dairy_id))
                result = await this.#createPlowdownCreditApplicationFromMap(row, field_crop_app, dairy_id)
            }

            return result

        } catch (e) {
            logger.info(e)
            return e
        }
    }

    static async #getFieldCropAppFromMap(commonRowData, dairy_id, tsvType) {
        const app_date = commonRowData['Application Date']
        const precip_before = commonRowData['Rain Day Prior to Event']
        const precip_during = commonRowData['Rain Day of Event']
        const precip_after = commonRowData['Rain Day After Event']
        const app_method = commonRowData['App Method']

        try {
            const field_crop_res = await this.#getFieldCropFromMap(commonRowData, dairy_id, tsvType)
            const searchValue = { fieldCropID: field_crop_res.pk, app_date, app_method }
            const fieldCropAppData = {
                dairy_id: dairy_id,
                field_crop_id: field_crop_res.pk,
                app_date: app_date,
                app_method: app_method,
                precip_before: precip_before,
                precip_during: precip_during,
                precip_after: precip_after,
            }

            // Add case to Lazy Get for this
            return await lazyGet('field_crop_app', searchValue, fieldCropAppData, dairy_id)

        } catch (e) {
            console.log("fcaFromMap ", e)
            return { error: e }
        }


    }

    static #getFieldCropFromMap(commonRowData, dairy_id, tsvType) {
        const field_title = commonRowData['Field']
        const acres_planted = commonRowData['Acres Planted']
        const cropable = commonRowData['Cropable']
        const acres = commonRowData['Total Acres']
        const crop_title = commonRowData['Crop']
        const plant_date = commonRowData['Plant Date']

        return new Promise((resolve, reject) => {
            if (!field_title || !crop_title) {
                reject(`Field crop data not found: ${field_title} - ${crop_title} - ${cropable} - ${acres}`)
                return
            }

            this.#prepareFieldCrop(field_title, crop_title, cropable, acres, dairy_id)
                .then(res => {
                    let fieldObj = res[0]
                    let cropObj = res[1]
                    if (fieldObj) {
                        if (cropObj) {
                            const { typical_yield, moisture: typical_moisture, n: typical_n, p: typical_p, k: typical_k, salt } = cropObj
                            let searchValues = {
                                fieldPK: fieldObj.pk, cropPK: cropObj.pk, plant_date
                            }
                            let fieldCropData = {
                                dairy_id: dairy_id,
                                field_id: fieldObj.pk,
                                crop_id: cropObj.pk,
                                plant_date: plant_date,
                                acres_planted: acres_planted,
                                typical_yield: typical_yield,
                                moisture: typical_moisture,
                                n: typical_n,  // I now reliaze copying this data is rather pointless.. but takes more work to remove...
                                p: typical_p,
                                k: typical_k,
                                salt: salt
                            }



                            lazyGet('field_crop', searchValues, fieldCropData, dairy_id)
                                .then(field_crop_res => {
                                    resolve(field_crop_res)
                                })
                                .catch(err => {
                                    logger.info(err)
                                    reject(err)
                                })
                        } else {
                            logger.info("Crop not valid.", crop_title)
                        }
                    } else {
                        logger.info("Prepare Field Crop: Field not valid.", res)
                        logger.info(fieldObj, cropObj)
                    }
                })
        })
    }

    static #prepareFieldCrop(field_title, crop_title, cropable, acres, dairy_id) {
        let fieldData = {
            data: {
                title: field_title,
                cropable: cropable,
                acres: acres,
                dairy_id: dairy_id
            }
        }
        return new Promise((resolve, rej) => {
            Promise.all([
                lazyGet('fields', [field_title], fieldData, dairy_id),
                this.#getCropByTitle(crop_title) // list of crops in DB are predefined based on spreadsheet. HARDCODED
            ])
                .then(res => {
                    resolve(res)
                })
                .catch(err => {
                    rej(err)
                })
        })
    }


    static #createProcessWastewaterApplicationFromMap(row, field_crop_app, dairy_id) {

        const sample_date = row['Sample Date']
        const sample_desc = row['Sample Description']
        const sample_data_src = row['Sample Data Source']
        const kn_con = row['N (mg/L)']
        const nh4_con = row['NH4-N (mg/L)']
        const nh3_con = row['NH3-N (mg/L)']
        const no3_con = row['NO3-N (mg/L)']
        const p_con = row['P (mg/L)']
        const k_con = row['K (mg/L)']
        const ca_con = row['Calcium (mg/L)']
        const mg_con = row['Magnesium (mg/L)']
        const na_con = row['Sodium (mg/L)']
        const hco3_con = row['BiCarb (mg/L)']
        const co3_con = row['Carbonate (mg/L)']
        const so4_con = row['Sulfate (mg/L)']
        const cl_con = row['Chloride (mg/L)']
        const ec = row['EC (umhos/cm)']
        const tds = row['TDS (mg/L)']
        const kn_dl = row['N DL']
        const nh4_dl = row['NH4-N DL']
        const nh3_dl = row['NH3-N DL']
        const no3_dl = row['NO3-N DL']
        const p_dl = row['P DL']
        const k_dl = row['K DL']
        const ca_dl = row['Calcium DL']
        const mg_dl = row['Magnesium DL']
        const na_dl = row['Sodium DL']
        const hco3_dl = row['BiCarb DL']
        const co3_dl = row['Carbonate DL']
        const so4_dl = row['Sulfate DL']
        const cl_dl = row['Chloride DL']
        const ec_dl = row['EC DL']
        const tds_dl = row['TDS DL']
        const ph = row['PH']
        const app_desc = row['Application Description']
        const material_type = row['Material Type']
        const app_rate = row['Application Rate (GPM)']
        const run_time = row['Run Time (Hours)']
        const amount_applied = row['Total Gallons Applied']
        const app_rate_per_acre = row['Application Rate per acre (Gallons/ acre)']




        const process_wastewater_analysis_data = {
            dairy_id: dairy_id,
            sample_date,
            sample_desc,
            sample_data_src,
            material_type,
            kn_con: checkEmpty(kn_con),
            nh4_con: checkEmpty(nh4_con),
            nh3_con: checkEmpty(nh3_con),
            no3_con: checkEmpty(no3_con),
            p_con: checkEmpty(p_con),
            k_con: checkEmpty(k_con),
            ca_con: checkEmpty(ca_con),
            mg_con: checkEmpty(mg_con),
            na_con: checkEmpty(na_con),
            hco3_con: checkEmpty(hco3_con),
            co3_con: checkEmpty(co3_con),
            so4_con: checkEmpty(so4_con),
            cl_con: checkEmpty(cl_con),
            ec: checkEmpty(ec),
            tds: checkEmpty(tds),
            kn_dl: checkEmpty(kn_dl),
            nh4_dl: checkEmpty(nh4_dl),
            nh3_dl: checkEmpty(nh3_dl),
            no3_dl: checkEmpty(no3_dl),
            p_dl: checkEmpty(p_dl),
            k_dl: checkEmpty(k_dl),
            ca_dl: checkEmpty(ca_dl),
            mg_dl: checkEmpty(mg_dl),
            na_dl: checkEmpty(na_dl),
            hco3_dl: checkEmpty(hco3_dl),
            co3_dl: checkEmpty(co3_dl),
            so4_dl: checkEmpty(so4_dl),
            cl_dl: checkEmpty(cl_dl),
            ec_dl: checkEmpty(ec_dl),
            tds_dl: checkEmpty(tds_dl),
            ph: checkEmpty(ph),
        }

        const searchValue = { sample_date, sample_desc }
        return new Promise((resolve, rej) => {
            // Need to lazyget process_wastewater_analysis
            lazyGet('field_crop_app_process_wastewater_analysis',
                searchValue,
                process_wastewater_analysis_data,
                dairy_id
            )
                .then(res => {
                    const field_crop_app_id = field_crop_app.pk
                    const field_crop_app_process_wastewater_analysis_id = res.pk
                    // insert field_crop_app_process_wastewater instread of post

                    db.insertFieldCropApplicationProcessWastewater(
                        [
                            dairy_id,
                            field_crop_app_id,
                            field_crop_app_process_wastewater_analysis_id,
                            app_desc,
                            toFloat(amount_applied)
                        ],
                        (err, result) => {

                            if (!err) {
                                resolve(result.rows)
                            } else if (err.code === '23505') {
                                resolve('FCAPW already exists')
                            }
                            else if (err.code === '1000') {
                                rej({ error: err.msg })
                            }

                            else {
                                logger.info(err)
                                rej({ "error": "Created field_crop_app_process_wastewaterZZZ unsuccessful" });
                            }
                        }
                    )
                })
                .catch(err => {
                    logger.info(err)
                    rej(err)
                })
        })
    }

    static #createFreshwaterApplicationFromMap(row, field_crop_app, dairy_id) {


        const sample_date = row['Sample Date']
        const src_desc = row['Source Description']
        const src_type = row['Source Type']
        const sample_desc = row['Sample Description']
        const src_of_analysis = row['Source of Analysis']
        const n_con = row['N (mg/L)']
        const nh4_con = row['NH4-N (mg/L)']
        const no2_con = row['NO3-N (mg/L)']
        const ca_con = row['Calcium (mg/L)']
        const mg_con = row['Magnesium (mg/L)']
        const na_con = row['Sodium (mg/L)']
        const hco3_con = row['BiCarb (mg/L)']
        const co3_con = row['Carbonate (mg/L)']
        const so4_con = row['Sulfate (mg/L)']
        const cl_con = row['Chloride (mg/L)']
        const ec = row['EC (umhos/cm)']
        const tds = row['TDS (mg/L)']
        const n_dl = row['N DL']
        const nh4_dl = row['NH4-N DL']
        const no2_dl = row['NO3-N DL']
        const ca_dl = row['Calcium DL']
        const mg_dl = row['Magnesium DL']
        const na_dl = row['Sodium DL']
        const hco3_dl = row['BiCarb DL']
        const co3_dl = row['Carbonate DL']
        const so4_dl = row['Sulfate DL']
        const cl_dl = row['Chloride DL']
        const ec_dl = row['EC DL']
        const tds_dl = row['TDS DL']
        const app_rate = row['Application Rate (GPM)']
        const run_time = row['Run Time (Hours)']
        const amount_applied = row['Total Gallons Applied']
        const amt_applied_per_acre = row['Application Rate per Acre (Gallons/acre)']


        // dairy_id, sample_date, sample_desc
        const searchValue = { src_desc, src_type }
        const freshwater_source_data = {
            dairy_id: dairy_id,
            src_desc,
            src_type
        }

        // Get Source
        return new Promise((resolve, rej) => {
            // lazyget freshwater_source
            lazyGet('field_crop_app_freshwater_source', searchValue, freshwater_source_data, dairy_id)
                .then(field_crop_app_freshwater_source => {
                    if (field_crop_app_freshwater_source) {
                        let fresh_water_source_id = field_crop_app_freshwater_source.pk
                        // lazyget freshwater_analysis , sample_date, sample_desc, src_of_analysis, fresh_water_source_id
                        const searchValue = { sample_date, sample_desc, src_of_analysis, fresh_water_source_id }
                        const freshwater_analysis_data = {
                            dairy_id: dairy_id,
                            fresh_water_source_id,
                            sample_date,
                            src_desc,
                            src_type,
                            sample_desc,
                            src_of_analysis,
                            n_con: checkEmpty(n_con),
                            nh4_con: checkEmpty(nh4_con),
                            no2_con: checkEmpty(no2_con),
                            ca_con: checkEmpty(ca_con),
                            mg_con: checkEmpty(mg_con),
                            na_con: checkEmpty(na_con),
                            hco3_con: checkEmpty(hco3_con),
                            co3_con: checkEmpty(co3_con),
                            so4_con: checkEmpty(so4_con),
                            cl_con: checkEmpty(cl_con),
                            ec: checkEmpty(ec),
                            tds: checkEmpty(tds),
                            n_dl: checkEmpty(n_dl),
                            nh4_dl: checkEmpty(nh4_dl),
                            no2_dl: checkEmpty(no2_dl),
                            ca_dl: checkEmpty(ca_dl),
                            mg_dl: checkEmpty(mg_dl),
                            na_dl: checkEmpty(na_dl),
                            hco3_dl: checkEmpty(hco3_dl),
                            co3_dl: checkEmpty(co3_dl),
                            so4_dl: checkEmpty(so4_dl),
                            cl_dl: checkEmpty(cl_dl),
                            ec_dl: checkEmpty(ec_dl),
                            tds_dl: checkEmpty(tds_dl)
                        }

                        lazyGet('field_crop_app_freshwater_analysis', searchValue, freshwater_analysis_data, dairy_id)
                            .then(freshwater_analysis => {
                                db.insertFieldCropApplicationFreshwater(
                                    [
                                        dairy_id,
                                        field_crop_app.pk,
                                        freshwater_analysis.pk,
                                        checkEmpty(app_rate),
                                        checkEmpty(run_time),
                                        checkEmpty(amount_applied),
                                        checkEmpty(amt_applied_per_acre)
                                    ],
                                    (err, result) => {

                                        if (!err) {
                                            if (result.rows[0] ?? false) {
                                                resolve(result.rows[0])
                                            }
                                        } else if (err.code === '23505') {
                                            resolve(null)
                                        } else if (err.code === '1000') {
                                            rej({ error: err.msg })
                                        } else {
                                            logger.info(err)
                                            rej({ "error": "Created field_crop_app_freshwater unsuccessful" });

                                        }
                                    }
                                )
                            })
                            .catch(err => {
                                rej(err)
                            })

                    } else {
                        logger.info("Error with reading pk", row)
                    }



                })
                .catch(err => {
                    logger.info(err)
                    rej(err)
                })
        })


    }

    static #createSolidmanureApplicationFromMap(row, field_crop_app, dairy_id) {

        const sample_date = row['Sample Date']
        const sample_desc = row['Sample Description']
        const src_desc = row['Source Description']
        const material_type = row['Material Type']
        const src_of_analysis = row['Source of Analysis']
        const method_of_reporting = row['Method of Reporting']
        const amount_applied = row['Application (Tons)']
        const amt_applied_per_acre = row['Application Rate per Acre (Tons/acre)']
        const moisture = row['% Moisture']
        const n_con = row['% N']
        const p_con = row['% P']
        const k_con = row['% K']
        const ca_con = row['% Calcium']
        const mg_con = row['% Magnesium']
        const na_con = row['% Sodium']
        const s_con = row['% Sulfur']
        const cl_con = row['% Chloride']
        const tfs = row['% TFS']
        const n_dl = row['N DL']
        const p_dl = row['P DL']
        const k_dl = row['K DL']
        const ca_dl = row['Calcium DL']
        const mg_dl = row['Magnesium DL']
        const na_dl = row['Sodium DL']
        const s_dl = row['Sulfur DL']
        const cl_dl = row['Chloride DL']
        const tfs_dl = row['TFS DL']

        // dairy_id, sample_date, sample_desc
        const searchValue = { sample_date, sample_desc, src_of_analysis }
        const solidmanure_analysis_data = {
            dairy_id: dairy_id,
            sample_desc,
            sample_date,
            material_type,
            src_of_analysis,
            moisture: checkEmpty(moisture),
            method_of_reporting,
            n_con: checkEmpty(n_con),
            p_con: checkEmpty(p_con),
            k_con: checkEmpty(k_con),
            ca_con: checkEmpty(ca_con),
            mg_con: checkEmpty(mg_con),
            na_con: checkEmpty(na_con),
            s_con: checkEmpty(s_con),
            cl_con: checkEmpty(cl_con),
            tfs: checkEmpty(tfs),
            n_dl: checkEmpty(n_dl),
            p_dl: checkEmpty(p_dl),
            k_dl: checkEmpty(k_dl),
            ca_dl: checkEmpty(ca_dl),
            mg_dl: checkEmpty(mg_dl),
            na_dl: checkEmpty(na_dl),
            s_dl: checkEmpty(s_dl),
            cl_dl: checkEmpty(cl_dl),
            tfs_dl: checkEmpty(tfs_dl),
        }

        // Get Source
        return new Promise((resolve, rej) => {
            // lazyget freshwater_source
            lazyGet('field_crop_app_solidmanure_analysis', searchValue, solidmanure_analysis_data, dairy_id)
                .then(field_crop_app_solidmanure_analysis => {
                    if (field_crop_app_solidmanure_analysis) {
                        db.insertFieldCropApplicationSolidmanure(
                            [
                                dairy_id,
                                field_crop_app.pk,
                                field_crop_app_solidmanure_analysis.pk,
                                src_desc,
                                toFloat(amount_applied),
                                toFloat(amt_applied_per_acre)
                            ],
                            (err, result) => {
                                if (!err) {
                                    if (result.rows[0] ?? false) {
                                        resolve(result.rows[0])
                                    } else {
                                        rej({ "error": "Insert field_crop_app_solidmanure unsuccessful" });
                                    }
                                } else if (err.code === '23505') {
                                    resolve(null)
                                } else if (err.code === '1000') {
                                    rej({ error: err.msg })
                                } else {
                                    logger.info(err)
                                    rej({ "error": "Created field_crop_app_solidmanure unsuccessful" });
                                }
                            }
                        )
                    } else {
                        logger.info("Error with reading pk for solidmanure analysis", row)
                        rej({ "error": "Error with reading pk for solidmanure analysis" });
                    }

                })
                .catch(err => {
                    logger.info(err)
                    rej(err)
                })
        })


    }

    static #createFertilizerApplicationFromMap(row, field_crop_app, dairy_id) {
        const import_desc = row['Import Description']
        const import_date = row['Import Date']
        const material_type = row['Material Type']
        const amount_imported = row['Amount Imported (tons/ gals)']
        const method_of_reporting = row['Method of Reporting']
        const amt_applied_per_acre = row['Application Rate (Lbs/Acre)']
        // const amount_applied = row['']
        const moisture = row['% Moisture']
        const n_con = row['% N']
        const p_con = row['% P']
        const k_con = row['% K']
        const salt_con = row['% Salt/ TFS/ TDS']

        // import_date, material_type, import_desc
        const searchValue = { import_date, material_type, import_desc }
        const nutrient_import_data = {
            dairy_id: dairy_id,
            import_desc,
            import_date,
            material_type,
            amount_imported: checkEmpty(amount_imported),
            method_of_reporting,
            moisture: checkEmpty(moisture),
            n_con: checkEmpty(n_con),
            p_con: checkEmpty(p_con),
            k_con: checkEmpty(k_con),
            salt_con: checkEmpty(salt_con),
        }

        return new Promise((resolve, rej) => {
            // lazyget freshwater_source
            // Server version, instead of lazyGet, try to get and then if emty, insert
            lazyGet('nutrient_import', searchValue, nutrient_import_data, dairy_id)
                .then(nutrient_import => {
                    if (nutrient_import) {
                        db.insertFieldCropApplicationFertilizer(
                            [
                                dairy_id,
                                field_crop_app.pk,
                                nutrient_import.pk,
                                toFloat(amt_applied_per_acre)
                            ],
                            (err, result) => {
                                if (!err) {
                                    if (result.rows[0]) {
                                        resolve(result.rows[0])
                                    } else {
                                        rej({ "error": "Insert field_crop_app_fertilizer unsuccessful" });
                                    }
                                } else if (err.code === '23505') {
                                    resolve(null)
                                } else if (err.code === '1000') {
                                    rej({ error: err.msg })
                                } else {
                                    logger.info(err)
                                    rej({ "error": "Created field_crop_app_fertilizer unsuccessful" });
                                }
                            }
                        )
                    } else {
                        logger.info("Error with reading pk for nutrient import", row)
                        rej({ error: "Error with reading pk for nutrient import" })
                    }
                })
                .catch(err => {
                    logger.info(err)
                    rej(err)
                })
        })
    }

    static #createSoilApplicationFromMap(row, field_crop_app, dairy_id) {


        const fieldTitle = row['Field']
        const acres = row['Total Acres']
        const cropable = row['Cropable']


        const src_desc = row['Source Description']
        const sample_date_0 = row['Sample Date1']
        const sample_desc_0 = row['Sample Description1']
        const src_of_analysis_0 = row['Source of Analysis1']
        const n_con_0 = row['N1 (mg/Kg)']
        const total_p_con_0 = row['P1 (mg/Kg)']
        const p_con_0 = row['Sol P1 (mg/Kg)']
        const k_con_0 = row['K1 (mg/Kg)']
        const ec_0 = row['EC1 (umhos/cm)']
        const org_matter_0 = row['Organic Matter1 (%)']
        const n_dl_0 = row['N1 DL']
        const total_p_dl_0 = row['P1 DL']
        const p_dl_0 = row['Sol P1 DL']
        const k_dl_0 = row['K1 DL']
        const ec_dl_0 = row['EC1 DL']
        const org_matter_dl_0 = row['Organic Matter1 DL']

        const sample_date_1 = row['Sample Date2']
        const sample_desc_1 = row['Sample Description2']
        const src_of_analysis_1 = row['Source of Analysis2']
        const n_con_1 = row['N2 (mg/Kg)']
        const total_p_con_1 = row['P2 (mg/Kg)']
        const p_con_1 = row['Sol P2 (mg/Kg)']
        const k_con_1 = row['K2 (mg/Kg)']
        const ec_1 = row['EC2 (umhos/cm)']
        const org_matter_1 = row['Organic Matter2 (%)']
        const n_dl_1 = row['N2 DL']
        const total_p_dl_1 = row['P2 DL']
        const p_dl_1 = row['Sol P2 DL']
        const k_dl_1 = row['K2 DL']
        const ec_dl_1 = row['EC2 DL']
        const org_matter_dl_1 = row['Organic Matter2 DL']


        const sample_date_2 = row['Sample Date3']
        const sample_desc_2 = row['Sample Description3']
        const src_of_analysis_2 = row['Source of Analysis3']
        const n_con_2 = row['N3 (mg/Kg)']
        const total_p_con_2 = row['P3 (mg/Kg)']
        const p_con_2 = row['Sol P3 (mg/Kg)']
        const k_con_2 = row['K3 (mg/Kg)']
        const ec_2 = row['EC3 (umhos/cm)']
        const org_matter_2 = row['Organic Matter3 (%)']
        const n_dl_2 = row['N3 DL']
        const total_p_dl_2 = row['P3 DL']
        const p_dl_2 = row['Sol P3 DL']
        const k_dl_2 = row['K3 DL']
        const ec_dl_2 = row['EC3 DL']
        const org_matter_dl_2 = row['Organic Matter3 DL']



        let fieldData = {
            title: fieldTitle,
            cropable,
            acres,
            dairy_id: dairy_id
        }

        return new Promise((resolve, reject) => {
            lazyGet('fields', [fieldTitle], fieldData, dairy_id)
                .then((field) => {
                    if (!field) {
                        rej({ error: 'No field found for soil analysis' })
                    }
                    const sampleData0 = {
                        dairy_id: dairy_id,
                        field_id: field.pk,
                        sample_desc: sample_desc_0,
                        sample_date: sample_date_0,
                        src_of_analysis: src_of_analysis_0,
                        n_con: n_con_0,
                        total_p_con: total_p_con_0,
                        p_con: p_con_0,
                        k_con: k_con_0,
                        ec: ec_0,
                        org_matter: org_matter_0,
                        n_dl: n_dl_0,
                        total_p_dl: total_p_dl_0,
                        p_dl: p_dl_0,
                        k_dl: k_dl_0,
                        ec_dl: ec_dl_0,
                        org_matter_dl: org_matter_dl_0
                    }
                    const sampleData1 = {
                        dairy_id: dairy_id,
                        field_id: field.pk,
                        sample_desc: sample_desc_1,
                        sample_date: sample_date_1,
                        src_of_analysis: src_of_analysis_1,
                        n_con: n_con_1,
                        total_p_con: total_p_con_1,
                        p_con: p_con_1,
                        k_con: k_con_1,
                        ec: ec_1,
                        org_matter: org_matter_1,
                        n_dl: n_dl_1,
                        total_p_dl: total_p_dl_1,
                        p_dl: p_dl_1,
                        k_dl: k_dl_1,
                        ec_dl: ec_dl_1,
                        org_matter_dl: org_matter_dl_1
                    }
                    const sampleData2 = {
                        dairy_id: dairy_id,
                        field_id: field.pk,
                        sample_desc: sample_desc_2,
                        sample_date: sample_date_2,
                        src_of_analysis: src_of_analysis_2,
                        n_con: n_con_2,
                        total_p_con: total_p_con_2,
                        p_con: p_con_2,
                        k_con: k_con_2,
                        ec: ec_2,
                        org_matter: org_matter_2,
                        n_dl: n_dl_2,
                        total_p_dl: total_p_dl_2,
                        p_dl: p_dl_2,
                        k_dl: k_dl_2,
                        ec_dl: ec_dl_2,
                        org_matter_dl: org_matter_dl_2
                    }
                    Promise.all([
                        lazyGet('field_crop_app_soil_analysis', { fieldID: field.pk, sample_date: sample_date_0, sample_desc: sample_desc_0 }, sampleData0, dairy_id),
                        lazyGet('field_crop_app_soil_analysis', { fieldID: field.pk, sample_date: sample_date_1, sample_desc: sample_desc_1 }, sampleData1, dairy_id),
                        lazyGet('field_crop_app_soil_analysis', { fieldID: field.pk, sample_date: sample_date_2, sample_desc: sample_desc_2 }, sampleData2, dairy_id),
                    ])
                        .then(([analysis0, analysis1, analysis2]) => {
                            if (!analysis0 || !analysis2 || !analysis2) {
                                reject({ error: 'Analyses not found' })
                                return
                            }

                            db.insertFieldCropApplicationSoil(
                                [
                                    dairy_id,
                                    field_crop_app.pk,
                                    src_desc,
                                    analysis0.pk,
                                    analysis1.pk,
                                    analysis2.pk
                                ],
                                (err, result) => {

                                    if (!err) {
                                        if (result.rows[0] ?? false) {
                                            resolve(result.rows[0])

                                        } else {
                                            reject({ error: "Insert field_crop_app_soil unsuccessful" });
                                        }

                                    } else if (err.code === '23505') {
                                        resolve(null)
                                    } else {
                                        logger.info('Insert soil error', err)
                                        reject({ error: "Insert field_crop_app_soil unsuccessful" });
                                    }
                                }
                            )
                        })
                        .catch(err => {
                            logger.info("Get all fca_soil_analysis", err)
                            reject(err)
                        })
                })
                .catch(err => {
                    logger.info('Lazy get field for fca_soil_analysis error:', err)
                    reject(err)
                })
        })
    }

    static #createPlowdownCreditApplicationFromMap(row, field_crop_app, dairy_id) {

        const fieldTitle = row['Field']
        const acres = row['Total Acres']
        const cropable = row['Cropable']


        const src_desc = row['Source Description']
        const n_lbs_acre = row['N lbs/ acre']
        const p_lbs_acre = row['P lbs/ acre']
        const k_lbs_acre = row['K lbs/ acre']
        const salt_lbs_acre = row['Salt lbs/ acre']

        let fieldData = {
            title: fieldTitle,
            cropable: cropable,
            acres: acres,
            dairy_id: dairy_id
        }

        return new Promise((resolve, reject) => {
            lazyGet('fields', [fieldTitle], fieldData, dairy_id)
                .then((field) => {
                    if (!field) {
                        reject({ error: 'Field not found for plowdown credit' })
                        return
                    }

                    db.insertFieldCropApplicationPlowdownCredit(
                        [
                            dairy_id,
                            field_crop_app.pk,
                            src_desc,
                            n_lbs_acre,
                            p_lbs_acre,
                            k_lbs_acre,
                            salt_lbs_acre
                        ],
                        (err, result) => {
                            if (!err) {
                                if (result.rows[0] ?? false) {
                                    resolve(result.rows[0])
                                } else {
                                    reject({ error: "Insert field_crop_app_plowdown unsuccessful" });
                                }
                            } else if (err.code === '23505') {
                                resolve(null)
                            } else if (err.code === '1000') {
                                rej({ error: err.msg })
                            } else {
                                logger.info('Insert plowdown error', err)
                                reject({ error: "Insert field_crop_app_plowdown unsuccessful" });
                            }
                        })
                })
                .catch(err => {
                    logger.info('Lazy get field for fields error:', err)
                    reject(err)
                })
        })
    }


    // Exports

    //      Manure Export 
    static createDataFromManureExportTSVListRowMap(row, i, dairy_id) {
        return new Promise((resolve, reject) => {

            const last_date_hauled = row["Date"]

            const amount_hauled_method = row["Method Used to Determine Amount Hauled"]
            const reporting_method = row['Reporting Method']
            const material_type = row["Material Type"]
            const amount_hauled = row["Amount (Tons)"]
            const moisture = row["% Moisture"]
            const n_con_mg_kg = row["% N"]
            const p_con_mg_kg = row["% P"]
            const k_con_mg_kg = row["% K"]
            const tfs = row["% TFS"]


            this.#lazyGetExportDestFromMap(row, dairy_id)
                .then(dest_res => {
                    if (!dest_res) {
                        reject({ error: "Export destination not found" })
                        return
                    }
                    const [operatorObj, contactObj, haulerObj, destObj] = dest_res
                    db.insertExportManifest(
                        [

                            dairy_id,
                            operatorObj.pk,
                            contactObj.pk,
                            haulerObj.pk,
                            destObj.pk,
                            last_date_hauled,
                            toFloat(amount_hauled),
                            material_type,
                            amount_hauled_method,

                            reporting_method,
                            toFloat(moisture),
                            toFloat(n_con_mg_kg),
                            toFloat(p_con_mg_kg),
                            toFloat(k_con_mg_kg),

                            toFloat(tfs),
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                        ],
                        (err, result) => {

                            if (!err) {
                                if (result.rows[0] ?? false) {
                                    resolve(result.rows[0])

                                } else {
                                    reject({ error: "Insert export_manure_manifest unsuccessful" });
                                }

                            } else if (err.code === '23505') {
                                resolve(null)
                            } else if (err.code === '1000') {
                                reject({ error: err.msg })
                            } else {
                                logger.info('Insert export_manure_manifest error', err)
                                reject({ error: "Insert export_manure_manifest unsuccessful" });
                            }
                        }
                    )


                })
                .catch(err => {
                    logger.info(err)
                    reject(err)
                })
        })
    }

    //      Wastewater Export
    static createDataFromWastewaterExportTSVListRowMap(row, i, dairy_id) {
        return new Promise((resolve, reject) => {

            // TODO() Need to add to schema, hrs_ran, gals_min and source description.
            // The calculation for total N,P,K is (hrs_ran * gals_min * 60) * (***_con_mg_l*0.008345)*(amount_hauled/1000)
            const last_date_hauled = row["Date"]
            const amount_hauled_method = row["Method Used to Determine Amount Hauled"]
            const material_type = row["Material Type"]
            const hrs_ran = row["Hours"]
            const gals_min = row["GPM"]
            const amount_hauled = row["Amount (Gals)"]
            const src_desc = row["Source Description"]
            const n_con_mg_l = row["N (PPM)"]
            const nh4_con_mg_l = row["NH4-N (mg/L)"]
            const nh3_con_mg_l = row["NH3-N (mg/L)"]
            const no3_con_mg_l = row["NO3-N (mg/L)"]
            const p_con_mg_l = row["P (PPM)"]
            const k_con_mg_l = row["K (PPM)"]
            const ec_umhos_cm = row["EC (umhos/cm)"]
            const tds = row["TDS (mg/L)"]


            this.#lazyGetExportDestFromMap(row, dairy_id)
                .then(dest_res => {
                    const [operatorObj, contactObj, haulerObj, destObj] = dest_res
                    db.insertExportManifest(
                        [
                            dairy_id,
                            operatorObj.pk,
                            contactObj.pk,
                            haulerObj.pk,
                            destObj.pk,
                            last_date_hauled,
                            toFloat(amount_hauled),
                            material_type,
                            amount_hauled_method,
                            '',
                            0,
                            0,
                            0,
                            0,
                            0,
                            n_con_mg_l, // n_con_mg_l, 
                            nh4_con_mg_l, // nh4_con_mg_l,
                            nh3_con_mg_l, // nh3_con_mg_l,
                            no3_con_mg_l, // no3_con_mg_l,
                            p_con_mg_l, // p_con_mg_l,
                            k_con_mg_l, // k_con_mg_l,
                            ec_umhos_cm, // ec_umhos_cm,
                            tds, // tds,
                        ],
                        (err, result) => {
                            if (!err) {
                                if (result.rows[0] ?? false) {
                                    resolve(result.rows[0])

                                } else {
                                    reject({ error: "Insert export_ww_manifest unsuccessful" });
                                }

                            } else if (err.code === '23505') {
                                resolve(null)
                            } else if (err.code === '1000') {
                                reject({ error: err.msg })
                            } else {
                                logger.info('Insert export_ww_manifest error', err)
                                reject({ error: "Insert export_ww_manifest unsuccessful" });
                            }
                        }
                    )
                })
                .catch(err => {
                    logger.info(err)
                    reject(err)
                })
        })


    }


    static #lazyGetExportDestFromMap(row, dairy_id) {
        let promises = []
        const checkAny = (val) => {
            // If the value is empty replace with asterisk.
            // pnumber may be empty but is required to search with when looking for  destinations
            return val ? val : "*"
        }

        const op_title = row["Operator Name"]
        const op_primary_phone = row["Operator Phone"]
        const op_secondary_phone = row["Operator 2nd Phone"]
        const op_street = row["Operator Street"]
        const op_city = row["Operator City"]
        const op_city_state = row["Operator State"]
        const op_city_zip = row["Operator Zip"]
        const op_is_owner = row["Operator Is Owner"]
        const op_is_operator = row["Operator Is Operator"]
        const op_is_responsible = row["Operator Responsible for Fees"]
        const contact_first_name = row["Contact First"]
        const contact_primary_phone = row["Contact Phone"]
        const hauler_title = row["Hauler"]
        const hauler_first_name = row["Hauler First"]
        const hauler_primary_phone = row["Hauler Phone"]
        const hauler_street = row["Hauler Street"]
        const hauler_cross_street = row["Hauler Cross Street"]
        const hauler_county = row["Hauler County"]
        const hauler_city = row["Hauler City"]
        const hauler_city_state = row["Hauler State"]
        const hauler_city_zip = row["Hauler Zip"]
        const recipient_title = row["Recipient"]
        const dest_type = row["Destination Type"]
        const recipient_primary_phone = row["Recipient Phone"]
        const recipient_street = row["Recipient Street"]
        const recipient_cross_street = row["Recipient Cross Street"]
        const recipient_county = row["Recipient County"]
        const recipient_city = row["Recipient City"]
        const recipient_city_state = row["Recipient State"]
        const recipient_city_zip = row["Recipient Zip"]
        const pnumber = row["APN"]
        const dest_street = row["Destination Street"]
        const dest_cross_street = row["Destination Cross Street"]
        const dest_county = row["Destination County"]
        const dest_city = row["Destination City"]
        const dest_city_state = row["Destination State"]
        const dest_city_zip = row["Destination Zip"]


        // need ot create a search endpoint for evertyhting, operators, export_ *contact, *hauler, *recipient
        let opSearchURL = { op_title, op_primary_phone }
        let createOperatorData = {
            dairy_id: dairy_id,
            title: op_title,
            primary_phone: op_primary_phone,
            secondary_phone: op_secondary_phone,
            street: op_street,
            city: op_city,
            city_state: op_city_state,
            city_zip: op_city_zip,
            is_owner: op_is_owner,
            is_operator: op_is_operator,
            is_responsible: op_is_responsible
        }
        promises.push(lazyGet('operators', opSearchURL, createOperatorData, dairy_id))


        let contactSearchURL = { contact_first_name, contact_primary_phone }
        let createContactData = {
            dairy_id: dairy_id,
            first_name: contact_first_name,
            primary_phone: contact_primary_phone,
        }
        promises.push(lazyGet('export_contact', contactSearchURL, createContactData, dairy_id))

        let haulerSearchURL = { hauler_title, hauler_first_name, hauler_primary_phone, hauler_street, hauler_city_zip }
        let createHaulerData = {
            dairy_id: dairy_id,
            title: hauler_title,
            first_name: hauler_first_name,
            primary_phone: hauler_primary_phone,
            street: hauler_street,
            cross_street: hauler_cross_street,
            county: hauler_county,
            city: hauler_city,
            city_state: hauler_city_state,
            city_zip: hauler_city_zip,
        }
        promises.push(lazyGet('export_hauler', haulerSearchURL, createHaulerData, dairy_id))


        // /title, street, city_zip, primary_phone
        let recipientSearchURL = { recipient_title, recipient_street, recipient_city_zip, recipient_primary_phone }
        let createRecipientData = {
            dairy_id: dairy_id,
            title: recipient_title,
            dest_type: dest_type,
            primary_phone: recipient_primary_phone,
            street: recipient_street,
            cross_street: recipient_cross_street,
            county: recipient_county,
            city: recipient_city,
            city_state: recipient_city_state,
            city_zip: recipient_city_zip,
        }

        promises.push(lazyGet('export_recipient', recipientSearchURL, createRecipientData, dairy_id))

        return new Promise((resolve, reject) => {
            Promise.all(promises)
                .then(results => {
                    const operatorObj = results[0]
                    const contactObj = results[1]
                    const haulerObj = results[2]
                    const recipientObj = results[3]

                    // LazyGet export_dest
                    // export_recipient_id, pnumber, street, city_zip
                    // pnumber might be empty, which is valid, but will cause error in URL
                    let destSearchURL = { export_recipient_id: recipientObj.pk, pnumber: checkAny(pnumber), dest_street, dest_city_zip }

                    let createDestData = {
                        dairy_id: dairy_id,
                        export_recipient_id: recipientObj.pk,
                        pnumber: pnumber,
                        street: dest_street,
                        cross_street: dest_cross_street,
                        county: dest_county,
                        city: dest_city,
                        city_state: dest_city_state,
                        city_zip: dest_city_zip,
                    }
                    lazyGet('export_dest', destSearchURL, createDestData, dairy_id)
                        .then(export_dest_res => {
                            resolve([operatorObj, contactObj, haulerObj, export_dest_res])
                        })
                        .catch(err => {
                            logger.info(err)
                            reject(err)
                        })
                })
                .catch(err => {
                    logger.info(err)
                    reject(err)
                })

        })

    }
}

module.exports = (app) => {
    app.post(`/${api}/uploadXLSX/:dairy_id`, verifyToken, verifyUserFromCompanyByDairyID, async (req, res) => {
        try {
            const { dairy_id } = req.params
            console.log('Uploading XLSX')
            const uploader = new XLSXUpload(dairy_id)
            uploader.setWorkbook(req.body)
            const result = await uploader.uploadXLSX()
            logger.info(result)
            return res.json(result)

        } catch (e) {
            logger.info(e)
            return res.json({ error: e })
        }

        // const workbook = XLSX.read(req.body)
        // uploadXLSX(workbook, dairy_id)
        //     .then(result => {
        //         logger.info(result)
        //         res.json({ data: 'Success' })
        //     })
        //     .catch(err => {
        //         logger.info('Failure')
        //         logger.info(err)
        //         res.json(err)
        //     })

    })

    app.post(`/${api}/uploadTSV/:tsv_type/:uploadedFilename/:dairy_id`, verifyToken, verifyUserFromCompanyByDairyID, async (req, res) => {
        const { tsv_type, uploadedFilename, dairy_id } = req.params
        try {


            const uploader = new XLSXUpload(dairy_id)
            uploader.setUploadSheet(req.body, uploadedFilename, tsv_type)
            const result = await uploader.uploadTSVSheet()

            // const tsvText = await readTSV(req.body)
            // const result = uploadSheet(dairy_id, tsvText, tsv_type, uploadedFilename)
            return res.json({ data: result })
        } catch (e) {
            console.log("Error reading TSV text", e)
            return res.json({ err: `Error uploading TSV File.`, err: e.toString() })
        }
    })
}

module.exports.createHeaderMap = createHeaderMap
module.exports.SHEET_NAMES = SHEET_NAMES
module.exports.HARVEST = HARVEST
module.exports.PROCESS_WASTEWATER = PROCESS_WASTEWATER
module.exports.FRESHWATER = FRESHWATER
module.exports.SOLIDMANURE = SOLIDMANURE
module.exports.FERTILIZER = FERTILIZER
module.exports.SOIL = SOIL
module.exports.PLOWDOWN_CREDIT = PLOWDOWN_CREDIT
module.exports.DRAIN = DRAIN
module.exports.DISCHARGE = DISCHARGE
module.exports.MANURE = MANURE
module.exports.WASTEWATER = WASTEWATER
