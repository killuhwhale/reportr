const XLSX = require('xlsx')

const {
    harvestTemplate, wwTemplate, fwTemplate, smTemplate, cfTemplate, smExportTemplate,
    wwExportTemplate, soilTemplate, plowdownTemplate, tiledrainageTemplate, dischargeTemplate
} = require('./serverTsvTemplates')



const isTesting = false

const HARVEST = isTesting ? 'Test - Production Records' : 'Production Records'
const PROCESS_WASTEWATER = isTesting ? 'Test - WW Applications' : 'WW Applications'
const FRESHWATER = isTesting ? 'Test - FW Applications' : 'FW Applications'
const SOLIDMANURE = isTesting ? 'Test - SM Applications' : 'SM Applications'
const FERTILIZER = isTesting ? 'Test - Commercial Fertilizer' : 'Commercial Fertilizer'
const SOIL = isTesting ? 'Test - Soil Analyses' : 'Soil Analyses'
const PLOWDOWN_CREDIT = isTesting ? 'Test - Plowdown Credit' : 'Plowdown Credit'
const DRAIN = isTesting ? 'Test - Tile Drainage Systems' : 'Tile Drainage Systems'
const DISCHARGE = isTesting ? 'Test - Discharges' : 'Discharges'
const MANURE = isTesting ? 'Test - SM Exports' : 'SM Exports'
const WASTEWATER = isTesting ? 'Test - WW Exports' : 'WW Exports'


const api = 'tsv'


module.exports = (app) => {
    app.post(`/${api}/uploadXLSX/:dairy_id`, (req, res) => {
        const { file } = req.body
        const { dairy_id } = req.params
        const workbook = XLSX.read(req.body)
        uploadXLSX(workbook, dairy_id)

    })

}


const toFloat = (num) => {
    const float = num && typeof (num) === typeof ('') && num.length > 0 ? parseFloat(num.replaceAll(',', '')) : typeof (num) === typeof (0) || typeof (num) === typeof (0.0) ? num : 0

    if (isNaN(float)) {
        throw `${float} is not a number`
        // return 0.0001337
    }
    return float
}


const SHEET_NAMES = [
    HARVEST, PROCESS_WASTEWATER, FRESHWATER, SOLIDMANURE, FERTILIZER, SOIL, PLOWDOWN_CREDIT, DRAIN, DISCHARGE, MANURE, WASTEWATER,
]

const TSV_INFO = {
    [DISCHARGE]: {
        numCols: 10,
        tsvType: DISCHARGE,
        template: dischargeTemplate,
    },
    [DRAIN]: {
        numCols: 14,
        tsvType: DRAIN,
        template: tiledrainageTemplate,
    },
    [PLOWDOWN_CREDIT]: {
        numCols: 16,
        tsvType: PLOWDOWN_CREDIT,
        template: plowdownTemplate,
    },
    [SOIL]: {
        numCols: 57,
        tsvType: SOIL,
        template: soilTemplate,
    },
    [HARVEST]: {
        numCols: 26, // 32 columns in process_wastewater spreadsheet/ TSV
        tsvType: HARVEST,
        template: harvestTemplate,
    },
    [PROCESS_WASTEWATER]: {
        numCols: 54, // 32 columns in process_wastewater spreadsheet/ TSV
        tsvType: PROCESS_WASTEWATER,
        template: wwTemplate,
    },
    [FRESHWATER]: {
        numCols: 45,
        tsvType: FRESHWATER,
        template: fwTemplate,
    },
    [SOLIDMANURE]: {
        numCols: 42,
        tsvType: SOLIDMANURE,
        template: smTemplate,
    },
    [FERTILIZER]: {
        numCols: 27,
        tsvType: FERTILIZER,
        template: cfTemplate,
    },
    [MANURE]: { // exports
        numCols: 50,
        tsvType: MANURE,
        template: smExportTemplate,
    },
    [WASTEWATER]: { // exports
        numCols: 51,
        tsvType: WASTEWATER,
        template: wwExportTemplate,
    }
}


// For each post, the api with have the correct db fn call, just call the function where post is
const lazyGet = (endpoint, value, data, dairy_id) => {
    return new Promise((resolve, rej) => {
        // Get & return or create & return
        // Move all db calls from /search api here 


        // Switch on Endpoint
        // using correct db.get*, use hte values from value
        // if not found in get, create with db.insert* with data
        // Return once data is found.

    })
}

const readTSV = (file, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', callback);
    reader.readAsText(file)
}
/** Uploads TSV file to DB by dairy_id and TSV type
 *  Updates TSV text
 *  - Each Dairy per reporting year, will have a TSV file for Production Records(Harvests), Nutrient Applications, Imports/Exports
 */

