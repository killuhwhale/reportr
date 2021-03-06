const db = require('../db/index')
const { verifyToken, needsHacker, verifyUserFromCompanyByDairyID, verifyUserFromCompanyByCompanyID,
    verifyUserFromCompanyByDairyBaseID, needsRead, needsWrite, needsDelete, needsAdmin
} = require('../utils/middleware')


const isDuplicateYear = (entries, reportingYr) => {
    // Returns the object in the list with the highest pk 
    let isDup = false
    entries.forEach(entry => {
        if (entry.reporting_yr === reportingYr) {
            isDup = true
        }
    })
    return isDup
}

const latestEntry = (entries) => {
    // Returns the object in the list with the highest pk 
    let _max = 0
    let latest = {}
    entries.forEach(entry => {
        if (entry.pk > _max) {
            _max = entry.pk
            latest = entry
        }
    })
    return latest
}


const insertDairy = async (dairyBaseID, title, reportingYear, period_start, period_end) => {
    try {
        const dairy = await db.insertDairy(dairyBaseID, title, reportingYear, period_start, period_end)
        if (!dairy) return { error: 'Duplicate dairy' }
        if (dairy.error) return dairy.error
        return dairy[0] // rows[0]
    } catch (e) {
        return { error: e.toString() }
    }
}


const updateDairy = async (street, cross_street, county, city, city_state, city_zip, title, basin_plan, began, period_start, period_end, dairy_id) => {
    try {
        return await db.updateDairy(street, cross_street, county, city, city_state, city_zip, title, basin_plan, began, period_start, period_end, dairy_id)
    } catch (e) {
        return { error: e }
    }
}



const duplicateDairyFieldParcelOperatorHerd = async (latestDairy_ID, newDairy_ID) => {
    try {
        const [fields, parcels, operators, herds, fieldParcels] = await Promise.all([
            db.getFields(latestDairy_ID),
            db.getParcels(latestDairy_ID),
            db.getOperators(latestDairy_ID),
            db.getHerd(latestDairy_ID),
            db.getFieldParcel(latestDairy_ID),
        ])

        const new_fields = (await Promise.all(fields.map(async field => {
            const { title, acres, cropable } = field
            return db.insertField(title, acres, cropable, newDairy_ID)
        }))).map(item => item[0])  // Currently ea resolved promise is a list from result.rows in the DB.... So we get a list of resolved promises which are lists of single items...

        const new_parcels = (await Promise.all(parcels.map(async parcel => {
            const { pnumber } = parcel
            return db.insertParcel(pnumber, newDairy_ID)
        }))).map(item => item[0])

        const new_operators = await Promise.all(operators.map(async operator => {
            const {
                title,
                primary_phone,
                secondary_phone,
                street,
                city,
                city_state,
                city_zip,
                is_owner,
                is_operator,
                is_responsible } = operator
            return db.insertOperator(
                newDairy_ID,
                title,
                primary_phone,
                secondary_phone,
                street,
                city,
                city_state,
                city_zip,
                is_owner,
                is_operator,
                is_responsible)
        }))

        const new_herd = await Promise.all(herds.map(async herd => {
            const { milk_cows,
                dry_cows,
                bred_cows,
                cows,
                calf_young,
                calf_old,
                p_breed,
                p_breed_other
            } = herd

            console.log("TODO() need to update herds too")
            try {
                await db.insertHerd(newDairy_ID)
                return db.updateHerd(milk_cows,
                    dry_cows,
                    bred_cows,
                    cows,
                    calf_young,
                    calf_old,
                    p_breed,
                    p_breed_other,
                    newDairy_ID)
            } catch (e) {
                console.log("Failed to insert/update herds on create")
            }
        }))


        const findFieldAndParcelID = (field_parcel, new_fields, new_parcels) => {
            const { title, pnumber } = field_parcel
            let field_id = null
            let parcel_id = null

            // Find the field with title and return its pk
            new_fields.forEach(field => {
                if (field.title === title) {
                    field_id = field.pk
                }
            })
            // Find the parcel with pnumber and return its pk
            new_parcels.forEach(parcel => {
                if (parcel.pnumber === pnumber) {
                    parcel_id = parcel.pk
                }
            })
            return { field_id, parcel_id }
        }

        const new_field_parcels = await Promise.all(fieldParcels.map(async field_parcel => {
            const { field_id, parcel_id } = findFieldAndParcelID(field_parcel, new_fields, new_parcels)
            return db.insertFieldParcel(newDairy_ID, field_id, parcel_id)
        }))

        return { success: true }
    } catch (e) {
        console.log(e)
        return { error: 'Failed to duplicateDairyFieldParcelOperatorHerd', err: e }
    }

}

const getDairiesByDairyBaseID = (dairyBaseID) => {
    return new Promise((resolve, reject) => {
        db.getDairiesByDairyBaseID(dairyBaseID, (err, result) => {
            if (!err) {
                if (result && result.rows) {
                    return resolve(result.rows)
                }
            }
            reject({ "error": "Get all dairies by base id unsuccessful", err })
        })
    })
}

