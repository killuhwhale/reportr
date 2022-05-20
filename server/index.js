require('dotenv').config()
const express = require("express");
var bodyParser = require('body-parser')
// const fileUpload = require('express-fileupload');
const cors = require('cors');
const process = require('process');
const jwt = require("jsonwebtoken");
const app = express(); // create express app
var http = require('http').createServer(app)
const db = require('./db/index')
const logger = require('./logs/logging')
const { ALLOWED_ORIGINS, REQUEST_LIMIT, FILE_SIZE_LIMIT } = require("./specific")


// Setup
app.use(express.json({ limit: REQUEST_LIMIT }))
app.use(bodyParser.raw({ limit: FILE_SIZE_LIMIT })) // Sneding TSV to server
// app.use(fileUpload()); // Multipart form data

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
const filesAPI = require(`./files/files`)(app);
const annualReportDataAPI = require(`./pdf/annualReportData`)(app);
const annualReportPDFAPI = require(`./pdf/annualReportPDF`)(app);
console.log("Requiring serverTSV from index.js")
const tsvAPI = require(`./tsv/serverTsv`)(app);
console.log("Requiring settings from index.js")
const settingsAPI = require(`./settings/settings`)(app);
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
  logger.info(`listening on *:${PORT}`)
});

