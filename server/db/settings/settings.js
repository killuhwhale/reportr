const { pool } = require('../index')
const { queryPromiseByValues } = require('../index')
const {
    HARVEST, PROCESS_WASTEWATER, FRESHWATER, SOLIDMANURE,
    FERTILIZER, SOIL, PLOWDOWN_CREDIT, DRAIN, DISCHARGE, MANURE, WASTEWATER
} = require('../../constants')
var hstore = require('pg-hstore')();
const { toLowercaseSpaceToUnderscore } = require('../../utils/format');

/** Template Process:
 *  
 * SERVER SIDE
 * 
 * Model defined
 * db/settings/settings (here)
 *      - Define template names based on TsvTypes/ Sheetnames
 * 
 * Export these to use anywhere else.... on server side.
 * 
 * 
 * 
 * CLIENT SIDE
 *  Need the right tmeplate names to show the view for each one.....
 * 
 * 
 */


const HARVEST_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(HARVEST)
const PROCESS_WASTEWATER_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(PROCESS_WASTEWATER)
const FRESHWATER_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(FRESHWATER)
const SOLIDMANURE_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(SOLIDMANURE)
const FERTILIZER_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(FERTILIZER)
const MANURE_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(MANURE)
const WASTEWATER_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(WASTEWATER)
const SOIL_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(SOIL)
const PLOWDOWN_CREDIT_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(PLOWDOWN_CREDIT)
const DRAIN_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(DRAIN)
const DISCHARGE_TEMPLATE_NAME = toLowercaseSpaceToUnderscore(DISCHARGE)




const hStoreStringify = (source) => {
    return new Promise((resolve, reject) => {
        hstore.stringify(source, function (result) {
            // result = '"foo"=>"oof", "bar"=>"rab", "baz"=>"zab"'
            console.log('HstoreStringify Result: ', result)
            resolve(result)
        });
    })
}




const updateSettingTemplate = async (template, updateDataObj, dairy_id) => {
    const hStoreData = await hStoreStringify(updateDataObj)

    console.log("Updating settings: ", template, hStoreData, dairy_id)
    // TODO convert template to toLowercaseSpaceToUnderscore()
    return queryPromiseByValues(`
        UPDATE setting_templates
        SET ${template} = ${template} || '${hStoreData}' :: hstore
        WHERE dairy_id = $1
    `, [dairy_id])

}

