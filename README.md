Running psql macos 
- /Library/PostgreSQL/13/scripts/runpsql.sh

start server from server npm start
start react from root npm start

importing db/index.js gives you the connection to the DB server.

QUESTIONS::

  From Merced.APP Page: Annual Report:NMP and Export Agreements
  
  Do I need to worry about Nutirent Management Plan itselft?
    - Or do I just need to get answers to questions regarding it? 
      - Was it updated, developed by a certified person, approved by a certified person
    Export agreement



TODO TONIGHT
- ANNUAL Report:
  - Manure Excreted (1)
  - Crops (1)
  - Process Wastewater Analyses (1)
  - Fresh water sources and analyses (2)
  - Tile Drain sources and analyses (2)




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
