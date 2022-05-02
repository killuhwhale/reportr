const db = require('../db/index')
const logger = require('../logs/logging')

const searchField = (value, dairy_id) => {
    return new Promise((resolve, rej) => {
        db.searchFieldsByTitle([value[0], dairy_id],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    rej(err)
                }
            })
    })
}

const insertField = (data, dairy_id) => {
    const { title, cropable, acres } = data
    return new Promise(async (resolve, rej) => {
        // Returns rows or null if duplicate error
        try {
            const res = await db.insertField(title, acres, cropable, dairy_id)
            if (!res) return resolve(null)
            return resolve(res[0])
        } catch (e) {
            console.log(e)
            return rej(e)
        }
    })
}

const searchFieldCrop = (value) => {
    return new Promise((resolve, rej) => {
        const { fieldPK, cropPK, plant_date } = value
        db.searchFieldCropsByFieldCropPlantdate([fieldPK, cropPK, plant_date],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    rej(err)
                }
            }
        )
    })
}


const insertFieldCrop = (data, dairy_id) => {
    return new Promise((resolve, rej) => {
        const { field_id, crop_id, plant_date, acres_planted, typical_yield, moisture, n, p, k, salt } = data
        db.insertFieldCrop(
            [
                dairy_id, field_id, crop_id, plant_date, acres_planted, typical_yield, moisture, n, p, k, salt
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0]) {
                        resolve(result.rows[0])
                    } else {
                        rej({ error: "Error getting data after Field Crop insert" })
                    }

                } else if (err.code === '23505') {
                    resolve(null)
                } else {
                    console.log(err)
                    rej({ "error": "Created field_crop unsuccessful" });
                }
            }
        )
    })
}


const searchFieldCropApp = (value, dairy_id) => {
    return new Promise((resolve, rej) => {
        const { fieldCropID, app_date, app_method } = value
        db.searchFieldCropApplicationsByFieldCropIDAppDate(
            [fieldCropID, app_date, app_method, dairy_id],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    rej({ error: "Error searching field crop app: " })
                }
            }
        )
    })
}

const insertFieldCropApp = (data, dairy_id) => {
    return new Promise((resolve, rej) => {
        const { field_crop_id, app_date, app_method, precip_before, precip_during, precip_after } = data
        db.insertFieldCropApplication(
            [
                dairy_id, field_crop_id, app_date, app_method, precip_before, precip_during, precip_after
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        rej({ error: "Error inserting field crop app, no info returned from DB." })
                    }
                } else if (err.code === "23505") {
                    // Duplicate entry, resolve null to search again
                    resolve(null)
                } else {
                    rej({ error: "Error creating field crop app: " })
                }
            }
        )
    })
}

const searchWasterWaterAnalysis = (value, dairy_id) => {

    return new Promise((resolve, rej) => {
        const { sample_date, sample_desc } = value
        db.searchFieldCropAppProcessWastewaterAnalysisBySampleDateSampleDesc([sample_date, sample_desc, dairy_id],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    rej({ error: "Search all searchFieldCropAppProcessWastewaterAnalysisBySampleDateSampleDesc unsuccessful" })
                }
            }
        )
    })
}
const insertWasterWaterAnalysis = (data, dairy_id) => {
    return new Promise((resolve, rej) => {
        const {
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
        } = data

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
            ],
            (err, result) => {

                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        rej({ error: "Insert field_crop_app_process_wastewater_analysis rows empty" });
                    }
                } else if (err.code === '23505') {
                    // Duplicate entry, resolve null to search again
                    resolve(null)
                } else if (err.code === '1000') {
                    // Duplicate entry, resolve null to search again
                    rej({ error: err.msg })
                } else {
                    logger.info(err)
                    rej({ error: "Created field_crop_app_process_wastewater_analysis unsuccessful" });
                }
            }
        )
    })
}
const searchFreshwaterSource = (value, dairy_id) => {
    const { src_desc, src_type } = value
    return new Promise((resolve, rej) => {
        db.searchFieldCropAppFreshwaterSource(
            [
                src_desc,
                src_type,
                dairy_id,
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    rej({ "error": "Search all searchFieldCropAppFreshwaterSource unsuccessful" });
                }
            })
    })
}

