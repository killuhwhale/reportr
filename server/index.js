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
app.get("/api/dairy/:dairy_id", (req, res) => {
  db.getDairy(req.params.dairy_id,
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      res.json({ "test": "Get dairy unsuccessful" });
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
  const {
    street, cross_street, county, city, city_state, title, city_zip, basin_plan, p_breed, began, period_start, period_end, dairy_id
  } = req.body

  db.updateDairy([
    street, cross_street, county, city, city_state, city_zip, title, basin_plan, p_breed, began, period_start, period_end, dairy_id
  ], (err, result) => {

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
    city_state, city_zip, is_owner, is_operator, is_responsible } = req.body
  db.insertOperator(
    [
      dairy_id, title, primary_phone, secondary_phone, street, city,
      city_state, city_zip, is_owner, is_operator, is_responsible
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
app.get("/api/operators/is_owner/:is_owner/:dairy_id", (req, res) => {
  db.getOperatorsByOwnerStatus([req.params.is_owner, req.params.dairy_id],
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      res.json({ "test": "Get all operators by owner status unsuccessful" });
    })
});
app.get("/api/operators/is_operator/:is_operator/:dairy_id", (req, res) => {
  db.getOperatorsByOperatorStatus([req.params.is_operator, req.params.dairy_id],
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      res.json({ "test": "Get all operators by operator status unsuccessful" });
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
    is_operator,
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
    is_operator,
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
  const {
    dairy_id,
    field_crop_id,
    sample_date,
    harvest_date,
    expected_yield_tons_acre,
    method_of_reporting,
    actual_yield,
    src_of_analysis,
    moisture,
    n,
    p,
    k,
    tfs,
    n_dl,
    p_dl,
    k_dl,
    tfs_dl,
    n_lbs_acre,
    p_lbs_acre,
    k_lbs_acre,
    salt_lbs_acre
  } = req.body
  db.insertFieldCropHarvest(
    [
      dairy_id,
      field_crop_id,
      sample_date,
      harvest_date,
      expected_yield_tons_acre,
      method_of_reporting,
      actual_yield,
      src_of_analysis,
      moisture,
      n,
      p,
      k,
      tfs,
      n_dl,
      p_dl,
      k_dl,
      tfs_dl,
      n_lbs_acre,
      p_lbs_acre,
      k_lbs_acre,
      salt_lbs_acre
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
    ca_con,
    mg_con,
    na_con,
    hco3_con,
    co3_con,
    so4_con,
    cl_con,
    ec,
    tds,
    kn_dl,
    nh4_dl,
    nh3_dl,
    no3_dl,
    p_dl,
    k_dl,
    ca_dl,
    mg_dl,
    na_dl,
    hco3_dl,
    co3_dl,
    so4_dl,
    cl_dl,
    ec_dl,
    tds_dl,
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
      ca_con,
      mg_con,
      na_con,
      hco3_con,
      co3_con,
      so4_con,
      cl_con,
      ec,
      tds,
      kn_dl,
      nh4_dl,
      nh3_dl,
      no3_dl,
      p_dl,
      k_dl,
      ca_dl,
      mg_dl,
      na_dl,
      hco3_dl,
      co3_dl,
      so4_dl,
      cl_dl,
      ec_dl,
      tds_dl,
      ph,
    ].map(el => el === null ? 0 : el),
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
        console.log(req.params.dairy_id, result.rows)
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
    tds,
    n_dl,
    nh4_dl,
    no2_dl,
    ca_dl,
    mg_dl,
    na_dl,
    hco3_dl,
    co3_dl,
    so4_dl,
    cl_dl,
    ec_dl,
    tds_dl
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
      n_dl,
      nh4_dl,
      no2_dl,
      ca_dl,
      mg_dl,
      na_dl,
      hco3_dl,
      co3_dl,
      so4_dl,
      cl_dl,
      ec_dl,
      tds_dl
    ].map(el => el === null ? 0 : el),
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
  console.log('Creating freshwater', req.body)

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
    tfs,
    n_dl,
    p_dl,
    k_dl,
    ca_dl,
    mg_dl,
    na_dl,
    s_dl,
    cl_dl,
    tfs_dl,
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
      tfs,
      n_dl,
      p_dl,
      k_dl,
      ca_dl,
      mg_dl,
      na_dl,
      s_dl,
      cl_dl,
      tfs_dl,
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created field_crop_app_solidmanure_analysis unsuccessful" });
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
      res.json({ "test": "Created field_crop_app_solidmanure unsuccessful" });
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
app.post("/api/field_crop_app_solidmanure/delete", (req, res) => {
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


app.post("/api/nutrient_import/create", (req, res) => {
  console.log("Creating.... nutrient_import", req.body)
  const {
    dairy_id,
    import_desc,
    import_date,
    material_type,
    amount_imported,
    method_of_reporting,
    moisture,
    n_con,
    p_con,
    k_con,
    salt_con
  } = req.body
  db.insertNutrientImport(
    [
      dairy_id,
      import_desc,
      import_date,
      material_type,
      amount_imported,
      method_of_reporting,
      moisture,
      n_con,
      p_con,
      k_con,
      salt_con
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created nutrient_import unsuccessful" });
    }
  )
});

app.get("/api/nutrient_import/:dairy_id", (req, res) => {

  db.getNutrientImport(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all nutrient_import unsuccessful" });
    })
});
app.get("/api/nutrient_import/material_type/:material_type/:dairy_id", (req, res) => {

  db.getNutrientImportByMaterialType([req.params.material_type, req.params.dairy_id],
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all nutrient_import by material_type unsuccessful" });
    })
});
app.get("/api/nutrient_import/wastewater/:dairy_id", (req, res) => {

  db.getNutrientImportByWastewater(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all nutrient_import by wastewater unsuccessful" });
    })
});
app.post("/api/nutrient_import/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmNutrientImport(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted nutrient_import successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted nutrient_import unsuccessful" });
  })
});


app.post("/api/field_crop_app_fertilizer/create", (req, res) => {
  console.log("Creating.... fertilizer", req.body)
  const {
    dairy_id,
    field_crop_app_id,
    nutrient_import_id,
    amount_applied,
    n_lbs_acre,
    p_lbs_acre,
    k_lbs_acre,
    salt_lbs_acre
  } = req.body
  db.insertFieldCropApplicationFertilizer(
    [
      dairy_id,
      field_crop_app_id,
      nutrient_import_id,
      amount_applied,
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
      res.json({ "test": "Created field_crop_app_fertilizer unsuccessful" });
    }
  )
});
app.get("/api/field_crop_app_fertilizer/:dairy_id", (req, res) => {

  db.getFieldCropApplicationFertilizer(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_app_fertilizer unsuccessful" });
    })
});
app.post("/api/field_crop_app_fertilizer/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropApplicationFertilizer(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field_crop_app_fertilizer successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop_app_fertilizer unsuccessful" });
  })
});

