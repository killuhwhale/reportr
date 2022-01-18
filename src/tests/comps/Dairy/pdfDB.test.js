import { jest } from '@jest/globals';
import { getNutrientBudgetInfo } from '../../../comps/Dairy/pdfDB'
describe('Test pdfDB', () => {

    beforeAll(async () => {
        //Spin up Express App and DB.
        // On DB startup create scripts will be executed
        // I need a way to upload the same data each time.
        // Currently relying on uploadXLSX

        // Express App would need to know where to connect to/ how to connect to DB.

    })

    test('Call getAnnualReportData and check each value for accuracy.', async () => {
        const dairy_id = 2
        console.log("Getting Annual Report")
        const budgetInfo = await getNutrientBudgetInfo(dairy_id)
        const soils = budgetInfo.nutrientBudgetB.totalAppsSummary.soils
        const plows = budgetInfo.nutrientBudgetB.totalAppsSummary.plows
        const fertilizers = budgetInfo.nutrientBudgetB.totalAppsSummary.fertilizers
        const manures = budgetInfo.nutrientBudgetB.totalAppsSummary.manures
        const wastewaters = budgetInfo.nutrientBudgetB.totalAppsSummary.wastewaters
        const freshwaters = budgetInfo.nutrientBudgetB.totalAppsSummary.freshwaters
        const anti_harvests = budgetInfo.nutrientBudgetB.totalAppsSummary.anti_harvests
        const actual_harvests = budgetInfo.nutrientBudgetB.totalAppsSummary.actual_harvests
        const freshwater_app = budgetInfo.nutrientBudgetB.totalAppsSummary.freshwater_app
        const wastewater_app = budgetInfo.nutrientBudgetB.totalAppsSummary.wastewater_app
        const total_app = budgetInfo.nutrientBudgetB.totalAppsSummary.total_app
        const nutrient_bal = budgetInfo.nutrientBudgetB.totalAppsSummary.nutrient_bal
        const nutrient_bal_ratio = budgetInfo.nutrientBudgetB.totalAppsSummary.nutrient_bal_ratio
        const atmospheric_depo = budgetInfo.nutrientBudgetB.totalAppsSummary.atmospheric_depo




        // GRAPH DATA (ESSENTIALLY)

        const allEvents = budgetInfo.nutrientBudgetB.allEvents
        const keys = [
            'Field 12019-11-01T07:00:00.000Z',
            'Field 12020-05-07T07:00:00.000Z',
            'Field 172020-06-01T07:00:00.000Z',
            'Field 22019-11-01T07:00:00.000Z',
            'Field 22020-05-07T07:00:00.000Z'
        ]
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
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            'manures': [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [438.29416551724137, 119.74015862068966, 492.5161241379311, 0],
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
                [0, 0, 0, 0],
                [160, 25.6, 132.8, 0],
                [240, 45, 198, 0],

            ],
            'actual_harvests': [
                [177.72727272727272, 49.40818181818182, 483.41818181818184, 4398.75],
                [343.46909090909094, 49.14090909090909, 470.71818181818185, 3436.1910000000003],
                [0, 0, 0, 0],
                [193.1470588235294, 30.08823529411765, 300.8823529411765, 2652.035294117647],
                [282.1176470588236, 53.83529411764706, 631.529411764706, 4878.72],
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
                [250.67020681818184, 5.5704012954545465, 117.65312045454547, 5686.701843136365],
                [452.29416551724137, 119.74015862068966, 492.5161241379311, 0],
                [262.19500882352946, 15.739651764705885, 336.47040000000004, 3112.6954557941176],
                [360.95072058823536, 8.091459264705883, 170.90069117647062, 9358.375639514707],
            ],
            'nutrient_bal': [
                [837.7385113329091, 455.7311654545454, 616.4766363636363, -1680.7041042045453],
                [-92.7988840909091, -43.570507795454546, -353.06506136363635, 2250.5108431363647],
                [452.29416551724137, 119.74015862068966, 492.5161241379311, 0],
                [69.04795000000007, -14.348583529411764, 35.58804705882352, 460.6601616764706],
                [78.83307352941176, -45.74383485294118, -460.62872058823535, 4479.655639514706],
            ],
            'nutrient_bal_ratio': [
                [5.713618222333504, 10.223799554729617, 2.275245035354295, 0.6179132471259914],
                [0.729818820536981, 0.11335568263805386, 0.2499438623766392, 1.6549434659296776],
                [452.29416551724137, 119.74015862068966, 492.5161241379311, 0],
                [1.3574890056342321, 0.5231164809384165, 1.1182789442815249, 1.1737006150326275],
                [1.279433329858215, 0.1503002704326923, 0.2706139856557377, 1.9182030613592718],
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
                    field_crop_app_id: 38,
                    field_id: 61,
                    fieldtitle: "Field 1",
                    k_lbs_acre: "250",
                    n_lbs_acre: "250",
                    p_lbs_acre: "250",
                    pk: 6,
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
                    field_id: 61,
                    fieldtitle: "Field 1",
                    import_date: "2020-05-09T07:00:00.000Z",
                    import_desc: "UN32",
                    k_con: "0.00",
                    material_type: "Dry manure: Separator solids",
                    method_of_reporting: "dry-weight",
                    moisture: "0.00",
                    n_con: "32.00",
                    p_con: "0.00",
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
                    ca_con: "0.00",
                    cl_con: "0.00",
                    croptitle: "Corn silage",
                    entry_type: "manure",
                    field_id: 62,
                    fieldtitle: "Field 17",
                    k_con: "2.18",
                    material_type: "Corral solids",
                    method_of_reporting: "dry-weight",
                    mg_con: "0.00",
                    moisture: "56.00",
                    n_con: "1.94",
                    na_con: "0.00",
                    p_con: "0.53",
                    plant_date: "2020-06-01T07:00:00.000Z",
                    precip_after: "No Precipitation",
                    precip_before: "No Precipitation",
                    precip_during: "No Precipitation",
                    s_con: "0.00",
                    sample_date: "2020-03-09T07:00:00.000Z",
                    sample_desc: "Manure Caetano",
                    src_desc: "Solid Manure",
                    src_of_analysis: "Lab Analysis",
                    tfs: "0.00",
                },
                {
                    acres_planted: "17.00",
                    amount_applied: 600000,
                    app_date: "2020-01-12T08:00:00.000Z",
                    app_desc: "Wastewater",
                    app_method: "Surface (irragation)",
                    croptitle: "Oats silage-soft dough",
                    dairy_id: 2,
                    ec: "6000",
                    entry_type: "wastewater",
                    field_crop_app_id: 23,
                    field_crop_app_process_wastewater_analysis_id: 7,
                    field_id: 59,
                    fieldtitle: "Field 2",
                    k_con: "714.00",
                    kn_con: "490.00",
                    material_type: "Process wastewater",
                    nh3_con: "0.00",
                    nh4_con: "0.00",
                    no3_con: "0.00",
                    p_con: "33.40",
                    ph: "0.00",
                    pk: 41,
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
                    field_id: 59,
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
            Object.keys(event_keys).forEach(ev_key => {

                console.log(ev_key)
                expect(event_keys[ev_key][appIdx]).toEqual(ev[ev_key])

            })
        })

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


    })
})