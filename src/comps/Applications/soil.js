import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'

import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import { CloudUpload } from '@material-ui/icons'
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes' //AppEvent
import WbCloudyIcon from '@material-ui/icons/WbCloudy' // viewTSV
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';

import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import formats, { groupByKeys } from "../../utils/format"
import { VariableSizeList as List } from "react-window";

import UploadTSVModal from "../Modals/uploadTSVModal"
import ViewTSVsModal from "../Modals/viewTSVsModal"

import ActionCancelModal from "../Modals/actionCancelModal"
import { timePickerDefaultProps } from '@material-ui/pickers/constants/prop-types'
import { get, post } from '../../utils/requests'
import { WASTEWATER_MATERIAL_TYPES } from '../../utils/constants'
import {
  SOIL, TSV_INFO, readTSV, processTSVText, createFieldSet, createFieldsFromTSV, createDataFromTSVListRow, uploadTSVToDB
} from "../../utils/TSV"



/** View for Process Wastewater Entry in DB */
const SoilView = (props) => {
  const soils = props && props.soils ? props.soils : []
  const headerInfo = soils && soils.length > 0 ? soils[0]: {}

  return (
    <Grid container item xs={12} style={{ marginBottom: "40px", marginTop: "15px", ...props.style }}>
      <Grid item xs={12}>
        <Typography variant='h3'>
          {headerInfo.fieldtitle}
        </Typography>
      </Grid>
      {soils.map((soil, i) => {
        return (
          <Grid item container key={`srowview${i}`} xs={12}>
            <Grid item xs={3}>
              <TextField
                value={soil.app_date ? soil.app_date.split('T')[0] : ''}
                label='App date'
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                value={soil.src_desc}
                label='Source description'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={soil.n_lbs_acre}
                label='N lbs/ acre'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={soil.p_lbs_acre}
                label='P lbs/ acre'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={soil.k_lbs_acre}
                label='K lbs/ acre'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={soil.salt_lbs_acre}
                label='Salt'
              />
            </Grid>
            <Grid item xs={2}>
              <Tooltip title='Delete Soil'>
                <IconButton onClick={() => props.onDelete(soil)}>
                  <DeleteIcon color='error' />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>)
      })}
    </Grid>
  )
}

const SoilAnalysisView = (props) => {
  const analyses = props && props.analyses ? props.analyses : []
  const headerInfo = analyses && analyses.length > 0 ? analyses[0] : {}
  return (
    <Grid container item xs={12}>
      <Grid item xs={12}>
        <Typography variant='h3'>
          {headerInfo.title}
        </Typography>
      </Grid>
      {analyses.map((analysis, i) => {
        return (
          <Grid item container key={`savrowview${i}`} xs={12}>
            <Grid item xs={3}>
              <TextField
                value={analysis.sample_desc}
                label='Sample description'
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                value={analysis.sample_date ? analysis.sample_date.split('T')[0] : ''}
                label='Sample date'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={analysis.n_con}
                label='N mg/kg'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={analysis.p_con}
                label='P mg/kg'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={analysis.k_con}
                label='K mg/kg'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={analysis.ec}
                label='EC μmhos/cm'
              />
            </Grid>
            <Grid item xs={2}>
              <Tooltip title='Delete Soil Analysis'>
                <IconButton onClick={() => props.onDelete(analysis)}>
                  <DeleteIcon color='error' />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        )
      })}
    </Grid>
  )
}


