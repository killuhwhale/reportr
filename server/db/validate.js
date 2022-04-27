const { NUTRIENT_IMPORT_MATERIAL_TYPES } = require("../constants")
const { validTDSDL, validTDS, validPH, validMoisture, validValueLarge, validDetectLimitLarge,
    validValueAboveDL, validValue, validDetectLimit, validTFS, validTFSDL, validImportCon, validOrganicMatter,
    validHarvestYield, validLbsAcrePlowdownCredit, validImportAmount
} = require("../tsv/validInput")

/** Validates input. Each sheet has certain values that are required and must be within a certain range.
 * 
 *  Concentrations must be above the detection limit if the concentraiton is above 0.
 */


const toFloat = (num) => {
    const float = num && typeof (num) === typeof ('') && num.length > 0 ? parseFloat(num.replaceAll(',', '')) : typeof (num) === typeof (0) || typeof (num) === typeof (0.0) ? num : 0

    if (isNaN(float)) {
        throw `${float} is not a number`
    }
    return float
}


const checkAnalytes = (analytes, dls, ERROR_TAG) => {
    /**
     *  Each value must be between 0 - 99,999.99
     *  If concentration is given, it must be above the detection limit
     *  The detection limit must also be within the valid range of 0 - 99,999.99
     */
    let result = { code: '0' }
    let i = 0
    for (let item of analytes) {

        if (!validValue(item[1])) {
            result = { code: '1000', msg: `${ERROR_TAG} ${item[0]}: ${item[1]} needs to be between 0 - 99,999.99` }
            break
        }

        // If value is provided then detection limit needs to be accurate
        if (toFloat(item[1]) > 0) {
            if (!validDetectLimit(dls[i][1])) {
                result = { code: '1000', msg: `${ERROR_TAG} ${dls[0]}: ${dls[1]} DL needs to be between 0 - 99,999.99` }
                break
            }
            if (!validValueAboveDL(item[1], dls[i][1])) {
                result = { code: '1000', msg: `${ERROR_TAG} ${item[0]}: ${item[1]} needs to be between above ${dls[i][1]} DL` }
                break
            }
        }

        i++
    }
    return result
}

const checkLargeAnalytes = (analytes, dls, ERROR_TAG) => {
    analytes.forEach((item, i) => {

        if (!validValueLarge(item[1])) {
            return { code: '1000', msg: `${ERROR_TAG} ${item[0]}: ${item[1]} needs to be between 0 - 99,999.99` }
        }

        // If value is provided then detection limit needs to be accurate
        if (toFloat(item[1]) > 0) {
            if (!validDetectLimitLarge(dls[i][1])) {
                return { code: '1000', msg: `${ERROR_TAG} ${item[0]}: ${item[1]} needs to be between 0 - 99,999.99` }
            }
            if (!validValueAboveDL(item[1], dls[i][1])) {
                return { code: '1000', msg: `${ERROR_TAG} ${item[0]}: ${item[1]} needs to be between above ${dls[i][1]} DL` }
            }
        }
    })
    return { code: '0' }
}


exports.validFieldCropHarvest = (values) => {
    const [dairy_id, field_crop_id, sample_date, harvest_date, expected_yield_tons_acre, method_of_reporting,
        actual_yield, src_of_analysis, moisture, n, p, k, tfs, n_dl, p_dl, k_dl, tfs_dl
    ] = values
    const ERROR_TAG = `Harvest ${harvest_date} (${actual_yield})tons`

    console.log(`Harvest date: ${harvest_date} must be between reporting period. TODO get reporting period.`)


    if (!validHarvestYield(actual_yield)) {
        return { code: '1000', msg: `${ERROR_TAG} Actual Yield must be between 1 and 2,147,483,647.` }
    }

    if (!src_of_analysis) {
        return { code: '1000', msg: `${ERROR_TAG} Source of Analysis must be given.` }
    }
    if (!method_of_reporting) {
        return { code: '1000', msg: `${ERROR_TAG} Method of reporting must be given.` }
    }

    if (!validMoisture(moisture)) {
        return { code: '1000', msg: `${ERROR_TAG} Moisture ${moisture} needs to be between 0.10 - 100.00` }
    }


    // If TFS is given, it must be valid and its detection limit must also be given correctly.
    if (tfs > 0) {
        if (!validTFS(tfs)) {
            return { code: '1000', msg: `${ERROR_TAG} TFS ${tfs} needs to be between 0.00 - 100.00` }

        }
        if (!validValueAboveDL(tfs, tfs_dl)) {
            return { code: '1000', msg: `${ERROR_TAG} TFS ${tfs} needs to be above ${tfs_dl} DL` }
        }
    }

    const dls = [['Nitrogen DL', n_dl], ['Phosphorus DL', p_dl], ['Potassium DL', k_dl]]
    const analytes = [['Nitrogen', n * 1e4], ['Phosphorus', p * 1e4], ['Potassium', k * 1e4]]
    return checkLargeAnalytes(analytes, dls, ERROR_TAG)
}



