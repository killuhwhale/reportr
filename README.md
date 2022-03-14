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
  

ALTERATIONS TO MERCED APP TO EXISTING DAIRIES:
  - FRESH WATER APP EVENT Field 6 11/01/2019 planted, 10/10/2019 applied, this was in the spreadsheet but not in merced app   
    - FRESH WATER APP EVENT Field 5 05/07/2020 planted, 7/27/2020 applied, 
      - Sheet: N con 47.2 ec 1,110.0 Tds 575 , Merced app: N con 48.50 ec 1,660.0 Tds 10

    - This was making me think I had a bug, but spreadsheet data and data in merced app don't match 100% :(

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


Testing:
  App 
    Tests upload of XLXS and the calculations for each section of the annual report. 
  
  Test Command
    npm test


Deployment:
  Backend:
    github -> digital ocean
  
  Front End:
    npm build -> Firebase deploy

  Deploy command
    npm build; git add .; git commit -m 'deploy'; git push; firebase deploy;



Todo:
  
  Lock each companies data down.
  When a request is issued, check if the user is apart of the company.
  (Curently, the )


  Accounts Dashboard
    - Update dashboard to make sure it works with the new company_id
      - Check labels for each account
      - Check can add new accounts
      - Check to update each new account....



  #Admin Dashboard
    Ensure only accounts with lvl 3 can access that page

    List of Companies
      - Delete, update title
    
    - Company Management Modal
      - Account list
        - Delete, change password, update username
    
  


Goals:

  Caching or State Management
    - Avoid multiple requests each time user goes to a new tab
    - Redux to store responses and check there first
    - Find another caching solution

  Add Company entity
    This will make it possible for this to be a software as a service to multiple companies.
    - Every Dairy Base should belong to a company and subsequently each dairy
  
  Permissions
    - Allow Accounts access data from a single company
  
  Setup Testing Execution before commiting to Github
 
  Dockerize React and Express Apps
 
  Micro Service-ize
    - Accounts
    - TSV
    - Dairy, and other info
 



Current Flow
- Register User from a pre-defined set of emails
- Once there is a user get all dairies


New Flow
- Register User from a pre-defined set of emails
  
- Get all Dairies based on Current Accounts token info
  - Store the company ID in the token








Problems:   

  Permission, ensure only  authenticated users can get data.
  How should I ensure a certain user can view certain things in database
  
    1. dairy_id is typically tied to each entity
      - accounts and dairy ids can be associated
        - token can encode which dairy_ids the account can see

    2. On each request, lookup in DB which dairy_id the account can see


  Testing
    - Server side
      Need to test:
        Accounts
    - Client Side
      ???


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