import { BASE_URL } from '../environment'
import { get, post } from '../requests'

class Field {
    static async getField(dairy_id) {
        try {
            return await get(`${BASE_URL}/api/fields/${dairy_id}`)
        } catch (e) {
            return { error: "Unable to get Field" }
        }
    }

    static async createField(field, dairy_id) {
        try {
            return await post(`${BASE_URL}/api/fields/create`, {
                ...field, dairy_id
            })
        } catch (e) {
            return { error: "Unable to create Field", err: e }
        }
    }

    static async updateField(field, dairy_id) {
        try {
            return await post(`${BASE_URL}/api/fields/update`, {
                ...field, dairy_id
            })
        } catch (e) {
            return { error: "Unable to update Field", err: e }
        }
    }

    static async deleteField(pk, dairy_id) {
        try {
            return await post(`${BASE_URL}/api/fields/delete`, {
                pk, dairy_id
            })
        } catch (e) {
            return { error: "Unable to delete Field", err: e }
        }
    }
}

export { Field }