const uploadTSVToDB = (uploadedFilename, tsvText, dairy_id, tsvType) => {
    const tsvData = {
        title: uploadedFilename,
        data: tsvText,
        tsvType: tsvType,
        dairy_id: dairy_id
    }
    return new Promise((res, rej) => {
        post(`${BASE_URL}/api/tsv/create`, tsvData)
            .then(result => {
                if (result.existsErr) {
                    post(`${BASE_URL}/api/tsv/update`, tsvData)
                        .then(result1 => {
                            res(result1)
                        })
                        .catch(err => {
                            console.log(err)
                            rej(err)
                        })
                } else {
                    res(result)
                }
            })
            .catch(err => {
                console.log(err)
                rej(err)
            })
    })
}
/**
 * where callback == (ev) => {
    const { result } = ev.target
    this.setState({ tsvText: result, uploadedFilename: file.name })
  }
 */

const createHeaderMap = (headerRow, indexAsKey = true) => {
    const header = {}
    const invalidChars = ['\b', '\f', '\n', '\r', '\t', '\v']
    headerRow.forEach((item, i) => {
        item = item.trim()
        if (item.length > 0 && invalidChars.indexOf(item) < 0) {
            if (indexAsKey) {
                header[i] = item
            } else {
                header[item] = i
            }
        }
    })
    return header
}
const mapsColToTemplate = (cols, headerMap, template) => {
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

const processTSVTextAsMap = (tsvText, tsvType) => {
    let lines = tsvText.split("\n")
    let started = false
    let rows = [] // Each row of the TSV file containing data as a Map 
    let headerMap = {} // Maps column index to a String that is the header for that column e.g. '0': "Application Date"
    const template = TSV_INFO[tsvType].template

    lines.forEach((line, i) => {
        let cols = line.split("\t")
        if (cols[0]) { // skips rows without info in col 0
            if (started && Object.keys(headerMap).length > 0) {
                rows.push(mapsColToTemplate(cols, headerMap, template))
            }
            else if (cols[0] == "Start") {  // waits until a row with the word "Start" is in the first col. The data will be on proceeding line
                started = true
                const headerRow = lines[i - 1].split("\t")
                headerMap = createHeaderMap(headerRow)
            }
        }
    })
    return rows
}



const createFieldSetFromMap = (rows) => {
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
            fields.push([title, acres, cropable])
            fieldSet.add(title)
        }
    })
    return fields
}

/**
 *  TSV files rely upon existing fields, crops, and field_crop entities to successfully create 
 *      field_crop_harvest, AND all nutrient applications where a field_crop_app will need to be created prior to
 *      creating a field_crop_app_process_wastewater, etc... fresh water, SM, and Commerial fetilizer(yet to be created.)
 * 
 */
const createFieldsFromTSV = (fields, dairy_id) => {
    // Helper to create all fields in spreadsheet since they are parents of everything else
    // There is an issue when multiple rows try to create a field and there is a race condition conflict.


    let promises = fields.map(field => {
        let data = {
            data: {
                dairy_id: dairy_id,
                title: field[0],
                acres: field[1],
                cropable: field[2]
            }
        }
        return new Promise((res, rej) => {
            post(`${BASE_URL}/api/fields/create`, data)
                .then(result => {
                    res(result)
                })
                .catch(error => {
                    console.log(error)
                    rej(error)
                })
        })
    })
    return Promise.all(promises)
}

/** Following three methods help create or find data for rows associated with nutrient applications.
 * 
 */
const prepareFieldCrop = (field_title, crop_title, cropable, acres, dairy_id) => {
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
            lazyGet('fields', field_title, fieldData, dairy_id),
            get(`${BASE_URL}/api/crops/${crop_title}`) // list of crops in DB are predefined based on spreadsheet. HARDCODED
        ])
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                rej(err)
            })
    })
}
const getFieldCropFromMap = (commonRowData, dairy_id, tsvType) => {
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

        prepareFieldCrop(field_title, crop_title, cropable, acres, dairy_id)
            .then(res => {
                let fieldObj = res[0][0]
                let cropObj = res[1][0]
                if (fieldObj) {
                    if (cropObj) {
                        const { typical_yield, moisture: typical_moisture, n: typical_n, p: typical_p, k: typical_k, salt } = cropObj
                        let field_crop_search_url = `${fieldObj.pk}/${cropObj.pk}/${encodeURIComponent(plant_date)}`
                        let field_crop_data = {
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



                        lazyGet('field_crop', field_crop_search_url, field_crop_data, dairy_id)
                            .then(field_crop_res => {
                                resolve(field_crop_res[0])
                            })
                            .catch(err => {
                                console.log(err)
                                reject(err)
                            })
                    } else {
                        console.log("Crop not valid.", crop_title)
                    }
                } else {
                    console.log("Field not valid.")
                }
            })
    })
}
const getFieldCropAppFromMap = (commonRowData, dairy_id, tsvType) => {
    const app_date = commonRowData['Application Date']
    const precip_before = commonRowData['Rain Day Prior to Event']
    const precip_during = commonRowData['Rain Day of Event']
    const precip_after = commonRowData['Rain Day After Event']
    const app_method = commonRowData['App Method']


    return new Promise((resolve, reject) => {
        getFieldCropFromMap(commonRowData, dairy_id, tsvType)
            .then(field_crop_res => {
                const field_crop_app_search_url = `${field_crop_res.pk}/${encodeURIComponent(app_date)}/${encodeURIComponent(app_method)}`
                const field_crop_app_data = {
                    dairy_id: dairy_id,
                    field_crop_id: field_crop_res.pk,
                    app_date: app_date,
                    app_method: app_method,
                    precip_before: precip_before,
                    precip_during: precip_during,
                    precip_after: precip_after,
                }

                lazyGet('field_crop_app', field_crop_app_search_url, field_crop_app_data, dairy_id)
                    .then((field_crop_app_res) => {
                        if (field_crop_app_res.error) {
                            console.log("Error", commonRowData)
                        } else {
                            resolve(field_crop_app_res[0])
                        }
                    })
            })
    })
}

