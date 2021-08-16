import { get, post } from './requests'

export default function mTea() { }
const BASE_URL = "http://localhost:3001"


export const PROCESS_WASTEWATER = 'process_wastewater'
export const FRESHWATER = 'field_crop_app_freshwater'
export const SOLIDMANURE = 'field_crop_app_solidmanure'
export const TSV_INFO = {
  [PROCESS_WASTEWATER]: {
    numCols: 32, // 32 columns in process_wastewater spreadsheet/ TSV
    tsvType: PROCESS_WASTEWATER
  },
  [FRESHWATER]: {
    numCols: 33,
    tsvType: FRESHWATER
  },
  [SOLIDMANURE]: {
    numCols: 33,
    tsvType: SOLIDMANURE
  },
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
                    if(secondResult.length == 0){
                      console.log(endpoint, value, data)
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
  console.log(rows)
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

/** Lazily prepares the DB entries needed for field_crop entry.
 * 
 * @param {str} field_title: Title of Field, will be lazily created
 * @param {str} crop_title: Title of the crop, already exists in DB
 * @returns If successful, reutrns a list of field, crop objects from the DB.
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
    prepareFieldCrop(field_title, crop_title, cropable, acres, dairy_pk)
      .then(res => {
        let fieldObj = res[0][0]
        let cropObj = res[1][0]
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
              n: typical_n,
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

/** Nutrient applications
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
    precip_before, precip_during, precip_after, app_method] = row.slice(0, 11)
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
        }else if (tsvType === SOLIDMANURE) {
          // Creates source, analysis and event
          resolve(createSolidmanureApplication(row, field_crop_app, dairy_pk))
        }

      })
      .catch(field_crop_app_err => {
        console.log(field_crop_app_err)
      })

  })
}

export const checkEmpty = (val) => {
  // If value is empty, return 0 to avoid error in DB.
  return val.length > 0 ? val.replaceAll(',','') : 0
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
    kn_con: checkEmpty(kn_con.replaceAll(',', '')),
    nh4_con: checkEmpty(nh4_con.replaceAll(',', '')),
    nh3_con: checkEmpty(nh3_con.replaceAll(',', '')),
    no3_con: checkEmpty(no3_con.replaceAll(',', '')),
    p_con: checkEmpty(p_con.replaceAll(',', '')),
    k_con: checkEmpty(k_con.replaceAll(',', '')),
    ec: checkEmpty(ec.replaceAll(',', '')),
    tds: checkEmpty(tds.replaceAll(',', '')),
    ph: checkEmpty(ph.replaceAll(',', '')),
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
        if(field_crop_app_freshwater_source_res.length > 0){
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

        }else{
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
    n_lbs_acre,
    p_lbs_acre,
    k_lbs_acre,
    salt_lbs_acre 

  ] = row.slice(11, TSV_INFO[FRESHWATER].numCols)

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
    tfs: checkEmpty(tfs)
  }

  // Get Source
  return new Promise((resolve, rej) => {
    // lazyget freshwater_source
    lazyGet('field_crop_app_solidmanure_analysis', field_crop_app_solidmanure_analysis_search_url, solidmanure_analysis_data, dairy_pk)
      .then(field_crop_app_solidmanure_analysis_res => {
        if(field_crop_app_solidmanure_analysis_res.length > 0){
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

        }else{
          console.log("Error with reading pk for solidmanure analysis", row)
        }



      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })


}


