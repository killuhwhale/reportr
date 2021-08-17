--- db: reportrr, user: admin, pass 
CREATE TABLE IF NOT EXISTS dairies(
  pk SERIAL PRIMARY KEY,
  reporting_yr SMALLINT DEFAULT 2021,
  street VARCHAR(100) DEFAULT '',
  cross_street VARCHAR(50) DEFAULT '',
  county INT DEFAULT 0,
  city VARCHAR(30) DEFAULT '',
  city_state VARCHAR(3) DEFAULT 'CA',
  city_zip VARCHAR(20) DEFAULT '',
  title VARCHAR(30) NOT NULL,
  basin_plan INT DEFAULT 0,
  p_breed INT DEFAULT 0,
  began timestamp DEFAULT NOW(),
  UNIQUE(title, reporting_yr)
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
  primary_phone VARCHAR(15),
  secondary_phone VARCHAR(15),
  street VARCHAR(100),
  city VARCHAR(30),
  city_state VARCHAR(3) DEFAULT 'CA',
  city_zip VARCHAR(20) ,
  is_owner BOOLEAN,
  is_responsible BOOLEAN DEFAULT FALSE, -- responsible for paying permit fees.

  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
);
CREATE TABLE IF NOT EXISTS herds(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
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
  acres_planted NUMERIC(6,2),
  typical_yield NUMERIC(6,2), -- tons/ acre 
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

-- Abandoned... not reused informationn, it is unique to each harvest...
-- CREATE TABLE IF NOT EXISTS plant_tissue_analysis(
--   pk SERIAL PRIMARY KEY,
--   dairy_id INT NOT NULL,
--   sample_date timestamp NOT NULL,  
--   src_of_analysis VARCHAR(50) NOT NULL,
--   method_of_reporting VARCHAR(20), -- reporting method
  
--   moisture NUMERIC(6,2), -- stored as a percent 10 == 10%
--   n_con NUMERIC(8,6), -- Come from lab as a percentage of concentration in mg/kg, divide by .49999899 to convert to lb/ ton conversion factor
--   p_con NUMERIC(8,6),       -- With the conversions factor in lb/ton we can calculate the required Annual report data
--   k_con NUMERIC(8,6),       --    totals for N, P K & Salt == yield(tons/acre) * CF (concentration factor in lb/ton) 
--   tfs_con NUMERIC(8,6), -- total fixed solids
--   UNIQUE(dairy_id, sample_date, src_of_analysis, method_of_reporting, moisture, n_con),
--   CONSTRAINT fk_dairy
--     FOREIGN KEY(dairy_id) 
-- 	  REFERENCES dairies(pk)
--     ON UPDATE CASCADE ON DELETE CASCADE,
--   CONSTRAINT fk_field_crop
--     FOREIGN KEY(field_crop_id) 
-- 	  REFERENCES field_crop(pk)
--     ON UPDATE CASCADE ON DELETE CASCADE

-- );

-- Rename: basis->mehtod_of_reporting, Delete: density
-- Concentration conversion factors:
-- Display mg/kg == x 10,000
-- Display actualy yields == divide by 0.49999899 and then use in the formula
    -- yield(tons/acre) * convertedFactor(lbs/ton) == Totals N, P, K in lbs/acre
CREATE TABLE IF NOT EXISTS field_crop_harvest(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_crop_id INT NOT NULL,
  sample_date timestamp NOT NULL,
  harvest_date timestamp NOT NULL,
  expected_yield_tons_acre NUMERIC(12,2) NOT NULL,
  method_of_reporting VARCHAR(20)  NOT NULL, -- reporting method
  actual_yield NUMERIC(6,2)  NOT NULL, -- tons -- calculate to find tons/ acres by field_crop.acres_planted 
  src_of_analysis VARCHAR(50) NOT NULL,
  moisture NUMERIC(6,2), -- stored as a percent 10 == 10%
  n NUMERIC(8,6), -- Come from lab as a percentage of concentration in mg/kg, divide by .49999899 to convert to lb/ ton conversion factor
  p NUMERIC(8,6),       -- With the conversions factor in lb/ton we can calculate the required Annual report data
  k NUMERIC(8,6),       --    totals for N, P K & Salt == yield(tons/acre) * CF (concentration factor in lb/ton) 
  tfs NUMERIC(8,6), -- total fixed solids,
  n_lbs_acre NUMERIC(12,2),
  p_lbs_acre NUMERIC(12,2),
  k_lbs_acre NUMERIC(12,2),
  salt_lbs_acre NUMERIC(12,2),
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
CREATE TABLE IF NOT EXISTS field_crop_app(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_crop_id INT NOT NULL,
  app_date timestamp,
  app_method VARCHAR(150),
  precip_before VARCHAR(50),
  precip_during VARCHAR(50),
  precip_after VARCHAR(50),
  UNIQUE(dairy_id, field_crop_id, app_date), -- TODO() Need to update to include app_method, affects searching for lazyget since it look searches by unique fields.
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
  kn_con NUMERIC(9,3),
  nh4_con NUMERIC(9,3),
  nh3_con NUMERIC(9,3),
  no3_con NUMERIC(9,3),
  p_con NUMERIC(9,3),
  k_con NUMERIC(9,3),
  ec NUMERIC(9,3),
  tds NUMERIC(9,3),
  ph NUMERIC(9,3),
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
  material_type VARCHAR(150),
  app_desc VARCHAR(150),
  amount_applied INT,
  totalN NUMERIC(9,3), -- lbs/ acre
  totalP NUMERIC(9,3),
  totalK NUMERIC(9,3),
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
  n_con NUMERIC(9,3),
  nh4_con NUMERIC(9,3), 
  no2_con NUMERIC(9,3),
  ca_con NUMERIC(9,3),
  mg_con NUMERIC(9,3),
  na_con NUMERIC(9,3),
  hco3_con NUMERIC(9,3),
  co3_con NUMERIC(9,3),
  so4_con NUMERIC(9,3),
  cl_con NUMERIC(9,3),
  ec NUMERIC(9,3), 
  tds NUMERIC(9,3),
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
  totalN NUMERIC(9,3) NOT NULL,

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
  n_con NUMERIC(9,3),
  p_con NUMERIC(9,3),
  k_con NUMERIC(9,3),
  
  ca_con NUMERIC(9,3),
  mg_con NUMERIC(9,3),
  na_con NUMERIC(9,3),
  s_con NUMERIC(9,3), -- sulfur
  cl_con NUMERIC(9,3),

  tfs NUMERIC(9,3), -- total fixed solids
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
  n_lbs_acre NUMERIC(10,2),
  p_lbs_acre NUMERIC(10,2),
  k_lbs_acre NUMERIC(10,2),
  salt_lbs_acre NUMERIC(10,2), 

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
  moisture  NUMERIC(10,2),
  n_con NUMERIC(10,2),
  p_con NUMERIC(10,2),
  k_con NUMERIC(10,2),
  salt_con NUMERIC(10,2),
  
  
  UNIQUE(dairy_id, import_date, material_type, import_desc),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS field_crop_app_fertilizer(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_crop_app_id INT NOT NULL,
  nutrient_import_id INT NOT NULL,

  amount_applied  NUMERIC(10,2), -- not current used in annual report be information is here.

  n_lbs_acre NUMERIC(10,2),
  p_lbs_acre NUMERIC(10,2),
  k_lbs_acre NUMERIC(10,2),
  salt_lbs_acre NUMERIC(10,2),
  

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


-- CREATE TABLE IF NOT EXISTS water_sources(
--   pk SERIAL PRIMARY KEY,
--   dairy_id INT NOT NULL,
--   title VARCHAR(30) DEFAULT '',
--   src_type VARCHAR(30) DEFAULT '',
--   UNIQUE(title, src_type),
--   CONSTRAINT fk_dairy
--     FOREIGN KEY(dairy_id) 
-- 	  REFERENCES dairies(pk)
-- );

-- CREATE TABLE IF NOT EXISTS drain_sources(
--   pk SERIAL PRIMARY KEY,
--   dairy_id INT NOT NULL,
--   title VARCHAR(30) DEFAULT '',
--   UNIQUE(title),
--   CONSTRAINT fk_dairy
--     FOREIGN KEY(dairy_id) 
-- 	  REFERENCES dairies(pk)
-- );