// Handles upload of any sheet.
// TODO
/**
 * - 
 * 
 */
const onUploadXLSX = (dairy_id, tsvText, numCols, tsvType, uploadedFilename) => {
    const nutrientAppTypes = [PROCESS_WASTEWATER, FRESHWATER, SOLIDMANURE, FERTILIZER, SOIL, PLOWDOWN_CREDIT]
    let promise = null
    if (tsvType === MANURE || tsvType === WASTEWATER) {
        // return createDataFromManureExportTSVListRow(row, i, dairy_id)
        promise = uploadExportTSV(tsvText, tsvType, dairy_id)
    }
    if (tsvType === HARVEST) {
        promise = uploadHarvestTSV(tsvText, tsvType, dairy_id)
        // return createDataFromHarvestTSVListRow(row, i, dairy_id)
    }
    if (tsvType === DISCHARGE) {
        promise = uploadDischargeTSV(tsvText, tsvType, dairy_id)
    }
    if (tsvType === DRAIN) {
        promise = uploadTileDrainage(tsvText, tsvType, dairy_id)
    }
    if (nutrientAppTypes.indexOf(tsvType) >= 0) {
        promise = uploadNutrientApp(tsvText, tsvType, dairy_id)
    }

    return new Promise((resolve, reject) => {
        promise.then(res => {
            uploadTSVToDB(uploadedFilename, tsvText, dairy_id, tsvType)
                .then(res => {
                    resolve("Complete")
                })
                .catch(uploadTSVToDBErr => {
                    reject(uploadTSVToDBErr)
                })
        })
            .catch(err => {
                console.log("Error with all promises", err)
                reject(err)
            })
    })
}

const uploadXLSX = (workbook, dairy_id) => {
    const sheets = workbook && workbook.Sheets ? workbook.Sheets : null

    return new Promise((resolve, reject) => {
        if (!sheets) {
            reject("No sheets found.")
            return
        }

        // For Each Sheet, feed to onUploadXLSX
        let promises = []
        workbook.SheetNames.forEach(sheetName => {
            // const numCols = TSV_INFO[sheetName].numCols // todo sheetnames need to match the keys in TSV file 
            // const tsvType = TSV_INFO[sheetName].tsvType
            if (SHEET_NAMES.indexOf(sheetName) >= 0) {
                const numCols = TSV_INFO[sheetName].numCols
                const tsvType = TSV_INFO[sheetName].tsvType
                const tsvText = XLSX.utils.sheet_to_csv(sheets[sheetName], { FS: '\t' })
                promises.push(
                    onUploadXLSX(dairy_id, tsvText, numCols, tsvType, sheetName)
                )
            }
        })
        Promise.all(promises)
            .then((res) => {
                resolve(res)
            })
            .catch(err => {
                reject(err)
            })
    })
}

/** Creates field_crop_harvest by creating or finding the data for each row
 * // Typically creates teh field_crop
 */
