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

  PSQL on Google Cloud Cloud(Not neeeded after all, able to use antoher method with name)
    - psql "sslmode=verify-ca sslrootcert=server-ca.pem sslcert=client-cert.pem sslkey=client-key.pem hostaddr=34.102.61.45 port=5432 user=postgres dbname=postgres"



ALTERATIONS TO MERCED APP TO EXISTING DAIRIES:
  - FRESH WATER APP EVENT Field 6 11/01/2019 planted, 10/10/2019 applied, this was in the spreadsheet but not in merced   
      app.
    - This was making me think I had a bug, but spreadsheet data and data in merced app don't match 100% :(



TODO

Github is private, the only passwords visible in code is for the DB and that is in a .yaml file uploaded directly to Digital Ocean
  - Might not need env vars.
  - add baseURL to process env vars 


Per Company Basis Issues:
- Logos and Company Specific Assets Need to go into a DB Table
  - Logo -- stored as text: base64 png
    - Used in PDF Report(comps/dairy/pdf.js) && TSV Print pages (pages/tsvPrint.js)

- Basin Plans
  - Do these change dending on the company/ location of business?

- Counties Dropdown list 
  Change to TextiField? or place all counties in there for each State?
  - Probably only work in 1 state so a drop down of counties is probably fine.


Need to get info from Tammy:
   - Counties to serve.
   - Breeds (might be in Merced app)
   - Basin Plans (might be in Merced app)




Problems:
  
  - Dates are slightly off due to timezone....
    - Creating a date inititally for a dairy, days should be jan 1st to dec 31st 
      - Currently, the dates are created as dec 31st to dec 30th (1 day off)
      

  - Delete Dairy base
    - No way to delete dairy base


  - Upload TSV process 
    - Ensure there are rows of data bfore uploading.
    - Need to avoid updating TSV file in DB with an empty doc....

  - Remove amount_applied & Lbs/acre salt on Commercial fertilizer TSV
    - Remove from upload process and DB schema

  - Add progress indicators when uploading TSV, maybe just make the button disabled and spin..... 
    - Animated border would be cool.

  - (BUG) Certification if there are no owners or operators, onupdate will crash

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

  - (Quality Check) Check herd calculations: 
    - Put same numbers in and see fi they match reports from Merced...

 



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