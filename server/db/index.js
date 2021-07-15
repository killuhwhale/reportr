const format = require('pg-format');
const { Pool, Client } = require('pg')
const pool = new Pool({
  host: 'localhost',
  database: 'reportrr',
  user: 'admin',
  password: 'mostdope',
  port: 5432,
})
// Test connection
// pool.query('SELECT NOW()', (err, res) => {
//   if(err){
//     console.log("Connection Unsuccessful.")
//   }else{
//     console.log("Connection Successful.")
//   }
// })


/** Tables
 *  
 *  Dairies
 *  ownoperators
 *  parcels
 *  
 */

// db.query("SQL HERE", [val1, val2, ...], callback(err, res))
// sql = format('INSERT INTO t (name, age) VALUES %L', myNestedArray); z
// console.log(sql); // INSERT INTO t (name, age) VALUES ('a', '1'), ('b', '2')z
/**
 * street VARCHAR(100) NOT NULL,
  cross_street VARCHAR(50),
  county VARCHAR(30),
  city VARCHAR(30) NOT NULL,
  city_state VARCHAR(3),
  city_zip VARCHAR(20) NOT NULL,
  title VARCHAR(30) NOT NULL,
  basin_plan VARCHAR(30),
  began timestamp,
 */
module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
  insert: (stmt, values, callback) => {
    return pool.query(format(stmt, values), [], callback)
  },
  getDairies: (reportingYr, callback)=> {
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
  insertParcel: (values, callback) => {
    console.log("Values in DB Pool query")
    console.log(values)
    return pool.query(
      format("INSERT INTO parcels(pnumber, dairy_id) VALUES (%L)", values),
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
  getFields: (dairy_id, callback)=> {
    return pool.query(
      format("SELECT * FROM fields where dairy_id = %L", dairy_id),
      [],
      callback
    )
  },
  getParcels: (dairy_id, callback)=> {
    return pool.query(
      format("SELECT * FROM parcels where dairy_id = %L", dairy_id),
      [],
      callback
    )
  },
  getFieldParcel: (dairy_id, callback)=> {
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
  updateParcel: (values, callback) => {
    return pool.query(`UPDATE parcels SET
      pnumber = $1 
      WHERE pk=$2`, 
      values,
      callback
    )
  },
  rmField: (id, callback)=> {
    return pool.query(
      format("DELETE FROM fields where pk = %L", id),
      [],
      callback
    )
  },
  rmParcel: (id, callback)=> {
    return pool.query(
      format("DELETE FROM parcels where pk = %L", id),
      [],
      callback
    )
  },
  rmFieldParcel: (id, callback)=> {
    return pool.query(
      format("DELETE FROM field_parcel where pk = %L", id),
      [],
      callback
    )
  },
}