const createDataFromHarvestTSVListRowMap = (row, i, dairy_id) => {

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
        data: {
            title: field_title,
            cropable: cropable,
            acres: acres,
            dairy_id: dairy_id
        }
    }

    return new Promise((resolve, rej) => {
        // Get Field and Crop
        Promise.all([
            lazyGet('fields', field_title, fieldData, dairy_id),
            get(`${BASE_URL}/api/crops/${crop_title}`) // list of crops in DB are predefined based on spreadsheet. HARDCODED
        ])
            .then(res => {
                let fieldObj = res[0][0] // res = [res1, res2], res1=[data]
                let cropObj = res[1][0]
                if (fieldObj) {
                    if (cropObj) {
                        const { typical_yield, moisture: typical_moisture, n: typical_n, p: typical_p, k: typical_k, salt } = cropObj
                        let field_crop_search_value = `${fieldObj.pk}/${cropObj.pk}/${encodeURIComponent(plant_date)}`
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

                        lazyGet('field_crop', field_crop_search_value, field_crop_data, dairy_id)
                            .then(field_crop_res => {
                                const fieldCropObj = field_crop_res[0]

                                const field_crop_harvest_data = {
                                    dairy_id: dairy_id,
                                    field_crop_id: fieldCropObj.pk,
                                    harvest_date,
                                    sample_date,
                                    src_of_analysis,
                                    method_of_reporting,
                                    expected_yield_tons_acre: checkEmpty(expected_yield_tons_acre),
                                    actual_yield: checkEmpty(actual_yield),
                                    moisture: checkEmpty(moisture),
                                    n: checkEmpty(n),
                                    p: checkEmpty(p),
                                    k: checkEmpty(k),
                                    tfs: checkEmpty(tfs),
                                    n_dl: checkEmpty(n_dl),
                                    p_dl: checkEmpty(p_dl),
                                    k_dl: checkEmpty(k_dl),
                                    tfs_dl: checkEmpty(tfs_dl),
                                }

                                resolve(post(`${BASE_URL}/api/field_crop_harvest/create`, field_crop_harvest_data))

                            })
                            .catch(field_crop_err => {
                                rej(field_crop_err)
                            })
                    } else {
                        rej(res)
                    }
                } else {
                    rej(res)
                }
            })
            .catch(err => {
                rej(err)
            })
    })

}

const checkEmpty = (val) => {
    // If value is empty, return 0 to avoid error in DB.
    return val.length > 0 ? val.replaceAll(',', '') : 0
}
/** Harvest
 * 
 * 
 */
const createHarvestTSVFromMap = (tsvText, tsvType, dairy_id) => {
    let rows = processTSVTextAsMap(tsvText, tsvType)
    // Create a set of fields to ensure duplicates are not attempted.
    let fields = createFieldSetFromMap(rows)

    return new Promise((resolve, reject) => {
        createFieldsFromTSV(fields)      // Create fields before proceeding
            .then(createFieldRes => {
                let result_promises = rows.map((row, i) => {
                    return createDataFromHarvestTSVListRowMap(row, i, dairy_id)    // Create entries for ea row in TSV file
                })

                Promise.all(result_promises)            // Execute promises to create field_crop && field_crop_harvet entries in the DB
                    .then(res => {
                        resolve(res)
                    })
                    .catch(err => {
                        console.log(err)
                        reject(err)
                    })
            })
            .catch(createFieldErr => {
                console.log(createFieldErr)
                reject(createFieldErr)
            })
    })
}
const uploadHarvestTSV = (tsvText, tsvType, dairy_id) => {
    // return createHarvestTSV(tsvText, tsvType, dairy_id)
    return createHarvestTSVFromMap(tsvText, tsvType, dairy_id)
}



/**
 *     Nutrient Applications
 */
/** Creates field_crop_app_process_wastewater(app event) && field_crop_app_process_wastewater_analysis
 * 
 * @param {*} row: List of all columns from TSV row.
 * @param {*} field_crop_app: Object from DB with current data from row.
 * @param {*} dairy_id: The primary key of the current dairy.
 * @returns The created field_crop_app_process_wastewater.
 */

const createProcessWastewaterApplicationFromMap = (row, field_crop_app, dairy_id) => {

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

    // dairy_id, sample_date, sample_desc
    const field_crop_app_process_wastewater_analysis_search_url = `${encodeURIComponent(sample_date)}/${encodeURIComponent(sample_desc)}`
    return new Promise((resolve, rej) => {
        // Need to lazyget process_wastewater_analysis
        lazyGet('field_crop_app_process_wastewater_analysis',
            field_crop_app_process_wastewater_analysis_search_url,
            process_wastewater_analysis_data,
            dairy_id
        )
            .then(res => {
                const process_wastewater_data = {
                    dairy_id: dairy_id,
                    field_crop_app_id: field_crop_app.pk,
                    field_crop_app_process_wastewater_analysis_id: res[0].pk,
                    app_desc,
                    amount_applied: amount_applied.replaceAll(',', ''),
                }
                resolve(post(`${BASE_URL}/api/field_crop_app_process_wastewater/create`, process_wastewater_data))
            })
            .catch(err => {
                console.log(err)
                rej(err)
            })
    })
}


