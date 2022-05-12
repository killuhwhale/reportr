import { get, post } from "../../utils/requests"
import { BASE_URL } from "../../utils/environment"
import {
    HARVEST, PROCESS_WASTEWATER, FRESHWATER, SOLIDMANURE,
    FERTILIZER, SOIL, PLOWDOWN_CREDIT, DRAIN, DISCHARGE, MANURE, WASTEWATER
} from '../../utils/TSV' // Sheetnames


const toLowercaseSpaceToUnderscore = (s) => {
    return s.toLowerCase().replaceAll(' ', '_')
}

export default class TemplateSettings {

    static HARVEST_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(HARVEST)
    static WASTEWATER_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(PROCESS_WASTEWATER)
    static FRESHWATER_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(FRESHWATER)
    static SOLIDMANURE_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(SOLIDMANURE)
    static FERTILIZER_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(FERTILIZER)
    static SOIL_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(SOIL)
    static PLOW_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(PLOWDOWN_CREDIT)
    static TILE_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(DRAIN)
    static DISCHARGE_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(DISCHARGE)
    static SOLIDMANURE_EXPORT_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(MANURE)
    static WASTEWATER_EXPORT_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(WASTEWATER)


    static async lazyGetSettings(dairy_id) {
        try {
            return await get(`${BASE_URL}/settings/lazy/${dairy_id}`)
        } catch (e) {
            return { error: e.toString() }
        }
    }


    static async getSettings(dairy_id) {
        try {
            return await get(`${BASE_URL}/settings/${dairy_id}`)
        } catch (e) {
            return { error: e.toString() }
        }
    }


    static async createSettings(dairy_id) {
        try {
            return await post(`${BASE_URL}/settings/create`, { dairy_id })
        } catch (e) {
            return { error: e.toString() }
        }
    }

    static async updateSettings(template, data, dairy_id) {
        try {
            return await post(`${BASE_URL}/settings/update/${template}`, { data, dairy_id })
        } catch (e) {
            return { error: e.toString() }
        }
    }
    static async deleteSettings(dairy_id) {
        try {
            return await post(`${BASE_URL}/settings/delete`, { dairy_id })
        } catch (e) {
            return { error: e.toString() }
        }
    }
}

