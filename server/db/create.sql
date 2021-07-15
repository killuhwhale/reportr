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
  dairy_id INT NOT NULL,
  field_id INT NOT NULL,
  parcel_id INT NOT NULL,

  CONSTRAINT pk PRIMARY KEY (dairy_id, field_id, parcel_id),
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





-- -- Owner information 
-- CREATE TABLE IF NOT EXISTS ownOperators(
--   pk SERIAL PRIMARY KEY,
--   dairy_id INT,
--   street VARCHAR(100) NOT NULL,
--   cross_street VARCHAR(50),
--   county VARCHAR(30),
--   city VARCHAR(30) NOT NULL,
--   city_state VARCHAR(3),
--   city_zip VARCHAR(20) NOT NULL,
--   is_owner BOOLEAN,
--   is_responsible BOOLEAN DEFAULT FALSE,
--   primary_phone VARCHAR(15),
--   secondary_phone VARCHAR(15),
--   CONSTRAINT fk_dairy
--     FOREIGN KEY(dairy_id) 
-- 	  REFERENCES dairies(pk)
-- );

-- nutrient_plan_contact
-- CREATE TABLE IF NOT EXISTS nutrient_plan_contact(
--   pk SERIAL PRIMARY KEY,
--   dairy_id INT NOT NULL,
--   contact_id INT NOT NULL,
--   title VARCHAR(30) NOT NULL,
--   address_id INT NOT NULL,
--   priority INT,
--   created timestamp NOT NULL NOW(),
--   CONSTRAINT fk_dairy
--     FOREIGN KEY(dairy_id) 
-- 	  REFERENCES dairies(pk),
--   CONSTRAINT fk_person
--     FOREIGN KEY(contact_id) 
-- 	  REFERENCES persons(pk),
--   CONSTRAINT fk_address
--     FOREIGN KEY(adress_id) 
-- 	  REFERENCES addresses(pk)
-- )

-- waste_plan_contact
-- CREATE TABLE IF NOT EXISTS waste_plan_contact(
--   pk SERIAL PRIMARY KEY,
--   dairy_id INT NOT NULL,
--   contact_id INT NOT NULL,
--   title VARCHAR(30) NOT NULL,
--   address_id INT NOT NULL,
--   created timestamp NOT NULL NOW(),
--   priority INT,
--   CONSTRAINT fk_dairy
--     FOREIGN KEY(dairy_id) 
-- 	  REFERENCES dairies(pk),
--   CONSTRAINT fk_person
--     FOREIGN KEY(contact_id) 
-- 	  REFERENCES persons(pk),
--   CONSTRAINT fk_address
--     FOREIGN KEY(adress_id) 
-- 	  REFERENCES addresses(pk)
-- )

-- haulers
  -- Name
  -- Persons(contact), Addresses
-- CREATE TABLE IF NOT EXISTS haulers(
--   pk SERIAL PRIMARY KEY,
--   title VARCHAR(30) NOT NULL,
--   address_id INT NOT NULL,
--   person_id INT NOT NULL,
--   created timestamp NOT NULL NOW(),
--   CONSTRAINT fk_dairy
--     FOREIGN KEY(dairy_id) 
-- 	  REFERENCES dairies(pk),
--   CONSTRAINT fk_address
--     FOREIGN KEY(adress_id) 
-- 	  REFERENCES addresses(pk)
-- )

-- export_recipient
  -- destination_type text
  -- address addresses fk
  -- contact persons fk


