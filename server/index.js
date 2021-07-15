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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '10mb'}))
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
      console.log(result.rows)
      res.json(result.rows)
      return;    
    }
    res.json({"test": "Get all dairies unsuccessful"});
  })
});
app.post("/api/dairies/create", (req, res) => {
  console.log("INserting....", req.body.title, req.body.reportingYr)
  db.insertDairy([req.body.title, req.body.reportingYr], (err, result) => {
    console.log(result)
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
    console.log(result)
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
      console.log(result.rows)
      res.json(result.rows)
      return;    
    }
    res.json({"test": "Get all fields unsuccessful"});
  })
});
app.get("/api/parcels/:dairy_id", (req, res) => {
	db.getParcels(req.params.dairy_id, 
  (err, result) => {
    if(!err){
      console.log(result.rows)
      res.json(result.rows)
      return;    
    }
    res.json({"test": "Get all parcels unsuccessful"});
  })
});
app.get("/api/field_parcel/:dairy_id", (req, res) => {
	db.getFieldParcel(req.params.dairy_id, 
  (err, result) => {
    if(!err){
      console.log(result.rows)
      res.json(result.rows)
      return;    
    }
    res.json({"test": "Get all field_parcel unsuccessful"});
  })
});
app.post("/api/fields/create", (req, res) => {
  const {title, acres, cropable, dairy_id} = req.body.data
  db.insertField([title, acres, cropable, dairy_id], (err, result) => {
    console.log(result)
    if(!err){
      res.json({"test": "Inserted field successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Inserted field unsuccessful"});
  })
});
app.post("/api/parcels/create", (req, res) => {
  
  db.insertParcel(req.body.data, (err, result) => {
    console.log(result)
    if(!err){
      res.json({"test": "Inserted parcel successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Inserted parcel unsuccessful"});
  })
});
app.post("/api/fields_parcel/create", (req, res) => {
  const {dairy_id, field_id, parcel_id} = req.body
  db.insertFieldParcel([title, acres, cropable, dairy_id], (err, result) => {
    console.log(result)
    if(!err){
      res.json({"test": "Inserted field successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Inserted field unsuccessful"});
  })
});
app.post("/api/fields/update", (req, res) => {
  console.log("Updating....", req.body.data)
  db.updateField(req.body.data, (err, result) => {
    console.log(result)
    if(!err){
      res.json({"test": "Updated field successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Updated field unsuccessful"});
  })
});
app.post("/api/parcels/update", (req, res) => {
  console.log("Updating....", req.body.data)
  db.updateField(req.body.data, (err, result) => {
    console.log(result)
    if(!err){
      res.json({"test": "Updated parcel successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Updated parcel unsuccessful"});
  })
});
app.post("/api/field_parcel/update", (req, res) => {
  console.log("Updating....", req.body.data)
  db.updateField(req.body.data, (err, result) => {
    console.log(result)
    if(!err){
      res.json({"test": "Updated field_parcel successfully"});
      return;    
    }
    console.log(err)
    res.json({"test": "Updated field_parcel unsuccessful"});
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