module.exports = (app) => {

    app.post("/api/tsv/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {

        const { dairy_id, title, data, tsvType } = req.body
        db.insertTSV([dairy_id, title, data, tsvType], (err, result) => {
            if (!err) {
                return res.json({ data: "Inserted TSV successfully" });
            }
            console.log(err)
            res.json({ error: "Inserted TSV unsuccessful", existsErr: err.code === '23505' });
        })
    });
    app.get("/api/tsv/:dairy_id/:tsvType", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getTSVs(req.params.dairy_id, req.params.tsvType))
        } catch (e) {
            return res.json({ error: "Get all TSVs unsuccessful", err: e })
        }

    });
    app.post("/api/tsv/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting TSV w/ pk: ", req.body.pk)
        db.rmTSV(req.body.pk, (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted TSV successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted TSV unsuccessful" });
        })
    });
    app.post("/api/tsv/type/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting TSV w/ dairy_id and tsvtype: ", req.body)
        db.rmTSVByDairyIDTSVType([req.body.dairy_id, req.body.tsvType], (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted TSV successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted TSV unsuccessful" });
        })
    });
    app.post("/api/tsv/update", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Updating.... tsv", req.body)
        const { title, data, tsvType, dairy_id } = req.body
        db.updateTSV([title, data, tsvType, dairy_id], (err, result) => {
            if (!err) {
                return res.json({ data: "Updated tsv successfully" });
            }
            console.log(err)
            res.json({ error: "Updated tsv unsuccessful" });
        })
    });



    // API
    app.get("/api/dairy_base/:company_id", verifyToken, verifyUserFromCompanyByCompanyID, needsRead, (req, res) => {
        const { company_id } = req.params

        db.getDairyBase(company_id,
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                res.json({ error: "Get dairy_base unsuccessful", err: err });
            })
    });
    app.post("/api/dairy_base/create", verifyToken, verifyUserFromCompanyByCompanyID, needsWrite, async (req, res) => {
        const {
            title,
            company_id
        } = req.body

        try {
            return res.json(await db.insertDairyBase([company_id, title]))
        } catch (e) {
            return res.json({ error: "Inserted dairy_base unsuccessful", code: e.code })
        }

        // Once dairy base is created, we need to create the _base parcel and operators
    });
    app.post("/api/dairy_base/update", verifyToken, verifyUserFromCompanyByDairyBaseID, needsWrite, (req, res) => {
        console.log("Updating.... dairy_base", req.body)
        // req.body.data is a list of values in order to match DB Table
        const {
            title, pk
        } = req.body

        db.updateDairyBase([
            title, pk
        ], (err, result) => {

            if (!err) {
                return res.json(result);
            }
            console.log(err)
            res.json({ "error": "Updated dairy_base unsuccessful" });
        })
    });
    app.post("/api/dairy_base/delete", verifyToken, verifyUserFromCompanyByDairyBaseID, needsDelete, async (req, res) => {
        try {
            return res.json(await db.rmDairyBase(req.body.dairyBaseID))
        } catch (e) {
            return res.json({ error: "Deleted dairy_base unsuccessful", err: e })
        }
    });






    app.get("/api/dairies/dairyBaseID/:dairyBaseID", verifyToken, verifyUserFromCompanyByDairyBaseID, needsRead, async (req, res) => {
        try {
            return res.json(await getDairiesByDairyBaseID(req.params.dairyBaseID))
        } catch (e) {
            return res.json({ "error": "Get all dairies by base id unsuccessful" });
        }
    });
    app.get("/api/dairy/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        const dairy = await db.getDairy(req.params.dairy_id)
        if (dairy.error) return res.json({ error: 'Get dairy unsuccessful' })
        return res.json(dairy)
    });
    app.post("/api/dairies/create", verifyToken, verifyUserFromCompanyByDairyBaseID, needsWrite, async (req, res) => {
        console.log("Inserting dairy: ", req.body)
        const {
            dairyBaseID, title, reportingYear, period_start, period_end
        } = req.body
        // This needs to encompass creating the correct Fields, parcels, field_parcel, operators, herds
        // Steps:
        /**
         * On create dairy, user sends reportingYear and DairyBaseID
         * 1. Lookup latest dairy by dairyBaseID
         * 2. Check if it is duplicate year - return w/ error if duplicate
         * 3. If no latest dairy, createDairy
         * 4. Else, createFullDairy
         * 5. Use createDairy to create a basic dairy
         * 6. Using latestDairy's pk, Look up Fields, parcels, operators, herds AND create them for new dairy
         * 7. Once they're created for the new dairy, create field_parcel using the newly created fields and parcels.
         * 
         */

        try {
            // * 1. Lookup latest dairy by dairyBaseID
            // Now lookup the _base for dairy, parcels, and operators to populate the new dairy.

            const dairies = await getDairiesByDairyBaseID(dairyBaseID)
            if (dairies && dairies.length === 0) {
                console.log("Creating new reporting year dairy")
                return res.json(await insertDairy(dairyBaseID, title, reportingYear, period_start, period_end))

            }
            const latestDairy = latestEntry(dairies)

            // * 2. Check if it is duplicate year - return w/ error if duplicate
            if (isDuplicateYear(dairies, reportingYear)) return res.json({ error: `Duplicate year. ${reportingYear} already exists.` })

            // * 3.
            console.log("Creating Full Dairy....")
            const newDairy = await insertDairy(dairyBaseID, title, reportingYear, period_start, period_end)
            console.log("New Dairy...", newDairy)
            if (newDairy.error) return res.json(newDairy.error)

            const {
                street, cross_street, county, city, city_state, title: latestTitle, city_zip,
                basin_plan, began, period_start: latestPeriodStart, period_end: latestPeriodEnd
            } = latestDairy

            const updated = await updateDairy(street, cross_street, county, city, city_state, city_zip, latestTitle, basin_plan, began, latestPeriodStart, latestPeriodEnd, newDairy.pk)
            if (updated.error) return res.json({ error: updated.error })

            await duplicateDairyFieldParcelOperatorHerd(latestDairy.pk, newDairy.pk)
            return res.json(newDairy)

        } catch (e) {
            console.log('Error creating dairy: ', e)
            return res.json({ error: 'Error', err: e.toString() })
        }



    });
    // Deprecated
    app.post("/api/dairies/full/create", verifyToken, verifyUserFromCompanyByDairyBaseID, needsWrite, (req, res) => {
        const {
            dairyBaseID, reporting_yr, street, cross_street, county, city, city_state, title, city_zip,
            basin_plan, began, period_start, period_end,

        } = req.body
        console.log("Inserting full dairy info:", req.body)
        db.insertFullDairy([
            dairyBaseID, reporting_yr, street, cross_street, county, city, city_state, city_zip,
            title, basin_plan, began, period_start, period_end,
        ], (err, result) => {

            if (!err) {
                return res.json(result.rows);
            }
            console.log(err)
            res.json({ "error": "Inserted full dairy unsuccessful", failData: req.body });
        })
    });
    app.post("/api/dairies/update", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, async (req, res) => {
        try {
            const {
                street, cross_street, county, city, city_state, title, city_zip, basin_plan, began, period_start, period_end, dairy_id
            } = req.body

            const updated = await updateDairy(street, cross_street, county, city, city_state, city_zip, title, basin_plan, began, period_start, period_end, dairy_id)

            if (updated.error) return res.json({ error: updated.error })
            return res.json(updated)
        } catch (e) {
            return res.json({ error: e })
        }
    });
    app.post("/api/dairies/delete", verifyToken, verifyUserFromCompanyByDairyID, needsAdmin, (req, res) => {
        db.rmDairy(req.body.dairy_id, (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted dairy successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted dairy unsuccessful" });
        })
    });

    app.get("/api/fields/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFields(req.params.dairy_id))
        } catch (e) {
            return res.json({ error: "Get all fields unsuccessful", err: e })
        }
    });
    app.post("/api/fields/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, async (req, res) => {
        const { title, acres, cropable, dairy_id } = req.body

        try {
            return res.json(await db.insertField(title, acres, cropable, dairy_id))
        } catch (e) {
            return res.json({ error: e })
        }
    });
    app.post("/api/fields/update", verifyToken, needsWrite, verifyUserFromCompanyByDairyID, (req, res) => {
        const { title, acres, cropable, pk } = req.body
        db.updateField([title, acres, cropable, pk], (err, result) => {
            if (!err) {
                return res.json({ data: "Updated field successfully" });
            }
            console.log(err)
            res.json({ error: "Updated field unsuccessful" });
        })
    });
    app.post("/api/fields/delete", verifyToken, needsDelete, verifyUserFromCompanyByDairyID, (req, res) => {
        console.log("Deleting....", req.body)
        db.rmField(req.body.pk, (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted field successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field unsuccessful" });
        })
    });

    app.get("/api/parcels/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getParcels(req.params.dairy_id))
        } catch (e) {
            return res.json({ error: "Get all parcels unsuccessful", err: e })
        }
    });
    app.post("/api/parcels/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, async (req, res) => {
        try {
            // // TODO() Transaction.. Make sure both insert are valid...
            // const dairyBaseRes = await db.getDairyBaseIDByDairyID(dairy_id)
            // if (dairyBaseRes.error) return res.json({ error: dairyBaseRes })
            // const dairyBaseID = dairyBaseRes[0]

            // const parcelBaseRes = await db.insertParcelBase(req.body.pnumber, dairyBaseID)
            // if (parcelBaseRes.error) return res.json({ error: parcelBaseRes })
            return res.json(await db.insertParcel(req.body.pnumber, req.body.dairy_id))
        } catch (e) {
            return res.json({ error: "Inserted parcel unsuccessful", err: e });
        }

    });
    app.post("/api/parcels/update", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Updating....", req.body.data)
        const { pnumber, pk } = req.body.data
        db.updateParcel([pnumber, pk], (err, result) => {
            if (!err) {
                return res.json({ data: "Updated parcel successfully" });
            }
            console.log(err)
            res.json({ error: "Updated parcel unsuccessful" });
        })
    });
    app.post("/api/parcels/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmParcel(req.body.pk, (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted parcel successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted parcel unsuccessful" });
        })
    });

    app.get("/api/field_parcel/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, async (req, res) => {
        try {
            return res.json(await db.getFieldParcel(req.params.dairy_id))
        } catch (e) {
            return res.json({ error: "Get all FieldParcel unsuccessful", err: e })
        }
    });
    app.post("/api/field_parcel/create", verifyToken, verifyUserFromCompanyByDairyID, async (req, res) => {
        const { dairy_id, field_id, parcel_id } = req.body
        try {
            return res.json(await db.insertFieldParcel(dairy_id, field_id, parcel_id))
        } catch (e) {
            return res.json({ error: "Created field_parcel unsuccessful", err: e })
        }
    });
    app.post("/api/field_parcel/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        const { pk } = req.body
        db.rmFieldParcel(pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted field_parcel successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_parcel unsuccessful" });
        })
    });

    app.post("/api/operators/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, async (req, res) => {
        console.log("Creating operator....", req.body)
        const { dairy_id, title, primary_phone, secondary_phone, street, city,
            city_state, city_zip, is_owner, is_operator, is_responsible } = req.body
        try {
            return res.json(await db.insertOperator(dairy_id, title, primary_phone, secondary_phone, street, city,
                city_state, city_zip, is_owner, is_operator, is_responsible))
        } catch (e) {
            return res.json({ error: "Created operator unsuccessful", err: e })
        }
    });
    app.get("/api/operators/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getOperators(req.params.dairy_id))
        } catch (e) {
            return res.json({ error: "Get all operators unsuccessful", err: e })
        }
    });
    app.get("/api/operators/is_owner/:is_owner/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, (req, res) => {


        db.getOperatorsByOwnerStatus([req.params.is_owner, req.params.dairy_id],
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                res.json({ error: "Get all operators by owner status unsuccessful" });
            })
    });

    // deprecated
    app.get("/api/operators/is_operator/:is_operator/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, (req, res) => {

        db.getOperatorsByOperatorStatus([req.params.is_operator, req.params.dairy_id],
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                res.json({ error: "Get all operators by operator status unsuccessful" });
            })
    });
    app.post("/api/operators/update", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Updating....", req.body)
        const {
            dairy_id,
            title,
            primary_phone,
            secondary_phone,
            street,
            city,
            city_state,
            city_zip,
            is_owner,
            is_operator,
            is_responsible,
            pk
        } = req.body
        db.updateOperator([
            title,
            primary_phone,
            secondary_phone,
            street,
            city,
            city_state,
            city_zip,
            is_owner,
            is_operator,
            is_responsible,
            pk
        ], (err, result) => {

            if (!err) {
                return res.json({ data: "Updated operator successfully" });
            }
            console.log(err)
            res.json({ error: "Updated operator unsuccessful" });
        })
    });
    app.post("/api/operators/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmOperator(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted operator successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted operator unsuccessful" });
        })
    });

    app.post("/api/herds/create", verifyToken, verifyUserFromCompanyByDairyID, async (req, res) => {
        const { dairy_id } = req.body
        try {
            return res.json(await db.insertHerd(dairy_id))
        } catch (e) {
            return res.json({ error: "Created herd unsuccessful", err: e })
        }
    });
    app.post("/api/herds/full/create", verifyToken, verifyUserFromCompanyByDairyID, (req, res) => {
        console.log("Creating.... full (copy) herds", req.body)
        const { dairy_id,
            milk_cows,
            dry_cows,
            bred_cows,
            cows,
            calf_young,
            calf_old,
            p_breed,
            p_breed_other } = req.body
        db.insertFullHerd(
            [
                dairy_id,
                milk_cows,
                dry_cows,
                bred_cows,
                cows,
                calf_young,
                calf_old,
                p_breed,
                p_breed_other
            ],
            (err, result) => {

                if (!err) {
                    return res.json({ data: "Created full herds successfully" });
                }
                console.log(err)
                res.json({ error: "Created full herds unsuccessful" });
            }
        )
    });
    app.get("/api/herds/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, async (req, res) => {
        try {
            return res.json(await db.getHerd(req.params.dairy_id))
        } catch (e) {
            return res.json({ error: "Get all herds unsuccessful", err: e })
        }
    });
    app.post("/api/herds/update", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, async (req, res) => {
        console.log("Updating....", req.body)
        const { milk_cows, dry_cows, bred_cows, cows, calf_young, calf_old, p_breed, p_breed_other, dairy_id } = req.body
        try {
            return res.json(await db.updateHerd(
                milk_cows,
                dry_cows,
                bred_cows,
                cows,
                calf_young,
                calf_old,
                p_breed,
                p_breed_other,
                dairy_id))
        } catch (e) {
            return res.json({ error: "Update herd unsuccessful", err: e })
        }
    });

    app.get("/api/crops/:title", verifyToken, async (req, res) => {
        console.log("Getting crop by Title", req.body.title)
        try {
            return res.json(await db.getCropsByTitle(req.params.title))
        } catch (e) {
            res.json({ error: "Get crops by Title unsuccessful" });
        }
    });
    app.get("/api/crops", verifyToken, (req, res) => {
        db.getCrops("",
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                res.json({ error: "Get all crops unsuccessful" });
            })
    });


    app.post("/api/field_crop/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating....", req.body)
        const { dairy_id, field_id, crop_id, plant_date, acres_planted, typical_yield, moisture, n, p, k, salt } = req.body
        db.insertFieldCrop(
            [
                dairy_id, field_id, crop_id, plant_date, acres_planted, typical_yield, moisture, n, p, k, salt
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created field_crop unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFieldCrop(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all field_crop unsuccessful" });
        }

    });
    app.post("/api/field_crop/update", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Updating field_crop....", req.body)
        const { plant_date, acres_planted, typical_yield, moisture, n, p, k, salt, pk } = req.body
        db.updateFieldCrop([
            plant_date, parseInt(acres_planted), parseInt(typical_yield), moisture, n, p, k, salt, pk
        ], (err, result) => {

            if (!err) {
                return res.json({ data: "Updated field_crop successfully" });
            }
            console.log(err)
            res.json({ error: "Updated field_crop unsuccessful" });
        })
    });
    app.post("/api/field_crop/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting field_crop....", req.body.pk)
        db.rmFieldCrop(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted field_crop successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_crop unsuccessful" });
        })
    });
    app.post("/api/field_crop/deleteAll", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting all field_crop....", req.body)
        db.rmAllFieldCrop(req.body.dairy_id, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted all field_crop successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted all field_crop unsuccessful" });
        })
    });

    app.post("/api/field_crop_harvest/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating field_crop_harvest....", req.body)
        const {
            dairy_id,
            field_crop_id,
            sample_date,
            harvest_date,
            expected_yield_tons_acre,
            method_of_reporting,
            actual_yield,
            src_of_analysis,
            moisture,
            n,
            p,
            k,
            tfs,
            n_dl,
            p_dl,
            k_dl,
            tfs_dl
        } = req.body
        db.insertFieldCropHarvest(
            [
                dairy_id,
                field_crop_id,
                sample_date,
                harvest_date,
                expected_yield_tons_acre,
                method_of_reporting,
                actual_yield,
                src_of_analysis,
                moisture,
                n,
                p,
                k,
                tfs,
                n_dl,
                p_dl,
                k_dl,
                tfs_dl
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result)
                }
                console.log(err)
                res.json({ error: "Created field_crop_harvest unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop_harvest/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFieldCropHarvest(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all field_crop_harvest unsuccessful" });
        }
    });
    app.post("/api/field_crop_harvest/update", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Updating field_crop_harvest....", req.body)
        const {
            harvest_date, density, basis, actual_yield, moisture, n, p, k, tfs, pk
        } = req.body
        db.updateFieldCropHarvest([
            harvest_date, actual_yield, basis, density, moisture, n, p, k, tfs, pk
        ], (err, result) => {

            if (!err) {
                return res.json({ data: "Updated field_crop_harvest successfully" });

            }
            console.log(err)
            res.json({ error: "Updated field_crop_harvest unsuccessful" });
        })
    });
    app.post("/api/field_crop_harvest/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting field_crop_harvest....", req.body.pk)
        db.rmFieldCropHarvest(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted field_crop_harvest successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_crop_harvest unsuccessful" });
        })
    });
    app.post("/api/field_crop_harvest/deleteAll", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting all field_crop_harvest....", req.body)
        db.rmAllFieldCropHarvest(req.body.dairy_id, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted all field_crop_harvest successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted all field_crop_harvest unsuccessful" });
        })
    });

    app.post("/api/field_crop_app/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating....", req.body)
        const { dairy_id, field_crop_id, app_date, app_method, precip_before, precip_during, precip_after } = req.body
        db.insertFieldCropApplication(
            [
                dairy_id, field_crop_id, app_date, app_method, precip_before, precip_during, precip_after
            ],
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created field_crop_app unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop_app/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, (req, res) => {
        db.getFieldCropApplication(req.params.dairy_id,
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Get all field_crop_app unsuccessful" });
            })
    });
    app.post("/api/field_crop_app/update", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Updating....", req.body)
        const {
            app_date, app_method, precip_before, precip_during, precip_after, pk
        } = req.body
        db.updateFieldCropApplication([
            app_date, app_method, precip_before, precip_during, precip_after, pk
        ], (err, result) => {

            if (!err) {
                return res.json({ data: "Updated field_crop_app successfully" });
            }
            console.log(err)
            res.json({ error: "Updated field_crop_app unsuccessful" });
        })
    });
    app.post("/api/field_crop_app/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmFieldCropApplication(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted field_crop_app successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_crop_app unsuccessful" });
        })
    });
    app.post("/api/field_crop_app/deleteAll", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting all field_crop_app....", req.body)
        db.rmAllFieldCropApp(req.body.dairy_id, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted all field_crop_app successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted all field_crop_app unsuccessful" });
        })
    });


    app.post("/api/field_crop_app_process_wastewater_analysis/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating....", req.body)
        const {
            dairy_id,
            sample_date,
            sample_desc,
            sample_data_src,
            material_type,
            kn_con,
            nh4_con,
            nh3_con,
            no3_con,
            p_con,
            k_con,
            ca_con,
            mg_con,
            na_con,
            hco3_con,
            co3_con,
            so4_con,
            cl_con,
            ec,
            tds,
            kn_dl,
            nh4_dl,
            nh3_dl,
            no3_dl,
            p_dl,
            k_dl,
            ca_dl,
            mg_dl,
            na_dl,
            hco3_dl,
            co3_dl,
            so4_dl,
            cl_dl,
            ec_dl,
            tds_dl,
            ph,
        } = req.body
        db.insertFieldCropApplicationProcessWastewaterAnalysis(
            [
                dairy_id,
                sample_date,
                sample_desc,
                sample_data_src,
                material_type,
                kn_con,
                nh4_con,
                nh3_con,
                no3_con,
                p_con,
                k_con,
                ca_con,
                mg_con,
                na_con,
                hco3_con,
                co3_con,
                so4_con,
                cl_con,
                ec,
                tds,
                kn_dl,
                nh4_dl,
                nh3_dl,
                no3_dl,
                p_dl,
                k_dl,
                ca_dl,
                mg_dl,
                na_dl,
                hco3_dl,
                co3_dl,
                so4_dl,
                cl_dl,
                ec_dl,
                tds_dl,
                ph,
            ].map(el => el === null ? 0 : el),
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created field_crop_app_process_wastewater_analysis unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop_app_process_wastewater_analysis/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFieldCropApplicationProcessWastewaterAnalysis(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all field_crop_app_process_wastewater_analysis unsuccessful" });
        }

    });
    app.post("/api/field_crop_app_process_wastewater_analysis/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmFieldCropApplicationProcessWastewaterAnalysis(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted field_crop_app_process_wastewater_analysis successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_crop_app_process_wastewater_analysis unsuccessful" });
        })
    });


    app.post("/api/field_crop_app_process_wastewater/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating....", req.body)
        const {
            dairy_id,
            field_crop_app_id,
            field_crop_app_process_wastewater_analysis_id,
            app_desc,
            amount_applied
        } = req.body
        db.insertFieldCropApplicationProcessWastewater(
            [
                dairy_id,
                field_crop_app_id,
                field_crop_app_process_wastewater_analysis_id,
                app_desc,
                amount_applied
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created field_crop_app_process_wastewater unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop_app_process_wastewater/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFieldCropApplicationProcessWastewater(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all field_crop_app_process_wastewater unsuccessful" });
        }
    });

    app.post("/api/field_crop_app_process_wastewater/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmFieldCropApplicationProcessWastewater(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted field_crop_app_process_wastewater successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_crop_app_process_wastewater unsuccessful" });
        })
    });

    app.post("/api/field_crop_app_process_wastewater/deleteAll", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting all field_crop_app_process_wastewater....", req.body)

        db.rmAllFieldCropAppProcessWastewaterAnalysis(req.body.dairy_id, (errA, resultA) => {
            db.rmAllFieldCropAppProcessWastewater(req.body.dairy_id, (errB, resultB) => {

                if (!errA && !errB) {
                    return res.json({ data: "Deleted all field_crop_app_process_wastewater successfully" });
                }
                console.log(errA, errB)
                res.json({ error: "Deleted all field_crop_app_process_wastewater unsuccessful" });
            })
        })
    });


    app.post("/api/field_crop_app_freshwater_source/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        const {
            dairy_id,
            src_desc,
            src_type,
        } = req.body
        db.insertFieldCropApplicationFreshwaterSource(
            [
                dairy_id,
                src_desc,
                src_type
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created field_crop_app_freshwater_source unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop_app_freshwater_source/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFieldCropApplicationFreshwaterSource(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all field_crop_app_freshwater_source unsuccessful" });
        }

    });
    app.post("/api/field_crop_app_freshwater_source/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmFieldCropApplicationFreshwaterSource(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted field_crop_app_freshwater_source successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_crop_app_freshwater_source unsuccessful" });
        })
    });

    app.post("/api/field_crop_app_freshwater_analysis/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        const {
            dairy_id,
            fresh_water_source_id,
            sample_date,
            sample_desc,
            src_of_analysis,
            n_con,
            nh4_con,
            no2_con,
            ca_con,
            mg_con,
            na_con,
            hco3_con,
            co3_con,
            so4_con,
            cl_con,
            ec,
            tds,
            n_dl,
            nh4_dl,
            no2_dl,
            ca_dl,
            mg_dl,
            na_dl,
            hco3_dl,
            co3_dl,
            so4_dl,
            cl_dl,
            ec_dl,
            tds_dl
        } = req.body
        db.insertFieldCropApplicationFreshwaterAnalysis(
            [
                dairy_id,
                fresh_water_source_id,
                sample_date,
                sample_desc,
                src_of_analysis,
                n_con,
                nh4_con,
                no2_con,
                ca_con,
                mg_con,
                na_con,
                hco3_con,
                co3_con,
                so4_con,
                cl_con,
                ec,
                tds,
                n_dl,
                nh4_dl,
                no2_dl,
                ca_dl,
                mg_dl,
                na_dl,
                hco3_dl,
                co3_dl,
                so4_dl,
                cl_dl,
                ec_dl,
                tds_dl
            ].map(el => el === null ? 0 : el),
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created field_crop_app_freshwater_analysis unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop_app_freshwater_analysis/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFieldCropApplicationFreshwaterAnalysis(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all field_crop_app_freshwater_analysis unsuccessful" });
        }
    });
    app.post("/api/field_crop_app_freshwater_analysis/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmFieldCropApplicationFreshwaterAnalysis(req.body.pk, (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted field_crop_app_freshwater_analysis successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_crop_app_freshwater_analysis unsuccessful" });
        })
    });

    app.post("/api/field_crop_app_freshwater/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log('Creating freshwater', req.body)

        const {
            dairy_id,
            field_crop_app_id,
            field_crop_app_freshwater_analysis_id,
            app_rate,
            run_time,
            amount_applied,
            amt_applied_per_acre
        } = req.body
        db.insertFieldCropApplicationFreshwater(
            [
                dairy_id,
                field_crop_app_id,
                field_crop_app_freshwater_analysis_id,
                app_rate,
                run_time,
                amount_applied,
                amt_applied_per_acre
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created field_crop_app_freshwater unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop_app_freshwater/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFieldCropApplicationFreshwater(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all field_crop_app_freshwater unsuccessful" });
        }
    });
    app.post("/api/field_crop_app_freshwater/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmFieldCropApplicationFreshwater(req.body.pk, (err, result) => {

            if (!err && result.rowCount > 0) {
                return res.json({ data: "Deleted field_crop_app_freshwater successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_crop_app_freshwater unsuccessful" });
        })
    });

    app.post("/api/field_crop_app_freshwater/deleteAll", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting all field_crop_app_freshwater....", req.body)

        db.rmAllFieldCropAppFreshwaterSource(req.body.dairy_id, (errA, resultA) => {
            db.rmAllFieldCropAppFreshwaterAnalysis(req.body.dairy_id, (errB, resultB) => {
                db.rmAllFieldCropAppFreshwater(req.body.dairy_id, (errC, resultC) => {

                    if (!errA && !errB && !errC) {
                        return res.json({ data: "Deleted all field_crop_app_freshwater successfully" });
                    }
                    console.log(errA, errB, errC)
                    res.json({ error: "Deleted all field_crop_app_freshwater unsuccessful" });
                })
            })
        })
    });


    app.post("/api/field_crop_app_solidmanure_analysis/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {

        const {
            dairy_id,
            sample_desc,
            sample_date,
            material_type,
            src_of_analysis,
            moisture,
            method_of_reporting,
            n_con,
            p_con,
            k_con,
            ca_con,
            mg_con,
            na_con,
            s_con,
            cl_con,
            tfs,
            n_dl,
            p_dl,
            k_dl,
            ca_dl,
            mg_dl,
            na_dl,
            s_dl,
            cl_dl,
            tfs_dl,
        } = req.body
        db.insertFieldCropApplicationSolidmanureAnalysis(
            [
                dairy_id,
                sample_desc,
                sample_date,
                material_type,
                src_of_analysis,
                moisture,
                method_of_reporting,
                n_con,
                p_con,
                k_con,
                ca_con,
                mg_con,
                na_con,
                s_con,
                cl_con,
                tfs,
                n_dl,
                p_dl,
                k_dl,
                ca_dl,
                mg_dl,
                na_dl,
                s_dl,
                cl_dl,
                tfs_dl,
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created field_crop_app_solidmanure_analysis unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop_app_solidmanure_analysis/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFieldCropApplicationSolidmanureAnalysis(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all field_crop_app_solidmanure_analysis unsuccessful" });
        }
    });
    app.post("/api/field_crop_app_solidmanure_analysis/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmFieldCropApplicationSolidmanureAnalysis(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted field_crop_app_solidmanure_analysis successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_crop_app_solidmanure_analysis unsuccessful" });
        })
    });


    app.post("/api/field_crop_app_solidmanure/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {

        const {
            dairy_id,
            field_crop_app_id,
            field_crop_app_solidmanure_analysis_id,
            src_desc,
            amount_applied,
            amt_applied_per_acre
        } = req.body
        db.insertFieldCropApplicationSolidmanure(
            [
                dairy_id,
                field_crop_app_id,
                field_crop_app_solidmanure_analysis_id,
                src_desc,
                amount_applied,
                amt_applied_per_acre
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created field_crop_app_solidmanure unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop_app_solidmanure/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFieldCropApplicationSolidmanure(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all field_crop_app_solidmanure unsuccessful" });
        }
    });
    app.post("/api/field_crop_app_solidmanure/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmFieldCropApplicationSolidmanure(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted field_crop_app_solidmanure successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_crop_app_solidmanure unsuccessful" });
        })
    });
    app.post("/api/field_crop_app_solidmanure/deleteAll", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        db.rmAllFieldCropAppSolidmanureAnalysis(req.body.dairy_id, (errA, resultA) => {
            db.rmAllFieldCropAppSolidmanure(req.body.dairy_id, (errB, resultB) => {

                if (!errA && !errB) {
                    return res.json({ data: "Deleted all field_crop_app_solidmanure successfully" });
                }
                console.log(errA, errB)
                res.json({ error: "Deleted all field_crop_app_solidmanure unsuccessful" });
            })
        })
    });

    app.post("/api/nutrient_import/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        const {
            dairy_id,
            import_desc,
            import_date,
            material_type,
            amount_imported,
            method_of_reporting,
            moisture,
            n_con,
            p_con,
            k_con,
            salt_con
        } = req.body
        db.insertNutrientImport(
            [
                dairy_id,
                import_desc,
                import_date,
                material_type,
                amount_imported,
                method_of_reporting,
                moisture,
                n_con,
                p_con,
                k_con,
                salt_con
            ],
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created nutrient_import unsuccessful" });
            }
        )
    });
    app.get("/api/nutrient_import/material_type/:material_type/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getNutrientImportByMaterialType(req.params.material_type, req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all nutrient_import by material_type unsuccessful" });
        }
    });

    app.get("/api/nutrient_import/wastewater/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getNutrientImportByWastewater(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all nutrient_import by wastewater unsuccessful" });
        }

    });
    app.post("/api/nutrient_import/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        db.rmNutrientImport(req.body.pk, (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted nutrient_import successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted nutrient_import unsuccessful" });
        })
    });
    app.get("/api/nutrient_import/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, (req, res) => {

        db.getNutrientImport(req.params.dairy_id,
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Get all nutrient_import unsuccessful" });
            })
    });
    // Remember, a nutrient import is the analysis for a field crop fertilizer.... aka field crop nutrient import 
    app.post("/api/field_crop_app_fertilizer/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        const {
            dairy_id,
            field_crop_app_id,
            nutrient_import_id,
            amount_applied
        } = req.body

        db.insertFieldCropApplicationFertilizer(
            [
                dairy_id,
                field_crop_app_id,
                nutrient_import_id,
                amount_applied
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created field_crop_app_fertilizer unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop_app_fertilizer/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFieldCropApplicationFertilizer(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all field_crop_app_fertilizer unsuccessful" });
        }

    });
    app.post("/api/field_crop_app_fertilizer/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        db.rmFieldCropApplicationFertilizer(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted field_crop_app_fertilizer successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_crop_app_fertilizer unsuccessful" });
        })
    });

    app.post("/api/field_crop_app_fertilizer/deleteAll", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        db.rmAllNutrientImport(req.body.dairy_id, (errA, resultA) => {
            db.rmAllFieldCropAppFertilizer(req.body.dairy_id, (errB, resultB) => {

                if (!errA && !errB) {
                    return res.json({ data: "Deleted all field_crop_app_fertilizer successfully" });
                }
                console.log(errA, errB)
                res.json({ error: "Deleted all field_crop_app_fertilizer unsuccessful" });
            })
        })
    });

    app.post("/api/field_crop_app_soil_analysis/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        const {
            dairy_id,
            field_id,
            sample_desc,
            sample_date,
            src_of_analysis,
            n_con,
            total_p_con,
            p_con,
            k_con,
            ec,
            org_matter,
            n_dl,
            total_p_dl,
            p_dl,
            k_dl,
            ec_dl,
            org_matter_dl
        } = req.body
        db.insertFieldCropApplicationSoilAnalysis(
            [
                dairy_id,
                field_id,
                sample_desc,
                sample_date,
                src_of_analysis,
                n_con,
                total_p_con,
                p_con,
                k_con,
                ec,
                org_matter,
                n_dl,
                total_p_dl,
                p_dl,
                k_dl,
                ec_dl,
                org_matter_dl
            ],
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created field_crop_app_soil_analysis unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop_app_soil_analysis/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFieldCropApplicationSoilAnalysis(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all field_crop_app_soil_analysis unsuccessful" });
        }
    });
    app.post("/api/field_crop_app_soil_analysis/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmFieldCropApplicationSoilAnalysis(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted field_crop_app_soil_analysis successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_crop_app_soil_analysis unsuccessful" });
        })
    });

    app.post("/api/field_crop_app_soil/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating.... soil", req.body)
        const {
            dairy_id,
            field_crop_app_id,
            src_desc,
            analysis_one,
            analysis_two,
            analysis_three
        } = req.body
        db.insertFieldCropApplicationSoil(
            [
                dairy_id,
                field_crop_app_id,
                src_desc,
                analysis_one,
                analysis_two,
                analysis_three
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created field_crop_app_soil unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop_app_soil/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFieldCropApplicationSoil(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all field_crop_app_soil unsuccessful" });
        }
    });
    app.post("/api/field_crop_app_soil/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmFieldCropApplicationSoil(req.body.pk, (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted field_crop_app_soil successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted field_crop_app_soil unsuccessful" });
        })
    });
    app.post("/api/field_crop_app_soil/deleteAll", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting all field_crop_app_soil....", req.body)
        db.rmAllFieldCropAppSoilAnalysis(req.body.dairy_id, (errA, resultA) => {
            db.rmAllFieldCropAppSoil(req.body.dairy_id, (errB, resultB) => {
                if (!errA && !errB) {
                    return res.json({ data: "Deleted all field_crop_app_soil successfully" });
                }
                console.log(errA, errB)
                res.json({ error: "Deleted all field_crop_app_soil unsuccessful" });
            })
        })
    });

    app.post("/api/field_crop_app_plowdown_credit/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating.... plowdown credit", req.body)
        const {
            dairy_id,
            field_crop_app_id,
            src_desc,
            n_lbs_acre,
            p_lbs_acre,
            k_lbs_acre,
            salt_lbs_acre
        } = req.body
        db.insertFieldCropApplicationPlowdownCredit(
            [
                dairy_id,
                field_crop_app_id,
                src_desc,
                n_lbs_acre,
                p_lbs_acre,
                k_lbs_acre,
                salt_lbs_acre
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created field_crop_app_plowdown_credit unsuccessful" });
            }
        )
    });
    app.get("/api/field_crop_app_plowdown_credit/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getFieldCropApplicationPlowdownCredit(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all field_crop_app_plowdown_credit unsuccessful" });
        }
    });
    app.post("/api/field_crop_app_plowdown_credit/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmFieldCropApplicationPlowdownCredit(req.body.pk, (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted field_crop_app_plowdown_credit successfully" });

            }
            console.log(err)
            res.json({ error: "Deleted field_crop_app_plowdown_credit unsuccessful" });
        })
    });
    app.post("/api/field_crop_app_plowdown_credit/deleteAll", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting all field_crop_app_plowdown_credit....", req.body)

        db.rmAllFieldCropAppPlowdownCredit(req.body.dairy_id, (errA, resultA) => {
            if (!errA) {
                return res.json({ data: "Deleted all field_crop_app_plowdown_credit successfully" });
            }
            console.log(errA)
            res.json({ error: "Deleted all field_crop_app_plowdown_credit unsuccessful" });
        })
    });

    app.post("/api/drain_source/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        const {
            dairy_id,
            src_desc,
        } = req.body
        db.insertDrainSource(
            [
                dairy_id,
                src_desc,
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created drain_source unsuccessful" });
            }
        )
    });
    app.get("/api/drain_source/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getDrainSource(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all drain_source unsuccessful" });
        }

    });
    app.post("/api/drain_source/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmDrainSource(req.body.pk, (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted drain_source successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted drain_source unsuccessful" });
        })
    });

    app.post("/api/drain_analysis/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating.... drain source", req.body)
        const {
            dairy_id,
            drain_source_id,
            sample_date,
            sample_desc,
            src_of_analysis,
            nh4_con,
            no2_con,
            p_con,
            ec,
            tds,
            nh4_dl,
            no2_dl,
            p_dl,
            ec_dl,
            tds_dl
        } = req.body
        db.insertDrainAnalysis(
            [
                dairy_id,
                drain_source_id,
                sample_date,
                sample_desc,
                src_of_analysis,
                nh4_con,
                no2_con,
                p_con,
                ec,
                tds,
                nh4_dl,
                no2_dl,
                p_dl,
                ec_dl,
                tds_dl
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created drain_analysis unsuccessful" });
            }
        )
    });
    app.get("/api/drain_analysis/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getDrainAnalysis(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all drain_analysis unsuccessful" });
        }
    });
    app.post("/api/drain_analysis/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmDrainAnalysis(req.body.pk, (err, result) => {
            if (!err) {
                res.json({ data: "Deleted drain_analysis successfully" });
                return;
            }
            console.log(err)
            res.json({ error: "Deleted drain_analysis unsuccessful" });
        })
    });


    app.post("/api/export_hauler/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating.... export_hauler", req.body)
        const {
            dairy_id,
            title,
            first_name,

            primary_phone,
            street,
            cross_street,
            county,
            city,
            city_state,
            city_zip
        } = req.body
        db.insertExportHauler(
            [
                dairy_id,
                title,
                first_name,

                primary_phone,
                street,
                cross_street,
                county,
                city,
                city_state,
                city_zip
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created export_hauler unsuccessful" });
            }
        )
    });
    app.get("/api/export_hauler/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, (req, res) => {

        db.getExportHauler(req.params.dairy_id,
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Get all export_hauler unsuccessful" });
            })
    });
    app.post("/api/export_hauler/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmExportHauler(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ "error": "Deleted export_hauler successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted export_hauler unsuccessful" });
        })
    });

    app.post("/api/export_contact/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating.... export_contact", req.body)
        const {
            dairy_id,
            first_name,

            primary_phone
        } = req.body
        db.insertExportContact(
            [
                dairy_id,
                first_name,

                primary_phone
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created export_contact unsuccessful" });
            }
        )
    });
    app.get("/api/export_contact/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, (req, res) => {

        db.getExportContact(req.params.dairy_id,
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Get all export_contact unsuccessful" });
            })
    });
    app.post("/api/export_contact/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmExportContact(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted export_contact successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted export_contact unsuccessful" });
        })
    });


    app.post("/api/export_recipient/create", verifyToken, verifyUserFromCompanyByDairyID, (needsWrite, req, res) => {
        console.log("Creating.... export recipient", req.body)
        const {
            dairy_id,
            dest_type,
            title,
            primary_phone,
            street,
            cross_street,
            county,
            city,
            city_state,
            city_zip
        } = req.body
        db.insertExportRecipient(
            [
                dairy_id,
                dest_type,
                title,
                primary_phone,
                street,
                cross_street,
                county,
                city,
                city_state,
                city_zip
            ],
            (err, result) => {

                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created export_recipient unsuccessful" });
            }
        )
    });
    app.get("/api/export_recipient/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, (req, res) => {

        db.getExportRecipient(req.params.dairy_id,
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Get all export_recipient unsuccessful" });
            })
    });
    app.post("/api/export_recipient/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmExportRecipient(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ "error": "Deleted export_recipient successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted export_recipient unsuccessful" });
        })
    });


    app.post("/api/export_dest/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating.... export_dest", req.body)
        const {
            dairy_id,
            export_recipient_id,
            pnumber,
            street,
            cross_street,
            county,
            city,
            city_state,
            city_zip
        } = req.body
        db.insertExportDest(
            [
                dairy_id,
                export_recipient_id,
                pnumber,
                street,
                cross_street,
                county,
                city,
                city_state,
                city_zip
            ],
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created export_dest unsuccessful" });
            }
        )
    });
    app.get("/api/export_dest/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, (req, res) => {
        console.log("Getting export_dest:", req.params.dairy_id)
        db.getExportDest(req.params.dairy_id,
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Get all export_dest unsuccessful" });
            })
    });
    app.post("/api/export_dest/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmExportDest(req.body.pk, (err, result) => {

            if (!err) {
                return res.json({ data: "Deleted export_dest successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted export_dest unsuccessful" });
        })
    });


    app.post("/api/export_manifest/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating.... export_manifest", req.body)
        const {
            dairy_id,
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


            n_con_mg_l,
            kn_con_mg_l,
            nh4_con_mg_l,
            nh3_con_mg_l,
            no3_con_mg_l,
            p_con_mg_l,
            k_con_mg_l,
            ec_umhos_cm,
            tds,
        } = req.body
        db.insertExportManifest(
            [
                dairy_id,
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

                n_con_mg_l,
                nh4_con_mg_l,
                nh3_con_mg_l,
                no3_con_mg_l,
                p_con_mg_l,
                k_con_mg_l,
                ec_umhos_cm,
                tds,
            ],
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created export_manifest unsuccessful" });
            }
        )
    });
    app.get("/api/export_manifest/wastewater/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getExportManifestByWastewater(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all export_manifest wastewater unsuccessful" });
        }
    });
    app.get("/api/export_manifest/material_type/:material_type/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getExportManifestByMaterialType(req.params.material_type, req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all export_manifest unsuccessful" });
        }

    });
    app.get("/api/export_manifest/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, (req, res) => {

        db.getExportManifest(req.params.dairy_id,
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log("Export manifest", err)
                res.json({ error: "Get all export_manifest unsuccessful" });
            })
    });
    app.post("/api/export_manifest/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting....", req.body.pk)
        db.rmExportManifest(req.body.pk, (err, result) => {
            console.log(result)
            if (!err) {
                return res.json({ data: "Deleted export_manifest successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted export_manifest unsuccessful" });
        })
    });
    app.post("/api/export_manifest/deleteAll", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, async (req, res) => {
        console.log("Deleting all export_manifest....", req.body)
        try {
            const dbRes = await db.rmAllExports(req.body.dairy_id)
            console.log("Export deletes: ", dbRes)
            const failedExports = dbRes.filter(obj => obj.error)
            if (failedExports.length > 0) return res.json({ error: "Deleted all export_manifest unsuccessful" });

            return res.json({ data: "Deleted all export_manifest successfully" });
        } catch (e) {
            console.log(e)
            res.json({ error: "Deleted all export_manifest unsuccessful" });
        }
    });


    app.post("/api/discharge/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating.... discharge", req.body)
        const {
            dairy_id,
            discharge_type,
            discharge_datetime,
            discharge_loc,
            vol,
            vol_unit,
            duration_of_discharge,
            discharge_src,
            method_of_measuring,
            sample_location_reason,
            ref_number
        } = req.body
        db.insertDischarge(
            [
                dairy_id,
                discharge_type,
                discharge_datetime,
                discharge_loc,
                vol,
                vol_unit,
                duration_of_discharge,
                discharge_src,
                method_of_measuring,
                sample_location_reason,
                ref_number
            ],
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created discharge unsuccessful" });
            }
        )
    });
    app.get("/api/discharge/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getDischarge(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all discharge unsuccessful" });
        }
    });
    app.post("/api/discharge/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting.... discharge", req.body.pk)
        db.rmDischarge(req.body.pk, (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted discharge successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted discharge unsuccessful" });
        })
    });


    app.post("/api/agreement/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating.... agreement", req.body)
        const {
            dairy_id,
            nmp_updated,
            nmp_developed,
            nmp_approved,
            new_agreements
        } = req.body
        db.insertAgreement(
            [
                dairy_id,
                nmp_updated,
                nmp_developed,
                nmp_approved,
                new_agreements
            ],
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created agreement unsuccessful" });
            }
        )
    });
    app.get("/api/agreement/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getAgreement(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all agreement unsuccessful" });
        }
    });
    app.post("/api/agreement/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting.... agreement", req.body.pk)
        db.rmAgreement(req.body.pk, (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted agreement successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted agreement unsuccessful" });
        })
    });
    app.post("/api/agreement/update", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Updating.... agreement", req.body)
        const {
            nmp_updated,
            nmp_developed,
            nmp_approved,
            new_agreements, pk
        } = req.body
        db.updateAgreement([
            nmp_updated,
            nmp_developed,
            nmp_approved,
            new_agreements, pk
        ], (err, result) => {

            if (!err) {
                return res.json({ data: "Updated agreement successfully" });
            }
            console.log(err)
            res.json({ error: "Updated agreement unsuccessful" });
        })
    });


    app.post("/api/note/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating.... note", req.body)
        const {
            dairy_id,
            note
        } = req.body
        db.insertNote(
            [
                dairy_id,
                note
            ],
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created note unsuccessful" });
            }
        )
    });
    app.get("/api/note/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getNote(req.params.dairy_id))
        } catch (e) {
            res.json({ "error": "Get all note unsuccessful" });
        }
    });
    app.post("/api/note/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting.... note", req.body.pk)
        db.rmNote(req.body.pk, (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted note successfully" })
            }
            console.log(err)
            res.json({ error: "Deleted note unsuccessful" });
        })
    });
    app.post("/api/note/update", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Updating.... note", req.body)
        const {
            note, pk
        } = req.body
        db.updateNote([
            note, pk
        ], (err, result) => {

            if (!err) {
                return res.json({ data: "Updated note successfully" });
            }
            console.log(err)
            res.json({ error: "Updated note unsuccessful" });
        })
    });

    app.post("/api/certification/create", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Creating.... certification", req.body)
        const {
            dairy_id,
            owner_id,
            operator_id,
            responsible_id
        } = req.body
        db.insertCertification(
            [
                dairy_id,
                owner_id,
                operator_id,
                responsible_id
            ],
            (err, result) => {
                if (!err) {
                    return res.json(result.rows)
                }
                console.log(err)
                res.json({ error: "Created certification unsuccessful" });
            }
        )
    });
    app.get("/api/certification/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.getCertification(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Get all certification unsuccessful" });
        }
    });
    app.post("/api/certification/delete", verifyToken, verifyUserFromCompanyByDairyID, needsDelete, (req, res) => {
        console.log("Deleting.... certification", req.body.pk)
        db.rmCertification(req.body.pk, (err, result) => {
            if (!err) {
                return res.json({ data: "Deleted certification successfully" });
            }
            console.log(err)
            res.json({ error: "Deleted certification unsuccessful" });
        })
    });
    app.post("/api/certification/update", verifyToken, verifyUserFromCompanyByDairyID, needsWrite, (req, res) => {
        console.log("Updating.... certification", req.body)
        const {
            owner_id,
            operator_id,
            responsible_id, dairy_id
        } = req.body
        db.updateCertification([
            owner_id,
            operator_id,
            responsible_id, dairy_id
        ], (err, result) => {

            if (!err) {
                return res.json({ data: "Updated certification successfully" });
            }
            console.log(err)
            res.json({ error: "Updated certification unsuccessful" });
        })
    });

    app.get("/api/search/certification/:no_val/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.searchCertification(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Search all certifications unsuccessful" });
        }
    });

    app.get("/api/search/note/:no_val/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.searchNote(req.params.dairy_id))
        } catch (e) {
            res.json({ error: "Search all notes unsuccessful" });
        }
    });

    app.get("/api/search/agreement/:no_val/:dairy_id", verifyToken, verifyUserFromCompanyByDairyID, needsRead, async (req, res) => {
        try {
            return res.json(await db.searchAgreement(req.params.dairy_id))
        } catch (e) {
            console.log('Search all agreements unsuccessful', e)
            res.json({ error: "Search all agreements unsuccessful", err: e });
        }
    });

}