app.post("/api/field_crop_app_soil_analysis/create", (req, res) => {
  console.log("Creating.... soil analysis", req.body)
  const {
    dairy_id,
    field_id,
    sample_desc,
    sample_date,
    src_of_analysis,
    n_con,
    total_p_con,
    p_con,
    k_con,
    ec,
    org_matter,
    n_dl,
    total_p_dl,
    p_dl,
    k_dl,
    ec_dl,
    org_matter_dl
  } = req.body
  db.insertFieldCropApplicationSoilAnalysis(
    [
      dairy_id,
      field_id,
      sample_desc,
      sample_date,
      src_of_analysis,
      n_con,
      total_p_con,
      p_con,
      k_con,
      ec,
      org_matter,
      n_dl,
      total_p_dl,
      p_dl,
      k_dl,
      ec_dl,
      org_matter_dl
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created field_crop_app_soil_analysis unsuccessful" });
    }
  )
});
app.get("/api/field_crop_app_soil_analysis/:dairy_id", (req, res) => {

  db.getFieldCropApplicationSoilAnalysis(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_app_soil_analysis unsuccessful" });
    })
});
app.post("/api/field_crop_app_soil_analysis/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropApplicationSoilAnalysis(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted field_crop_app_soil_analysis successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop_app_soil_analysis unsuccessful" });
  })
});

