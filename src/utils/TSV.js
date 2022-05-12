import { get, post, postXLSX } from './requests'

import { BASE_URL } from "./environment"
import {
    harvestTemplate, wwTemplate, fwTemplate, smTemplate, cfTemplate, smExportTemplate,
    wwExportTemplate, soilTemplate, plowdownTemplate, tiledrainageTemplate, dischargeTemplate
} from './tsvTemplates'


export default function mTea() { }

export const HARVEST = 'Production Records'
export const PROCESS_WASTEWATER = 'WW Applications'
export const FRESHWATER = 'FW Applications'
export const SOLIDMANURE = 'SM Applications'
export const FERTILIZER = 'Commercial Fertilizer'
export const SOIL = 'Soil Analyses'
export const PLOWDOWN_CREDIT = 'Plowdown Credit'
export const DRAIN = 'Tile Drainage Systems'
export const DISCHARGE = 'Discharges'
export const MANURE = 'SM Exports'
export const WASTEWATER = 'WW Exports'

export const SHEET_NAMES = [
    HARVEST, PROCESS_WASTEWATER, FRESHWATER, SOLIDMANURE, FERTILIZER, SOIL, PLOWDOWN_CREDIT, DRAIN, DISCHARGE, MANURE, WASTEWATER,
]

export const TSV_INFO = {
    [DISCHARGE]: {
        tsvType: DISCHARGE,
        template: dischargeTemplate,
    },
    [DRAIN]: {
        tsvType: DRAIN,
        template: tiledrainageTemplate,
    },
    [PLOWDOWN_CREDIT]: {
        tsvType: PLOWDOWN_CREDIT,
        template: plowdownTemplate,
    },
    [SOIL]: {
        tsvType: SOIL,
        template: soilTemplate,
    },
    [HARVEST]: {
        tsvType: HARVEST,
        template: harvestTemplate,
    },
    [PROCESS_WASTEWATER]: {
        tsvType: PROCESS_WASTEWATER,
        template: wwTemplate,
    },
    [FRESHWATER]: {
        tsvType: FRESHWATER,
        template: fwTemplate,
    },
    [SOLIDMANURE]: {
        tsvType: SOLIDMANURE,
        template: smTemplate,
    },
    [FERTILIZER]: {
        tsvType: FERTILIZER,
        template: cfTemplate,
    },
    [MANURE]: { // exports
        tsvType: MANURE,
        template: smExportTemplate,
    },
    [WASTEWATER]: { // exports
        tsvType: WASTEWATER,
        template: wwExportTemplate,
    }
}

export class TSVUtil {
    static async uploadTSV(file, tsv_type, uploadedFilename, dairy_id) {
        try {
            return await postXLSX(`${BASE_URL}/tsv/uploadTSV/${tsv_type}/${uploadedFilename}/${dairy_id}`, file)
        } catch (e) {
            return { error: e }
        }
    }
}

export const checkEmpty = (val) => {
    // If value is empty, return 0 to avoid error in DB.
    return val.length > 0 ? val.replaceAll(',', '') : 0
}

// Used to View TSV
export const createHeaderMap = (headerRow, indexAsKey = true) => {
    const header = {}
    const invalidChars = ['\b', '\f', '\n', '\r', '\t', '\v']
    headerRow.forEach((item, i) => {
        item = item.trim()
        if (item.length > 0 && invalidChars.indexOf(item) < 0) {
            if (indexAsKey) {
                header[i] = item
            } else {
                header[item] = i
            }
        }
    })
    return header
}

// Still used on CLient side for Agreements/ Certifications/ Notes....
export const lazyGet = (endpoint, value, data, dairy_id) => {
    return new Promise((resolve, rej) => {
        get(`${BASE_URL}/api/search/${endpoint}/${value}/${dairy_id}`)
            .then(res => {
                // If not found, Attempt to create
                if (Object.keys(res).length === 0) {
                    post(`${BASE_URL}/api/${endpoint}/create`, data)
                        .then(result => {
                            // If there is an error response from server.
                            if (result.error) {
                                get(`${BASE_URL}/api/search/${endpoint}/${value}/${dairy_id}`)
                                    .then(secondResult => {
                                        // Found entry, on second attempt.
                                        // console.log('Found 1st entry resolve: ', res)
                                        resolve(secondResult)
                                    })
                            } else {
                                // Created entry, returning result
                                // console.log('Created entry resolve: ', res)
                                resolve(result)
                            }
                        })
                        .catch(error => {
                            console.log(error)
                            rej(error)
                        })
                } else {
                    // Found entry, returning result
                    // console.log('Second entry resolve: ', res)
                    resolve(res)
                }
            })
            .catch(err => {
                console.log(err)
                rej(err)
            })
    })
}