import { jest } from '@jest/globals';
import { getAvailableNutrientsAB, getAvailableNutrientsC, getAvailableNutrientsF, getAvailableNutrientsG, getNutrientBudgetInfo, getNutrientBudgetA } from '../../../comps/Dairy/pdfDB'

const dairy_id = 1

const tp = (num, precision = 6) => {
    // to precision
    return parseFloat(num.toFixed(precision))
}

const isIDPK = (key) => {
    return key.indexOf("_id") >= 0 || key.indexOf("pk") >= 0
}


describe('Test pdfDB', () => {

    beforeAll(async () => {
        //Spin up Express App and DB.
        // On DB startup create scripts will be executed
        // I need a way to upload the same data each time.
        // Currently relying on uploadXLSX

        // Express App would need to know where to connect to/ how to connect to DB.

    })

    test('Nutrient Budget A. LAND APPLICATIONS are calculated and totaled correctly.', async () => {
        const { nutrientBudgetA } = await getNutrientBudgetA(dairy_id)
        const allEvents = nutrientBudgetA.allEvents
        // Remove _id and pk fields from objects
        Object.keys(allEvents).map((key, i) => {
            const field = allEvents[key]
            Object.keys(field).map((fieldKey, j) => {
                const plantEvent = field[fieldKey]
                Object.keys(plantEvent).map((plantEventKey, k) => {
                    const appEvent = plantEvent[plantEventKey]
                    Object.keys(appEvent).map(appEventKey => {
                        if (appEventKey === 'appDatesObjList') {
                            const appList = appEvent[appEventKey]
                            appList.forEach(appObj => {
                                Object.keys(appObj).forEach(appObjKey => {
                                    if (isIDPK(appObjKey)) {
                                        delete appObj[appObjKey]
                                    }
                                })
                            })
                        }
                    })
                })
            })
        })
        const expectedEvents = {
            'Field 1': {
                '2019-11-01T07:00:00.000Z': {
                    '2019-11-20T08:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'wastewater',
                            material_type: 'Process wastewater',
                            app_desc: 'Wastewater',
                            amount_applied: '360,000',
                            sample_date: '2019-11-12T08:00:00.000Z',
                            sample_desc: 'Lagoon',
                            sample_data_src: 'Lab Analysis',
                            kn_con: '484.00',
                            nh4_con: '0.00',
                            nh3_con: '0.00',
                            no3_con: '0.00',
                            p_con: '71.90',
                            k_con: '997.00',
                            ec: '8000',
                            tds: '8800.00',
                            ph: '0.00',
                            app_date: '2019-11-20T08:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            croptitle: 'Oats silage-soft dough',
                            fieldtitle: 'Field 1',
                            plant_date: '2019-11-01T07:00:00.000Z',
                            acres_planted: '22.00',
                            typical_yield: '16.00',
                            typical_moisture: '70.00',
                            typical_n: '10.000',
                            typical_p: '1.600',
                            typical_k: '8.300',
                            typical_salt: '0.000',
                            n_lbs_acre: '66.09',
                            p_lbs_acre: '9.82',
                            k_lbs_acre: '136.14',
                            salt_lbs_acre: '1,201.68'
                        },
                        {
                            entry_type: 'freshwater',
                            sample_date: '2020-08-06T07:00:00.000Z',
                            src_desc: 'Well 6',
                            src_type: 'Ground water',
                            sample_desc: 'Irrigation Water',
                            src_of_analysis: 'Lab Analysis',
                            n_con: '49.90',
                            nh4_con: '0.00',
                            no2_con: '0.00',
                            ca_con: '0.00',
                            mg_con: '0.00',
                            na_con: '0.00',
                            hco3_con: '0.00',
                            co3_con: '0.00',
                            so4_con: '0.00',
                            cl_con: '0.00',
                            ec: '1730.00',
                            tds: '0',
                            app_rate: '2100.000',
                            run_time: '6.000',
                            amount_applied: '756,000',
                            amt_applied_per_acre: '34364.000',
                            fieldtitle: 'Field 1',
                            croptitle: 'Oats silage-soft dough',
                            plant_date: '2019-11-01T07:00:00.000Z',
                            acres_planted: '22.00',
                            app_date: '2019-11-20T08:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            n_lbs_acre: '14.31',
                            p_lbs_acre: 0,
                            k_lbs_acre: 0,
                            salt_lbs_acre: '0'
                        }], totals: ['80.4', '9.82', '136.14', '1,201.68']
                    },
                    '2019-10-10T07:00:00.000Z': {
                        appDatesObjList: [
                            {
                                entry_type: 'soil',
                                src_desc: 'Field Sample',
                                fieldtitle: 'Field 1',
                                croptitle: 'Oats silage-soft dough',
                                plant_date: '2019-11-01T07:00:00.000Z',
                                acres_planted: '22.00',
                                app_date: '2019-10-10T07:00:00.000Z',
                                n_con_0: '50.00',
                                p_con_0: '20.00',
                                k_con_0: '50.00',
                                ec_0: '20.00',
                                org_matter_0: '20.00',
                                n_con_1: '50.00',
                                p_con_1: '20.00',
                                k_con_1: '50.00',
                                ec_1: '20.00',
                                org_matter_1: '20.00',
                                n_con_2: '50.00',
                                p_con_2: '20.00',
                                k_con_2: '50.00',
                                ec_2: '20.00',
                                org_matter_2: '20.00',
                                n_lbs_acre: 600,
                                p_lbs_acre: 240,
                                k_lbs_acre: 600,
                                salt_lbs_acre: 144,
                                amount_applied: '0'
                            },
                            {
                                entry_type: 'plowdown',
                                src_desc: 'Plowdown Ex1',
                                n_lbs_acre: '250',
                                p_lbs_acre: '250',
                                k_lbs_acre: '250',
                                salt_lbs_acre: '250',
                                fieldtitle: 'Field 1',
                                croptitle: 'Oats silage-soft dough',
                                plant_date: '2019-11-01T07:00:00.000Z',
                                acres_planted: '22.00',
                                app_date: '2019-10-10T07:00:00.000Z',
                                amount_applied: '0'
                            },
                            {
                                entry_type: 'freshwater',
                                sample_date: '2020-09-22T07:00:00.000Z',
                                src_desc: 'Canal',
                                src_type: 'Surface water',
                                sample_desc: 'Canal Water',
                                src_of_analysis: 'Lab Analysis',
                                n_con: '0.00',
                                nh4_con: '0.00',
                                no2_con: '0.00',
                                ca_con: '0.00',
                                mg_con: '0.00',
                                na_con: '0.00',
                                hco3_con: '0.00',
                                co3_con: '0.00',
                                so4_con: '0.00',
                                cl_con: '0.00',
                                ec: '259.00',
                                tds: '350',
                                app_rate: '5400.000',
                                run_time: '7.500',
                                amount_applied: '2,430,000',
                                amt_applied_per_acre: '110455.000',
                                fieldtitle: 'Field 1',
                                croptitle: 'Oats silage-soft dough',
                                plant_date: '2019-11-01T07:00:00.000Z',
                                acres_planted: '22.00',
                                app_date: '2019-10-10T07:00:00.000Z',
                                app_method: 'Surface (irragation)',
                                precip_before: 'No Precipitation',
                                precip_during: 'No Precipitation',
                                precip_after: 'No Precipitation',
                                n_lbs_acre: '0',
                                p_lbs_acre: 0,
                                k_lbs_acre: 0,
                                salt_lbs_acre: '322.61'
                            }], totals: ['850', '490', '850', '716.61']
                    },
                    '2020-01-10T08:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'wastewater',
                            material_type: 'Process wastewater',
                            app_desc: 'Wastewater',
                            amount_applied: '420,000',
                            sample_date: '2020-03-09T07:00:00.000Z',
                            sample_desc: 'Lagoon',
                            sample_data_src: 'Lab Analysis',
                            kn_con: '490.00',
                            nh4_con: '0.00',
                            nh3_con: '0.00',
                            no3_con: '0.00',
                            p_con: '33.40',
                            k_con: '714.00',
                            ec: '6000',
                            tds: '5020.00',
                            ph: '0.00',
                            app_date: '2020-01-10T08:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            croptitle: 'Oats silage-soft dough',
                            fieldtitle: 'Field 1',
                            plant_date: '2019-11-01T07:00:00.000Z',
                            acres_planted: '22.00',
                            typical_yield: '16.00',
                            typical_moisture: '70.00',
                            typical_n: '10.000',
                            typical_p: '1.600',
                            typical_k: '8.300',
                            typical_salt: '0.000',
                            n_lbs_acre: '78.06',
                            p_lbs_acre: '5.32',
                            k_lbs_acre: '113.75',
                            salt_lbs_acre: '799.75'
                        }], totals: ['78.06', '5.32', '113.75', '799.75']
                    }
                },
                '2020-05-07T07:00:00.000Z': {
                    '2020-05-07T07:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'fertilizer',
                            amount_applied: '50',
                            import_desc: 'UN32',
                            import_date: '2020-05-09T07:00:00.000Z',
                            material_type: 'Dry manure: Separator solids',
                            method_of_reporting: 'dry-weight',
                            amount_imported: '41.61',
                            moisture: '56.00',
                            n_con: '1.94',
                            p_con: '0.53',
                            k_con: '2.18',
                            salt_con: '0.00',
                            fieldtitle: 'Field 1',
                            croptitle: 'Corn silage',
                            plant_date: '2020-05-07T07:00:00.000Z',
                            acres_planted: '22.00',
                            app_date: '2020-05-07T07:00:00.000Z',
                            app_method: 'Sidedress',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            n_lbs_acre: '0.43',
                            p_lbs_acre: '0.12',
                            k_lbs_acre: '0.48',
                            salt_lbs_acre: '0'
                        }], totals: ['0.43', '0.12', '0.48', '0']
                    },
                    '2020-06-14T07:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'freshwater',
                            sample_date: '2020-09-22T07:00:00.000Z',
                            src_desc: 'Canal',
                            src_type: 'Surface water',
                            sample_desc: 'Canal Water',
                            src_of_analysis: 'Lab Analysis',
                            n_con: '0.00',
                            nh4_con: '0.00',
                            no2_con: '0.00',
                            ca_con: '0.00',
                            mg_con: '0.00',
                            na_con: '0.00',
                            hco3_con: '0.00',
                            co3_con: '0.00',
                            so4_con: '0.00',
                            cl_con: '0.00',
                            ec: '259.00',
                            tds: '350',
                            app_rate: '5400.000',
                            run_time: '6.000',
                            amount_applied: '1,944,000',
                            amt_applied_per_acre: '88364.000',
                            fieldtitle: 'Field 1',
                            croptitle: 'Corn silage',
                            plant_date: '2020-05-07T07:00:00.000Z',
                            acres_planted: '22.00',
                            app_date: '2020-06-14T07:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            n_lbs_acre: '0',
                            p_lbs_acre: 0,
                            k_lbs_acre: 0,
                            salt_lbs_acre: '258.09'
                        }], totals: ['0', '0', '0', '258.09']
                    },
                    '2020-06-04T07:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'freshwater',
                            sample_date: '2020-09-22T07:00:00.000Z',
                            src_desc: 'Canal',
                            src_type: 'Surface water',
                            sample_desc: 'Canal Water',
                            src_of_analysis: 'Lab Analysis',
                            n_con: '0.00',
                            nh4_con: '0.00',
                            no2_con: '0.00',
                            ca_con: '0.00',
                            mg_con: '0.00',
                            na_con: '0.00',
                            hco3_con: '0.00',
                            co3_con: '0.00',
                            so4_con: '0.00',
                            cl_con: '0.00',
                            ec: '259.00',
                            tds: '350',
                            app_rate: '5400.000',
                            run_time: '8.500',
                            amount_applied: '2,754,000',
                            amt_applied_per_acre: '125182.000',
                            fieldtitle: 'Field 1',
                            croptitle: 'Corn silage',
                            plant_date: '2020-05-07T07:00:00.000Z',
                            acres_planted: '22.00',
                            app_date: '2020-06-04T07:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            n_lbs_acre: '0',
                            p_lbs_acre: 0,
                            k_lbs_acre: 0,
                            salt_lbs_acre: '365.63'
                        }], totals: ['0', '0', '0', '365.63']
                    },
                    '2020-06-24T07:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'wastewater',
                            material_type: 'Process wastewater',
                            app_desc: 'Wastewater',
                            amount_applied: '570,000',
                            sample_date: '2020-05-18T07:00:00.000Z',
                            sample_desc: 'Lagoon',
                            sample_data_src: 'Lab Analysis',
                            kn_con: '437.00',
                            nh4_con: '0.00',
                            nh3_con: '0.00',
                            no3_con: '0.00',
                            p_con: '9.99',
                            k_con: '211.00',
                            ec: '8310',
                            tds: '9080.00',
                            ph: '0.00',
                            app_date: '2020-06-24T07:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            croptitle: 'Corn silage',
                            fieldtitle: 'Field 1',
                            plant_date: '2020-05-07T07:00:00.000Z',
                            acres_planted: '22.00',
                            typical_yield: '30.00',
                            typical_moisture: '70.00',
                            typical_n: '8.000',
                            typical_p: '1.500',
                            typical_k: '6.600',
                            typical_salt: '0.000',
                            n_lbs_acre: '94.48',
                            p_lbs_acre: '2.16',
                            k_lbs_acre: '45.62',
                            salt_lbs_acre: '1,963.2'
                        }], totals: ['94.48', '2.16', '45.62', '1,963.2']
                    },
                    '2020-07-20T07:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'wastewater',
                            material_type: 'Process wastewater',
                            app_desc: 'Wastewater',
                            amount_applied: '900,000',
                            sample_date: '2020-05-18T07:00:00.000Z',
                            sample_desc: 'Lagoon',
                            sample_data_src: 'Lab Analysis',
                            kn_con: '437.00',
                            nh4_con: '0.00',
                            nh3_con: '0.00',
                            no3_con: '0.00',
                            p_con: '9.99',
                            k_con: '211.00',
                            ec: '8310',
                            tds: '9080.00',
                            ph: '0.00',
                            app_date: '2020-07-20T07:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            croptitle: 'Corn silage',
                            fieldtitle: 'Field 1',
                            plant_date: '2020-05-07T07:00:00.000Z',
                            acres_planted: '22.00',
                            typical_yield: '30.00',
                            typical_moisture: '70.00',
                            typical_n: '8.000',
                            typical_p: '1.500',
                            typical_k: '6.600',
                            typical_salt: '0.000',
                            n_lbs_acre: '149.19',
                            p_lbs_acre: '3.41',
                            k_lbs_acre: '72.03',
                            salt_lbs_acre: '3,099.79'
                        }], totals: ['149.19', '3.41', '72.03', '3,099.79']
                    }
                }
            },
            'Field 17': {
                '2020-06-01T07:00:00.000Z': {
                    '2020-05-06T07:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'manure',
                            src_desc: 'Solid Manure',
                            amount_applied: '3,309',
                            amt_applied_per_acre: '11.40',
                            sample_desc: 'Manure Caetano',
                            sample_date: '2020-03-09T07:00:00.000Z',
                            material_type: 'Corral solids',
                            src_of_analysis: 'Lab Analysis',
                            moisture: '56.00',
                            method_of_reporting: 'dry-weight',
                            n_con: '1.9400',
                            p_con: '0.5280',
                            k_con: '2.1800',
                            ca_con: '0.0000',
                            mg_con: '0.0000',
                            na_con: '0.0000',
                            s_con: '0.0000',
                            cl_con: '0.0000',
                            tfs: '0.0000',
                            fieldtitle: 'Field 17',
                            croptitle: 'Corn silage',
                            plant_date: '2020-06-01T07:00:00.000Z',
                            acres_planted: '290.00',
                            app_date: '2020-05-06T07:00:00.000Z',
                            app_method: 'Broadcast/incorporate',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            n_lbs_acre: '194.8',
                            p_lbs_acre: '53.02',
                            k_lbs_acre: '218.9',
                            salt_lbs_acre: '0'
                        }], totals: ['194.8', '53.02', '218.9', '0']
                    }
                }
            },
            'Field 2': {
                '2019-11-01T07:00:00.000Z': {
                    '2020-01-12T08:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'wastewater',
                            material_type: 'Process wastewater',
                            app_desc: 'Wastewater',
                            amount_applied: '600,000',
                            sample_date: '2020-03-09T07:00:00.000Z',
                            sample_desc: 'Lagoon',
                            sample_data_src: 'Lab Analysis',
                            kn_con: '490.00',
                            nh4_con: '0.00',
                            nh3_con: '0.00',
                            no3_con: '0.00',
                            p_con: '33.40',
                            k_con: '714.00',
                            ec: '6000',
                            tds: '5020.00',
                            ph: '0.00',
                            app_date: '2020-01-12T08:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            croptitle: 'Oats silage-soft dough',
                            fieldtitle: 'Field 2',
                            plant_date: '2019-11-01T07:00:00.000Z',
                            acres_planted: '17.00',
                            typical_yield: '16.00',
                            typical_moisture: '70.00',
                            typical_n: '10.000',
                            typical_p: '1.600',
                            typical_k: '8.300',
                            typical_salt: '0.000',
                            n_lbs_acre: '144.32',
                            p_lbs_acre: '9.84',
                            k_lbs_acre: '210.29',
                            salt_lbs_acre: '1,478.54'
                        },
                        {
                            entry_type: 'freshwater',
                            sample_date: '2020-08-06T07:00:00.000Z',
                            src_desc: 'Well 5',
                            src_type: 'Ground water',
                            sample_desc: 'Irrigation Water',
                            src_of_analysis: 'Lab Analysis',
                            n_con: '48.50',
                            nh4_con: '0.00',
                            no2_con: '0.00',
                            ca_con: '0.00',
                            mg_con: '0.00',
                            na_con: '0.00',
                            hco3_con: '0.00',
                            co3_con: '0.00',
                            so4_con: '0.00',
                            cl_con: '0.00',
                            ec: '1660.00',
                            tds: '10',
                            app_rate: '1700.000',
                            run_time: '10.000',
                            amount_applied: '1,020,000',
                            amt_applied_per_acre: '60000.000',
                            fieldtitle: 'Field 2',
                            croptitle: 'Oats silage-soft dough',
                            plant_date: '2019-11-01T07:00:00.000Z',
                            acres_planted: '17.00',
                            app_date: '2020-01-12T08:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            n_lbs_acre: '24.28',
                            p_lbs_acre: 0,
                            k_lbs_acre: 0,
                            salt_lbs_acre: '5.01'
                        }], totals: ['168.6', '9.84', '210.29', '1,483.54']
                    },
                    '2019-10-09T07:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'freshwater',
                            sample_date: '2020-09-22T07:00:00.000Z',
                            src_desc: 'Canal',
                            src_type: 'Surface water',
                            sample_desc: 'Canal Water',
                            src_of_analysis: 'Lab Analysis',
                            n_con: '0.00',
                            nh4_con: '0.00',
                            no2_con: '0.00',
                            ca_con: '0.00',
                            mg_con: '0.00',
                            na_con: '0.00',
                            hco3_con: '0.00',
                            co3_con: '0.00',
                            so4_con: '0.00',
                            cl_con: '0.00',
                            ec: '259.00',
                            tds: '350',
                            app_rate: '5400.000',
                            run_time: '13.330',
                            amount_applied: '4,318,920',
                            amt_applied_per_acre: '254054.000',
                            fieldtitle: 'Field 2',
                            croptitle: 'Oats silage-soft dough',
                            plant_date: '2019-11-01T07:00:00.000Z',
                            acres_planted: '17.00',
                            app_date: '2019-10-09T07:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            n_lbs_acre: '0',
                            p_lbs_acre: 0,
                            k_lbs_acre: 0,
                            salt_lbs_acre: '742.03'
                        }], totals: ['0', '0', '0', '742.03']
                    },
                    '2020-02-22T08:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'wastewater',
                            material_type: 'Process wastewater',
                            app_desc: 'Wastewater',
                            amount_applied: '360,000',
                            sample_date: '2020-03-09T07:00:00.000Z',
                            sample_desc: 'Lagoon',
                            sample_data_src: 'Lab Analysis',
                            kn_con: '490.00',
                            nh4_con: '0.00',
                            nh3_con: '0.00',
                            no3_con: '0.00',
                            p_con: '33.40',
                            k_con: '714.00',
                            ec: '6000',
                            tds: '5020.00',
                            ph: '0.00',
                            app_date: '2020-02-22T08:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            croptitle: 'Oats silage-soft dough',
                            fieldtitle: 'Field 2',
                            plant_date: '2019-11-01T07:00:00.000Z',
                            acres_planted: '17.00',
                            typical_yield: '16.00',
                            typical_moisture: '70.00',
                            typical_n: '10.000',
                            typical_p: '1.600',
                            typical_k: '8.300',
                            typical_salt: '0.000',
                            n_lbs_acre: '86.59',
                            p_lbs_acre: '5.9',
                            k_lbs_acre: '126.18',
                            salt_lbs_acre: '887.12'
                        }], totals: ['86.59', '5.9', '126.18', '887.12']
                    }
                },
                '2020-05-07T07:00:00.000Z': {
                    '2020-05-07T07:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'fertilizer',
                            amount_applied: '50',
                            import_desc: 'UN32',
                            import_date: '2020-05-09T07:00:00.000Z',
                            material_type: 'Commercial fertilizer/ Other: Solid commercial fertilizer',
                            method_of_reporting: 'dry-weight',
                            amount_imported: '41.61',
                            moisture: '0.00',
                            n_con: '32.00',
                            p_con: '0.00',
                            k_con: '0.00',
                            salt_con: '0.00',
                            fieldtitle: 'Field 2',
                            croptitle: 'Corn silage',
                            plant_date: '2020-05-07T07:00:00.000Z',
                            acres_planted: '17.00',
                            app_date: '2020-05-07T07:00:00.000Z',
                            app_method: 'Sidedress',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            n_lbs_acre: '16',
                            p_lbs_acre: '0',
                            k_lbs_acre: '0',
                            salt_lbs_acre: '0'
                        }], totals: ['16', '0', '0', '0']
                    },
                    '2020-06-04T07:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'wastewater',
                            material_type: 'Process wastewater',
                            app_desc: 'Wastewater',
                            amount_applied: '1,200,000',
                            sample_date: '2020-05-18T07:00:00.000Z',
                            sample_desc: 'Lagoon',
                            sample_data_src: 'Lab Analysis',
                            kn_con: '437.00',
                            nh4_con: '0.00',
                            nh3_con: '0.00',
                            no3_con: '0.00',
                            p_con: '9.99',
                            k_con: '211.00',
                            ec: '8310',
                            tds: '9080.00',
                            ph: '0.00',
                            app_date: '2020-06-04T07:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            croptitle: 'Corn silage',
                            fieldtitle: 'Field 2',
                            plant_date: '2020-05-07T07:00:00.000Z',
                            acres_planted: '17.00',
                            typical_yield: '30.00',
                            typical_moisture: '70.00',
                            typical_n: '8.000',
                            typical_p: '1.500',
                            typical_k: '6.600',
                            typical_salt: '0.000',
                            n_lbs_acre: '257.42',
                            p_lbs_acre: '5.88',
                            k_lbs_acre: '124.29',
                            salt_lbs_acre: '5,348.65'
                        },
                        {
                            entry_type: 'freshwater',
                            sample_date: '2020-09-22T07:00:00.000Z',
                            src_desc: 'Canal',
                            src_type: 'Surface water',
                            sample_desc: 'Canal Water',
                            src_of_analysis: 'Lab Analysis',
                            n_con: '0.00',
                            nh4_con: '0.00',
                            no2_con: '0.00',
                            ca_con: '0.00',
                            mg_con: '0.00',
                            na_con: '0.00',
                            hco3_con: '0.00',
                            co3_con: '0.00',
                            so4_con: '0.00',
                            cl_con: '0.00',
                            ec: '259.00',
                            tds: '350',
                            app_rate: '5400.000',
                            run_time: '20.000',
                            amount_applied: '6,480,000',
                            amt_applied_per_acre: '381176.000',
                            fieldtitle: 'Field 2',
                            croptitle: 'Corn silage',
                            plant_date: '2020-05-07T07:00:00.000Z',
                            acres_planted: '17.00',
                            app_date: '2020-06-04T07:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            n_lbs_acre: '0',
                            p_lbs_acre: 0,
                            k_lbs_acre: 0,
                            salt_lbs_acre: '1,113.32'
                        }], totals: ['257.42', '5.88', '124.29', '6,461.97']
                    },
                    '2020-04-26T07:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'freshwater',
                            sample_date: '2020-09-22T07:00:00.000Z',
                            src_desc: 'Canal',
                            src_type: 'Surface water',
                            sample_desc: 'Canal Water',
                            src_of_analysis: 'Lab Analysis',
                            n_con: '0.00',
                            nh4_con: '0.00',
                            no2_con: '0.00',
                            ca_con: '0.00',
                            mg_con: '0.00',
                            na_con: '0.00',
                            hco3_con: '0.00',
                            co3_con: '0.00',
                            so4_con: '0.00',
                            cl_con: '0.00',
                            ec: '259.00',
                            tds: '350',
                            app_rate: '5400.000',
                            run_time: '16.000',
                            amount_applied: '5,184,000',
                            amt_applied_per_acre: '304941.000',
                            fieldtitle: 'Field 2',
                            croptitle: 'Corn silage',
                            plant_date: '2020-05-07T07:00:00.000Z',
                            acres_planted: '17.00',
                            app_date: '2020-04-26T07:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            n_lbs_acre: '0',
                            p_lbs_acre: 0,
                            k_lbs_acre: 0,
                            salt_lbs_acre: '890.66'
                        }], totals: ['0', '0', '0', '890.66']
                    },
                    '2020-08-06T07:00:00.000Z': {
                        appDatesObjList: [{
                            entry_type: 'wastewater',
                            material_type: 'Process wastewater',
                            app_desc: 'Wastewater',
                            amount_applied: '450,000',
                            sample_date: '2020-05-18T07:00:00.000Z',
                            sample_desc: 'Lagoon',
                            sample_data_src: 'Lab Analysis',
                            kn_con: '437.00',
                            nh4_con: '0.00',
                            nh3_con: '0.00',
                            no3_con: '0.00',
                            p_con: '9.99',
                            k_con: '211.00',
                            ec: '8310',
                            tds: '9080.00',
                            ph: '0.00',
                            app_date: '2020-08-06T07:00:00.000Z',
                            app_method: 'Surface (irragation)',
                            precip_before: 'No Precipitation',
                            precip_during: 'No Precipitation',
                            precip_after: 'No Precipitation',
                            croptitle: 'Corn silage',
                            fieldtitle: 'Field 2',
                            plant_date: '2020-05-07T07:00:00.000Z',
                            acres_planted: '17.00',
                            typical_yield: '30.00',
                            typical_moisture: '70.00',
                            typical_n: '8.000',
                            typical_p: '1.500',
                            typical_k: '6.600',
                            typical_salt: '0.000',
                            n_lbs_acre: '96.53',
                            p_lbs_acre: '2.21',
                            k_lbs_acre: '46.61',
                            salt_lbs_acre: '2,005.75'
                        }], totals: ['96.53', '2.21', '46.61', '2,005.75']
                    }
                }
            }
        }
        expect(allEvents).toEqual(expectedEvents)
    })

    test('Nutrient Budget B, NaprbalABC(Summary) Info is calculated accurately.', async () => {
        /**
        *  {
               nutrientBudgetB: {
                 allEvents: {
                   'Field 12019-11-01T07:00:00.000Z': [Object],
                   'Field 12020-05-07T07:00:00.000Z': [Object],
                   'Field 172020-06-01T07:00:00.000Z': [Object],
                   'Field 22019-11-01T07:00:00.000Z': [Object],
                   'Field 22020-05-07T07:00:00.000Z': [Object]
                 },
                 totalAppsSummary: {
                   soils: [Array],
                   plows: [Array],
                   fertilizers: [Array],
                   manures: [Array],
                   wastewaters: [Array],
                   freshwaters: [Array],
                   anti_harvests: [Array],
                   actual_harvests: [Array],
                   freshwater_app: [Array],
                   wastewater_app: [Array],
                   total_app: [Array],
                   nutrient_bal: [Array],
                   nutrient_bal_ratio: [Array],
                   atmospheric_depo: 42
                 }
               }
             }
           
        */

        const budgetInfo = await getNutrientBudgetInfo(dairy_id)
        const {
            soils,
            plows,
            fertilizers,
            manures,
            wastewaters,
            freshwaters,
            anti_harvests,
            actual_harvests,
            freshwater_app,  // side panel for water applied, not included in summary
            wastewater_app,
            total_app,
            nutrient_bal,
            nutrient_bal_ratio,
            atmospheric_depo
        } = budgetInfo.nutrientBudgetB.totalAppsSummary

        // Test totals 
        expect(soils).toEqual([13200, 5280, 13200, 3168])
        expect(plows).toEqual([5500, 5500, 5500, 5500])
        expect(fertilizers).toEqual([281.46, 2.6399999999999997, 10.559999999999999, 0])
        expect(manures).toEqual([56491.24799999999, 15374.937599999997, 63479.856, 0])
        expect(wastewaters).toEqual([18474.8286, 860.7433560000002, 16711.363200000003, 320658.29400000005])
        expect(freshwaters).toEqual([727.6372680000001, 0, 0, 67586.33859])
        expect(anti_harvests).toEqual([85200.00, 15803.40, 70321.20, 0.00])
        expect(actual_harvests).toEqual([19545.82, 3594.7799999999997, 36842, 93314.75])
        expect(total_app).toEqual([99281.17386799998, 27018.320955999996, 98901.7792, 396912.63259000005])
        expect(nutrient_bal).toEqual([79735.35386799998, 23423.540955999997, 62059.779200000004, 303597.88259000005])
        expect(nutrient_bal_ratio).toEqual([5.079406945730596, 7.515987336081762, 2.6844845339558114, 4.25348224787614])
        expect(atmospheric_depo).toEqual(4606)

        // Test total per field
        const allEvents = budgetInfo.nutrientBudgetB.allEvents
        const keys = [
            'Field 12019-11-01T07:00:00.000Z',
            'Field 12020-05-07T07:00:00.000Z',
            'Field 172020-06-01T07:00:00.000Z',
            'Field 22019-11-01T07:00:00.000Z',
            'Field 22020-05-07T07:00:00.000Z'
        ]
        // Expected data
        const event_keys = {
            'soils': [
                [600, 240, 600, 144],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            'plows': [
                [250, 250, 250, 250],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            'fertilizers': [
                // Currently all values are the values given by the current state of the proramg.
                // TODO() Find all the correct values for each field and then get code to produce correct answer.
                // this shouldnt be zero.
                [0, 0, 0, 0],
                [0.43, 0.12, 0.48, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [16, 0, 0, 0],
            ],
            'manures': [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [194.79740689655168, 53.017026206896546, 218.89605517241378, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            'wastewaters': [
                [144.15608181818183, 15.139347272727274, 249.8948181818182, 2001.4344545454546],
                [243.67020681818184, 5.5704012954545465, 117.65312045454547, 5062.9873636363645],
                [0, 0, 0, 0],
                [230.91105882352946, 15.739651764705885, 336.47040000000004, 2365.6602352941177],
                [353.95072058823536, 8.091459264705883, 170.90069117647062, 7354.399411764706],
            ],
            'freshwaters': [
                [14.309702242, 0, 0, 322.61144125000004],
                [0, 0, 0, 623.7144795],
                [0, 0, 0, 0],
                [24.28395, 0, 0, 747.0352205],
                [0, 0, 0, 2003.97622775],
            ],
            'anti_harvests': [
                [160, 25.6, 132.8, 0],
                [240, 45, 198, 0],
                [240, 45, 198, 0],
                [160, 25.6, 132.8, 0],
                [240, 45, 198, 0],

            ],
            'actual_harvests': [
                [177.72727272727272, 49.40818181818182, 483.41818181818184, 1235.204545454545],
                [343.46909090909094, 49.14090909090909, 470.71818181818185, 1214.815],
                [0, 0, 0, 0],
                [193.1470588235294, 30.08823529411765, 300.8823529411765, 889.3694117647058],
                [282.1176470588236, 53.83529411764706, 631.529411764706, 1429.1200000000001],
            ],
            'freshwater_app': [
                [3186000, 117.32954594835668, 5.333161179470758],
                [4698000, 173.01136436452595, 7.864152925660271],
                [0, 0, 0],
                [5338920, 196.6142685042688, 11.565545206133459],
                [11664000, 429.5454563533058, 25.267379785488576],
            ],
            'wastewater_app': [
                [780000, 28.724747595642878, 1.3056703452564946],
                [1470000, 54.13510123794235, 2.4606864199064704],
                [0, 0, 0],
                [960000, 35.3535355023297, 2.0796197354311587],
                [1650000, 60.76388914462917, 3.5743464202723043],
            ],
            'total_app': [
                [1015.4657840601818, 505.13934727272726, 1099.8948181818182, 2718.0458957954547],
                [251.10020681818185, 5.690401295454547, 118.13312045454548, 5686.701843136365],
                [208.79740689655168, 53.017026206896546, 218.89605517241378, 0],
                [262.19500882352946, 15.739651764705885, 336.47040000000004, 3112.6954557941176],
                [376.95072058823536, 8.091459264705883, 170.90069117647062, 9358.375639514707],
            ],
            'nutrient_bal': [
                [837.7385113329091, 455.7311654545454, 616.4766363636363, 1482.8413503409097],
                [-92.36888409090909, -43.45050779545454, -352.5850613636364, 4471.886843136364],
                [208.79740689655168, 53.017026206896546, 218.89605517241378, 0],
                [69.04795000000007, -14.348583529411764, 35.58804705882352, 2223.3260440294116],
                [94.83307352941176, -45.74383485294118, -460.62872058823535, 7929.255639514707],
            ],
            'nutrient_bal_ratio': [
                [5.713618222333504, 10.223799554729617, 2.275245035354295, 2.2004824268155816],
                [0.7310707526944333, 0.11579763990380171, 0.2509635807953031, 4.6811258036296595],
                [0, 0, 0, 0],
                [1.3574890056342321, 0.5231164809384165, 1.1182789442815249, 3.499890388199703],
                [1.3361472581317764, 0.1503002704326923, 0.2706139856557377, 6.5483483818816515],
            ],
            'totalHarvests': [1, 1, 0, 1, 1],
            'acres_planted': [22, 22, 290, 17, 17],
            'atmospheric_depo': [7, 7, 14, 7, 7],
            'headerInfo': [
                {
                    acres_planted: "22.00",
                    app_date: "2019-10-10T07:00:00.000Z",
                    croptitle: "Oats silage-soft dough",
                    entry_type: "plowdown",
                    fieldtitle: "Field 1",
                    k_lbs_acre: "250",
                    n_lbs_acre: "250",
                    p_lbs_acre: "250",
                    plant_date: "2019-11-01T07:00:00.000Z",
                    salt_lbs_acre: "250",
                    src_desc: "Plowdown Ex1",
                },
                {
                    acres_planted: "22.00",
                    amount_applied: "50.00",
                    amount_imported: "41.61",
                    app_date: "2020-05-07T07:00:00.000Z",
                    app_method: "Sidedress",
                    croptitle: "Corn silage",
                    entry_type: "fertilizer",
                    fieldtitle: "Field 1",
                    import_date: "2020-05-09T07:00:00.000Z",
                    import_desc: "UN32",
                    k_con: "2.18",
                    material_type: "Dry manure: Separator solids",
                    method_of_reporting: "dry-weight",
                    moisture: "56.00",
                    n_con: "1.94",
                    p_con: "0.53",
                    plant_date: "2020-05-07T07:00:00.000Z",
                    precip_after: "No Precipitation",
                    precip_before: "No Precipitation",
                    precip_during: "No Precipitation",
                    salt_con: "0.00",

                },
                {
                    acres_planted: "290.00",
                    amount_applied: "3309.00",
                    amt_applied_per_acre: "11.40",
                    app_date: "2020-05-06T07:00:00.000Z",
                    app_method: "Broadcast/incorporate",
                    ca_con: "0.0000",
                    cl_con: "0.0000",
                    croptitle: "Corn silage",
                    entry_type: "manure",
                    fieldtitle: "Field 17",
                    k_con: "2.1800",
                    material_type: "Corral solids",
                    method_of_reporting: "dry-weight",
                    mg_con: "0.0000",
                    moisture: "56.00",
                    n_con: "1.9400",
                    na_con: "0.0000",
                    p_con: "0.5280",
                    plant_date: "2020-06-01T07:00:00.000Z",
                    precip_after: "No Precipitation",
                    precip_before: "No Precipitation",
                    precip_during: "No Precipitation",
                    s_con: "0.0000",
                    sample_date: "2020-03-09T07:00:00.000Z",
                    sample_desc: "Manure Caetano",
                    src_desc: "Solid Manure",
                    src_of_analysis: "Lab Analysis",
                    tfs: "0.0000",
                },
                {
                    acres_planted: "17.00",
                    amount_applied: 600000,
                    app_date: "2020-01-12T08:00:00.000Z",
                    app_desc: "Wastewater",
                    app_method: "Surface (irragation)",
                    croptitle: "Oats silage-soft dough",
                    ec: "6000",
                    entry_type: "wastewater",
                    fieldtitle: "Field 2",
                    k_con: "714.00",
                    kn_con: "490.00",
                    material_type: "Process wastewater",
                    nh3_con: "0.00",
                    nh4_con: "0.00",
                    no3_con: "0.00",
                    p_con: "33.40",
                    ph: "0.00",
                    plant_date: "2019-11-01T07:00:00.000Z",
                    precip_after: "No Precipitation",
                    precip_before: "No Precipitation",
                    precip_during: "No Precipitation",
                    sample_data_src: "Lab Analysis",
                    sample_date: "2020-03-09T07:00:00.000Z",
                    sample_desc: "Lagoon",
                    tds: "5020.00",
                    typical_k: "8.300",
                    typical_moisture: "70.00",
                    typical_n: "10.000",
                    typical_p: "1.600",
                    typical_salt: "0.000",
                    typical_yield: "16.00",
                },
                {
                    acres_planted: "17.00",
                    amount_applied: "50.00",
                    amount_imported: "41.61",
                    app_date: "2020-05-07T07:00:00.000Z",
                    app_method: "Sidedress",
                    croptitle: "Corn silage",
                    entry_type: "fertilizer",
                    fieldtitle: "Field 2",
                    import_date: "2020-05-09T07:00:00.000Z",
                    import_desc: "UN32",
                    k_con: "0.00",
                    material_type: "Commercial fertilizer/ Other: Solid commercial fertilizer",
                    method_of_reporting: "dry-weight",
                    moisture: "0.00",
                    n_con: "32.00",
                    p_con: "0.00",
                    plant_date: "2020-05-07T07:00:00.000Z",
                    precip_after: "No Precipitation",
                    precip_before: "No Precipitation",
                    precip_during: "No Precipitation",
                    salt_con: "0.00",
                }
            ],
        }

        keys.forEach((key, appIdx) => {
            const ev = allEvents[key]
            // Remove ID and PK fields from headerInfo Object since they may change.
            Object.keys(event_keys).forEach(ev_key => {
                if (ev_key == 'headerInfo') {
                    Object.keys(ev[ev_key]).forEach(headerInfoKey => {
                        if (isIDPK(headerInfoKey)) {
                            delete ev[ev_key][headerInfoKey]
                        }
                    })
                }
                // console.log(ev_key)
                expect(ev[ev_key]).toEqual(event_keys[ev_key][appIdx])
            })
        })
    })

    test('AB. HERD INFORMATION:MANURE GENERATED', async () => {
        const { availableNutrientsAB } = await getAvailableNutrientsAB(dairy_id)

        Object.keys(availableNutrientsAB.herdInfo).map(key => {
            if (isIDPK(key)) {
                delete availableNutrientsAB.herdInfo[key]
            }
        })

        const expectedResult = {
            herdInfo: {
                milk_cows: [1, 1, 2, 1, 1, 1],
                dry_cows: [1, 1, 2, 1, 5000],
                bred_cows: [1, 1, 2, 1, 1],
                cows: [1, 1, 2, 1, 1],
                calf_young: [1, 1, 2, 1],
                calf_old: [1, 1, 2, 1]
            },
            herdCalc: ['67.83', '705.93', '101.02', '146.58', '702.72']
        }

        expect(availableNutrientsAB).toEqual(expectedResult)

    })

    test('C. Process Wastewater Generated', async () => {
        const { availableNutrientsC } = await getAvailableNutrientsC(dairy_id)

        const expectedResult = {
            applied: ['4,860,000', '18,474.83', '860.74', '16,711.36', '320,658.29'],
            exported: ['840,000', '3,392.74', '504', '6,988.77', '61,686.24'],
            imported: ['0', '0', '0', '0', '0'],
            generated: ['5,700,000', '21,867.57', '1,364.75', '23,700.13', '382,344.53']
        }

        expect(availableNutrientsC).toEqual(expectedResult)
    })

    test('F. NUTRIENT IMPORTS', async () => {
        const { availableNutrientsF } = await getAvailableNutrientsF(dairy_id)

        availableNutrientsF.dry.map(item => {
            Object.keys(item).map(key => {
                if (isIDPK(key)) {
                    delete item[key]
                }
            })
        })

        availableNutrientsF.process.map(item => {
            Object.keys(item).map(key => {
                if (isIDPK(key)) {
                    delete item[key]
                }
            })
        })

        availableNutrientsF.commercial.map(item => {
            Object.keys(item).map(key => {
                if (isIDPK(key)) {
                    delete item[key]
                }
            })
        })

        const expectedResult = {
            dry: [{
                import_desc: 'UN32',
                import_date: '2020-05-09T07:00:00.000Z',
                material_type: 'Dry manure: Separator solids',
                amount_imported: '41.61',
                method_of_reporting: 'dry-weight',
                moisture: '56.00',
                n_con: '1.94',
                p_con: '0.53',
                k_con: '2.18',
                salt_con: '0.00'
            }],
            process: [],
            commercial: [{
                import_desc: 'UN32',
                import_date: '2020-05-09T07:00:00.000Z',
                material_type: 'Commercial fertilizer/ Other: Solid commercial fertilizer',
                amount_imported: '41.61',
                method_of_reporting: 'dry-weight',
                moisture: '0.00',
                n_con: '32.00',
                p_con: '0.00',
                k_con: '0.00',
                salt_con: '0.00'
            }],
            dryTotals: [710.3659199999998, 194.06904, 798.24624, 0],
            processTotals: [0, 0, 0, 0],
            commercialTotals: [26603.769600000003, 0, 0, 0],
            total: [27314.135520000003, 194.06904, 798.24624, 0]
        }

        expect(availableNutrientsF).toEqual(expectedResult)
    })

    test('G. NUTRIENT EXPORTS ', async () => {
        const { availableNutrientsG } = await getAvailableNutrientsG(dairy_id)

        availableNutrientsG.dry.map(item => {
            Object.keys(item).map(key => {
                if (isIDPK(key)) {
                    delete item[key]
                }
            })
        })
        availableNutrientsG.process.map(item => {
            Object.keys(item).map(key => {
                if (isIDPK(key)) {
                    delete item[key]
                }
            })
        })

        const expectedResult = {
            dry: [{
                last_date_hauled: '2020-03-05T08:00:00.000Z',
                amount_hauled: 1898,
                material_type: 'Dry manure: Corral solids',
                amount_hauled_method: 'IDK boss',
                reporting_method: 'dry-weight',
                moisture: '56.00',
                n_con_mg_kg: 19400,
                p_con_mg_kg: 5280,
                k_con_mg_kg: 21800,
                tfs: '0.0000',
                ec_umhos_cm: null,
                salt_lbs_rm: '1337.00',
                n_lbs_rm: '1337.00',
                p_lbs_rm: '1337.00',
                k_lbs_rm: '1337.00',
                kn_con_mg_l: null,
                nh4_con_mg_l: null,
                nh3_con_mg_l: null,
                no3_con_mg_l: null,
                p_con_mg_l: null,
                k_con_mg_l: null,
                tds: null,
                pnumber: '',
                dest_street: '23464 Turner Ave.',
                dest_cross_street: '',
                dest_county: 'Merced',
                dest_city: 'Hilmar',
                dest_city_state: 'CA',
                dest_city_zip: '95324',
                dest_type: 'Farmer',
                recipient_title: 'Caetano Ranch',
                recipient_primary_phone: '(209) 564-6329',
                recipient_street: '23464 Turner Ave.',
                recipient_cross_street: '',
                recipient_county: 'Merced',
                recipient_city: 'Hilmar',
                recipient_city_state: 'CA',
                recipient_city_zip: '95324',
                contact_first_name: 'Spencer',
                contact_primary_phone: '(209) 634-7520',
                operator_title: 'Spencer Nylund',
                operator_primary_phone: '(209) 634-7520',
                operator_secondary_phone: '',
                operator_street: 'P.O. Box 1029',
                operator_city: 'Hilmar',
                operator_city_state: 'CA',
                operator_city_zip: '95324',
                operator_is_owner: true,
                operator_is_responsible: true,
                hauler_title: 'Cardoza Farm Service',
                hauler_first_name: 'Linda ',
                hauler_primary_phone: '(209) 564-6329',
                hauler_street: 'P.O. Box 60',
                hauler_cross_street: '',
                hauler_county: 'Merced',
                hauler_city: 'Hilmar',
                hauler_city_state: 'CA',
                hauler_city_zip: '95324'
            },
            {
                last_date_hauled: '2020-05-08T07:00:00.000Z',
                amount_hauled: 1839,
                material_type: 'Dry manure: Corral solids',
                amount_hauled_method: 'Ya got me',
                reporting_method: 'dry-weight',
                moisture: '35.60',
                n_con_mg_kg: 24000,
                p_con_mg_kg: 10000,
                k_con_mg_kg: 48000,
                tfs: '0.0000',
                ec_umhos_cm: null,
                salt_lbs_rm: '1337.00',
                n_lbs_rm: '1337.00',
                p_lbs_rm: '1337.00',
                k_lbs_rm: '1337.00',
                kn_con_mg_l: null,
                nh4_con_mg_l: null,
                nh3_con_mg_l: null,
                no3_con_mg_l: null,
                p_con_mg_l: null,
                k_con_mg_l: null,
                tds: null,
                pnumber: '',
                dest_street: '24665 Swensen Ave.',
                dest_cross_street: '',
                dest_county: 'Merced',
                dest_city: 'Hilmar',
                dest_city_state: 'CA',
                dest_city_zip: '95324',
                dest_type: 'Farmer',
                recipient_title: 'Jeff Maciel',
                recipient_primary_phone: '(209) 614-0283',
                recipient_street: '24665 Swensen Ave.',
                recipient_cross_street: '',
                recipient_county: 'Merced',
                recipient_city: 'Hilmar',
                recipient_city_state: 'CA',
                recipient_city_zip: '95324',
                contact_first_name: 'Spencer',
                contact_primary_phone: '(209) 634-7520',
                operator_title: 'Spencer Nylund',
                operator_primary_phone: '(209) 634-7520',
                operator_secondary_phone: '',
                operator_street: 'P.O. Box 1029',
                operator_city: 'Hilmar',
                operator_city_state: 'CA',
                operator_city_zip: '95324',
                operator_is_owner: true,
                operator_is_responsible: true,
                hauler_title: 'Silva & Sons Manure Spreading',
                hauler_first_name: 'Frank',
                hauler_primary_phone: '(209) 678-2047',
                hauler_street: '23616 Williams AVE',
                hauler_cross_street: '',
                hauler_county: 'Merced',
                hauler_city: 'Hilmar',
                hauler_city_state: 'CA',
                hauler_city_zip: '95324'
            }],
            process: [{
                last_date_hauled: '2020-02-12T08:00:00.000Z',
                amount_hauled: 420000,
                material_type: 'Process wastewater',
                amount_hauled_method: 'Flow Meter',
                reporting_method: null,
                moisture: null,
                n_con_mg_kg: null,
                p_con_mg_kg: null,
                k_con_mg_kg: null,
                tfs: null,
                ec_umhos_cm: '8000.0000',
                salt_lbs_rm: null,
                n_lbs_rm: '1337.00',
                p_lbs_rm: '1337.00',
                k_lbs_rm: '1337.00',
                kn_con_mg_l: '484.0000',
                nh4_con_mg_l: null,
                nh3_con_mg_l: null,
                no3_con_mg_l: null,
                p_con_mg_l: '71.9000',
                k_con_mg_l: '997.0000',
                tds: '8800',
                pnumber: '045-200-024',
                dest_street: '21304 Williams Ave.',
                dest_cross_street: '',
                dest_county: 'Merced',
                dest_city: 'Hilmar',
                dest_city_state: 'CA',
                dest_city_zip: '95324',
                dest_type: 'Farmer',
                recipient_title: 'Johnson',
                recipient_primary_phone: '(209) 634-1485',
                recipient_street: '21304 Williams Ave.',
                recipient_cross_street: '',
                recipient_county: 'Merced',
                recipient_city: 'Hilmar',
                recipient_city_state: 'CA',
                recipient_city_zip: '95324',
                contact_first_name: 'Spencer',
                contact_primary_phone: '(209) 634-7520',
                operator_title: 'Spencer Nylund',
                operator_primary_phone: '(209) 634-7520',
                operator_secondary_phone: '',
                operator_street: 'P.O. Box 1029',
                operator_city: 'Hilmar',
                operator_city_state: 'CA',
                operator_city_zip: '95324',
                operator_is_owner: true,
                operator_is_responsible: true,
                hauler_title: 'Pipeline',
                hauler_first_name: 'Spencer',
                hauler_primary_phone: '(209) 632-7520',
                hauler_street: '20710 Geer RD',
                hauler_cross_street: '',
                hauler_county: 'Merced',
                hauler_city: 'Hilmar',
                hauler_city_state: 'CA',
                hauler_city_zip: '95324'
            },
            {
                last_date_hauled: '2020-01-25T08:00:00.000Z',
                amount_hauled: 420000,
                material_type: 'Process wastewater',
                amount_hauled_method: 'Flow Meter',
                reporting_method: null,
                moisture: null,
                n_con_mg_kg: null,
                p_con_mg_kg: null,
                k_con_mg_kg: null,
                tfs: null,
                ec_umhos_cm: '8000.0000',
                salt_lbs_rm: null,
                n_lbs_rm: '1337.00',
                p_lbs_rm: '1337.00',
                k_lbs_rm: '1337.00',
                kn_con_mg_l: '484.0000',
                nh4_con_mg_l: null,
                nh3_con_mg_l: null,
                no3_con_mg_l: null,
                p_con_mg_l: '71.9000',
                k_con_mg_l: '997.0000',
                tds: '8800',
                pnumber: '17-092-022',
                dest_street: '21189 W. American Ave.',
                dest_cross_street: '',
                dest_county: 'Merced',
                dest_city: 'Hilmar',
                dest_city_state: 'CA',
                dest_city_zip: '95324',
                dest_type: 'Farmer',
                recipient_title: 'Petterson',
                recipient_primary_phone: '(209) 667-5888',
                recipient_street: '21189 W. American Ave.',
                recipient_cross_street: '',
                recipient_county: 'Merced',
                recipient_city: 'Hilmar',
                recipient_city_state: 'CA',
                recipient_city_zip: '95324',
                contact_first_name: 'Spencer',
                contact_primary_phone: '(209) 634-7520',
                operator_title: 'Spencer Nylund',
                operator_primary_phone: '(209) 634-7520',
                operator_secondary_phone: '',
                operator_street: 'P.O. Box 1029',
                operator_city: 'Hilmar',
                operator_city_state: 'CA',
                operator_city_zip: '95324',
                operator_is_owner: true,
                operator_is_responsible: true,
                hauler_title: 'Pipeline',
                hauler_first_name: 'Spencer',
                hauler_primary_phone: '(209) 632-7520',
                hauler_street: '20710 Geer RD',
                hauler_cross_street: '',
                hauler_county: 'Merced',
                hauler_city: 'Hilmar',
                hauler_city_state: 'CA',
                hauler_city_zip: '95324'
            }],
            dryTotal: [89249.824, 32505.1872, 150105.56799999997, 0],
            processTotal: [
                3392.7432000000003,
                504.0046200000001,
                6988.770600000001,
                61686.240000000005
            ],
            total: [
                92642.56719999999,
                33009.19182,
                157094.33859999996,
                61686.240000000005
            ]
        }

        expect(availableNutrientsG).toEqual(expectedResult)
    })
})