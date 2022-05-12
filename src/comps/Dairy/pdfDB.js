/** Client Side API to fetch Data about Annual Report AKA Data Summary
 * 
 */
import { get } from '../../utils/requests'
import { BASE_URL } from "../../utils/environment"

// Used in tests to verify data...
const getAnnualReportData = async (dairy_id) => {
  try {
    return await get(`${BASE_URL}/annualReportData/dairy/${dairy_id}`)

  } catch (e) {
    return { error: 'Error getting annual report data.... ' }
  }


}

// Used to show application summary in chart
const getNutrientBudgetInfo = async (dairy_id) => {
  try {
    return await get(`${BASE_URL}/annualReportData/getNutrientBudgetInfo/${dairy_id}`)
  } catch (e) {
    console.log(e)
    return { error: 'Error getting getNutrientBudgetInfo.... ' }
  }


}

// TODO create an endpoint for this. Used in exports tab
const getAvailableNutrientsG = async (dairy_id) => {
  try {
    return await get(`${BASE_URL}/annualReportData/getAvailableNutrientsG/${dairy_id}`)

  } catch (e) {
    console.log(e)
    return { error: 'Error getting getNutrientBudgetInfo.... ' }
  }
}

export { getAnnualReportData, getNutrientBudgetInfo, getAvailableNutrientsG }