const insertFreshwaterSource = (data, dairy_id) => {
    const {
        src_desc,
        src_type,
    } = data
    return new Promise((resolve, rej) => {
        db.insertFieldCropApplicationFreshwaterSource(
            [
                dairy_id,
                src_desc,
                src_type
            ],
            (err, result) => {

                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    }
                } else if (err.code === '23505') {
                    resolve(null)
                } else {
                    logger.info(err)
                    rej({ "error": "Created field_crop_app_freshwater_source unsuccessful" });

                }
            }
        )
    })
}

const searchFreshwaterAnalysis = (value, dairy_id) => {
    const {
        sample_date, sample_desc, src_of_analysis, fresh_water_source_id
    } = value
    return new Promise((resolve, rej) => {
        db.searchFieldCropAppFreshwaterAnalysis(
            [
                sample_date,
                sample_desc,
                src_of_analysis,
                fresh_water_source_id,
                dairy_id,
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    rej({ "error": "Search all searchFieldCropAppFreshwaterAnalysis unsuccessful" });
                }
            })
    })
}

const insertFreshwaterAnalysis = (data, dairy_id) => {

    return new Promise((resolve, rej) => {
        const {
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
        } = data
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
            ],
            (err, result) => {

                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        rej({ "error": "Insert field_crop_app_freshwater_analysis unsuccessful" });
                    }
                } else if (err.code === '23505') {
                    resolve(null)
                } else if (err.code === '1000') {
                    rej({ error: err.msg })
                } else {
                    logger.info("FWA: err", err)
                    rej({ "error": "Create field_crop_app_freshwater_analysis unsuccessful" });
                }
            }
        )
    })
}

const searchManureAnalysis = (value, dairy_id) => {
    const { sample_date, sample_desc, src_of_analysis
    } = value
    return new Promise((resolve, rej) => {
        db.searchFieldCropAppSolidmanureAnalysis(
            [
                sample_date,
                sample_desc,
                src_of_analysis,
                dairy_id,
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    res.json({ "error": "Search all searchFieldCropAppSolidmanureAnalysis unsuccessful" });
                }
            })
    })
}

const insertManureAnalysis = (data, dairy_id) => {

    return new Promise((resolve, rej) => {
        const {
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
        } = data
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
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        rej({ "error": "Insert field_crop_app_solidmanure_analysis unsuccessful" });
                    }
                } else if (err.code === '23505') {
                    resolve(null)
                } else if (err.code === '1000') {
                    rej({ error: err.msg })
                } else {
                    logger.info(err)
                    rej({ "error": "Created field_crop_app_solidmanure_analysis unsuccessful" });

                }
            }
        )
    })
}


const searchNutrientImportAnalysis = (value, dairy_id) => {
    const { import_date, material_type, import_desc,
    } = value
    return new Promise((resolve, rej) => {
        db.searchNutrientImport(
            [
                import_date,
                material_type,
                import_desc,
                dairy_id,
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    rej({ "error": "Search all nutrient_import unsuccessful" });
                }
            })
    })
}

const insertNutrientImportAnalysis = (data, dairy_id) => {
    return new Promise((resolve, rej) => {
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
        } = data
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
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        rej({ "error": "Created nutrient_import unsuccessful" });
                    }
                } else if (err.code === '23505') {
                    resolve(null)
                } else if (err.code === '1000') {
                    rej({ error: err.msg })
                }
                else {
                    logger.info(err)
                    rej({ "error": "Created nutrient_import unsuccessful" });
                }
            }
        )
    })
}


const searchSoilAnalysis = (value, dairy_id) => {
    const { fieldID, sample_date, sample_desc,
    } = value
    return new Promise((resolve, rej) => {
        db.searchFieldCropApplicationSoilAnalysis(
            [
                fieldID,
                sample_date,
                sample_desc,
                dairy_id,
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    rej({ "error": "Search soil_analysis unsuccessful" });
                }
            })
    })
}

