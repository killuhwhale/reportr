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
import {
  readTSV, processTSVText, createFieldSet, createFieldsFromTSV, createDataFromHarvestTSVListRow, uploadTSVToDB
} from "../../utils/TSV"


const REPORTING_METHODS  = ['dry-weight', 'as-is']
const SOURCE_OF_ANALYSES = ['Lab Analysis', 'Other/ estimated']
const BASE_URL = "http://localhost:3001"
const BASIS = ['As-is', "Dry wt"]

const NUM_COLS = 22

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
        sample_date: new Date(),
        field_crop_idx: 0,
        method_of_reporting_idx: 0,
        expected_yield_tons_acre: '',
        src_of_analysis: '',
        src_of_analysis_idx: 0,
        actual_yield: 0,
        moisture: 0,
        n: 0,
        p: 0,
        k: 0,
        tfs: 0,
        n_lbs_acre: 0,
        p_lbs_acre: 0,
        k_lbs_acre: 0,
        salt_lbs_acre: 0




 
    
    
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
    return grouped
  }

  toggleShowAddFieldCropHarvestModal(val) {
    this.setState({ showAddFieldCropHarvestModal: val })
  }

  onCreateFieldCropHarvestChange(ev) {
    let createObj = this.state.createFieldCropHarvestObj
    const { name, value } = ev.target
    createObj[name] = value
    this.setState({ createFieldCropHarvestObj: createObj })
  }
  createFieldCropHarvest() {
    const field_crop_idx = this.state.createFieldCropHarvestObj.field_crop_idx
    console.log("Creating field crop harvest", this.state.field_crops, field_crop_idx)
    const field_crop_id = this.state.field_crops[field_crop_idx].pk
    const method_of_reporting_idx = this.state.createFieldCropHarvestObj.method_of_reporting_idx
    const src_of_analysis_idx = this.state.createFieldCropHarvestObj.src_of_analysis_idx
    const method_of_reporting = REPORTING_METHODS[method_of_reporting_idx]
    const src_of_analysis = SOURCE_OF_ANALYSES[src_of_analysis_idx]
    
    console.log("Create field crop harvest w/ field_crop id: ", field_crop_id, method_of_reporting)

    let data = {
      ...this.state.createFieldCropHarvestObj,
      dairy_id: this.state.dairy.pk,
      method_of_reporting,
      src_of_analysis,
      field_crop_id
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
        harvest_date, actual_yield, method_of_reporting, density, actual_moisture: moisture, actual_n: n, actual_p: p, actual_k: k, tfs
      } = obj
      let data = { harvest_date, actual_yield, method_of_reporting, density, moisture, n, p, k, tfs, pk }
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
      readTSV(files[0], (ev) => {
        const { result } = ev.target
        this.setState({ csvText: result, uploadedFilename: files[0].name })
      })
    }
  }
 
  // Triggered when user presses Add btn in Modal
  uploadCSV() {
    console.log("Uploading CSV")
    let rows = processTSVText(this.state.csvText, NUM_COLS)

    // Create a set of fields to ensure duplicates are not attempted.
    let fields = createFieldSet(rows)   


    createFieldsFromTSV(fields)      // Create fields before proceeding
      .then(createFieldRes => {
        console.log(createFieldRes)
        let result_promises = rows.map((row, i) => {
          return createDataFromHarvestTSVListRow(row, i, this.state.dairy.pk)    // Create entries for ea row in TSV file
        })

        Promise.all(result_promises)            // Execute promises to create field_crop && field_crop_harvet entries in the DB
          .then(res => {
            console.log("Completed Results")
            uploadTSVToDB() // remove this when done testing, do this after the data was successfully create in DB
            console.log(res)
            this.toggleShowUploadCSV(false)
            this.getAllFieldCropHarvests()
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
  
 

  toggleShowTSVsModal(val){
    this.setState({showViewTSVsModal: val})
  }

  render() {
    console.log("harvests", this.state.field_crop_harvests)
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
          tsvType="harvest"
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
          REPORTING_METHODS={REPORTING_METHODS}
          SOURCE_OF_ANALYSES={SOURCE_OF_ANALYSES}
          onAction={this.createFieldCropHarvest.bind(this)}
          onChange={this.onCreateFieldCropHarvestChange.bind(this)}
          onClose={() => this.toggleShowAddFieldCropHarvestModal(false)}
        />
      </React.Fragment>

    )
  }
}

export default HarvestTab = withRouter(withTheme(HarvestTab))
