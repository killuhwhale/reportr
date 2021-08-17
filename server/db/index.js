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
      "SELECT * FROM field_crop_app where field_crop_id = $1 and app_date = $2 and dairy_id = $3",
      values,
      callback
    )
  },

  insertFieldCropApplicationProcessWastewaterAnalysis: (values, callback) => {
    
    
    return pool.query(
      format(`
        INSERT INTO field_crop_app_process_wastewater_analysis( 
          dairy_id, sample_date, sample_desc, sample_data_src, kn_con, nh4_con, nh3_con, no3_con, p_con, k_con, ec, tds, ph 
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
        `SELECT  *
          FROM field_crop_app_process_wastewater_analysis 
          WHERE 
          dairy_id = %L
        `, dairy_id),
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
    
    
    return pool.query(
      format(`INSERT INTO field_crop_app_process_wastewater(
        dairy_id,
        field_crop_app_id,
        field_crop_app_process_wastewater_analysis_id,
        material_type,
        app_desc,
        amount_applied,
        totalN,
        totalP,
        totalK
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
          fcapww.dairy_id,
          fcapww.field_crop_app_id,
          fcapww.field_crop_app_process_wastewater_analysis_id,
          fcapww.material_type,
          fcapww.app_desc,
          fcapww.amount_applied,
          fcapww.totalN,
          fcapww.totalP,
          fcapww.totalK,

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
        tds
        ) VALUES (%L)  RETURNING *`, values),
      [],
      callback
    )
  },
  getFieldCropApplicationFreshwaterAnalysis: (dairy_id, callback) => {
    return pool.query(
      format(
        // nitrateN, totalP, totalK, totalTDS
        `SELECT *
        FROM field_crop_app_freshwater_analysis
        WHERE 
        dairy_id = %L
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
        amt_applied_per_acre,
        totalN
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
          totalN,

          f.title as fieldtitle,
          c.title as croptitle,
          fc.plant_date,

          fca.app_date
        
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
        tfs
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
    return pool.query(
      format(`INSERT INTO field_crop_app_solidmanure(
        dairy_id,
        field_crop_app_id,
        field_crop_app_solidmanure_analysis_id,
        src_desc,
        amount_applied,
        amt_applied_per_acre,
        n_lbs_acre,
        p_lbs_acre,
        k_lbs_acre,
        salt_lbs_acre 
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
        fcasm.src_desc,
        fcasm.amount_applied,
        fcasm.amt_applied_per_acre,
        fcasm.n_lbs_acre,
        fcasm.p_lbs_acre,
        fcasm.k_lbs_acre,
        fcasm.salt_lbs_acre,

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
        c.title as croptitle,
        fc.plant_date,

        fca.app_date
        
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
    return pool.query(
      format(`INSERT INTO field_crop_app_fertilizer(
        dairy_id,
        field_crop_app_id,
        nutrient_import_id,
        amount_applied,
        n_lbs_acre,
        p_lbs_acre,
        k_lbs_acre,
        salt_lbs_acre 
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
        fcaf.amount_applied,
        fcaf.n_lbs_acre,
        fcaf.p_lbs_acre,
        fcaf.k_lbs_acre,
        fcaf.salt_lbs_acre,

        ni.import_desc,
        ni.import_date,
        ni.material_type,
        ni.amount_imported,
        ni.moisture,
        ni.n_con,
        ni.p_con,
        ni.k_con,
        ni.salt_con,

        f.title as fieldtitle,
        c.title as croptitle,
        fc.plant_date,
        fca.app_date
        


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


}

