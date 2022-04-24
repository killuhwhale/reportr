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
  Create Accounts
    ✓ Create 2 companies and admins (419 ms)
    ✓ Create READ, WRITE, DELETE Accounts with admin For First Company (265 ms)
  Create 2 Dairies for ea  company
    ✓ Create Dairies (101 ms)
  Create and Update a herd for a company
    ✓ Insert and Upate Herd Information (171 ms)
  Test Accounts permissions
    ✓ ADMIN Role Cannot Create Company (79 ms)
    ✓ WRITE Role Cannot Create Company (66 ms)
    ✓ READ Role Cannot Create Company (64 ms)
    ✓ DELETE Role Cannot Create Company (65 ms)
    ✓ WRITE Role can create company data (78 ms)
    ✓ READ Role can access company data (69 ms)
    ✓ DELETE Roles can remove company data (88 ms)
    ✓ Role permission sub/ super role check (294 ms)
    ✓ Test that non-hacker roles cannot create Admin accounts  (273 ms)
    ✓ Test Roles cant alter other accounts (308 ms)
    ✓ Test Accounts...  (340 ms)
  Test Accounts cross-company restrictions
    ✓ READ role can't access other company data (65 ms)
    ✓ WRITE role can't create other company data (67 ms)
    ✓ DELETE role can't remove other company data (70 ms)
  Test middleware verifyUserFromCompanyBy*
    ✓ Test *ByDairyBaseID (72 ms)
    ✓ Test *ByCompanyID (72 ms)
    ✓ Test *ByDairyID (71 ms)
    ✓ Test *ByUserID (72 ms)
  Test upload XLSX
    ✓ Upload XLSX. (241 ms)
  Test pdfDB
    ✓ A. LIST OF LAND APPLICATION AREAS. (6 ms)
    ✓ B. APPLICATION AREAS Crops and Harvests. (3 ms)
    ✓ Nutrient Budget A. LAND APPLICATIONS are calculated and totaled correctly. (4 ms)
    ✓ Nutrient Budget B, NaprbalABC(Summary) Info is calculated accurately. (18 ms)
    ✓ AB. HERD INFORMATION:MANURE GENERATED
    ✓ C. Process Wastewater Generated (1 ms)
    ✓ F. NUTRIENT IMPORTS
    ✓ G. NUTRIENT EXPORTS  (1 ms)
    ✓ A. NUTRIENT ANALYSES  (2 ms)
    ✓ ABC. Exception Reporting 
  
  # Missing Crucial Tests   
   - getReportingPeriodDays


# Todo:
  # Download Zip File with PDF report & All TSVs for that Dairy.
    - Process
      1. User sends request with dairy_id..... 
      2. Server gets request and fetches data for AR and ea TSV 
      3. Server takes ea tsv text and creates a file
      4. server generates PDF File (PDF is generated client side.....)

      5. Server Zips File and sends to Client
      6. CLient downloads Zip. 



      Currently,
      1. Client gets data from server
      2. Client generates images with Chart.js based on data
      3. W/ imgages and data send to PDF maker thing...

      Instead, once server has data, instead of returning it to client
      1. Take the data and use Chart.js and canvas on nodejs to run same code client side.
      2. Now we have images and data
      3. USe the PDF make to make the pdf and return it to the client for download.





       
  - Create a spread sheet with the difference between each sheet
    - Just copy and past each set into one sheet... comparing 2 rows  
  
  # Tests
    - Test if PDF report is generated correctly, downloadFile maybe in the tests.... 

  # UI
    - Nutrient Application Analyses should be shown and be able to be deleted
  


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

  # Generate PDF if herds are empty, pdf DD has an error.
    - Just check the doc and show an empty value if herds are not there...

  - Upload TSV process 
    - Ensure there are rows of data bfore uploading.
    - Need to avoid updating TSV file in DB with an empty doc...

  - Dates are slightly off due to timezone.... (I think)
    - Creating a date inititally for a dairy, days should be jan 1st to dec 31st 
      - Currently, the dates are created as dec 31st to dec 30th (1 day off)
    
  

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