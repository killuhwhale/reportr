import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import formats from "../../utils/format"

import UploadFieldCropAppProcessWastewaterTSVModal from "../Modals/uploadFieldCropAppProcessWastewaterTSVModal"
import ViewTSVsModal from "../Modals/viewTSVsModal"

import AddProcessWastewaterModal from "../Modals/addProcessWastewaterModal"
import ActionCancelModal from "../Modals/actionCancelModal"
import { timePickerDefaultProps } from '@material-ui/pickers/constants/prop-types'
import { get, post } from '../../utils/requests'

import {
  readTSV, processTSVText, createFieldSet, createFieldsFromTSV, createDataFromTSVListRow, uploadTSVToDB
 } from "../../utils/TSV"

const BASE_URL = "http://localhost:3001"
const MATERIAL_TYPES = [
  '',
  'Process wastewater',
  'Process wastewater sludge',
]

/** View for Process Wastewater Entry in DB */
const ProcessWastewaterAppEvent = (props) => {
  let process_wastewaters = props.process_wastewaters
  let { fieldtitle } = process_wastewaters[0]
  return (
    <Grid container item xs={12} style={{marginBottom: "40px", marginTop: "15px"}}>
      <Grid item xs={12}>
        <Typography variant="h3">
          {fieldtitle}
        </Typography>
        <hr />
      </Grid>

      {
        process_wastewaters.map((wastewater, i) => {
          let {
            app_desc, material_type, kn_con, nh4_con, nh3_con, no3_con, p_con, k_con, tds, ec, ph, totaln, totalp, totalk, amount_applied, app_date, croptitle, plant_date
          } = wastewater
          console.log("Wastewater", wastewater)
          return (
            <Grid item container xs={12} key={`pwwviews${i}`} component={Paper} elevation={6} style={{ marginBottom: "30px" }}>
              <Grid item container xs={12}>
                <Grid item xs={6}>
                  <Typography  variant="subtitle1">
                    {croptitle}
                  </Typography>
                </Grid>
                <Grid item xs={6} align="right">
                  <Typography variant="subtitle1">
                    Planted: {plant_date.split('T')[0]}
                  </Typography>
                </Grid>


                <Grid item container xs={12}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">
                      {app_desc} | Material Type: {material_type}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} align="right">
                    <Typography variant="subtitle2">
                      Date Applied: {app_date.split('T')[0]}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} align="right">
                    <Typography variant="subtitle2">
                      Amount Applied: {amount_applied} gals
                    </Typography>
                  </Grid>

                </Grid>

              </Grid>

              <Grid item container xs={10}>

                <Grid item xs={3}>
                  <TextField disabled
                    label="Kjeldahl- nitrogen"
                    value={kn_con}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Total phosphorus"
                    value={p_con}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Total potassium "
                    value={k_con}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Total dissolved solids"
                    value={tds}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Ammonium-nitrogen"
                    value={nh4_con}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Un-ionized ammonia-nitrogen"
                    value={nh3_con}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Nitrate-nitrogen"
                    value={no3_con}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="EC"
                    value={ec}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="N lbs/acre"
                    value={totaln}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="P lbs / acre"
                    value={totalp}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="K lbs / acre"
                    value={totalk}
                  />
                </Grid>
              </Grid>

              <Grid item container xs={2} justifyContent="center" alignItems="center">
                <Tooltip title="Delete Process wastewater">
                  <IconButton onClick={() => props.onDelete(wastewater)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </Tooltip>
              </Grid>

            </Grid>

          )
        })
      }

    </Grid>
  )
}


/** Component handles showing Process Wastewater Application events.
 *  - Process Waste Water List view
 *  - Upload TSV
 *  - Add Process Wastewater
 *  - Delete Process Wastewater
 * 
 *  NEEDS:
 *  - fieldCropAppEvents: applications events for the dairy
 *  - field_crop_app_process_wastewater: Process wastewater events
 * 
 */
