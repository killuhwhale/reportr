import { get, post } from '../requests'
import { BASE_URL } from '../environment'

class Company {
    constructor() {
    }
    static async createCompany(title) {
        return await post(`${BASE_URL}/company/create`, { title })
    }

    static async updateCompany(title) {
        try {
            return await post(`${BASE_URL}/company/update`, { title })
        } catch (err) {
            console.log(err)
            return { error: err }
        }
    }

    static async deleteCompany(pk) {
        try {
            return await post(`${BASE_URL}/company/delete`, { pk })
        } catch (err) {
            console.log(err)
            return { error: err }
        }
    }

    static async getCompany(pk) {
        try {
            return await get(`${BASE_URL}/company/${pk}`)
        } catch (err) {
            console.log(err)
            return { error: err }
        }
    }

    static async getAllCompanies() {
        try {
            return await get(`${BASE_URL}/company`)
        } catch (err) {
            console.log(err)
            return { error: err }
        }
    }
}
export { Company }