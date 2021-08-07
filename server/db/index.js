const format = require('pg-format');
const { Pool, Client } = require('pg')
const pool = new Pool({
  host: 'localhost',
  database: 'reportrr',
  user: 'admin',
  password: 'mostdope',
  port: 5432,
})


/** Tables
 *  
 *  Dairies
 *  ownoperators
 *  parcels
 *  
 */
module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
  insert: (stmt, values, callback) => {
    return pool.query(format(stmt, values), [], callback)
  },
  getDairies: (reportingYr, callback) => {
    return pool.query(
      format("SELECT * FROM dairies where reporting_yr = %L", reportingYr),
      [],
      callback
    )
  },
  insertDairy: (values, callback) => {
    console.log("Values in DB Pool query")
    console.log(values)
    return pool.query(
      format("INSERT INTO dairies(title, reporting_yr) VALUES (%L)", values),
      [],
      callback
    )
  },
  updateDairy: (values, callback) => {
    return pool.query(`UPDATE dairies SET
      street = $1, 
      cross_street = $2,
      county = $3, 
      city = $4, 
      city_state = $5, 
      city_zip = $6, 
      title = $7,
      basin_plan = $8,
      p_breed = $9,
      began = $10
      WHERE pk=$11`,
      values,
      callback
    )
  },
  insertField: (values, callback) => {
    console.log("Values in DB Pool query")
    console.log(values)
    return pool.query(
      format("INSERT INTO fields(title, acres, cropable, dairy_id) VALUES (%L) RETURNING *", values),
      [],
      callback
    )
  },
  getFields: (dairy_id, callback) => {
    return pool.query(
      format("SELECT * FROM fields where dairy_id = %L", dairy_id),
      [],
      callback
    )
  },
  updateField: (values, callback) => {
    return pool.query(`UPDATE fields SET
      title = $1,
      acres = $2,
      cropable = $3
      WHERE pk=$4`,
      values,
      callback
    )
  },
  rmField: (id, callback) => {
    return pool.query(
      format("DELETE FROM fields where pk = %L", id),
      [],
      callback
    )
  },
  insertParcel: (values, callback) => {
    console.log("Values in DB Pool query")
    console.log(values)
    return pool.query(
      format("INSERT INTO parcels(pnumber, dairy_id) VALUES (%L)", values),
      [],
      callback
    )
  },
  getParcels: (dairy_id, callback) => {
    return pool.query(
      format("SELECT * FROM parcels where dairy_id = %L", dairy_id),
      [],
      callback
    )
  },
  updateParcel: (values, callback) => {
    return pool.query(`UPDATE parcels SET
      pnumber = $1 
      WHERE pk=$2`,
      values,
      callback
    )
  },
  rmParcel: (id, callback) => {
    return pool.query(
      format("DELETE FROM parcels where pk = %L ", id),
      [],
      callback
    )
  },
  insertFieldParcel: (values, callback) => {
    console.log("Values in DB Pool query")
    console.log(values)
    return pool.query(
      format("INSERT INTO field_parcel(dairy_id, field_id, parcel_id) VALUES (%L)", values),
      [],
      callback
    )
  },
  getFieldParcel: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT
            field_parcel.pk,
            dairies.title as dairyTitle,
            parcels.pnumber, fields.title, fields.acres,
            fields.cropable FROM field_parcel
          JOIN fields
          ON field_parcel.field_id = fields.pk
          JOIN parcels
          ON field_parcel.parcel_id = parcels.pk
          JOIN dairies
          ON field_parcel.dairy_id = dairies.pk
          WHERE field_parcel.dairy_id = %L
         `
        , dairy_id),
      [],
      callback
    )
  },
  rmFieldParcel: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_parcel where pk = %L ", id),
      [],
      callback
    )
  },
  insertOperator: (values, callback) => {
    console.log("Values in DB Pool query")
    console.log(values)
    return pool.query(
      format(`INSERT INTO operators(
        dairy_id, title, primary_phone, secondary_phone,
        street, city, city_state, city_zip, is_owner, is_responsible
        ) VALUES (%L)`, values),
      [],
      callback
    )
  },
  getOperators: (dairy_id, callback) => {
    return pool.query(
      format("SELECT * FROM operators where dairy_id = %L", dairy_id),
      [],
      callback
    )
  },
  updateOperator: (values, callback) => {
    return pool.query(`UPDATE operators SET
      dairy_id = $1,
      title = $2,
      primary_phone = $3,
      secondary_phone = $4,
      street = $5,
      city = $6, 
      city_state = $7,
      city_zip = $8, 
      is_owner = $9, 
      is_responsible = $10 
      WHERE pk=$11`,
      values,
      callback
    )
  },
  rmOperator: (id, callback) => {
    return pool.query(
      format("DELETE FROM operators where pk = %L ", id),
      [],
      callback
    )
  },
  insertHerd: (values, callback) => {
    console.log("Values in DB Pool query")
    console.log(values)
    return pool.query(
      format(`INSERT INTO herds(
        dairy_id) VALUES (%L)`, values),
      [],
      callback
    )
  },
  getHerd: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT * FROM herds WHERE dairy_id = %L`, dairy_id),
      [],
      callback
    )
  },
  updateHerd: (values, callback) => {
    return pool.query(`UPDATE herds SET
      milk_cows = $1,
      dry_cows = $2,
      bred_cows = $3,
      cows = $4,
      calf_young = $5,
      calf_old = $6 
      WHERE pk=$7`,
      values,
      callback
    )
  },
  insertFieldCrop: (values, callback) => {
    console.log("Values in DB Pool query")
    console.log(values)
    return pool.query(
      format(`INSERT INTO field_crop(
        dairy_id, field_id, crop_id, plant_date, acres_planted, typical_yield, moisture, n,p,k,salt
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCrop: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT 
          fc.pk,
          fc.field_id,
          fc.plant_date,
          fc.acres_planted,
          fc.typical_yield,
          fc.moisture,
          fc.n,
          fc.p, 
          fc.k,
          fc.salt,
          f.cropable,
          f.acres,
          f.title as fieldTitle,
          c.title as cropTitle 
        FROM field_crop fc
        JOIN crops c
        ON c.pk = fc.crop_id
        JOIN fields f
        ON f.pk = fc.field_id
        WHERE fc.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  updateFieldCrop: (values, callback) => {
    return pool.query(`UPDATE field_crop SET
      plant_date = $1,
      acres_planted = $2,
      typical_yield = $3, 
      moisture = $4,
      n = $5, 
      p = $6, 
      k = $7,
      salt = $8
      WHERE pk=$9`,
      values,
      callback
    )
  },
  rmFieldCrop: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop where pk = %L", id),
      [],
      callback
    )
  },
  getCrops: (field_id, callback) => {
    return pool.query(
      `SELECT * FROM crops;`,
      [],
      callback
    )
  },
  getCropsByTitle: (title, callback) => {
    return pool.query(
      `SELECT * FROM crops WHERE title = $1;`,
      [title],
      callback
    )
  },
  insertFieldCropHarvest: (values, callback) => {
    console.log("Values in DB Pool query")
    console.log(values)
    return pool.query(
      format(`INSERT INTO field_crop_harvest(
        dairy_id, field_crop_id, harvest_date, density, basis, actual_yield, moisture, n,p,k,tfs
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropHarvest: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT 
           fch.pk,
           fch.harvest_date,
           fch.actual_yield,
           fch.basis,
           fch.density,
           fch.moisture as actual_moisture,
           fch.n as actual_n,
           fch.p as actual_p,
           fch.k as actual_k,
           fch.tfs,
           c.title as croptitle,
           f.title as fieldtitle,
           fc.plant_date,
           fc.acres_planted,
           fc.typical_yield,
           fc.moisture as typical_moisture,
           fc.n as typical_n,
           fc.p as typical_p,
           fc.k as typical_k,
           fc.salt as typical_salt

        FROM field_crop_harvest fch
        JOIN field_crop fc
        ON fc.pk = fch.field_crop_id
        JOIN fields f
        ON f.pk = fc.field_id
        JOIN crops c
        ON c.pk = fc.crop_id
        WHERE 
          fch.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  updateFieldCropHarvest: (values, callback) => {
    return pool.query(`UPDATE field_crop_harvest SET
      harvest_date = $1,
      actual_yield = $2,
      basis = $3, 
      density = $4,
      moisture = $5, 
      n = $6, 
      p = $7,
      k = $8,
      tfs = $9
      WHERE pk=$10`,
      values,
      callback
    )
  },
  rmFieldCropHarvest: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_harvest where pk = %L", id),
      [],
      callback
    )
  },
  searchFieldsByTitle: (values, callback) => {
    console.log("Values in DB Pool query")
    console.log(values)
    return pool.query(
      "SELECT * FROM fields where title = $1 and dairy_id = $2",
      values,
      callback
    )
  },
  searchFieldCropsByFieldCropPlantdate: (values, callback) => {
    console.log("Values in DB Pool query")
    console.log(values)
    return pool.query(
      "SELECT * FROM field_crop where field_id = $1 and crop_id = $2 and plant_date = $3",
      values,
      callback
    )
  },
  insertTSV: (values, callback) => {
    console.log("Values in DB Pool query TSV")
    console.log(values)
    return pool.query(
      format(`INSERT INTO TSVs(
        dairy_id, title, data
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getTSVs: (dairy_id, callback) => {
    return pool.query(
      format("SELECT * FROM TSVs where dairy_id = %L", dairy_id),
      [],
      callback
    )
  },
  rmTSV: (id, callback) => {
    return pool.query(
      format("DELETE FROM TSVs where pk = %L", id),
      [],
      callback
    )
  },


  insertFieldCropApplication: (values, callback) => {
    console.log("Values in DB Pool query")
    console.log(values)
    return pool.query(
      format(`INSERT INTO field_crop_app(
        dairy_id, field_crop_id, app_date, app_method, precip_before, precip_during, precip_after
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropApplication: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT 
           fca.pk,
           fca.app_date,
           fca.app_method,
           fca.precip_before,
           fca.precip_during,
           fca.precip_after,
           
           c.title as croptitle,
           f.title as fieldtitle,
           fc.plant_date,
           fc.acres_planted,
           fc.typical_yield,
           fc.moisture as typical_moisture,
           fc.n as typical_n,
           fc.p as typical_p,
           fc.k as typical_k,
           fc.salt as typical_salt

        FROM field_crop_app fca
        JOIN field_crop fc
        ON fc.pk = fca.field_crop_id
        JOIN fields f
        ON f.pk = fc.field_id
        JOIN crops c
        ON c.pk = fc.crop_id
        WHERE 
          fca.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  updateFieldCropApplication: (values, callback) => {
    return pool.query(`UPDATE field_crop_app SET
      app_date = $1,
      app_method = $2,
      precip_before = $3,
      precip_during = $4,
      precip_after = $5,
      WHERE pk=$6`,
      values,
      callback
    )
  },
  rmFieldCropApplication: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app where pk = %L", id),
      [],
      callback
    )
  },



  // field_crop_app_id, material_type, source_desc, amount_applied, totalKN, ammoniumN, unionizedAmmoniumN, nitrateN, totalP, totalK, totalTDS, 

  insertFieldCropApplicationProcessWastewater: (values, callback) => {
    console.log("Values in DB Pool query")
    console.log(values)
    return pool.query(
      format(`INSERT INTO field_crop_app_process_wastewater(
        dairy_id, field_crop_app_id, material_type, source_desc, amount_applied, totalKN, ammoniumN, unionizedAmmoniumN, nitrateN, totalP, totalK, totalTDS
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropApplicationProcessWastewater: (dairy_id, callback) => {
    return pool.query(
      format(
        // nitrateN, totalP, totalK, totalTDS
        `SELECT 
           fcapww.pk,
           fcapww.field_crop_app_id,
           fcapww.material_type,
           fcapww.source_desc,
           fcapww.amount_applied,
           fcapww.totalKN,
           fcapww.ammoniumN,
           fcapww.unionizedAmmoniumN,
           fcapww.nitrateN,
           fcapww.ammoniumN,
           fcapww.totalP,
           fcapww.totalK,
           fcapww.totalTDS,

           fca. app_date,
           fca. app_method,
           
           c.title as croptitle,
           f.title as fieldtitle,
           fc.plant_date,
           fc.acres_planted,
           fc.typical_yield,
           fc.moisture as typical_moisture,
           fc.n as typical_n,
           fc.p as typical_p,
           fc.k as typical_k,
           fc.salt as typical_salt

        FROM field_crop_app_process_wastewater fcapww
        
        JOIN field_crop_app fca
        ON fca.pk = fcapww.field_crop_app_id
        
        JOIN field_crop fc
        ON fc.pk = fca.field_crop_id

        
        JOIN fields f
        ON f.pk = fc.field_id
        
        JOIN crops c
        ON c.pk = fc.crop_id
        WHERE 
        fcapww.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
 rmFieldCropApplicationProcessWastewater: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_process_wastewater where pk = %L", id),
      [],
      callback
    )
  },
  
}

