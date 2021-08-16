const path = require("path");
const express = require("express");
const fileUpload = require('express-fileupload');
const cors = require('cors');
const app = express(); // create express app
// const {Storage} = require('@google-cloud/storage');
require('dotenv').config();
var http = require('http').createServer(app);
const db = require('./db/index')
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
// const storage = new Storage();


// Setup
app.use(express.json())
app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.static(path.join(__dirname, "../public")));
app.use(fileUpload());
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
        'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.post("/api/tsv/create", (req, res) => {
  
  const { dairy_id, title, data, tsvType } = req.body
  db.insertTSV([dairy_id, title, data, tsvType], (err, result) => {
    if (!err) {
      res.json({ "test": "Inserted TSV successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Inserted TSV unsuccessful" });
  })
});

app.get("/api/tsv/:dairy_id/:tsvType", (req, res) => {
  db.getTSVs(req.params.dairy_id, req.params.tsvType,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      res.json({ "test": "Get all TSVs unsuccessful" });
    })
});

app.post("/api/tsv/delete", (req, res) => {
  console.log("Deleting TSV w/ pk: ", req.body.pk)
  db.rmTSV(req.body.pk, (err, result) => {
    if (!err) {
      res.json({ "test": "Deleted TSV successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted TSV unsuccessful" });
  })
});

// API
app.get("/api/dairies/:reportingYear", (req, res) => {
  db.getDairies(req.params.reportingYear,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      res.json({ "test": "Get all dairies unsuccessful" });
    })
});
app.post("/api/dairies/create", (req, res) => {
  db.insertDairy([req.body.title, req.body.reportingYr], (err, result) => {

    if (!err) {
      res.json({ "test": "Inserted dairy successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Inserted dairy unsuccessful" });
  })
});
app.post("/api/dairies/update", (req, res) => {
  console.log("Updating....", req.body.data)
  // req.body.data is a list of values in order to match DB Table
  db.updateDairy(req.body.data, (err, result) => {

    if (!err) {
      res.json({ "test": "Updated dairy successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Updated dairy unsuccessful" });
  })
});
app.get("/api/fields/:dairy_id", (req, res) => {
  db.getFields(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(req.params.dairy_id)
      res.json({ "test": "Get all fields unsuccessful" });
    })
});
app.post("/api/fields/create", (req, res) => {
  console.log("Server:: acres, cropable")
  console.log(req.body)
  const { title, acres, cropable, dairy_id } = req.body.data
  db.insertField([title, acres, cropable, dairy_id], (err, result) => {
    if (!err) {
      res.json(result.rows)
      // res.json({"test": "Inserted field successfully"});
      return;
    }
    console.log(err)
    res.json({ "test": err });
  })
});
app.post("/api/fields/update", (req, res) => {
  console.log("Updating....", req.body.data)
  const { title, acres, cropable, pk } = req.body.data
  db.updateField([title, acres, cropable, pk], (err, result) => {

    if (!err) {
      res.json({ "test": "Updated field successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Updated field unsuccessful" });
  })
});
app.post("/api/fields/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmField(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field unsuccessful" });
  })
});
app.get("/api/parcels/:dairy_id", (req, res) => {
  db.getParcels(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      res.json({ "test": "Get all parcels unsuccessful" });
    })
});
app.post("/api/parcels/create", (req, res) => {

  db.insertParcel(req.body.data, (err, result) => {

    if (!err) {
      res.json({ "test": "Inserted parcel successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Inserted parcel unsuccessful" });
  })
});
app.post("/api/parcels/update", (req, res) => {
  console.log("Updating....", req.body.data)
  const { pnumber, pk } = req.body.data
  db.updateParcel([pnumber, pk], (err, result) => {

    if (!err) {
      res.json({ "test": "Updated parcel successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Updated parcel unsuccessful" });
  })
});
app.post("/api/parcels/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmParcel(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted parcel successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted parcel unsuccessful" });
  })
});
app.get("/api/field_parcel/:dairy_id", (req, res) => {
  db.getFieldParcel(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_parcel unsuccessful" });
    })
});
app.post("/api/field_parcel/create", (req, res) => {
  const { dairy_id, field_id, parcel_id } = req.body
  db.insertFieldParcel([dairy_id, field_id, parcel_id], (err, result) => {

    if (!err) {
      res.json({ "test": "Inserted field_parcel successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Inserted field_parcel unsuccessful" });
  })
});
app.post("/api/field_parcel/delete", (req, res) => {
  console.log("Deleting....", req.body.data)
  db.rmFieldParcel(req.body.data, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field_parcel successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_parcel unsuccessful" });
  })
});
app.post("/api/operators/create", (req, res) => {
  console.log("Creating....", req.body)
  const { dairy_id, title, primary_phone, secondary_phone, street, city,
    city_state, city_zip, is_owner, is_responsible } = req.body
  db.insertOperator(
    [
      dairy_id, title, primary_phone, secondary_phone, street, city,
      city_state, city_zip, is_owner, is_responsible
    ],
    (err, result) => {

      if (!err) {
        res.json({ "test": "Created operator successfully" });
        return;
      }
      console.log(err)
      res.json({ "test": "Created operator unsuccessful" });
    }
  )
});
app.get("/api/operators/:dairy_id", (req, res) => {
  db.getOperators(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      res.json({ "test": "Get all operators unsuccessful" });
    })
});
app.post("/api/operators/update", (req, res) => {
  console.log("Updating....", req.body)
  const {
    dairy_id,
    title,
    primary_phone,
    secondary_phone,
    street,
    city,
    city_state,
    city_zip,
    is_owner,
    is_responsible,
    pk
  } = req.body
  db.updateOperator([
    dairy_id,
    title,
    primary_phone,
    secondary_phone,
    street,
    city,
    city_state,
    city_zip,
    is_owner,
    is_responsible,
    pk
  ], (err, result) => {

    if (!err) {
      res.json({ "test": "Updated operator successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Updated operator unsuccessful" });
  })
});
app.post("/api/operators/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmOperator(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted operator successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted operator unsuccessful" });
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

      if (!err) {
        res.json({ "test": "Created herds successfully" });
        return;
      }
      console.log(err)
      res.json({ "test": "Created herds unsuccessful" });
    }
  )
});
app.get("/api/herds/:dairy_id", (req, res) => {
  db.getHerd(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      res.json({ "test": "Get all herds unsuccessful" });
    })
});
app.post("/api/herds/update", (req, res) => {
  console.log("Updating....", req.body)
  const { milk_cows, dry_cows, bred_cows, cows, calf_young, calf_old, pk } = req.body
  db.updateHerd([
    milk_cows, dry_cows, bred_cows, cows, calf_young, calf_old, pk
  ], (err, result) => {

    if (!err) {
      res.json({ "test": "Updated herds successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Updated herds unsuccessful" });
  })
});

app.get("/api/crops/:title", (req, res) => {
  console.log("Getting crop by Title", req.body.title)
  db.getCropsByTitle(req.params.title,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      res.json({ "test": "Get crops by Title unsuccessful" });
    })
});
app.get("/api/crops", (req, res) => {
  db.getCrops("",
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      res.json({ "test": "Get all crops unsuccessful" });
    })
});


