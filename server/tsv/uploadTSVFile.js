const db = require('../db/index')

const insertTSV = (tsvData) => {
    const { dairy_id, title, data, tsvType } = tsvData
    return new Promise((res, rej) => {
        db.insertTSV([dairy_id, title, data, tsvType], (err, result) => {
            if (!err) {
                res("Inserted TSV successfully");
            } else if (err.code === '23505') {
                res(null)
            } else {
                rej(err);
            }
        })
    })
}

const updateTSV = (tsvData) => {
    const { dairy_id, title, data, tsvType } = tsvData
    return new Promise((res, rej) => {
        db.updateTSV([title, data, tsvType, dairy_id], (err, result) => {
            if (!err) {
                res("Updated tsv successfully");
            } else {
                logger.info(err)
                rej({ "error": "Updated tsv unsuccessful" });
            }
        })
    })
}

exports.uploadTSVToDB = (uploadedFilename, tsvText, dairy_id, tsvType) => {
    const tsvData = {
        title: uploadedFilename,
        data: tsvText,
        tsvType: tsvType,
        dairy_id: dairy_id
    }
    return new Promise(async (res, rej) => {
        const result = await insertTSV(tsvData) ??
            await updateTSV(tsvText)

        if (result) {
            res(result)
        } else {
            rej(result)
        }

    })
}