exports.validProcessWastewaterAnalysis = (values) => {
    const [
        dairy_id, sample_date, sample_desc, sample_data_src, material_type, kn_con, nh4_con, nh3_con, no3_con, p_con, k_con,
        ca_con, mg_con, na_con, hco3_con, co3_con, so4_con, cl_con, ec, tds, kn_dl, nh4_dl, nh3_dl, no3_dl,
        p_dl, k_dl, ca_dl, mg_dl, na_dl, hco3_dl, co3_dl, so4_dl, cl_dl, ec_dl, tds_dl, ph
    ] = values
    const ERROR_TAG = `ProcessWastewaterAnalysis ${sample_date} ${sample_desc} ${kn_con}`
    if (!validTDS(tds)) {
        return { code: '1000', msg: `${ERROR_TAG}: ${tds} TDS must be between 0 and 20,000.` }
    }

    if (tds > 0.0) {
        if (!validTDSDL(tds_dl)) {
            return { code: '1000', msg: `${ERROR_TAG}: ${tds_dl} TDS DL must be between 1 and 20,000.` }
        }
    }

    if (!validPH(ph)) {
        return { code: '1000', msg: `${ERROR_TAG}: ${ph} pH must be between 0 and 14.` }
    }



    const analytes = [['Kjeldahl-nitrogen', kn_con], ['Ammonium-nitrogen', nh4_con], ['Un-ionized ammonia-nitrogen', nh3_con],
    ['Nitrate-nitrogen', no3_con], ['Phosphorus', p_con], ['Potassium', k_con],
    ['Calcium', ca_con], ['Magnesium', mg_con], ['Sodium', na_con], ['Bicarbonate', hco3_con], ['Carbonate', co3_con],
    ['Sulfate', so4_con], ['Chloride', cl_con], ['EC', ec]]


    const dls = [['Kjeldahl-nitrogen Detection Limit', kn_dl], ['Ammonium-nitrogen Detection Limit', nh4_dl], ['Un-ionized ammonia-nitrogen Detection Limit', nh3_dl],
    ['Nitrate-nitrogen Detection Limit', no3_dl], ['Phosphorus Detection Limit', p_dl], ['Potassium Detection Limit', k_dl],
    ['Calcium Detection Limit', ca_dl], ['Magnesium Detection Limit', mg_dl], ['Sodium Detection Limit', na_dl], ['Bicarbonate Detection Limit', hco3_dl], ['Carbonate Detection Limit', co3_dl],
    ['Sulfate Detection Limit', so4_dl], ['Chloride Detection Limit', cl_dl], ['EC Detection Limit', ec_dl]]

    return checkAnalytes(analytes, dls, ERROR_TAG)
}
exports.validProcessWastewater = (values) => {
    const [dairy_id,
        field_crop_app_id,
        field_crop_app_process_wastewater_analysis_id,
        app_desc,
        amount_applied] = values

    if (amount_applied <= 0 || amount_applied >= 2147483647) {
        return { code: '1000', msg: `${app_desc} - ${amount_applied}  Amount applied must be between 1 - 2147483647.` }
    }

    return { code: '0' }
}




