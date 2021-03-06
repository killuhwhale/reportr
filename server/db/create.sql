--- db: reportrr, user: admin, pass 

-- Clear DB COMMAND :) 

-- DO $$ DECLARE
--     r RECORD;
-- BEGIN
--     FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
--         EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
--     END LOOP;
-- END $$;


CREATE EXTENSION IF NOT EXISTS hstore;
-- Query 
CREATE TABLE IF NOT EXISTS dairy_base(
  pk SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULl,
  title VARCHAR(100) NOT NULL,
  UNIQUE(title),
  CONSTRAINT fk_company
    FOREIGN KEY(company_id)
    REFERENCES companies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);


-- CREATE TABLE IF NOT EXISTS parcel_base(
--   pk SERIAL PRIMARY KEY,
--   pnumber VARCHAR(16) NOT NULL,
--   dairy_base_id INT NOT NULL,
--   UNIQUE(pnumber, dairy_id),
--   CONSTRAINT fk_dairy
--     FOREIGN KEY(dairy_id) 
-- 	  REFERENCES dairies(pk)
--     ON UPDATE CASCADE ON DELETE CASCADE
-- );


-- CREATE TABLE IF NOT EXISTS operator_base(
--   pk SERIAL PRIMARY KEY,
--   dairy_base_id INT NOT NULL,
--   title VARCHAR(50) NOT NULL,
--   primary_phone VARCHAR(40),
--   secondary_phone VARCHAR(40),
--   street VARCHAR(100),
--   city VARCHAR(30),
--   city_state VARCHAR(3) DEFAULT 'CA',
--   city_zip VARCHAR(20) ,
--   is_owner BOOLEAN default 'f',
--   is_operator BOOLEAN default 'f',
--   is_responsible BOOLEAN default 'f', -- responsible for paying permit fees.

--   UNIQUE(dairy_id, title, primary_phone),
--   CONSTRAINT fk_dairy
--     FOREIGN KEY(dairy_id) 
-- 	  REFERENCES dairies(pk)
--     ON UPDATE CASCADE ON DELETE CASCADE
-- );


