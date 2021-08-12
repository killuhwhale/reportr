import { get, post } from './requests'

export default function mTea() { }
const BASE_URL = "http://localhost:3001"


export const PROCESS_WASTEWATER = 'process_wastewater'

export const TSV_INFO = {
  [PROCESS_WASTEWATER]: {
    numCols: 32, // 32 columns in process_wastewater spreadsheet/ TSV
    tsvType: PROCESS_WASTEWATER
  },
}

// ### Common functions     ###################################################################
export const lazyGet = (endpoint, value, data, dairy_pk) => {
  return new Promise((resolve, rej) => {
    get(`${BASE_URL}/api/search/${endpoint}/${value}/${dairy_pk}`)
      .then(res => {

        // If not found, Attempt to create
        if (Object.keys(res).length == 0) {
          post(`${BASE_URL}/api/${endpoint}/create`, data)
            .then(result => {
              console.log("Created from lazyget: ", result)

              // If there is an error response from server.
              if (result.test) {
                console.log("Create failed, race conditon happened. Attempting to re-fetch")
                get(`${BASE_URL}/api/search/${endpoint}/${value}/${dairy_pk}`)
                  .then(secondResult => {
                    console.log("Found entry after failing to create entry", secondResult)
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
 *  - Each Dairy per reporting year, will have a TSV file for Production Records(Harvests), Nutrient Applications, Imports/Exports
 */

export const uploadTSVToDB = (uploadedFilename, tsvText, dairy_id, tsvType) => {
  console.log("Uploading TSV to DB", uploadedFilename, tsvText)
  return new Promise((res, rej) => {
    post(`${BASE_URL}/api/tsv/create`, {
      title: uploadedFilename,
      data: tsvText,
      tsvType: tsvType,
      dairy_id: dairy_id
    })
      .then(result => {
        console.log("Uploaded to DB: ", result)
        res(result)
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
  return rows
}
export const createFieldSet = (rows) => {
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
// ##############################################################################################

/** Nutrient applications
 * 
 * @param {*} row: The row from the TSV contianing data
 * @param {*} i : index of row
 * @param {*} dairy_pk: The current dairys pk in the dairy table.
 * @param {*} table: The specific nutrient application table that the data will be stored in
 *    -  options: ['process_wastewater', 'fresh_water', 'solid_manure', 'commerical_fertilizer']
 *    - This will call a function insert the data after the neccessary data is created.
 *        - Neccessary data: fields, field_crop, field_crop_app 
 * @returns 
 */
export const createDataFromTSVListRow = (row, i, dairy_pk, tsvType) => {
  // console.log("Creating db entreis for data:: ", row)
  // Spreadsheet Row Headers
  // Field	Acres_Planted	cropable	Total_Acres		Crop	Plant_Date	Harvest_Dates	Expected_Yield(Tons/Acre)	
  //  Actual_Yield(Tons/Acre)	Actual_Yield(Total Tons)	Reporting_Method	% Moisture	%N	%P	%K	%TFSSalt(Dry Basis)
  // const [
  //   field_title, acres_planted, cropable, acres, crop_title, plant_date, harvest_date, typical_yield, actual_yield_tons_per_acre,
  //   actual_yield_tons, basis, actual_moisture, actual_n, actual_p, actual_k, tfs
  // ] = row.slice(0,4)


  /**
   * The first 11 columns must be this on each application event sheet, process WW, FW, SM and Commerical Fertilizer applications
   * - Data required to create or find: Field, field_crop and frield_crop_app
   */
  const [app_date, field_title, acres_planted, cropable, acres, crop_title, plant_date,
    precip_before, precip_during, precip_after, app_method] = row.slice(0, 11)

  let fieldData = {
    data: {
      title: field_title,
      cropable: cropable,
      acres: acres,
      dairy_id: dairy_pk
    }
  }
  /**
    * 
    *  For all TSV sheets, the data relies on a Field, Field_crop, Field_crop_app. 
    *  This part will lazily create everything based on the first 7 entries on the sheet.
    */
  return new Promise((resolve, rej) => {
    // Get Field and Crop, already lazily created all fields.
    Promise.all([
      lazyGet('fields', field_title, fieldData, dairy_pk),
      get(`${BASE_URL}/api/crops/${crop_title}`) // list of crops in DB are predefined based on spreadsheet. HARDCODED
    ])
      .then(res => {
        let fieldObj = res[0][0] // res = [res1, res2], res1=[data]
        let cropObj = res[1][0]

        if (fieldObj) {
          if (cropObj) {
            // Get Field_Crop, possibly created
            // Now we can create a field_crop with:
            //    fieldObj, cropObj, and [from testRow[i] -> ]plant_date[6], acres_planted[1], [from crops -> ]typical_yield, moisture, n, p, k, salt
            const { typical_yield, moisture: typical_moisture, n: typical_n, p: typical_p, k: typical_k, salt } = cropObj
            let field_crop_search_url = `${fieldObj.pk}/${cropObj.pk}/${encodeURIComponent(plant_date)}`

            // Process wastewater annual report section reports n, p, k in lbs/acre, not their concentration in [mg/L or PPM]

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

            // Now lazily get field_crop
            lazyGet('field_crop', field_crop_search_url, field_crop_data, dairy_pk)
              .then(field_crop_res => {
                const fieldCropObj = field_crop_res[0]
                // Here we have access to a valid field_crop, which is used in 
                //field_crop_app, 
                const field_crop_app_search_url = `${fieldCropObj.pk}/${encodeURIComponent(app_date)}`
                const field_crop_app_data = {
                  dairy_id: dairy_pk,
                  field_crop_id: fieldCropObj.pk,
                  app_date: app_date,
                  app_method: app_method, // allow these to be updated
                  precip_before: precip_before,
                  precip_during: precip_during,
                  precip_after: precip_after,
                }

                lazyGet('field_crop_app', field_crop_app_search_url, field_crop_app_data, dairy_pk)
                  .then(field_crop_app => {
                    const field_crop_appObj = field_crop_app[0]
                    // console.log("Field crop app", field_crop_appObj)
                    /**
                     * #######################################################################
                     *  Create any nutrient applications here....
                     *  fieldObj
                     *  cropObj
                     *  field_cropObj
                     *  field_crop_appObj
                     * 
                     * 
                     * #######################################################################
                     */



                    if (tsvType === PROCESS_WASTEWATER) {
                      resolve(createProcessWastewaterApplication(row, field_crop_appObj, dairy_pk))
                    } else if (tsvType === "field_crop_app_freshwater") {
                      return
                    }
                  })
                  .catch(field_crop_app_err => {
                    console.log(field_crop_app_err)
                  })
              })
              .catch(field_crop_err => {
                rej(field_crop_err)
                console.log(field_crop_err)
                console.log('field_crop', field_crop_search_url, field_crop_data, dairy_pk)
              })
          } else {
            rej(res)
            console.log("No crop object found in DB")
          }
        } else {
          rej(res)
          console.log("No field  object found in DB")
        }
      })
      .catch(err => {
        rej(err)
        console.log(err)
      })
  })

}

const _checkEmpty = (val) => {
  // If value is empty, return 0 to avoid error in DB.
  return val.length > 0 ? val : 0
}

/** Process Wastewater */
const createProcessWastewaterApplication = (row, field_crop_app, dairy_pk) => {
  /** Row k -> 
   * 
   */
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
    ec,
    tds,
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
    kn_con: _checkEmpty(kn_con.replaceAll(',', '')),
    nh4_con: _checkEmpty(nh4_con.replaceAll(',', '')),
    nh3_con: _checkEmpty(nh3_con.replaceAll(',', '')),
    no3_con: _checkEmpty(no3_con.replaceAll(',', '')),
    p_con: _checkEmpty(p_con.replaceAll(',', '')),
    k_con: _checkEmpty(k_con.replaceAll(',', '')),
    ec: _checkEmpty(ec.replaceAll(',', '')),
    tds: _checkEmpty(tds.replaceAll(',', '')),
    ph: _checkEmpty(ph.replaceAll(',', '')),
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
          totalN: _checkEmpty(totalN.replaceAll(',', '')),
          totalP: _checkEmpty(totalP.replaceAll(',', '')),
          totalK: _checkEmpty(totalK.replaceAll(',', '')),
        }
        resolve(post(`${BASE_URL}/api/field_crop_app_process_wastewater/create`, process_wastewater_data))

      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })

}
