import { zeroTimeDate } from '../convertCalc'
import { BASE_URL } from '../environment'
import { get, post } from '../requests'



// FInish this class and the tests that I was writing that made me start writing this class in the first place....
// PDFTest.js == Replace raw Get and Post calls for creating new dairy and base dairy with this class. 

class Dairy {
    constructor() {

    }

    static async getDairyBaseByCompanyID(companyID) {
        try {
            return await get(`${BASE_URL}/api/dairy_base/${companyID}`)
        } catch (e) {
            return { error: e }
        }
    }

    static async createDairyBase(title, company_id) {
        try {
            return await post(`${BASE_URL}/api/dairy_base/create`, {
                title, company_id
            })
        } catch (e) {
            return { error: e }
        }
    }

    updateDairyBase() { } // Not used yet 

    static async deleteDairyBase(dairyBaseID) {
        try {
            return await post(`${BASE_URL}/api/dairy_base/delete`, { dairyBaseID })
        } catch (e) {
            return e
        }

    }


    static async getDairyByPK(dairy_id) {
        try {
            return await get(`${BASE_URL}/api/dairy/${dairy_id}`)
        } catch (e) {
            return { error: e }
        }
    }

    static async getDairiesByDairyBaseID(baseDairyID) {
        try {
            return await get(`${BASE_URL}/api/dairies/dairyBaseID/${baseDairyID}`)
        } catch (e) {
            return e
        }
    }

    static async createDairy(dairyBaseID, title, reportingYear, company_id) {
        try {
            return await post(`${BASE_URL}/api/dairies/create`, {
                dairyBaseID, title, reportingYear,
                period_start: `1/1/${reportingYear}`, // Default date based on year chosed to create.
                period_end: `12/31/${reportingYear}`,
                company_id
            })
        } catch (e) {
            return { error: e }
        }

    }

    // Depracted
    static async createFullDairy(dairyBaseID, latestDairy, reporting_yr, company_id) {
        try {
            return await post(`${BASE_URL}/api/dairies/full/create`, {
                ...latestDairy, dairyBaseID, reporting_yr,
                period_start: `1/1/${reporting_yr}`, // Default date based on year chosed to create.
                period_end: `12/31/${reporting_yr}`,
                began: zeroTimeDate(new Date(latestDairy.began)),
                company_id
            })
        } catch (e) {
            return { error: e }
        }
    }

    static async updateDairy(street, cross_street, county, city, city_state, city_zip, title, basin_plan, began, period_start, period_end, dairy_id) {
        try {
            return await post(`${BASE_URL}/api/dairies/update`, {
                street, cross_street, county, city, city_state, title, city_zip, basin_plan, began, period_start, period_end, dairy_id
            })
        } catch (e) {
            return { error: e }
        }
    }

    static async deleteDairy(dairy_id) {
        try {
            return await post(`${BASE_URL}/api/dairies/delete`, { dairy_id })
        } catch (e) {
            return { error: e }
        }
    }
}

export { Dairy }