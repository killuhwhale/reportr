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
  milk_cows INT[] DEFAULT '{0,0,0,0,0,0}',
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