CREATE TABLE IF NOT EXISTS dairies(
  pk SERIAL PRIMARY KEY,
  dairy_base_id INT NOT NULL,
  reporting_yr SMALLINT DEFAULT 2021,
  period_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  period_end TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  street VARCHAR(100) DEFAULT '',
  cross_street VARCHAR(50) DEFAULT '',
  county VARCHAR(30),
  city VARCHAR(30) DEFAULT '',
  city_state VARCHAR(3) DEFAULT 'CA',
  city_zip VARCHAR(20) DEFAULT '',
  title VARCHAR(100) NOT NULL,
  basin_plan VARCHAR(50),
  
  began timestamp DEFAULT NOW(),
  UNIQUE(dairy_base_id, reporting_yr),
  CONSTRAINT fk_dairy_base
    FOREIGN KEY(dairy_base_id) 
	  REFERENCES dairy_base(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fields(
  pk SERIAL PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  acres NUMERIC(6,2),
  cropable NUMERIC(6,2),
  dairy_id INT NOT NULL,
  UNIQUE(title, dairy_id),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS parcels(
  pk SERIAL PRIMARY KEY,
  pnumber VARCHAR(16) NOT NULL,
  dairy_id INT NOT NULL,
  UNIQUE(pnumber, dairy_id),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS field_parcel(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_id INT NOT NULL,
  parcel_id INT NOT NULL,
  UNIQUE(dairy_id, field_id, parcel_id),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field
    FOREIGN KEY(field_id) 
	  REFERENCES fields(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_parcel
    FOREIGN KEY(parcel_id) 
	  REFERENCES parcels(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Owner information all persons here are operators, if they are operator and owner, they get is_owner flag.
CREATE TABLE IF NOT EXISTS operators(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  title VARCHAR(50) NOT NULL,
  primary_phone VARCHAR(40),
  secondary_phone VARCHAR(40),
  street VARCHAR(100),
  city VARCHAR(30),
  city_state VARCHAR(3) DEFAULT 'CA',
  city_zip VARCHAR(20) ,
  is_owner BOOLEAN default 'f',
  is_operator BOOLEAN default 'f',
  is_responsible BOOLEAN default 'f', -- responsible for paying permit fees.

  UNIQUE(dairy_id, title, primary_phone),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS herds(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  p_breed VARCHAR(50) DEFAULT '',
  p_breed_other VARCHAR(50) DEFAULT '',
  milk_cows INT[] DEFAULT '{0,0,0,0,0,0}', -- open confinement, under roof, max number, avg, number, avg wt
  dry_cows INT[] DEFAULT '{0,0,0,0,0}',
  bred_cows INT[] DEFAULT '{0,0,0,0,0}',
  cows INT[] DEFAULT '{0,0,0,0,0}',
  calf_young INT[] DEFAULT '{0,0,0,0}',
  calf_old INT[] DEFAULT '{0,0,0,0}', -- open confinement, under roof, max, avg, avg live weight, 
  UNIQUE(dairy_id),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
     ON UPDATE CASCADE ON DELETE CASCADE
);

-- n p k salt values are from dude's table which are converted from merced.app reference link 
-- https://apps.co.merced.ca.us/dwnm/pages/help/CropTypeHelp2.aspx
-- Ex: n == lbs of nitrogen per pound of crop (harvested, anticipated)
-- Looks like default data for all Dairies. Also editable and extendable
-- V1.0.0 will just have data, which will be used in selects when selecting crops
CREATE TABLE IF NOT EXISTS crops(
  pk SERIAL PRIMARY KEY,
  title VARCHAR(30),
  typical_yield INT,-- tons, pg 44 annual report, Anticipated removal == typical_yield * [n,p,k] * 2; [n,p,k]*2 is the lbs/ton yield.
  moisture INT, -- stored as a percent 10 == 10%
  n NUMERIC(10,3), -- stored as a raw value e.g 0.0175 == 1.75%, basica default (percet in standard form, lbs/tons)
  p NUMERIC(10,3), 
  k NUMERIC(10,3),
  salt NUMERIC(10,3),
  UNIQUE(title)
);

CREATE TABLE IF NOT EXISTS field_crop(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_id INT NOT NULL,
  crop_id INT NOT NULL,
  plant_date timestamp,
  acres_planted NUMERIC(12,2),
  typical_yield NUMERIC(12,2), -- tons/ acre 
  
  -- TODO() Typical data copied from crops, consider dropping this and using crop_id to get info instead.
  moisture NUMERIC(6,2), -- stored as a percent 10 == 10%
  n NUMERIC(10,3), -- Concentration by default data, lb/ton 
  p NUMERIC(10,3), 
  k NUMERIC(10,3),
  salt NUMERIC(10,3),
  UNIQUE(dairy_id, field_id, crop_id, plant_date),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field
    FOREIGN KEY(field_id) 
    REFERENCES fields(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_crop
    FOREIGN KEY(crop_id) 
	  REFERENCES crops(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Harvests
CREATE TABLE IF NOT EXISTS field_crop_harvest(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_crop_id INT NOT NULL,
  sample_date timestamp NOT NULL,
  harvest_date timestamp NOT NULL,
  expected_yield_tons_acre NUMERIC(12,2) NOT NULL,
  method_of_reporting VARCHAR(20)  NOT NULL, -- reporting method
  actual_yield NUMERIC(6,2)  NOT NULL, -- tons -- calculate to find tons/ acres by field_crop.acres_planted 
  src_of_analysis VARCHAR(50) NOT NULL, -- plant tissue analysis
  -- Actual concentrations
  moisture NUMERIC(5,2), -- Percent range 0.01 -> 100.00
  n NUMERIC(5,3) DEFAULT 0.0, -- Percent .001 -> 99.999 
  p NUMERIC(5,3) DEFAULT 0.0,  
  k NUMERIC(5,3) DEFAULT 0.0,  
  tfs NUMERIC(5,2) DEFAULT 0.0,
  n_dl NUMERIC(8,2) DEFAULT 100, -- detection limit mg/kg .01 -> 999,999.99
  p_dl NUMERIC(8,2) DEFAULT 100,
  k_dl NUMERIC(8,2) DEFAULT 100,
  tfs_dl NUMERIC(5,2) DEFAULT 0.01, -- DL % - 0.01 -> 100.00 
  UNIQUE(dairy_id, field_crop_id, harvest_date),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field_crop
    FOREIGN KEY(field_crop_id) 
	  REFERENCES field_crop(pk)
    ON UPDATE CASCADE ON DELETE CASCADE

);


CREATE TABLE IF NOT EXISTS field_crop_app(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_crop_id INT NOT NULL,
  app_date timestamp,
  app_method VARCHAR(150),
  precip_before VARCHAR(50),
  precip_during VARCHAR(50),
  precip_after VARCHAR(50),
  UNIQUE(dairy_id, field_crop_id, app_date, app_method), -- TODO() Need to update to include app_method, affects searching for lazyget since it look searches by unique fields.
  -- If a field receives a Commerical Fertilizer and Freshwater on the same day, they will have different App_methods and both should be created. CLARIFY
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field_crop
    FOREIGN KEY(field_crop_id) 
	  REFERENCES field_crop(pk)
    ON UPDATE CASCADE ON DELETE CASCADE

);


CREATE TABLE IF NOT EXISTS field_crop_app_process_wastewater_analysis(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  sample_date TIMESTAMP NOT NULL,
  sample_desc VARCHAR(100) NOT NULL,
  sample_data_src VARCHAR(100),
  material_type VARCHAR(150),
  kn_con NUMERIC(8,2) DEFAULT 0.0,
  nh4_con NUMERIC(8,2) DEFAULT 0.0, 
  nh3_con NUMERIC(8,2) DEFAULT 0.0, 
  no3_con NUMERIC(8,2) DEFAULT 0.0, 
  p_con NUMERIC(8,2) DEFAULT 0.0, 
  k_con NUMERIC(8,2) DEFAULT 0.0, 
  ca_con NUMERIC(8,2) DEFAULT 0.0, 
  mg_con NUMERIC(8,2) DEFAULT 0.0, 
  na_con NUMERIC(8,2) DEFAULT 0.0, 
  hco3_con NUMERIC(8,2) DEFAULT 0.0, 
  co3_con NUMERIC(8,2) DEFAULT 0.0, 
  so4_con NUMERIC(8,2) DEFAULT 0.0, 
  cl_con NUMERIC(8,2) DEFAULT 0.0, 
  ec NUMERIC(5,0) DEFAULT 0.0, 
  tds NUMERIC(8,2) DEFAULT 0.0, 
  kn_dl NUMERIC(8,2) DEFAULT 0.0, 
  nh4_dl NUMERIC(8,2) DEFAULT 0.0, 
  nh3_dl NUMERIC(8,2) DEFAULT 0.0, 
  no3_dl NUMERIC(8,2) DEFAULT 0.0, 
  p_dl NUMERIC(8,2) DEFAULT 0.0, 
  k_dl NUMERIC(8,2) DEFAULT 0.0, 
  ca_dl NUMERIC(8,2) DEFAULT 0.0, 
  mg_dl NUMERIC(8,2) DEFAULT 0.0, 
  na_dl NUMERIC(8,2) DEFAULT 0.0, 
  hco3_dl NUMERIC(8,2) DEFAULT 0.0, 
  co3_dl NUMERIC(8,2) DEFAULT 0.0, 
  so4_dl NUMERIC(8,2) DEFAULT 0.0, 
  cl_dl NUMERIC(8,2) DEFAULT 0.0, 

  ec_dl NUMERIC(7,2) DEFAULT 1, -- micro/cm   0.01 -> 99,999.99
  tds_dl NUMERIC(5,0) DEFAULT 10, -- 1 -> 20,000
  ph NUMERIC(4,2), -- 0.00 -> 14.00
  UNIQUE(dairy_id, sample_date, sample_desc),
  
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE

);
CREATE TABLE IF NOT EXISTS field_crop_app_process_wastewater(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_crop_app_id INT NOT NULL,
  field_crop_app_process_wastewater_analysis_id INT NOT NULL,
  app_desc VARCHAR(150),
  amount_applied INT,
  UNIQUE(dairy_id, field_crop_app_id, amount_applied),
  -- From sheet, precalcualted, and is used in Annual Report Table.

  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field_crop_app
    FOREIGN KEY(field_crop_app_id) 
	  REFERENCES field_crop_app(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field_crop_app_process_wastewater_analysis
    FOREIGN KEY(field_crop_app_process_wastewater_analysis_id) 
	  REFERENCES field_crop_app_process_wastewater_analysis(pk)
    ON UPDATE CASCADE ON DELETE CASCADE

);


-- Source
CREATE TABLE IF NOT EXISTS field_crop_app_freshwater_source(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  src_desc VARCHAR(50) NOT NULL,
  src_type VARCHAR(50) NOT NULL,
  UNIQUE(dairy_id, src_desc, src_type),
   CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS field_crop_app_freshwater_analysis(
   pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  fresh_water_source_id INT NOT NULL,
  sample_date TIMESTAMP NOT NULL,
  
  sample_desc VARCHAR(50) NOT NULL,
  src_of_analysis VARCHAR(50) NOT NULL,
  n_con NUMERIC(8,2) DEFAULT 0.0,
  nh4_con NUMERIC(8,2) DEFAULT 0.0, 
  no2_con NUMERIC(8,2) DEFAULT 0.0,
  ca_con NUMERIC(8,2) DEFAULT 0.0,
  mg_con NUMERIC(8,2) DEFAULT 0.0,
  na_con NUMERIC(8,2) DEFAULT 0.0,
  hco3_con NUMERIC(8,2) DEFAULT 0.0,
  co3_con NUMERIC(8,2) DEFAULT 0.0,
  so4_con NUMERIC(8,2) DEFAULT 0.0,
  cl_con NUMERIC(8,2) DEFAULT 0.0,
  ec NUMERIC(7,2) DEFAULT 0.0, 
  tds NUMERIC(5,0) DEFAULT 0.0,
  n_dl NUMERIC(8,2) DEFAULT 0.5, -- mg/ L 
  nh4_dl NUMERIC(8,2) DEFAULT 0.5, 
  no2_dl NUMERIC(8,2) DEFAULT 0.5,
  ca_dl NUMERIC(8,2) DEFAULT 0.5,
  mg_dl NUMERIC(8,2) DEFAULT 0.5,
  na_dl NUMERIC(8,2) DEFAULT 0.5,
  hco3_dl NUMERIC(8,2) DEFAULT 0.5,
  co3_dl NUMERIC(8,2) DEFAULT 0.5,
  so4_dl NUMERIC(8,2) DEFAULT 0.5, 
  cl_dl NUMERIC(8,2) DEFAULT 0.5,
  ec_dl NUMERIC(7,2) DEFAULT 1, -- micro/cm
  tds_dl NUMERIC(5,0) DEFAULT 10, -- 
  UNIQUE(dairy_id, fresh_water_source_id, sample_date, sample_desc, src_of_analysis),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
    REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_fresh_water_source
    FOREIGN KEY(fresh_water_source_id) 
    REFERENCES field_crop_app_freshwater_source(pk)
    ON UPDATE CASCADE ON DELETE CASCADE

);
CREATE TABLE IF NOT EXISTS field_crop_app_freshwater(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_crop_app_id INT NOT NULL,
  field_crop_app_freshwater_analysis_id INT NOT NULL,
  
  app_rate NUMERIC(12,3),
  run_time NUMERIC(9,3),
  amount_applied NUMERIC(15,3) NOT NULL,
  amt_applied_per_acre NUMERIC(12,3),

  UNIQUE(dairy_id, field_crop_app_id, field_crop_app_freshwater_analysis_id),

  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field_crop_app
    FOREIGN KEY(field_crop_app_id) 
	  REFERENCES field_crop_app(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field_crop_app_freshwater_analysis
    FOREIGN KEY(field_crop_app_freshwater_analysis_id) 
	  REFERENCES field_crop_app_freshwater_analysis(pk)
    ON UPDATE CASCADE ON DELETE CASCADE

);


CREATE TABLE IF NOT EXISTS field_crop_app_solidmanure_analysis(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  sample_desc VARCHAR(50) NOT NULL,
  sample_date TIMESTAMP NOT NULL,
  -- Material Types: separator solids, corral solids, Scraped material, bedding, compost
  material_type VARCHAR(100) NOT NULL,
  src_of_analysis VARCHAR(50) NOT NULL,
  moisture NUMERIC(5,2) NOT NULL,
  method_of_reporting VARCHAR(50) NOT NULL,
  n_con NUMERIC(10,4) DEFAULT 0.0, -- 999,999.99
  p_con NUMERIC(10,4) DEFAULT 0.0,
  k_con NUMERIC(10,4) DEFAULT 0.0,
  ca_con NUMERIC(10,4) DEFAULT 0.0,
  mg_con NUMERIC(10,4) DEFAULT 0.0,
  na_con NUMERIC(10,4) DEFAULT 0.0,
  s_con NUMERIC(10,4) DEFAULT 0.0, -- sulfur
  cl_con NUMERIC(10,4) DEFAULT 0.0,
  tfs NUMERIC(10,4) DEFAULT 0.0, -- total fixed solids
  n_dl NUMERIC(10,4) DEFAULT 100,
  p_dl NUMERIC(10,4) DEFAULT 100,
  k_dl NUMERIC(10,4) DEFAULT 100,
  ca_dl NUMERIC(10,4) DEFAULT 100,
  mg_dl NUMERIC(10,4) DEFAULT 100,
  na_dl NUMERIC(10,4) DEFAULT 100,
  s_dl NUMERIC(10,4) DEFAULT 100, -- sulfur
  cl_dl NUMERIC(10,4) DEFAULT 100,
  tfs_dl NUMERIC(10,4) DEFAULT 0.01, -- %
  UNIQUE(dairy_id, sample_date, sample_desc, src_of_analysis),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
    REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);
-- Dry Manure aka Solid manure 
CREATE TABLE IF NOT EXISTS field_crop_app_solidmanure(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_crop_app_id INT NOT NULL,
  field_crop_app_solidmanure_analysis_id INT NOT NULL,

  src_desc VARCHAR(100) NOT NULL,
  amount_applied NUMERIC(20,2) NOT NULL,
  amt_applied_per_acre NUMERIC(15,2),

  UNIQUE(dairy_id, field_crop_app_id, field_crop_app_solidmanure_analysis_id),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field_crop_app
    FOREIGN KEY(field_crop_app_id) 
	  REFERENCES field_crop_app(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field_crop_app_solidmanure_analysis
    FOREIGN KEY(field_crop_app_solidmanure_analysis_id) 
	  REFERENCES field_crop_app_solidmanure_analysis(pk)
    ON UPDATE CASCADE ON DELETE CASCADE

);


--  Material type will be the key to tying to nutrient applications
-- E.g. commerical fertilizer is an nutrient application that is from a nutrient import.
-- So, we need an entry from here when creating a field_crop_app_fertilizer entry. 
--    We will search this table by material_type=
CREATE TABLE IF NOT EXISTS nutrient_import(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
 
  import_desc VARCHAR(100) NOT NULL,
  import_date TIMESTAMP NOT NULL,
  material_type VARCHAR(100) NOT NULL,
  amount_imported NUMERIC(10,2) NOT NULL,
   -- Commercial fertilizer/ Other: Liquid commercial fertilizer,
  -- Commercial fertilizer/ Other: Solid commercial fertilizer,
  -- Commercial fertilizer/ Other: Other liquid nutrient source,
  -- Commercial fertilizer/ Other: Other solid nutrient source,
  -- Dry manure: Separator solids,
  -- Dry manure: Corral solids,
  -- Dry manure: Scraped material,
  -- Dry manure: Bedding,
  -- Dry manure: Compost,
  -- Process wastewater,
  -- Process wastewater" Process wastewater sludge,
  method_of_reporting VARCHAR(100) NOT NULL,
  moisture  NUMERIC(5,2),
  n_con NUMERIC(8,2),
  p_con NUMERIC(8,2),
  k_con NUMERIC(8,2),
  salt_con NUMERIC(8,2), -- tds for dry manure, x
  
  
  UNIQUE(dairy_id, import_date, material_type, import_desc),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);
-- For the specific upload of Fertilizer app events - nutrient_import is similar to *_analysis and holds the analysis data and amount imported, will be used in AR.pdf in its own section
CREATE TABLE IF NOT EXISTS field_crop_app_fertilizer(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_crop_app_id INT NOT NULL,
  nutrient_import_id INT NOT NULL,

  amount_applied  NUMERIC(10,2), -- not current used in annual report be information is here.
  

  UNIQUE(dairy_id, field_crop_app_id),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field_crop_app
    FOREIGN KEY(field_crop_app_id) 
	  REFERENCES field_crop_app(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_nutrient_import
    FOREIGN KEY(nutrient_import_id) 
	  REFERENCES nutrient_import(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS field_crop_app_soil_analysis(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_id INT NOT NULL,
  sample_desc VARCHAR(50) NOT NULL,
  sample_date TIMESTAMP NOT NULL,
  src_of_analysis VARCHAR(50) NOT NULL,
  n_con NUMERIC(8,2) DEFAULT 0.0, -- 999,999.99    mg/kg
  total_p_con NUMERIC(8,2) DEFAULT 0.0,
  p_con NUMERIC(8,2) DEFAULT 0.0,
  k_con NUMERIC(8,2) DEFAULT 0.0,
  ec NUMERIC(8,2) DEFAULT 0.0,
  org_matter NUMERIC(8,2) DEFAULT 0.0,
  
  n_dl NUMERIC(8,2) DEFAULT 100,
  total_p_dl NUMERIC(8,2) DEFAULT 100,
  p_dl NUMERIC(8,2) DEFAULT 100,
  k_dl NUMERIC(8,2) DEFAULT 100,
  ec_dl NUMERIC(8,2) DEFAULT 0.0,
  org_matter_dl NUMERIC(8,2) DEFAULT 0.0,
  UNIQUE(dairy_id, field_id, sample_date, sample_desc),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
    REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field
    FOREIGN KEY(field_id) 
    REFERENCES fields(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS field_crop_app_soil(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_crop_app_id INT NOT NULL,
  analysis_one INT NOT NULL,
  analysis_two INT NOT NULL,
  analysis_three INT NOT NULL,
  src_desc VARCHAR(50) NOT NULL,
  -- Spreadsheet will have 3 analyses, possibly same one, but we will use them to calculate the totals.
  UNIQUE(dairy_id, field_crop_app_id, src_desc, analysis_one, analysis_two, analysis_three),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
    REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field_crop_app
    FOREIGN KEY(field_crop_app_id) 
    REFERENCES field_crop_app(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS field_crop_app_plowdown_credit(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_crop_app_id INT NOT NULL,
  src_desc VARCHAR(50) NOT NULL,

  n_lbs_acre NUMERIC(5,0), -- 0 -> 10,000
  p_lbs_acre NUMERIC(5,0),
  k_lbs_acre NUMERIC(5,0),
  salt_lbs_acre NUMERIC(5,0),
  UNIQUE(dairy_id, field_crop_app_id, src_desc),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
    REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_field_crop_app
    FOREIGN KEY(field_crop_app_id) 
    REFERENCES field_crop_app(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);




CREATE TABLE IF NOT EXISTS drain_source(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  src_desc VARCHAR(50) NOT NULL,
  UNIQUE(dairy_id, src_desc),
   CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS drain_analysis(
   pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  drain_source_id INT NOT NULL,
  sample_date TIMESTAMP NOT NULL,
  
  sample_desc VARCHAR(50) NOT NULL,
  src_of_analysis VARCHAR(50) NOT NULL,

  nh4_con NUMERIC(8,2) DEFAULT 0.0, 
  no2_con NUMERIC(8,2) DEFAULT 0.0,
  p_con NUMERIC(8,2) DEFAULT 0.0,
  ec NUMERIC(7,2) DEFAULT 0.0, 
  tds NUMERIC(5,0) DEFAULT 0.0,
  nh4_dl NUMERIC(8,2) DEFAULT 0.5, 
  no2_dl NUMERIC(8,2) DEFAULT 0.5,
  p_dl NUMERIC(8,2) DEFAULT 0.5, -- mg/ L 
  ec_dl NUMERIC(7,2) DEFAULT 1, -- micro/cm
  tds_dl NUMERIC(5,0) DEFAULT 10, -- 
  UNIQUE(dairy_id, drain_source_id, sample_date, sample_desc, src_of_analysis),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
    REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_drain_source
    FOREIGN KEY(drain_source_id) 
    REFERENCES drain_source(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);






-- Contact information for export haulers
CREATE TABLE IF NOT EXISTS export_hauler(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  
  title VARCHAR(250) NOT NULL,
  first_name VARCHAR(30),
  primary_phone VARCHAR(20),
  street VARCHAR(100) DEFAULT '' NOT NULL,
  cross_street VARCHAR(50) DEFAULT '',
  county VARCHAR NOT NULL,
  city VARCHAR(30),
  city_state VARCHAR(3) DEFAULT 'CA',
  city_zip VARCHAR(20) NOT NULL,


  UNIQUE(dairy_id, title, first_name, primary_phone, street, city_zip),

  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);
-- Contact of dairy that is exporting (source)
CREATE TABLE IF NOT EXISTS export_contact(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  
  first_name VARCHAR(30) NOT NULL,
  -- last_name VARCHAR(30),
  -- middle_name VARCHAR(30),
  -- suffix_name VARCHAR(10),
  primary_phone VARCHAR(20) NOT NULL,
  
  UNIQUE(dairy_id, first_name, primary_phone),

  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);
-- Contact of recipient
CREATE TABLE IF NOT EXISTS export_recipient(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  
  dest_type VARCHAR(50), -- Broker, Compost Facility, Farmer, Other(describe it )
  title VARCHAR(250) NOT NULL,
  primary_phone VARCHAR(20),
  street VARCHAR(100) DEFAULT '' NOT NULL,
  cross_street VARCHAR(50) DEFAULT '',
  county VARCHAR NOT NULL,
  city VARCHAR(30),
  city_state VARCHAR(3) DEFAULT 'CA',
  city_zip VARCHAR(20) NOT NULL,


  UNIQUE(dairy_id, title, street, city_zip, primary_phone),

  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);
-- Export Destination, Recipient + address OR APN
CREATE TABLE IF NOT EXISTS export_dest(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  export_recipient_id INT NOT NULL,

  pnumber VARCHAR(16),
  street VARCHAR(100) DEFAULT '' NOT NULL,
  cross_street VARCHAR(50) DEFAULT '',
  county VARCHAR NOT NULL,
  city VARCHAR(30),
  city_state VARCHAR(3) DEFAULT 'CA',
  city_zip VARCHAR(20) NOT NULL,


  UNIQUE(dairy_id, export_recipient_id, pnumber, street, city_zip),

  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS export_manifest(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  operator_id INT NOT NULL,
  export_contact_id INT NOT NULL,
  export_hauler_id INT NOT NULL,
  export_dest_id INT NOT NULL, -- ecompasses export_recipient

  last_date_hauled TIMESTAMP NOT NULL,
  amount_hauled INT NOT NULL, -- tons / gals
  material_type VARCHAR(100) NOT NULL,
  amount_hauled_method VARCHAR(2000),
  

  -- For Dry manure
  reporting_method VARCHAR(100), 
  moisture NUMERIC(5,2),
  n_con_mg_kg NUMERIC(10,4),
  p_con_mg_kg NUMERIC(10,4),
  k_con_mg_kg NUMERIC(10,4),
  tfs NUMERIC(7,4),

  salt_lbs_rm NUMERIC(10,2),  -- New, not needed, noticed during validation not in form on merced app
  
  -- For Process wastewater
  kn_con_mg_l NUMERIC(10,4),
  nh4_con_mg_l NUMERIC(10,4),
  nh3_con_mg_l NUMERIC(10,4),
  no3_con_mg_l NUMERIC(10,4),
  p_con_mg_l NUMERIC(10,4),
  k_con_mg_l NUMERIC(10,4),
  ec_umhos_cm NUMERIC(10,4), -- New, not needed, noticed during validation not in form on merced app
  tds NUMERIC(5,0),
  
  
  -- Shared between manure and wastewater -- New, not needed(remove), noticed during validation not in form on merced app
  n_lbs_rm NUMERIC(10,2), 
  p_lbs_rm NUMERIC(10,2),
  k_lbs_rm NUMERIC(10,2),
  UNIQUE(dairy_id, operator_id, export_contact_id, export_dest_id, last_date_hauled, material_type),

  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_operator
    FOREIGN KEY(operator_id) 
	  REFERENCES operators(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_export_contact
    FOREIGN KEY(export_contact_id)
	  REFERENCES export_contact(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_export_dest
    FOREIGN KEY(export_dest_id) 
	  REFERENCES export_dest(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS TSVs(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  data TEXT,
  tsvType VARCHAR(30),
  UNIQUE(dairy_id, tsvType),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS discharge(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,

  discharge_type VARCHAR(50) NOT NULL,
  discharge_datetime TIMESTAMP NOT NULL,
  discharge_loc VARCHAR(250) NOT NULL, 
  vol INT NOT NULL,
  vol_unit VARCHAR(10) NOT NULL,
  duration_of_discharge INT, -- Storm water, in mins.
  discharge_src VARCHAR(100), -- Land app to surface water

  method_of_measuring TEXT NOT NULL,
  sample_location_reason TEXT NOT NULL,
  ref_number VARCHAR(100) NOT NULL,

  UNIQUE(dairy_id, discharge_type, discharge_datetime, discharge_loc),
   CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS agreement(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  nmp_updated BOOLEAN DEFAULT false,
  nmp_developed BOOLEAN DEFAULT false,
  nmp_approved BOOLEAN DEFAULT false,
  new_agreements BOOLEAN DEFAULT false,

  UNIQUE(dairy_id),
   CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS note(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  note TEXT,

  UNIQUE(dairy_id),
   CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS certification(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  owner_id INT,
  operator_id INT,
  responsible_id INT ,

  UNIQUE(dairy_id),
   CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  
  CONSTRAINT fk_owner_id
    FOREIGN KEY(owner_id) 
	  REFERENCES operators(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_operator_id
    FOREIGN KEY(operator_id) 
	  REFERENCES operators(pk)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_responsible_id
    FOREIGN KEY(responsible_id) 
	  REFERENCES operators(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);




  -- These names match TSV Types/ Sheet names but in lowercase and spaceToUnderscore.
 CREATE TABLE setting_templates (
	pk serial primary key,
  dairy_id INT NOT NULL,
  production_records  hstore,
  ww_applications  hstore,
  fw_applications  hstore,
  sm_applications  hstore,
  commercial_fertilizer  hstore,
  soil_analyses  hstore,
  plowdown_credit  hstore,
  tile_drainage_systems  hstore,
  discharges  hstore,
  sm_exports  hstore,
  ww_exports  hstore,
  
   UNIQUE(dairy_id),
   CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE

);