const createFreshwaterApplicationFromMap = (row, field_crop_app, dairy_id) => {


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
    const field_crop_app_freshwater_source_search_url = `${encodeURIComponent(src_desc)}/${encodeURIComponent(src_type)}`
    const freshwater_source_data = {
        dairy_id: dairy_id,
        src_desc,
        src_type
    }

    // Get Source
    return new Promise((resolve, rej) => {
        // lazyget freshwater_source
        lazyGet('field_crop_app_freshwater_source', field_crop_app_freshwater_source_search_url, freshwater_source_data, dairy_id)
            .then(field_crop_app_freshwater_source_res => {
                if (field_crop_app_freshwater_source_res.length > 0) {
                    let fresh_water_source_obj = field_crop_app_freshwater_source_res[0]
                    let fresh_water_source_id = fresh_water_source_obj.pk


                    // lazyget freshwater_analysis , sample_date, sample_desc, src_of_analysis, fresh_water_source_id
                    const field_crop_app_freshwater_analysis_search_url = `${encodeURIComponent(sample_date)}/${encodeURIComponent(sample_desc)}/${src_of_analysis}/${fresh_water_source_id}`
                    const freshwater_analysis_data = {
                        dairy_id: dairy_id,
                        fresh_water_source_id: fresh_water_source_obj.pk,
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

                    lazyGet('field_crop_app_freshwater_analysis', field_crop_app_freshwater_analysis_search_url, freshwater_analysis_data, dairy_id)
                        .then(freshwater_analysis_res => {
                            let freshwater_analysis_obj = freshwater_analysis_res[0]
                            const freshwater_data = {
                                dairy_id: dairy_id,
                                field_crop_app_id: field_crop_app.pk,
                                field_crop_app_freshwater_analysis_id: freshwater_analysis_obj.pk,
                                app_rate: checkEmpty(app_rate),
                                run_time: checkEmpty(run_time),
                                amount_applied: checkEmpty(amount_applied),
                                amt_applied_per_acre: checkEmpty(amt_applied_per_acre)
                            }

                            resolve(post(`${BASE_URL}/api/field_crop_app_freshwater/create`, freshwater_data))
                        })

                } else {
                    console.log("Error with reading pk", row)
                }



            })
            .catch(err => {
                console.log(err)
                rej(err)
            })
    })


}


const createSolidmanureApplicationFromMap = (row, field_crop_app, dairy_id) => {

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
    const field_crop_app_solidmanure_analysis_search_url = `${encodeURIComponent(sample_date)}/${encodeURIComponent(sample_desc)}/${encodeURIComponent(src_of_analysis)}`
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
        lazyGet('field_crop_app_solidmanure_analysis', field_crop_app_solidmanure_analysis_search_url, solidmanure_analysis_data, dairy_id)
            .then(field_crop_app_solidmanure_analysis_res => {
                if (field_crop_app_solidmanure_analysis_res.length > 0) {
                    let solidmanure_analysis_obj = field_crop_app_solidmanure_analysis_res[0]
                    let solidmanure_analysis_id = solidmanure_analysis_obj.pk


                    const solidmanure_data = {
                        dairy_id: dairy_id,
                        field_crop_app_id: field_crop_app.pk,
                        field_crop_app_solidmanure_analysis_id: solidmanure_analysis_id,
                        src_desc,
                        amount_applied: checkEmpty(amount_applied),
                        amt_applied_per_acre: checkEmpty(amt_applied_per_acre),
                    }

                    resolve(post(`${BASE_URL}/api/field_crop_app_solidmanure/create`, solidmanure_data))

                } else {
                    console.log("Error with reading pk for solidmanure analysis", row)
                }



            })
            .catch(err => {
                console.log(err)
                rej(err)
            })
    })


}


const createFertilizerApplicationFromMap = (row, field_crop_app, dairy_id) => {
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
    const field_crop_app_nutrient_import_search_url = `${encodeURIComponent(import_date)}/${encodeURIComponent(material_type)}/${encodeURIComponent(import_desc)}`
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

    // Get Source
    return new Promise((resolve, rej) => {
        // lazyget freshwater_source
        // Server version, instead of lazyGet, try to get and then if emty, insert
        lazyGet('nutrient_import', field_crop_app_nutrient_import_search_url, nutrient_import_data, dairy_id)
            .then(nutrient_import_res => {
                if (nutrient_import_res.length > 0) {
                    let nutrient_import_obj = nutrient_import_res[0]
                    let nutrient_import_id = nutrient_import_obj.pk

                    const fertilizer_data = {
                        dairy_id: dairy_id,
                        field_crop_app_id: field_crop_app.pk,
                        nutrient_import_id: nutrient_import_id,
                        amount_applied: checkEmpty(amt_applied_per_acre),
                    }

                    resolve(post(`${BASE_URL}/api/field_crop_app_fertilizer/create`, fertilizer_data))

                } else {
                    console.log("Error with reading pk for nutrient import", row)
                }
            })
            .catch(err => {
                console.log(err)
                rej(err)
            })
    })
}