module.exports = {
    // updateData = { settingNAme: newValue }

    getSettingTemplate: async (dairy_id) => {
        return queryPromiseByValues(`
        SELECT 
            
            hstore_to_json(${HARVEST_TEMPLATE_NAME}) ${HARVEST_TEMPLATE_NAME},
            hstore_to_json(${PROCESS_WASTEWATER_TEMPLATE_NAME}) ${PROCESS_WASTEWATER_TEMPLATE_NAME},
            hstore_to_json(${FRESHWATER_TEMPLATE_NAME}) ${FRESHWATER_TEMPLATE_NAME},
            hstore_to_json(${SOLIDMANURE_TEMPLATE_NAME}) ${SOLIDMANURE_TEMPLATE_NAME},
            hstore_to_json(${FERTILIZER_TEMPLATE_NAME}) ${FERTILIZER_TEMPLATE_NAME},
            hstore_to_json(${MANURE_TEMPLATE_NAME}) ${MANURE_TEMPLATE_NAME},
            hstore_to_json(${WASTEWATER_TEMPLATE_NAME}) ${WASTEWATER_TEMPLATE_NAME},
            hstore_to_json(${SOIL_TEMPLATE_NAME}) ${SOIL_TEMPLATE_NAME},
            hstore_to_json(${PLOWDOWN_CREDIT_TEMPLATE_NAME}) ${PLOWDOWN_CREDIT_TEMPLATE_NAME},
            hstore_to_json(${DRAIN_TEMPLATE_NAME}) ${DRAIN_TEMPLATE_NAME},
            hstore_to_json(${DISCHARGE_TEMPLATE_NAME}) ${DISCHARGE_TEMPLATE_NAME}
        FROM setting_templates WHERE dairy_id = $1
        `, [dairy_id])
    },

    createSettingTemplate: async (dairy_id) => {
        return queryPromiseByValues(`
        INSERT INTO setting_templates (
            dairy_id,
            ${HARVEST_TEMPLATE_NAME},
            ${PROCESS_WASTEWATER_TEMPLATE_NAME},
            ${FRESHWATER_TEMPLATE_NAME},
            ${SOLIDMANURE_TEMPLATE_NAME},
            ${FERTILIZER_TEMPLATE_NAME},
            ${MANURE_TEMPLATE_NAME},
            ${WASTEWATER_TEMPLATE_NAME}, 
            ${SOIL_TEMPLATE_NAME},
            ${PLOWDOWN_CREDIT_TEMPLATE_NAME},
            ${DRAIN_TEMPLATE_NAME},
            ${DISCHARGE_TEMPLATE_NAME}
        ) VALUES(
            $1,
            '"Field"=>"","Acres Planted"=>"","Cropable"=>"","Total Acres"=>"","Crop"=>"Apple","Plant Date"=>"","Harvest Dates"=>"","Expected Yield Tons/Acre"=>"","Actual Yield Tons/Acre"=>"","Actual Yield Total Tons"=>"","Sample Date"=>"","Source of Analysis"=>"Lab Analysis","Reporting Method"=>"as-is","% Moisture"=>"0.10","% N"=>"","% P"=>"","% K"=>"","% TFS Salt (Dry Basis)"=>"","N DL"=>"1","P DL"=>"1","K DL"=>"1","TFS DL"=>"1"',
            '"Application Date"=>"","Field"=>"","Acres Planted"=>"","Cropable"=>"","Total Acres"=>"","Crop"=>"Apple","Plant Date"=>"","Rain Day Prior to Event"=>"No Precipitation","Rain Day of Event"=>"No Precipitation","Rain Day After Event"=>"No Precipitation","App Method"=>"Surface (irragation)","Sample Date"=>"","Sample Description"=>"","Sample Data Source"=>"Lab Analysis","N (mg/L)"=>"0","NH4-N (mg/L)"=>"0","NH3-N (mg/L)"=>"0","NO3-N (mg/L)"=>"0","P (mg/L)"=>"0","K (mg/L)"=>"0","Calcium (mg/L)"=>"0","Magnesium (mg/L)"=>"0","Sodium (mg/L)"=>"0","BiCarb (mg/L)"=>"0","Carbonate (mg/L)"=>"0","Sulfate (mg/L)"=>"0","Chloride (mg/L)"=>"0","EC (umhos/cm)"=>"0","TDS (mg/L)"=>"0","N DL"=>"1","NH4-N DL"=>"1","NH3-N DL"=>"1","NO3-N DL"=>"1","P DL"=>"1","K DL"=>"1","Calcium DL"=>"1","Magnesium DL"=>"1","Sodium DL"=>"1","BiCarb DL"=>"1","Carbonate DL"=>"1","Sulfate DL"=>"1","Chloride DL"=>"1","EC DL"=>"1","TDS DL"=>"10","PH"=>"0","Application Description"=>"","Material Type"=>"Process wastewater","Application Rate (GPM)"=>"0","Run Time (Hours)"=>"0","Total Gallons Applied"=>"0","Application Rate per acre (Gallons/ acre)"=>"0"',
            '"Application Date"=>"","Field"=>"","Acres Planted"=>"","Cropable"=>"","Total Acres"=>"","Crop"=>"Apple","Plant Date"=>"","Rain Day Prior to Event"=>"","Rain Day of Event"=>"","Rain Day After Event"=>"","App Method"=>"Surface (irragation)","Sample Date"=>"","Source Description"=>"","Source Type"=>"Surface water","Sample Description"=>"","Source of Analysis"=>"Lab Analysis","N (mg/L)"=>"0.00","NH4-N (mg/L)"=>"0.00","NO3-N (mg/L)"=>"0.00","Calcium (mg/L)"=>"0.00","Magnesium (mg/L)"=>"0.00","Sodium (mg/L)"=>"0.00","BiCarb (mg/L)"=>"0.00","Carbonate (mg/L)"=>"0.00","Sulfate (mg/L)"=>"0.00","Chloride (mg/L)"=>"0.00","EC (umhos/cm)"=>"0.00","TDS (mg/L)"=>"0.00","N DL"=>"1","NH4-N DL"=>"1","NO3-N DL"=>"1","Calcium DL"=>"1","Magnesium DL"=>"1","Sodium DL"=>"1","BiCarb DL"=>"1","Carbonate DL"=>"1","Sulfate DL"=>"1","Chloride DL"=>"1","EC DL"=>"1","TDS DL"=>"10","Application Rate (GPM)"=>"0","Run Time (Hours)"=>"0","Total Gallons Applied"=>"0","Application Rate per Acre (Gallons/acre)"=>"0"',
            '"Application Date"=>"","Field"=>"","Acres Planted"=>"","Cropable"=>"","Total Acres"=>"","Crop"=>"Apple","Plant Date"=>"","Rain Day Prior to Event"=>"","Rain Day of Event"=>"","Rain Day After Event"=>"","App Method"=>"Broadcast/incorporate","Sample Date"=>"","Sample Description"=>"","Source Description"=>"","Material Type"=>"Corral solids","Source of Analysis"=>"Lab Analysis","Method of Reporting"=>"as-is","Application (Tons)"=>"","Application Rate per Acre (Tons/acre)"=>"","% Moisture"=>"0.10","% N"=>"","% P"=>"","% K"=>"","% Calcium"=>"","% Magnesium"=>"","% Sodium"=>"","% Sulfur"=>"","% Chloride"=>"","% TFS"=>"","N DL"=>"1","P DL"=>"1","K DL"=>"1","Calcium DL"=>"1","Magnesium DL"=>"1","Sodium DL"=>"1","Sulfur DL"=>"1","Chloride DL"=>"1","TFS DL"=>"1"',
            '"Application Date"=>"","Field"=>"","Acres Planted"=>"","Cropable"=>"","Total Acres"=>"","Crop"=>"Apple","Plant Date"=>"","Rain Day Prior to Event"=>"","Rain Day of Event"=>"","Rain Day After Event"=>"","App Method"=>"Sidedress","Import Description"=>"","Import Date"=>"","Material Type"=>"Dry manure: Separator solids","Amount Imported (tons/ gals)"=>"","Method of Reporting"=>"as-is","Application Rate (Lbs/Acre)"=>"","Amount Applied"=>"","% Moisture"=>"0.10","% N"=>"","% P"=>"","% K"=>"","% Salt/ TFS/ TDS"=>""',
            '"Date"=>"","Operator Name"=>"","Operator Phone"=>"","Operator 2nd Phone"=>"","Operator Street"=>"","Operator City"=>"","Operator State"=>"","Operator Zip"=>"","Operator Is Owner"=>"no","Operator Is Operator"=>"no","Operator Responsible for Fees"=>"no","Contact First"=>"","Contact Phone"=>"","Hauler"=>"","Hauler First"=>"","Hauler Phone"=>"","Hauler Street"=>"","Hauler Cross Street"=>"","Hauler County"=>"","Hauler City"=>"","Hauler State"=>"","Hauler Zip"=>"","Recipient"=>"","Destination Type"=>"Farmer","Recipient Phone"=>"","Recipient Street"=>"","Recipient Cross Street"=>"","Recipient County"=>"","Recipient City"=>"","Recipient State"=>"","Recipient Zip"=>"","APN"=>"","Destination Street"=>"","Destination Cross Street"=>"","Destination County"=>"","Destination City"=>"","Destination State"=>"","Destination Zip"=>"","Method Used to Determine Amount Hauled"=>"","Reporting Method"=>"as-is","Material Type"=>"Dry manure: Corral solids","Amount (Tons)"=>"","% Moisture"=>"0.10","% N"=>"","% P"=>"","% K"=>"","% TFS"=>""',
            '"Date"=>"","Operator Name"=>"","Operator Phone"=>"","Operator 2nd Phone"=>"","Operator Street"=>"","Operator City"=>"","Operator State"=>"","Operator Zip"=>"","Operator Is Owner"=>"no","Operator Is Operator"=>"no","Operator Responsible for Fees"=>"no","Contact First"=>"","Contact Phone"=>"","Hauler"=>"","Hauler First"=>"","Hauler Phone"=>"","Hauler Street"=>"","Hauler Cross Street"=>"","Hauler County"=>"","Hauler City"=>"","Hauler State"=>"","Hauler Zip"=>"","Recipient"=>"","Destination Type"=>"Farmer","Recipient Phone"=>"","Recipient Street"=>"","Recipient Cross Street"=>"","Recipient County"=>"","Recipient City"=>"","Recipient State"=>"","Recipient Zip"=>"","APN"=>"","Destination Street"=>"","Destination Cross Street"=>"","Destination County"=>"","Destination City"=>"","Destination State"=>"","Destination Zip"=>"","Method Used to Determine Amount Hauled"=>"","Material Type"=>"Process wastewater","Hours"=>"","GPM"=>"","Amount (Gals)"=>"","Source Description"=>"","N (PPM)"=>"","P (PPM)"=>"","K (PPM)"=>"","EC (umhos/cm)"=>"","TDS (mg/L)"=>""',
            '"Application Date"=>"","Field"=>"","Acres Planted"=>"","Cropable"=>"","Total Acres"=>"","Crop"=>"Apple","Plant Date"=>"","Rain Day Prior to Event"=>"","Rain Day of Event"=>"","Rain Day After Event"=>"","App Method"=>"Surface (irragation)","Source Description"=>"","Sample Date1"=>"","Sample Description1"=>"","Source of Analysis1"=>"Lab Analysis","N1 (mg/Kg)"=>"","P1 (mg/Kg)"=>"","Sol P1 (mg/Kg)"=>"","K1 (mg/Kg)"=>"","EC1 (umhos/cm)"=>"","Organic Matter1 (%)"=>"","N1 DL"=>"1","P1 DL"=>"1","Sol P1 DL"=>"1","K1 DL"=>"1","EC1 DL"=>"1","Organic Matter1 DL"=>"1","Sample Date2"=>"","Sample Description2"=>"","Source of Analysis2"=>"Lab Analysis","N2 (mg/Kg)"=>"","P2 (mg/Kg)"=>"","Sol P2 (mg/Kg)"=>"","K2 (mg/Kg)"=>"","EC2 (umhos/cm)"=>"","Organic Matter2 (%)"=>"","N2 DL"=>"1","P2 DL"=>"1","Sol P2 DL"=>"1","K2 DL"=>"1","EC2 DL"=>"1","Organic Matter2 DL"=>"1","Sample Date3"=>"","Sample Description3"=>"","Source of Analysis3"=>"Lab Analysis","N3 (mg/Kg)"=>"","P3 (mg/Kg)"=>"","Sol P3 (mg/Kg)"=>"","K3 (mg/Kg)"=>"","EC3 (umhos/cm)"=>"","Organic Matter3 (%)"=>"","N3 DL"=>"1","P3 DL"=>"1","Sol P3 DL"=>"1","K3 DL"=>"1","EC3 DL"=>"1","Organic Matter3 DL"=>"1"',
            '"Application Date"=>"","Field"=>"","Acres Planted"=>"","Cropable"=>"","Total Acres"=>"","Crop"=>"Apple","Plant Date"=>"","Rain Day Prior to Event"=>"","Rain Day of Event"=>"","Rain Day After Event"=>"","App Method"=>"Surface (irragation)","Source Description"=>"","N lbs/ acre"=>"","P lbs/ acre"=>"","K lbs/ acre"=>"","Salt lbs/ acre"=>""',
            '"Source Description"=>"","Sample Date"=>"","Sample Description"=>"","Source of Analysis"=>"Lab Analysis","NH4-N (mg/L)"=>"0","NO3-N (mg/L)"=>"0","P (mg/L)"=>"0","EC (umhos/cm)"=>"0","TDS (mg/L)"=>"0","NH4-N DL"=>"1","NO3-N DL"=>"1","P DL"=>"1","EC DL"=>"1","TDS DL"=>"1"',
            '"Type"=>"Storm water","Date Time"=>"","Location"=>"","Volume discharged"=>"","Volume Unit"=>"gals","Duration of Discharge (mins)"=>"","Discharge Source"=>"Wastewater","Method of Measuring"=>"","Rationale for Sample Location"=>"","Reference Number for Discharge Site"=>""'
        ) RETURNING 
            hstore_to_json(${HARVEST_TEMPLATE_NAME}) ${HARVEST_TEMPLATE_NAME},
            hstore_to_json(${PROCESS_WASTEWATER_TEMPLATE_NAME}) ${PROCESS_WASTEWATER_TEMPLATE_NAME},
            hstore_to_json(${FRESHWATER_TEMPLATE_NAME}) ${FRESHWATER_TEMPLATE_NAME},
            hstore_to_json(${SOLIDMANURE_TEMPLATE_NAME}) ${SOLIDMANURE_TEMPLATE_NAME},
            hstore_to_json(${FERTILIZER_TEMPLATE_NAME}) ${FERTILIZER_TEMPLATE_NAME},
            hstore_to_json(${MANURE_TEMPLATE_NAME}) ${MANURE_TEMPLATE_NAME},
            hstore_to_json(${WASTEWATER_TEMPLATE_NAME}) ${WASTEWATER_TEMPLATE_NAME},
            hstore_to_json(${SOIL_TEMPLATE_NAME}) ${SOIL_TEMPLATE_NAME},
            hstore_to_json(${PLOWDOWN_CREDIT_TEMPLATE_NAME}) ${PLOWDOWN_CREDIT_TEMPLATE_NAME},
            hstore_to_json(${DRAIN_TEMPLATE_NAME}) ${DRAIN_TEMPLATE_NAME},
            hstore_to_json(${DISCHARGE_TEMPLATE_NAME}) ${DISCHARGE_TEMPLATE_NAME}
        `,
            [dairy_id])
    },


    updateSettingTemplateHarvest: async (updateDataObj, dairy_id) => {
        return updateSettingTemplate(HARVEST_TEMPLATE_NAME, updateDataObj, dairy_id)
    },
    updateSettingTemplateWastewater: async (updateDataObj, dairy_id) => {
        return updateSettingTemplate(PROCESS_WASTEWATER_TEMPLATE_NAME, updateDataObj, dairy_id)
    },
    updateSettingTemplateFreshwater: async (updateDataObj, dairy_id) => {
        return updateSettingTemplate(FRESHWATER_TEMPLATE_NAME, updateDataObj, dairy_id)
    },
    updateSettingTemplateSolidmanure: async (updateDataObj, dairy_id) => {
        return updateSettingTemplate(SOLIDMANURE_TEMPLATE_NAME, updateDataObj, dairy_id)
    },
    updateSettingTemplateFertilizer: async (updateDataObj, dairy_id) => {
        return updateSettingTemplate(FERTILIZER_TEMPLATE_NAME, updateDataObj, dairy_id)
    },
    updateSettingTemplateSolidExport: async (updateDataObj, dairy_id) => {
        return updateSettingTemplate(MANURE_TEMPLATE_NAME, updateDataObj, dairy_id)
    },
    updateSettingTemplateWastewaterExport: async (updateDataObj, dairy_id) => {
        return updateSettingTemplate(WASTEWATER_TEMPLATE_NAME, updateDataObj, dairy_id)
    },
    updateSettingTemplateSoil: async (updateDataObj, dairy_id) => {
        return updateSettingTemplate(SOIL_TEMPLATE_NAME, updateDataObj, dairy_id)
    },
    updateSettingTemplatePlow: async (updateDataObj, dairy_id) => {
        return updateSettingTemplate(PLOWDOWN_CREDIT_TEMPLATE_NAME, updateDataObj, dairy_id)
    },
    updateSettingTemplateTile: async (updateDataObj, dairy_id) => {
        return updateSettingTemplate(DRAIN_TEMPLATE_NAME, updateDataObj, dairy_id)
    },
    updateSettingTemplateDischarge: async (updateDataObj, dairy_id) => {
        return updateSettingTemplate(DISCHARGE_TEMPLATE_NAME, updateDataObj, dairy_id)
    },

    deleteSettingTemplate: async (dairy_id) => {
        return queryPromiseByValues(`
            DELETE FROM setting_templates WHERE dairy_id=$1
        `, [dairy_id])
    }

}


