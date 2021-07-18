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
      format("INSERT INTO fields(title, acres, cropable, dairy_id) VALUES (%L)", values),
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
      format("DELETE FROM parcels where pk = %L", id),
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
      format("DELETE FROM field_parcel where pk = %L", id),
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
      format("DELETE FROM operators where pk = %L", id),
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
        ) VALUES (%L)`, values),
      [],
      callback
    )
  },
  getFieldCrop: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT *, f.title as fieldTitle, c.title as cropTitle FROM field_crop fc
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
      crop_id = $1,
      plant_date = $2,
      acres_planted = $3,
      typical_yield = $4, 
      moisture = $5,
      n = $6, 
      p = $7, 
      k = $8,
      salt = $9
      WHERE pk=$10`,
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

}

