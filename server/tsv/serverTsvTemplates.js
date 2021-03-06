/** In order for Templates to work:
 * 
 *  Header names in the sheet must not change.
 *  These names must be referenced in code which is sensitive to typos
 *      - Extracting the needed data requires the code to know the header name
 *      - Eg when needing the field, it must be found under row['Field']
 *          - Any mispelling of the key wil break the system.
 * 
 * Benefits:
 *  - Order of columns doesnt matter
 *  - Missing columns will have default value
 *      - This makes is more flexible to add or remove columns
 * 
 * 
 * Considerations:
 * 
 *  - Sheet owners and program must agree on Header Name
 *  - Sheet will still require information to create and find: Fields, Crops, Field Crops, Field Crop Applications
 * 
 */



const wwTemplate = {
    "Application Date": '',
    "Field": '',
    "Acres Planted": '',
    "Cropable": '',
    "Total Acres": '',
    "Crop": 'Apple',
    "Plant Date": '',
    "Rain Day Prior to Event": 'No Precipitation',
    "Rain Day of Event": 'No Precipitation',
    "Rain Day After Event": 'No Precipitation',
    "App Method": 'Surface (irragation)',
    "Sample Date": '',
    "Sample Description": '',
    "Sample Data Source": 'Lab Analysis',
    "N (mg/L)": '0',
    "NH4-N (mg/L)": '0',
    "NH3-N (mg/L)": '0',
    "NO3-N (mg/L)": '0',
    "P (mg/L)": '0',
    "K (mg/L)": '0',
    "Calcium (mg/L)": '0',
    "Magnesium (mg/L)": '0',
    "Sodium (mg/L)": '0',
    "BiCarb (mg/L)": '0',
    "Carbonate (mg/L)": '0',
    "Sulfate (mg/L)": '0',
    "Chloride (mg/L)": '0',
    "EC (umhos/cm)": '0',
    "TDS (mg/L)": '0',
    "N DL": 1,
    "NH4-N DL": 1,
    "NH3-N DL": 1,
    "NO3-N DL": 1,
    "P DL": 1,
    "K DL": 1,
    "Calcium DL": 1,
    "Magnesium DL": 1,
    "Sodium DL": 1,
    "BiCarb DL": 1,
    "Carbonate DL": 1,
    "Sulfate DL": 1,
    "Chloride DL": 1,
    "EC DL": 1,
    "TDS DL": 10.00,
    "PH": '0',
    "Application Description": '',
    "Material Type": 'Process wastewater',
    "Application Rate (GPM)": '0',
    "Run Time (Hours)": '0',
    "Total Gallons Applied": '0',
    "Application Rate per acre (Gallons/ acre)": '0'
}

const fwTemplate = {
    "Application Date": '',
    "Field": '',
    "Acres Planted": '',
    "Cropable": '',
    "Total Acres": '',
    "Crop": 'Apple',
    "Plant Date": '',
    "Rain Day Prior to Event": '',
    "Rain Day of Event": '',
    "Rain Day After Event": '',
    "App Method": 'Surface (irragation)',
    "Sample Date": '',
    "Source Description": '',
    "Source Type": 'Surface water',
    "Sample Description": '',
    "Source of Analysis": 'Lab Analysis',
    "N (mg/L)": '0.00',
    "NH4-N (mg/L)": '0.00',
    "NO3-N (mg/L)": '0.00',
    "Calcium (mg/L)": '0.00',
    "Magnesium (mg/L)": '0.00',
    "Sodium (mg/L)": '0.00',
    "BiCarb (mg/L)": '0.00',
    "Carbonate (mg/L)": '0.00',
    "Sulfate (mg/L)": '0.00',
    "Chloride (mg/L)": '0.00',
    "EC (umhos/cm)": '0.00',
    "TDS (mg/L)": '0.00',
    "N DL": 1,
    "NH4-N DL": 1,
    "NO3-N DL": 1,
    "Calcium DL": 1,
    "Magnesium DL": 1,
    "Sodium DL": 1,
    "BiCarb DL": 1,
    "Carbonate DL": 1,
    "Sulfate DL": 1,
    "Chloride DL": 1,
    "EC DL": 1,
    "TDS DL": 10,
    "Application Rate (GPM)": '0',
    "Run Time (Hours)": '0',
    "Total Gallons Applied": '0',
    "Application Rate per Acre (Gallons/acre)": '0',
}

