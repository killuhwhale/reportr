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
    "Crop": '',
    "Plant Date": '',
    "Rain Day Prior to Event": 'No Precipitation',
    "Rain Day of Event": 'No Precipitation',
    "Rain Day After Event": 'No Precipitation',
    "App Method": '',
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
    "N DL": '50.00',
    "NH4-N DL": '50.00',
    "NH3-N DL": '50.00',
    "NO3-N DL": '50.00',
    "P DL": '50.00',
    "K DL": '50.00',
    "Calcium DL": '50.00',
    "Magnesium DL": '50.00',
    "Sodium DL": '50.00',
    "BiCarb DL": '50.00',
    "Carbonate DL": '50.00',
    "Sulfate DL": '50.00',
    "Chloride DL": '50.00',
    "EC DL": '1.00',
    "TDS DL": '10.00',
    "PH": '0',
    "Application Description": '',
    "Material Type": 'Wastewater',
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
    "Crop": '',
    "Plant Date": '',
    "Rain Day Prior to Event": '',
    "Rain Day of Event": '',
    "Rain Day After Event": '',
    "App Method": '',
    "Sample Date": '',
    "Source Description": '',
    "Source Type": '',
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
    "N DL": '0.5',
    "NH4-N DL": '0.5',
    "NO3-N DL": '0.5',
    "Calcium DL": '0.5',
    "Magnesium DL": '0.5',
    "Sodium DL": '0.5',
    "BiCarb DL": '0.5',
    "Carbonate DL": '0.5',
    "Sulfate DL": '0.5',
    "Chloride DL": '0.5',
    "EC DL": '0.5',
    "TDS DL": '0.5',
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
    "Crop": '',
    "Plant Date": '',
    "Rain Day Prior to Event": '',
    "Rain Day of Event": '',
    "Rain Day After Event": '',
    "App Method": '',
    "Sample Date": '',
    "Sample Description": '',
    "Source Description": '',
    "Material Type": '',
    "Source of Analysis": 'Lab Analysis',
    "Method of Reporting": '',
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
    "N DL": '50.00',
    "P DL": '50.00',
    "K DL": '50.00',
    "Calcium DL": '50.00',
    "Magnesium DL": '50.00',
    "Sodium DL": '50.00',
    "Sulfur DL": '50.00',
    "Chloride DL": '50.00',
    "TFS DL": '50.00',
}

const cfTemplate = {
    "Application Date": '',
    "Field": '',
    "Acres Planted": '',
    "Cropable": '',
    "Total Acres": '',
    "Crop": '',
    "Plant Date": '',
    "Rain Day Prior to Event": '',
    "Rain Day of Event": '',
    "Rain Day After Event": '',
    "App Method": '',
    "Import Description": '',
    "Import Date": '',
    "Material Type": '',
    "Amount Imported (tons/ gals)": '',
    "Method of Reporting": '',
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
    "Operator Is Owner": '',
    "Operator Is Operator": '',
    "Operator Responsible for Fees": '',
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
    "Destination Type": '',
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
    "Reporting Method": '',
    "Material Type": '',
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
    "Operator Is Owner": '',
    "Operator Is Operator": '',
    "Operator Responsible for Fees": '',
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
    "Destination Type": '',
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
    "Material Type": '',
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
    "Crop": '',
    "Plant Date": '',
    "Rain Day Prior to Event": '',
    "Rain Day of Event": '',
    "Rain Day After Event": '',
    "App Method": '',
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
    "N1 DL": '50.00',
    "P1 DL": '50.00',
    "Sol P1 DL": '50.00',
    "K1 DL": '50.00',
    "EC1 DL": '50.00',
    "Organic Matter1 DL": '50.00',

    "Sample Date2": '',
    "Sample Description2": '',
    "Source of Analysis2": 'Lab Analysis',
    "N2 (mg/Kg)": '',
    "P2 (mg/Kg)": '',
    "Sol P2 (mg/Kg)": '',
    "K2 (mg/Kg)": '',
    "EC2 (umhos/cm)": '',
    "Organic Matter2 (%)": '',
    "N2 DL": '50.00',
    "P2 DL": '50.00',
    "Sol P2 DL": '50.00',
    "K2 DL": '50.00',
    "EC2 DL": '50.00',
    "Organic Matter2 DL": '50.00',

    "Sample Date3": '',
    "Sample Description3": '',
    "Source of Analysis3": 'Lab Analysis',
    "N3 (mg/Kg)": '',
    "P3 (mg/Kg)": '',
    "Sol P3 (mg/Kg)": '',
    "K3 (mg/Kg)": '',
    "EC3 (umhos/cm)": '',
    "Organic Matter3 (%)": '',
    "N3 DL": '50.00',
    "P3 DL": '50.00',
    "Sol P3 DL": '50.00',
    "K3 DL": '50.00',
    "EC3 DL": '50.00',
    "Organic Matter3 DL": '50.00',
}


const plowdownTemplate = {
    "Application Date": '',
    "Field": '',
    "Acres Planted": '',
    "Cropable": '',
    "Total Acres": '',
    "Crop": '',
    "Plant Date": '',
    "Rain Day Prior to Event": '',
    "Rain Day of Event": '',
    "Rain Day After Event": '',
    "App Method": '',
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
    "NH4-N (mg/L)": '',
    "NO3-N (mg/L)": '',
    "P (mg/L)": '',
    "EC (umhos/cm)": '',
    "TDS (mg/L)": '',
    "NH4-N DL": '',
    "NO3-N DL": '',
    "P DL": '',
    "EC DL": '',
    "TDS DL": '',
}


const dischargeTemplate = {
    "Type": '',
    "Date Time": '',
    "Location": '',
    "Volume discharged": '',
    "Volume Unit": '',
    "Duration of Discharge (mins)": '',
    "Discharge Source": '',
    "Method of Measuring": '',
    "Rationale for Sample Location": '',
    "Reference Number for Discharge Site": '',
}

const harvestTemplate = {
    'Field': '',
    'Acres Planted': '',
    'Cropable': '',
    'Total Acres': '',
    'Crop': '',
    'Plant Date': '',
    'Harvest Dates': '',
    'Expected Yield Tons/Acre': '',
    'Actual Yield Tons/Acre': '',
    'Actual Yield Total Tons': '',
    'Sample Date': '',
    'Source of Analysis': 'Lab Analysis',
    'Reporting Method': '',
    '% Moisture': '0.10',
    '% N': '',
    '% P': '',
    '% K': '',
    '% TFS Salt (Dry Basis)': '',
    'N DL': '',
    'P DL': '',
    'K DL': '',
    'TFS DL': '',
}


module.exports = {
    harvestTemplate, wwTemplate, fwTemplate, smTemplate, cfTemplate, smExportTemplate,
    wwExportTemplate, soilTemplate, plowdownTemplate, tiledrainageTemplate, dischargeTemplate
}