const insertSoilAnalysis = (data, dairy_id) => {
    return new Promise((resolve, rej) => {
        const {
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
        } = data
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
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        rej({ "error": "insert soil_import unsuccessful" });
                    }
                } else if (err.code === '23505') {
                    resolve(null)
                } else if (err.code === '1000') {
                    rej({ error: err.msg })
                } else {
                    logger.info(err)
                    rej({ "error": "Created soil_import unsuccessful" });
                }
            }
        )
    })
}

const searchOperator = (value, dairy_id) => {
    const { op_title, op_primary_phone,
    } = value
    return new Promise((resolve, rej) => {
        db.searchOperators([op_title, op_primary_phone, dairy_id],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    rej({ "error": "Search operators unsuccessful" });
                }
            })
    })
}

const insertOperator = (data, dairy_id) => {
    return new Promise(async (resolve, rej) => {
        const { title, primary_phone, secondary_phone, street, city,
            city_state, city_zip, is_owner, is_operator, is_responsible
        } = data

        // Returns rows or null if duplicate error
        try {
            const res = await db.insertOperator(dairy_id, title, primary_phone, secondary_phone, street, city,
                city_state, city_zip, is_owner, is_operator, is_responsible)
            if (!res) return resolve(null)
            return resolve(res[0])
        } catch (e) {
            console.log(e)
            logger.info(e)
            return rej(e)
        }
    })
}

const searchContact = (value, dairy_id) => {
    const { contact_first_name, contact_primary_phone,
    } = value
    return new Promise((resolve, rej) => {
        db.searchExportContact(
            [
                contact_first_name,
                contact_primary_phone,
                dairy_id,
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    rej({ "error": "Search export_contact unsuccessful" });
                }
            })
    })
}

const insertContact = (data, dairy_id) => {
    return new Promise((resolve, rej) => {
        const {
            dairy_id,
            first_name,
            primary_phone
        } = data
        db.insertExportContact(
            [
                dairy_id,
                first_name,
                primary_phone
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        rej({ "error": "insert contact unsuccessful" });
                    }
                } else if (err.code === '23505') {
                    resolve(null)
                } else {
                    logger.info(err)
                    rej({ "error": "Created contact unsuccessful" });
                }
            }
        )
    })
}

const searchHauler = (value, dairy_id) => {
    const {
        hauler_title, hauler_first_name, hauler_primary_phone, hauler_street, hauler_city_zip
    } = value
    return new Promise((resolve, rej) => {
        db.searchExportHauler(
            [
                hauler_title,
                hauler_first_name,
                hauler_primary_phone,
                hauler_street,
                hauler_city_zip,
                dairy_id,
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    rej({ "error": "Search export_hauler unsuccessful" });
                }
            })
    })
}
const insertHauler = (data, dairy_id) => {
    return new Promise((resolve, rej) => {
        const {
            title,
            first_name,
            primary_phone,
            street,
            cross_street,
            county,
            city,
            city_state,
            city_zip
        } = data
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
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        rej({ "error": "insert hauler unsuccessful" });
                    }
                } else if (err.code === '23505') {
                    resolve(null)
                } else {
                    logger.info(err)
                    rej({ "error": "Created hauler unsuccessful" });
                }
            }
        )
    })
}

const searchRecipient = (value, dairy_id) => {
    const { recipient_title, recipient_primary_phone, recipient_street, recipient_city_zip,
    } = value
    return new Promise((resolve, rej) => {
        db.searchExportRecipient(
            [
                recipient_title,
                recipient_street,
                recipient_city_zip,
                recipient_primary_phone,
                dairy_id,
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    rej({ "error": "Search export_recipient unsuccessful" });
                }
            })
    })
}
const insertRecipient = (data, dairy_id) => {
    return new Promise((resolve, rej) => {
        const {
            dest_type,
            title,
            primary_phone,
            street,
            cross_street,
            county,
            city,
            city_state,
            city_zip
        } = data
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
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        rej({ "error": "insert recipient unsuccessful" });
                    }
                } else if (err.code === '23505') {
                    resolve(null)
                } else {
                    logger.info(err)
                    rej({ "error": "Created recipient unsuccessful" });
                }
            }
        )
    })
}

