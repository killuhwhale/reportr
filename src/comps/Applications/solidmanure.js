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

import UploadTSVModal from "../Modals/uploadTSVModal"
import ViewTSVsModal from "../Modals/viewTSVsModal"


import AddSolidmanureAnalysisModal from "../Modals/addSolidmanureAnalysisModal"
import AddSolidmanureModal from "../Modals/addSolidmanureModal"
import ActionCancelModal from "../Modals/actionCancelModal"
import { timePickerDefaultProps } from '@material-ui/pickers/constants/prop-types'
import { get, post } from '../../utils/requests'
import { checkEmpty } from '../../utils/TSV'

import {
  readTSV, processTSVText, createFieldSet, createFieldsFromTSV, createDataFromTSVListRow, uploadTSVToDB
} from "../../utils/TSV"

const BASE_URL = "http://localhost:3001"

//Move to appnutrient and pass as prop
const SOURCE_OF_ANALYSES = [
  'Lab Analysis',
  'Other/ Estimated',
]



/** View for Process Wastewater Entry in DB */
const SolidmanureAppEvent = (props) => {
  return (
    <Grid item container xs={12}>
      <Grid item xs={12}>
        <Typography variant="h4">{props.solidmanures[0].fieldtitle}</Typography>
        <hr />
      </Grid>
      {
        props.solidmanures.map((solidmanure, i) => {
          return (
            <Grid item container xs={12} key={`fwmainview${i}`}>
              <Grid item xs={6}>
                <Typography variant="subtitle1">{solidmanure.croptitle}</Typography>
              </Grid>
              <Grid item xs={6} align="right">
                <Typography variant="subtitle1">Planted: {solidmanure.plant_date}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">{solidmanure.sample_desc} | {solidmanure.src_desc}</Typography>
              </Grid>
              <Grid item xs={6} align="right">
                <Typography variant="subtitle2">Applied: {solidmanure.app_date}</Typography>
              </Grid>
              <Grid item container xs={10}>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Amount Applied"
                    value={solidmanure.amount_applied}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField disabled
                    label="Nitrogen lbs / acre"
                    value={solidmanure.n_lbs_acre}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Phosphorus lbs / acre"
                    value={solidmanure.p_lbs_acre}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField disabled
                    label="Potassium lbs / acre"
                    value={solidmanure.k_lbs_acre}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField disabled
                    label="Salt lbs / acre"
                    value={solidmanure.salt_lbs_acre}
                  />
                </Grid>
              </Grid>
              <Grid item container xs={2} justifyContent="center" >
                <Tooltip title="Delete Solidmanure Event">
                  <IconButton onClick={() => props.onConfirmSolidmanureDelete(solidmanure)}>
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

const SolidmanureAnalysis = (props) => {

  return (
    <Grid item container xs={6}>
      <Grid item xs={10}>
        <Typography>{props.analysis.sample_date} / {props.analysis.sample_desc}</Typography>
      </Grid>
      <Grid item xs={2}>
        <Tooltip title="Delete Solidmanure Source">
          <IconButton onClick={() => props.onConfirmSolidmanureAnalysisDelete(props.analysis)}>
            <DeleteIcon color="error" />
          </IconButton>
        </Tooltip>
      </Grid>
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
class Solidmanure extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      fieldCropAppEvents: props.fieldCropAppEvents,
      fieldCropAppSolidmanureAnalyses: props.fieldCropAppSolidmanureAnalyses,
      fieldCropAppSolidmanures: props.fieldCropAppSolidmanures,
      tsvType: props.tsvType,
      numCols: props.numCols,

      showAddSolidmanureAnalysisModal: false,
      showAddSolidmanureModal: false,
      showConfirmDeleteSolidmanureAnalysisModal: false,
      showConfirmDeleteSolidmanureModal: false,
      deleteSolidmanureAnalysisObj: {},
      deleteSolidmanureObj: {},
      showUploadFieldCropAppSolidmanureTSVModal: false,
      tsvText: '',
      uploadedFilename: '',
      showViewTSVsModal: false,

      createSolidmanureAnalysisObj: {
        dairy_id: '',
        sample_desc: '',
        sample_date: new Date(),
        material_type: '',
        material_type_idx: 0,
        src_of_analysis: '',
        src_of_analysis_idx: 0,
        moisture: '',
        method_of_reporting: '',
        method_of_reporting_idx: 0,
        n_con: '',
        p_con: '',
        k_con: '',
        ca_con: '',
        mg_con: '',
        na_con: '',
        s_con: '',
        cl_con: '',
        tfs: ''
      },
      createSolidmanureObj: {
        dairy_id: '',
        field_crop_app_id: '',
        field_crop_app_idx: 0,
        field_crop_app_solidmanure_analysis_id: '',
        field_crop_app_solidmanure_analysis_idx: 0,

        src_desc: '',
        amount_applied: '',
        amt_applied_per_acre: '',
        n_lbs_acre: '',
        p_lbs_acre: '',
        k_lbs_acre: '',
        salt_lbs_acre: ''
      },
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }

  /** Manually add Process Wastewater */

  toggleShowAddSolidmanureAnalysisModal(val) {
    this.setState({ showAddSolidmanureAnalysisModal: val })
  }
  toggleShowAddSolidmanureModal(val) {
    this.setState({ showAddSolidmanureModal: val })
  }


  onCreateSolidmanureAnalysisChange(ev) {
    const { name, value } = ev.target
    let createSolidmanureAnalysisObj = this.state.createSolidmanureAnalysisObj
    createSolidmanureAnalysisObj[name] = value
    this.setState({ createSolidmanureAnalysisObj: createSolidmanureAnalysisObj })
  }
  onCreateSolidmanureChange(ev) {
    const { name, value } = ev.target
    let createSolidmanureObj = this.state.createSolidmanureObj
    createSolidmanureObj[name] = value
    this.setState({ createSolidmanureObj: createSolidmanureObj })
  }


  createSolidmanure() {
    let createObj = this.state.createSolidmanureObj
    createObj.dairy_id = this.state.dairy_id
    createObj.field_crop_app_id = this.state.fieldCropAppEvents[createObj.field_crop_app_idx].pk
    createObj.field_crop_app_solidmanure_analysis_id = this.state.fieldCropAppSolidmanureAnalyses[createObj.field_crop_app_solidmanure_analysis_idx].pk

    createObj.amount_applied = checkEmpty(createObj.amount_applied)
    createObj.amt_applied_per_acre = checkEmpty(createObj.amt_applied_per_acre)
    createObj.n_lbs_acre = checkEmpty(createObj.n_lbs_acre)
    createObj.p_lbs_acre = checkEmpty(createObj.p_lbs_acre)
    createObj.k_lbs_acre = checkEmpty(createObj.k_lbs_acre)
    createObj.salt_lbs_acre = checkEmpty(createObj.salt_lbs_acre)

    console.log("creating solidmanure event: ", createObj)
    post(`${BASE_URL}/api/field_crop_app_solidmanure/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddSolidmanureModal(false)
        this.props.getFieldCropAppSolidmanure()
      })
      .catch(err => {
        console.log(err)
      })
  }

  createSolidmanureAnalysis() {
    let createObj = this.state.createSolidmanureAnalysisObj
    createObj.dairy_id = this.state.dairy_id
    createObj.src_of_analysis = this.props.SOURCE_OF_ANALYSES[createObj.src_of_analysis_idx]
    createObj.material_type = this.props.MATERIAL_TYPES[createObj.material_type_idx]
    createObj.method_of_reporting = this.props.REPORTING_METHODS[createObj.method_of_reporting_idx]

    createObj.moisture = checkEmpty(createObj.moisture)
    createObj.n_con = checkEmpty(createObj.n_con)
    createObj.p_con = checkEmpty(createObj.p_con)
    createObj.k_con = checkEmpty(createObj.k_con)
    createObj.ca_con = checkEmpty(createObj.ca_con)
    createObj.mg_con = checkEmpty(createObj.mg_con)
    createObj.na_con = checkEmpty(createObj.na_con)
    createObj.s_con = checkEmpty(createObj.s_con)
    createObj.cl_con = checkEmpty(createObj.cl_con)
    createObj.tfs = checkEmpty(createObj.tfs)

    console.log("creating solidmanure event: ", createObj)

    post(`${BASE_URL}/api/field_crop_app_solidmanure_analysis/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddSolidmanureAnalysisModal(false)
        this.props.getFieldCropAppSolidmanureAnalysis()
      })
      .catch(err => {
        console.log(err)
      })
  }


  /** Delete Process Wastewater entry */
  toggleShowConfirmDeleteSolidmanureModal(val) {
    this.setState({ showConfirmDeleteSolidmanureModal: val })
  }

  toggleShowConfirmDeleteSolidmanureAnalysisModal(val) {
    this.setState({ showConfirmDeleteSolidmanureAnalysisModal: val })
  }


  onConfirmSolidmanureAnalysisDelete(deleteSolidmanureAnalysisObj) {
    this.setState({ showConfirmDeleteSolidmanureAnalysisModal: true, deleteSolidmanureAnalysisObj: deleteSolidmanureAnalysisObj })
  }
  onConfirmSolidmanureDelete(deleteSolidmanureObj) {
    this.setState({ showConfirmDeleteSolidmanureModal: true, deleteSolidmanureObj: deleteSolidmanureObj })
  }

  onSolidmanureDelete() {
    if (Object.keys(this.state.deleteSolidmanureObj).length > 0) {
      post(`${BASE_URL}/api/field_crop_app_solidmanure/delete`, { pk: this.state.deleteSolidmanureObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteSolidmanureModal(false)
          this.props.getFieldCropAppSolidmanure()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  onSolidmanureAnalysisDelete() {
    if (Object.keys(this.state.deleteSolidmanureAnalysisObj).length > 0) {
      post(`${BASE_URL}/api/field_crop_app_solidmanure_analysis/delete`, { pk: this.state.deleteSolidmanureAnalysisObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteSolidmanureAnalysisModal(false)
          this.props.getFieldCropAppSolidmanureAnalysis()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  /** TSV: toggle, onChange, onUpload, View */
  toggleShowUploadFieldCropAppSolidmanureTSVModal(val) {
    this.setState({ showUploadFieldCropAppSolidmanureTSVModal: val })
  }
  onUploadFieldCropAppFreshwateTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      readTSV(files[0], (_ev) => {
        const { result } = _ev.target
        this.setState({ tsvText: result, uploadedFilename: files[0].name })
      })
    }
  }
  onUploadFieldCropAppFreshwateTSV() {
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
            this.toggleShowUploadFieldCropAppSolidmanureTSVModal(false)
            this.props.getFieldCropAppSolidmanure()
            this.props.getFieldCropAppSolidmanureAnalysis()
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
  toggleViewTSVsModal(val) {
    this.setState({ showViewTSVsModal: val })
  }

  render() {
    return (
      <Grid item xs={12} container >
        <Grid item xs={12} align="right">
          <Button color="primary" variant="outlined"
            onClick={() => this.toggleShowUploadFieldCropAppSolidmanureTSVModal(true)}
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
        <UploadTSVModal
          open={this.state.showUploadFieldCropAppSolidmanureTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Solidmanure TSV`}
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppFreshwateTSV.bind(this)}
          onChange={this.onUploadFieldCropAppFreshwateTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppSolidmanureTSVModal(false)}
        />

        <Grid item xs={12} align="right">
          <Button color="secondary" variant="outlined"
            onClick={() => this.toggleShowAddSolidmanureAnalysisModal(true)}
          >
            Add solidmanure analysis
          </Button>
        </Grid>
        <Grid item xs={12} align="right">
          <Button color="secondary" variant="outlined"
            onClick={() => this.toggleShowAddSolidmanureModal(true)}
          >
            Add solidmanure to application event
          </Button>
        </Grid>


        <Grid item xs={12}>
          {this.state.fieldCropAppSolidmanureAnalyses.length > 0 ?
            <React.Fragment>
              <Typography variant="h5">Analyses</Typography>
              <Grid item container xs={12}>
                {
                  this.state.fieldCropAppSolidmanureAnalyses.map((analysis, i) => {
                    return (
                      <SolidmanureAnalysis key={`fcafwaview${i}`}
                        analysis={analysis}
                        onConfirmSolidmanureAnalysisDelete={this.onConfirmSolidmanureAnalysisDelete.bind(this)}
                      />
                    )
                  })
                }
              </Grid>
            </React.Fragment>
            :
            <React.Fragment></React.Fragment>

          }

        </Grid>

        <Grid item xs={12}>
          {Object.keys(this.state.fieldCropAppSolidmanures).length > 0 ?

            Object.keys(this.state.fieldCropAppSolidmanures)
              .sort((a, b) => a.fieldtitle > b.fieldtitle ? -1 : 1)
              .map((field_crop_app_id, i) => {
                let solidmanures = this.state.fieldCropAppSolidmanures[field_crop_app_id]
                return (
                  <SolidmanureAppEvent key={`ppwwviewrow${i}`}
                    solidmanures={solidmanures}
                    onDelete={this.onConfirmSolidmanureDelete.bind(this)}
                  />
                )
              })
            :
            <React.Fragment></React.Fragment>
          }
        </Grid>


        <ActionCancelModal
          open={this.state.showConfirmDeleteSolidmanureAnalysisModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Solidmanure Analysis for ${this.state.deleteSolidmanureAnalysisObj.sample_date} - ${this.state.deleteSolidmanureAnalysisObj.sample_desc}?`}

          onAction={this.onSolidmanureAnalysisDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteSolidmanureAnalysisModal(false)}
        />
        <ActionCancelModal
          open={this.state.showConfirmDeleteSolidmanureModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Solidmanure for ${this.state.deleteSolidmanureObj.app_date}?`}

          onAction={this.onSolidmanureDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteSolidmanureModal(false)}
        />

        <AddSolidmanureAnalysisModal
          open={this.state.showAddSolidmanureAnalysisModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add solidmanure analysis`}
          SOURCE_OF_ANALYSES={this.props.SOURCE_OF_ANALYSES}
          REPORTING_METHODS={this.props.REPORTING_METHODS}
          MATERIAL_TYPES={this.props.MATERIAL_TYPES}
          createSolidmanureAnalysisObj={this.state.createSolidmanureAnalysisObj}
          fieldCropAppSolidmanureSources={this.state.fieldCropAppSolidmanureSources}
          onAction={this.createSolidmanureAnalysis.bind(this)}
          onChange={this.onCreateSolidmanureAnalysisChange.bind(this)}
          onClose={() => this.toggleShowAddSolidmanureAnalysisModal(false)}
        />
        <AddSolidmanureModal
          open={this.state.showAddSolidmanureModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add solidmanure app event`}

          createSolidmanureObj={this.state.createSolidmanureObj}
          fieldCropAppSolidmanureAnalyses={this.state.fieldCropAppSolidmanureAnalyses}
          fieldCropAppEvents={this.state.fieldCropAppEvents}
          onAction={this.createSolidmanure.bind(this)}
          onChange={this.onCreateSolidmanureChange.bind(this)}
          onClose={() => this.toggleShowAddSolidmanureModal(false)}
        />



      </Grid>
    )
  }
}

export default Solidmanure = withRouter(withTheme(Solidmanure))
