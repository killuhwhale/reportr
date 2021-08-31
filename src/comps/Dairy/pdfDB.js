import { get, post } from '../../utils/requests'
import { toFloat } from '../../utils/convertCalc'
import { formatFloat, groupBySortBy } from '../../utils/format'
import calculateHerdManNKPNaCl from "../../utils/herdCalculation"
import { NUTRIENT_IMPORT_MATERIAL_TYPES, MATERIAL_TYPES, WASTEWATER_MATERIAL_TYPES, FRESHWATER_SOURCE_TYPES } from '../../utils/constants'


const BASE_URL = `http://localhost:3001`
const PPM_TO_DEC = .000001
export default function mTEA() { }





const mgKGToLBS = (con, amount) => {
  con = con && typeof (con) === typeof ('') ? parseFloat(con.replaceAll(',', '')) : con
  amount = amount && typeof (amount) === typeof ('') ? parseFloat(amount.replaceAll(',', '')) : amount

  return (con * 1e-6) * (amount * 2000)
}


const sumArrayByPos = (a, b, subtract = false) => {
  return a.map((el, i) => subtract ? el - b[i] : el + b[i])
}

const percentToLBSFromTons = (con, moisture, amount, method_of_reporting) => {
  /* 
    
     con: whole number, percentage
     moisture: whole number percentage
     amount: integer, unit is tons
     method_of_reporting: if dry_weight, must take into account the moisture and only calculate the dry portion.
  */
  // convert percent to decimal, convert amount(tons) to lbs
  con = con && typeof (con) == typeof ('') ? parseFloat(con.replaceAll(",", '')) : con
  moisture = moisture && typeof (moisture) == typeof ('') ? parseFloat(moisture.replaceAll(",", '')) : moisture
  amount = amount && typeof (amount) == typeof ('') ? parseFloat(amount.replaceAll(",", '')) : amount

  con *= 0.01
  moisture *= .01
  moisture = Math.max(Math.min(1, moisture), 0.1) // mositure must be between 0.1% and 100%
  moisture = method_of_reporting === "dry-weight" ? (1 - (moisture)) : 1 // if reported as dry-weight, account for moisture
  amount *= 2000
  return con * moisture * amount
}

const percentToPPM = (num) => {
  num = toFloat(num)
  return num * 1e4
}

const PPMToLBS = (con, amt) => {
  // getNutrientBudgetA, converts total n p k applied from con
  con = toFloat(con)
  amt = toFloat(amt)
  return (con * 0.008345) * (amt / 1000)
}

const percentToLBSFromGals = (con, amount) => {
  /* Calculates the amount of nutrient in total amount
     con: whole number, percentage
     amount: integer, unit is tons
  */
  // convert percent to decimal, convert amount(gals) to lbs


  return parseFloat(con.replaceAll(",", '')) * 0.01 * parseFloat(amount.replaceAll(",", '')) * 0.000008345
}