const searchDest = (value, dairy_id) => {
    const { export_recipient_id, pnumber, dest_street, dest_city_zip,
    } = value
    return new Promise((resolve, rej) => {
        db.searchExportDest(
            [
                export_recipient_id,
                pnumber === "*" ? "" : pnumber,
                dest_street,
                dest_city_zip,
                dairy_id,
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    rej({ "error": "Search export_dest unsuccessful" });
                }
            })
    })
}
const insertDest = (data, dairy_id) => {
    return new Promise((resolve, rej) => {
        const {
            export_recipient_id,
            pnumber,
            street,
            cross_street,
            county,
            city,
            city_state,
            city_zip
        } = data
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
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        rej({ "error": "insert dest unsuccessful" });
                    }
                } else if (err.code === '23505') {
                    resolve(null)
                } else {
                    logger.info(err)
                    rej({ "error": "Created dest unsuccessful" });
                }
            }
        )
    })
}


const searchDrainSrc = (value, dairy_id) => {
    const { src_desc
    } = value
    return new Promise((resolve, rej) => {
        db.searchDrainSource(
            [
                src_desc,
                dairy_id,
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        resolve(null)
                    }
                } else {
                    logger.info(err)
                    rej({ "error": "Search drain_src unsuccessful" });
                }
            })
    })
}
const insertDrainSrc = (data, dairy_id) => {
    return new Promise((resolve, rej) => {
        const {
            src_desc,
        } = data
        db.insertDrainSource(
            [
                dairy_id,
                src_desc,
            ],
            (err, result) => {
                if (!err) {
                    if (result.rows[0] ?? false) {
                        resolve(result.rows[0])
                    } else {
                        rej({ "error": "insert drain_src unsuccessful" });
                    }
                } else if (err.code === '23505') {
                    resolve(null)
                } else {
                    logger.info(err)
                    rej({ "error": "Created drain_src unsuccessful" });
                }
            }
        )
    })
}



