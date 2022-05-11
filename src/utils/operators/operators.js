import { get, post } from "../../utils/requests"
import { BASE_URL } from "../../utils/environment"

class Operators {
    static async getOperators(dairy_id) {
        try {
            return await get(`${BASE_URL}/api/operators/${dairy_id}`)

        } catch (e) {
            return { error: e.toString() }
        }
    }

    static async createOperator(title, primary_phone, secondary_phone, street, city,
        city_state, city_zip, is_owner, is_operator, is_responsible, dairy_id) {

        try {
            return await post(`${BASE_URL}/api/operators/create`, {
                dairy_id,
                title,
                primary_phone,
                secondary_phone,
                street,
                city,
                city_state,
                city_zip,
                is_owner,
                is_operator,
                is_responsible
            })

        } catch (e) {
            return { error: e.toString() }
        }
    }

    static async updateOperator(title, primary_phone, secondary_phone, street, city,
        city_state, city_zip, is_owner, is_operator, is_responsible, dairy_id) {
        try {
            return await post(`${BASE_URL}/api/operators/update`, {
                dairy_id,
                title,
                primary_phone,
                secondary_phone,
                street,
                city,
                city_state,
                city_zip,
                is_owner,
                is_operator,
                is_responsible
            }
            )

        } catch (e) {
            return { error: e.toString() }
        }
    }

    static async deleteOperator(operator_id, dairy_id) {
        try {
            return await post(`${BASE_URL}/api/operators/delete`, { pk: operator_id, dairy_id })
        } catch (e) {
            return { error: e.toString() }
        }
    }

}

export { Operators }