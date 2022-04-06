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
  - Upload XLSX and Calculate Annual Report data
  - Util functions (partial)
    - Format, toFloat, grouping
  
  # Missing Crucial Tests
   - Middleware tests
    - Ensure requests block invalid requests to read or write to wrong dairy (not belonging to user/company)

   - Account Tests
    - Ensure Accounts can alter  other accounts incorrectly.
    - Ensure Accounts are Created, Updated and Deleted by the correct Account.
      - Admins should only be able to create, update or delete other accounts
      - Accounts can update themselves

  - Company Test 
    - Ensure only hacker account can access API.




# Todo:

  - Display Company Logo
  - Upload Images Modals
  - Store Images in Digital Ocean Spaces
  1. Look for Logo for Company,
  2. If no Company logo, show upload modal,
  3. else show logo with delete feature


  - Test Accounts API 
    - Accounts and Companies
      - Ensure permissions are working correctly.
      - Ensure its working in general
    - (Great test case for accounts) Ensure that Owner accounts cant change their account type, this would result in losing access to company.

  - Test Middleware/ User can only access their company's data
    - Write some tests boi


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