const createSoilApplicationFromMap = (row, field_crop_app, dairy_id) => {


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
        data: {
            title: fieldTitle,
            cropable,
            acres,
            dairy_id: dairy_id
        }
    }

    return new Promise((resolve, reject) => {
        lazyGet('fields', fieldTitle, fieldData, dairy_id)
            .then(([field]) => {

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
                    lazyGet('field_crop_app_soil_analysis', `${encodeURIComponent(field.pk)}/${encodeURIComponent(sample_date_0)}/${encodeURIComponent(sample_desc_0)}`, sampleData0, dairy_id),
                    lazyGet('field_crop_app_soil_analysis', `${encodeURIComponent(field.pk)}/${encodeURIComponent(sample_date_1)}/${encodeURIComponent(sample_desc_1)}`, sampleData1, dairy_id),
                    lazyGet('field_crop_app_soil_analysis', `${encodeURIComponent(field.pk)}/${encodeURIComponent(sample_date_2)}/${encodeURIComponent(sample_desc_2)}`, sampleData2, dairy_id),
                ])
                    .then(([[analysis0], [analysis1], [analysis2]]) => {
                        const fca_soil_data = {
                            dairy_id: dairy_id,
                            field_crop_app_id: field_crop_app.pk,
                            src_desc,
                            analysis_one: analysis0.pk,
                            analysis_two: analysis1.pk,
                            analysis_three: analysis2.pk
                        }
                        post(`${BASE_URL}/api/field_crop_app_soil/create`, fca_soil_data)
                            .then(res => {
                                resolve(res)
                            })
                            .catch(err => {
                                console.log(err)
                                reject(err)
                            })
                    })
                    .catch(err => {
                        console.log("Get all fca_soil_analysis", err)
                        reject(err)
                    })
            })
            .catch(err => {
                console.log('Lazy get field for fca_soil_analysis error:', err)
                reject(err)
            })
    })
}


const createPlowdownCreditApplicationFromMap = (row, field_crop_app, dairy_id) => {

    const fieldTitle = row['Field']
    const acres = row['Total Acres']
    const cropable = row['Cropable']


    const src_desc = row['Source Description']
    const n_lbs_acre = row['N lbs/ acre']
    const p_lbs_acre = row['P lbs/ acre']
    const k_lbs_acre = row['K lbs/ acre']
    const salt_lbs_acre = row['Salt lbs/ acre']

    let fieldData = {
        data: {
            title: fieldTitle,
            cropable: cropable,
            acres: acres,
            dairy_id: dairy_id
        }
    }

    return new Promise((resolve, reject) => {
        lazyGet('fields', fieldTitle, fieldData, dairy_id)
            .then(([field]) => {
                const fca_plowdown_credit_data = {
                    dairy_id: dairy_id,
                    field_crop_app_id: field_crop_app.pk,
                    src_desc,
                    n_lbs_acre,
                    p_lbs_acre,
                    k_lbs_acre,
                    salt_lbs_acre
                }
                post(`${BASE_URL}/api/field_crop_app_plowdown_credit/create`, fca_plowdown_credit_data)
                    .then(res => {
                        resolve(res)
                    })
                    .catch(err => {
                        console.log(err)
                        reject(err)
                    })

            })
            .catch(err => {
                console.log('Lazy get field for fields error:', err)
                reject(err)
            })
    })
}

/** Nutrient applications
 *  These have very common columns and is at the same level i.e. they require fields & crops to be made.
 * 
 * @param {*} row: The row from the TSV contianing data
 * @param {*} i : index of row
 * @param {*} dairy_id: The current dairys pk in the dairy table.
 * @param {*} table: The specific nutrient application table that the data will be stored in
 *    - Options: ['process_wastewater', 'fresh_water', 'solid_manure', 'commerical_fertilizer']
 *    - This will call a function insert the data after the neccessary data is created.
 *        - Neccessary data: fields, field_crop, field_crop_app 
 * 
 * @returns a promise that the resolves with the final  created DB entry or rejects w/ an error.
 */
