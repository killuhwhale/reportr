const format = require('pg-format');
const { Pool, Client } = require('pg');
const fs = require('fs');
const process = require('process');
const logger = require('../logs/logging')
const PORT = process.env.PORT || 3001;
const { validFieldCropHarvest, validProcessWastewaterAnalysis, validProcessWastewater, validFreshwaterAnalysis, validSolidmanureAnalysis, validSolidmanure, validNutrientImport, validFertilizer, validSoilAnalysis, validPlowdownCredit, validDrainAnalysis, validExportManifest } = require('./validate');
const { validStartEndDates } = require('../tsv/validInput');


const test = {
  host: 'localhost',
  database: 'testdb',
  port: 5432,
}

const dev = {
  host: 'localhost',
  database: 'reportrr',
  user: 'admin',
  password: 'mostdope',
  port: 5432,
}

const prodDigitalOcean = {
  host: `app-554312c8-2b1e-4143-99c3-989b7463a890-do-user-9954352-0.b.db.ondigitalocean.com`,
  database: 'reportr',
  user: 'reportr',
  password: 'JIQHJLmDiEhjGCoj',
  port: 25060,
  ssl: {
    rejectUnauthorized: false
  }

}

// const isProd = PORT !== 3001
const TESTING = process.env.NODE_ENV === 'test' || false
const isProd = process.env.NODE_ENV === 'ocean' || false
const pool = new Pool(TESTING ? test : isProd ? prodDigitalOcean : dev)

logger.info(`Connected to db: ${TESTING ? "Test" : isProd ? "Ocean" : "Dev"} db.`)





const insertCompany = (values, callback) => {
  return pool.query(
    format("INSERT INTO companies(title) VALUES (%L)", values),
    [],
    callback
  )
}

const insertDairyBase = (values, callback) => {
  return pool.query(
    format("INSERT INTO dairy_base(company_id, title) VALUES (%L)", values),
    [],
    callback
  )
}

const insertDairy = (values, callback) => {
  const [dairy_base_id, title, reporting_yr, period_start, period_end] = values

  if (!validStartEndDates(period_start, period_end)) {
    callback({ code: '1000', messagge: 'Dairy reporting period start must be before the reporting period end date.' })
    return
  }

  return pool.query(
    format("INSERT INTO dairies(dairy_base_id, title, reporting_yr, period_start, period_end) VALUES (%L)", values),
    [],
    callback
  )
}

const insertHerd = (values, callback) => {


  return pool.query(
    format(`INSERT INTO herds(
      dairy_id) VALUES (%L)`, values),
    [],
    callback
  )
}

const updateHerd = (values, callback) => {
  return pool.query(`UPDATE herds SET
    milk_cows = $1,
    dry_cows = $2,
    bred_cows = $3,
    cows = $4,
    calf_young = $5,
    calf_old = $6,
    p_breed = $7,
    p_breed_other = $8
    WHERE pk=$9`,
    values,
    callback
  )
}