app.post("/api/field_crop/create", (req, res) => {
  console.log("Creating....", req.body)
  const { dairy_id, field_id, crop_id, plant_date, acres_planted, typical_yield, moisture, n, p, k, salt } = req.body
  db.insertFieldCrop(
    [
      dairy_id, field_id, crop_id, plant_date, acres_planted, typical_yield, moisture, n, p, k, salt
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        // res.json({"test": "Created field_crop successfully"});
        return;
      }
      console.log(err)
      res.json({ "test": "Created field_crop unsuccessful" });
    }
  )
});
app.get("/api/field_crop/:dairy_id", (req, res) => {
  db.getFieldCrop(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop unsuccessful" });
    })
});
app.post("/api/field_crop/update", (req, res) => {
  console.log("Updating....", req.body)
  const { plant_date, acres_planted, typical_yield, moisture, n, p, k, salt, pk } = req.body
  db.updateFieldCrop([
    plant_date, parseInt(acres_planted), parseInt(typical_yield), moisture, n, p, k, salt, pk
  ], (err, result) => {

    if (!err) {
      res.json({ "test": "Updated field_crop successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Updated field_crop unsuccessful" });
  })
});

app.post("/api/field_crop/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCrop(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field_crop successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop unsuccessful" });
  })
});


app.post("/api/field_crop_harvest/create", (req, res) => {
  console.log("Creating....", req.body)
  const { dairy_id, field_crop_id, harvest_date, density, basis, actual_yield, moisture, n, p, k, tfs } = req.body
  db.insertFieldCropHarvest(
    [
      dairy_id, field_crop_id, harvest_date, density, basis, actual_yield, moisture, n, p, k, tfs
    ],
    (err, result) => {

      if (!err) {
        res.json(result)
        // res.json({"test": "Created field_crop_harvest successfully"});
        return;
      }
      console.log(err)
      res.json({ "test": "Created field_crop_harvest unsuccessful" });
    }
  )
});
app.get("/api/field_crop_harvest/:dairy_id", (req, res) => {
  db.getFieldCropHarvest(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_harvest unsuccessful" });
    })
});
app.post("/api/field_crop_harvest/update", (req, res) => {
  console.log("Updating....", req.body)
  const {
    harvest_date, density, basis, actual_yield, moisture, n, p, k, tfs, pk
  } = req.body
  db.updateFieldCropHarvest([
    harvest_date, actual_yield, basis, density, moisture, n, p, k, tfs, pk
  ], (err, result) => {

    if (!err) {
      res.json({ "test": "Updated field_crop_harvest successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Updated field_crop_harvest unsuccessful" });
  })
});
app.post("/api/field_crop_harvest/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropHarvest(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field_crop_harvest successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop_harvest unsuccessful" });
  })
});

