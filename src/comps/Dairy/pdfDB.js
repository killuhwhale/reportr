import { get, post } from '../../utils/requests';
import calculateHerdManNKPNaCl from "../../utils/herdCalculation"


const BASE_URL = `http://localhost:3001`
const PPM_TO_DEC = .000001
export default function mTEA() { }

const lbs_rm_from_ppm_gals = (ppm, gals) => {
  return (ppm * 0.008345) * (gals / 1000)
}

const sumArrayByPos = (a, b, subtract=false) => {
  return a.map((el, i) => subtract?  el - b[i] : el + b[i])
}

export const getAnnualReportData = (dairy_id) => {
  let promises = [
    getDairyInformationA(dairy_id),
    getDairyInformationB(dairy_id),
    getDairyInformationC(dairy_id),
    getAvailableNutrientsAB(dairy_id),
    getAvailableNutrientsC(dairy_id),
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
        console.log(parcels)
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
        console.log(calculateHerdManNKPNaCl(herdInfo[0]))
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

        applied = applied && applied.length > 0 ?
          applied.map((el) => {
            return [
              el.amount_applied,
              lbs_rm_from_ppm_gals(parseFloat(el.kn_con.replaceAll(',', '')), el.amount_applied),
              lbs_rm_from_ppm_gals(parseFloat(el.p_con.replaceAll(',', '')), el.amount_applied),
              lbs_rm_from_ppm_gals(parseFloat(el.k_con.replaceAll(',', '')), el.amount_applied),
              lbs_rm_from_ppm_gals(parseFloat(el.tds.replaceAll(',', '')), el.amount_applied),
            ]
          })
            .reduce((a, c) => sumArrayByPos(a, c) )
          : 0

          exported = exported && exported.length > 0 ?
          exported.map((el) => {
            return [
              el.amount_hauled,
              lbs_rm_from_ppm_gals(parseFloat(el.kn_con_mg_l.replaceAll(',', '')), el.amount_hauled),
              lbs_rm_from_ppm_gals(parseFloat(el.p_con_mg_l.replaceAll(',', '')), el.amount_hauled),
              lbs_rm_from_ppm_gals(parseFloat(el.k_con_mg_l.replaceAll(',', '')), el.amount_hauled),
              lbs_rm_from_ppm_gals(parseFloat(el.tds.replaceAll(',', '')), el.amount_hauled),
            ]
          })
          .reduce((a, c) => sumArrayByPos(a, c))
          : 0
          
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
            .reduce((a, c) => sumArrayByPos(a, c) )
          : [0,0,0,0,0]

        let generated = sumArrayByPos(sumArrayByPos(applied, exported), imported, true)
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
// /api/operators/is_owner/:is_owner/:dairy_id