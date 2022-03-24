CREATE  EXTENSION citext;
CREATE DOMAIN email AS citext
  CHECK ( value ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' );

CREATE TABLE IF NOT EXISTS companies(
  pk SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  company_secret VARCHAR(100) NOT NULL,
  unique(title)
);

CREATE TABLE IF NOT EXISTS accounts(
  pk SERIAL PRIMARY KEY,  
  company_id INTEGER NOT NULl,
  username VARCHAR(100) default '',
  email email NOT NULL,
  password VARCHAR(100) NOT NULL,
  account_type INT NOT NULL default 1,
  UNIQUE(email),
  CONSTRAINT fk_company
    FOREIGN KEY(company_id)
    REFERENCES companies(pk)
    ON UPDATE CASCADE ON DELETE CASCADE
);