const smTemplate = {
    "Application Date": '',
    "Field": '',
    "Acres Planted": '',
    "Cropable": '',
    "Total Acres": '',
    "Crop": 'Apple',
    "Plant Date": '',
    "Rain Day Prior to Event": '',
    "Rain Day of Event": '',
    "Rain Day After Event": '',
    "App Method": 'Broadcast/incorporate',
    "Sample Date": '',
    "Sample Description": '',
    "Source Description": '',
    "Material Type": 'Corral solids',
    "Source of Analysis": 'Lab Analysis',
    "Method of Reporting": 'as-is',
    "Application (Tons)": '',
    "Application Rate per Acre (Tons/acre)": '',
    "% Moisture": '0.10',
    "% N": '',
    "% P": '',
    "% K": '',
    "% Calcium": '',
    "% Magnesium": '',
    "% Sodium": '',
    "% Sulfur": '',
    "% Chloride": '',
    "% TFS": '',
    "N DL": 1,
    "P DL": 1,
    "K DL": 1,
    "Calcium DL": 1,
    "Magnesium DL": 1,
    "Sodium DL": 1,
    "Sulfur DL": 1,
    "Chloride DL": 1,
    "TFS DL": 1,
}

const cfTemplate = {
    "Application Date": '',
    "Field": '',
    "Acres Planted": '',
    "Cropable": '',
    "Total Acres": '',
    "Crop": 'Apple',
    "Plant Date": '',
    "Rain Day Prior to Event": '',
    "Rain Day of Event": '',
    "Rain Day After Event": '',
    "App Method": 'Sidedress',
    "Import Description": '',
    "Import Date": '',
    "Material Type": 'Dry manure: Separator solids',
    "Amount Imported (tons/ gals)": '',
    "Method of Reporting": 'as-is',
    "Application Rate (Lbs/Acre)": '',
    "Amount Applied": '',
    "% Moisture": '0.10',
    "% N": '',
    "% P": '',
    "% K": '',
    "% Salt/ TFS/ TDS": '',
}


const smExportTemplate = {
    "Date": '',
    "Operator Name": '',
    "Operator Phone": '',
    "Operator 2nd Phone": '',
    "Operator Street": '',
    "Operator City": '',
    "Operator State": '',
    "Operator Zip": '',
    "Operator Is Owner": 'no',
    "Operator Is Operator": 'no',
    "Operator Responsible for Fees": 'no',
    "Contact First": '',
    "Contact Phone": '',
    "Hauler": '',
    "Hauler First": '',
    "Hauler Phone": '',
    "Hauler Street": '',
    "Hauler Cross Street": '',
    "Hauler County": '',
    "Hauler City": '',
    "Hauler State": '',
    "Hauler Zip": '',
    "Recipient": '',
    "Destination Type": 'Farmer',
    "Recipient Phone": '',
    "Recipient Street": '',
    "Recipient Cross Street": '',
    "Recipient County": '',
    "Recipient City": '',
    "Recipient State": '',
    "Recipient Zip": '',
    "APN": '',
    "Destination Street": '',
    "Destination Cross Street": '',
    "Destination County": '',
    "Destination City": '',
    "Destination State": '',
    "Destination Zip": '',
    "Method Used to Determine Amount Hauled": '',
    "Reporting Method": 'as-is',
    "Material Type": 'Dry manure: Corral solids',
    "Amount (Tons)": '',
    "% Moisture": '0.10',
    "% N": '',
    "% P": '',
    "% K": '',
    "% TFS": '',
}


const wwExportTemplate = {
    "Date": '',
    "Operator Name": '',
    "Operator Phone": '',
    "Operator 2nd Phone": '',
    "Operator Street": '',
    "Operator City": '',
    "Operator State": '',
    "Operator Zip": '',
    "Operator Is Owner": 'no',
    "Operator Is Operator": 'no',
    "Operator Responsible for Fees": 'no',
    "Contact First": '',
    "Contact Phone": '',
    "Hauler": '',
    "Hauler First": '',
    "Hauler Phone": '',
    "Hauler Street": '',
    "Hauler Cross Street": '',
    "Hauler County": '',
    "Hauler City": '',
    "Hauler State": '',
    "Hauler Zip": '',
    "Recipient": '',
    "Destination Type": 'Farmer',
    "Recipient Phone": '',
    "Recipient Street": '',
    "Recipient Cross Street": '',
    "Recipient County": '',
    "Recipient City": '',
    "Recipient State": '',
    "Recipient Zip": '',
    "APN": '',
    "Destination Street": '',
    "Destination Cross Street": '',
    "Destination County": '',
    "Destination City": '',
    "Destination State": '',
    "Destination Zip": '',
    "Method Used to Determine Amount Hauled": '',
    "Material Type": 'Process wastewater',
    "Hours": '',
    "GPM": '',
    "Amount (Gals)": '',
    "Source Description": '',
    "N (PPM)": '',
    "P (PPM)": '',
    "K (PPM)": '',
    "EC (umhos/cm)": '',
    "TDS (mg/L)": '',
}