const createDataFromTSVListRowMap = (row, i, dairy_id, tsvType) => {
    /**
    * 
    *  For all TSV sheets, the data relies on a Field, Field_crop, Field_crop_app. 
    *  This part will lazily create everything based on the first 7 entries on the sheet.
    */
    return new Promise((resolve, rej) => {
        getFieldCropAppFromMap(row, dairy_id, tsvType)
            .then(field_crop_app => {

                /**
                 * #######################################################################
                 *  Create any nutrient applications here....
                 *  fieldObj
                 *  cropObj
                 *  field_cropObj
                 *  field_crop_appObj
                 * #######################################################################
                 */


                if (tsvType === PROCESS_WASTEWATER) {
                    // resolve(createProcessWastewaterApplication(row, field_crop_app, dairy_id)) // Creates analysis and application_event
                    resolve(createProcessWastewaterApplicationFromMap(row, field_crop_app, dairy_id)) // Creates analysis and application_event

                } else if (tsvType === FRESHWATER) {
                    // Creates source, analysis and event
                    // resolve(createFreshwaterApplication(row, field_crop_app, dairy_id))
                    resolve(createFreshwaterApplicationFromMap(row, field_crop_app, dairy_id))
                } else if (tsvType === SOLIDMANURE) {
                    // Creates source, analysis and event
                    // resolve(createSolidmanureApplication(row, field_crop_app, dairy_id))
                    resolve(createSolidmanureApplicationFromMap(row, field_crop_app, dairy_id))
                }
                else if (tsvType === FERTILIZER) {
                    // Creates Nutrient Import, Fertilizer
                    // resolve(createFertilizerApplication(row, field_crop_app, dairy_id))
                    resolve(createFertilizerApplicationFromMap(row, field_crop_app, dairy_id))
                }
                else if (tsvType === SOIL) {
                    // Creates Nutrient Import, Fertilizer
                    // resolve(createSoilApplication(row, field_crop_app, dairy_id))
                    resolve(createSoilApplicationFromMap(row, field_crop_app, dairy_id))
                } else if (tsvType === PLOWDOWN_CREDIT) {
                    // Creates Nutrient Import, Fertilizer
                    // resolve(createPlowdownCreditApplication(row, field_crop_app, dairy_id))
                    resolve(createPlowdownCreditApplicationFromMap(row, field_crop_app, dairy_id))
                }

            })
            .catch(field_crop_app_err => {
                console.log(field_crop_app_err)
            })

    })
}


// Handles an upload of tsv data for a nutrient application
// Entry point for single upload of nutrient app
const uploadNutrientApp = (tsvText, tsvType, dairy_id) => {
    let rows = processTSVTextAsMap(tsvText, tsvType)

    // Create a set of fields to ensure duplicates are not attempted.
    let fields = createFieldSetFromMap(rows)


    return new Promise((resolve, reject) => {
        createFieldsFromTSV(fields, dairy_id)      // Create fields before proceeding
            .then(createFieldRes => {

                let promises = rows.map((row, i) => {
                    // return createDataFromTSVListRow(row, i, dairy_id, tsvType)    // Create entries for ea row in TSV file
                    return createDataFromTSVListRowMap(row, i, dairy_id, tsvType)
                })
                Promise.all(promises)
                    .then((res) => {
                        resolve(res)
                    })
                    .catch(err => {
                        console.log(err)
                        reject(err)
                    })
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })

}

/**
 *     Exports
 */
const _lazyGetExportDestFromMap = (row, dairy_id) => {
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
    let opSearchURL = `${op_title}/${op_primary_phone}`
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
        is_responsible: op_is_responsible
    }
    promises.push(lazyGet('operators', opSearchURL, createOperatorData, dairy_id))


    let contactSearchURL = `${contact_first_name}/${contact_primary_phone}`
    let createContactData = {
        dairy_id: dairy_id,
        first_name: contact_first_name,
        primary_phone: contact_primary_phone,
    }
    promises.push(lazyGet('export_contact', contactSearchURL, createContactData, dairy_id))

    let haulerSearchURL = `${hauler_title}/${hauler_first_name}/${hauler_primary_phone}/${hauler_street}/${hauler_city_zip}`
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
    let recipientSearchURL = `${recipient_title}/${recipient_street}/${recipient_city_zip}/${recipient_primary_phone}`
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
                const operatorObj = results[0][0]
                const contactObj = results[1][0]
                const haulerObj = results[2][0]
                const recipientObj = results[3][0]

                // LazyGet export_dest
                // export_recipient_id, pnumber, street, city_zip
                // pnumber might be empty, which is valid, but will cause error in URL
                let destSearchURL = `${encodeURIComponent(recipientObj.pk)}/${encodeURIComponent(checkAny(pnumber))}/${encodeURIComponent(dest_street)}/${encodeURIComponent(dest_city_zip)}`

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
                        resolve([operatorObj, contactObj, haulerObj, export_dest_res[0]])
                    })
                    .catch(err => {
                        console.log(err)
                        reject(err)
                    })
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })

    })

}


