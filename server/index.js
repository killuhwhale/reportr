const path = require("path");
const express = require("express");
const fileUpload = require('express-fileupload');
const cors = require('cors');
const app = express(); // create express app
const bodyParser = require('body-parser');
require('dotenv').config();
var http = require('http').createServer(app);
const db = require('./db/index')

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json({limit: '10mb'}))
app.use(express.json())
app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.static(path.join(__dirname, "../public")));
app.use(fileUpload());
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));


app.get("/api/dairies/:reportingYear", (req, res) => {
	db.getDairies(req.params.reportingYear, 
  (err, result) => {
    if(!err){
      
      res.json(result.rows)
      return;    
    }
    res.json({"test": "Get all dairies unsuccessful"});
  })
});
app.post("/api/dairies/create", (req, res) => {
  console.log("INserting....", req.body.title, req.body.reportingYr)
  db.insertDairy([req.body.title, req.body.reportingYr], (err, result) => {
    
    if(!err){
      res.json({"test": "Inserted dairy successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Inserted dairy unsuccessful"});
  })
});
app.post("/api/dairies/update", (req, res) => {
  console.log("Updating....", req.body.data)
  // req.body.data is a list of values in order to match DB Table
  db.updateDairy(req.body.data, (err, result) => {
    
    if(!err){
      res.json({"test": "Updated dairy successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Updated dairy unsuccessful"});
  })
});
app.get("/api/fields/:dairy_id", (req, res) => {
	db.getFields(req.params.dairy_id, 
  (err, result) => {
    if(!err){
      
      res.json(result.rows)
      return;    
    }
    console.log(req.params.dairy_id)
    res.json({"test": "Get all fields unsuccessful"});
  })
});
app.post("/api/fields/create", (req, res) => {
  console.log("Server:: acres, cropable")
  console.log(req.body)
  const {title, acres, cropable, dairy_id} = req.body.data
  db.insertField([title, acres, cropable, dairy_id], (err, result) => {
    if(!err){
      res.json(result.rows)
      // res.json({"test": "Inserted field successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": err});
  })
});
app.post("/api/fields/update", (req, res) => {
  console.log("Updating....", req.body.data)
  const { title, acres, cropable, pk } = req.body.data
  db.updateField([title, acres, cropable, pk], (err, result) => {
    
    if(!err){
      res.json({"test": "Updated field successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Updated field unsuccessful"});
  })
});
app.post("/api/fields/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmField(req.body.pk, (err, result) => {
    
    if(!err){
      res.json({"test": "Deleted field successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Deleted field unsuccessful"});
  })
});
app.get("/api/parcels/:dairy_id", (req, res) => {
	db.getParcels(req.params.dairy_id, 
  (err, result) => {
    if(!err){
      
      res.json(result.rows)
      return;    
    }
    res.json({"test": "Get all parcels unsuccessful"});
  })
});
app.post("/api/parcels/create", (req, res) => {
  
  db.insertParcel(req.body.data, (err, result) => {
    
    if(!err){
      res.json({"test": "Inserted parcel successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Inserted parcel unsuccessful"});
  })
});
app.post("/api/parcels/update", (req, res) => {
  console.log("Updating....", req.body.data)
  const { pnumber, pk } = req.body.data
  db.updateParcel([pnumber, pk], (err, result) => {
    
    if(!err){
      res.json({"test": "Updated parcel successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Updated parcel unsuccessful"});
  })
});
app.post("/api/parcels/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmField(req.body.pk, (err, result) => {
    
    if(!err){
      res.json({"test": "Deleted parcel successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Deleted parcel unsuccessful"});
  })
});
app.get("/api/field_parcel/:dairy_id", (req, res) => {
	db.getFieldParcel(req.params.dairy_id, 
  (err, result) => {
    if(!err){
      
      res.json(result.rows)
      return;    
    }
    console.log(err)
    res.json({"test": "Get all field_parcel unsuccessful"});
  })
});
app.post("/api/field_parcel/create", (req, res) => {
  const {dairy_id, field_id, parcel_id} = req.body
  db.insertFieldParcel([dairy_id, field_id, parcel_id], (err, result) => {
    
    if(!err){
      res.json({"test": "Inserted field_parcel successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Inserted field_parcel unsuccessful"});
  })
});
app.post("/api/field_parcel/delete", (req, res) => {
  console.log("Deleting....", req.body.data)
  db.rmFieldParcel(req.body.data, (err, result) => {
    
    if(!err){
      res.json({"test": "Deleted field_parcel successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Deleted field_parcel unsuccessful"});
  })
});
app.post("/api/operators/create", (req, res) => {
  console.log("Creating....", req.body)
  const { dairy_id, title, primary_phone, secondary_phone, street, city,
         city_state, city_zip, is_owner, is_responsible} = req.body
  db.insertOperator(
    [
      dairy_id, title, primary_phone, secondary_phone, street, city,
      city_state, city_zip, is_owner, is_responsible
    ],
    (err, result) => {
      
      if(!err){
        res.json({"test": "Created operator successfully"});
        return;    
      }
      console.log(err)
      res.json({"test": "Created operator unsuccessful"});
    }
  )
});
app.get("/api/operators/:dairy_id", (req, res) => {
	db.getOperators(req.params.dairy_id, 
  (err, result) => {
    if(!err){
      
      res.json(result.rows)
      return;    
    }
    res.json({"test": "Get all operators unsuccessful"});
  })
});
app.post("/api/operators/update", (req, res) => {
  console.log("Updating....", req.body)
  const { 
    dairy_id ,
    title,
    primary_phone,
    secondary_phone ,
    street,
    city, 
    city_state,
    city_zip, 
    is_owner, 
    is_responsible,
    pk
  } = req.body
  db.updateOperator([
    dairy_id ,
    title,
    primary_phone,
    secondary_phone ,
    street,
    city, 
    city_state,
    city_zip, 
    is_owner, 
    is_responsible,
    pk
  ], (err, result) => {
    
    if(!err){
      res.json({"test": "Updated operator successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Updated operator unsuccessful"});
  })
});
app.post("/api/operators/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmOperator(req.body.pk, (err, result) => {
    
    if(!err){
      res.json({"test": "Deleted operator successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Deleted operator unsuccessful"});
  })
});



app.post("/api/herds/create", (req, res) => {
  console.log("Creating....", req.body)
  const { dairy_id } = req.body
  db.insertHerd(
    [
      dairy_id
    ],
    (err, result) => {
      
      if(!err){
        res.json({"test": "Created herds successfully"});
        return;    
      }
      console.log(err)
      res.json({"test": "Created herds unsuccessful"});
    }
  )
});
app.get("/api/herds/:dairy_id", (req, res) => {
	db.getHerd(req.params.dairy_id, 
  (err, result) => {
    if(!err){
      
      res.json(result.rows)
      return;    
    }
    res.json({"test": "Get all herds unsuccessful"});
  })
});
app.post("/api/herds/update", (req, res) => {
  console.log("Updating....", req.body)
  const { milk_cows, dry_cows, bred_cows, cows, calf_young, calf_old, pk } = req.body
  db.updateHerd([
    milk_cows, dry_cows, bred_cows, cows, calf_young, calf_old, pk
  ], (err, result) => {
    
    if(!err){
      res.json({"test": "Updated herds successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Updated herds unsuccessful"});
  })
});

app.get("/api/crops/:title", (req, res) => {
  console.log("Getting crop by Title", req.body.title)
  db.getCropsByTitle(req.params.title, 
  (err, result) => {
    if(!err){
      
      res.json(result.rows)
      return;    
    }
    res.json({"test": "Get crops by Title unsuccessful"});
  })
});
app.get("/api/crops", (req, res) => {
	db.getCrops("", 
  (err, result) => {
    if(!err){
      
      res.json(result.rows)
      return;    
    }
    res.json({"test": "Get all crops unsuccessful"});
  })
});


app.post("/api/field_crop/create", (req, res) => {
  console.log("Creating....", req.body)
  const { dairy_id, field_id, crop_id, plant_date, acres_planted, typical_yield, moisture, n,p,k,salt } = req.body
  db.insertFieldCrop(
    [
      dairy_id, field_id, crop_id, plant_date, acres_planted, typical_yield, moisture, n,p,k,salt
    ],
    (err, result) => {
      
      if(!err){
        res.json(result.rows)
        // res.json({"test": "Created field_crop successfully"});
        return;    
      }
      console.log(err)
      res.json({"test": "Created field_crop unsuccessful"});
    }
  )
});
app.get("/api/field_crop/:dairy_id", (req, res) => {
	db.getFieldCrop(req.params.dairy_id, 
  (err, result) => {
    if(!err){
      
      res.json(result.rows)
      return;    
    }
    console.log(err)
    res.json({"test": "Get all field_crop unsuccessful"});
  })
});
app.post("/api/field_crop/update", (req, res) => {
  console.log("Updating....", req.body)
  const {plant_date, acres_planted, typical_yield, moisture, n,p,k,salt, pk } = req.body
  db.updateFieldCrop([
    plant_date, parseInt(acres_planted), parseInt(typical_yield), moisture, n,p,k,salt, pk
  ], (err, result) => {
    
    if(!err){
      res.json({"test": "Updated field_crop successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Updated field_crop unsuccessful"});
  })
});

app.post("/api/field_crop/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCrop(req.body.pk, (err, result) => {
    
    if(!err){
      res.json({"test": "Deleted field_crop successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Deleted field_crop unsuccessful"});
  })
});


app.post("/api/field_crop_harvest/create", (req, res) => {
  console.log("Creating....", req.body)
  const { dairy_id, field_crop_id, harvest_date, density, basis, actual_yield, moisture, n,p,k,tfs  } = req.body
  db.insertFieldCropHarvest(
    [
      dairy_id, field_crop_id, harvest_date, density, basis, actual_yield, moisture, n,p,k,tfs
    ],
    (err, result) => {
      
      if(!err){
        res.json(result)
        // res.json({"test": "Created field_crop_harvest successfully"});
        return;    
      }
      console.log(err)
      res.json({"test": "Created field_crop_harvest unsuccessful"});
    }
  )
});
app.get("/api/field_crop_harvest/:dairy_id", (req, res) => {
	db.getFieldCropHarvest(req.params.dairy_id, 
  (err, result) => {
    if(!err){
      
      res.json(result.rows)
      return;    
    }
    console.log(err)
    res.json({"test": "Get all field_crop_harvest unsuccessful"});
  })
});
app.post("/api/field_crop_harvest/update", (req, res) => {
  console.log("Updating....", req.body)
  const {
    harvest_date, density, basis, actual_yield, moisture, n,p,k,tfs, pk
  } = req.body
  db.updateFieldCropHarvest([
    harvest_date, actual_yield, basis, density, moisture, n,p,k,tfs, pk
  ], (err, result) => {
    
    if(!err){
      res.json({"test": "Updated field_crop_harvest successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Updated field_crop_harvest unsuccessful"});
  })
});
app.post("/api/field_crop_harvest/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropHarvest(req.body.pk, (err, result) => {
    
    if(!err){
      res.json({"test": "Deleted field_crop_harvest successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Deleted field_crop_harvest unsuccessful"});
  })
});




app.get("/api/search/fields/:title/:dairy_id", (req, res) => {
	db.searchFieldsByTitle([req.params.title, req.params.dairy_id], 
  (err, result) => {
    if(!err){
      
      res.json(result.rows)
      return;    
    }
    console.log(err)
    res.json({"test": "Get all field_crop_harvest unsuccessful"});
  })
});
// dairy_id is here because lazyGet uses it for the url but we dont need it here.
app.get("/api/search/field_crop/:field_id/:crop_id/:plant_date/:dairy_id", (req, res) => {
	db.searchFieldCropsByFieldCropPlantdate([
    req.params.field_id, req.params.crop_id, req.params.plant_date], 
  (err, result) => {
    if(!err){
      
      res.json(result.rows)
      return;    
    }
    console.log(err)
    res.json({"test": "Get all field_crop_harvest unsuccessful"});
  })
});




// app.post("/api/postImage", (req, res) => {
//   console.log(req.files.images)
//   res.json(req.files.images)
//   // Data from
//     // name: '47BD6C6C-0E6C-4104-8B2D-05CF89481C1C.heic',
//     // data: <Buffer 00 00 00 24 66 74 79 70 68 65 69 63 00 00 00 00 6d 69 66 31 4d 69 50 72 6d 69 61 66 4d 69 48 42 68 65 69 63 00 00 0d 34 6d 65 74 61 00 00 00 00 00 00 ... 460289 more bytes>,
//     // size: 460339,
//     // encoding: '7bit',
//     // tempFilePath: '',
//     // truncated: false,
//     // mimetype: 'image/heic',
//   // res.json({"test": `Sent test data: ${req.body.data}`})
// })

http.listen(3001, () => {
  console.log('listening on *:3001');
});