const soilTemplate = {
    "Application Date": '',
    "Field": '',
    "Acres Planted": '',
    "Cropable": '',
    "Total Acres": '',
    "Crop": 'Apple',
    "Plant Date": '',
    "Rain Day Prior to Event": '',
    "Rain Day of Event": '',
    "Rain Day After Event": '',
    "App Method": 'Surface (irragation)',
    "Source Description": '',

    "Sample Date1": '',
    "Sample Description1": '',
    "Source of Analysis1": 'Lab Analysis',
    "N1 (mg/Kg)": '',
    "P1 (mg/Kg)": '',
    "Sol P1 (mg/Kg)": '',
    "K1 (mg/Kg)": '',
    "EC1 (umhos/cm)": '',
    "Organic Matter1 (%)": '',
    "N1 DL": 1,
    "P1 DL": 1,
    "Sol P1 DL": 1,
    "K1 DL": 1,
    "EC1 DL": 1,
    "Organic Matter1 DL": 1,

    "Sample Date2": '',
    "Sample Description2": '',
    "Source of Analysis2": 'Lab Analysis',
    "N2 (mg/Kg)": '',
    "P2 (mg/Kg)": '',
    "Sol P2 (mg/Kg)": '',
    "K2 (mg/Kg)": '',
    "EC2 (umhos/cm)": '',
    "Organic Matter2 (%)": '',
    "N2 DL": 1,
    "P2 DL": 1,
    "Sol P2 DL": 1,
    "K2 DL": 1,
    "EC2 DL": 1,
    "Organic Matter2 DL": 1,

    "Sample Date3": '',
    "Sample Description3": '',
    "Source of Analysis3": 'Lab Analysis',
    "N3 (mg/Kg)": '',
    "P3 (mg/Kg)": '',
    "Sol P3 (mg/Kg)": '',
    "K3 (mg/Kg)": '',
    "EC3 (umhos/cm)": '',
    "Organic Matter3 (%)": '',
    "N3 DL": 1,
    "P3 DL": 1,
    "Sol P3 DL": 1,
    "K3 DL": 1,
    "EC3 DL": 1,
    "Organic Matter3 DL": 1,
}


const plowdownTemplate = {
    "Application Date": '',
    "Field": '',
    "Acres Planted": '',
    "Cropable": '',
    "Total Acres": '',
    "Crop": 'Apple',
    "Plant Date": '',
    "Rain Day Prior to Event": '',
    "Rain Day of Event": '',
    "Rain Day After Event": '',
    "App Method": 'Surface (irragation)',
    "Source Description": '',
    "N lbs/ acre": '',
    "P lbs/ acre": '',
    "K lbs/ acre": '',
    "Salt lbs/ acre": '',
}

const tiledrainageTemplate = {
    "Source Description": '',
    "Sample Date": '',
    "Sample Description": '',
    "Source of Analysis": 'Lab Analysis',
    "NH4-N (mg/L)": 0,
    "NO3-N (mg/L)": 0,
    "P (mg/L)": 0,
    "EC (umhos/cm)": 0,
    "TDS (mg/L)": 0,
    "NH4-N DL": 1,
    "NO3-N DL": 1,
    "P DL": 1,
    "EC DL": 1,
    "TDS DL": 1,
}


const dischargeTemplate = {
    "Type": 'Storm water',
    "Date Time": '',
    "Location": '',
    "Volume discharged": '',
    "Volume Unit": 'gals',
    "Duration of Discharge (mins)": '',
    "Discharge Source": 'Wastewater',
    "Method of Measuring": '',
    "Rationale for Sample Location": '',
    "Reference Number for Discharge Site": '',
}

const harvestTemplate = {
    'Field': '',
    'Acres Planted': '',
    'Cropable': '',
    'Total Acres': '',
    'Crop': 'Apple',
    'Plant Date': '',
    'Harvest Dates': '',
    'Expected Yield Tons/Acre': '',
    'Actual Yield Tons/Acre': '',
    'Actual Yield Total Tons': '',
    'Sample Date': '',
    'Source of Analysis': 'Lab Analysis',
    'Reporting Method': 'as-is',
    '% Moisture': '0.10',
    '% N': '',
    '% P': '',
    '% K': '',
    '% TFS Salt (Dry Basis)': '',
    'N DL': 1,
    'P DL': 1,
    'K DL': 1,
    'TFS DL': 1,
}


module.exports = {
    harvestTemplate, wwTemplate, fwTemplate, smTemplate, cfTemplate, smExportTemplate,
    wwExportTemplate, soilTemplate, plowdownTemplate, tiledrainageTemplate, dischargeTemplate
}