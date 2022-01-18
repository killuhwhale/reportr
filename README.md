React
  reportrr % npm start

Express
  reportrr/server % npm start 

PSQL
  Running psql macos 
  - /Library/PostgreSQL/13/scripts/runpsql.sh
  - added to .zshrc ==> $ runpsql
  start server from /server npm start
  start react from root npm start
  DB: reportrr
  user: admin
  pass: mostdope

HARCODED VARS:  TODO() Move these to src/sepcific.js
  - utils/TSV.js
    - isTesting // For testing TSV Uploads
    - Also Creates Vars that correspond to Sheet Names, sheet names must match in order for Upload XLSX workbook to work.
  - DairyTab.js
    - Variables to determine Chart size in Annual Report
  - HomePage.js (Shouldnt change for a single company)
    - COUNTIES
    - BASINS 
    - BREEDS
  

ALTERATIONS TO MERCED APP TO EXISTING DAIRIES:
  - FRESH WATER APP EVENT Field 6 11/01/2019 planted, 10/10/2019 applied, this was in the spreadsheet but not in merced   
      app.
    - This was making me think I had a bug, but spreadsheet data and data in merced app don't match 100% :(



TODO
- Entering Breed, when other is slected, the user must input text. 
  - Implement the input method...

Github is private, the only passwords visible in code is for the DB and that is in a .yaml file uploaded directly to Digital Ocean
  - Might not need env vars.
  - add baseURL to process env vars 

- Nutrient Imports 
  - Top section of that tap is rendered without using <List />
    - i.e. it will render all items and not using a scrolled section. Will look bad with a lot of


Problems:  

  - PDF - Chart Field 17 Anticipated Nutrient Removal is 0, not sure if it should be.
  - Finish removing n_lbs_acre from db and everywhere.
  - Nutrient import calculations are very different based on material type. This needs to be handled better.
  - Undo Fertilizer in TSV.js

  - Upload TSV process 
    - Ensure there are rows of data bfore uploading.
    - Need to avoid updating TSV file in DB with an empty doc....

  - Dates are slightly off due to timezone.... (I think)
    - Creating a date inititally for a dairy, days should be jan 1st to dec 31st 
      - Currently, the dates are created as dec 31st to dec 30th (1 day off)
      
  - Delete Dairy base
    - No way to delete dairy base

  - Remove amount_applied & Lbs/acre salt on Commercial fertilizer TSV
    - Remove from upload process and DB schema

  - Decided to NOT use spreadsheet calculated columns
    - Freshwater App uses precalculated totalN from spreadsheet
    - For each sheet, calculate totals to store in DB, they are needed for totals in views
  
  - Need Data Summaries in ea view similar to Merced Site

    
  - (BUG) No validation checks
    - All Spreadsheets need Numeric Data Validation. Could add to Spreadsheet but should also be in the code.
      - Check website by entering wrong info and implement it.
      - Total kn must be higher than combined nitrogen nh4 nh3 no2,
      - Limits betweem 0-999,999.99
      - TDS 1-20,0000
      - EC 0 - 99,9999.99 (something like this)
      - Percentages are 0-100

  - (Quality Check) Unsure if total number are correct in naprb summary table.
      - Freshwaters might have an error due to the query used to get them? Producing less results maybe?
      - Most fields match in Total Summary Table except:
        - Dry Manure: P
        - Freshwater: N, Salt
        - Actual removal, Production Records: P, Salt
        - ** I think there is human error inputting data from spreadsheet to Merced App.



##### Rosies website notes.
Upload their documents
Website
Promote, Advertise, 
Notary service, 
  - Upload documents, from notaries
  - Remote online notaries
  - 
Title company
  - embassy appt to sign document to do transaction
  - tkaes 6-8 weeks to get appt
  - Notary service solves problem online
    - California is not authorized
   
  Notary SnapDoc Service, She want to be like this company.

    - Title company sends email (through snapdoc), signing.
    - Notary 