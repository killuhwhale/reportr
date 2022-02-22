
// Single Field validation
exports.validValue = (val) => {
    return toFloat(val) >= 0.00 && toFloat(val) <= 99999.99
}
exports.validDetectLimit = (val) => {
    return toFloat(val) >= 0.01 && toFloat(val) <= 99999.99
}

// Single Field for Plant Tissue/ Harvest analysis
// Manure Analysis
exports.validValueLarge = (val) => {
    return toFloat(val) >= 0.00 && toFloat(val) <= 999999.99
}
exports.validDetectLimitLarge = (val) => {
    return toFloat(val) >= 0.01 && toFloat(val) <= 999999.99
}

exports.validTDS = (val) => {
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


// Value is above the detection limit
exports.validValueAboveDL = (val, dl) => {
    return toFloat(val) >= toFloat(dl)
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
    return toFloat(val) >= 0.01 && toFloat(val) <= 100000000.00
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