const { toFloat } = require('../utils/convertUtil');

// const valIsBelowDL = (val, dl) => {
//     // If value if not zero and is less than the detection limit, this is an invalid situation
//     // When val is 0, false && ....
//     return toFloat(val) > 0 && toFloat(val) < toFloat(dl)
// }

// Single Field validation

exports.validValue = (val, dl) => {
    // Value is either 0 or higher than its detection limit. Check if within bounds.
    return toFloat(val) >= 0.00 && toFloat(val) <= 99999.99
}
exports.validDetectLimit = (val) => {
    return toFloat(val) >= 0.01 && toFloat(val) <= 99999.99
}

// Single Field for Plant Tissue/ Harvest analysis
// Manure Analysis
exports.validValueLarge = (val, dl) => {

    return toFloat(val) >= 0.00 && toFloat(val) <= 999999.99
}
exports.validDetectLimitLarge = (val) => {
    return toFloat(val) >= 0.01 && toFloat(val) <= 999999.99
}

exports.validTDS = (val, dl) => {

    return toFloat(val) >= 0 && toFloat(val) <= 20000.00
}

exports.validTDSDL = (val) => {
    return toFloat(val) >= 1 && toFloat(val) <= 20000.00
}

exports.validTFS = (val) => {
    return toFloat(val) >= 0.00 && toFloat(val) <= 100.00
}

exports.validTFSDL = (val) => {
    return toFloat(val) >= 0.01 && toFloat(val) <= 100.00
}

exports.validMoisture = (val) => {
    return toFloat(val) >= 0.1 && toFloat(val) <= 100.00
}


// Value is above the detection limit, and DL is greater than zero

exports.validValueAboveDL = (val, dl) => {
    return toFloat(val) >= toFloat(dl) && toFloat(dl) > 0
}

// Freshwater && Process wastewater Analysis
exports.validTotalN = (n, n1, n2) => {
    return toFloat(n) > toFloat(nh1) + toFloat(nh2)
}

exports.validPH = (val) => {
    return toFloat(val) >= 0 && toFloat(val) <= 14.00
}

exports.validOrganicMatter = (val) => {
    return toFloat(val) >= 0 && toFloat(val) <= 99.99
}

exports.validImportAmount = (val) => {
    return toFloat(val) >= 0.10 && toFloat(val) <= 100000000.00
}

exports.validImportCon = (val) => {
    return toFloat(val) >= 0.00 && toFloat(val) <= 99.999999
}

exports.validAmountHauled = (val) => {
    return toFloat(val) >= 0.10 && toFloat(val) <= 10000000.00
}

exports.validAmountApplied = (val) => {
    return toFloat(val) >= 0.01 && toFloat(val) <= 100000000.00
}

// Soil, plowdown
exports.validAmountLBSAcre = (val) => {
    return toFloat(val) >= 0.00 && toFloat(val) <= 10000.00
}

// Harvest yield tons
exports.validHarvestYield = (val) => {
    return toFloat(val) >= 0.01 && toFloat(val) <= 500000.00
}

exports.validLbsAcrePlowdownCredit = (val) => {
    return toFloat(val) >= 0.00 && toFloat(val) <= 10000.00
}


exports.validStartEndDates = (period_start, period_end) => {
    try {
        const start = new Date(period_start).getTime()
        const end = new Date(period_end).getTime()
        return start < end
    } catch (e) {
        return false
    }
}