Running psql macos 
- /Library/PostgreSQL/13/scripts/runpsql.sh
- added to .zshrc ==> $ runpsql
start server from /server npm start
start react from root npm start

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






TODO TONIGHT




- ANNUAL Report:
  - Fresh water sources and analyses (2)
  - Process Wastewater Analyses (1)
  - Tile Drain sources and analyses (2)



- Application Events
  - DB Field_id,
  - DB field_crop_id (this list populated when user selects field_id for the dairy), 
  - application_date
  - app_method
  - precipitation_standing_water_before
    - options:
     - No precipitation
     - Standing water
     - Light rain
     - Steady rain
     - Heavy rain
     - Hail
     - Snow
  - precipitation_standing_water_during
  - precipitation_standing_water_after


NUTRITION SOURCE::PROCESS WASTEWATER
POSSIBLE FLOW:
TSV for waste water analysis -> Nitrogens,...,potassium,TDS -> Those number from TSV are mg/L concentrations ->
-> This information creates a LAND APPLCIATION EVENT's NUTRITION SOURCE (multiple tables at this point,) ->
-> So, a LAND APP EVENT will need to be created for the information in this TSV is import


Application Event
  Nutrient Source
    - [Existing soil nutrient content, Plowdown credit, Commercial fertilizer / Other, Dry manure, Process wastewater Fresh water,]

   EX: PROCESS WASTEWATER
   Sheet has: application_date, field_title, material_type???,  application_rate, n (mg/L), p (mg/L), k (mg/L), salt (mg/L), n (lbs/acre), p (lbs/acre), k (lbs/acre), salt (lbs/acre), 


  Same process as before, scrape TSV for fields and dates...
  1. lazily check fields (create if not created)
  2. lazily check application events. (fields and dates)
  3. Insert data from sheet for each application event on the applciation date (for each field_id, application_event_id)
  4. 

   I need to tie this data to an application event which is a field_id and date.
]


- Nutrient Source
  - application_event_id
  - nut_source_id

- Harvest Event - DONE{
  - field_crop
  - harvest_date
  - harvest_yield
  - reporting_method [dry_wt, as_is]
  - moisture 
  - n
    - recorded as a percentage(still a decimal number)
    - converted to mg/kg by multiplying it by 10,000 (confirmed on paper)
    - 
  - p
  - k

  - tfs, total fixed solids, ash
    - percent
}




- Fresh Water Sources
  - fresh_wtr_srcs
  - dairy_id -> tied to a dairy (used in Land applications)
  - title
  - src_type [ground water, surface water]


- Fresh Water Analyses - (fresh_wtrsrc + lab data from sample @ specific sample_date)
    - Water source plus lab data?
  - fresh_wtr_lab -> unique by fresh_wtr_src && sample_date
    - dairy_id 
    - fresh_wtr_src_id
    - desc
    - sample_date
    - src_of_analysis [lab / other or estimated]
    - Lab Data
      - nutrient_con [n, ammonium-n, Nitrate-n] {concentration / Detection Limit (mg/L)} ** multiple field 3*2 = 6 fields   
      - gen_mineral_con [mineral list] {concentration / Detection Limit (mg/L)} ** multiple field 7*2 = 14 fields
      - electrical_cond [conductivity, detection_limit] (microHOS/ cm) **2 fields
      - Total Disolved Solids [tds, detection_limit] (mg/L) **2 fields
      - From the lab data (Spreadsheet),
          - it looks like only N (PPM), electrical_cond, TDS are recorded
    




- Crops
  - A crop is a Field, Plant date, Crop and data about the crop

- Labs
  - Is it the same set of Labs? Currently there is a select to select a Lab without a way to create a new laboratory
  - Are these labs up to date? Can I use these?

- A Lab is a Date, Laboratroy and Sample Type
  - Based on the sample type the data required will be different

- Lab types
  - Irragation Water
    - Ties to water_sources DB Table
  - Manure
  - Plant Tissue (as -is) / (dry)
    - Ties to crops which is tied to a field that is tied to a Dairy.
  - Soil
    - Ties to  fields
  - Subsurface Tile
    - Ties to drain_sources

  - Wastewater


Annual Report
Pg 5 Application Area
B. Crops and Harvets - This details when a crop was planted and harvest as well as the data about the Harvet (Yield, N,P,K,Salt)

This is a list of Crops by Field.
For ea Field
  For each Crop (unique by plant date and crop)
    For each

Field 1
  - Field name
  - Plant Date: Crop name
      - Crop: crop name, Acres Planted, Plant Date
        - 2 Tables of Data per Plant Date for a Crop
          - Harvested Date - Harvest 





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