app.post("/api/field_crop_app_soil/create", (req, res) => {
  console.log("Creating.... soil", req.body)
  const {
    dairy_id,
    field_crop_app_id,
    src_desc,
    n_lbs_acre,
    p_lbs_acre,
    k_lbs_acre,
    salt_lbs_acre
  } = req.body
  db.insertFieldCropApplicationSoil(
    [
      dairy_id,
      field_crop_app_id,
      src_desc,
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
      res.json({ "test": "Created field_crop_app_soil unsuccessful" });
    }
  )
});
app.get("/api/field_crop_app_soil/:dairy_id", (req, res) => {

  db.getFieldCropApplicationSoil(req.params.dairy_id,
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_app_soil unsuccessful" });
    })
});
app.post("/api/field_crop_app_soil/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropApplicationSoil(req.body.pk, (err, result) => {
    if (!err) {
      res.json({ "test": "Deleted field_crop_app_soil successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop_app_soil unsuccessful" });
  })
});

app.post("/api/field_crop_app_plowdown_credit/create", (req, res) => {
  console.log("Creating.... plowdown credit", req.body)
  const {
    dairy_id,
    field_crop_app_id,
    src_desc,
    n_lbs_acre,
    p_lbs_acre,
    k_lbs_acre,
    salt_lbs_acre
  } = req.body
  db.insertFieldCropApplicationPlowdownCredit(
    [
      dairy_id,
      field_crop_app_id,
      src_desc,
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
      res.json({ "test": "Created field_crop_app_plowdown_credit unsuccessful" });
    }
  )
});
app.get("/api/field_crop_app_plowdown_credit/:dairy_id", (req, res) => {
  db.getFieldCropApplicationPlowdownCredit(req.params.dairy_id,
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all field_crop_app_plowdown_credit unsuccessful" });
    })
});
app.post("/api/field_crop_app_plowdown_credit/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmFieldCropApplicationPlowdownCredit(req.body.pk, (err, result) => {
    if (!err) {
      res.json({ "test": "Deleted field_crop_app_plowdown_credit successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted field_crop_app_plowdown_credit unsuccessful" });
  })
});

app.post("/api/drain_source/create", (req, res) => {
  console.log("Creating.... drain source", req.body)
  const {
    dairy_id,
    src_desc,
  } = req.body
  db.insertDrainSource(
    [
      dairy_id,
      src_desc,
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created drain_source unsuccessful" });
    }
  )
});
app.get("/api/drain_source/:dairy_id", (req, res) => {
  db.getDrainSource(req.params.dairy_id,
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all drain_source unsuccessful" });
    })
});
app.post("/api/drain_source/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmDrainSource(req.body.pk, (err, result) => {
    if (!err) {
      res.json({ "test": "Deleted drain_source successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted drain_source unsuccessful" });
  })
});

app.post("/api/drain_analysis/create", (req, res) => {
  console.log("Creating.... drain source", req.body)
  const {
    dairy_id,
    drain_source_id,
    sample_date,
    sample_desc,
    src_of_analysis,
    nh4_con,
    no2_con,
    p_con,
    ec,
    tds,
    nh4_dl,
    no2_dl,
    p_dl,
    ec_dl,
    tds_dl
  } = req.body
  db.insertDrainAnalysis(
    [
      dairy_id,
      drain_source_id,
      sample_date,
      sample_desc,
      src_of_analysis,
      nh4_con,
      no2_con,
      p_con,
      ec,
      tds,
      nh4_dl,
      no2_dl,
      p_dl,
      ec_dl,
      tds_dl
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created drain_analysis unsuccessful" });
    }
  )
});
app.get("/api/drain_analysis/:dairy_id", (req, res) => {
  db.getDrainAnalysis(req.params.dairy_id,
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all drain_analysis unsuccessful" });
    })
});
app.post("/api/drain_analysis/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmDrainAnalysis(req.body.pk, (err, result) => {
    if (!err) {
      res.json({ "test": "Deleted drain_analysis successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted drain_analysis unsuccessful" });
  })
});

app.post("/api/export_hauler/create", (req, res) => {
  console.log("Creating.... export_hauler", req.body)
  const {
    dairy_id,
    title,
    first_name,

    primary_phone,
    street,
    cross_street,
    county,
    city,
    city_state,
    city_zip
  } = req.body
  db.insertExportHauler(
    [
      dairy_id,
      title,
      first_name,

      primary_phone,
      street,
      cross_street,
      county,
      city,
      city_state,
      city_zip
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created export_hauler unsuccessful" });
    }
  )
});
app.get("/api/export_hauler/:dairy_id", (req, res) => {

  db.getExportHauler(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all export_hauler unsuccessful" });
    })
});
app.post("/api/export_hauler/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmExportHauler(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted export_hauler successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted export_hauler unsuccessful" });
  })
});