class ProcessWastewater extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      fieldCropAppEvents: props.fieldCropAppEvents,
      field_crop_app_process_wastewater: props.field_crop_app_process_wastewater, // This should come from parent so it updates well, 
      tsvType: props.tsvType,
      numCols: props.numCols,
      showAddProcessWastewaterModal: false,
      showConfirmDeleteProcessWastewaterModal: false,
      showUploadFieldCropAppProcessWastewateTSVModal: false,
      deleteProcessWastewaterObj: {},
      tsvText: "",
      uploadedFilename: "",
      showViewTSVsModal: false,
      createProcessWastewaterObj: {
        dairy_id: 0,
        app_event_idx: 0,
        material_type_idx: 0,
        material_type: '',
        source_desc: '',
        amount_applied: '',
        n_con: '',
        ammoniumN: '',
        unionizedAmmoniumN: '',
        nitrateN: '',
        p_con: '',
        k_con: '',
        tds: '',
        ec: '0',
        totalN: '',
        totalP: '',
        totalK: '',

      },
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }
  
  /** Manually add Process Wastewater */
  toggleShowAddProcessWastewaterModal(val) {
    this.setState({ showAddProcessWastewaterModal: val })
  }
  onCreateProcessWastewaterChange(ev) {
    const { name, value } = ev.target
    let createProcessWastewaterObj = this.state.createProcessWastewaterObj
    createProcessWastewaterObj[name] = value
    this.setState({ createProcessWastewaterObj: createProcessWastewaterObj })
  }
  createProcessWastewater() {
    let createObj = this.state.createProcessWastewaterObj


    createObj.dairy_id = this.state.dairy_id

    createObj.field_crop_app_id = this.state.fieldCropAppEvents[createObj.app_event_idx].pk
    createObj.material_type = MATERIAL_TYPES[createObj.material_type_idx]



    createObj.n_con = parseFloat(createObj.n_con.replaceAll(',', ''))
    createObj.unionizedAmmoniumN = parseFloat(createObj.unionizedAmmoniumN.replaceAll(',', ''))
    createObj.ammoniumN = parseFloat(createObj.ammoniumN.replaceAll(',', ''))
    createObj.nitrateN = parseFloat(createObj.nitrateN.replaceAll(',', ''))
    createObj.p_con = parseFloat(createObj.p_con.replaceAll(',', ''))
    createObj.k_con = parseFloat(createObj.k_con.replaceAll(',', ''))
    createObj.tds = parseFloat(createObj.tds.replaceAll(',', ''))
    createObj.amount_applied = parseInt(createObj.amount_applied.replaceAll(',', ''))
    createObj.totalN = parseFloat(createObj.totalN.replaceAll(',', ''))
    createObj.totalP = parseFloat(createObj.totalP.replaceAll(',', ''))
    createObj.totalK = parseFloat(createObj.totalK.replaceAll(',', ''))

    console.log("creating process wasterwater event: ", createObj)
    // NEEd to Data a DB table for this now and the wires in the two index.js files....
    post(`${BASE_URL}/api/field_crop_app_process_wastewater/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddProcessWastewaterModal(false)
        this.getFieldCropAppProcessWastewater()
      })
      .catch(err => {
        console.log(err)
      })
  }
  /** Delete Process Wastewater entry */
  toggleShowConfirmDeleteProcessWastewaterModal(val) {
    this.setState({ showConfirmDeleteProcessWastewaterModal: val })
  }
  onConfirmProcessWastewaterDelete(delProcessWaswaterObj) {
    this.setState({ showConfirmDeleteProcessWastewaterModal: true, deleteProcessWastewaterObj: delProcessWaswaterObj })
  }
  onProcessWastewaterDelete() {
    if (Object.keys(this.state.deleteProcessWastewaterObj).length > 0) {
      post(`${BASE_URL}/api/field_crop_app_process_wastewater/delete`, { pk: this.state.deleteProcessWastewaterObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteProcessWastewaterModal(false)
          this.getFieldCropAppProcessWastewater()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  /** TSV: toggle, onChange, onUpload, View */
  toggleShowUploadFieldCropAppProcessWastewateTSVModal(val) {
    this.setState({ showUploadFieldCropAppProcessWastewateTSVModal: val })
  }
  onUploadFieldCropAppProcessWastewateTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      readTSV(files[0], (_ev) => {
        const { result } = _ev.target
        this.setState({ tsvText: result, uploadedFilename: files[0].name })
      })
    }
  }
  onUploadFieldCropAppProcessWastewateTSV() {
    // 24 columns from TSV
    let dairy_pk = this.state.dairy_id
    let rows = processTSVText(this.state.tsvText, this.state.numCols) // extract rows from Text of tsv file TODO()

    // Create a set of fields to ensure duplicates are not attempted.
    let fields = createFieldSet(rows)

    createFieldsFromTSV(fields, dairy_pk)      // Create fields before proceeding
      .then(createFieldRes => {
        let result_promises = rows.map((row, i) => {
          return createDataFromTSVListRow(row, i, dairy_pk, this.state.tsvType)    // Create entries for ea row in TSV file
        })

        Promise.all(result_promises)            // Execute promises to create field_crop && field_crop_harvet entries in the DB
          .then(res => {
            console.log("Completed uploading Process Wastewater TSV")
            uploadTSVToDB(this.state.uploadedFilename, this.state.tsvText, this.state.dairy_id, this.state.tsvType) 
            this.toggleShowUploadFieldCropAppProcessWastewateTSVModal(false)
            this.props.onProcessWastewaterTSVUpload()
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
  toggleViewTSVsModal(val){
    this.setState({showViewTSVsModal: val})
  }
 
  render() {
    return (
      <Grid item xs={12} container >
        <Grid item xs={12} align="right">
          <Button color="primary" variant="outlined"
            onClick={() => this.toggleShowUploadFieldCropAppProcessWastewateTSVModal(true)}
          >
            Upload TSV
          </Button>
          <Button color="secondary" variant="outlined"
            onClick={() => this.toggleViewTSVsModal(true)}
          >
            View Uploaded TSVs
          </Button>
        </Grid>

        <ViewTSVsModal
          open={this.state.showViewTSVsModal}
          actionText={"" /* no action text*/}
          cancelText="Close"
          dairy_id={this.state.dairy_id}
          tsvType={this.state.tsvType}
          onClose={() => this.toggleViewTSVsModal(false)}
        />
        <UploadFieldCropAppProcessWastewaterTSVModal
          open={this.state.showUploadFieldCropAppProcessWastewateTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Process Wastewater TSV`}
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppProcessWastewateTSV.bind(this)}
          onChange={this.onUploadFieldCropAppProcessWastewateTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppProcessWastewateTSVModal(false)}
        />
        {this.state.fieldCropAppEvents.length > 0 ? // Render Add Process Wastewater
          <React.Fragment>

            <Grid item xs={12} align="right">
              <Button color="secondary" variant="outlined"
                onClick={() => this.toggleShowAddProcessWastewaterModal(true)}
              >
                Add process wastewater to application event
              </Button>
            </Grid>

            <Grid item xs={12}>
              {Object.keys(this.state.field_crop_app_process_wastewater).length > 0 ?
                Object.keys(this.state.field_crop_app_process_wastewater)
                .sort((a, b) => a.fieldtitle > b.fieldtitle ? -1 : 1)
                .map((field_crop_app_id, i) => {
                  let process_wastewaters = this.state.field_crop_app_process_wastewater[field_crop_app_id]
                  return (
                    <ProcessWastewaterAppEvent key={`ppwwviewrow${i}`}
                      process_wastewaters={process_wastewaters}
                      onDelete={this.onConfirmProcessWastewaterDelete.bind(this)}
                    />
                  )
                })
                :
                <React.Fragment></React.Fragment>
              }
            </Grid>

            <ActionCancelModal
              open={this.state.showConfirmDeleteProcessWastewaterModal}
              actionText="Delete"
              cancelText="Cancel"
              modalText={`Delete Process Wastewater for ${this.state.deleteProcessWastewaterObj.fieldtitle} - ${this.state.deleteProcessWastewaterObj.app_date}?`}

              onAction={this.onProcessWastewaterDelete.bind(this)}
              onClose={() => this.toggleShowConfirmDeleteProcessWastewaterModal(false)}
            />
            <AddProcessWastewaterModal
              open={this.state.showAddProcessWastewaterModal}
              actionText="Add"
              cancelText="Cancel"
              modalText={`Add process waste water application to applciation event`}
              fieldCropAppEvents={this.state.fieldCropAppEvents}
            
              createProcessWastewaterObj={this.state.createProcessWastewaterObj}
              materialTypes={MATERIAL_TYPES}

              onAction={this.createProcessWastewater.bind(this)}
              onChange={this.onCreateProcessWastewaterChange.bind(this)}
              onClose={() => this.toggleShowAddProcessWastewaterModal(false)}
            />
          </React.Fragment>
          :
          <React.Fragment></React.Fragment>
        }

      </Grid>
    )
  }
}

export default ProcessWastewater = withRouter(withTheme(ProcessWastewater))
