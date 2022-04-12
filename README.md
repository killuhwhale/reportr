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
    ✓ Create a company and an admin (348 ms)
    ✓ Create READ, WRITE, DELETE Accounts with admin (270 ms)
  Create Dairies for 1 company
    ✓ Create Dairy (103 ms)
  Test Accounts permissions
    ✓ ADMIN Role Cannot Create Company (70 ms)
    ✓ WRITE Role Cannot Create Company (70 ms)
    ✓ READ Role Cannot Create Company (71 ms)
    ✓ DELETE Role Cannot Create Company (67 ms)
    ✓ WRITE Account can create company data (72 ms)
    ✓ READ Account can access company data (69 ms)
    ✓ DELETE Account can remove company data (79 ms)
    ✓ Account permission sub/ super role check (296 ms)
    ✓ Test Accounts cannot create Admin accounts  (274 ms)
    ✓ Test Accounts...  (255 ms)
  Test Accounts cross-company restrictions
    ✓ READ Account can't access other company data (71 ms)
    ✓ WRITE Account can't create other company data (66 ms)
    ✓ DELETE Account can't remove other company data (67 ms)
  Test upload XLSX
    ✓ Upload XLSX. (153 ms)
  Test pdfDB
    ✓ A. LIST OF LAND APPLICATION AREAS. (15 ms)
    ✓ B. APPLICATION AREAS Crops and Harvests. (9 ms)
    ✓ Nutrient Budget A. LAND APPLICATIONS are calculated and totaled correctly. (54 ms)
    ✓ Nutrient Budget B, NaprbalABC(Summary) Info is calculated accurately. (43 ms)
    ✓ Insert and Upate Herd Information (15 ms)
    ✓ AB. HERD INFORMATION:MANURE GENERATED (55 ms)
    ✓ C. Process Wastewater Generated (11 ms)
    ✓ F. NUTRIENT IMPORTS (8 ms)
    ✓ G. NUTRIENT EXPORTS  (12 ms)
    ✓ A. NUTRIENT ANALYSES  (14 ms)
    ✓ ABC. Exception Reporting  (4 ms)
  
  # Missing Crucial Tests
   - Account Tests
    - Ensure Accounts can alter  other accounts incorrectly.
    - Ensure Accounts are Created, Updated and Deleted by the correct Account.
      - Admins should only be able to create, update or delete other accounts
      - Accounts can update themselves


# Todo:

  # 

  - Generating PDF, Client should send one request instead of many individual
    - SQL Query to get all required info and format the data to an object that can be easily used by the client side code.
    - 1. SQL Statement for all data needed
    - 2. 

  # Images - Company Logo
    - Display Company Logo
    - Upload Images Modals
    - Store Images in Digital Ocean Spaces
    1. Look for Logo for Company,
    2. If no Company logo, show upload modal,
    3. else show logo with delete feature


  - Nutrient Application Analyses should be shown and be able to be deleted
  

  # Admin Dashboard
    Ensure only accounts with lvl 5 can access that page

    List of Companies
      - Delete, update title
    
    - Company Management Modal
      - Account list
        - Delete, change password, update username
    
  


# Goals:

  Caching or State Management
    - Avoid multiple requests each time user goes to a new tab
    - Redux to store responses and check there first
    - Find another caching solution
  
  Setup Testing Execution before commiting to Github
 
  Dockerize React and Express Apps
 
  Micro Service-ize
    - Accounts
    - TSV
    - Dairy, and other info


# Problems   

  (Dashboard)
  Need a way to create a reportrr admin account to create company admin accounts.

  - Upload TSV process 
    - Ensure there are rows of data bfore uploading.
    - Need to avoid updating TSV file in DB with an empty doc...

  - Dates are slightly off due to timezone.... (I think)
    - Creating a date inititally for a dairy, days should be jan 1st to dec 31st 
      - Currently, the dates are created as dec 31st to dec 30th (1 day off)
      
  - Delete Dairy base
    - No way to delete dairy base
  

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