export const getAnnualReportData = (dairy_id) => {
  let promises = [
    getDairyInformationA(dairy_id),
    getDairyInformationB(dairy_id),
    getDairyInformationC(dairy_id),
    getAvailableNutrientsAB(dairy_id),
    getAvailableNutrientsC(dairy_id),
    getAvailableNutrientsD(dairy_id),
    getAvailableNutrientsF(dairy_id),
    getAvailableNutrientsG(dairy_id),
    getApplicationAreaA(dairy_id),
    getApplicationAreaB(dairy_id),
    getNutrientBudgetA(dairy_id),
  ]

  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(results => {
        // now I have a list of results in order but I want to pass a single props object.
        // reduce each object in the list to a single object. Ea obj in the list has a single unique key.
        let resultsObj = results.reduce((a, c) => ({ ...a, ...c }))
        console.log(resultsObj)
        resolve(resultsObj)
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}



const getDairyInformationA = (dairy_id) => {
  let promises = [
    get(`${BASE_URL}/api/dairy/${dairy_id}`),
    get(`${BASE_URL}/api/parcels/${dairy_id}`)
  ]

  return new Promise((resolve, rej) => {
    Promise.all(promises)
      .then(([dairy_info, parcels]) => {
        resolve({
          'dairyInformationA': dairy_info ?
            { ...dairy_info[0], parcels: parcels } : {},
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}

const getDairyInformationB = (dairy_id) => {
  // TODO add is_operator to table, need to add to UI as well to make sure the user can enable this.
  return new Promise((resolve, rej) => {
    get(`${BASE_URL}/api/operators/is_operator/${encodeURIComponent(true)}/${dairy_id}`)
      .then((operators) => {
        resolve({
          'dairyInformationB': {
            operators
          }
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}

const getDairyInformationC = (dairy_id) => {
  return new Promise((resolve, rej) => {
    get(`${BASE_URL}/api/operators/is_owner/${encodeURIComponent(true)}/${dairy_id}`)
      .then((owners) => {
        resolve({
          'dairyInformationC': {
            owners
          }
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}

const getAvailableNutrientsAB = (dairy_id) => {

  return new Promise((resolve, rej) => {

    get(`${BASE_URL}/api/herds/${dairy_id}`)
      .then(herdInfo => {
        if (herdInfo.test || herdInfo.length === 0) {
          console.log("Herd information not found")
          rej("Herd information not found")
          return;
        }
        // Return herdInfo & calculations
        let totals = calculateHerdManNKPNaCl(herdInfo[0]).totals.map(total => new Intl.NumberFormat().format(total.toFixed(2)))

        resolve({
          'availableNutrientsAB':
          {
            'herdInfo': herdInfo[0],
            'herdCalc': totals,
          }
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })



  })
}

const getAvailableNutrientsC = (dairy_id) => {

  /**  Get Process Wastewater Generated
   *  Process Wastewater Generated
   *    = Applied + Exported.
   * 
   *    field_crop_app_process_wastewater.amount_applied
   *    export_manifest.amount_hauled where material_type = process wastewater and sludge  
   * 
   *  nutrient_import.amount_imported where material_type = process wastewater and sludge 
   */
  return new Promise((resolve, rej) => {
    Promise.all([
      get(`${BASE_URL}/api/field_crop_app_process_wastewater/${dairy_id}`), // applied
      get(`${BASE_URL}/api/export_manifest/wastewater/${dairy_id}`), // exported
      get(`${BASE_URL}/api/nutrient_import/wastewater/${dairy_id}`), // imported
    ])
      .then((res) => {
        let [applied, exported, imported] = res // calculate n,p,k,salt applied + exported - imported
        // for each applied, exported and imported, sum the amount_* applied, hauled, imported for the totals.

        // Format input, and calculate n,p,k, salt as a list of nums. Then sum the list of lists in .reduce(). 
        applied = applied && applied.length > 0 ?
          applied.map((el) => {
            return [
              el.amount_applied,
              PPMToLBS(parseFloat(el.kn_con.replaceAll(',', '')), el.amount_applied),
              PPMToLBS(parseFloat(el.p_con.replaceAll(',', '')), el.amount_applied),
              PPMToLBS(parseFloat(el.k_con.replaceAll(',', '')), el.amount_applied),
              PPMToLBS(parseFloat(el.tds.replaceAll(',', '')), el.amount_applied),
            ]
          })
            .reduce((a, c) => sumArrayByPos(a, c))
          : [0, 0, 0, 0, 0]

        exported = exported && exported.length > 0 ?
          exported.map((el) => {
            return [
              el.amount_hauled,
              PPMToLBS(parseFloat(el.kn_con_mg_l.replaceAll(',', '')), el.amount_hauled),
              PPMToLBS(parseFloat(el.p_con_mg_l.replaceAll(',', '')), el.amount_hauled),
              PPMToLBS(parseFloat(el.k_con_mg_l.replaceAll(',', '')), el.amount_hauled),
              PPMToLBS(parseFloat(el.tds.replaceAll(',', '')), el.amount_hauled),
            ]
          })
            .reduce((a, c) => sumArrayByPos(a, c))
          : [0, 0, 0, 0, 0]

        imported = imported && imported.length > 0 ?
          imported.map((el) => {
            return [
              el.amount_imported,
              parseFloat(el.n_con.replaceAll(',', '')) * el.amount_imported * .01,
              parseFloat(el.p_con.replaceAll(',', '')) * el.amount_imported * .01,
              parseFloat(el.k_con.replaceAll(',', '')) * el.amount_imported * .01,
              parseFloat(el.salt_con.replaceAll(',', '')) * el.amount_imported * .01,
            ]
          })
            .reduce((a, c) => sumArrayByPos(a, c))
          : [0, 0, 0, 0, 0]

        let generated = sumArrayByPos(sumArrayByPos(applied, exported), imported, true) // can be given true to do subtraction instead

        resolve({
          'availableNutrientsC': {
            applied: applied.map(el => new Intl.NumberFormat().format(el.toFixed(2))),
            exported: exported.map(el => new Intl.NumberFormat().format(el.toFixed(2))),
            imported: imported.map(el => new Intl.NumberFormat().format(el.toFixed(2))),
            generated: generated.map(el => new Intl.NumberFormat().format(el.toFixed(2))),
          }
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}

const getAvailableNutrientsD = (dairy_id) => {
  // TODO add is_operator to table, need to add to UI as well to make sure the user can enable this.
  return new Promise((resolve, rej) => {
    get(`${BASE_URL}/api/field_crop_app_freshwater_source/${dairy_id}`)
      .then((sources) => {
        resolve({
          'availableNutrientsD': {
            sources
          }
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}

const getAvailableNutrientsF = (dairy_id) => {
  // TODO add is_operator to table, need to add to UI as well to make sure the user can enable this.
  return new Promise((resolve, rej) => {
    Promise.all([
      get(`${BASE_URL}/api/nutrient_import/material_type/${encodeURIComponent('Dry%')}/${dairy_id}`),
      get(`${BASE_URL}/api/nutrient_import/material_type/${encodeURIComponent('Process%')}/${dairy_id}`),
      get(`${BASE_URL}/api/nutrient_import/material_type/${encodeURIComponent('Commercial%olid%')}/${dairy_id}`),
      get(`${BASE_URL}/api/nutrient_import/material_type/${encodeURIComponent('Commercial%iquid%')}/${dairy_id}`)
    ])
      .then(([dry, process, commercialSolid, commercialLiquid]) => {
        console.log([dry, process, commercialSolid, commercialLiquid])
        // Summary table totals
        // totals n,p,k,salt in lbs (concentration is in percent)
        let dryTotals = dry.length > 0 ?
          // Account for moisture on npk when reporting method is dry-weight, else moisture is 1
          // Account for moistture on salt always. **This doesnt apply to commercial imports
          dry.map(el => [
            percentToLBSFromTons(el.n_con, el.moisture, el.amount_imported, el.method_of_reporting),
            percentToLBSFromTons(el.p_con, el.moisture, el.amount_imported, el.method_of_reporting),
            percentToLBSFromTons(el.k_con, el.moisture, el.amount_imported, el.method_of_reporting),
            percentToLBSFromTons(el.salt_con, el.moisture, el.amount_imported, "dry-weight"), // Method of reporting doesnt affect, should always acount for moisture
          ])
            .reduce((a, c) => sumArrayByPos(a, c))
          : [0, 0, 0, 0]

        let processTotals = process.length > 0 ?
          process.map(el => [
            percentToLBSFromGals(el.n_con, el.amount_imported),
            percentToLBSFromGals(el.p_con, el.amount_imported),
            percentToLBSFromGals(el.k_con, el.amount_imported),
            percentToLBSFromGals(el.salt_con, el.amount_imported),
          ])
            .reduce((a, c) => sumArrayByPos(a, c))
          : [0, 0, 0, 0]

        let commercialSolidTotals = commercialSolid.length > 0 ?
          commercialSolid.map(el => [
            percentToLBSFromTons(el.n_con, el.moisture, el.amount_imported, el.method_of_reporting),
            percentToLBSFromTons(el.p_con, el.moisture, el.amount_imported, el.method_of_reporting),
            percentToLBSFromTons(el.k_con, el.moisture, el.amount_imported, el.method_of_reporting),
            percentToLBSFromTons(el.salt_con, el.moisture, el.amount_imported, el.method_of_reporting),
          ])
            .reduce((a, c) => sumArrayByPos(a, c))
          : [0, 0, 0, 0]

        let commercialLiquidTotals = commercialLiquid.length > 0 ?
          commercialLiquid.map(el => [
            percentToLBSFromGals(el.n_con, el.amount_imported),
            percentToLBSFromGals(el.p_con, el.amount_imported),
            percentToLBSFromGals(el.k_con, el.amount_imported),
            percentToLBSFromGals(el.salt_con, el.amount_imported),
          ])
            .reduce((a, c) => sumArrayByPos(a, c))
          : [0, 0, 0, 0]


        // list of summarys and list items for each section: dry, process, and commercial
        resolve({
          'availableNutrientsF': {
            dry,
            process,
            commercial: [...commercialSolid, ...commercialLiquid],
            dryTotals,
            processTotals,
            commercialTotals: [commercialSolidTotals, commercialLiquidTotals]
              .reduce((a, c) => sumArrayByPos(a, c)),
            total: [dryTotals, processTotals, commercialSolidTotals, commercialLiquidTotals]
              .reduce((a, c) => sumArrayByPos(a, c))
          }
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}

const getAvailableNutrientsG = (dairy_id) => {
  return new Promise((resolve, rej) => {
    Promise.all([
      get(`${BASE_URL}/api/export_manifest/material_type/${encodeURIComponent('Dry%')}/${dairy_id}`),
      get(`${BASE_URL}/api/export_manifest/material_type/${encodeURIComponent('Process%')}/${dairy_id}`)
    ])
      .then(([dry, process]) => {



        let dryTotal = dry && dry.length > 0 ?
          dry.map(el => [
            percentToLBSFromTons(el.n_con_mg_kg, el.moisture, el.amount_hauled, el.reporting_method),
            percentToLBSFromTons(el.p_con_mg_kg, el.moisture, el.amount_hauled, el.reporting_method),
            percentToLBSFromTons(el.k_con_mg_kg, el.moisture, el.amount_hauled, el.reporting_method),
            percentToLBSFromTons(el.tfs, el.moisture, el.amount_hauled, el.reporting_method),
          ]).reduce((a, c) => sumArrayByPos(a, c))
          : [0, 0, 0, 0]

        let processTotal = process && process.length > 0 ?
          process.map(el => [
            PPMToLBS(el.kn_con_mg_l, el.amount_hauled),
            PPMToLBS(el.p_con_mg_l, el.amount_hauled),
            PPMToLBS(el.k_con_mg_l, el.amount_hauled),
            PPMToLBS(el.tds, el.amount_hauled),
          ]).reduce((a, c) => sumArrayByPos(a, c))
          : [0, 0, 0, 0]

        // Converting values since values are in percent and need to be displayed in mg/kg
        dry = dry.map(el => {
          el.n_con_mg_kg = parseFloat(el.n_con_mg_kg.replaceAll(',', '')) * 1e4
          el.p_con_mg_kg = parseFloat(el.p_con_mg_kg.replaceAll(',', '')) * 1e4
          el.k_con_mg_kg = parseFloat(el.k_con_mg_kg.replaceAll(',', '')) * 1e4
          return el
        })
        resolve({
          'availableNutrientsG': {
            dry,
            process,
            dryTotal,
            processTotal,
            total: sumArrayByPos(dryTotal, processTotal)
          }
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}


const getApplicationAreaA = (dairy_id) => {
  return new Promise((resolve, rej) => {
    Promise.all([
      get(`${BASE_URL}/api/fields/${dairy_id}`),

      get(`${BASE_URL}/api/field_crop_harvest/${dairy_id}`), // get number of harvests per field
      get(`${BASE_URL}/api/field_crop_app_process_wastewater/${dairy_id}`), // check type of waste applied for field
      get(`${BASE_URL}/api/field_crop_app_solidmanure/${dairy_id}`), // check type of waste applied for field
      get(`${BASE_URL}/api/field_parcel/${dairy_id}`), // get parcel number attached to field
    ])
      .then(([fields, harvests, wastewaters, manures, fieldParcels]) => {
        /**  
         *  Iterate over fields, for each field:
         *    get number of harvest, check waste applied, get parcel numbers
         *    loop through each harvests, wastewaters, manures and field parcels looking for the right key
         *    
         * 
         *  */

        let harvest_counts = {}
        harvests.map(el => {
          harvest_counts[el.field_id] = harvest_counts[el.field_id] ? harvest_counts[el.field_id] + 1 : 1
          return 1
        })

        let wastewater_counts = {}
        wastewaters.map(el => {
          wastewater_counts[el.field_id] = wastewater_counts[el.field_id] ? wastewater_counts[el.field_id] + 1 : 1
          return 1
        })

        let manure_counts = {}
        manures.map(el => {
          manure_counts[el.field_id] = manure_counts[el.field_id] ? manure_counts[el.field_id] + 1 : 1
          return 1
        })

        let fieldParcelObj = {}
        fieldParcels.map(el => {
          fieldParcelObj[el.field_id] = fieldParcelObj[el.field_id] ? [...fieldParcelObj[el.field_id], el.pnumber] : [el.pnumber]
        })

        let total_for_apps = [0, 0, 0]
        let total_NOT_for_apps = [0, 0, 0]
        let total_app_area = [0, 0, 0]

        fields = fields.map(el => {
          let field_id = el.pk
          // get coutns from harvest_counts
          let harvest_count = harvest_counts[field_id] ? harvest_counts[field_id] : 0
          let wastewater_count = wastewater_counts[field_id] ? wastewater_counts[field_id] : 0
          let manure_count = manure_counts[field_id] ? manure_counts[field_id] : 0
          let parcels = fieldParcelObj[field_id] ? fieldParcelObj[field_id] : []
          let waste_type = manure_count > 0 && wastewater_count > 0 ? 'both' : manure_count > 0 ? 'manure' : wastewater_count > 0 ? 'process wastewater' : 'none'

          // acres, croppable, total harvests...
          if (waste_type === 'none') {
            total_NOT_for_apps[0] += toFloat(el.acres)
            total_NOT_for_apps[1] += toFloat(el.cropable)
            total_NOT_for_apps[2] += toFloat(harvest_count)

          } else {
            total_for_apps[0] += toFloat(el.acres)
            total_for_apps[1] += toFloat(el.cropable)
            total_for_apps[2] += toFloat(harvest_count)
          }

          total_app_area[0] += toFloat(el.acres)
          total_app_area[1] += toFloat(el.cropable)
          total_app_area[2] += toFloat(harvest_count)


          return { ...el, harvest_count, waste_type, parcels }
        })

        resolve({
          'applicationAreaA': {
            fields, total_for_apps, total_NOT_for_apps, total_app_area
          }
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}


const getApplicationAreaB = (dairy_id) => {
  return new Promise((resolve, rej) => {
    get(`${BASE_URL}/api/field_crop_harvest/${dairy_id}`)
      .then((harvests) => {
        /** Final Object:
         * groupedHarvests : {
         *    field_pk: {
         *      plant_date: {
         *        harvests: [{...}],
         *        totals: [yield,n,p,k,salt]
         *      }
         *    }
         * }
         */

        let groupedHarvests = groupBySortBy(harvests, 'field_id', 'harvest_date')
        // Obj: grouped by fields  
        groupedHarvests = Object.fromEntries(Object.keys(groupedHarvests).map(key => {
          // Each field_id, group the harvests by plant_date
          let fieldHarvestsObj = groupBySortBy(groupedHarvests[key], 'plant_date', 'harvest_date')
          // For each set of harvests by plant_date, get the totals and store them in the place of the original list... list => {list, totals}
          fieldHarvestsObj = Object.fromEntries(Object.keys(fieldHarvestsObj).map(key => {
            let totals = [0, 0, 0, 0, 0] // Holds totals of yield, n,p,k, salt for summary table
            let harvestsByPlantDate = fieldHarvestsObj[key]
            harvestsByPlantDate.map(el => {
              el.actual_yield = toFloat(el.actual_yield)
              el.actual_n = percentToPPM(el.actual_n) // For display only, not used in calculations or for totals, its just a concentation
              el.actual_p = percentToPPM(el.actual_p) // For display only
              el.actual_k = percentToPPM(el.actual_k) // For display only
              el.tfs = toFloat(el.tfs)
              el.acres_planted = toFloat(el.acres_planted)
              el.actual_moisture = toFloat(el.actual_moisture)


              totals[0] += (el.actual_yield / el.acres_planted)
              totals[1] += toFloat(el.n_lbs_acre)
              totals[2] += toFloat(el.p_lbs_acre)
              totals[3] += toFloat(el.k_lbs_acre)
              // Calculate amount of salt, 
              //  tfs * yield / acre * (1-mositure)
              totals[4] += (el.tfs * 1e-2) * ((el.actual_yield / el.acres_planted) * 2000) * (1 - (el.actual_moisture * 1e-2))
              return
            })
            totals = totals.map(el => el.toFixed(2))
            // Calculate anticipated totals, it is not dependent on the number of harvest events, it is a report on the anticipated yield.
            let harvestObj = harvestsByPlantDate && harvestsByPlantDate.length > 0 ? harvestsByPlantDate[0] : {}
            // typical_ yield, n, p, k, salt
            let antiTotals = [0, 0, 0, 0, 0]
            if (Object.keys(harvestObj).length > 0) {
              let { acres_planted, typical_yield, typical_moisture, typical_n, typical_p, typical_k, typical_salt } = harvestObj
              acres_planted = toFloat(acres_planted)
              typical_yield = toFloat(typical_yield)
              typical_moisture = toFloat(typical_moisture)
              typical_n = toFloat(typical_n)
              typical_p = toFloat(typical_p)
              typical_k = toFloat(typical_k)
              typical_salt = toFloat(typical_salt)


              antiTotals[0] = typical_yield.toFixed(2)
              antiTotals[1] = (typical_n * typical_yield).toFixed(2)
              antiTotals[2] = (typical_p * typical_yield).toFixed(2)
              antiTotals[3] = (typical_k * typical_yield).toFixed(2)
              antiTotals[4] = (typical_salt * typical_yield).toFixed(2)

            }

            // Recreate Object w/ extra info
            return [key, { harvests: harvestsByPlantDate, totals, antiTotals }]
          }))
          // Recreate Object
          return [key, fieldHarvestsObj]
        }))

        resolve({
          'applicationAreaB': {
            harvests,
            groupedHarvests
          }
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}


const getNutrientBudgetA = (dairy_id) => {
  return new Promise((resolve, rej) => {
    Promise.all([
      get(`${BASE_URL}/api/field_crop_app_process_wastewater/${dairy_id}`),
      get(`${BASE_URL}/api/field_crop_app_freshwater/${dairy_id}`),
      get(`${BASE_URL}/api/field_crop_app_solidmanure/${dairy_id}`),
      get(`${BASE_URL}/api/field_crop_app_fertilizer/${dairy_id}`)
    ])
      .then(([processes, freshes, manures, fertilizers]) => {
        let allEvents = [...processes, ...freshes, ...manures, ...fertilizers]

        // Obj, key: field_id, separates all objects by field
        allEvents = groupBySortBy(allEvents, 'field_id', 'plant_date')

        allEvents = Object.fromEntries(Object.keys(allEvents).map(key => {

          let plantDateEventObj = groupBySortBy(allEvents[key], 'plant_date', 'harvest_date')
          plantDateEventObj = Object.fromEntries(Object.keys(plantDateEventObj).map(key => {
            let plantDateEvents = plantDateEventObj[key]
            let appDatesObj = groupBySortBy(plantDateEvents, 'app_date', 'src_desc')
            
            
            
            appDatesObj = Object.fromEntries(Object.keys(appDatesObj).map(key => {
              let appDatesObjList = appDatesObj[key]
              let totals = [0, 0, 0, 0]

              // Total each list NPK, Salt and update *lbs_acre to easily display the total.
              appDatesObjList = appDatesObjList.map(el => {
                // Tricky part with totaling the events is that NPK and salt variable names are not consistent
                if (el.src_type) {
                  // Fresh water
                  totals[0] += toFloat(el.totaln)
                  // p and k are not given in sheet
                  totals[3] += PPMToLBS(el.tds, el.amt_applied_per_acre)
                  
                  // Update for easy display in PDF
                  el.n_lbs_acre = toFloat(el.totaln)
                  el.p_lbs_acre = 0
                  el.k_lbs_acre = 0
                  el.salt_lbs_acre = PPMToLBS(el.tds, el.amt_applied_per_acre)
                } else if (WASTEWATER_MATERIAL_TYPES.indexOf(el.material_type) > -1) {
                  let amt_applied_per_acre = toFloat(el.amount_applied) / toFloat(el.acres_planted)
                  
                  // Process wastewater
                  totals[0] += PPMToLBS(el.kn_con, amt_applied_per_acre)
                  totals[1] += PPMToLBS(el.p_con, amt_applied_per_acre)
                  totals[2] += PPMToLBS(el.k_con, amt_applied_per_acre)
                  totals[3] += PPMToLBS(el.tds, amt_applied_per_acre)
                  // Update vals
                  el.n_lbs_acre = PPMToLBS(el.kn_con, amt_applied_per_acre)  
                  el.p_lbs_acre = PPMToLBS(el.p_con, amt_applied_per_acre)
                  el.k_lbs_acre = PPMToLBS(el.k_con, amt_applied_per_acre)
                  el.salt_lbs_acre = PPMToLBS(el.tds, amt_applied_per_acre)

                } else if ([...NUTRIENT_IMPORT_MATERIAL_TYPES, ...MATERIAL_TYPES].indexOf(el.material_type) > -1) {
                  // Tally up solidmanure or commerical fertilizer
                  totals[0] += toFloat(el.n_lbs_acre)
                  totals[1] += toFloat(el.p_lbs_acre)
                  totals[2] += toFloat(el.k_lbs_acre)
                  totals[3] += toFloat(el.salt_lbs_acre)

                  el.n_lbs_acre = toFloat(el.n_lbs_acre)
                  el.p_lbs_acre = toFloat(el.p_lbs_acre)
                  el.k_lbs_acre = toFloat(el.k_lbs_acre)
                  el.salt_lbs_acre = toFloat(el.salt_lbs_acre)
                }
                return el
              })

              return [key, {appDatesObjList, totals}]
            }))


            return [key, appDatesObj]
          }))

          return [key, plantDateEventObj]
        }))




        resolve({
          'nutrientBudgetA': {
            allEvents
          }
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}