const createDataFromManureExportTSVListRowMap = (row, i, dairy_id) => {
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


        _lazyGetExportDestFromMap(row, dairy_id)
            .then(dest_res => {
                const [operatorObj, contactObj, haulerObj, destObj] = dest_res

                let createManifestObj = {
                    dairy_id: dairy_id,
                    export_dest_id: destObj.pk,
                    operator_id: operatorObj.pk,
                    export_contact_id: contactObj.pk,
                    export_hauler_id: haulerObj.pk,
                    last_date_hauled,
                    amount_hauled_method,
                    reporting_method,
                    material_type,
                    amount_hauled: parseInt(checkEmpty(amount_hauled)),


                    moisture: checkEmpty(moisture),
                    n_con_mg_kg: checkEmpty(n_con_mg_kg),
                    p_con_mg_kg: checkEmpty(p_con_mg_kg),
                    k_con_mg_kg: checkEmpty(k_con_mg_kg),

                    tfs: checkEmpty(tfs),


                    n_lbs_rm: 1337,
                    p_lbs_rm: 1337,
                    k_lbs_rm: 1337,
                    salt_lbs_rm: 1337,

                }
                resolve(post(`${BASE_URL}/api/export_manifest/create`, createManifestObj))
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
}



const createDataFromWastewaterExportTSVListRowMap = (row, i, dairy_id) => {
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
        const p_con_mg_l = row["P (PPM)"]
        const k_con_mg_l = row["K (PPM)"]
        const ec_umhos_cm = row["EC (umhos/cm)"]
        const tds = row["TDS (mg/L)"]


        _lazyGetExportDestFromMap(row, dairy_id)
            .then(dest_res => {
                const [operatorObj, contactObj, haulerObj, destObj] = dest_res
                let createManifestObj = {
                    dairy_id: dairy_id,
                    export_dest_id: destObj.pk,
                    operator_id: operatorObj.pk,
                    export_contact_id: contactObj.pk,
                    export_hauler_id: haulerObj.pk,
                    last_date_hauled,
                    amount_hauled_method,

                    material_type,
                    amount_hauled: parseInt(checkEmpty(amount_hauled)),

                    n_con_mg_l: checkEmpty(n_con_mg_l),
                    p_con_mg_l: checkEmpty(p_con_mg_l),
                    k_con_mg_l: checkEmpty(k_con_mg_l),
                    ec_umhos_cm: checkEmpty(ec_umhos_cm),
                    tds: checkEmpty(tds),


                    n_lbs_rm: 1337,
                    p_lbs_rm: 1337,
                    k_lbs_rm: 1337,

                }
                resolve(post(`${BASE_URL}/api/export_manifest/create`, createManifestObj))
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })


}


const uploadExportTSV = (tsvText, tsvType, dairy_id) => {
    let numCols = TSV_INFO[tsvType].numCols
    let rows = processTSVTextAsMap(tsvText, tsvType)


    let promises = rows.map((row, i) => {
        if (tsvType == WASTEWATER) {
            // return createDataFromWastewaterExportTSVListRow(row, i, dairy_id)
            return createDataFromWastewaterExportTSVListRowMap(row, i, dairy_id)
        }
        if (tsvType === MANURE) {
            // return createDataFromManureExportTSVListRow(row, i, dairy_id)
            return createDataFromManureExportTSVListRowMap(row, i, dairy_id)
        }
    })

    return new Promise((resolve, reject) => {
        Promise.all(promises)
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })

}



/** Tile Drainage
 * 
 */
const createTileDrainageFromMap = (tsvText, tsvType, dairy_id) => {
    let rows = processTSVTextAsMap(tsvText, tsvType) // extract rows from Text of tsv file TODO()

    let result_promises = rows.map((row, i) => {

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
            dairy_id: dairy_id,
            src_desc
        }

        return new Promise((resolve, reject) => {
            lazyGet('drain_source', encodeURIComponent(src_desc), drainSourceData, dairy_id)
                .then(([drainSource]) => {
                    const drainAnalysisData = {
                        dairy_id: dairy_id,
                        drain_source_id: drainSource.pk,
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
                    }
                    resolve(post(`${BASE_URL}/api/drain_analysis/create`, drainAnalysisData))
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    })

    return new Promise((resolve, reject) => {
        Promise.all(result_promises)
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
}
const uploadTileDrainage = (tsvText, tsvType, dairy_id) => {

    // return createTileDrainage(tsvText, tsvType, dairy_id)
    return createTileDrainageFromMap(tsvText, tsvType, dairy_id)
}


/** Discharge
 * 
 */


const ceateDischargeTSVFromMap = (tsvText, tsvType, dairy_id) => {
    let rows = processTSVTextAsMap(tsvText, tsvType) // extract rows from Text of tsv file TODO()

    let result_promises = rows.map((row, i) => {

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


        let dischargeData = {
            dairy_id: dairy_id,
            discharge_type,
            discharge_datetime,
            discharge_loc,
            vol: toFloat(checkEmpty(vol)),
            vol_unit,
            duration_of_discharge: toFloat(checkEmpty(duration_of_discharge)),
            discharge_src,
            method_of_measuring,
            sample_location_reason,
            ref_number
        }

        return post(`${BASE_URL}/api/discharge/create`, dischargeData)
    })

    return new Promise((resolve, reject) => {
        Promise.all(result_promises)
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
}
const uploadDischargeTSV = (tsvText, tsvType, dairy_id) => {

    // return ceateDischargeTSVFromMap(tsvText, tsvType, dairy_id)
    return ceateDischargeTSVFromMap(tsvText, tsvType, dairy_id)
}
