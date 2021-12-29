import { get, post } from './requests'
import { toFloat } from './convertCalc'
import { BASE_URL } from "./environment"

export default function mTea() { }

const isTesting = true

export const HARVEST = isTesting ? 'Test - Production Records' : 'Production Records'
export const PROCESS_WASTEWATER = isTesting ? 'Test - WW Applications' : 'WW Applications'
export const FRESHWATER = isTesting ? 'Test - FW Applications' : 'FW Applications'
export const SOLIDMANURE = isTesting ? 'Test - SM Applications' : 'SM Applications'
export const FERTILIZER = isTesting ? 'Test - Commercial Fertilizer' : 'Commercial Fertilizer'
export const SOIL = isTesting ? 'Test - Soil Analyses' : 'Soil Analyses'
export const PLOWDOWN_CREDIT = isTesting ? 'Test - Plowdown Credit' : 'Plowdown Credit'
export const DRAIN = isTesting ? 'Test - Tile Drainage Systems' : 'Tile Drainage Systems'
export const DISCHARGE = isTesting ? 'Test - Discharge' : 'Discharge'
export const MANURE = isTesting ? 'Test - SM Exports' : 'SM Exports'
export const WASTEWATER = isTesting ? 'Test - WW Exports' : 'WW Exports'

export const SHEET_NAMES = [
  HARVEST, PROCESS_WASTEWATER, FRESHWATER, SOLIDMANURE, FERTILIZER, SOIL, PLOWDOWN_CREDIT, DRAIN, DISCHARGE, MANURE, WASTEWATER,
]


export const TSV_INFO = {
  [DISCHARGE]: {
    numCols: 10,
    tsvType: DISCHARGE
  },
  [DRAIN]: {
    numCols: 14,
    tsvType: DRAIN
  },
  [PLOWDOWN_CREDIT]: {
    numCols: 16,
    tsvType: PLOWDOWN_CREDIT
  },
  [SOIL]: {
    numCols: 57,
    tsvType: SOIL
  },
  [HARVEST]: {
    numCols: 26, // 32 columns in process_wastewater spreadsheet/ TSV
    tsvType: HARVEST
  },
  [PROCESS_WASTEWATER]: {
    numCols: 54, // 32 columns in process_wastewater spreadsheet/ TSV
    tsvType: PROCESS_WASTEWATER
  },
  [FRESHWATER]: {
    numCols: 45,
    tsvType: FRESHWATER
  },
  [SOLIDMANURE]: {
    numCols: 42,
    tsvType: SOLIDMANURE
  },
  [FERTILIZER]: {
    numCols: 27,
    tsvType: FERTILIZER
  },
  [MANURE]: { // exports
    numCols: 50,
    tsvType: MANURE
  },
  [WASTEWATER]: { // exports
    numCols: 51,
    tsvType: WASTEWATER
  }
}

export const lazyGet = (endpoint, value, data, dairy_pk) => {
  return new Promise((resolve, rej) => {
    get(`${BASE_URL}/api/search/${endpoint}/${value}/${dairy_pk}`)
      .then(res => {
        // If not found, Attempt to create
        if (Object.keys(res).length == 0) {
          post(`${BASE_URL}/api/${endpoint}/create`, data)
            .then(result => {
              // console.log("Created from lazyget: ", result)

              // If there is an error response from server.
              if (result.test) {

                // console.log("Create failed, race conditon happened. Attempting to re-fetch")
                get(`${BASE_URL}/api/search/${endpoint}/${value}/${dairy_pk}`)
                  .then(secondResult => {
                    // console.log("Found entry after failing to create entry", secondResult)
                    if (secondResult.length == 0) {
                      // console.log(endpoint, value, data)
                    }
                    // Found entry, on second attempt.
                    resolve(secondResult)
                  })
              } else {
                // Created entry, returning result
                resolve(result)
              }
            })
            .catch(error => {
              console.log(error)
              rej(error)
            })
        } else {
          // Found entry, returning result
          resolve(res)
        }
      })
      .catch(err => {
        rej(err)
      })
  })
}
export const readTSV = (file, callback) => {
  const reader = new FileReader()
  reader.addEventListener('load', callback);
  reader.readAsText(file)
}
/** Uploads TSV file to DB by dairy_id and TSV type
 *  Updates TSV text
 *  - Each Dairy per reporting year, will have a TSV file for Production Records(Harvests), Nutrient Applications, Imports/Exports
 */