exports.validFreshwaterAnalysis = (values) => {
    const [dairy_id, fresh_water_source_id, sample_date, sample_desc, src_of_analysis, n_con, nh4_con,
        no2_con, ca_con, mg_con, na_con, hco3_con, co3_con, so4_con, cl_con, ec, tds, n_dl, nh4_dl, no2_dl,
        ca_dl, mg_dl, na_dl, hco3_dl, co3_dl, so4_dl, cl_dl, ec_dl,
        tds_dl
    ] = values
    const ERROR_TAG = `Freshwater Analysis ${sample_date} ${sample_desc} ${src_of_analysis}`

    // if (!validTDS(tds)) {
    if (!validTDS(tds)) {
        return { code: '1000', msg: `${ERROR_TAG} TDS must be between 0 and 20,000.` }
    }

    if (tds > 0.0) {
        if (!validTDSDL(tds_dl)) {
            return { code: '1000', msg: `${ERROR_TAG} TDS must be between 1 and 20,000.` }
        }
    }

    const analytes = [['Nitrogen', n_con], ['Ammonium-nitrogen', nh4_con], ['Nitrate-nitrogen', no2_con],
    ['Calcium', ca_con], ['Magnesium', mg_con], ['Sodium', na_con], ['Bicarbonate', hco3_con], ['Carbonate', co3_con],
    ['Sulfate', so4_con], ['Chloride', cl_con], ['EC', ec]]


    const dls = [['Nitrogen Detection Limit', n_dl], ['Ammonium-nitrogen Detection Limit', nh4_dl],
    ['Nitrate-nitrogen Detection Limit', no2_dl],
    ['Calcium Detection Limit', ca_dl], ['Magnesium Detection Limit', mg_dl], ['Sodium Detection Limit', na_dl], ['Bicarbonate Detection Limit', hco3_dl], ['Carbonate Detection Limit', co3_dl],
    ['Sulfate Detection Limit', so4_dl], ['Chloride Detection Limit', cl_dl], ['EC Detection Limit', ec_dl]]

    return checkAnalytes(analytes, dls, ERROR_TAG)
}
exports.validFreshwater = (values) => {
    const [dairy_id, field_crop_app_id, field_crop_app_freshwater_analysis_id, app_rate, run_time,
        amount_applied, amt_applied_per_acre] = values

    if (amount_applied <= 0 || amount_applied >= 2147483647) {
        return { code: '1000', msg: `Freshwater rate:${app_rate} time:${run_time} - ${amount_applied}  Amount applied must be between 1 - 2147483647.` }
    }

    return { code: '0' }
}


exports.validSolidmanureAnalysis = (values) => {
    const [dairy_id, sample_desc, sample_date, material_type, src_of_analysis, moisture, method_of_reporting,
        n_con, p_con, k_con, ca_con, mg_con, na_con, s_con, cl_con, tfs,
        n_dl, p_dl, k_dl, ca_dl, mg_dl, na_dl, s_dl, cl_dl, tfs_dl] = values

    const ERROR_TAG = `Solidmanure Analysis ${sample_date} ${sample_desc} ${material_type} ${src_of_analysis}`

    if (!validTFS(tfs)) {
        return { code: '1000', msg: `${ERROR_TAG} TFS must be between 0 and 20,000.` }
    }

    if (tfs > 0.0) {
        if (!validTFSDL(tfs_dl)) {
            return { code: '1000', msg: `${ERROR_TAG} TFS must be between 1 and 20,000.` }
        }
    }

    if (!method_of_reporting) {
        return { code: '1000', msg: `${ERROR_TAG} Method of reporting must be given.` }
    }

    if (!validMoisture(moisture)) {
        return { code: '1000', msg: `${ERROR_TAG} Moisture ${moisture} needs to be between 0.10 - 100.00` }
    }

    const analytes = [['Nitrogen', n_con * 1e4], ['Phosphorus', p_con * 1e4], ['Potassium', k_con * 1e4],
    ['Calcium', ca_con * 1e4], ['Magnesium', mg_con * 1e4], ['Sodium', na_con * 1e4], ['Sulfur', s_con * 1e4],
    ['Chloride', cl_con * 1e4]]


    const dls = [['Nitrogen Detection Limit', n_dl], ['Phosphorus Detection Limit', p_dl], ['Potassium Detection Limit', k_dl],
    ['Calcium Detection Limit', ca_dl], ['Magnesium Detection Limit', mg_dl], ['Sodium Detection Limit', na_dl], ['Sulfur Limit', s_dl],
    ['Chloride Detection Limit', cl_dl]]

    return checkAnalytes(analytes, dls, ERROR_TAG)
}

exports.validSolidmanure = (values) => {
    const [dairy_id, field_crop_app_id, field_crop_app_solidmanure_analysis_id,
        src_desc, amount_applied, amt_applied_per_acre] = values

    if (amount_applied <= 0 || amount_applied >= 2147483647) {
        return { code: '1000', msg: `Solid manure ${src_desc} - ${amount_applied}  Amount applied must be between 1 - 2147483647.` }
    }

    return { code: '0' }
}

