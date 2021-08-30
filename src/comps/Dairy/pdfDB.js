import { get, post } from '../../utils/requests';
import calculateHerdManNKPNaCl from "../../utils/herdCalculation"


const BASE_URL = `http://localhost:3001`
const PPM_TO_DEC = .000001
export default function mTEA() { }

const PPMToLBS = (ppm, gals) => {
  ppm = ppm && typeof(ppm) === typeof('') ? parseFloat(ppm.replaceAll(',', '')) : ppm
  gals = gals && typeof(gals) === typeof('') ? parseFloat(gals.replaceAll(',', '')) : gals

  return (ppm * 0.008345) * (gals / 1000)
}

const mgKGToLBS = (con, amount) => {
  con = con && typeof(con) === typeof('') ? parseFloat(con.replaceAll(',', '')) : con
  amount = amount && typeof(amount) === typeof('') ? parseFloat(amount.replaceAll(',', '')) : amount

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
  con = con && typeof(con) == typeof('') ? parseFloat(con.replaceAll(",", '')) : con 
  moisture = moisture && typeof(moisture) == typeof('') ? parseFloat(moisture.replaceAll(",", '')) : moisture 
  amount = amount && typeof(amount) == typeof('') ? parseFloat(amount.replaceAll(",", '')) : amount 
  
  con *= 0.01 
  moisture *= .01
  moisture = Math.max(Math.min(1, moisture), 0.1) // mositure must be between 0.1% and 100%
  moisture = method_of_reporting === "dry-weight" ? (1 - (moisture)) : 1 // if reported as dry-weight, account for moisture
  amount *= 2000

  console.log('Lbs from Tons calc: ', con, moisture, amount)
  return con * moisture * amount
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
        fieldParcelObj[el.field_id] = fieldParcelObj[el.field_id] ? fieldParcelObj[el.field_id].push(el.pnumber) : [el.pnumber] 
        return 1
      })


      

      fields = fields.map(el => {
        let field_id = el.pk
        // get coutns from harvest_counts
        let harvest_count = harvest_counts[field_id] ? harvest_counts[field_id] : 0
        let wastewater_count = wastewater_counts[field_id] ? wastewater_counts[field_id] : 0
        let manure_count = manure_counts[field_id] ? manure_counts[field_id] : 0
        let parcels = fieldParcelObj[field_id] ? fieldParcelObj[field_id] : []
        let waste_type = manure_count > 0 & wastewater_count > 0  ? 'both' : manure_count > 0 ? 'manure' : wastewater_count > 0 ? 'process wastewater': 'none' 
        // Summary rows, just need to calculate if there was waste applied.... 
        
        return {...el, harvest_count, waste_type, parcels }
      })



      resolve({
          'applicationAreaA': {
            fields
          }
        })
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}
