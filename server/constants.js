exports.ROLES = {
    READ: 1,
    WRITE: 2,
    DELETE: 3,
    ADMIN: 4,
    HACKER: 5
}

exports.REPORTING_METHODS = ['dry-weight', 'as-is']

exports.NUTRIENT_IMPORT_MATERIAL_TYPES = [
    'Commercial fertilizer/ Other: Liquid commercial fertilizer', 'Commercial fertilizer/ Other: Solid commercial fertilizer',
    'Commercial fertilizer/ Other: Other liquid nutrient source', 'Commercial fertilizer/ Other: Other solid nutrient source',
    'Dry manure: Separator solids', 'Dry manure: Corral solids', 'Dry manure: Scraped material', 'Dry manure: Bedding',
    'Dry manure: Compost', 'Process wastewater', 'Process wastewater: Process wastewater sludge']


exports.HARVEST = 'Production Records'
exports.PROCESS_WASTEWATER = 'WW Applications'
exports.FRESHWATER = 'FW Applications'
exports.SOLIDMANURE = 'SM Applications'
exports.FERTILIZER = 'Commercial Fertilizer'
exports.SOIL = 'Soil Analyses'
exports.PLOWDOWN_CREDIT = 'Plowdown Credit'
exports.DRAIN = 'Tile Drainage Systems'
exports.DISCHARGE = 'Discharges'
exports.MANURE = 'SM Exports'
exports.WASTEWATER = 'WW Exports'

// Default/ root/ true tsvTypes
exports.SHEET_NAMES = [
    this.HARVEST, this.PROCESS_WASTEWATER, this.FRESHWATER, this.SOLIDMANURE, this.FERTILIZER, this.SOIL, this.PLOWDOWN_CREDIT, this.DRAIN, this.DISCHARGE, this.MANURE, this.WASTEWATER,
]

exports.TSV_INFO = {
    [this.DISCHARGE]: {
        tsvType: this.DISCHARGE,
        aliases: [this.DISCHARGE],
    },
    [this.DRAIN]: {
        tsvType: this.DRAIN,
        aliases: [this.DRAIN],
    },
    [this.PLOWDOWN_CREDIT]: {
        tsvType: this.PLOWDOWN_CREDIT,
        aliases: [this.PLOWDOWN_CREDIT],
    },
    [this.SOIL]: {
        tsvType: this.SOIL,
        aliases: [this.SOIL],
    },
    [this.HARVEST]: {
        tsvType: this.HARVEST,
        aliases: [this.HARVEST],
    },
    [this.PROCESS_WASTEWATER]: {
        tsvType: this.PROCESS_WASTEWATER,
        aliases: [this.PROCESS_WASTEWATER],
    },
    [this.FRESHWATER]: {
        tsvType: this.FRESHWATER,
        aliases: [this.FRESHWATER],
    },
    [this.SOLIDMANURE]: {
        tsvType: this.SOLIDMANURE,
        aliases: [this.SOLIDMANURE],
    },
    [this.FERTILIZER]: {
        tsvType: this.FERTILIZER,
        aliases: [this.FERTILIZER],
    },
    [this.MANURE]: { // exports
        tsvType: this.MANURE,
        aliases: [this.MANURE, "Manure Calculation records table"],
    },
    [this.WASTEWATER]: { // exports
        tsvType: this.WASTEWATER,
        aliases: [this.WASTEWATER, "WasteWater Collection Sheet"],
    }
}





exports.NO_LOGO = `data:image/png;base64,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`