exports.validNutrientImport = (values) => {
    const [dairy_id, import_desc, import_date, material_type, amount_imported,
        method_of_reporting, moisture, n_con, p_con, k_con, salt_con] = values

    const ERROR_TAG = `Nutirent Import (Commercial Fertilizer) ${import_date} ${material_type} ${import_desc}`


    if (!method_of_reporting) {
        return { code: '1000', msg: `${ERROR_TAG} Method of reporting must be given.` }
    }

    if (moisture > 0) {
        if (!validMoisture(moisture)) {
            return { code: '1000', msg: `${ERROR_TAG} Moisture ${moisture} needs to be between 0.10 - 100.00` }
        }
    }

    const analytes = [['Nitrogen', n_con], ['Phosphorus', p_con], ['Potassium', k_con], ['Salt', salt_con]]

    const commercialTypes = NUTRIENT_IMPORT_MATERIAL_TYPES.slice(0, 4)
    const manureTypes = NUTRIENT_IMPORT_MATERIAL_TYPES.slice(4, 8)
    const processTypes = NUTRIENT_IMPORT_MATERIAL_TYPES.slice(8, 10)
    let result = { code: '0' }

    for (let item of analytes) {
        if (processTypes.indexOf(material_type) >= 0) {
            if (!validValue(item[1] * 1e4)) {
                result = { code: '1000', msg: `${ERROR_TAG} ${item[0]}: ${item[1] * 1e4} needs to be between 0 - 99,999.99` }
                break
            }
        }
        else if (manureTypes.indexOf(material_type) >= 0) {
            if (!validValueLarge(item[1] * 1e4)) {
                result = { code: '1000', msg: `${ERROR_TAG} ${item[0]}: ${item[1] * 1e4} needs to be between 0 - 999,999.99` }
                break
            }
        }
        else if (commercialTypes.indexOf(material_type) >= 0) {
            if (!validImportCon(item[1])) {
                result = { code: '1000', msg: `${ERROR_TAG} ${item[0]}: ${item[1]} needs to be between 0 - 99.9999` }
                break
            }
        }
    }

    return result
}


exports.validFertilizer = (values) => {
    const [dairy_id, field_crop_app_id, nutrient_import_id, amount_applied] = values

    if (amount_applied <= 0 || amount_applied >= 2147483647) {
        return { code: '1000', msg: `Fertilizer ${amount_applied}  Amount applied must be between 1 - 2,147,483,647.` }
    }

    return { code: '0' }
}



exports.validSoilAnalysis = (values) => {
    const [dairy_id, field_id, sample_desc, sample_date, src_of_analysis,
        n_con, total_p_con, p_con, k_con, ec, org_matter, n_dl, total_p_dl, p_dl, k_dl, ec_dl, org_matter_dl] = values

    const ERROR_TAG = `Soil Analysis ${sample_date} ${sample_desc} ${src_of_analysis}`

    if (!src_of_analysis) {
        return { code: '1000', msg: `${ERROR_TAG} Source of Analysis must be given.` }
    }

    if (!validOrganicMatter(org_matter)) {
        return { code: '1000', msg: `${ERROR_TAG} Organic Matter must be between 0 - 99.99.` }
    }
    if (!validOrganicMatter(org_matter_dl)) {
        return { code: '1000', msg: `${ERROR_TAG} Organic Matter DL must be between 0 - 99.99.` }
    }

    const analytes = [['Nitrogen', n_con], ['Phosphorus', p_con], ['Total Phosphorus', total_p_con], ['Potassium', k_con], ['EC', ec]]
    const dls = [['Nitrogen DL', n_dl], ['Phosphorus DL', p_dl], ['Total Phosphorus DL', total_p_dl], ['Potassium DL', k_dl], ['EC DL', ec_dl]]
    return checkAnalytes(analytes, dls, ERROR_TAG)

}


