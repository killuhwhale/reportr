Running psql macos 
- /Library/PostgreSQL/13/scripts/runpsql.sh
- added to .zshrc ==> $ runpsql
start server from /server npm start
start react from root npm start


ALTERATIONS TO MERCED APP TO EXISTING DAIRIES:
- FRESH WATER APP EVENT Field 6 11/01/2019 planted, 10/10/2019 applied, this was in the spreadsheet but not in merced app.
    - This was making me think I had a bug, but spreadsheet data and data in merced app don't match 100% :(



--------------------------------------------------------------------------------------------------------------
Firebase & Google Cloud

Firebase:
  -- 

Google Cloud
https://cloud.google.com/storage/docs/reference/libraries?authuser=3#client-libraries-install-nodejs

To host your site with Firebase Hosting, you need the Firebase CLI (a command line tool).

Run the following npm command to install the CLI or update to the latest CLI version.

npm install -g firebase-tools

You can deploy now or later. To deploy now, open a terminal window, then navigate to or create a root directory for your web app.

Sign in to Google
firebase login
Initiate your project
Run this command from your app’s root directory:

firebase init
When you’re ready, deploy your web app
Put your static files (e.g., HTML, CSS, JS) in your app’s deploy directory (the default is “public”). Then, run this command from your app’s root directory:

firebase deploy

--------------------------------------------------------------------------------------------------------------



importing db/index.js gives you the connection to the DB server.

QUESTIONS::

  From Merced.APP Page: Annual Report:NMP and Export Agreements
  
  Do I need to worry about Nutirent Management Plan itselft?
    - Or do I just need to get answers to questions regarding it? 
      - Was it updated, developed by a certified person, approved by a certified person
    Export agreement








TODO
Find login Solution....
  - Firebase Logins?

  - Protect Backend from unauthenticated requests.... ummmmm.......
  - Firebase will log me in front end, if this user is logged in update session and use session?
  - Look up exisiting solutions....



Per Company Basis Issues:
- Logos and Company Specific Assets Need to go into a DB Table
  - Logo -- stored as text: base64 png
    - Used in PDF Report(comps/dairy/pdf.js) && TSV Print pages (pages/tsvPrint.js)

- Basin Plans
  - Do these change dending on the company/ location of business?

- Counties Dropdown list 
  Change to TextiField? or place all counties in there for each State?



Problems:
  - (Feature) Button to delete all entries in a table....
  - (Huge, Quality Check) Deletes work as expected, If a Field is deleted, everything related to it is also deleted....
   
   
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

 
 



  - Feature decisons
   - unsure to have them manually add them or only have TSV entries
   - Spreadsheet shouldnt calculate antything to reduce size. 
          - (No longer using pre calculated numbers from spreadsheet :) but need to double check)
          -  But when manually creating entries, it seems weird to have users calculate stuff by hand or assume they have the          spreadsheet with them.
    - But i dont want to alter it too much before talking to them

----- I dont think I want to enable manual entries. ---------- 
  - (BUG) DLs created manually with null are null and do not get the default value of zero. 
  - (Performance) Typing into Modals is slow, presumably the models should handle state separtely from the view state since it may be slowing it down. (Probably wont need to type)
---------------------------------------------------------------
 


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