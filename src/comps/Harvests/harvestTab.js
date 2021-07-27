import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers';
import AddIcon from '@material-ui/icons/Add'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';
import HarvestView from "./harvestView"
import AddFieldCropHarvestModal from '../Modals/addFieldCropHarvestModal'
import UploadHarvestCSVModal from '../Modals/uploadHarvestCSVModal'
import ViewTSVsModal from "../Modals/viewTSVsModal"
import { get, post } from '../../utils/requests';
import { MG_KG, KG_MG } from '../../utils/convertCalc'
import { isEmpty } from "../../utils/valid"


const BASE_URL = "http://localhost:3001"
const BASIS = ['As-is', "Dry wt"]

class HarvestTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      field_crops: [], // The planted crops to choose from to create a harvest event in field_crop_harvest DB table
      field_crop_harvests: [],
      showAddFieldCropHarvestModal: false,
      showUploadCSV: false,
      csvText: "",
      uploadedFilename: "",
      updateFieldCropHarvestObj: {}, // PK: {all data for field_crop harvest that is updatable...}
      groupedField_crop_harvests: {},
      showViewTSVsModal: false,
      createFieldCropHarvestObj: {
        harvest_date: new Date(),
        field_crop_idx: 0,
        basis_idx: 0,
        density: 0,
        actual_yield: 0,
        moisture: 0,
        n: 0,
        p: 0,
        k: 0,
        tfs: 0
      } // TODO fill out required keys to create object....
    }
  }
  static getDerivedStateFromProps(props, state) {
    return state
  }
  componentDidMount() {
    this.getAllFieldCrops()
    this.getAllFieldCropHarvests()
   
  }
  getAllFieldCrops() {
    get(`${BASE_URL}/api/field_crop/${this.state.dairy.pk}`)
      .then(res => {
        console.log(res)
        this.setState({ field_crops: res })
      })
      .catch(err => {
        console.log(err)
      })
  }

  /**
   * {
   *  field:{
   *    plant_date:{
   *      [field_crop_harvest events, ...]
   *    }
   *  }
   * }
   */
  groupFieldCropHarvestByField(harvests) {
    let grouped = {}
    harvests.forEach(harvest => {
      const { fieldtitle, plant_date, harvest_date } = harvest
      let field = grouped[fieldtitle]


      if (field) {
        // Get list of harvest events at plant_date for field
        let field_crop_list = field[plant_date]
        if (field_crop_list) {
          // if there is a harvest event on this plant_date, add this harvest event
          field_crop_list.push(harvest)
          field[plant_date] = field_crop_list
        } else {
          // If no plant_date for this field, add the plant_date to the field w/ harvest event.
          field[plant_date] = [harvest]
          grouped[fieldtitle] = field
        }
      } else {
        // If field doesnt exist, create full entry
        grouped[fieldtitle] = {
          [plant_date]: [harvest]
        }
      }
    })

    console.log("Grouped", grouped)
    return grouped
  }

  toggleShowAddFieldCropHarvestModal(val) {
    this.setState({ showAddFieldCropHarvestModal: val })
  }

  onCreateFieldCropHarvestChange(ev) {
    let createObj = this.state.createFieldCropHarvestObj
    if (ev.target) {
      const { name, value } = ev.target
      createObj[name] = value
      this.setState({ createFieldCropHarvestObj: createObj })
    } else {
      createObj['harvest_date'] = ev
      this.setState({ createFieldCropHarvestObj: createObj })
    }

  }
  createFieldCropHarvest() {
    const field_crop_idx = this.state.createFieldCropHarvestObj.field_crop_idx
    console.log("Creating field crop harvest", this.state.field_crops, field_crop_idx)
    const field_crop_id = this.state.field_crops[field_crop_idx].pk
    const basis_idx = this.state.createFieldCropHarvestObj.basis_idx
    const basis = BASIS[basis_idx]

    console.log("Create field crop harvest w/ field_crop id: ", field_crop_id, basis)

    let data = {
      ...this.state.createFieldCropHarvestObj,
      dairy_id: this.state.dairy.pk,
      basis: basis,
      field_crop_id: field_crop_id
    }
    post(`${BASE_URL}/api/field_crop_harvest/create`, data)
      .then(res => {
        console.log(res)
        this.toggleShowAddFieldCropHarvestModal(false)
        this.getAllFieldCropHarvests()
      })
      .catch(err => {
        console.log(err)
      })
  }
  getAllFieldCropHarvests() {
    get(`${BASE_URL}/api/field_crop_harvest/${this.state.dairy.pk}`)
      .then(res => {
        this.groupFieldCropHarvestByField(res)
        this.setState({ field_crop_harvests: res, groupedField_crop_harvests: this.groupFieldCropHarvestByField(res) })
      })
      .catch(err => {
        console.log(err)
      })
  }
  onUpdateFieldCropHarvestChange(index, data, ev) {
    const { name, value } = ev.target

    // Changing structure, need to change where the value is updating, since its coming from new source/ data format.

    let harvests = this.state.groupedField_crop_harvests

    let harvestObj = harvests[data.fieldtitle][data.plant_date][index]

    if (['actual_n', 'actual_p', 'actual_k',].indexOf(name) >= 0) {
      harvestObj[name] = KG_MG(parseFloat(value))                    // update the value of the object
    } else {
      harvestObj[name] = value
    }

    harvests[data.fieldtitle][data.plant_date][index] = harvestObj

    let updates = this.state.updateFieldCropHarvestObj // get current updates, empty in the beginning
    updates[data.pk] = data

    console.log(index, name, KG_MG(parseFloat(value)))
    this.setState({ updateFieldCropHarvestObj: updates, groupFieldCropHarvestByField: harvests })
  }

  updateFieldCropHarvest() {
    console.log("Updates", this.state.updateFieldCropHarvestObj)
    let promises = Object.keys(this.state.updateFieldCropHarvestObj).map(pk => {
      let obj = this.state.updateFieldCropHarvestObj[pk]
      // rename
      const {
        harvest_date, actual_yield, basis, density, actual_moisture: moisture, actual_n: n, actual_p: p, actual_k: k, tfs
      } = obj
      let data = { harvest_date, actual_yield, basis, density, moisture, n, p, k, tfs, pk }
      return (
        post(`${BASE_URL}/api/field_crop_harvest/update`, data)
      )
    })

    Promise.all(promises)
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
  }

  toggleShowUploadCSV(val) {
    this.setState({ showUploadCSV: val })
  }
  onCSVChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      this.readCSV(files[0])
    }
  }
  // File reader, reads as Text, CSV, TSV tested. Using TSV since commas are present in fields
  readCSV(file) {
    const reader = new FileReader()
    reader.addEventListener('load', (ev) => {
      const { result } = ev.target
      this.setState({ csvText: result, uploadedFilename: file.name })
    });
    reader.readAsText(file)
  }
  // helper
  processCSVText(csvText) {
    console.log("Processing CSV Text")
    // Field,Acres,Crop,Plant Date,Harvest Dates,Expected Yield Tons/Acre,Actual Yield Tons/Acre,Actual Yield Total Tons,Reporting Method,% Moisture,% N,% P,% K,% TFS    Salt  (Dry Basis),Lbs/Acre N,Lbs/Acre P,Lbs/Acre K,Lbs/Acre Salt
    let lines = csvText.split("\n")
    let started = false
    let rows = []
    lines.forEach((line, i) => {
      let cols = line.split("\t").slice(0, -4)
      if (cols[0]) {
        if (started) {
          rows.push(cols)
        }
        else if (cols[0] == "Start") {
          started = true
        }
      }
    })
    return rows
  }
  /** helper
   * Creating from CSV assumes that each row is a new harvest event(field_crop_harvest).
   
  *   Deciding to not modify identifying information for fields, field_crop and field_crop_harvest
  
  
  * It will look for existing fields and Field crops( when crop was planted).
   *     -- If it cannot find a field or  crop by title, it will create it
   *        -- If it cannot find a field_crop by the Plant date and Field, it will create a new one
   * 
   *    -- ** This means, field title, crop title, plant date, or harvest date should not be
   *                   modified to avoid confusion by the user.
   * 
  */
  createFieldsFromCSV(fields) {
    // Helper to create all fields in spreadsheet since they are parents of everything else
    // There is an issue when multiple rows try to create a field and there is a race condition conflict.
    let promises = fields.map(field => {
      let data = {
        data: {
          dairy_id: this.state.dairy.pk,
          title: field[0],
          acres: field[1],
          cropable: field[2]
        }
      }
      return new Promise((res, rej) => {
        post(`${BASE_URL}/api/fields/create`, data)
          .then(result => {
            res(result)
          })
          .catch(error => {
            res(error)
          })
      })
    })
    return Promise.all(promises)
  }

  createFieldSet(rows){
    let fields = []
    let fieldSet = new Set()
    // Create a set of fields to ensure duplicates are not attempted.
    rows.forEach(row => {
      const [
        field_title, acres_planted, cropable, acres, crop_title, crop_title1, plant_date, harvest_date, typical_yield, actual_yield_tons_per_acre,
        actual_yield_tons, basis, actual_moisture, actual_n, actual_p, actual_k, tfs
      ] = row
      if (!fieldSet.has(field_title)) {
        fields.push([field_title, acres, cropable])
        fieldSet.add(field_title)
      }
    })
    return fields
  }

  uploadTSVToDB(){
    console.log("Uploading TSV to DB", this.state.uploadedFilename, this.state.csvText)
    post(`${BASE_URL}/api/tsv/create`, {
      title: this.state.uploadedFilename,
      data: this.state.csvText,
      dairy_id: this.state.dairy.pk
    })
    .then(res => {
      console.log("Uploaded to DB: ", res)
    })
    .catch(err => {
      console.log(err)
    })
  }
  // Triggered when user presses Add btn in Modal
  uploadCSV() {
    console.log("Uploading CSV")
    let rows = this.processCSVText(this.state.csvText)

    // Create a set of fields to ensure duplicates are not attempted.
    let fields = this.createFieldSet(rows)   
    this.uploadTSVToDB() // remove this when done testing, do this after the data was successfully create in DB



    this.createFieldsFromCSV(fields)      // Create fields before proceeding
      .then(createFieldRes => {
        console.log(createFieldRes)
        let result_promises = rows.map((row, i) => {
          return this.createDataFromCSVListRow(row, i)    // Create entries for ea row in TSV file
        })

        Promise.all(result_promises)            // Execute promises to create field_crop && field_crop_harvet entries in the DB
          .then(res => {
            console.log("Completed Results")
            console.log(res)
            this.toggleShowUploadCSV(false)
            this.getAllFieldCropHarvests()
            // If successful store tsv data
            // this.uploadTSVToDB()     // TODO() remove once done testing

          })
          .catch(err => {
            console.log("Error with all promises")
            console.log(err)
          })
      })
      .catch(createFieldErr => {
        console.log(createFieldErr)
      })



  }
  /**
   *  Returns the obj requested or creates and returns it.
   * 
   *  endpoint for get must match /api/search/endpoint/value/dairy_id
   *  endpoint for post must match /api/endpoint/create
   * 
   * @param {*} endpoint  the targeted database table == table name
   * @param {*} value     the value use to search the table
   * @param {*} data      the data to create the entry if not found
   * @returns             an entry from a database table
   */
  lazyGet(endpoint, value, data = {}) {
    return new Promise((resolve, rej) => {
      get(`${BASE_URL}/api/search/${endpoint}/${value}/${this.state.dairy.pk}`)
        .then(res => {
          if (Object.keys(res).length == 0) {
            // Create Object
            post(`${BASE_URL}/api/${endpoint}/create`, data)
              .then(result => {
                resolve(result)
              })
              .catch(error => {
                rej(error)
              })
          } else {
            resolve(res)
          }
        })
        .catch(err => {
          rej(err)
        })
    })
  }
  createDataFromCSVListRow(row, i) {
    console.log("Creating db entreis for data:: ", row)
    // Spreadsheet Row Headers
    // Field	Acres_Planted	cropable	Total_Acres		Crop	Plant_Date	Harvest_Dates	Expected_Yield(Tons/Acre)	
    //  Actual_Yield(Tons/Acre)	Actual_Yield(Total Tons)	Reporting_Method	% Moisture	%N	%P	%K	%TFSSalt(Dry Basis)
    const [
      field_title, acres_planted, cropable, acres, crop_title, crop_title1, plant_date, harvest_date, typical_yield, actual_yield_tons_per_acre,
      actual_yield_tons, basis, actual_moisture, actual_n, actual_p, actual_k, tfs
    ] = row


    let fieldData = {
      data: {
        title: field_title,
        cropable: cropable,
        acres: acres,
        dairy_id: this.state.dairy.pk
      }
    }

    return new Promise((resolve, rej) => {
      // Get Field and Crop
      Promise.all([
        this.lazyGet('fields', field_title, fieldData),
        get(`${BASE_URL}/api/crops/${crop_title}`)
      ])
        .then(res => {
          let fieldObj = res[0][0] // res = [res1, res2], res1=[data]
          let cropObj = res[1][0]

          if (fieldObj) {
            console.log(`Found Field: ${fieldObj.title} for row ${i}`, fieldObj)
            if (cropObj) {
              console.log(`Found Crop: ${cropObj.title} for row ${i}`, cropObj)
              // Get Field_Crop, possibly created
              // Now we can create a field_crop with:
              //    fieldObj, cropObj, and [from testRow[i] -> ]plant_date[6], acres_planted[1], [from crops -> ]typical_yield, moisture, n, p, k, salt
              const { typical_yield, moisture: typical_moisture, n: typical_n, p: typical_p, k: typical_k, salt } = cropObj


              // /api/field_crop/value
              // /api/
              let field_crop_search_value = `${fieldObj.pk}/${cropObj.pk}/${encodeURIComponent(plant_date)}`

              let field_crop_data = {
                dairy_id: this.state.dairy.pk,
                field_id: fieldObj.pk,
                crop_id: cropObj.pk,
                plant_date: plant_date,
                acres_planted: acres_planted,
                typical_yield: typical_yield,
                moisture: typical_moisture,
                n: typical_n,
                p: typical_p,
                k: typical_k,
                salt: salt
              }

              this.lazyGet('field_crop', field_crop_search_value, field_crop_data)
                .then(field_crop_res => {
                  const fieldCropObj = field_crop_res[0]
                  // TODO() fieldCrobObj might be undefined
                  // Attempt to create harvest event in field_crop_harvest
                  // dairy_id, field_crop_id, harvest_date, density, basis, actual_yield, moisture, n,p,k,tfs
                  const field_crop_harvest_data = {
                    dairy_id: this.state.dairy.pk,
                    // field_id: fieldObj.pk,
                    field_crop_id: fieldCropObj.pk,
                    harvest_date: harvest_date,
                    basis: basis,
                    density: 0, // **this field is not in the sheet
                    actual_yield: parseFloat(actual_yield_tons),
                    moisture: actual_moisture,
                    n: actual_n,
                    p: actual_p,
                    k: actual_k,
                    tfs: tfs
                  }
                  post(`${BASE_URL}/api/field_crop_harvest/create`, field_crop_harvest_data)
                    .then(field_crop_harvest_res => {
                      resolve(field_crop_harvest_res)
                    })
                    .catch(field_crop_harvest_err => {
                      rej(field_crop_harvest_err)
                    })
                })
                .catch(field_crop_err => {
                  rej(field_crop_err)
                })
            } else {
              rej(res)
            }
          } else {
            rej(res)
          }
        })
        .catch(err => {
          rej(err)
        })
    })

  }

  toggleShowTSVsModal(val){
    this.setState({showViewTSVsModal: val})
  }

  render() {
    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
          <React.Fragment>
            <Button variant="outlined" fullWidth color="secondary"
              onClick={this.updateFieldCropHarvest.bind(this)}>
              Update Harvests
            </Button>
            <Button variant="outlined" fullWidth color="secondary"
              onClick={() => this.toggleShowTSVsModal(true)}>
              View TSVs
            </Button>
            <Button variant="outlined" fullWidth color="primary"
              onClick={() => this.toggleShowUploadCSV(true)}>
              Import Harvest from TSV Production Records Tab
            </Button>
            {
              this.state.field_crops.length > 0 ?
                <Grid item container xs={12}>
                  <Button variant="outlined" fullWidth color="primary"
                    onClick={() => this.toggleShowAddFieldCropHarvestModal(true)}>
                    Add new harvest
                  </Button>

                </Grid>
                :
                <React.Fragment></React.Fragment>
            }

            {
              Object.keys(this.state.groupedField_crop_harvests).length > 0 ?
                <HarvestView
                  dairy={this.state.dairy}
                  field_crop_harvests={this.state.field_crop_harvests}
                  groupedField_crop_harvests={this.state.groupedField_crop_harvests}
                  getAllFieldCropHarvests={this.getAllFieldCropHarvests.bind(this)}
                  onChange={this.onUpdateFieldCropHarvestChange.bind(this)}
                />
                :
                <React.Fragment></React.Fragment>
            }
          </React.Fragment>
          :
          <React.Fragment>Loading....</React.Fragment>
        }

        <ViewTSVsModal
          open={this.state.showViewTSVsModal}
          actionText="Upload"
          cancelText="Close"
          dairy_id={this.state.dairy.pk}
          onClose={() => this.toggleShowTSVsModal(false)}
        />

        <UploadHarvestCSVModal
          open={this.state.showUploadCSV}
          actionText="Upload"
          cancelText="Cancel"
          modalText={`Import TSV file, (must be a tab separated value file)`}
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.uploadCSV.bind(this)}
          onChange={this.onCSVChange.bind(this)}
          onClose={() => this.toggleShowUploadCSV(false)}
        />
        <AddFieldCropHarvestModal
          open={this.state.showAddFieldCropHarvestModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Select Field and Planted Crop`}
          field_crops={this.state.field_crops}
          createFieldCropHarvestObj={this.state.createFieldCropHarvestObj}
          basis={BASIS}
          onAction={this.createFieldCropHarvest.bind(this)}
          onChange={this.onCreateFieldCropHarvestChange.bind(this)}
          onClose={() => this.toggleShowAddFieldCropHarvestModal(false)}
        />
      </React.Fragment>

    )
  }
}

export default HarvestTab = withRouter(withTheme(HarvestTab))
