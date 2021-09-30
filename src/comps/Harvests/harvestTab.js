import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'

import AddIcon from '@material-ui/icons/Add'
import ShowChartIcon from '@material-ui/icons/ShowChart' //Analysis
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes' //AppEvent
import WbCloudyIcon from '@material-ui/icons/WbCloudy' // viewTSV
import { CloudUpload } from '@material-ui/icons' // uploadTSV

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
import { TSV_INFO } from "../../utils/TSV"
import ActionCancelModal from "../Modals/actionCancelModal"
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';

import {
  readTSV, processTSVText, createFieldSet, createFieldsFromTSV, createDataFromHarvestTSVListRow, uploadTSVToDB
} from "../../utils/TSV"




const REPORTING_METHODS = ['dry-weight', 'as-is']
const SOURCE_OF_ANALYSES = ['Lab Analysis', 'Other/ estimated']

const BASIS = ['As-is', "Dry wt"]

const HARVEST = 'field_crop_harvest'
const NUM_COLS = 26

class HarvestTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      field_crops: [], // The planted crops to choose from to create a harvest event in field_crop_harvest DB table
      fieldCropHarvests: [],
      showAddFieldCropHarvestModal: false,
      showUploadTSV: false,
      tsvText: "",
      uploadedFilename: "",
      updateFieldCropHarvestObj: {}, // PK: {all data for field_crop harvest that is updatable...}
      groupedFieldCropHarvests: {},
      showViewTSVsModal: false,
      toggleShowDeleteAllModal: false,
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







      }
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.dairy.pk !== this.state.dairy.pk) {
      // Call methods from didMount()
      this.getAllFieldCrops()
      this.getAllFieldCropHarvests()
    }
  }

  componentDidMount() {
    this.getAllFieldCrops()
    this.getAllFieldCropHarvests()
  }

  getAllFieldCrops() {
    get(`${this.props.BASE_URL}/api/field_crop/${this.state.dairy.pk}`)
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
    post(`${this.props.BASE_URL}/api/field_crop_harvest/create`, data)
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
    get(`${this.props.BASE_URL}/api/field_crop_harvest/${this.state.dairy.pk}`)
      .then(res => {
        this.groupFieldCropHarvestByField(res)
        this.setState({ fieldCropHarvests: res, groupedFieldCropHarvests: this.groupFieldCropHarvestByField(res) })
      })
      .catch(err => {
        console.log(err)
      })
  }
  onUpdateFieldCropHarvestChange(index, data, ev) {
    const { name, value } = ev.target

    // Changing structure, need to change where the value is updating, since its coming from new source/ data format.

    let harvests = this.state.groupedFieldCropHarvests

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
        post(`${this.props.BASE_URL}/api/field_crop_harvest/update`, data)
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

  toggleShowUploadTSV(val) {
    this.setState({ showUploadTSV: val })
  }
  onCSVChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      readTSV(files[0], (ev) => {
        const { result } = ev.target
        this.setState({ tsvText: result, uploadedFilename: files[0].name })
      })
    }
  }

  // Triggered when user presses Add btn in Modal
  uploadTSV() {
    let rows = processTSVText(this.state.tsvText, TSV_INFO[HARVEST].numCols)

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
            uploadTSVToDB(this.state.uploadedFilename, this.state.tsvText, this.state.dairy.pk, HARVEST) // remove this when done testing, do this after the data was successfully create in DB
            this.toggleShowUploadTSV(false)
            this.getAllFieldCropHarvests()
            this.props.onAlert('Uploaded!', 'success')
          })
          .catch(err => {
            console.log("Error with all promises")
            console.log(err)
            this.props.onAlert('Failed uploading!', 'error')
          })
      })
      .catch(createFieldErr => {
        console.log(createFieldErr)
      })
  }

  toggleShowTSVsModal(val) {
    this.setState({ showViewTSVsModal: val })
  }

  confirmDeleteAllFromTable(val) {
    this.setState({ toggleShowDeleteAllModal: val })
  }
  deleteAllFromTable() {
    Promise.all([
      post(`${this.props.BASE_URL}/api/field_crop/deleteAll`, { dairy_id: this.state.dairy.pk }),
      post(`${this.props.BASE_URL}/api/field_crop_harvest/deleteAll`, { dairy_id: this.state.dairy.pk }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy.pk, tsvType: TSV_INFO[HARVEST].tsvType })
    ])
      .then(res => {
        console.log(res)
        this.getAllFieldCrops()
        this.getAllFieldCropHarvests()
        this.confirmDeleteAllFromTable(false)
      })
      .catch(err => {
        console.log(err)
      })
  }



  render() {
    return (
      <React.Fragment>
        {this.state.dairy.pk && Object.keys(this.state.dairy).length > 0 ?
          <Grid item container xs={12}>
            {/* <Button variant="outlined"  color="secondary"
                onClick={this.updateFieldCropHarvest.bind(this)}>
                Update Harvests
              </Button> */}
            <Grid item xs={10} align='right'>
              <Tooltip title='Import Harvest from TSV Production Records Tab'>
                <IconButton variant="outlined" color="primary"
                  onClick={() => this.toggleShowUploadTSV(true)}>
                  <CloudUpload />
                </IconButton>

              </Tooltip>
            </Grid>
            <Grid item xs={1} align='right'>
              <Tooltip title='View TSVs'>
                <IconButton variant="outlined" color="secondary"
                  onClick={() => this.toggleShowTSVsModal(true)}>
                  <WbCloudyIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item xs={1} align='right'>

              <Tooltip title='Delete all Production Records'>
                <IconButton onClick={() => this.confirmDeleteAllFromTable(true)}>
                  <DeleteSweepIcon color='error' />
                </IconButton>
              </Tooltip>

              {/* {
                this.state.field_crops.length > 0 ?
                  <Grid item xs={12} align='right'>
                    <Tooltip title='Add new harvest'>
                      <IconButton variant="outlined" color="primary"
                        onClick={() => this.toggleShowAddFieldCropHarvestModal(true)}>
                        <SpeakerNotesIcon />
                      </IconButton>
                    </Tooltip>

                  </Grid>
                  :
                  <React.Fragment></React.Fragment>
              } */}
            </Grid>

            {
              Object.keys(this.state.groupedFieldCropHarvests).length > 0 ?
                <HarvestView
                  dairy={this.state.dairy}
                  fieldCropHarvests={this.state.fieldCropHarvests}
                  groupedFieldCropHarvests={this.state.groupedFieldCropHarvests}
                  getAllFieldCropHarvests={this.getAllFieldCropHarvests.bind(this)}
                  onChange={this.onUpdateFieldCropHarvestChange.bind(this)}
                />
                :
                <React.Fragment></React.Fragment>
            }

          </Grid>
          :
          <React.Fragment>Loading....</React.Fragment>
        }

        <ViewTSVsModal
          open={this.state.showViewTSVsModal}
          actionText="Upload"
          cancelText="Close"
          dairy_id={this.state.dairy.pk}
          tsvType={TSV_INFO[HARVEST].tsvType}
          onClose={() => this.toggleShowTSVsModal(false)}
        />

        <ActionCancelModal
          open={this.state.toggleShowDeleteAllModal}
          actionText="Delete all"
          cancelText="Cancel"
          modalText={`Delete Production Records (Harvests) for ${this.state.dairy.title}?`}
          onAction={this.deleteAllFromTable.bind(this)}
          onClose={() => this.confirmDeleteAllFromTable(false)}
        />

        <UploadHarvestCSVModal
          open={this.state.showUploadTSV}
          actionText="Upload"
          cancelText="Cancel"
          modalText={`Import TSV file, (must be a tab separated value file)`}
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.uploadTSV.bind(this)}
          onChange={this.onCSVChange.bind(this)}
          onClose={() => this.toggleShowUploadTSV(false)}
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
