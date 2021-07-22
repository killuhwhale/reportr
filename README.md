Running psql macos 
- /Library/PostgreSQL/13/scripts/runpsql.sh
- added to .zshrc ==> $ runpsql
start server from /server npm start
start react from root npm start


To host your site with Firebase Hosting, you need the Firebase CLI (a command line tool).

Run the following npm command to install the CLI or update to the latest CLI version.

npm install -g firebase-tools



importing db/index.js gives you the connection to the DB server.

QUESTIONS::

  From Merced.APP Page: Annual Report:NMP and Export Agreements
  
  Do I need to worry about Nutirent Management Plan itselft?
    - Or do I just need to get answers to questions regarding it? 
      - Was it updated, developed by a certified person, approved by a certified person
    Export agreement






TODO TONIGHT
- ANNUAL Report:
  - Harvest Events (Almost done complete w/ upload from TSV!)
  - Fresh water sources and analyses (2)
  - Process Wastewater Analyses (1)
  - Tile Drain sources and analyses (2)



Harvest Event
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




Fresh Water Sources
- fresh_wtr_srcs
 - dairy_id -> tied to a dairy (used in Land applications)
 - title
 - src_type [ground water, surface water]


Fresh Water Analyses - (fresh_wtrsrc + lab data from sample @ specific sample_date)
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
    




Crops
A crop is a Field, Plant date, Crop and data about the crop

Labs
  - Is it the same set of Labs? Currently there is a select to select a Lab without a way to create a new laboratory
  - Are these labs up to date? Can I use these?

A Lab is a Date, Laboratroy and Sample Type
- Based on the sample type the data required will be different

Lab types
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



-----------------------------------------------------------------------------------------------
Overview of Pg 5 and 13 Tables

Create a Field Crop and Date Planted - field_crops

Field1 - Plant Date 1
  - Crops & Harvest -> crop_harvests [field_crop_id, other data...]
    - Crop 
  - Application Events


-----------------------------------------------------------------------------------------------

Pg 13 Nutrient Budget
A. Land Applications - This details Applying something to a field plant date (Same field and plant date of Pg5 Harvest and Crops
- Required information: 
  - Application date, Application Method, Rain prior, during, after
    - Source Desc, Material Type,           N,     P     K       Salt (lbs/acre)    Amount

For each Field
  For each Crop Plant Date (Main Table) [this changes for each Crop&Plant date combo]
    For Each Applicaion Date (tied to a crop plant date) (INNER TABLE)
      - Material Applied with source and NPKNaCl Data

Field 4 - PLANT DATE - CROP
  Field Name
  Crop,                                                   Plant Date
  Application Date, Method Precipitation 24 prior, during application, following
    - Source Desc, Material Type,           N,     P     K       Salt (lbs/acre)    Amount
    - EX: Lateral 7, Surface water,         0,     0,    0,      511,               6,655,500.00 gal    
    - EX: Wastewater, Process waste water,  63.77, 9.47, 131.37, 1,159.52,          600,000.00gal
    - Total application ------------        X,     X,    X,      x,yyy.zz,         ----------------    (------- => BLANK)





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
    - 

  Notary SnapDoc Service, She want to be like this company.

    - Title company sends email (through snapdoc), signing.
    - Notary 