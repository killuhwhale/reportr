import { get, post } from "../../utils/requests"
import { BASE_URL } from "../../utils/environment"

class Parcels {
    static async getParcels(dairy_id) {
        try {
            return await get(`${BASE_URL}/api/parcels/${dairy_id}`)

        } catch (e) {
            return { error: e.toString() }
        }
    }

    static async createParcel(pnumber, dairy_id) {
        try {
            return await post(`${BASE_URL}/api/parcels/create`, {
                pnumber, dairy_id
            })

        } catch (e) {
            return { error: e.toString() }
        }
    }
    static async updateParcel(parcel, dairy_id) {
        try {
            return await post(`${BASE_URL}/api/parcels/update`, {
                data: { ...parcel, dairy_id }
            }
            )

        } catch (e) {
            return { error: e.toString() }
        }
    }
    static async deleteParcel(parcel_id, dairy_id) {
        try {
            return await post(`${BASE_URL}/api/parcels/delete`, { pk: parcel_id, dairy_id })
        } catch (e) {
            return { error: e.toString() }
        }
    }
    // ---------------------   Field Parcel   -----------------------------------------------------------

    static async getFieldParcels(dairy_id) {
        try {
            return await get(`${BASE_URL}/api/field_parcel/${dairy_id}`)
        } catch (e) {
            return { error: e.toString() }
        }
    }

    static async createFieldParcel(field_id, parcel_id, dairy_id) {
        try {
            return await post(`${BASE_URL}/api/field_parcel/create`, {
                dairy_id,
                field_id: field_id,
                parcel_id: parcel_id
            })
        } catch (e) {
            return { error: e.toString() }
        }
    }
    static async deleteFieldParcel(fieldParcelID, dairy_id) {
        try {
            return await post(`${BASE_URL}/api/field_parcel/delete`, { pk: fieldParcelID, dairy_id })
        } catch (e) {
            return { error: e.toString() }
        }
    }
}

export { Parcels }