app.post("/api/export_contact/create", (req, res) => {
  console.log("Creating.... export_contact", req.body)
  const {
    dairy_id,
    first_name,

    primary_phone
  } = req.body
  db.insertExportContact(
    [
      dairy_id,
      first_name,

      primary_phone
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created export_contact unsuccessful" });
    }
  )
});
app.get("/api/export_contact/:dairy_id", (req, res) => {

  db.getExportContact(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all export_contact unsuccessful" });
    })
});
app.post("/api/export_contact/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmExportContact(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted export_contact successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted export_contact unsuccessful" });
  })
});


app.post("/api/export_recipient/create", (req, res) => {
  console.log("Creating.... export recipient", req.body)
  const {
    dairy_id,
    dest_type,
    title,
    primary_phone,
    street,
    cross_street,
    county,
    city,
    city_state,
    city_zip
  } = req.body
  db.insertExportRecipient(
    [
      dairy_id,
      dest_type,
      title,
      primary_phone,
      street,
      cross_street,
      county,
      city,
      city_state,
      city_zip
    ],
    (err, result) => {

      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created export_recipient unsuccessful" });
    }
  )
});
app.get("/api/export_recipient/:dairy_id", (req, res) => {

  db.getExportRecipient(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all export_recipient unsuccessful" });
    })
});
app.post("/api/export_recipient/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmExportRecipient(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted export_recipient successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted export_recipient unsuccessful" });
  })
});


app.post("/api/export_dest/create", (req, res) => {
  console.log("Creating.... export_dest", req.body)
  const {
    dairy_id,
    export_recipient_id,
    pnumber,
    street,
    cross_street,
    county,
    city,
    city_state,
    city_zip
  } = req.body
  db.insertExportDest(
    [
      dairy_id,
      export_recipient_id,
      pnumber,
      street,
      cross_street,
      county,
      city,
      city_state,
      city_zip
    ],
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created export_dest unsuccessful" });
    }
  )
});
app.get("/api/export_dest/:dairy_id", (req, res) => {
  console.log("Getting export_dest:", req.params.dairy_id)
  db.getExportDest(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all export_dest unsuccessful" });
    })
});
app.post("/api/export_dest/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmExportDest(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted export_dest successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted export_dest unsuccessful" });
  })
});