exports.lazyGet = (endpoint, value, data, dairy_id) => {
    return new Promise(async (resolve, rej) => {
        try {
            switch (endpoint) {
                case 'fields':
                    const fResult = await searchField(value, dairy_id) ??
                        await insertField(data, dairy_id) ??
                        await searchField(value, dairy_id)
                    if (!fResult.error) {
                        resolve(fResult)
                    } else {
                        rej(fResult)
                    }

                    break
                case 'field_crop':
                    const fcResult = await searchFieldCrop(value, dairy_id) ??
                        await insertFieldCrop(data, dairy_id) ??
                        await searchFieldCrop(value, dairy_id)
                    if (!fcResult.error) {
                        resolve(fcResult)
                    } else {
                        rej(fcResult)
                    }
                    break

                case 'field_crop_app':
                    const fcaResult = await searchFieldCropApp(value, dairy_id) ??
                        await insertFieldCropApp(data, dairy_id) ??
                        await searchFieldCropApp(value, dairy_id)
                    if (!fcaResult.error) {
                        resolve(fcaResult)
                    } else {
                        rej(fcaResult)
                    }
                    break
                case 'field_crop_app_process_wastewater_analysis':
                    const waResult = await searchWasterWaterAnalysis(value, dairy_id) ??
                        await insertWasterWaterAnalysis(data, dairy_id) ??
                        await searchWasterWaterAnalysis(value, dairy_id)
                    if (!waResult.error) {
                        resolve(waResult)
                    } else {
                        rej(waResult)
                    }
                    break

                case 'field_crop_app_freshwater_source':
                    const fwsResult = await searchFreshwaterSource(value, dairy_id) ??
                        await insertFreshwaterSource(data, dairy_id) ??
                        await searchFreshwaterSource(value, dairy_id)
                    if (!fwsResult.error) {
                        resolve(fwsResult)
                    } else {
                        rej(fwsResult)
                    }
                    break

                case 'field_crop_app_freshwater_analysis':
                    const fwaResult = await searchFreshwaterAnalysis(value, dairy_id) ??
                        await insertFreshwaterAnalysis(data, dairy_id) ??
                        await searchFreshwaterAnalysis(value, dairy_id)
                    if (!fwaResult.error) {
                        resolve(fwaResult)
                    } else {
                        rej(fwaResult)
                    }
                    break
                case 'field_crop_app_solidmanure_analysis':


                    const smResult = await searchManureAnalysis(value, dairy_id) ??
                        await insertManureAnalysis(data, dairy_id) ??
                        await searchManureAnalysis(value, dairy_id)
                    if (!smResult.error) {
                        resolve(smResult)
                    } else {
                        rej(smResult)
                    }
                    break


                case 'nutrient_import':
                    try {
                        const fertlizerResult = await searchNutrientImportAnalysis(value, dairy_id) ??
                            await insertNutrientImportAnalysis(data, dairy_id) ??
                            await searchNutrientImportAnalysis(value, dairy_id)
                        if (!fertlizerResult.error) {
                            resolve(fertlizerResult)
                        } else {
                            rej(fertlizerResult)
                        }
                    } catch (e) {
                        rej(e)
                    }
                    break

                case 'field_crop_app_soil_analysis':
                    const soilResult = await searchSoilAnalysis(value, dairy_id) ??
                        await insertSoilAnalysis(data, dairy_id) ??
                        await searchSoilAnalysis(value, dairy_id)
                    if (!soilResult.error) {
                        resolve(soilResult)
                    } else {
                        rej(soilResult)
                    }
                    break

                case 'operators':
                    const opResult = await searchOperator(value, dairy_id) ??
                        await insertOperator(data, dairy_id) ??
                        await searchOperator(value, dairy_id)
                    if (!opResult.error) {
                        resolve(opResult)
                    } else {
                        rej(opResult)
                    }
                    break
                case 'export_contact':
                    const contactResult = await searchContact(value, dairy_id) ??
                        await insertContact(data, dairy_id) ??
                        await searchContact(value, dairy_id)
                    if (!contactResult.error) {
                        resolve(contactResult)
                    } else {
                        rej(contactResult)
                    }
                    break
                case 'export_hauler':
                    const haulerResult = await searchHauler(value, dairy_id) ??
                        await insertHauler(data, dairy_id) ??
                        await searchHauler(value, dairy_id)
                    if (haulerResult && !haulerResult.error) {
                        resolve(haulerResult)
                    } else {
                        rej(haulerResult)
                    }
                    break
                case 'export_recipient':
                    const recipientResult = await searchRecipient(value, dairy_id) ??
                        await insertRecipient(data, dairy_id) ??
                        await searchRecipient(value, dairy_id)
                    if (recipientResult && !recipientResult.error) {
                        resolve(recipientResult)
                    } else {
                        rej(recipientResult)
                    }
                    break
                case 'export_dest':
                    const destResult = await searchDest(value, dairy_id) ??
                        await insertDest(data, dairy_id) ??
                        await searchDest(value, dairy_id)
                    if (!destResult.error) {
                        resolve(destResult)
                    } else {
                        rej(destResult)
                    }
                    break


                case 'drain_source':
                    const drainResult = await searchDrainSrc(value, dairy_id) ??
                        await insertDrainSrc(data, dairy_id) ??
                        await searchDrainSrc(value, dairy_id)
                    if (!drainResult.error) {
                        resolve(drainResult)
                    } else {
                        rej(drainResult)
                    }
                    break
                default:
                    break

            }
        } catch (e) {
            const msg = `Server laztGet TSV upload error - ${endpoint}: ${e.error.code} -- ${e.error.routine}`
            console.log(msg, e)
            rej(msg)
        }

    })
}