app.post("/api/field_crop_app/create", (req, res) => {
  console.log("Creating....", req.body)
  const { dairy_id, field_crop_id, app_date, app_method, precip_before, precip_during, precip_after } = req.body
  db.insertFieldCropApplication(
    [
      dairy_id, field_crop_id, app_date, app_method, precip_before, precip_during, precip_after
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        // res.json({"test": "Created field_crop_harvest successfully"});
        return;
      }
      console.log(err)
      res.json({ "test": "Created field_crop_app unsuccessful" });
    }
  )
});
app.get("/api/field_crop_app/:dairy_id", (req, res) => {
  db.getFieldCropApplication(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_app unsuccessful" });
    })
});
app.post("/api/field_crop_app/update", (req, res) => {
  console.log("Updating....", req.body)
  const {
    app_date, app_method, precip_before, precip_during, precip_after, pk
  } = req.body
  db.updateFieldCropApplication([
    app_date, app_method, precip_before, precip_during, precip_after, pk
  ], (err, result) => {

    if (!err) {
      res.json({ "test": "Updated field_crop_app successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Updated field_crop_app unsuccessful" });
  })
});
app.post("/api/field_crop_app/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropApplication(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field_crop_app successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop_app unsuccessful" });
  })
});


app.post("/api/field_crop_app_process_wastewater_analysis/create", (req, res) => {
  console.log("Creating....", req.body)
  const {
    dairy_id,
    sample_date,
    sample_desc,
    sample_data_src,
    kn_con,
    nh4_con,
    nh3_con,
    no3_con,
    p_con,
    k_con,
    ec,
    tds,
    ph,
  } = req.body
  db.insertFieldCropApplicationProcessWastewaterAnalysis(
    [
      dairy_id,
      sample_date,
      sample_desc,
      sample_data_src,
      kn_con,
      nh4_con,
      nh3_con,
      no3_con,
      p_con,
      k_con,
      ec,
      tds,
      ph,
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created field_crop_app_process_wastewater_analysis unsuccessful" });
    }
  )
});
app.get("/api/field_crop_app_process_wastewater_analysis/:dairy_id", (req, res) => {
  db.getFieldCropApplicationProcessWastewaterAnalysis(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_app_process_wastewater_analysis unsuccessful" });
    })
});
app.post("/api/field_crop_app_process_wastewater_analysis/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropApplicationProcessWastewaterAnalysis(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field_crop_app_process_wastewater_analysis successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop_app_process_wastewater_analysis unsuccessful" });
  })
});


app.post("/api/field_crop_app_process_wastewater/create", (req, res) => {
  console.log("Creating....", req.body)
  const {
    dairy_id,
    field_crop_app_id,
    field_crop_app_process_wastewater_analysis_id,
    material_type,
    app_desc,
    amount_applied,
    totalN,
    totalP,
    totalK,
  } = req.body
  db.insertFieldCropApplicationProcessWastewater(
    [
      dairy_id,
      field_crop_app_id,
      field_crop_app_process_wastewater_analysis_id,
      material_type,
      app_desc,
      amount_applied,
      totalN,
      totalP,
      totalK,
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created field_crop_app_process_wastewater unsuccessful" });
    }
  )
});
app.get("/api/field_crop_app_process_wastewater/:dairy_id", (req, res) => {
  db.getFieldCropApplicationProcessWastewater(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_app_process_wastewater unsuccessful" });
    })
});
app.post("/api/field_crop_app_process_wastewater/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropApplicationProcessWastewater(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field_crop_app_process_wastewater successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop_app_process_wastewater unsuccessful" });
  })
});


