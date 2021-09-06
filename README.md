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



MISSING

Analysis
 - Detection limits on analyses freshwater, wastewater, solidmanure, fertilizers, harvests aka plant tissue....
 - Tile Drain sources and analyses
 - Soil

Applications 
 - Plowdown Credits
 - Existing Soil nutrient content















ToDO tomorrow
- Fill out the rest of the PDF. 
- Then attempt to make it accurate. AKA fix the problems below...

Problems:
  - (Bug) Freshwater Delete onConfrim is not a func.... error
  - (BUG) DLs created manually with null are null and do not get the default value of zero.
  - (BUG) No validation checks on entering concentations
    - Total kn must be higher than combined nitrogen nh4 nh3 no2,
    - Limits betweem 0-999,999.99
    - TDS 1-20,0000
    - EC 0 - 99,9999.99 (something like this)
    - Percentages are 0-100
    - Check website by entering wrong info and implement it.

  - (BUG) Disable GENERATE PDF plus button until the data is loaded.

  - (Quality Check) Unsure if total number are correct in naprb summary table.
      - Most fields match in Total Summary Table except:
        - Dry Manure: P
        - Freshwater: N, Salt
        - Actual removal, Production Records: P, Salt
        - ** I think there is human error inputting data from spreadsheet to Merced App.
        
  - (Performance) Typing into Modals is slow, presumably the models should handle state separtely from the view state since it may be slowing it down.
  - (Feature decison, unsure to have them manually add them or only have TSV entries) Process Wastewater Analysis Add Modal Button is missing
  


















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