module.exports.toLowercaseSpaceToUnderscore = toLowercaseSpaceToUnderscore
module.exports.HARVEST_TEMPLATE_NAME = HARVEST_TEMPLATE_NAME
module.exports.PROCESS_WASTEWATER_TEMPLATE_NAME = PROCESS_WASTEWATER_TEMPLATE_NAME
module.exports.FRESHWATER_TEMPLATE_NAME = FRESHWATER_TEMPLATE_NAME
module.exports.SOLIDMANURE_TEMPLATE_NAME = SOLIDMANURE_TEMPLATE_NAME
module.exports.FERTILIZER_TEMPLATE_NAME = FERTILIZER_TEMPLATE_NAME
module.exports.SOIL_TEMPLATE_NAME = SOIL_TEMPLATE_NAME
module.exports.PLOWDOWN_CREDIT_TEMPLATE_NAME = PLOWDOWN_CREDIT_TEMPLATE_NAME
module.exports.DRAIN_TEMPLATE_NAME = DRAIN_TEMPLATE_NAME
module.exports.DISCHARGE_TEMPLATE_NAME = DISCHARGE_TEMPLATE_NAME
module.exports.MANURE_TEMPLATE_NAME = MANURE_TEMPLATE_NAME
module.exports.WASTEWATER_TEMPLATE_NAME = WASTEWATER_TEMPLATE_NAME