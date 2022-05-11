# Info
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
    // sudo kill -9 $(sudo lsof -t -i:3001)

  # NodeJS Version
  - Current:          Local v15.8.0 / Digital ocean "node": "15.x"
  - Chartjs:          15.x req
  - Null coalescing:  14.x min
  - 

# Deployment:
  Backend:
    github -> digital ocean
  
  Front End:
    npm build -> Firebase deploy

  Deploy command
    npm build; git add .; git commit -m 'deploy'; git push; firebase deploy;



# ALTERATIONS TO MERCED APP TO EXISTING DAIRIES:
  - FRESH WATER APP EVENT Field 6 11/01/2019 planted, 10/10/2019 applied, this was in the spreadsheet but not in merced app   
    - FRESH WATER APP EVENT Field 5 05/07/2020 planted, 7/27/2020 applied, 
      - Sheet: N con 47.2 ec 1,110.0 Tds 575 , Merced app: N con 48.50 ec 1,660.0 Tds 10

    - This was making me think I had a bug, but spreadsheet data and data in merced app don't match 100% :(

# Features

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

Owner and User
  - Change Password

- Owner 
  - Add account for user to login with
  - View user accounts
  - Delete Accounts
  - Reset Passwords for accounts

  - TODO()
    - Send Emails for confirmation and passwords
  
  - Testing
    - Accounts users.js



Github is private, the only passwords visible in code is for the DB and that is in a .yaml file uploaded directly to Digital Ocean
  - Might not need env vars.


# Testing:
  # Current Test Converagessss
  - Create Accounts
    - ✓ Create 2 companies and admins (376 ms)
    - ✓ Create READ, WRITE, DELETE Accounts with admin For First Company (320 ms)
  - Create 2 Dairies for ea  company
    - ✓ Create Dairies (385 ms)
  - Create and Update a herd for a company
    - ✓ Insert and Upate Herd Information (128 ms)
  - Test Accounts permissions
    - ✓ ADMIN Role Cannot Create Company (84 ms)
    - ✓ WRITE Role Cannot Create Company (85 ms)
    - ✓ READ Role Cannot Create Company (86 ms)
    - ✓ DELETE Role Cannot Create Company (86 ms)
    - ✓ WRITE Role can create company data (96 ms)
    - ✓ READ Role can access company data (88 ms)
    - ✓ DELETE Roles can remove company data (102 ms)
    - ✓ Role permission sub/ super role check (363 ms)
    - ✓ Test that non-hacker roles cannot create Admin accounts  (342 ms)
    - ✓ Test Roles cant alter other accounts (427 ms)
    - ✓ Test Accounts...  (315 ms)
  - Test Accounts cross-company restrictions
    - ✓ READ role can't access other company data (88 ms)
    - ✓ WRITE role can't create other company data (116 ms)
    - ✓ DELETE role can't remove other company data (92 ms)
  - Test middleware verifyUserFromCompanyBy*
    - ✓ Test *ByDairyBaseID (95 ms)
    - ✓ Test *ByCompanyID (89 ms)
    - ✓ Test *ByDairyID (106 ms)
    - ✓ Test *ByUserID (99 ms)
  - Test upload XLSX
    - ✓ Upload XLSX and Create Parcels, Field Parcels, Agreements, Notes, Certificaiton. (578 ms)
  - Test pdfDB
    - ✓ A. DAIRY FACILITY INFORMATION (Address and Parcels) (1 ms)
    - ✓ BC. Operators/ Owners
    - ✓ AB. AVAILABLE NUTRIENTS HERD INFORMATION:MANURE GENERATED
    - ✓ C. Process Wastewater Generated (2 ms)
    - ✓ F. NUTRIENT IMPORTS
    - ✓ G. NUTRIENT EXPORTS  (1 ms)
    - ✓ A. LIST OF LAND APPLICATION AREAS. (1 ms)
    - ✓ B. APPLICATION AREAS Crops and Harvests. (1 ms)
    - ✓ Nutrient Budget A. LAND APPLICATIONS are calculated and totaled correctly. (4 ms)
    - ✓ Nutrient Budget B(Single for ea field), NaprbalABC(Summary/ Charts) Info is calculated accurately. (13 ms)
    - ✓ ABCDEF. NUTRIENT ANALYSES  (3 ms)
    - ✓ ABC. Exception Reporting / Discharges
    - ✓ AB. NUTRIENT MANAGEMENT PLAN AND EXPORT AGREEMENT STATEMENTS
    - ✓ A. ADDITIONAL NOTES
    - ✓ A. CERTIFICATION
  - Test Files download for a dairy
    - ✓ Test Files download is the right mime type and is greater than 670kb (2888 ms)  


# Todo:

  # Facility information
    - When creating a dairy base, we need to create BaseOwnerOperators and BaseParcels
    - When creating a new dairy, create like normal but this information needs to be retrived instead.

  # Dairy Base
   - Needs to be the source of truth for this info:
    - Name, Address, began, BasinPlan...

  # Owner Operators 
    -  Needs a Base 
    - This should be like dairy base
    - 
  
  # Parcels

  When creating a new dairy, this should come form base dairy, not previous dairy.
  When updating this information on the UI, it should update the baseDairy as well as the curent dairy 


  # Tests
    - Reporting period
      - Unit test, ensure it updates correctly....
    - Logo upload   
       
  - Create a spread sheet with the difference between each sheet
    - Just copy and past each set into one sheet... comparing 2 rows  

  
# Goals:
   # State Management
    Caching or State Management
    - Avoid multiple requests each time user goes to a new tab
    - Redux to store responses and check there first
    - Find another caching solution


# Features:
  - Single Click Generate All TSVs and PDFS for ea Dairy
    * Just click and get a folder to drag onto flash drive or open and print! **
    
    Impl:
    - Return a Folder of Folders
      - Folder:{
        -Folder_dairyA:{
          pdfReport.pdf
          tsv_ProductionRecords.tsv
          tsv_SheetName.tsv
        },
        -Folder_dairyB:{
          pdfReport.pdf
          tsv_ProductionRecords.tsv
          tsv_SheetName.tsv
        }
      }
  
  Setup Testing Execution before commiting to Github
 
  Dockerize React and Express Apps
 
  Micro Service-ize
    - Accounts
    - TSV
    - Dairy, and other info


# Problems 
  # PDF Report
    REPORT MAY BE INCOMPLETE, SEE VALIDATION ERRORS 

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