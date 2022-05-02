
import { BASE_URL } from "../environment"
import { get, post } from "../requests"
class Herds {
    constructor() {

    }

    static async createHerd(dairy_id) {
        try {
            const res = await post(`${BASE_URL}/api/herds/create`, { dairy_id })
            console.log("Created herd res", res)
            return res
        } catch (e) {
            return { error: 'Error creating herds' }
        }
    }
    static async updateHerd(herds, dairy_id) {
        try {
            return await post(`${BASE_URL}/api/herds/update`, { ...herds, dairy_id })
        } catch (e) {
            return { error: 'Error updating herds' }
        }
    }
    static async getHerd(dairy_id) {
        try {
            const rr = await get(`${BASE_URL}/api/herds/${dairy_id}`)
            console.log("Get herds:: ", rr)
            return rr
        } catch (e) {
            return { error: 'Error getting herds' }
        }
    }
}

export { Herds }