export const uploadTSVToDB = (uploadedFilename, tsvText, dairy_id, tsvType) => {
  // console.log("Uploading TSV to DB", uploadedFilename, tsvText)
  const tsvData = {
    title: uploadedFilename,
    data: tsvText,
    tsvType: tsvType,
    dairy_id: dairy_id
  }
  return new Promise((res, rej) => {
    post(`${BASE_URL}/api/tsv/create`, tsvData)
      .then(result => {
        console.log("Result from first attempt: ", result)
        if (result.existsErr) {
          console.log("TSV ALREADY EXISTS, TRYING AN UPDATE")

          post(`${BASE_URL}/api/tsv/update`, tsvData)
            .then(result1 => {
              console.log("Updated: ", result1)
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
    this.setState({ csvText: result, uploadedFilename: file.name })
  }
 */

export const processTSVText = (csvText, numCols) => {
  // console.log("Processing CSV Text", csvText, numCols)
  // Field,Acres,Crop,Plant Date,Harvest Dates,Expected Yield Tons/Acre,Actual Yield Tons/Acre,Actual Yield Total Tons,Reporting Method,% Moisture,% N,% P,% K,% TFS    Salt  (Dry Basis),Lbs/Acre N,Lbs/Acre P,Lbs/Acre K,Lbs/Acre Salt
  let lines = csvText.split("\n")
  let started = false
  let rows = []
  lines.forEach((line, i) => {
    let cols = line.split("\t").slice(0, numCols)
    if (cols[0]) { // skips rows without info in col 0
      if (started) {
        rows.push(cols)
      }
      else if (cols[0] == "Start") {  // waits until a row with the word "Start" is in the first col. The data will be on proceeding line
        started = true
      }
    }
  })
  // console.log(rows)
  return rows
}
export const createFieldSet = (rows) => {
  /**
   * Returns list of list where each list is [title, acres, planted] the minimum required info
   */

  let fields = []
  let fieldSet = new Set()
  // Create a set of fields to ensure duplicates are not attempted.
  rows.forEach(row => {
    const [
      app_date, field_title, acres_planted, cropable, acres
    ] = row.slice(0, 5)
    if (!fieldSet.has(field_title)) {
      fields.push([field_title, acres, cropable])
      fieldSet.add(field_title)
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
export const createFieldsFromTSV = (fields, dairy_pk) => {
  // Helper to create all fields in spreadsheet since they are parents of everything else
  // There is an issue when multiple rows try to create a field and there is a race condition conflict.


  let promises = fields.map(field => {
    let data = {
      data: {
        dairy_id: dairy_pk,
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
          res(error)
        })
    })
  })
  return Promise.all(promises)
}

/** Following three methods help create or find data for rows associated with nutrient applications.
 * 
 */
const prepareFieldCrop = (field_title, crop_title, cropable, acres, dairy_pk) => {
  let fieldData = {
    data: {
      title: field_title,
      cropable: cropable,
      acres: acres,
      dairy_id: dairy_pk
    }
  }

  return new Promise((resolve, rej) => {
    Promise.all([
      lazyGet('fields', field_title, fieldData, dairy_pk),
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
const getFieldCrop = (commonRowData, dairy_pk) => {
  const [
    app_date, field_title, acres_planted, cropable, acres, crop_title, plant_date,
    precip_before, precip_during, precip_after, app_method
  ] = commonRowData
  return new Promise((resolve, reject) => {
    console.log("Preparing Field Crop", field_title, crop_title)
    prepareFieldCrop(field_title, crop_title, cropable, acres, dairy_pk)
      .then(res => {
        let fieldObj = res[0][0]
        let cropObj = res[1][0]
        console.log("Field OBJ", fieldObj)
        if (fieldObj) {
          if (cropObj) {
            const { typical_yield, moisture: typical_moisture, n: typical_n, p: typical_p, k: typical_k, salt } = cropObj
            let field_crop_search_url = `${fieldObj.pk}/${cropObj.pk}/${encodeURIComponent(plant_date)}`
            let field_crop_data = {
              dairy_id: dairy_pk,
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
            lazyGet('field_crop', field_crop_search_url, field_crop_data, dairy_pk)
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

const getFieldCropApp = (commonRowData, dairy_pk) => {
  const [
    app_date, field_title, acres_planted, cropable, acres, crop_title, plant_date,
    precip_before, precip_during, precip_after, app_method
  ] = commonRowData

  return new Promise((resolve, reject) => {
    getFieldCrop(commonRowData, dairy_pk)
      .then(field_crop_res => {
        const field_crop_app_search_url = `${field_crop_res.pk}/${encodeURIComponent(app_date)}`
        const field_crop_app_data = {
          dairy_id: dairy_pk,
          field_crop_id: field_crop_res.pk,
          app_date: app_date,
          app_method: app_method,
          precip_before: precip_before,
          precip_during: precip_during,
          precip_after: precip_after,
        }
        lazyGet('field_crop_app', field_crop_app_search_url, field_crop_app_data, dairy_pk)
          .then(field_crop_app_res => {
            resolve(field_crop_app_res[0])
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
export const onUploadXLSX = (dairy_id, tsvText, numCols, tsvType, uploadedFilename) => {
  // 24 columns from TSV
  let rows = processTSVText(tsvText, numCols) // extract rows from Text of tsv file TODO()
  console.log(rows)
  if (rows.length < 1) {
    return
  }
  return new Promise((resolve, reject) => {
    // Create a set of fields to ensure duplicates are not attempted.
    let fields = createFieldSet(rows)
    createFieldsFromTSV(fields, dairy_id)      // Create fields before proceeding
      .then(createFieldRes => {
        let result_promises = rows.map((row, i) => {

          if (tsvType === MANURE) {
            return createDataFromManureExportTSVListRow(row, i, dairy_id)
          }
          if (tsvType === WASTEWATER) {
            return createDataFromWastewaterExportTSVListRow(row, i, dairy_id)
          }

          if (tsvType === HARVEST) {
            return createDataFromHarvestTSVListRow(row, i, dairy_id)
          }
          return createDataFromTSVListRow(row, i, dairy_id, tsvType)    // Create entries for ea row in TSV file based on Type
        })

        Promise.all(result_promises)            // Execute promises to create field_crop && field_crop_harvet entries in the DB
          .then(res => {
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
      .catch(createFieldErr => {
        console.log(createFieldErr)
        reject(createFieldErr)
      })
  })
}


const checkAny = (val) => {
  // If the value is empty replace with asterisk.
  // pnumber may be empty but is required to search with when looking for export destinations
  return val ? val : "*"
}

const _lazyGetExportDest = (row, dairy_id) => {
  let promises = []
  const [

    last_date_hauled,
    op_title,
    op_primary_phone,
    op_secondary_phone,
    op_street,
    op_city,
    op_city_state,
    op_city_zip,
    op_is_owner,
    op_is_responsible,  // Yes, No

    contact_first_name,
    contact_primary_phone,


    hauler_title,
    hauler_first_name,

    hauler_primary_phone,
    hauler_street,
    hauler_cross_street,
    hauler_county,
    hauler_city,
    hauler_city_state,
    hauler_city_zip,



    recipient_title,
    dest_type,
    recipient_primary_phone,
    recipient_street,
    recipient_cross_street,
    recipient_county,
    recipient_city,
    recipient_city_state,
    recipient_city_zip,

    pnumber,
    dest_street,
    dest_cross_street,
    dest_county,
    dest_city,
    dest_city_state,
    dest_city_zip,
    ..._rest
  ] = row

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
  console.log("LAxy get recipient data: ", createRecipientData)
  promises.push(lazyGet('export_recipient', recipientSearchURL, createRecipientData, dairy_id))

  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(results => {
        const operatorObj = results[0][0]
        const contactObj = results[1][0]
        const haulerObj = results[2][0]
        const recipientObj = results[3][0]
        console.log("Recipient", recipientObj)
        //TODO
        // Create Search for export_destination

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

export const createDataFromManureExportTSVListRow = (row, i, dairy_id) => {
  return new Promise((resolve, reject) => {
    const [

      last_date_hauled,
      op_title,
      op_primary_phone,
      op_secondary_phone,
      op_street,
      op_city,
      op_city_state,
      op_city_zip,
      op_is_owner,
      op_is_responsible,  // Yes, No

      contact_first_name,
      contact_primary_phone,


      hauler_title,
      hauler_first_name,

      hauler_primary_phone,
      hauler_street,
      hauler_cross_street,
      hauler_county,
      hauler_city,
      hauler_city_state,
      hauler_city_zip,



      recipient_title,
      dest_type,
      recipient_primary_phone,
      recipient_street,
      recipient_cross_street,
      recipient_county,
      recipient_city,
      recipient_city_state,
      recipient_city_zip,

      pnumber,
      dest_street,
      dest_cross_street,
      dest_county,
      dest_city,
      dest_city_state,
      dest_city_zip,


      amount_hauled_method,
      reporting_method,
      material_type,
      amount_hauled,

      moisture,
      n_con_mg_kg,
      p_con_mg_kg,
      k_con_mg_kg,
      tfs,


      n_lbs_rm,
      p_lbs_rm,
      k_lbs_rm,
      salt_lbs_rm,
    ] = row

    _lazyGetExportDest(row, dairy_id)
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


          n_lbs_rm: checkEmpty(n_lbs_rm),
          p_lbs_rm: checkEmpty(p_lbs_rm),
          k_lbs_rm: checkEmpty(k_lbs_rm),
          salt_lbs_rm: checkEmpty(salt_lbs_rm),

        }
        resolve(post(`${BASE_URL}/api/export_manifest/create`, createManifestObj))
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

export const createDataFromWastewaterExportTSVListRow = (row, i, dairy_id) => {
  return new Promise((resolve, reject) => {
    const [

      last_date_hauled,
      op_title,
      op_primary_phone,
      op_secondary_phone,
      op_street,
      op_city,
      op_city_state,
      op_city_zip,
      op_is_owner,
      op_is_responsible,  // Yes, No

      contact_first_name,
      contact_primary_phone,


      hauler_title,
      hauler_first_name,
      hauler_primary_phone,
      hauler_street,
      hauler_cross_street,
      hauler_county,
      hauler_city,
      hauler_city_state,
      hauler_city_zip,



      recipient_title,
      dest_type,
      recipient_primary_phone,
      recipient_street,
      recipient_cross_street,
      recipient_county,
      recipient_city,
      recipient_city_state,
      recipient_city_zip,

      pnumber,
      dest_street,
      dest_cross_street,
      dest_county,
      dest_city,
      dest_city_state,
      dest_city_zip,


      amount_hauled_method,


      material_type,
      hrs_ran,
      gals_min,
      amount_hauled,
      src_desc,

      n_con_mg_l,
      p_con_mg_l,
      k_con_mg_l,


      ec_umhos_cm,
      tds,

      n_lbs_rm,
      p_lbs_rm,
      k_lbs_rm,
    ] = row

    _lazyGetExportDest(row, dairy_id)
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


          n_lbs_rm: checkEmpty(n_lbs_rm),
          p_lbs_rm: checkEmpty(p_lbs_rm),
          k_lbs_rm: checkEmpty(k_lbs_rm),

        }
        resolve(post(`${BASE_URL}/api/export_manifest/create`, createManifestObj))
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })


}




/** Creates field_crop_harvest by creating or finding the data for each row
 * // Typically creates teh field_crop
 */
export const createDataFromHarvestTSVListRow = (row, i, dairy_pk) => {
  console.log("Creating db entreis for data:: ", row)
  // Spreadsheet headers (used db col names)
  const [
    field_title,
    acres_planted,
    cropable,
    acres,
    crop_title,
    plant_date,
    harvest_date,
    expected_yield_tons_acre,
    actual_yield_tons_per_acre,
    actual_yield,
    sample_date,
    src_of_analysis,
    method_of_reporting,
    moisture,
    n,
    p,
    k,
    tfs,
    n_dl,
    p_dl,
    k_dl,
    tfs_dl,
    n_lbs_acre,
    p_lbs_acre,
    k_lbs_acre,
    salt_lbs_acre
  ] = row

  let fieldData = {
    data: {
      title: field_title,
      cropable: cropable,
      acres: acres,
      dairy_id: dairy_pk
    }
  }

  return new Promise((resolve, rej) => {
    // Get Field and Crop
    Promise.all([
      lazyGet('fields', field_title, fieldData, dairy_pk),
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
              dairy_id: dairy_pk,
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

            lazyGet('field_crop', field_crop_search_value, field_crop_data, dairy_pk)
              .then(field_crop_res => {
                const fieldCropObj = field_crop_res[0]
                const field_crop_harvest_data = {
                  dairy_id: dairy_pk,
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
                  n_lbs_acre: checkEmpty(n_lbs_acre),
                  p_lbs_acre: checkEmpty(p_lbs_acre),
                  k_lbs_acre: checkEmpty(k_lbs_acre),
                  salt_lbs_acre: checkEmpty(salt_lbs_acre)

                }

                console.log("")
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





/** Nutrient applications
 *  These have very common columns and is at the same level i.e. they require fields & crops to be made.
 * 
 * @param {*} row: The row from the TSV contianing data
 * @param {*} i : index of row
 * @param {*} dairy_pk: The current dairys pk in the dairy table.
 * @param {*} table: The specific nutrient application table that the data will be stored in
 *    - Options: ['process_wastewater', 'fresh_water', 'solid_manure', 'commerical_fertilizer']
 *    - This will call a function insert the data after the neccessary data is created.
 *        - Neccessary data: fields, field_crop, field_crop_app 
 * 
 * @returns a promise that the resolves with the final  created DB entry or rejects w/ an error.
 */
export const createDataFromTSVListRow = (row, i, dairy_pk, tsvType) => {
  const [app_date, field_title, acres_planted, cropable, acres, crop_title, plant_date,
    precip_before, precip_during, precip_after, app_method] = row.slice(0, 11)  // First 10 rows are common rows to create a field_crop_app
  /**
    * 
    *  For all TSV sheets, the data relies on a Field, Field_crop, Field_crop_app. 
    *  This part will lazily create everything based on the first 7 entries on the sheet.
    */
  return new Promise((resolve, rej) => {
    getFieldCropApp(row.slice(0, 11), dairy_pk)
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
          resolve(createProcessWastewaterApplication(row, field_crop_app, dairy_pk)) // Creates analysis and application_event
        } else if (tsvType === FRESHWATER) {
          // Creates source, analysis and event
          resolve(createFreshwaterApplication(row, field_crop_app, dairy_pk))
        } else if (tsvType === SOLIDMANURE) {
          // Creates source, analysis and event
          resolve(createSolidmanureApplication(row, field_crop_app, dairy_pk))
        }
        else if (tsvType === FERTILIZER) {
          // Creates Nutrient Import, Fertilizer
          resolve(createFertilizerApplication(row, field_crop_app, dairy_pk))
        }
        else if (tsvType === SOIL) {
          // Creates Nutrient Import, Fertilizer
          resolve(createSoilApplication(row, field_crop_app, dairy_pk))
        } else if (tsvType === PLOWDOWN_CREDIT) {
          // Creates Nutrient Import, Fertilizer
          resolve(createPlowdownCreditApplication(row, field_crop_app, dairy_pk))
        }

      })
      .catch(field_crop_app_err => {
        console.log(field_crop_app_err)
      })

  })
}

export const checkEmpty = (val) => {
  // If value is empty, return 0 to avoid error in DB.
  return val.length > 0 ? val.replaceAll(',', '') : 0
}



/** Creates field_crop_app_process_wastewater(app event) && field_crop_app_process_wastewater_analysis
 * 
 * @param {*} row: List of all columns from TSV row.
 * @param {*} field_crop_app: Object from DB with current data from row.
 * @param {*} dairy_pk: The primary key of the current dairy.
 * @returns The created field_crop_app_process_wastewater.
 */
const createProcessWastewaterApplication = (row, field_crop_app, dairy_pk) => {
  const [
    sample_date,
    sample_desc,
    sample_data_src,
    kn_con,
    nh4_con,
    nh3_con,
    no3_con,
    p_con,
    k_con,
    ca_con,
    mg_con,
    na_con,
    hco3_con,
    co3_con,
    so4_con,
    cl_con,
    ec,
    tds,
    kn_dl,
    nh4_dl,
    nh3_dl,
    no3_dl,
    p_dl,
    k_dl,
    ca_dl,
    mg_dl,
    na_dl,
    hco3_dl,
    co3_dl,
    so4_dl,
    cl_dl,
    ec_dl,
    tds_dl,
    ph,
    app_desc,
    material_type,
    app_rate,
    run_time,
    amount_applied,
    app_rate_per_acre,
    totalN,
    totalP,
    totalK
  ] = row.slice(11, TSV_INFO[PROCESS_WASTEWATER].numCols)
  const process_wastewater_analysis_data = {
    dairy_id: dairy_pk,
    sample_date,
    sample_desc,
    sample_data_src,
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
    lazyGet('field_crop_app_process_wastewater_analysis', field_crop_app_process_wastewater_analysis_search_url, process_wastewater_analysis_data, dairy_pk)
      .then(res => {
        const process_wastewater_data = {
          dairy_id: dairy_pk,
          field_crop_app_id: field_crop_app.pk,
          field_crop_app_process_wastewater_analysis_id: res[0].pk,
          app_desc,
          material_type,
          amount_applied: amount_applied.replaceAll(',', ''),
          totalN: checkEmpty(totalN.replaceAll(',', '')),
          totalP: checkEmpty(totalP.replaceAll(',', '')),
          totalK: checkEmpty(totalK.replaceAll(',', '')),
        }
        resolve(post(`${BASE_URL}/api/field_crop_app_process_wastewater/create`, process_wastewater_data))

      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}


const createFreshwaterApplication = (row, field_crop_app, dairy_pk) => {


  const [
    sample_date,
    src_desc,
    src_type,
    sample_desc,
    src_of_analysis,
    n_con,
    nh4_con,
    no2_con,
    ca_con,
    mg_con,
    na_con,
    hco3_con,
    co3_con,
    so4_con,
    cl_con,
    ec,
    tds,
    n_dl,
    nh4_dl,
    no2_dl,
    ca_dl,
    mg_dl,
    na_dl,
    hco3_dl,
    co3_dl,
    so4_dl,
    cl_dl,
    ec_dl,
    tds_dl,
    app_rate,
    run_time,
    amount_applied,
    amt_applied_per_acre,
    totalN

  ] = row.slice(11, TSV_INFO[FRESHWATER].numCols)

  // dairy_id, sample_date, sample_desc
  const field_crop_app_freshwater_source_search_url = `${encodeURIComponent(src_desc)}/${encodeURIComponent(src_type)}`
  const freshwater_source_data = {
    dairy_id: dairy_pk,
    src_desc,
    src_type
  }

  // Get Source
  return new Promise((resolve, rej) => {
    // lazyget freshwater_source
    lazyGet('field_crop_app_freshwater_source', field_crop_app_freshwater_source_search_url, freshwater_source_data, dairy_pk)
      .then(field_crop_app_freshwater_source_res => {
        if (field_crop_app_freshwater_source_res.length > 0) {
          let fresh_water_source_obj = field_crop_app_freshwater_source_res[0]
          let fresh_water_source_id = fresh_water_source_obj.pk


          // lazyget freshwater_analysis , sample_date, sample_desc, src_of_analysis, fresh_water_source_id
          const field_crop_app_freshwater_analysis_search_url = `${encodeURIComponent(sample_date)}/${encodeURIComponent(sample_desc)}/${src_of_analysis}/${fresh_water_source_id}`
          const freshwater_analysis_data = {
            dairy_id: dairy_pk,
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

          lazyGet('field_crop_app_freshwater_analysis', field_crop_app_freshwater_analysis_search_url, freshwater_analysis_data, dairy_pk)
            .then(freshwater_analysis_res => {
              let freshwater_analysis_obj = freshwater_analysis_res[0]
              const freshwater_data = {
                dairy_id: dairy_pk,
                field_crop_app_id: field_crop_app.pk,
                field_crop_app_freshwater_analysis_id: freshwater_analysis_obj.pk,
                app_rate: checkEmpty(app_rate),
                run_time: checkEmpty(run_time),
                amount_applied: checkEmpty(amount_applied),
                amt_applied_per_acre: checkEmpty(amt_applied_per_acre),
                totalN: checkEmpty(totalN)
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

const createSolidmanureApplication = (row, field_crop_app, dairy_pk) => {


  const [
    sample_date,
    sample_desc,
    src_desc,
    material_type,
    src_of_analysis,
    method_of_reporting,
    amount_applied,
    amt_applied_per_acre,
    moisture,
    n_con,
    p_con,
    k_con,
    ca_con,
    mg_con,
    na_con,
    s_con,
    cl_con,
    tfs,
    n_dl,
    p_dl,
    k_dl,
    ca_dl,
    mg_dl,
    na_dl,
    s_dl,
    cl_dl,
    tfs_dl,
    n_lbs_acre,
    p_lbs_acre,
    k_lbs_acre,
    salt_lbs_acre

  ] = row.slice(11, TSV_INFO[SOLIDMANURE].numCols)

  // dairy_id, sample_date, sample_desc
  const field_crop_app_solidmanure_analysis_search_url = `${encodeURIComponent(sample_date)}/${encodeURIComponent(sample_desc)}/${encodeURIComponent(src_of_analysis)}`
  const solidmanure_analysis_data = {
    dairy_id: dairy_pk,
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
    lazyGet('field_crop_app_solidmanure_analysis', field_crop_app_solidmanure_analysis_search_url, solidmanure_analysis_data, dairy_pk)
      .then(field_crop_app_solidmanure_analysis_res => {
        if (field_crop_app_solidmanure_analysis_res.length > 0) {
          let solidmanure_analysis_obj = field_crop_app_solidmanure_analysis_res[0]
          let solidmanure_analysis_id = solidmanure_analysis_obj.pk


          const solidmanure_data = {
            dairy_id: dairy_pk,
            field_crop_app_id: field_crop_app.pk,
            field_crop_app_solidmanure_analysis_id: solidmanure_analysis_id,
            src_desc,
            amount_applied: checkEmpty(amount_applied),
            amt_applied_per_acre: checkEmpty(amt_applied_per_acre),
            n_lbs_acre: checkEmpty(n_lbs_acre),
            p_lbs_acre: checkEmpty(p_lbs_acre),
            k_lbs_acre: checkEmpty(k_lbs_acre),
            salt_lbs_acre: checkEmpty(salt_lbs_acre)
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

const createFertilizerApplication = (row, field_crop_app, dairy_pk) => {


  const [
    import_desc,
    import_date,
    material_type,
    amount_imported,
    method_of_reporting,
    amt_applied_per_acre,
    amount_applied,
    moisture,
    n_con,
    p_con,
    k_con,
    salt_con,
    n_lbs_acre,
    p_lbs_acre,
    k_lbs_acre,
    salt_lbs_acre

  ] = row.slice(11, TSV_INFO[FRESHWATER].numCols)

  // import_date, material_type, import_desc
  const field_crop_app_nutrient_import_search_url = `${encodeURIComponent(import_date)}/${encodeURIComponent(material_type)}/${encodeURIComponent(import_desc)}`
  const nutrient_import_data = {
    dairy_id: dairy_pk,
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
    lazyGet('nutrient_import', field_crop_app_nutrient_import_search_url, nutrient_import_data, dairy_pk)
      .then(nutrient_import_res => {
        if (nutrient_import_res.length > 0) {
          let nutrient_import_obj = nutrient_import_res[0]
          let nutrient_import_id = nutrient_import_obj.pk


          const fertilizer_data = {
            dairy_id: dairy_pk,
            field_crop_app_id: field_crop_app.pk,
            nutrient_import_id: nutrient_import_id,


            amount_applied: checkEmpty(amount_applied),
            n_lbs_acre: checkEmpty(n_lbs_acre),
            p_lbs_acre: checkEmpty(p_lbs_acre),
            k_lbs_acre: checkEmpty(k_lbs_acre),
            salt_lbs_acre: checkEmpty(salt_lbs_acre)
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

const createSoilApplication = (row, field_crop_app, dairy_pk) => {
  const [
    src_desc,

    sample_date_0,
    sample_desc_0,
    src_of_analysis_0,
    n_con_0,
    total_p_con_0,
    p_con_0,
    k_con_0,
    ec_0,
    org_matter_0,
    n_dl_0,
    total_p_dl_0,
    p_dl_0,
    k_dl_0,
    ec_dl_0,
    org_matter_dl_0,

    sample_date_1,
    sample_desc_1,
    src_of_analysis_1,
    n_con_1,
    total_p_con_1,
    p_con_1,
    k_con_1,
    ec_1,
    org_matter_1,
    n_dl_1,
    total_p_dl_1,
    p_dl_1,
    k_dl_1,
    ec_dl_1,
    org_matter_dl_1,

    sample_date_2,
    sample_desc_2,
    src_of_analysis_2,
    n_con_2,
    total_p_con_2,
    p_con_2,
    k_con_2,
    ec_2,
    org_matter_2,
    n_dl_2,
    total_p_dl_2,
    p_dl_2,
    k_dl_2,
    ec_dl_2,
    org_matter_dl_2,
  ] = row.slice(11, TSV_INFO[SOIL].numCols)
  let fieldData = {
    data: {
      title: row[1],
      cropable: row[3],
      acres: row[4],
      dairy_id: dairy_pk
    }
  }
  return new Promise((resolve, reject) => {
    lazyGet('fields', row[1], fieldData, dairy_pk)
      .then(([field]) => {
        console.log('Field: ', field)
        console.log("Create all fca_soil_analysis here")

        const sampleData0 = {
          dairy_id: dairy_pk,
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
          dairy_id: dairy_pk,
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
          dairy_id: dairy_pk,
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
          lazyGet('field_crop_app_soil_analysis', `${encodeURIComponent(field.pk)}/${encodeURIComponent(sample_date_0)}`, sampleData0, dairy_pk),
          lazyGet('field_crop_app_soil_analysis', `${encodeURIComponent(field.pk)}/${encodeURIComponent(sample_date_1)}`, sampleData1, dairy_pk),
          lazyGet('field_crop_app_soil_analysis', `${encodeURIComponent(field.pk)}/${encodeURIComponent(sample_date_2)}`, sampleData2, dairy_pk),
        ])
          .then(([[analysis0], [analysis1], [analysis2]]) => {
            console.log("3 depths, 3 analyses for NPKSalt", analysis0, analysis1, analysis2)
            console.log("Calculate them noW!!!!!! muahaha")
            let n_lbs_acre = (toFloat(n_con_0) + toFloat(n_con_1) + toFloat(n_con_2)) * 4.0  // Testing in the calc gave me the number 4.... 1mg/kg  == 4lbs/acre
            let p_lbs_acre = (toFloat(p_con_0) + toFloat(p_con_1) + toFloat(p_con_2)) * 4.0  // _con is in mg/ kg
            let k_lbs_acre = (toFloat(k_con_0) + toFloat(k_con_1) + toFloat(k_con_2)) * 4.0
            let salt_lbs_acre = (toFloat(ec_0) + toFloat(ec_1) + toFloat(ec_2)) * 2.4

            const fca_soil_data = {
              dairy_id: dairy_pk,
              field_crop_app_id: field_crop_app.pk,
              src_desc,
              n_lbs_acre,
              p_lbs_acre,
              k_lbs_acre,
              salt_lbs_acre
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

const createPlowdownCreditApplication = (row, field_crop_app, dairy_pk) => {
  const [
    src_desc,
    n_lbs_acre,
    p_lbs_acre,
    k_lbs_acre,
    salt_lbs_acre,
  ] = row.slice(11, TSV_INFO[PLOWDOWN_CREDIT].numCols)
  let fieldData = {
    data: {
      title: row[1],
      cropable: row[3],
      acres: row[4],
      dairy_id: dairy_pk
    }
  }

  return new Promise((resolve, reject) => {
    lazyGet('fields', row[1], fieldData, dairy_pk)
      .then(([field]) => {
        console.log('Field: ', field)
        console.log("Create all fca_soil_analysis here")
        const fca_plowdown_credit_data = {
          dairy_id: dairy_pk,
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