class Soil extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      field_crop_app_soil: {},
      field_crop_app_soil_analysis: {},
      tsvType: TSV_INFO[SOIL].tsvType,
      numCols: TSV_INFO[SOIL].numCols,
      showAddSoilModal: false,
      showConfirmDeleteSoilModal: false,
      showConfirmDeleteSoilAnalysisModal: false,
      showUploadFieldCropAppSoilTSVModal: false,
      deleteSoilObj: {},
      deleteSoilAnalysisObj: {},
      tsvText: "",
      uploadedFilename: "",
      toggleShowDeleteAllModal: false,

      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      showViewTSVsModal: false,
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }
  componentDidMount() {
    // this.setWindowListener()
    this.getFieldCropAppSoils()
    this.getFieldCropAppSoilAnalyses()
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.dairy_id !== this.state.dairy_id || this.props.parentUpdated !== prevProps.parentUpdated){
      this.getFieldCropAppSoils()
      this.getFieldCropAppSoilAnalyses()
    }
  }

  getFieldCropAppSoils() {
    get(`${this.props.BASE_URL}/api/field_crop_app_soil/${this.state.dairy_id}`)
      .then(field_crop_app_soil => {
        this.setState({ field_crop_app_soil: groupByKeys(field_crop_app_soil, ['field_id']) })
      })
  }

  getFieldCropAppSoilAnalyses() {
    get(`${this.props.BASE_URL}/api/field_crop_app_soil_analysis/${this.state.dairy_id}`)
      .then(field_crop_app_soil_analysis => {
        this.setState({ field_crop_app_soil_analysis: groupByKeys(field_crop_app_soil_analysis, ['field_id']) })
      })
  }


  toggleShowConfirmDeleteSoilModal(val) {
    this.setState({ showConfirmDeleteSoilModal: val })
  }
  onConfirmSoilDelete(deleteSoilObj) {
    this.setState({ showConfirmDeleteSoilModal: true, deleteSoilObj })
  }
  onSoilDelete() {
    if (Object.keys(this.state.deleteSoilObj).length > 0) {
      post(`${this.props.BASE_URL}/api/field_crop_app_soil/delete`, { pk: this.state.deleteSoilObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteSoilModal(false)
          this.getFieldCropAppSoils()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }


  toggleShowConfirmDeleteSoilAnalysisModal(val) {
    this.setState({ showConfirmDeleteSoilAnalysisModal: val })
  }
  onConfirmSoilAnalysisDelete(deleteSoilAnalysisObj) {
    console.log("onConfirmDel: ", deleteSoilAnalysisObj)
    this.setState({ showConfirmDeleteSoilAnalysisModal: true, deleteSoilAnalysisObj })
  }
  onSoilAnalysisDelete() {
    if (Object.keys(this.state.deleteSoilAnalysisObj).length > 0) {
      post(`${this.props.BASE_URL}/api/field_crop_app_soil_analysis/delete`, { pk: this.state.deleteSoilAnalysisObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteSoilAnalysisModal(false)
          this.getFieldCropAppSoilAnalyses()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }


  /** TSV: toggle, onChange, onUpload, View */
  toggleShowUploadFieldCropAppSoilTSVModal(val) {
    this.setState({ showUploadFieldCropAppSoilTSVModal: val })
  }
  onUploadFieldCropAppSoilTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      readTSV(files[0], (_ev) => {
        const { result } = _ev.target
        this.setState({ tsvText: result, uploadedFilename: files[0].name })
      })
    }
  }
  onUploadFieldCropAppSoilTSV() {
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
            console.log("Completed uploading Process Wastewater TSV", res)
            uploadTSVToDB(this.state.uploadedFilename, this.state.tsvText, this.state.dairy_id, this.state.tsvType)
            this.toggleShowUploadFieldCropAppSoilTSVModal(false)
            this.getFieldCropAppSoils()
            this.getFieldCropAppSoilAnalyses()
            this.props.onAlert('Success!', 'success')
          })
          .catch(err => {
            console.log("Error with all promises")
            console.log(err)
            this.props.onAlert('Failed uploading', 'error')
          })
      })
      .catch(createFieldErr => {
        console.log(createFieldErr)
      })
  }
  toggleViewTSVsModal(val) {
    this.setState({ showViewTSVsModal: val })
  }

  getSoilSortedKeys() {
    return Object.keys(this.state.field_crop_app_soil).sort()
  }
  getSoilAnalysisSortedKeys() {
    return Object.keys(this.state.field_crop_app_soil_analysis).sort()
  }

  renderSoilAnalysis({ index, style }) {
    let key = this.getSoilAnalysisSortedKeys()[index]
    let analyses = this.state.field_crop_app_soil_analysis[key]
    return (
      <SoilAnalysisView key={`fcsaview${index}`} style={style}
        analyses={analyses}
        onDelete={this.onConfirmSoilAnalysisDelete.bind(this)}
      />
    )
  }
  renderSoil({ index, style }) {
    let key = this.getSoilSortedKeys()[index]
    let soils = this.state.field_crop_app_soil[key]
    return (
      <SoilView key={`fcsview${index}`} style={style}
        soils={soils}
        onDelete={this.onConfirmSoilDelete.bind(this)}
      />
    )
  }

  getSoilAnalysisSize(index) {
    let key = this.getSoilAnalysisSortedKeys()[index]
    let num = this.state.field_crop_app_soil_analysis[key].length
    return 80 + (75 * num)
  }
  getSoilSize(index) {
    let key = this.getSoilSortedKeys()[index]
    let num = this.state.field_crop_app_soil[key].length
    return 80 + (75 * num)
  }
  setWindowListener() {
    window.addEventListener('resize', (ev) => {
      this.setState({ windowHeight: window.innerHeight, windowWidth: window.innerWidth })
    })
  }
  confirmDeleteAllFromTable(val) {
    this.setState({ toggleShowDeleteAllModal: val })
  }
  deleteAllFromTable() {
    Promise.all([
      post(`${this.props.BASE_URL}/api/field_crop_app_soil/deleteAll`, { dairy_id: this.state.dairy_id }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy_id, tsvType: this.props.tsvType }),
    ])
      .then(res => {
        this.getFieldCropAppSoils()
        this.getFieldCropAppSoilAnalyses()
        this.confirmDeleteAllFromTable(false)
      })
      .catch(err => {
        console.log(err)
      })
  }

  render() {
    return (
      <Grid item xs={12} container >
        <Grid item xs={10} align="right">
          <Tooltip title='Upload TSV'>
            <IconButton color="primary" variant="outlined"
              onClick={() => this.toggleShowUploadFieldCropAppSoilTSVModal(true)}
            >
              <CloudUpload />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid item xs={1} align="right">
          <Tooltip title='View Uploaded TSVs'>
            <IconButton color="secondary" variant="outlined"
              onClick={() => this.toggleViewTSVsModal(true)}
            >
              <WbCloudyIcon />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid item xs={1} align='right'>
          <Tooltip title='Delete all Soil'>
            <IconButton onClick={() => this.confirmDeleteAllFromTable(true)}>
              <DeleteSweepIcon color='error' />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='h3'>Analyses</Typography>
          {this.getSoilAnalysisSortedKeys().length > 0 ?
            <List
              height={Math.max(this.state.windowHeight - 800, 100)}
              itemCount={this.getSoilAnalysisSortedKeys().length}
              itemSize={this.getSoilAnalysisSize.bind(this)}
              width={this.state.windowWidth * (.82)}
            >
              {this.renderSoilAnalysis.bind(this)}
            </List>
            :
            <React.Fragment></React.Fragment>
          }
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant='h3'>Soil Applications</Typography>
          {this.getSoilSortedKeys().length > 0 ?
            <List
              height={Math.max(this.state.windowHeight - 500, 100)}
              itemCount={this.getSoilSortedKeys().length}
              itemSize={this.getSoilSize.bind(this)}
              width={this.state.windowWidth * (.82)}
            >
              {this.renderSoil.bind(this)}
            </List>
            :
            <React.Fragment></React.Fragment>
          }        
        </Grid>


        <ActionCancelModal
          open={this.state.showConfirmDeleteSoilModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Soil for ${this.state.deleteSoilObj.fieldtitle} - ${this.state.deleteSoilObj.app_date}?`}

          onAction={this.onSoilDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteSoilModal(false)}
        />

        <ActionCancelModal
          open={this.state.toggleShowDeleteAllModal}
          actionText="Delete all"
          cancelText="Cancel"
          modalText={`Delete All Soil Sample Events?`}
          onAction={this.deleteAllFromTable.bind(this)}
          onClose={() => this.confirmDeleteAllFromTable(false)}
        />  

        <ActionCancelModal
          open={this.state.showConfirmDeleteSoilAnalysisModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Soil Analysis for ${this.state.deleteSoilAnalysisObj.sample_desc} - ${this.state.deleteSoilAnalysisObj.sample_date}?`}
          onAction={this.onSoilAnalysisDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteSoilAnalysisModal(false)}
        />

        <ViewTSVsModal
          open={this.state.showViewTSVsModal}
          actionText={"" /* no action text*/}
          cancelText="Close"
          dairy_id={this.state.dairy_id}
          tsvType={this.state.tsvType}
          onClose={() => this.toggleViewTSVsModal(false)}
        />
        <UploadTSVModal
          open={this.state.showUploadFieldCropAppSoilTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Soil TSV`}
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppSoilTSV.bind(this)}
          onChange={this.onUploadFieldCropAppSoilTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppSoilTSVModal(false)}
        />
      </Grid>
    )
  }
}

export default Soil = withRouter(withTheme(Soil))
