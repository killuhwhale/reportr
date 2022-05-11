const db = require('../db/settings/settings')
const {
    HARVEST_TEMPLATE_NAME, PROCESS_WASTEWATER_TEMPLATE_NAME, FRESHWATER_TEMPLATE_NAME,
    SOLIDMANURE_TEMPLATE_NAME, FERTILIZER_TEMPLATE_NAME, SOIL_TEMPLATE_NAME,
    PLOWDOWN_CREDIT_TEMPLATE_NAME, DRAIN_TEMPLATE_NAME, DISCHARGE_TEMPLATE_NAME,
    MANURE_TEMPLATE_NAME, WASTEWATER_TEMPLATE_NAME
} = require('../db/settings/settings')

const logger = require('../logs/logging')
const { verifyToken, verifyUserFromCompanyByDairyID } = require('../utils/middleware')

const api = 'settings'


const lazyGetTemplate = async (dairy_id) => {
    try {
        const result = await db.getSettingTemplate(dairy_id)
        console.log("Lazy result ", result.length === 0)

        if (result.length === 0) {
            return await db.createSettingTemplate(dairy_id)
        }
        return result


    } catch (e) {
        console.log('Lazy get error: ', e)
        return { error: e }
    }
}

module.exports = (app) => {
    app.post(`/${api}/create`, verifyToken, verifyUserFromCompanyByDairyID, async (req, res) => {
        try {
            return res.json(await db.createSettingTemplate(req.body.dairy_id))
        } catch (e) {
            return res.json({ error: e })
        }
    })

    app.get(`/${api}/lazy/:dairy_id`, verifyToken, verifyUserFromCompanyByDairyID, async (req, res) => {
        return res.json(await lazyGetTemplate(req.params.dairy_id))
    })

    app.get(`/${api}/:dairy_id`, verifyToken, verifyUserFromCompanyByDairyID, async (req, res) => {
        try {
            return res.json(await db.getSettings(req.params.dairy_id))
        } catch (e) {
            return { error: e }
        }
    })

    app.post(`/${api}/update/:template`, verifyToken, verifyUserFromCompanyByDairyID, async (req, res) => {
        console.log("Updating", req.params.template, req.body.data)

        console.log("Trying to match: ", [HARVEST_TEMPLATE_NAME, PROCESS_WASTEWATER_TEMPLATE_NAME, FRESHWATER_TEMPLATE_NAME,
            SOLIDMANURE_TEMPLATE_NAME, FERTILIZER_TEMPLATE_NAME, SOIL_TEMPLATE_NAME,
            PLOWDOWN_CREDIT_TEMPLATE_NAME, DRAIN_TEMPLATE_NAME, DISCHARGE_TEMPLATE_NAME,
            MANURE_TEMPLATE_NAME, WASTEWATER_TEMPLATE_NAME])

        try {
            switch (req.params.template) {
                case HARVEST_TEMPLATE_NAME:
                    return res.json(await db.updateSettingTemplateHarvest(req.body.data, req.body.dairy_id))
                    break
                case PROCESS_WASTEWATER_TEMPLATE_NAME:
                    return res.json(await db.updateSettingTemplateWastewater(req.body.data, req.body.dairy_id))
                    break
                case FRESHWATER_TEMPLATE_NAME:
                    return res.json(await db.updateSettingTemplateFreshwater(req.body.data, req.body.dairy_id))
                    break
                case SOLIDMANURE_TEMPLATE_NAME:
                    return res.json(await db.updateSettingTemplateSolidmanure(req.body.data, req.body.dairy_id))
                    break
                case FERTILIZER_TEMPLATE_NAME:
                    return res.json(await db.updateSettingTemplateFertilizer(req.body.data, req.body.dairy_id))
                    break
                case MANURE_TEMPLATE_NAME:
                    return res.json(await db.updateSettingTemplateSolidExport(req.body.data, req.body.dairy_id))
                    break
                case WASTEWATER_TEMPLATE_NAME:
                    return res.json(await db.updateSettingTemplateWastewaterExport(req.body.data, req.body.dairy_id))
                    break
                case SOIL_TEMPLATE_NAME:
                    return res.json(await db.updateSettingTemplateSoil(req.body.data, req.body.dairy_id))
                    break
                case PLOWDOWN_CREDIT_TEMPLATE_NAME:
                    return res.json(await db.updateSettingTemplatePlow(req.body.data, req.body.dairy_id))
                    break
                case DRAIN_TEMPLATE_NAME:
                    return res.json(await db.updateSettingTemplateTile(req.body.data, req.body.dairy_id))
                    break
                case DISCHARGE_TEMPLATE_NAME:
                    return res.json(await db.updateSettingTemplateDischarge(req.body.data, req.body.dairy_id))
                    break
                default:
                    return res.json({ error: 'Break default son' })
                    break
            }

        } catch (e) {
            console.log(e)
            return res.json({ error: e.toString() })
        }
    })

    app.post(`/${api}/delete`, verifyToken, verifyUserFromCompanyByDairyID, async (req, res) => {
        try {
            return res.json(await db.createSettingTemplate(req.body.dairy_id))
        } catch (e) {
            return res.json({ error: e })
        }
    })

}

console.log("Exporting lazyGetTemplate from settings: ", lazyGetTemplate)
module.exports.lazyGetTemplate = lazyGetTemplate