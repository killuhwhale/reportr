require('dotenv').config()
const express = require("express");
const fileUpload = require('express-fileupload');
const cors = require('cors');
const process = require('process');
const jwt = require("jsonwebtoken");
var bodyParser = require('body-parser')
const app = express(); // create express app
var http = require('http').createServer(app)
const db = require('./db/index')
const { ALLOWED_ORIGINS, REQUEST_LIMIT, FILE_SIZE_LIMIT } = require("./specific")



// Setup
app.use(express.json({ limit: REQUEST_LIMIT }))
app.use(bodyParser.raw({ limit: FILE_SIZE_LIMIT })) // Sneding TSV to server
app.use(fileUpload());

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
      var msg = `The CORS policy for this site does not 
        allow access from the specified Origin(${origin}).`
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));


const accountsAPI = require(`./accounts/account`)(app);
const companyAPI = require(`./company/company`)(app);
const companyLogoAPI = require(`./logo/logo`)(app);
const pdfAPI = require(`./pdf/pdf`)(app);
const tsvAPI = require(`./tsv/serverTsv`)(app);
const API = require(`./dairy/dairy`)(app);


app.get('/', (req, res) => {
  db.query("SELECT 5 as five;", [], (err, result) => {
    if (!err) {
      res.json(result.rows)
      return;
    }
    res.send(err);
  })
});


const PORT = process.env.PORT || 3001;

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

