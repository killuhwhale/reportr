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
  acres INT DEFAULT 0,
  cropable INT DEFAULT 0,
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
  typical_yield INT,-- tons
  moisture INT, -- stored as a percent 10 == 10%
  n NUMERIC(8,6), -- stored as a raw value e.g 0.0175 == 1.75%, basica default (percet in standard form, lbs/tons)
  p NUMERIC(8,6), 
  k NUMERIC(8,6),
  salt NUMERIC(8,6),
  UNIQUE(title)
);

CREATE TABLE IF NOT EXISTS field_crop(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_id INT NOT NULL,
  crop_id INT NOT NULL,
  plant_date timestamp,
  acres_planted INT,
  typical_yield INT, -- tons/ acre 
  moisture INT, -- stored as a percent 10 == 10%
  n NUMERIC(8,6), -- Concentration by default data, lb/ton 
  p NUMERIC(8,6), 
  k NUMERIC(8,6),
  salt NUMERIC(8,6),
  UNIQUE(dairy_id, field_id, crop_id, plant_date),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk),
  CONSTRAINT fk_field
    FOREIGN KEY(field_id) 
    REFERENCES fields(pk),
  CONSTRAINT fk_crop
    FOREIGN KEY(crop_id) 
	  REFERENCES crops(pk)
);



-- Concentration conversion factors:
-- Display mg/kg == x 10,000
-- Display actualy yields == divide by 0.49999899 and then use in the formula
    -- yield(tons/acre) * convertedFactor(lbs/ton) == Totals N, P, K in lbs/acre
CREATE TABLE IF NOT EXISTS field_crop_harvest(
  pk SERIAL PRIMARY KEY,
  dairy_id INT NOT NULL,
  field_crop_id INT NOT NULL,
  harvest_date timestamp,
  basis VARCHAR(20), -- reporting method
  density INT, -- lbs/ ft**3 cubic foot
  actual_yield INT, -- tons -- calculate to find tons/ acres by field_crop.acres_planted 
  moisture INT, -- stored as a percent 10 == 10%
  n NUMERIC(8,6), -- Come from lab as a percentage of concentration in mg/kg, divide by .49999899 to convert to lb/ ton conversion factor
  p NUMERIC(8,6),       -- With the conversions factor in lb/ton we can calculate the required Annual report data
  k NUMERIC(8,6),       --    totals for N, P K & Salt == yield(tons/acre) * CF (concentration factor in lb/ton) 
  tfs NUMERIC(8,6), -- total fixed solids
  UNIQUE(dairy_id, field_crop_id, harvest_date),
  CONSTRAINT fk_dairy
    FOREIGN KEY(dairy_id) 
	  REFERENCES dairies(pk),
  CONSTRAINT fk_field_crop
    FOREIGN KEY(field_crop_id) 
	  REFERENCES field_crop(pk)

);



-- INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Alfalfa Haylage',21,70,1,0.09,0.7,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Alfalfa, hay',8,10,3,0.27,2.1,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Almond, in shell',0,0,6.5,1.1,7.05,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Apple',0,0,0.3,0.08,0.54,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Barley silage, boot stage',8,70,0.8,0.13,0.58,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Barley silage, soft dough',16,70,0.5,0.08,0.415,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Barley, grain',3,10,1.85,0.35,0.5,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Bermudagrass, hay',8,10,1.75,0.23,2.1,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Broccoli',0,0,0.44,0.075,0.35,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Bromegrass, forage',0,0,1.8,0.285,2.45,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Cabbage',0,0,0.39,0.04,0.3,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Canola, grain',0,0,3.8,0.9,0.6,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Cantaloupe',0,0,0.365,0.05,0.54,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Celery',0,0,0.19,0.045,0.415,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Clover-grass, hay',6,10,1.9,0.25,2.1,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Corn, grain',5,10,1.45,0.275,0.3,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Corn, silage',30,70,0.4,0.075,0.33,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Cotton, lint',3,0,1.75,0.285,0.58,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Grape',0,0,0.415,0.065,0.455,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Lettuce',0,0,0.24,0.03,0.415,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Oats, grain',2,10,2.2,0.325,0.375,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Oats, hay',4,10,2,0.325,1.65,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Oats, silage-soft dough',16,70,0.5,0.08,0.415,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Orchardgrass, hay',6,10,1.75,0.23,2.1,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Pasture',20,70,0.92,0.13,0.945,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Pasture, Silage',15,70,0.92,0.13,0.945,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Peach',0,0,0.315,0.135,0.33,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Pear',0,0,0.285,0.035,0.26,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Potato',0,0,0.35,0.065,0.465,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Prune',0,0,0.3,0.04,0.36,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Ryegrass, hay',6,10,1.6,0.23,2.1,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Safflower',2,0,5,0.55,3.1,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Sorghum',4,10,2.5,0.435,2,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Sorghum-Sudangrass, forage',0,0,2.05,0.35,2.45,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Squash',0,0,0.42,0.04,0.5,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Sudangrass, hay',8,10,1.6,0.22,1.65,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Sudangrass, silage',8,70,0.55,0.085,0.6,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Sugar beets',30,0,0.425,0.045,0.75,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Sweet Potato',0,0,0.52,0.1,0.83,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Tall Fescue, hay',6,10,1.6,0.23,2.1,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Timothy, hay',6,10,1.75,0.23,2.1,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Tomato',75,90,0.125,0.045,0.285,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Triticale, boot stage',12,70,0.75,0.135,0.58,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Triticale, soft dough',22,70,0.5,0.085,0.375,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Vetch, forage',0,0,0,0,0,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Wheat, grain',3,10,2.9,0.545,2.5,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Wheat, Hay',4,10,1.65,0.255,1.245,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Wheat, silage, boot stage',10,70,0.8,0.14,0.6,0);
--   INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('Wheat, silage, soft dough',18,70,0.55,0.085,0.415,0);
















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


