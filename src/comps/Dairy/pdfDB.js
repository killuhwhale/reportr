import { get, post } from '../../utils/requests'
import {
  toFloat, opArrayByPos, calcLbsFromTonsAsPercent, calcLbsFromTonsAsMGKG,
  displayPercentageAsMGKG, MGMLToLBS, percentToLBSForGals, percentToLBS
} from '../../utils/convertCalc'
import { formatFloat, groupBySortBy, groupByKeys } from '../../utils/format'
import calculateHerdManNKPNaCl, { getReportingPeriodDays } from "../../utils/herdCalculation"
import { NUTRIENT_IMPORT_MATERIAL_TYPES, MATERIAL_TYPES, WASTEWATER_MATERIAL_TYPES, FRESHWATER_SOURCE_TYPES } from '../../utils/constants'
import { BASE_URL } from "../../utils/environment"
export default function mTEA() { }

// TODO()
const PPM_TO_DEC = .000001
const GALS_PER_ACREINCH = 27154.2856
const AND_RATE = 14 // Atmopheric deopsition rate


export const getAnnualReportData = (dairy_id) => {
  let promises = [
    getDairyInformationA(dairy_id),
    getDairyInformationB(dairy_id),
    getDairyInformationC(dairy_id),
    getAvailableNutrientsAB(dairy_id),
    getAvailableNutrientsC(dairy_id),
    getAvailableNutrientsD(dairy_id),
    getAvailableNutrientsE(dairy_id),
    getAvailableNutrientsF(dairy_id),
    getAvailableNutrientsG(dairy_id),
    getApplicationAreaA(dairy_id),
    getApplicationAreaB(dairy_id),
    getNutrientBudgetA(dairy_id),
    getNutrientBudgetB(dairy_id),
    getNutrientAnalysisA(dairy_id),
    getNaprbalABC(dairy_id),
    getExceptionReportingABC(dairy_id),
    getNmpeaStatementsAB(dairy_id),
    getNotesA(dairy_id),
    getCertificationA(dairy_id),
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
        getReportingPeriodDays(BASE_URL, dairy_id)
          .then(rpDays => {
            let totals = calculateHerdManNKPNaCl(herdInfo[0], rpDays)
              .totals.map(total => new Intl.NumberFormat().format(total.toFixed(2)))

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
    console.log("Getting  getAvailableNutrientsC", dairy_id)

    Promise.all([
      get(`${BASE_URL}/api/field_crop_app_process_wastewater/${dairy_id}`), // applied
      get(`${BASE_URL}/api/export_manifest/wastewater/${dairy_id}`), // exported
      get(`${BASE_URL}/api/nutrient_import/wastewater/${dairy_id}`), // imported
    ])
      .then((res) => {
        let [applied, exported, imported] = res // calculate n,p,k,salt applied + exported - imported
        // for each applied, exported and imported, sum the amount_* applied, hauled, imported for the totals.
        console.log(res)
        // Format input, and calculate n,p,k, salt as a list of nums. Then sum the list of lists in .reduce(). 
        applied = applied && applied.length > 0 ?
          applied.map((el) => {
            return [
              toFloat(el.amount_applied),
              MGMLToLBS(el.kn_con, el.amount_applied),
              MGMLToLBS(el.p_con, el.amount_applied),
              MGMLToLBS(el.k_con, el.amount_applied),
              MGMLToLBS(el.tds, el.amount_applied),
            ]
          })
            .reduce((a, c) => opArrayByPos(a, c))
          : [0, 0, 0, 0, 0]

        exported = exported && exported.length > 0 ?
          exported.map((el) => {
            return [
              toFloat(el.amount_hauled),
              MGMLToLBS(el.kn_con_mg_l, el.amount_hauled),
              MGMLToLBS(el.p_con_mg_l, el.amount_hauled),
              MGMLToLBS(el.k_con_mg_l, el.amount_hauled),
              MGMLToLBS(el.tds, el.amount_hauled),
            ]
          })
            .reduce((a, c) => opArrayByPos(a, c))
          : [0, 0, 0, 0, 0]

        imported = imported && imported.length > 0 ?
          imported.map((el) => {
            return [
              toFloat(el.amount_imported),
              // Import process waste water is recorded in PPM not percent
              MGMLToLBS(el.n_con, el.amount_imported),
              MGMLToLBS(el.p_con, el.amount_imported),
              MGMLToLBS(el.k_con, el.amount_imported),
              MGMLToLBS(el.salt_con, el.amount_imported)
            ]
          })
            .reduce((a, c) => opArrayByPos(a, c))
          : [0, 0, 0, 0, 0]

        let generated = opArrayByPos(opArrayByPos(applied, exported), imported, '-') // can be given true to do subtraction instead
        resolve({
          'availableNutrientsC': {
            applied: applied.map(el => formatFloat(el)),
            exported: exported.map(el => formatFloat(el)),
            imported: imported.map(el => formatFloat(el)),
            generated: generated.map(el => formatFloat(el)),
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
const getAvailableNutrientsE = (dairy_id) => {
  // TODO add is_operator to table, need to add to UI as well to make sure the user can enable this.
  return new Promise((resolve, rej) => {
    get(`${BASE_URL}/api/drain_source/${dairy_id}`)
      .then((sources) => {
        resolve({
          'availableNutrientsE': {
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
  return new Promise((resolve, rej) => {
    Promise.all([
      get(`${BASE_URL}/api/nutrient_import/material_type/${encodeURIComponent('Dry%')}/${dairy_id}`),
      get(`${BASE_URL}/api/nutrient_import/material_type/${encodeURIComponent('Process%')}/${dairy_id}`),
      get(`${BASE_URL}/api/nutrient_import/material_type/${encodeURIComponent('Commercial%olid%')}/${dairy_id}`),
      get(`${BASE_URL}/api/nutrient_import/material_type/${encodeURIComponent('Commercial%iquid%')}/${dairy_id}`)
    ])
      .then(([dry, process, commercialSolid, commercialLiquid]) => {
        // Summary table totals
        // totals n,p,k,salt in lbs (concentration is in percent)
        let dryTotals = dry.length > 0 ?
          // Account for moisture on npk when reporting method is dry-weight, else moisture is 1
          // Account for moistture on salt always. **This doesnt apply to commercial imports
          dry.map(el => [
            // instead of percent
            calcLbsFromTonsAsMGKG(el.n_con, el.moisture, el.amount_imported, el.method_of_reporting),
            calcLbsFromTonsAsMGKG(el.p_con, el.moisture, el.amount_imported, el.method_of_reporting),
            calcLbsFromTonsAsMGKG(el.k_con, el.moisture, el.amount_imported, el.method_of_reporting),
            calcLbsFromTonsAsPercent(el.salt_con, el.moisture, el.amount_imported, "dry-weight"), // Method of reporting doesnt affect, should always acount for moisture, also in percent
          ])
            .reduce((a, c) => opArrayByPos(a, c))
          : [0, 0, 0, 0]

        let processTotals = process.length > 0 ?
          process.map(el => [
            MGMLToLBS(el.n_con, el.amount_imported),
            MGMLToLBS(el.p_con, el.amount_imported),
            MGMLToLBS(el.k_con, el.amount_imported),
            MGMLToLBS(el.salt_con, el.amount_imported),
          ])
            .reduce((a, c) => opArrayByPos(a, c))
          : [0, 0, 0, 0]

        let commercialSolidTotals = commercialSolid.length > 0 ?
          commercialSolid.map(el => [
            calcLbsFromTonsAsPercent(el.n_con, el.moisture, el.amount_imported, el.method_of_reporting),
            calcLbsFromTonsAsPercent(el.p_con, el.moisture, el.amount_imported, el.method_of_reporting),
            calcLbsFromTonsAsPercent(el.k_con, el.moisture, el.amount_imported, el.method_of_reporting),
            calcLbsFromTonsAsPercent(el.salt_con, el.moisture, el.amount_imported, el.method_of_reporting),
          ])
            .reduce((a, c) => opArrayByPos(a, c))
          : [0, 0, 0, 0]

        let commercialLiquidTotals = commercialLiquid.length > 0 ?
          commercialLiquid.map(el => [
            percentToLBSForGals(el.n_con, el.amount_imported),
            percentToLBSForGals(el.p_con, el.amount_imported),
            percentToLBSForGals(el.k_con, el.amount_imported),
            percentToLBSForGals(el.salt_con, el.amount_imported),
          ])
            .reduce((a, c) => opArrayByPos(a, c))
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
              .reduce((a, c) => opArrayByPos(a, c)),
            total: [dryTotals, processTotals, commercialSolidTotals, commercialLiquidTotals]
              .reduce((a, c) => opArrayByPos(a, c))
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
            calcLbsFromTonsAsPercent(el.n_con_mg_kg, el.moisture, el.amount_hauled, el.reporting_method),
            calcLbsFromTonsAsPercent(el.p_con_mg_kg, el.moisture, el.amount_hauled, el.reporting_method),
            calcLbsFromTonsAsPercent(el.k_con_mg_kg, el.moisture, el.amount_hauled, el.reporting_method),
            calcLbsFromTonsAsPercent(el.tfs, el.moisture, el.amount_hauled, el.reporting_method),
          ]).reduce((a, c) => opArrayByPos(a, c))
          : [0, 0, 0, 0]

        let processTotal = process && process.length > 0 ?
          process.map(el => [
            MGMLToLBS(el.kn_con_mg_l, el.amount_hauled),
            MGMLToLBS(el.p_con_mg_l, el.amount_hauled),
            MGMLToLBS(el.k_con_mg_l, el.amount_hauled),
            MGMLToLBS(el.tds, el.amount_hauled),
          ]).reduce((a, c) => opArrayByPos(a, c))
          : [0, 0, 0, 0]

        // Converting values since values are in percent and need to be displayed in mg/kg
        dry = dry && dry.length > 0 ? dry.map(el => {
          el.n_con_mg_kg = parseFloat(el.n_con_mg_kg.replaceAll(',', '')) * 1e4
          el.p_con_mg_kg = parseFloat(el.p_con_mg_kg.replaceAll(',', '')) * 1e4
          el.k_con_mg_kg = parseFloat(el.k_con_mg_kg.replaceAll(',', '')) * 1e4
          return el
        }) : []

        process = process && process.length > 0 ? process : []

        resolve({
          'availableNutrientsG': {
            dry,
            process,
            dryTotal,
            processTotal,
            total: opArrayByPos(dryTotal, processTotal)
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
              const lbs_acre = toFloat(el.actual_yield / el.acres_planted)
              const n_lbs_acre = calcLbsFromTonsAsPercent(el.actual_n, el.actual_moisture, lbs_acre, el.method_of_reporting)
              const p_lbs_acre = calcLbsFromTonsAsPercent(el.actual_p, el.actual_moisture, lbs_acre, el.method_of_reporting)
              const k_lbs_acre = calcLbsFromTonsAsPercent(el.actual_k, el.actual_moisture, lbs_acre, el.method_of_reporting)
              const salt_lbs_acre = calcLbsFromTonsAsPercent(el.tfs, el.actual_moisture, lbs_acre, 'dry-weight')

              totals[0] += lbs_acre
              totals[1] += toFloat(n_lbs_acre)
              totals[2] += toFloat(p_lbs_acre)
              totals[3] += toFloat(k_lbs_acre)
              totals[4] += toFloat(salt_lbs_acre)

              // Format values
              el.actual_yield = toFloat(el.actual_yield)
              el.actual_n = formatFloat(displayPercentageAsMGKG(el.actual_n))
              el.actual_p = formatFloat(displayPercentageAsMGKG(el.actual_p)) // For display only
              el.actual_k = formatFloat(displayPercentageAsMGKG(el.actual_k)) // For display only
              el.tfs = toFloat(el.tfs)
              el.acres_planted = toFloat(el.acres_planted)
              el.actual_moisture = toFloat(el.actual_moisture)
              return
            })

            totals = totals.map(el => formatFloat(el))
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

              antiTotals[0] = formatFloat(typical_yield)
              antiTotals[1] = formatFloat((typical_n * typical_yield))
              antiTotals[2] = formatFloat((typical_p * typical_yield))
              antiTotals[3] = formatFloat((typical_k * typical_yield))
              antiTotals[4] = formatFloat((typical_salt * typical_yield))
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
                if (el.entry_type === "freshwater") {
                  // Fresh water
                  const n_lbs_acre = MGMLToLBS(el.n_con, el.amt_applied_per_acre)
                  totals[0] += n_lbs_acre
                  // p and k are not given in sheet
                  const salt_lbs_acre = MGMLToLBS(el.tds, el.amt_applied_per_acre)
                  totals[3] += salt_lbs_acre

                  // Update for easy display in PDF
                  el.n_lbs_acre = formatFloat(n_lbs_acre)
                  el.p_lbs_acre = 0
                  el.k_lbs_acre = 0
                  el.salt_lbs_acre = formatFloat(salt_lbs_acre)
                } else if (el.entry_type === "wastewater") {
                  let amt_applied_per_acre = toFloat(el.amount_applied) / toFloat(el.acres_planted)

                  // Process wastewater
                  totals[0] += MGMLToLBS(el.kn_con, amt_applied_per_acre)
                  totals[1] += MGMLToLBS(el.p_con, amt_applied_per_acre)
                  totals[2] += MGMLToLBS(el.k_con, amt_applied_per_acre)
                  totals[3] += MGMLToLBS(el.tds, amt_applied_per_acre)
                  // Update vals
                  el.n_lbs_acre = formatFloat(MGMLToLBS(el.kn_con, amt_applied_per_acre))
                  el.p_lbs_acre = formatFloat(MGMLToLBS(el.p_con, amt_applied_per_acre))
                  el.k_lbs_acre = formatFloat(MGMLToLBS(el.k_con, amt_applied_per_acre))
                  el.salt_lbs_acre = formatFloat(MGMLToLBS(el.tds, amt_applied_per_acre))

                }
                else if (el.entry_type === "fertilizer") {
                  // TODO() further separate based on type of fertilizer/ nutrient import
                  const [n_lbs_acre, p_lbs_acre, k_lbs_acre, salt_lbs_acre] = calculateFertilizer(el)
                  console.log('_LBS_ACREx', n_lbs_acre, p_lbs_acre, k_lbs_acre, salt_lbs_acre)
                  totals[0] += toFloat(n_lbs_acre)
                  totals[1] += toFloat(p_lbs_acre)
                  totals[2] += toFloat(k_lbs_acre)
                  totals[3] += toFloat(salt_lbs_acre)

                  el.n_lbs_acre = formatFloat(toFloat(n_lbs_acre))
                  el.p_lbs_acre = formatFloat(toFloat(p_lbs_acre))
                  el.k_lbs_acre = formatFloat(toFloat(k_lbs_acre))
                  el.salt_lbs_acre = formatFloat(toFloat(salt_lbs_acre))
                }
                else if (el.entry_type === "manure") {
                  const lbs_acre = toFloat(el.amount_applied) / toFloat(el.acres_planted)
                  const n_lbs_acre = calcLbsFromTonsAsPercent(el.n_con, el.moisture, lbs_acre, el.method_of_reporting)
                  const p_lbs_acre = calcLbsFromTonsAsPercent(el.p_con, el.moisture, lbs_acre, el.method_of_reporting)
                  const k_lbs_acre = calcLbsFromTonsAsPercent(el.k_con, el.moisture, lbs_acre, el.method_of_reporting)
                  const salt_lbs_acre = calcLbsFromTonsAsPercent(el.salt_con, el.moisture, lbs_acre, el.method_of_reporting)
                  totals[0] += toFloat(n_lbs_acre)
                  totals[1] += toFloat(p_lbs_acre)
                  totals[2] += toFloat(k_lbs_acre)
                  totals[3] += toFloat(salt_lbs_acre)

                  el.n_lbs_acre = formatFloat(toFloat(n_lbs_acre))
                  el.p_lbs_acre = formatFloat(toFloat(p_lbs_acre))
                  el.k_lbs_acre = formatFloat(toFloat(k_lbs_acre))
                  el.salt_lbs_acre = formatFloat(toFloat(salt_lbs_acre))
                }
                el.amount_applied = formatFloat(el.amount_applied)
                return el
              })

              return [key, { appDatesObjList, totals: totals.map(t => formatFloat(t)) }]
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


const calculateFertilizer = (ev) => {
  let n_lbs_acre = 0
  let p_lbs_acre = 0
  let k_lbs_acre = 0
  let salt_lbs_acre = 0

  if (ev.material_type === NUTRIENT_IMPORT_MATERIAL_TYPES[1] || ev.material_type === NUTRIENT_IMPORT_MATERIAL_TYPES[3]) {
    // == Commercial Solid
    console.log("Ev for fertilizer:commericalSolid", ev)
    n_lbs_acre = percentToLBS(ev.n_con, ev.amount_applied)
    p_lbs_acre = percentToLBS(ev.p_con, ev.amount_applied)
    k_lbs_acre = percentToLBS(ev.k_con, ev.amount_applied)
    salt_lbs_acre = percentToLBS(ev.salt_con, ev.amount_applied)

  } else if (ev.material_type === NUTRIENT_IMPORT_MATERIAL_TYPES[0] || ev.material_type === NUTRIENT_IMPORT_MATERIAL_TYPES[2]) {  // === Commer Liquid
    n_lbs_acre = percentToLBSForGals(ev.n_con, ev.amount_applied)
    p_lbs_acre = percentToLBSForGals(ev.p_con, ev.amount_applied)
    k_lbs_acre = percentToLBSForGals(ev.k_con, ev.amount_applied)
    salt_lbs_acre = percentToLBSForGals(ev.salt_con, ev.amount_applied)

  }
  else if (NUTRIENT_IMPORT_MATERIAL_TYPES.slice(4, 8).indexOf(ev.material_type) >= 0) {
    // === dry manure
    console.log("Ev for fertilizer:drymanure", ev)
    n_lbs_acre = calcLbsFromTonsAsPercent(ev.n_con, ev.moisture, ev.amount_applied, ev.method_of_reporting)

    p_lbs_acre = calcLbsFromTonsAsPercent(ev.p_con, ev.moisture, ev.amount_applied / 2000, ev.method_of_reporting)
    k_lbs_acre = calcLbsFromTonsAsPercent(ev.k_con, ev.moisture, ev.amount_applied / 2000, ev.method_of_reporting)
    salt_lbs_acre = calcLbsFromTonsAsPercent(ev.salt_con, ev.moisture, ev.amount_applied / 2000, ev.method_of_reporting)
  } else if (NUTRIENT_IMPORT_MATERIAL_TYPES.slice(9, 10).indexOf(ev.material_type) >= 0) {
    // === process wastewater
    n_lbs_acre = MGMLToLBS(ev.n_con, ev.amount_applied)
    p_lbs_acre = MGMLToLBS(ev.p_con, ev.amount_applied)
    k_lbs_acre = MGMLToLBS(ev.k_con, ev.amount_applied)
    salt_lbs_acre = MGMLToLBS(ev.salt_con, ev.amount_applied)
  }
  return [n_lbs_acre, p_lbs_acre, k_lbs_acre, salt_lbs_acre]
}

const getNutrientBudgetInfo = (dairy_id) => {
  return new Promise((resolve, rej) => {
    Promise.all([
      get(`${BASE_URL}/api/field_crop_app_plowdown_credit/${dairy_id}`),
      get(`${BASE_URL}/api/field_crop_app_soil/${dairy_id}`),
      get(`${BASE_URL}/api/field_crop_app_fertilizer/${dairy_id}`),
      get(`${BASE_URL}/api/field_crop_app_solidmanure/${dairy_id}`),
      get(`${BASE_URL}/api/field_crop_app_process_wastewater/${dairy_id}`),
      get(`${BASE_URL}/api/field_crop_app_freshwater/${dairy_id}`),
      get(`${BASE_URL}/api/field_crop_harvest/${dairy_id}`),
    ])
      .then(([plows, soils, fertilizers, manures, wastewaters, freshwaters, harvests]) => {
        let allEvents = groupByKeys([
          ...plows,
          ...soils,
          ...fertilizers,
          ...manures,
          ...wastewaters,
          ...freshwaters,
          ...harvests
        ], ['fieldtitle', 'plant_date'])

        // Sum harvests by field to help calculate atmospheric_depo
        let totalHarvestByFieldId = {}
        harvests.forEach(el => {
          totalHarvestByFieldId[el.field_id] = totalHarvestByFieldId[el.field_id] ? totalHarvestByFieldId[el.field_id] + 1 : 1
        })

        // Stores all total applciations for dairy in LBS
        // Used in Chart displaying Totals in Lbs
        let infoLBS = {
          soils: [0, 0, 0, 0],
          plows: [0, 0, 0, 0],
          fertilizers: [0, 0, 0, 0],
          manures: [0, 0, 0, 0],
          wastewaters: [0, 0, 0, 0],
          freshwaters: [0, 0, 0, 0],
          anti_harvests: [0, 0, 0, 0],
          actual_harvests: [0, 0, 0, 0],
          freshwater_app: [0, 0, 0],
          wastewater_app: [0, 0, 0],
          total_app: [0, 0, 0, 0],
          nutrient_bal: [0, 0, 0, 0],
          nutrient_bal_ratio: [0, 0, 0, 0],
          atmospheric_depo: 0
        }

        allEvents = Object.fromEntries(Object.keys(allEvents).sort().map(key => {
          let events = allEvents[key]
          let headerInfo = events && events.length > 0 ? events[0] : {}
          // Stores all total application for each fieldCrop (field & plant date) LBS/ ACRE
          let info = {
            soils: [0, 0, 0, 0],
            plows: [0, 0, 0, 0],
            fertilizers: [0, 0, 0, 0],
            manures: [0, 0, 0, 0],
            wastewaters: [0, 0, 0, 0],
            freshwaters: [0, 0, 0, 0],
            anti_harvests: [0, 0, 0, 0],
            actual_harvests: [0, 0, 0, 0],
            freshwater_app: [0, 0, 0],
            wastewater_app: [0, 0, 0],
            total_app: [0, 0, 0, 0],
            nutrient_bal: [0, 0, 0, 0],
            nutrient_bal_ratio: [0, 0, 0, 0],
            totalHarvests: 0,
            acres_planted: toFloat(headerInfo.acres_planted)
          }


          // TODO instead of using _lbs_acre, use raw info, dont use calculated fields from spreadsheet.
          events.map(ev => {
            if (ev.entry_type === 'soil') {
              // This is calculated by the program when created via uploading spreadsheet.
              // Testing in the calc gave me the number 4.... 1mg/kg  == 4lbs/acre
              let n_lbs_acre = (toFloat(ev.n_con_0) + toFloat(ev.n_con_1) + toFloat(ev.n_con_2)) * 4.0 || 0
              let p_lbs_acre = (toFloat(ev.p_con_0) + toFloat(ev.p_con_1) + toFloat(ev.p_con_2)) * 4.0 || 0
              let k_lbs_acre = (toFloat(ev.k_con_0) + toFloat(ev.k_con_1) + toFloat(ev.k_con_2)) * 4.0 || 0
              let salt_lbs_acre = (toFloat(ev.ec_0) + toFloat(ev.ec_1) + toFloat(ev.ec_2)) * 2.4 || 0

              info.soils[0] += toFloat(n_lbs_acre)
              info.soils[1] += toFloat(p_lbs_acre)
              info.soils[2] += toFloat(k_lbs_acre)
              info.soils[3] += toFloat(salt_lbs_acre)

              infoLBS.soils[0] += toFloat(n_lbs_acre) * toFloat(ev.acres_planted)
              infoLBS.soils[1] += toFloat(p_lbs_acre) * toFloat(ev.acres_planted)
              infoLBS.soils[2] += toFloat(k_lbs_acre) * toFloat(ev.acres_planted)
              infoLBS.soils[3] += toFloat(salt_lbs_acre) * toFloat(ev.acres_planted)
            }
            else if (ev.entry_type === 'plowdown') {
              infoLBS.plows[0] += toFloat(ev.n_lbs_acre) * toFloat(ev.acres_planted)
              infoLBS.plows[1] += toFloat(ev.p_lbs_acre) * toFloat(ev.acres_planted)
              infoLBS.plows[2] += toFloat(ev.k_lbs_acre) * toFloat(ev.acres_planted)
              infoLBS.plows[3] += toFloat(ev.salt_lbs_acre) * toFloat(ev.acres_planted)

              info.plows[0] += toFloat(ev.n_lbs_acre)
              info.plows[1] += toFloat(ev.p_lbs_acre)
              info.plows[2] += toFloat(ev.k_lbs_acre)
              info.plows[3] += toFloat(ev.salt_lbs_acre)
            }
            else if (ev.entry_type === 'fertilizer') {
              // Calc total app in LBS)else if
              // Depending on material_type, this will need to be calculated differently....
              if (ev.material_type === NUTRIENT_IMPORT_MATERIAL_TYPES[1] || ev.material_type === NUTRIENT_IMPORT_MATERIAL_TYPES[3]) {
                // == Commercial Solid
                infoLBS.fertilizers[0] += percentToLBS(ev.n_con, ev.amount_applied)
                infoLBS.fertilizers[1] += percentToLBS(ev.p_con, ev.amount_applied)
                infoLBS.fertilizers[2] += percentToLBS(ev.k_con, ev.amount_applied)
                infoLBS.fertilizers[3] += percentToLBS(ev.salt_con, ev.amount_applied)

              } else if (ev.material_type === NUTRIENT_IMPORT_MATERIAL_TYPES[0] || ev.material_type === NUTRIENT_IMPORT_MATERIAL_TYPES[2]) {  // === Commer Liquid
                infoLBS.fertilizers[0] += percentToLBSForGals(ev.n_con, ev.amount_applied)
                infoLBS.fertilizers[1] += percentToLBSForGals(ev.p_con, ev.amount_applied)
                infoLBS.fertilizers[2] += percentToLBSForGals(ev.k_con, ev.amount_applied)
                infoLBS.fertilizers[3] += percentToLBSForGals(ev.salt_con, ev.amount_applied)
              }
              else if (NUTRIENT_IMPORT_MATERIAL_TYPES.slice(4, 8).indexOf(ev.material_type) >= 0) {
                // === dry manure
                infoLBS.fertilizers[0] += calcLbsFromTonsAsPercent(ev.n_con, ev.moisture, ev.amount_applied, ev.method_of_reporting)
                infoLBS.fertilizers[1] += calcLbsFromTonsAsPercent(ev.p_con, ev.moisture, ev.amount_applied, ev.method_of_reporting)
                infoLBS.fertilizers[2] += calcLbsFromTonsAsPercent(ev.k_con, ev.moisture, ev.amount_applied, ev.method_of_reporting)
                infoLBS.fertilizers[3] += calcLbsFromTonsAsPercent(ev.salt_con, ev.moisture, ev.amount_applied, ev.method_of_reporting)
              } else if (NUTRIENT_IMPORT_MATERIAL_TYPES.slice(9, 10).indexOf(ev.material_type) >= 0) {
                // === process wastewater
                infoLBS.fertilizers[0] += MGMLToLBS(ev.n_con, ev.amount_applied)
                infoLBS.fertilizers[1] += MGMLToLBS(ev.p_con, ev.amount_applied)
                infoLBS.fertilizers[2] += MGMLToLBS(ev.k_con, ev.amount_applied)
                infoLBS.fertilizers[3] += MGMLToLBS(ev.salt_con, ev.amount_applied)
              }


            } else if (ev.entry_type === 'manure') {
              const lbs_acre = toFloat(ev.amount_applied) / toFloat(ev.acres_planted)
              info.manures[0] += calcLbsFromTonsAsPercent(ev.n_con, ev.moisture, lbs_acre, ev.method_of_reporting)
              info.manures[1] += calcLbsFromTonsAsPercent(ev.p_con, ev.moisture, lbs_acre, ev.method_of_reporting)
              info.manures[2] += calcLbsFromTonsAsPercent(ev.k_con, ev.moisture, lbs_acre, ev.method_of_reporting)
              info.manures[3] += calcLbsFromTonsAsPercent(ev.salt_con, ev.moisture, lbs_acre, ev.method_of_reporting)

              infoLBS.manures[0] += calcLbsFromTonsAsPercent(ev.n_con, ev.moisture, ev.amount_applied, ev.method_of_reporting)
              infoLBS.manures[1] += calcLbsFromTonsAsPercent(ev.p_con, ev.moisture, ev.amount_applied, ev.method_of_reporting)
              infoLBS.manures[2] += calcLbsFromTonsAsPercent(ev.k_con, ev.moisture, ev.amount_applied, ev.method_of_reporting)
              infoLBS.manures[3] += calcLbsFromTonsAsPercent(ev.salt_con, ev.moisture, ev.amount_applied, ev.method_of_reporting)
            } else if (ev.entry_type === 'freshwater') {
              info.freshwater_app[0] += toFloat(ev.amount_applied)
              let acreInches = toFloat(ev.amount_applied) / GALS_PER_ACREINCH
              let inchesPerAcre = acreInches / toFloat(ev.acres_planted)
              info.freshwater_app[1] += toFloat(acreInches)
              info.freshwater_app[2] += toFloat(inchesPerAcre)

              info.freshwaters[0] += MGMLToLBS(ev.n_con, ev.amt_applied_per_acre)
              info.freshwaters[3] += MGMLToLBS(ev.tds, ev.amt_applied_per_acre)

              infoLBS.freshwaters[0] += MGMLToLBS(ev.n_con, ev.amount_applied)
              infoLBS.freshwaters[3] += MGMLToLBS(ev.tds, ev.amount_applied)

            } else if (ev.entry_type === 'wastewater') {
              info.wastewater_app[0] += toFloat(ev.amount_applied)
              let acreInches = (toFloat(ev.amount_applied) / GALS_PER_ACREINCH)
              let inchesPerAcre = acreInches / toFloat(ev.acres_planted)
              info.wastewater_app[1] += toFloat(acreInches)
              info.wastewater_app[2] += toFloat(inchesPerAcre)

              info.wastewaters[0] += MGMLToLBS(ev.kn_con, toFloat(ev.amount_applied / toFloat(ev.acres_planted)))
              info.wastewaters[1] += MGMLToLBS(ev.p_con, toFloat(ev.amount_applied / toFloat(ev.acres_planted)))
              info.wastewaters[2] += MGMLToLBS(ev.k_con, toFloat(ev.amount_applied / toFloat(ev.acres_planted)))
              info.wastewaters[3] += MGMLToLBS(ev.tds, toFloat(ev.amount_applied / toFloat(ev.acres_planted)))


              infoLBS.wastewaters[0] += MGMLToLBS(ev.kn_con, ev.amount_applied)
              infoLBS.wastewaters[1] += MGMLToLBS(ev.p_con, ev.amount_applied)
              infoLBS.wastewaters[2] += MGMLToLBS(ev.k_con, ev.amount_applied)
              infoLBS.wastewaters[3] += MGMLToLBS(ev.tds, ev.amount_applied)

            } else if (ev.entry_type === 'harvest') {
              info.totalHarvests += 1

              ev.typical_yield = toFloat(ev.typical_yield)
              info.anti_harvests[0] += toFloat(ev.typical_n) * ev.typical_yield
              info.anti_harvests[1] += toFloat(ev.typical_p) * ev.typical_yield
              info.anti_harvests[2] += toFloat(ev.typical_k) * ev.typical_yield
              info.anti_harvests[3] += toFloat(ev.typical_salt) * ev.typical_yield

              const typical_lbs_acre = toFloat(ev.typical_yield) * toFloat(ev.acres_planted)
              infoLBS.anti_harvests[0] += toFloat(ev.typical_n) * typical_lbs_acre
              infoLBS.anti_harvests[1] += toFloat(ev.typical_p) * typical_lbs_acre
              infoLBS.anti_harvests[2] += toFloat(ev.typical_k) * typical_lbs_acre
              infoLBS.anti_harvests[3] += toFloat(ev.typical_salt) * typical_lbs_acre

              const lbs_acre = toFloat(ev.actual_yield) / toFloat(ev.acres_planted)
              const n_lbs_acre = calcLbsFromTonsAsPercent(ev.actual_n, ev.actual_moisture, lbs_acre, ev.method_of_reporting)
              const p_lbs_acre = calcLbsFromTonsAsPercent(ev.actual_p, ev.actual_moisture, lbs_acre, ev.method_of_reporting)
              const k_lbs_acre = calcLbsFromTonsAsPercent(ev.actual_k, ev.actual_moisture, lbs_acre, ev.method_of_reporting)
              const salt_lbs_acre = calcLbsFromTonsAsPercent(ev.tfs, ev.actual_moisture, lbs_acre, 'dry-weight')

              info.actual_harvests[0] += n_lbs_acre
              info.actual_harvests[1] += p_lbs_acre
              info.actual_harvests[2] += k_lbs_acre
              info.actual_harvests[3] += salt_lbs_acre

              infoLBS.actual_harvests[0] += n_lbs_acre * lbs_acre
              infoLBS.actual_harvests[1] += p_lbs_acre * lbs_acre
              infoLBS.actual_harvests[2] += k_lbs_acre * lbs_acre
              infoLBS.actual_harvests[3] += salt_lbs_acre * lbs_acre
            }
          })
          // Atmospheric deposition
          // 14 pounds wet and dry deposition per planted crop acre per year
          // = RATE / (# of harvests for all crops on the field) * (of harvests for the crop)
          let total_app = opArrayByPos(info.soils, opArrayByPos(info.plows, opArrayByPos(info.fertilizers, opArrayByPos(info.manures, opArrayByPos(info.wastewaters, info.freshwaters)))))

          const fieldAndCropHarvestCount = toFloat(totalHarvestByFieldId[headerInfo.field_id]) * info.totalHarvests
          let atmospheric_depo = AND_RATE / (fieldAndCropHarvestCount !== 0.0 ? fieldAndCropHarvestCount : 1)

          info.atmospheric_depo = atmospheric_depo  // Amount of nitrogen depositied by the atmosphere
          infoLBS.atmospheric_depo += atmospheric_depo

          // Add atmospheric depo to total nitrogen applied on a per field basis
          total_app[0] += atmospheric_depo
          info.total_app = total_app // update applcations totals
          info.headerInfo = headerInfo // Info for field and plant date.

          info.nutrient_bal = opArrayByPos(info.total_app, info.actual_harvests, '-')
          info.nutrient_bal_ratio = opArrayByPos(info.total_app, info.actual_harvests, '/')


          return [key, info]
        }))

        resolve({
          'nutrientBudgetB': {
            allEvents, totalAppsSummary: infoLBS
          }
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}


const getNutrientBudgetB = (dairy_id) => {
  return getNutrientBudgetInfo(dairy_id)
}

const getNutrientAnalysisA = (dairy_id) => {
  return new Promise((resolve, rej) => {

    Promise.all([
      get(`${BASE_URL}/api/field_crop_app_solidmanure_analysis/${dairy_id}`),
      get(`${BASE_URL}/api/field_crop_app_process_wastewater_analysis/${dairy_id}`),
      get(`${BASE_URL}/api/field_crop_app_freshwater_analysis/${dairy_id}`),
      get(`${BASE_URL}/api/field_crop_app_soil_analysis/${dairy_id}`),
      get(`${BASE_URL}/api/field_crop_harvest/${dairy_id}`),
      get(`${BASE_URL}/api/drain_analysis/${dairy_id}`),
    ])
      .then(([manures, wastewaters, freshwaters, soils, harvests, drains]) => {
        // Fresh water grouped by src_desc
        freshwaters = groupByKeys(freshwaters, ['src_desc'])

        // Format values 
        manures = manures.map(el => {
          el.n_con = formatFloat(displayPercentageAsMGKG(el.n_con))
          el.p_con = formatFloat(displayPercentageAsMGKG(el.p_con))
          el.k_con = formatFloat(displayPercentageAsMGKG(el.k_con))
          el.ca_con = formatFloat(displayPercentageAsMGKG(el.ca_con))
          el.mg_con = formatFloat(displayPercentageAsMGKG(el.mg_con))
          el.na_con = formatFloat(displayPercentageAsMGKG(el.na_con))
          el.s_con = formatFloat(displayPercentageAsMGKG(el.s_con))
          el.cl_con = formatFloat(displayPercentageAsMGKG(el.cl_con))
          el.n_dl = formatFloat(el.n_dl)
          el.p_dl = formatFloat(el.p_dl)
          el.k_dl = formatFloat(el.k_dl)
          el.ca_dl = formatFloat(el.ca_dl)
          el.mg_dl = formatFloat(el.mg_dl)
          el.na_dl = formatFloat(el.na_dl)
          el.s_dl = formatFloat(el.s_dl)
          el.cl_dl = formatFloat(el.cl_dl)
          el.tfs_dl = formatFloat(el.tfs_dl)

          return el
        })
        // Format values 
        wastewaters = wastewaters.map(el => {
          el.kn_con = formatFloat(el.kn_con)
          el.nh4_con = formatFloat(el.nh4_con)
          el.nh3_con = formatFloat(el.nh3_con)
          el.no3_con = formatFloat(el.no3_con)
          el.p_con = formatFloat(el.p_con)
          el.k_con = formatFloat(el.k_con)
          el.ca_con = formatFloat(el.ca_con)
          el.mg_con = formatFloat(el.mg_con)
          el.na_con = formatFloat(el.na_con)
          el.hco3_con = formatFloat(el.hco3_con)
          el.co3_con = formatFloat(el.co3_con)
          el.so4_con = formatFloat(el.so4_con)
          el.cl_con = formatFloat(el.cl_con)
          el.ec = formatFloat(el.ec)
          el.tds = formatFloat(el.tds)

          el.kn_dl = formatFloat(el.kn_dl)
          el.nh4_dl = formatFloat(el.nh4_dl)
          el.nh3_dl = formatFloat(el.nh3_dl)
          el.no3_dl = formatFloat(el.no3_dl)
          el.p_dl = formatFloat(el.p_dl)
          el.k_dl = formatFloat(el.k_dl)
          el.ca_dl = formatFloat(el.ca_dl)
          el.mg_dl = formatFloat(el.mg_dl)
          el.na_dl = formatFloat(el.na_dl)
          el.hco3_dl = formatFloat(el.hco3_dl)
          el.co3_dl = formatFloat(el.co3_dl)
          el.so4_dl = formatFloat(el.so4_dl)
          el.cl_dl = formatFloat(el.cl_dl)
          el.ec_dl = formatFloat(el.ec_dl)
          el.tds_dl = formatFloat(el.tds_dl)

          return el
        })
        // Format values 
        harvests = harvests.map(el => {
          el.actual_n = formatFloat(displayPercentageAsMGKG(el.actual_n))
          el.actual_p = formatFloat(displayPercentageAsMGKG(el.actual_p))
          el.actual_k = formatFloat(displayPercentageAsMGKG(el.actual_k))
          el.tfs = formatFloat(el.tfs)

          el.n_dl = formatFloat(el.n_dl)
          el.p_dl = formatFloat(el.p_dl)
          el.k_dl = formatFloat(el.k_dl)
          el.tfs_dl = formatFloat(el.tfs_dl)

          return el
        })
        harvests = groupByKeys(harvests, ['field_id', 'plant_date', 'croptitle'])

        drains = drains.map(el => {
          el.nh4_con = formatFloat(el.nh4_con)
          el.no2_con = formatFloat(el.no2_con)
          el.p_con = formatFloat(el.p_con)
          el.ec = formatFloat(el.ec)
          el.tds = formatFloat(el.tds)
          el.nh4_dl = formatFloat(el.nh4_dl)
          el.no2_dl = formatFloat(el.no2_dl)
          el.p_dl = formatFloat(el.p_dl)
          el.ec_dl = formatFloat(el.ec_dl)
          el.tds_dl = formatFloat(el.tds_dl)
          return el
        })
        drains = groupByKeys(drains, ['drain_source_id'])

        soils = soils.map(el => {
          el.n_con = formatFloat(el.n_con)
          el.total_p_con = formatFloat(el.total_p_con)
          el.p_con = formatFloat(el.p_con)
          el.k_con = formatFloat(el.k_con)
          el.ec = formatFloat(el.ec)
          el.org_matter = formatFloat(el.org_matter)
          el.n_dl = formatFloat(el.n_dl)
          el.total_p_dl = formatFloat(el.total_p_dl)
          el.p_dl = formatFloat(el.p_dl)
          el.k_dl = formatFloat(el.k_dl)
          el.ec_dl = formatFloat(el.ec_dl)
          el.org_matter_dl = formatFloat(el.org_matter_dl)
          return el
        })
        soils = groupByKeys(soils, ['field_id'])

        resolve({
          'nutrientAnalysis': {
            manures, wastewaters, freshwaters, soils, harvests, drains
          }
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}


const getNaprbalABC = (dairy_id) => {
  // Summary information is used for section B chart.
  return new Promise((resolve, rej) => {
    getNutrientBudgetInfo(dairy_id)
      .then(summary => {
        summary = summary && summary.nutrientBudgetB && summary.nutrientBudgetB.totalAppsSummary && Object.keys(summary.nutrientBudgetB.totalAppsSummary).length > 0 ? summary.nutrientBudgetB.totalAppsSummary : {}

        let total_app = opArrayByPos(summary.fertilizers, opArrayByPos(summary.manures, opArrayByPos(summary.wastewaters, summary.freshwaters)))
        summary.nutrient_bal = opArrayByPos(total_app, summary.actual_harvests, '-')
        summary.nutrient_bal_ratio = opArrayByPos(total_app, summary.actual_harvests, '/')
        summary.total_app = total_app

        resolve({
          'naprbalA': summary
        })
        return
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}

const getExceptionReportingABC = (dairy_id) => {
  return new Promise((resolve, rej) => {
    get(`${BASE_URL}/api/discharge/${dairy_id}`)
      .then((discharges) => {
        discharges = discharges && discharges.test === undefined ? discharges : []
        console.log('Discharges', discharges)

        discharges = groupByKeys(discharges, ['discharge_type'])


        resolve({
          'exceptionReportingABC': discharges
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}

const getNmpeaStatementsAB = (dairy_id) => {
  return new Promise((resolve, rej) => {
    get(`${BASE_URL}/api/agreement/${dairy_id}`)
      .then(([statement]) => {
        statement = statement && statement.test === undefined ? statement : {}

        resolve({
          'nmpeaStatementsAB': statement
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}

const getNotesA = (dairy_id) => {
  return new Promise((resolve, rej) => {
    get(`${BASE_URL}/api/note/${dairy_id}`)
      .then(([note]) => {
        note = note && note.test === undefined ? note : {}
        resolve({
          'notesA': note
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}

const getCertificationA = (dairy_id) => {
  return new Promise((resolve, rej) => {
    get(`${BASE_URL}/api/certification/${dairy_id}`)
      .then(([certification]) => {
        certification = certification && certification.test === undefined ? certification : {}
        resolve({
          'certificationA': certification
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}



export { getNutrientBudgetInfo };