app.post("/api/field_crop_app_freshwater_source/create", (req, res) => {
  const {
    dairy_id,
    src_desc,
    src_type,
  } = req.body
  console.log("Creating field_crop_app_freshwater_source ....", [
    dairy_id,
    src_desc,
    src_type
  ])
  db.insertFieldCropApplicationFreshwaterSource(
    [
      dairy_id,
      src_desc,
      src_type
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created field_crop_app_freshwater_source unsuccessful" });
    }
  )
});
app.get("/api/field_crop_app_freshwater_source/:dairy_id", (req, res) => {
  db.getFieldCropApplicationFreshwaterSource(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_app_freshwater_source unsuccessful" });
    })
});
app.post("/api/field_crop_app_freshwater_source/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropApplicationFreshwaterSource(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field_crop_app_freshwater_source successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop_app_freshwater_source unsuccessful" });
  })
});

app.post("/api/field_crop_app_freshwater_analysis/create", (req, res) => {
  const {
    dairy_id,
    fresh_water_source_id,
    sample_date,
    sample_desc,
    src_of_analysis,
    n_con,
    nh4_con, 
    no2_con,
    ca_con,
    mg_con,
    na_con,
    hco3_con,
    co3_con,
    so4_con,
    cl_con,
    ec, 
    tds
  } = req.body
  db.insertFieldCropApplicationFreshwaterAnalysis(
    [
      dairy_id,
      fresh_water_source_id,
      sample_date,
      sample_desc,
      src_of_analysis,
      n_con,
      nh4_con, 
      no2_con,
      ca_con,
      mg_con,
      na_con,
      hco3_con,
      co3_con,
      so4_con,
      cl_con,
      ec, 
      tds,
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created field_crop_app_freshwater_analysis unsuccessful" });
    }
  )
});
app.get("/api/field_crop_app_freshwater_analysis/:dairy_id", (req, res) => {
  db.getFieldCropApplicationFreshwaterAnalysis(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_app_freshwater_analysis unsuccessful" });
    })
});
app.post("/api/field_crop_app_freshwater_analysis/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropApplicationFreshwaterAnalysis(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field_crop_app_freshwater_analysis successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop_app_freshwater_analysis unsuccessful" });
  })
});

app.post("/api/field_crop_app_freshwater/create", (req, res) => {
  const {
    dairy_id,
    field_crop_app_id,
    field_crop_app_freshwater_analysis_id,
    app_rate,
    run_time,
    amount_applied,
    amt_applied_per_acre,
    totalN
  } = req.body
  db.insertFieldCropApplicationFreshwater(
    [
      dairy_id,
      field_crop_app_id,
      field_crop_app_freshwater_analysis_id,
      app_rate,
      run_time,
      amount_applied,
      amt_applied_per_acre,
      totalN
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created field_crop_app_freshwater unsuccessful" });
    }
  )
});
app.get("/api/field_crop_app_freshwater/:dairy_id", (req, res) => {
  
  db.getFieldCropApplicationFreshwater(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_app_freshwater unsuccessful" });
    })
});
app.post("/api/field_crop_app_freshwater/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropApplicationFreshwater(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field_crop_app_freshwater successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop_app_freshwater unsuccessful" });
  })
});


app.post("/api/field_crop_app_solidmanure_analysis/create", (req, res) => {
  
  const {
    dairy_id,
    sample_desc,
    sample_date,
    material_type,
    src_of_analysis,
    moisture,
    method_of_reporting,
    n_con,
    p_con,
    k_con,
    ca_con,
    mg_con,
    na_con,
    s_con,
    cl_con,
    tfs
  } = req.body
  db.insertFieldCropApplicationSolidmanureAnalysis(
    [
      dairy_id,
      sample_desc,
      sample_date,
      material_type,
      src_of_analysis,
      moisture,
      method_of_reporting,
      n_con,
      p_con,
      k_con,
      ca_con,
      mg_con,
      na_con,
      s_con,
      cl_con,
      tfs
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created field_crop_app_freshwater unsuccessful" });
    }
  )
});
app.get("/api/field_crop_app_solidmanure_analysis/:dairy_id", (req, res) => {
  
  db.getFieldCropApplicationSolidmanureAnalysis(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_app_solidmanure_analysis unsuccessful" });
    })
});
app.post("/api/field_crop_app_solidmanure_analysis/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropApplicationSolidmanureAnalysis(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field_crop_app_solidmanure_analysis successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop_app_solidmanure_analysis unsuccessful" });
  })
});