exports.validPlowdownCredit = (values) => {
    const [dairy_id, field_crop_app_id, src_desc, n_lbs_acre, p_lbs_acre, k_lbs_acre, salt_lbs_acre] = values
    const ERROR_TAG = `Plowdown Credit ${src_desc} `
    const analytes = [['Nitrogen', n_lbs_acre], ['Phosphorus', p_lbs_acre], ['Potassium', k_lbs_acre], ['Salt', salt_lbs_acre]]
    let result = { code: '0' }

    for (let item of analytes) {
        if (!validLbsAcrePlowdownCredit(item[1])) {
            result = { code: '1000', msg: `${ERROR_TAG} ${item[0]} (${item[1]}) must be between 0 - 10,000.` }
            break
        }
    }
    return result
}


exports.validDrainAnalysis = (values) => {
    const [dairy_id, drain_source_id, sample_date, sample_desc, src_of_analysis, nh4_con, no2_con, p_con, ec, tds, nh4_dl,
        no2_dl, p_dl, ec_dl, tds_dl] = values

    const ERROR_TAG = `Drain Analysis ${sample_date} ${sample_desc} `

    if (!validTDS(tds)) {
        return { code: '1000', msg: `${ERROR_TAG} TDS ${tds} must be between 0 - 20,000.` }
    }
    if (!validTDSDL(tds_dl)) {
        return { code: '1000', msg: `${ERROR_TAG} TDS DL ${tds_dl} must be between 1 - 20,000.` }
    }

    const analytes = [['Nitrogen', no2_con], ['Ammonium-Nitrogen', nh4_con], ['Phosphorus', p_con], ['EC', ec]]
    const dls = [['Nitrogen', no2_dl], ['Ammonium-Nitrogen', nh4_dl], ['Phosphorus', p_dl], ['EC', ec_dl]]

    return checkAnalytes(analytes, dls, ERROR_TAG)
}


exports.validExportManifest = (values) => {
    const [dairy_id,
        operator_id,
        export_contact_id,
        export_hauler_id,
        export_dest_id,
        last_date_hauled,
        amount_hauled,
        material_type,
        amount_hauled_method,
        reporting_method,
        moisture,
        n_con_mg_kg,
        p_con_mg_kg,
        k_con_mg_kg,
        tfs,

        kn_con_mg_l,
        nh4_con_mg_l,
        nh3_con_mg_l,
        no3_con_mg_l,
        p_con_mg_l,
        k_con_mg_l,
        ec_umhos_cm,
        tds] = values
    const manureTypes = NUTRIENT_IMPORT_MATERIAL_TYPES.slice(4, 8)
    const processTypes = NUTRIENT_IMPORT_MATERIAL_TYPES.slice(8, 10)
    const ERROR_TAG = `Export Manifest ${last_date_hauled} ${material_type}  ${amount_hauled}`

    if (manureTypes.indexOf(material_type) >= 0) {
        if (!validMoisture(moisture)) {
            return { code: '1000', msg: `${ERROR_TAG} Moisture ${moisture} must be between 0.10 - 100.00.` }
        }
    }

    if (!validImportAmount(amount_hauled)) {
        return { code: '1000', msg: `${ERROR_TAG} Amount hauled ${amount_hauled} must be between 0.10 - 10,000,000.00.` }
    }
    if (!validTFS(tfs)) {
        return { code: '1000', msg: `${ERROR_TAG} TFS ${tfs} must be between 0 - 100.00.` }
    }

    if (!validTDS(tds)) {
        return { code: '1000', msg: `${ERROR_TAG} TDS ${tds} must be between 0 - 20,000.` }
    }

    const analytes = [['Nitrogen', n_con_mg_kg], ['Phosphorus', p_con_mg_kg], ['Potassium', k_con_mg_kg],
    ['Kjeldahl-nitrogen', kn_con_mg_l], ['Ammonium-nitrogen', nh4_con_mg_l], ['Un-ionized ammonia-nitrogen', nh3_con_mg_l],
    ['Nitrate-nitrogen', no3_con_mg_l], ['Phosphorus', p_con_mg_l], ['Potassium', k_con_mg_l]]
    let result = { code: '0' }

    for (let item of analytes) {
        if (manureTypes.indexOf(material_type) >= 0) {
            if (!validValueLarge(item[1])) {
                result = { code: '1000', msg: `${ERROR_TAG} ${item[0]}: ${item[1]} must be between 0 - 999,999.99.` }
                break
            }
        } else if (processTypes.indexOf(material_type) >= 0) {
            if (!validValue(item[1])) {
                result = { code: '1000', msg: `${ERROR_TAG} ${item[0]}: ${item[1]} must be between 0 - 999,999.99.` }
                break
            }
        }
    }


    return result
}