module.exports = {
  pool,
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
  insert: (stmt, values, callback) => {
    return pool.query(format(stmt, values), [], callback)
  },
  getCompanies: (_, callback) => {
    return pool.query(
      "SELECT * FROM companies",
      [],
      callback
    )
  },
  getCompany: (company_id, callback) => {
    return pool.query(
      "SELECT * FROM companies where pk=$L",
      [company_id],
      callback
    )
  },
  insertCompany,
  updateCompany: (values, callback) => {
    return pool.query(`UPDATE companies SET
    title = $1
    WHERE pk=$2 RETURNING *`,
      values,
      callback
    )
  },
  rmCompany: (id, callback) => {
    return pool.query(
      format("DELETE FROM companies where pk = %L", id),
      [],
      callback
    )
  },

  getDairyBase: (company_id, callback) => {
    return pool.query(
      "SELECT * FROM dairy_base where company_id=$1",
      [company_id],
      callback
    )
  },
  insertDairyBase,
  updateDairyBase: (values, callback) => {
    return pool.query(`UPDATE dairy_base SET
    title = $1
    WHERE pk=$2 RETURNING *`,
      values,
      callback
    )
  },
  rmDairyBase: (id, callback) => {
    return pool.query(
      format("DELETE FROM dairy_base where pk = %L", id),
      [],
      callback
    )
  },

  getDairiesByDairyBaseID: (dairyBaseID, callback) => {
    return pool.query(
      format("SELECT * FROM dairies where dairy_base_id = %L", dairyBaseID),
      [],
      callback
    )
  },
  getDairies: (reportingYr, callback) => {
    return pool.query(
      format("SELECT * FROM dairies where reporting_yr = %L", reportingYr),
      [],
      callback
    )
  },
  getDairy: (dairy_id, callback) => {
    return pool.query(
      format("SELECT * FROM dairies where pk = %L LIMIT 1", dairy_id),
      [],
      callback
    )
  },
  insertDairy,

  insertFullDairy: (values, callback) => {
    const [dairy_base_id, reporting_yr, street, cross_street, county, city,
      city_state, city_zip, title, basin_plan, began, period_start, period_end
    ] = values
    if (!validStartEndDates(period_start, period_end)) {
      callback({ code: '1000', messagge: 'Dairy reporting period start must be before the reporting period end date.' })
      return
    }
    return pool.query(
      format("INSERT INTO dairies(dairy_base_id, reporting_yr, street, cross_street, county, city, city_state, city_zip, title, basin_plan, began, period_start, period_end) VALUES (%L) RETURNING *", values),
      [],
      callback
    )
  },
  updateDairy: (values, callback) => {
    const [street, cross_street, county, city,
      city_state, city_zip, title, basin_plan, began, period_start, period_end, pk] = values
    if (!validStartEndDates(period_start, period_end)) {
      callback({ code: '1000', messagge: 'Dairy reporting period start must be before the reporting period end date.' })
      return
    }
    return pool.query(`UPDATE dairies SET
      street = $1, 
      cross_street = $2,
      county = $3, 
      city = $4, 
      city_state = $5, 
      city_zip = $6, 
      title = $7,
      basin_plan = $8,
      began = $9,
      period_start = $10,
      period_end = $11
      WHERE pk=$12 RETURNING *`,
      values,
      callback
    )
  },
  rmDairy: (id, callback) => {
    return pool.query(
      format("DELETE FROM dairies where pk = %L", id),
      [],
      callback
    )
  },

  insertField: (values, callback) => {


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


    return pool.query(
      format("INSERT INTO parcels(pnumber, dairy_id) VALUES (%L)  RETURNING *", values),
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


    return pool.query(
      format("INSERT INTO field_parcel(dairy_id, field_id, parcel_id) VALUES (%L)  RETURNING *", values),
      [],
      callback
    )
  },
  getFieldParcel: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT
            fp.pk,
            fp.field_id,
            d.title as dairyTitle,
            p.pnumber,
            f.title,
            f.acres,
            f.cropable
          
          FROM field_parcel fp

          JOIN fields f
          ON fp.field_id = f.pk
          
          JOIN parcels p
          ON fp.parcel_id = p.pk
          
          JOIN dairies d
          ON fp.dairy_id = d.pk
          
          WHERE fp.dairy_id = %L
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
  searchParcelsByPnum: (values, callback) => {

    return pool.query(
      `SELECT * FROM parcels
      where pnumber = $1 and dairy_id = $2`,
      values,
      callback
    )
  },

  insertOperator: (values, callback) => {
    return pool.query(
      format(`INSERT INTO operators(
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
        is_responsible
        ) VALUES (%L) RETURNING *`, values),
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
  getOperatorsByOwnerStatus: (values, callback) => {
    return pool.query(
      "SELECT * FROM operators where is_owner = $1 and dairy_id = $2",
      values,
      callback
    )
  },
  getOperatorsByOperatorStatus: (values, callback) => {
    return pool.query(
      "SELECT * FROM operators where is_operator = $1 and dairy_id = $2",
      values,
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
      is_operator = $10,
      is_responsible = $11 
      WHERE pk=$12`,
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
  searchOperators: (values, callback) => {

    return pool.query(
      `SELECT * FROM operators
      where title = $1 and primary_phone = $2 and dairy_id = $3`,
      values,
      callback
    )
  },

  insertHerd,
  insertFullHerd: (values, callback) => {
    return pool.query(
      `INSERT INTO herds(
        dairy_id,
        milk_cows,
        dry_cows,
        bred_cows,
        cows,
        calf_young,
        calf_old,
        p_breed,
        p_breed_other) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      values,
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
  updateHerd,

  insertFieldCrop: (values, callback) => {
    const [dairy_id, field_id, crop_id, plant_date, acres_planted, typical_yield, moisture, n, p, k, salt] = values

    if (acres_planted < 1 || acres_planted > 2147483647) {
      callback({ code: '1000', messagge: 'Acres planted must be between 1 - 2,147,483,647.' })
      return
    }

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
    const isValid = validFieldCropHarvest(values)
    if (isValid.code !== '0') {
      callback(isValid)  // returns {code: '1001', msg: 'errMsg'}
      return
    }

    return pool.query(
      format(`INSERT INTO field_crop_harvest(
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
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropHarvest: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT 
          'harvest' as entry_type,
           fch.pk,
           fch.harvest_date,
           fch.actual_yield,
           fch.method_of_reporting,
           fch.moisture as actual_moisture,
           fch.n as actual_n,
           fch.p as actual_p,
           fch.k as actual_k,
           fch.n_dl,
           fch.p_dl,
           fch.k_dl,
           fch.tfs_dl,
           fch.tfs,
           fch.sample_date,
           fch.src_of_analysis,
           fch.expected_yield_tons_acre,
           fch.field_crop_id,

           c.title as croptitle,
           f.title as fieldtitle,
           f.pk as field_id,
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


    return pool.query(
      "SELECT * FROM fields where title = $1 and dairy_id = $2",
      values,
      callback
    )
  },
  searchFieldCropsByFieldCropPlantdate: (values, callback) => {


    return pool.query(
      "SELECT * FROM field_crop where field_id = $1 and crop_id = $2 and plant_date = $3",
      values,
      callback
    )
  },

  insertTSV: (values, callback) => {
    return pool.query(
      format(`INSERT INTO TSVs(
        dairy_id, title, data, tsvType
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getTSVs: (dairy_id, tsvType, callback) => {
    return pool.query(
      "SELECT * FROM TSVs where dairy_id = $1 and tsvType = $2",
      [dairy_id, tsvType],
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
  rmTSVByDairyIDTSVType: (values, callback) => {
    return pool.query(
      "DELETE FROM TSVs where dairy_id = $1 and tsvType = $2",
      values,
      callback
    )
  },
  updateTSV: (values, callback) => {
    return pool.query(`UPDATE TSVs SET
      title = $1, 
      data = $2
      WHERE tsvType=$3 and dairy_id=$4 RETURNING *`,
      values,
      callback
    )
  },

  insertFieldCropApplication: (values, callback) => {


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
  searchFieldCropApplicationsByFieldCropIDAppDate: (values, callback) => {


    return pool.query(
      "SELECT * FROM field_crop_app where field_crop_id = $1 and app_date = $2 and app_method = $3 and dairy_id = $4",
      values,
      callback
    )
  },

  insertFieldCropApplicationProcessWastewaterAnalysis: (values, callback) => {
    const isValid = validProcessWastewaterAnalysis(values)
    if (isValid.code !== '0') {
      callback(isValid)
      return
    }

    return pool.query(
      format(`
        INSERT INTO field_crop_app_process_wastewater_analysis( 
          dairy_id, sample_date, sample_desc, sample_data_src, material_type, kn_con, nh4_con, nh3_con, no3_con, p_con, k_con,
          ca_con,
          mg_con,
          na_con,
          hco3_con,
          co3_con,
          so4_con, 
          cl_con,
          ec, tds,
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
          ph 
        ) VALUES (%L)  RETURNING *`,
        values,
      ),
      [],
      callback
    )
  },
  getFieldCropApplicationProcessWastewaterAnalysis: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT * FROM field_crop_app_process_wastewater_analysis
          WHERE dairy_id = %L`, dairy_id),
      [],
      callback
    )
  },
  rmFieldCropApplicationProcessWastewaterAnalysis: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_process_wastewater_analysis where pk = %L", id),
      [],
      callback
    )
  },
  searchFieldCropAppProcessWastewaterAnalysisBySampleDateSampleDesc: (values, callback) => {


    return pool.query(
      `SELECT * FROM field_crop_app_process_wastewater_analysis
       where sample_date = $1 and sample_desc = $2 and dairy_id = $3`,
      values,
      callback
    )
  },

  insertFieldCropApplicationProcessWastewater: (values, callback) => {
    const isValid = validProcessWastewater(values)
    if (isValid.code !== '0') {
      callback(isValid)
      return
    }

    return pool.query(
      format(`INSERT INTO field_crop_app_process_wastewater(
        dairy_id,
        field_crop_app_id,
        field_crop_app_process_wastewater_analysis_id,
        app_desc,
        amount_applied
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropApplicationProcessWastewater: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT 
          'wastewater' as entry_type,
          fcapww.pk,
          fcapww.dairy_id,
          fcapww.field_crop_app_id,
          fcapww.field_crop_app_process_wastewater_analysis_id,
          fcapww.app_desc,
          fcapww.amount_applied,
          
          fcapwwa.material_type,
          fcapwwa.sample_date,
          fcapwwa.sample_desc,
          fcapwwa.sample_data_src,
          fcapwwa.kn_con,
          fcapwwa.nh4_con,
          fcapwwa.nh3_con,
          fcapwwa.no3_con,
          fcapwwa.p_con,
          fcapwwa.k_con,
          fcapwwa.ec,
          fcapwwa.tds,
          fcapwwa.ph,

          fca.app_date,
          fca.app_method,
          fca.precip_before,
          fca.precip_during,
          fca.precip_after,
          
          c.title as croptitle,
          f.title as fieldtitle,
          f.pk as field_id,
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

        JOIN field_crop_app_process_wastewater_analysis fcapwwa
        ON fcapwwa.pk = fcapww.field_crop_app_process_wastewater_analysis_id
        
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



  insertFieldCropApplicationFreshwaterSource: (values, callback) => {


    return pool.query(
      format(`INSERT INTO field_crop_app_freshwater_source(
        dairy_id,
        src_desc,
        src_type
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropApplicationFreshwaterSource: (dairy_id, callback) => {
    return pool.query(
      format(
        // nitrateN, totalP, totalK, totalTDS
        `SELECT *
        FROM field_crop_app_freshwater_source
        WHERE 
        dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmFieldCropApplicationFreshwaterSource: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_freshwater_source where pk = %L", id),
      [],
      callback
    )
  },
  searchFieldCropAppFreshwaterSource: (values, callback) => {


    return pool.query(
      `SELECT * FROM field_crop_app_freshwater_source
       where src_desc = $1 and src_type = $2 and dairy_id = $3`,
      values,
      callback
    )
  },

  insertFieldCropApplicationFreshwaterAnalysis: (values, callback) => {
    const isValid = validFreshwaterAnalysis(values)
    if (isValid.code !== '0') {
      callback(isValid)
      return
    }

    return pool.query(
      format(`INSERT INTO field_crop_app_freshwater_analysis(
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
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropApplicationFreshwaterAnalysis: (dairy_id, callback) => {
    return pool.query(
      format(
        // nitrateN, totalP, totalK, totalTDS
        `SELECT *,
        fcafwa.pk,
        fcafws.pk as freshwater_source_id


        FROM field_crop_app_freshwater_analysis fcafwa
        JOIN field_crop_app_freshwater_source fcafws
        ON fcafws.pk = fcafwa.fresh_water_source_id

        WHERE 
        fcafwa.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmFieldCropApplicationFreshwaterAnalysis: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_freshwater_analysis where pk = %L", id),
      [],
      callback
    )
  },
  searchFieldCropAppFreshwaterAnalysis: (values, callback) => {


    return pool.query(
      `SELECT * FROM field_crop_app_freshwater_analysis
       where sample_date = $1 and sample_desc = $2 and src_of_analysis = $3 and fresh_water_source_id = $4 and dairy_id = $5`,
      values,
      callback
    )
  },

  insertFieldCropApplicationFreshwater: (values, callback) => {


    return pool.query(
      format(`INSERT INTO field_crop_app_freshwater(
        dairy_id,
        field_crop_app_id,
        field_crop_app_freshwater_analysis_id,
        app_rate,
        run_time,
        amount_applied,
        amt_applied_per_acre
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropApplicationFreshwater: (dairy_id, callback) => {
    return pool.query(
      format(
        // nitrateN, totalP, totalK, totalTDS
        `SELECT 
          'freshwater' as entry_type,
          sample_date,
          src_desc,
          src_type,
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
          app_rate,
          run_time,
          amount_applied,
          amt_applied_per_acre,

          f.title as fieldtitle,
          f.pk as field_id,
          c.title as croptitle,
          fc.plant_date,
          fc.acres_planted,

          fca.app_date,
          fca.app_method,
          fca.precip_before,
          fca.precip_during,
          fca.precip_after
          
        
        FROM field_crop_app_freshwater fcfw

        JOIN field_crop_app fca
        ON fca.pk = fcfw.field_crop_app_id

        JOIN field_crop_app_freshwater_analysis fcafwa
        ON fcafwa.pk = fcfw.field_crop_app_freshwater_analysis_id

        JOIN field_crop_app_freshwater_source fcafws
        ON fcafws.pk = fcafwa.fresh_water_source_id

        JOIN field_crop fc
        ON fc.pk = fca.field_crop_id

        JOIN fields f
        ON f.pk = fc.field_id

        JOIN crops c
        ON c.pk = fc.crop_id

        WHERE 
        fcfw.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmFieldCropApplicationFreshwater: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_freshwater where pk = %L", id),
      [],
      callback
    )
  },

  insertFieldCropApplicationSolidmanureAnalysis: (values, callback) => {
    const isValid = validSolidmanureAnalysis(values)
    if (isValid.code !== '0') {
      callback(isValid)
      return
    }

    return pool.query(
      format(`INSERT INTO field_crop_app_solidmanure_analysis(
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
        tfs_dl
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropApplicationSolidmanureAnalysis: (dairy_id, callback) => {
    return pool.query(
      format(
        // nitrateN, totalP, totalK, totalTDS
        `SELECT *
        FROM field_crop_app_solidmanure_analysis fcasma
        WHERE 
        fcasma.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmFieldCropApplicationSolidmanureAnalysis: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_solidmanure_analysis where pk = %L", id),
      [],
      callback
    )
  },
  searchFieldCropAppSolidmanureAnalysis: (values, callback) => {

    return pool.query(
      `SELECT * FROM field_crop_app_solidmanure_analysis
       where sample_date = $1 and sample_desc = $2 and src_of_analysis = $3 and dairy_id = $4`,
      values,
      callback
    )
  },

  insertFieldCropApplicationSolidmanure: (values, callback) => {
    const isValid = validSolidmanure(values)
    if (isValid.code !== '0') {
      callback(isValid)
      return
    }

    return pool.query(
      format(`INSERT INTO field_crop_app_solidmanure(
        dairy_id,
        field_crop_app_id,
        field_crop_app_solidmanure_analysis_id,
        src_desc,
        amount_applied,
        amt_applied_per_acre
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropApplicationSolidmanure: (dairy_id, callback) => {
    return pool.query(
      format(
        // nitrateN, totalP, totalK, totalTDS
        `SELECT 
        'manure' as entry_type,
        fcasm.src_desc,
        fcasm.amount_applied,
        fcasm.amt_applied_per_acre,

        fcasma.sample_desc,
        fcasma.sample_date,
        fcasma.material_type,
        fcasma.src_of_analysis,
        fcasma.moisture,
        fcasma.method_of_reporting,
        fcasma.n_con,
        fcasma.p_con,
        fcasma.k_con,
        fcasma.ca_con,
        fcasma.mg_con,
        fcasma.na_con,
        fcasma.s_con,
        fcasma.cl_con,
        fcasma.tfs,
        

        f.title as fieldtitle,
        f.pk as field_id,
        c.title as croptitle,
        fc.plant_date,
        fc.acres_planted,

        fca.app_date,
        fca.app_method,
        fca.precip_before,
        fca.precip_during,
        fca.precip_after
          
        
        FROM field_crop_app_solidmanure fcasm

        JOIN field_crop_app fca
        ON fca.pk = fcasm.field_crop_app_id

        JOIN field_crop_app_solidmanure_analysis fcasma
        ON fcasma.pk = fcasm.field_crop_app_solidmanure_analysis_id


        JOIN field_crop fc
        ON fc.pk = fca.field_crop_id

        JOIN fields f
        ON f.pk = fc.field_id

        JOIN crops c
        ON c.pk = fc.crop_id



        WHERE 
        fcasm.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmFieldCropApplicationSolidmanure: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_solidmanure where pk = %L", id),
      [],
      callback
    )
  },


  insertNutrientImport: (values, callback) => {
    const isValid = validNutrientImport(values)
    if (isValid.code !== '0') {
      callback(isValid)
      return
    }


    return pool.query(
      format(`INSERT INTO nutrient_import(
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
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getNutrientImport: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT *
        FROM nutrient_import
        WHERE 
        dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  getNutrientImportByMaterialType: (values, callback) => {
    return pool.query(
      `SELECT *
      FROM nutrient_import
      WHERE 
      material_type LIKE $1 and
      dairy_id = $2`,
      values,
      callback
    )
  },
  getNutrientImportByWastewater: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT *
        FROM nutrient_import
        WHERE 
        material_type ILIKE 'Process%' and
        dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmNutrientImport: (id, callback) => {
    return pool.query(
      format("DELETE FROM nutrient_import where pk = %L", id),
      [],
      callback
    )
  },
  searchNutrientImport: (values, callback) => {

    return pool.query(
      `SELECT * FROM nutrient_import
       where import_date = $1 and material_type = $2 and import_desc = $3 and dairy_id = $4`,
      values,
      callback
    )
  },


  insertFieldCropApplicationFertilizer: (values, callback) => {
    const isValid = validFertilizer(values)
    if (isValid.code !== '0') {
      callback(isValid)
      return
    }

    return pool.query(
      format(`INSERT INTO field_crop_app_fertilizer(
        dairy_id,
        field_crop_app_id,
        nutrient_import_id,
        amount_applied
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropApplicationFertilizer: (dairy_id, callback) => {
    return pool.query(
      format(
        // nitrateN, totalP, totalK, totalTDS
        `SELECT 
        'fertilizer' as entry_type,
        fcaf.amount_applied,

        ni.import_desc,
        ni.import_date,
        ni.material_type,
        ni.method_of_reporting,
        ni.amount_imported,
        ni.moisture,
        ni.n_con,
        ni.p_con,
        ni.k_con,
        ni.salt_con,

        f.title as fieldtitle,
        f.pk as field_id,
        c.title as croptitle,
        fc.plant_date,
        fc.acres_planted,
        fca.app_date,
        fca.app_method,
        fca.precip_before,
        fca.precip_during,
        fca.precip_after
          
        


        FROM field_crop_app_fertilizer fcaf

        JOIN field_crop_app fca
        ON fca.pk = fcaf.field_crop_app_id

        JOIN nutrient_import ni
        ON ni.pk = fcaf.nutrient_import_id


        JOIN field_crop fc
        ON fc.pk = fca.field_crop_id

        JOIN fields f
        ON f.pk = fc.field_id

        JOIN crops c
        ON c.pk = fc.crop_id



        WHERE 
        fcaf.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmFieldCropApplicationFertilizer: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_fertilizer where pk = %L", id),
      [],
      callback
    )
  },



  insertFieldCropApplicationSoilAnalysis: (values, callback) => {
    const isValid = validSoilAnalysis(values)
    if (isValid.code !== '0') {
      callback(isValid)
      return
    }

    return pool.query(
      format(`INSERT INTO field_crop_app_soil_analysis(
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
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropApplicationSoilAnalysis: (dairy_id, callback) => {
    return pool.query(
      format(
        // nitrateN, totalP, totalK, totalTDS
        `SELECT *,
        fcasa.pk,
        f.pk as field_pk
        FROM field_crop_app_soil_analysis fcasa

        JOIN fields f
        ON f.pk = fcasa.field_id

        WHERE 
        fcasa.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmFieldCropApplicationSoilAnalysis: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_soil_analysis where pk = %L", id),
      [],
      callback
    )
  },
  searchFieldCropApplicationSoilAnalysis: (values, callback) => {
    return pool.query(
      `SELECT * FROM field_crop_app_soil_analysis
      where field_id = $1 and sample_date = $2 and sample_desc = $3 and dairy_id = $4`,
      values,
      callback
    )
  },

  insertFieldCropApplicationSoil: (values, callback) => {
    return pool.query(
      format(`INSERT INTO field_crop_app_soil(
        dairy_id,
        field_crop_app_id,
        src_desc,
        analysis_one,
        analysis_two,
        analysis_three
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropApplicationSoil: (dairy_id, callback) => {
    return pool.query(
      format(
        // nitrateN, totalP, totalK, totalTDS
        `SELECT
        'soil' as entry_type,
        fcas.pk,
        fcas.src_desc,

        f.title as fieldtitle,
        f.pk as field_id,
        c.title as croptitle,
        fc.plant_date,
        fc.acres_planted,
        fca.app_date,
        fca.pk as field_crop_app_id,
        fca.app_date,
        fca.app_method,
        fca.precip_before,
        fca.precip_during,
        fca.precip_after,
 

        fcasa_one.sample_date as sample_date_0, 
        fcasa_one.n_con as n_con_0,
        fcasa_one.p_con as p_con_0,
        fcasa_one.k_con as k_con_0,
        fcasa_one.ec as ec_0,
        fcasa_one.org_matter as org_matter_0,

        fcasa_two.sample_date as sample_date_1,
        fcasa_two.n_con as n_con_1,
        fcasa_two.p_con as p_con_1,
        fcasa_two.k_con as k_con_1,
        fcasa_two.ec as ec_1,
        fcasa_two.org_matter as org_matter_1,

        fcasa_three.sample_date as sample_date_2,
        fcasa_three.n_con as n_con_2,
        fcasa_three.p_con as p_con_2,
        fcasa_three.k_con as k_con_2,
        fcasa_three.ec as ec_2,
        fcasa_three.org_matter as org_matter_2


        FROM field_crop_app_soil fcas

        JOIN field_crop_app fca
        on fca.pk = fcas.field_crop_app_id

        JOIN field_crop fc
        ON fc.pk = fca.field_crop_id

        JOIN fields f
        ON f.pk = fc.field_id

        JOIN crops c
        ON c.pk = fc.crop_id

        JOIN field_crop_app_soil_analysis fcasa_one
        ON fcasa_one.pk = fcas.analysis_one
        
        JOIN field_crop_app_soil_analysis fcasa_two
        ON fcasa_two.pk = fcas.analysis_two
        
        JOIN field_crop_app_soil_analysis fcasa_three
        ON fcasa_three.pk = fcas.analysis_three
        
        WHERE 
        fcas.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmFieldCropApplicationSoil: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_soil where pk = %L", id),
      [],
      callback
    )
  },

  insertFieldCropApplicationPlowdownCredit: (values, callback) => {
    const isValid = validPlowdownCredit(values)
    if (isValid.code !== '0') {
      callback(isValid)
      return
    }

    return pool.query(
      format(`INSERT INTO field_crop_app_plowdown_credit(
        dairy_id,
        field_crop_app_id,
        src_desc,
        n_lbs_acre,
        p_lbs_acre,
        k_lbs_acre,
        salt_lbs_acre
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropApplicationPlowdownCredit: (dairy_id, callback) => {
    return pool.query(
      format(
        // nitrateN, totalP, totalK, totalTDS
        `SELECT
        'plowdown' as entry_type,
        fcapc.pk,
        fcapc.src_desc,
        fcapc.n_lbs_acre,
        fcapc.p_lbs_acre,
        fcapc.k_lbs_acre,
        fcapc.salt_lbs_acre,

        f.title as fieldtitle,
        f.pk as field_id,
        c.title as croptitle,
        fc.plant_date,
        fc.acres_planted,
        fca.app_date,
        fca.pk as field_crop_app_id,
        fca.app_date,
        fca.app_method,
        fca.precip_before,
        fca.precip_during,
        fca.precip_after


        FROM field_crop_app_plowdown_credit fcapc

        JOIN field_crop_app fca
        on fca.pk = fcapc.field_crop_app_id

        JOIN field_crop fc
        ON fc.pk = fca.field_crop_id

        JOIN fields f
        ON f.pk = fc.field_id

        JOIN crops c
        ON c.pk = fc.crop_id


        WHERE 
        fcapc.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmFieldCropApplicationPlowdownCredit: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_plowdown_credit where pk = %L", id),
      [],
      callback
    )
  },

  insertDrainSource: (values, callback) => {
    return pool.query(
      format(`INSERT INTO drain_source(
        dairy_id,
        src_desc
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getDrainSource: (dairy_id, callback) => {
    return pool.query(
      format(
        // nitrateN, totalP, totalK, totalTDS
        `SELECT *
        FROM drain_source
        WHERE 
        dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmDrainSource: (id, callback) => {
    return pool.query(
      format("DELETE FROM drain_source where pk = %L", id),
      [],
      callback
    )
  },
  searchDrainSource: (values, callback) => {
    return pool.query(
      `SELECT * FROM drain_source
      where src_desc = $1 and dairy_id = $2`,
      values,
      callback
    )
  },

  insertDrainAnalysis: (values, callback) => {
    const isValid = validDrainAnalysis(values)
    if (isValid.code !== '0') {
      callback(isValid)
      return
    }

    return pool.query(
      format(`INSERT INTO drain_analysis(
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
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getDrainAnalysis: (dairy_id, callback) => {
    return pool.query(
      format(
        // nitrateN, totalP, totalK, totalTDS
        `SELECT *
        FROM drain_analysis da
        JOIN drain_source ds
        ON ds.pk = da.drain_source_id
        WHERE 
        da.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmDrainAnalysis: (id, callback) => {
    return pool.query(
      format("DELETE FROM drain_analysis where pk = %L", id),
      [],
      callback
    )
  },



  insertExportHauler: (values, callback) => {
    return pool.query(
      format(`INSERT INTO export_hauler(
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
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getExportHauler: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT *
        FROM export_hauler
        WHERE 
        dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmExportHauler: (id, callback) => {
    return pool.query(
      format("DELETE FROM export_hauler where pk = %L", id),
      [],
      callback
    )
  },
  searchExportHauler: (values, callback) => {

    return pool.query(
      `SELECT * FROM export_hauler
      where title = $1 and first_name = $2 and primary_phone = $3 and street = $4 and city_zip = $5 and dairy_id = $6`,
      values,
      callback
    )
  },

  insertExportContact: (values, callback) => {
    return pool.query(
      format(`INSERT INTO export_contact(
        dairy_id,
        first_name,
        primary_phone
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getExportContact: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT *
        FROM export_contact
        WHERE 
        dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmExportContact: (id, callback) => {
    return pool.query(
      format("DELETE FROM export_contact where pk = %L", id),
      [],
      callback
    )
  },
  searchExportContact: (values, callback) => {

    return pool.query(
      `SELECT * FROM export_contact
      where first_name = $1 and primary_phone = $2 and dairy_id = $3`,
      values,
      callback
    )
  },

  insertExportRecipient: (values, callback) => {
    return pool.query(
      format(`INSERT INTO export_recipient(
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
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getExportRecipient: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT *
        FROM export_recipient
        WHERE 
        dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmExportRecipient: (id, callback) => {
    return pool.query(
      format("DELETE FROM export_recipient where pk = %L", id),
      [],
      callback
    )
  },
  searchExportRecipient: (values, callback) => {

    return pool.query(
      `SELECT * FROM export_recipient
      where title = $1 and street = $2 and city_zip = $3 and primary_phone=$4 and dairy_id = $5`,
      values,
      callback
    )
  },

  insertExportDest: (values, callback) => {
    return pool.query(
      format(`INSERT INTO export_dest(
        dairy_id,
        export_recipient_id,

        pnumber,
        street,
        cross_street,
        county,
        city,
        city_state,
        city_zip
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getExportDest: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT 
        
        ed.pk,
        ed.pnumber,
        ed.street,
        ed.cross_street,
        ed.county,
        ed.city,
        ed.city_state,
        ed.city_zip,
        
        er.dest_type,
        er.title,
        er.primary_phone,
        er.street as recipient_street,
        er.cross_street as recipient_cross_street,
        er.county as recipient_county,
        er.city as recipient_city,
        er.city_state as recipient_city_state,
        er.city_zip as recipient_city_zip


        FROM export_dest ed

        JOIN export_recipient er
        ON er.pk =  ed.export_recipient_id

        

        WHERE 
        ed.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmExportDest: (id, callback) => {
    return pool.query(
      format("DELETE FROM export_dest where pk = %L", id),
      [],
      callback
    )
  },
  searchExportDest: (values, callback) => {
    return pool.query(
      `SELECT * FROM export_dest
      where export_recipient_id = $1 and pnumber = $2 and street = $3 and city_zip=$4 and dairy_id = $5`,
      values,
      callback
    )
  },



  insertExportManifest: (values, callback) => {
    const isValid = validExportManifest(values)
    if (isValid.code !== '0') {
      callback(isValid)
      return
    }

    return pool.query(
      format(`INSERT INTO export_manifest(
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

        kn_con_mg_l,
        nh4_con_mg_l,
        nh3_con_mg_l,
        no3_con_mg_l,
        p_con_mg_l,
        k_con_mg_l,
        ec_umhos_cm,
        tds
      
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getExportManifest: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT 
        em.pk,
        em.last_date_hauled,
        em.amount_hauled,
        em.material_type,
        em.amount_hauled_method,
        em.reporting_method, 
        em.moisture,
        em.n_con_mg_kg,
        em.p_con_mg_kg,
        em.k_con_mg_kg,

       
        em.tfs,
        


        em.ec_umhos_cm,
        em.salt_lbs_rm,
        em.n_lbs_rm,
        em.p_lbs_rm,
        em.k_lbs_rm,
        
        em.kn_con_mg_l,
        em.nh4_con_mg_l,
        em.nh3_con_mg_l,
        em.no3_con_mg_l,
        em.p_con_mg_l,
        em.k_con_mg_l,
        em.tds,

        ed.pnumber,
        ed.street as dest_street,
        ed.cross_street as dest_cross_street,
        ed.county as dest_county,
        ed.city as dest_city,
        ed.city_state as dest_city_state,
        ed.city_zip as dest_city_zip,

        er.pk as recipient_id,
        er.dest_type,
        er.title as recipient_title,
        er.primary_phone as recipient_primary_phone,
        er.street as recipient_street,
        er.cross_street as recipient_cross_street,
        er.county as recipient_county,
        er.city as recipient_city,
        er.city_state as recipient_city_state,
        er.city_zip as recipient_city_zip,

        ec.first_name as contact_first_name,
        ec.primary_phone as contact_primary_phone,

        op.title as operator_title,
        op.primary_phone as operator_primary_phone,
        op.secondary_phone as operator_secondary_phone,
        op.street as operator_street,
        op.city as operator_city, 
        op.city_state as operator_city_state,
        op.city_zip as operator_city_zip,
        op.is_owner as operator_is_owner,
        op.is_responsible as operator_is_responsible,

        eh.title as hauler_title,
        eh.first_name as hauler_first_name,
        eh.primary_phone as hauler_primary_phone,
        eh.street as hauler_street,
        eh.cross_street as hauler_cross_street,
        eh.county as hauler_county,
        eh.city as hauler_city,
        eh.city_state as hauler_city_state,
        eh.city_zip as hauler_city_zip

        FROM export_manifest em

        JOIN export_contact ec
        ON ec.pk = em.export_contact_id
        
        JOIN operators op
        ON op.pk = em.operator_id
        
        JOIN export_dest ed
        ON ed.pk = em.export_dest_id
        
        JOIN export_recipient er
        ON er.pk = ed.export_recipient_id

        JOIN export_hauler eh
        ON eh.pk = em.export_hauler_id


        WHERE 
        em.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  getExportManifestByWastewater: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT 
        em.pk,
        em.last_date_hauled,
        em.amount_hauled,
        em.material_type,
        em.amount_hauled_method,
        em.reporting_method, 
        em.moisture,
        em.n_con_mg_kg,
        em.p_con_mg_kg,
        em.k_con_mg_kg,
        em.tfs,


        em.ec_umhos_cm,
        em.salt_lbs_rm,
        em.n_lbs_rm,
        em.p_lbs_rm,
        em.k_lbs_rm,
        
        em.kn_con_mg_l,
        em.nh4_con_mg_l,
        em.nh3_con_mg_l,
        em.no3_con_mg_l,
        em.p_con_mg_l,
        em.k_con_mg_l,
        em.tds,

        ed.pnumber,
        ed.street as dest_street,
        ed.cross_street as dest_cross_street,
        ed.county as dest_county,
        ed.city as dest_city,
        ed.city_state as dest_city_state,
        ed.city_zip as dest_city_zip,

        er.pk as recipient_id,
        er.dest_type,
        er.title as recipient_title,
        er.primary_phone as recipient_primary_phone,
        er.street as recipient_street,
        er.cross_street as recipient_cross_street,
        er.county as recipient_county,
        er.city as recipient_city,
        er.city_state as recipient_city_state,
        er.city_zip as recipient_city_zip,

        ec.first_name as contact_first_name,
        ec.primary_phone as contact_primary_phone,

        op.title as operator_title,
        op.primary_phone as operator_primary_phone,
        op.secondary_phone as operator_secondary_phone,
        op.street as operator_street,
        op.city as operator_city, 
        op.city_state as operator_city_state,
        op.city_zip as operator_city_zip,
        op.is_owner as operator_is_owner,
        op.is_responsible as operator_is_responsible,

        eh.title as hauler_title,
        eh.first_name as hauler_first_name,
        eh.primary_phone as hauler_primary_phone,
        eh.street as hauler_street,
        eh.cross_street as hauler_cross_street,
        eh.county as hauler_county,
        eh.city as hauler_city,
        eh.city_state as hauler_city_state,
        eh.city_zip as hauler_city_zip

        FROM export_manifest em

        JOIN export_contact ec
        ON ec.pk = em.export_contact_id
        
        JOIN operators op
        ON op.pk = em.operator_id
        
        JOIN export_dest ed
        ON ed.pk = em.export_dest_id
        
        JOIN export_recipient er
        ON er.pk = ed.export_recipient_id

        JOIN export_hauler eh
        ON eh.pk = em.export_hauler_id


        WHERE 
        em.material_type ILIKE 'Process%' and
        em.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  getExportManifestByMaterialType: (values, callback) => {
    return pool.query(

      `SELECT 
        em.pk,
        em.last_date_hauled,
        em.amount_hauled,
        em.material_type,
        em.amount_hauled_method,
        em.reporting_method, 
        em.moisture,
        em.n_con_mg_kg,
        em.p_con_mg_kg,
        em.k_con_mg_kg,
        
        em.tfs,


        em.ec_umhos_cm,
        em.salt_lbs_rm,
        em.n_lbs_rm,
        em.p_lbs_rm,
        em.k_lbs_rm,
        
        em.kn_con_mg_l,
        em.nh4_con_mg_l,
        em.nh3_con_mg_l,
        em.no3_con_mg_l,
        em.p_con_mg_l,
        em.k_con_mg_l,
        em.tds,

        ed.pnumber,
        ed.street as dest_street,
        ed.cross_street as dest_cross_street,
        ed.county as dest_county,
        ed.city as dest_city,
        ed.city_state as dest_city_state,
        ed.city_zip as dest_city_zip,

        er.pk as recipient_id,
        er.dest_type,
        er.title as recipient_title,
        er.primary_phone as recipient_primary_phone,
        er.street as recipient_street,
        er.cross_street as recipient_cross_street,
        er.county as recipient_county,
        er.city as recipient_city,
        er.city_state as recipient_city_state,
        er.city_zip as recipient_city_zip,

        ec.first_name as contact_first_name,
        ec.primary_phone as contact_primary_phone,

        op.title as operator_title,
        op.primary_phone as operator_primary_phone,
        op.secondary_phone as operator_secondary_phone,
        op.street as operator_street,
        op.city as operator_city, 
        op.city_state as operator_city_state,
        op.city_zip as operator_city_zip,
        op.is_owner as operator_is_owner,
        op.is_responsible as operator_is_responsible,

        eh.title as hauler_title,
        eh.first_name as hauler_first_name,
        eh.primary_phone as hauler_primary_phone,
        eh.street as hauler_street,
        eh.cross_street as hauler_cross_street,
        eh.county as hauler_county,
        eh.city as hauler_city,
        eh.city_state as hauler_city_state,
        eh.city_zip as hauler_city_zip

        FROM export_manifest em

        JOIN export_contact ec
        ON ec.pk = em.export_contact_id
        
        JOIN operators op
        ON op.pk = em.operator_id
        
        JOIN export_dest ed
        ON ed.pk = em.export_dest_id
        
        JOIN export_recipient er
        ON er.pk = ed.export_recipient_id

        JOIN export_hauler eh
        ON eh.pk = em.export_hauler_id


        WHERE 
        em.material_type ILIKE $1 and
        em.dairy_id = $2
        `,
      values,
      callback
    )
  },
  rmExportManifest: (id, callback) => {
    return pool.query(
      format("DELETE FROM export_manifest where pk = %L", id),
      [],
      callback
    )
  },

  insertDischarge: (values, callback) => {
    return pool.query(
      format(`INSERT INTO discharge(
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
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getDischarge: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT *
        FROM discharge
        WHERE 
        dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmDischarge: (id, callback) => {
    return pool.query(
      format("DELETE FROM discharge where pk = %L", id),
      [],
      callback
    )
  },

  insertAgreement: (values, callback) => {
    return pool.query(
      format(`INSERT INTO agreement(
        dairy_id,
        nmp_updated,
        nmp_developed,
        nmp_approved,
        new_agreements
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getAgreement: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT *
        FROM agreement
        WHERE 
        dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmAgreement: (id, callback) => {
    return pool.query(
      format("DELETE FROM agreement where pk = %L", id),
      [],
      callback
    )
  },
  updateAgreement: (values, callback) => {
    return pool.query(`UPDATE agreement SET
      nmp_updated = $1,
      nmp_developed = $2,
      nmp_approved = $3,
      new_agreements = $4
      WHERE pk=$5`,
      values,
      callback
    )
  },


  insertNote: (values, callback) => {
    return pool.query(
      format(`INSERT INTO note(
        dairy_id,
        note
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getNote: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT *
        FROM note
        WHERE 
        dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmNote: (id, callback) => {
    return pool.query(
      format("DELETE FROM note where pk = %L", id),
      [],
      callback
    )
  },
  updateNote: (values, callback) => {
    return pool.query(`UPDATE note SET
      note = $1
      WHERE pk=$2`,
      values,
      callback
    )
  },


  insertCertification: (values, callback) => {
    return pool.query(
      format(`INSERT INTO certification(
        dairy_id,
        owner_id,
        operator_id,
        responsible_id
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getCertification: (dairy_id, callback) => {
    return pool.query(
      format(
        `SELECT 
        c.pk,
        c.owner_id,
        c.operator_id,
        c.responsible_id,
        owner.title as ownertitle,
        operator.title as operatortitle

        FROM certification c

        JOIN operators owner
        ON owner.pk = c.owner_id
        
        JOIN operators operator
        ON operator.pk = c.operator_id

  

        WHERE 
        c.dairy_id = %L
        `, dairy_id),
      [],
      callback
    )
  },
  rmCertification: (id, callback) => {
    return pool.query(
      format("DELETE FROM certification where pk = %L", id),
      [],
      callback
    )
  },
  updateCertification: (values, callback) => {
    return pool.query(`UPDATE certification SET
      owner_id = $1,
      operator_id = $2,
      responsible_id = $3
      WHERE pk=$4`,
      values,
      callback
    )
  },
  searchCertification: (values, callback) => {
    return pool.query(
      `SELECT 
      c.pk,
      c.owner_id,
      c.operator_id,
      c.responsible_id,
    
      owner.title as ownertitle,
      operator.title as operatortitle

      FROM certification c

      JOIN operators owner
      ON owner.pk = c.owner_id
      
      JOIN operators operator
      ON operator.pk = c.operator_id

      where c.dairy_id = $1`,
      values,
      callback
    )
  },


  rmAllFieldCrop: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllFieldCropHarvest: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_harvest where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllFieldCropApp: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllFieldCropAppProcessWastewaterAnalysis: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_process_wastewater_analysis where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllFieldCropAppProcessWastewater: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_process_wastewater where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllFieldCropAppFreshwaterSource: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_freshwater_source where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllFieldCropAppFreshwaterAnalysis: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_freshwater_analysis where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllFieldCropAppFreshwater: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_freshwater where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllFieldCropAppSolidmanureAnalysis: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_solidmanure_analysis where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllFieldCropAppSolidmanure: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_solidmanure where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllNutrientImport: (id, callback) => {
    return pool.query(
      format("DELETE FROM nutrient_import where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllFieldCropAppFertilizer: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_fertilizer where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllFieldCropAppSoilAnalysis: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_soil_analysis where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllFieldCropAppSoil: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_soil where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmAllFieldCropAppPlowdownCredit: (id, callback) => {
    return pool.query(
      format("DELETE FROM field_crop_app_plowdown_credit where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmExportContact: (id, callback) => {
    return pool.query(
      format("DELETE FROM export_contact where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmExportHauler: (id, callback) => {
    return pool.query(
      format("DELETE FROM export_hauler where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmExportRecipient: (id, callback) => {
    return pool.query(
      format("DELETE FROM export_recipient where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmExportDest: (id, callback) => {
    return pool.query(
      format("DELETE FROM export_dest where dairy_id = %L", id),
      [],
      callback
    )
  },
  rmExportManifest: (id, callback) => {
    return pool.query(
      format("DELETE FROM export_manifest where dairy_id = %L", id),
      [],
      callback
    )
  }



}

const resetDB = (pool) => {
  return new Promise((resolve, reject) => {
    pool.query(`DO $$ DECLARE
      r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `, [], (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

const createSchema = (pool) => {
  return new Promise((resolve, reject) => {
    let createSql = fs.readFileSync('./server/db/create.sql').toString();
    let createCropsSql = fs.readFileSync('./server/db/create_crops.sql').toString();
    let createAccountsSql = fs.readFileSync('./server/db/create_accounts.sql').toString();

    pool.query(createSql, [], (err, res) => {
      if (!err) {
        pool.query(createCropsSql, [], (err, res) => {
          if (err) {
            reject(err)
          } else {
            pool.query(createAccountsSql, [], (err, res) => {
              if (err) {
                reject(err)
              } else {
                resolve(res)
              }
            })
          }
        })
      } else {
        reject(err)
      }
    })
  })
}

const createBaseDairy = async (title) => {
  return new Promise((resolve, reject) => {

    insertDairyBase([title], (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}


const createDairy = async (title) => {
  return new Promise((resolve, reject) => {

    insertDairy([1, title, '2020', '01/01/2020', '12/31/2020'], (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

const createHerds = async () => {
  return new Promise((resolve, reject) => {
    /*
      milk_cows = $1,
        dry_cows = $2,
        bred_cows = $3,
        cows = $4,
        calf_young = $5,
        calf_old = $6,
        p_breed = $7,
        p_breed_other = $8
        WHERE pk=$9`,
     */
    const updateData = [
      [1, 1, 2, 1, 1, 1],
      [1, 1, 2, 1, 5000],
      [1, 1, 2, 1, 1],
      [1, 1, 2, 1, 1],
      [1, 1, 2, 1],
      [1, 1, 2, 1],
      "Ayrshire",
      "",
      1
    ]

    insertHerd([1], (err, res) => {
      if (err) {
        reject(err)
      } else {
        updateHerd(updateData, (err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res)
          }
        })
      }
    })
  })
}


const initTestDB = async (pool) => {
  try {
    const res = await resetDB(pool)
    const res1 = await createSchema(pool)
    const res2 = await createBaseDairy("Pharmaz")
    const res3 = await createDairy('Pharmaz')
    const res4 = await createHerds()


    console.log("Success init test DB.")
  } catch (e) {
    console.log("Error init test DB.", e)
  }
}

if (TESTING) {
  // sudo kill -9 $(sudo lsof -t -i:3001)
  initTestDB(pool)
}