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
  - server/accounts/accounts.js - whiteList for owner emails
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
  - FRESH WATER APP EVENT Field 6 11/01/2019 planted, 10/10/2019 applied, this was in the spreadsheet but not in merced app   
    - FRESH WATER APP EVENT Field 5 05/07/2020 planted, 7/27/2020 applied, 
      - Sheet: N con 47.2 ec 1,110.0 Tds 575 , Merced app: N con 48.50 ec 1,660.0 Tds 10

    - This was making me think I had a bug, but spreadsheet data and data in merced app don't match 100% :(



TODO

Fix tests, out of order comparing objects. and formatting of values



Account Management for Owners
 - Login
 - Logout
 - GetUserFromToken
  - When user is logged in and opens app, get user info.
 - RegisterUser
  - Create owner accounts if email on whitelist
 - CreateUser
  - Allows Owner accounts to create user accounts

  - Update
    - Password, email, username
  - Delete 



  - TODO()
    - Send Emails for confirmation and passwords

  - Server side upload to db
    - Send .xlsx to server to process.
  - Testing
    - Accounts users.js


Owner and User
  - Change Password

- Owner 
  - Add account for user to login with
  - View user accounts
  - Delete Accounts
  - Reset Passwords for accounts



Write down required columns in sheet.

Github is private, the only passwords visible in code is for the DB and that is in a .yaml file uploaded directly to Digital Ocean
  - Might not need env vars.
  - add baseURL to process env vars 


Problems:   

Herds

  - Upload TSV process 
    - Ensure there are rows of data bfore uploading.
    - Need to avoid updating TSV file in DB with an empty doc....

  - Dates are slightly off due to timezone.... (I think)
    - Creating a date inititally for a dairy, days should be jan 1st to dec 31st 
      - Currently, the dates are created as dec 31st to dec 30th (1 day off)
      
  - Delete Dairy base
    - No way to delete dairy base

  - Setup Testing with Docker Containers.
    
  - (BUG) No validation checks
    - All Spreadsheets need Numeric Data Validation. Could add to Spreadsheet but should also be in the code.
      - Check website by entering wrong info and implement it.
      - Total kn must be higher than combined nitrogen nh4 nh3 no2,
      - Limits betweem 0-999,999.99
      - TDS 1-20,0000
      - EC 0 - 99,9999.99 (something like this)
      - Percentages are 0-100

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