app.post("/api/field_crop_app_solidmanure/create", (req, res) => {
  console.log("Creating.... solid manure", req.body)
  const {
    dairy_id,
    field_crop_app_id,
    field_crop_app_solidmanure_analysis_id,
    src_desc,
    amount_applied,
    amt_applied_per_acre,
    n_lbs_acre,
    p_lbs_acre,
    k_lbs_acre,
    salt_lbs_acre 
  } = req.body
  db.insertFieldCropApplicationSolidmanure(
    [
      dairy_id,
      field_crop_app_id,
      field_crop_app_solidmanure_analysis_id,
      src_desc,
      amount_applied,
      amt_applied_per_acre,
      n_lbs_acre,
      p_lbs_acre,
      k_lbs_acre,
      salt_lbs_acre 
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created field_crop_app_freshwater unsuccessful" });
    }
  )
});
app.get("/api/field_crop_app_solidmanure/:dairy_id", (req, res) => {
  
  db.getFieldCropApplicationSolidmanure(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_app_solidmanure unsuccessful" });
    })
});
app.post("/api/field_crop_app_solidmanure_/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropApplicationSolidmanure(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field_crop_app_solidmanure successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop_app_solidmanure unsuccessful" });
  })
});












// Search used for lazy gets.
app.get("/api/search/fields/:title/:dairy_id", (req, res) => {
  db.searchFieldsByTitle([req.params.title, req.params.dairy_id],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_harvest unsuccessful" });
    })
});
app.get("/api/search/field_crop/:field_id/:crop_id/:plant_date/:dairy_id", (req, res) => {
  db.searchFieldCropsByFieldCropPlantdate([
    req.params.field_id, req.params.crop_id, req.params.plant_date],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_harvest unsuccessful" });
    })
});
app.get("/api/search/field_crop_app/:field_crop_id/:app_date/:dairy_pk", (req, res) => {
  db.searchFieldCropApplicationsByFieldCropIDAppDate(
    [
      req.params.field_crop_id,
      req.params.app_date,
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all field_crop_app unsuccessful" });
    })
});
app.get("/api/search/field_crop_app_process_wastewater_analysis/:sample_date/:sample_desc/:dairy_pk", (req, res) => {
  db.searchFieldCropAppProcessWastewaterAnalysisBySampleDateSampleDesc(
    [
      req.params.sample_date,
      req.params.sample_desc,
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all field_crop_app_process_wastewater_analysis unsuccessful" });
    })
});

// src_desc, src_type
app.get("/api/search/field_crop_app_freshwater_source/:src_desc/:src_type/:dairy_pk", (req, res) => {
  db.searchFieldCropAppFreshwaterSource(
    [
      req.params.src_desc,
      req.params.src_type,
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all field_crop_app_freshwater unsuccessful" });
    })
});
// sample_date, sample_desc, src_of_analysis, fresh_water_source_id
app.get("/api/search/field_crop_app_freshwater_analysis/:sample_date/:sample_desc/:src_of_analysis/:fresh_water_source_id/:dairy_pk", (req, res) => {
  db.searchFieldCropAppFreshwaterAnalysis(
    [
      req.params.sample_date,
      req.params.sample_desc,
      req.params.src_of_analysis,
      req.params.fresh_water_source_id,
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all field_crop_app_freshwater unsuccessful" });
    })
});


// sample_date, sample_desc, src_of_analysis
app.get("/api/search/field_crop_app_solidmanure_analysis/:sample_date/:sample_desc/:src_of_analysis/:dairy_pk", (req, res) => {
  db.searchFieldCropAppSolidmanureAnalysis(
    [
      req.params.sample_date,
      req.params.sample_desc,
      req.params.src_of_analysis,
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all field_crop_app_solidmanure_analysis unsuccessful" });
    })
});

////////////////////////////////

app.post("/api/postImage", (req, res) => {
  console.log(req.files.images)
  res.json(req.files.images)
  // Data from
    // name: '47BD6C6C-0E6C-4104-8B2D-05CF89481C1C.heic',
    // data: <Buffer 00 00 00 24 66 74 79 70 68 65 69 63 00 00 00 00 6d 69 66 31 4d 69 50 72 6d 69 61 66 4d 69 48 42 68 65 69 63 00 00 0d 34 6d 65 74 61 00 00 00 00 00 00 ... 460289 more bytes>,
    // size: 460339,
    // encoding: '7bit',
    // tempFilePath: '',
    // truncated: false,
    // mimetype: 'image/heic',
  // res.json({"test": `Sent test data: ${req.body.data}`})
})

http.listen(3001, () => {
  console.log('listening on *:3001');
});