app.post("/api/export_manifest/create", (req, res) => {
  console.log("Creating.... export_manifest", req.body)
  const {
    dairy_id,
    operator_id,
    export_contact_id,
    export_hauler_id,
    export_dest_id,
    last_date_hauled,
    amount_hauled,
    material_type,
    amount_hauled_method,

    reporting_method,
    moisture,
    n_con_mg_kg,
    p_con_mg_kg,
    k_con_mg_kg,
    tfs,
    salt_lbs_rm,

    n_con_mg_l,
    kn_con_mg_l,
    nh4_con_mg_l,
    nh3_con_mg_l,
    no3_con_mg_l,
    p_con_mg_l,
    k_con_mg_l,
    ec_umhos_cm,
    tds,

    n_lbs_rm,
    p_lbs_rm,
    k_lbs_rm
  } = req.body
  db.insertExportManifest(
    [
      dairy_id,
      operator_id,
      export_contact_id,
      export_hauler_id,
      export_dest_id,
      last_date_hauled,
      amount_hauled,
      material_type,
      amount_hauled_method,

      reporting_method,
      moisture,
      n_con_mg_kg,
      p_con_mg_kg,
      k_con_mg_kg,

      tfs,
      salt_lbs_rm,

      n_con_mg_l,
      nh4_con_mg_l,
      nh3_con_mg_l,
      no3_con_mg_l,
      p_con_mg_l,
      k_con_mg_l,
      ec_umhos_cm,
      tds,

      n_lbs_rm,
      p_lbs_rm,
      k_lbs_rm
    ],
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created export_manifest unsuccessful" });
    }
  )
});
app.get("/api/export_manifest/:dairy_id", (req, res) => {

  db.getExportManifest(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log("Export manifest", err)
      res.json({ "test": "Get all export_manifest unsuccessful" });
    })
});
app.get("/api/export_manifest/wastewater/:dairy_id", (req, res) => {

  db.getExportManifestByWastewater(req.params.dairy_id,
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log("Export manifest wastewater", err)
      res.json({ "test": "Get all export_manifest wastewater unsuccessful" });
    })
});
app.get("/api/export_manifest/material_type/:material_type/:dairy_id", (req, res) => {

  db.getExportManifestByMaterialType([req.params.material_type, req.params.dairy_id],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log("Export manifest", err)
      res.json({ "test": "Get all export_manifest unsuccessful" });
    })
});
app.post("/api/export_manifest/delete", (req, res) => {
  console.log("Deleting....", req.body.pk)
  db.rmExportManifest(req.body.pk, (err, result) => {

    if (!err) {
      res.json({ "test": "Deleted export_manifest successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted export_manifest unsuccessful" });
  })
});


app.post("/api/discharge/create", (req, res) => {
  console.log("Creating.... discharge", req.body)
  const {
    dairy_id,
    discharge_type,
    discharge_datetime,
    discharge_loc,
    vol,
    vol_unit,
    duration_of_discharge,
    discharge_src,
    method_of_measuring,
    sample_location_reason,
    ref_number
  } = req.body
  db.insertDischarge(
    [
      dairy_id,
      discharge_type,
      discharge_datetime,
      discharge_loc,
      vol,
      vol_unit,
      duration_of_discharge,
      discharge_src,
      method_of_measuring,
      sample_location_reason,
      ref_number
    ],
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created discharge unsuccessful" });
    }
  )
});
app.get("/api/discharge/:dairy_id", (req, res) => {
  db.getDischarge(req.params.dairy_id,
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all discharge unsuccessful" });
    })
});
app.post("/api/discharge/delete", (req, res) => {
  console.log("Deleting.... discharge", req.body.pk)
  db.rmDischarge(req.body.pk, (err, result) => {
    if (!err) {
      res.json({ "test": "Deleted discharge successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted discharge unsuccessful" });
  })
});


app.post("/api/agreement/create", (req, res) => {
  console.log("Creating.... agreement", req.body)
  const {
    dairy_id,
    nmp_updated,
    nmp_developed,
    nmp_approved,
    new_agreements
  } = req.body
  db.insertAgreement(
    [
      dairy_id,
      nmp_updated,
      nmp_developed,
      nmp_approved,
      new_agreements
    ],
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created agreement unsuccessful" });
    }
  )
});
app.get("/api/agreement/:dairy_id", (req, res) => {
  db.getAgreement(req.params.dairy_id,
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all agreement unsuccessful" });
    })
});
app.post("/api/agreement/delete", (req, res) => {
  console.log("Deleting.... agreement", req.body.pk)
  db.rmAgreement(req.body.pk, (err, result) => {
    if (!err) {
      res.json({ "test": "Deleted agreement successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted agreement unsuccessful" });
  })
});
app.post("/api/agreement/update", (req, res) => {
  console.log("Updating.... agreement", req.body)
  const {
    nmp_updated,
    nmp_developed,
    nmp_approved,
    new_agreements, pk
  } = req.body
  db.updateAgreement([
    nmp_updated,
    nmp_developed,
    nmp_approved,
    new_agreements, pk
  ], (err, result) => {

    if (!err) {
      res.json({ "test": "Updated agreement successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Updated agreement unsuccessful" });
  })
});


app.post("/api/note/create", (req, res) => {
  console.log("Creating.... note", req.body)
  const {
    dairy_id,
    note
  } = req.body
  db.insertNote(
    [
      dairy_id,
      note
    ],
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created note unsuccessful" });
    }
  )
});
app.get("/api/note/:dairy_id", (req, res) => {
  db.getNote(req.params.dairy_id,
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all note unsuccessful" });
    })
});
app.post("/api/note/delete", (req, res) => {
  console.log("Deleting.... note", req.body.pk)
  db.rmNote(req.body.pk, (err, result) => {
    if (!err) {
      res.json({ "test": "Deleted note successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted note unsuccessful" });
  })
});
app.post("/api/note/update", (req, res) => {
  console.log("Updating.... note", req.body)
  const {
    note, pk
  } = req.body
  db.updateNote([
    note, pk
  ], (err, result) => {

    if (!err) {
      res.json({ "test": "Updated note successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Updated note unsuccessful" });
  })
});

app.post("/api/certification/create", (req, res) => {
  console.log("Creating.... certification", req.body)
  const {
    dairy_id,
    owner_id,
    operator_id,
    responsible_id
  } = req.body
  db.insertCertification(
    [
      dairy_id,
      owner_id,
      operator_id,
      responsible_id
    ],
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Created certification unsuccessful" });
    }
  )
});
app.get("/api/certification/:dairy_id", (req, res) => {
  db.getCertification(req.params.dairy_id,
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Get all certification unsuccessful" });
    })
});
app.post("/api/certification/delete", (req, res) => {
  console.log("Deleting.... certification", req.body.pk)
  db.rmCertification(req.body.pk, (err, result) => {
    if (!err) {
      res.json({ "test": "Deleted certification successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Deleted certification unsuccessful" });
  })
});
app.post("/api/certification/update", (req, res) => {
  console.log("Updating.... certification", req.body)
  const {
    owner_id,
    operator_id,
    responsible_id, pk
  } = req.body
  db.updateCertification([
    owner_id,
    operator_id,
    responsible_id, pk
  ], (err, result) => {

    if (!err) {
      res.json({ "test": "Updated certification successfully" });
      return;
    }
    console.log(err)
    res.json({ "test": "Updated certification unsuccessful" });
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
// import_date, material_type, import_desc
app.get("/api/search/nutrient_import/:import_date/:material_type/:import_desc/:dairy_pk", (req, res) => {
  db.searchNutrientImport(
    [
      req.params.import_date,
      req.params.material_type,
      req.params.import_desc,
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all nutrient_import unsuccessful" });
    })
});

//Exports 
// title, primary_phone
app.get("/api/search/operators/:title/:primary_phone/:dairy_pk", (req, res) => {
  db.searchOperators(
    [
      req.params.title,
      req.params.primary_phone,
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all operators unsuccessful" });
    })
});
// title, first_name, primary_phone, street, city_zip
app.get("/api/search/export_hauler/:title/:first_name/:primary_phone/:street/:city_zip/:dairy_pk", (req, res) => {
  db.searchExportHauler(
    [
      req.params.title,
      req.params.first_name,
      req.params.primary_phone,
      req.params.street,
      req.params.city_zip,
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all export_hauler unsuccessful" });
    })
});
app.get("/api/search/export_contact/:first_name/:primary_phone/:dairy_pk", (req, res) => {
  db.searchExportContact(
    [
      req.params.first_name,
      req.params.primary_phone,
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all export_hauler unsuccessful" });
    })
});

//title, street, city_zip, primary_phone
app.get("/api/search/export_recipient/:title/:street/:city_zip/:primary_phone/:dairy_pk", (req, res) => {
  db.searchExportRecipient(
    [
      req.params.title,
      req.params.street,
      req.params.city_zip,
      req.params.primary_phone,
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all export_recipient unsuccessful" });
    })
});

// export_recipient_id, pnumber, street, city_zip
app.get("/api/search/export_dest/:export_recipient_id/:pnumber/:street/:city_zip/:dairy_pk", (req, res) => {
  db.searchExportDest(
    [
      req.params.export_recipient_id,
      req.params.pnumber === "*" ? "" : req.params.pnumber,
      req.params.street,
      req.params.city_zip,
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all export_recipient unsuccessful" });
    })
});
////////////////////////////////

app.get("/api/search/field_crop_app_soil_analysis/:field_id/:sample_date/:dairy_pk", (req, res) => {
  db.searchFieldCropApplicationSoilAnalysis(
    [
      req.params.field_id,
      req.params.sample_date,
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all field_crop_app_soil_analysis unsuccessful" });
    })
});


app.get("/api/search/drain_source/:src_desc/:dairy_pk", (req, res) => {
  db.searchDrainSource(
    [
      req.params.src_desc,
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {

        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all drain_source unsuccessful" });
    })
});

app.get("/api/search/certification/:no_val/:dairy_pk", (req, res) => {
  db.searchCertification(
    [
      req.params.dairy_pk,
    ],
    (err, result) => {
      if (!err) {
        res.json(result.rows)
        return;
      }
      console.log(err)
      res.json({ "test": "Search all certifications unsuccessful" });
    })
});




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

