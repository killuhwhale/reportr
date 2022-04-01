import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'

import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import { CloudUpload } from '@material-ui/icons'
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes' //AppEvent
import WbCloudyIcon from '@material-ui/icons/WbCloudy' // viewTSV

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
  DRAIN, TSV_INFO, readTSV, uploadTileDrainage, uploadTSVToDB
} from "../../utils/TSV"



/** View for Process Wastewater Entry in DB */
const DrainView = (props) => {
  const drains = props && props.drains ? props.drains : []

  return (
    <Grid container item xs={12} style={{ marginBottom: "40px", marginTop: "15px", ...props.style }}>
      {drains.map((drain, i) => {
        return (
          <Grid item container key={`srowview${i}`} xs={12} className='showOnHoverParent'>
            <Grid item xs={3}>
              <TextField
                value={drain.src_desc}
                label='Source description'
              />
            </Grid>
            <Grid item xs={2}>
              <Tooltip title='Delete Drain'>
                <IconButton className='showOnHover'
                  onClick={() => props.onDelete(drain)}
                >
                  <DeleteIcon color='error' />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>)
      })}
    </Grid>
  )
}

const DrainAnalysisView = (props) => {
  const analyses = props && props.analyses ? props.analyses : []
  const headerInfo = analyses && analyses.length > 0 ? analyses[0] : {}
  return (
    <Grid container item xs={12}>
      <Grid item xs={12}>
        <Typography variant='h5'>
          {headerInfo.src_desc}
        </Typography>
      </Grid>
      {analyses.map((analysis, i) => {
        return (
          <Grid item container key={`savrowview${i}`} xs={12} className='showOnHoverParent'>
            <Grid item xs={2}>
              <TextField
                value={analysis.sample_date ? analysis.sample_date.split('T')[0] : ''}
                label='Sample date'
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                value={analysis.sample_desc}
                label='Sample description'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={analysis.nh4_con}
                label='Ammonium-N mg/L'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={analysis.no2_con}
                label='Nitrate-N mg/L'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={analysis.p_con}
                label='Phosphorus mg/L'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={analysis.ec}
                label='EC μmhos/cm'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={analysis.tds}
                label='TDS mg/L'
              />
            </Grid>
            <Grid item xs={2}>
              <Tooltip title='Delete Drain Analysis'>
                <IconButton className='showOnHover'
                  onClick={() => props.onDelete(analysis)}
                >
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


class Drain extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      field_crop_app_drain: {},
      field_crop_app_drain_analysis: {},
      tsvType: TSV_INFO[DRAIN].tsvType,
      numCols: TSV_INFO[DRAIN].numCols,
      showAddDrainModal: false,
      showConfirmDeleteDrainModal: false,
      showConfirmDeleteDrainAnalysisModal: false,
      showUploadFieldCropAppDrainTSVModal: false,
      deleteDrainObj: {},
      deleteDrainAnalysisObj: {},
      tsvText: "",
      uploadedFilename: "",
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
    this.getFieldCropAppDrains()
    this.getFieldCropAppDrainAnalyses()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.dairy_id !== prevState.dairy_id) {
      this.getFieldCropAppDrains()
      this.getFieldCropAppDrainAnalyses()
    }
  }

  getFieldCropAppDrains() {
    get(`${this.props.BASE_URL}/api/drain_source/${this.state.dairy_id}`)
      .then(field_crop_app_drain => {
        this.setState({ field_crop_app_drain: groupByKeys(field_crop_app_drain, ['pk']) })
      })
  }

  getFieldCropAppDrainAnalyses() {
    get(`${this.props.BASE_URL}/api/drain_analysis/${this.state.dairy_id}`)
      .then(field_crop_app_drain_analysis => {
        this.setState({ field_crop_app_drain_analysis: groupByKeys(field_crop_app_drain_analysis, ['src_desc']) })
      })
  }


  toggleShowConfirmDeleteDrainModal(val) {
    this.setState({ showConfirmDeleteDrainModal: val })
  }
  onConfirmDrainDelete(deleteDrainObj) {
    this.setState({ showConfirmDeleteDrainModal: true, deleteDrainObj })
  }
  onDrainDelete() {
    if (Object.keys(this.state.deleteDrainObj).length > 0) {
      post(`${this.props.BASE_URL}/api/drain_source/delete`, {
        pk: this.state.deleteDrainObj.pk,
        dairy_id: this.state.dairy_id
      })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteDrainModal(false)
          this.getFieldCropAppDrains()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }


  toggleShowConfirmDeleteDrainAnalysisModal(val) {
    this.setState({ showConfirmDeleteDrainAnalysisModal: val })
  }
  onConfirmDrainAnalysisDelete(deleteDrainAnalysisObj) {
    console.log("onConfirmDel: ", deleteDrainAnalysisObj)
    this.setState({ showConfirmDeleteDrainAnalysisModal: true, deleteDrainAnalysisObj })
  }
  onDrainAnalysisDelete() {
    if (Object.keys(this.state.deleteDrainAnalysisObj).length > 0) {
      post(`${this.props.BASE_URL}/api/drain_analysis/delete`, {
        pk: this.state.deleteDrainAnalysisObj.pk,
        dairy_id: this.state.dairy_id
      })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteDrainAnalysisModal(false)
          this.getFieldCropAppDrainAnalyses()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }


  /** TSV: toggle, onChange, onUpload, View */
  toggleShowUploadFieldCropAppDrainTSVModal(val) {
    this.setState({
      showUploadFieldCropAppDrainTSVModal: val,
      tsvText: "",
      uploadedFilename: ""
    })
  }
  onUploadFieldCropAppDrainTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      readTSV(files[0], (_ev) => {
        const { result } = _ev.target
        this.setState({ tsvText: result, uploadedFilename: files[0].name })
      })
    }
  }
  onUploadFieldCropAppDrainTSV() {
    // 24 columns from TSV
    let dairy_pk = this.state.dairy_id
    uploadTileDrainage(this.state.tsvText, this.state.tsvType, dairy_pk)
      .then(res => {
        console.log("Completed uploading Process Wastewater TSV", res)
        uploadTSVToDB(this.state.uploadedFilename, this.state.tsvText, this.state.dairy_id, this.state.tsvType)
        this.toggleShowUploadFieldCropAppDrainTSVModal(false)
        this.getFieldCropAppDrains()
        this.getFieldCropAppDrainAnalyses()
        this.props.onAlert('Success!', 'success')
      })
      .catch(err => {
        console.log("Error with all promises")
        this.props.onAlert('Failed to upload!', 'error')
        console.log(err)
      })
  }
  toggleViewTSVsModal(val) {
    this.setState({ showViewTSVsModal: val })
  }

  getDrainSortedKeys() {
    return Object.keys(this.state.field_crop_app_drain).sort()
  }
  getDrainAnalysisSortedKeys() {
    return Object.keys(this.state.field_crop_app_drain_analysis).sort()
  }

  renderDrainAnalysis({ index, style }) {
    let key = this.getDrainAnalysisSortedKeys()[index]
    let analyses = this.state.field_crop_app_drain_analysis[key]
    return (
      <DrainAnalysisView key={`fcsaview${index}`} style={style}
        analyses={analyses}
        onDelete={this.onConfirmDrainAnalysisDelete.bind(this)}
      />
    )
  }
  renderDrain({ index, style }) {
    let key = this.getDrainSortedKeys()[index]
    let drains = this.state.field_crop_app_drain[key]
    return (
      <DrainView key={`fcsview${index}`} style={style}
        drains={drains}
        onDelete={this.onConfirmDrainDelete.bind(this)}
      />
    )
  }

  getDrainAnalysisSize(index) {
    let key = this.getDrainAnalysisSortedKeys()[index]
    let num = this.state.field_crop_app_drain_analysis[key].length
    return 80 + (75 * num)
  }
  getDrainSize(index) {
    let key = this.getDrainSortedKeys()[index]
    let num = this.state.field_crop_app_drain[key].length
    return 80 + (75 * num)
  }
  setWindowListener() {
    window.addEventListener('resize', (ev) => {
      this.setState({ windowHeight: window.innerHeight, windowWidth: window.innerWidth })
    })
  }

  render() {
    return (
      <Grid item xs={12} container >
        <Grid item xs={10} align="right">
          <Tooltip title='Upload TSV'>
            <IconButton color="primary" variant="outlined"
              onClick={() => this.toggleShowUploadFieldCropAppDrainTSVModal(true)}
            >
              <CloudUpload />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid item xs={2} align="right">
          <Tooltip title='View Uploaded TSVs'>
            <IconButton color="secondary" variant="outlined"
              onClick={() => this.toggleViewTSVsModal(true)}
            >
              <WbCloudyIcon />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid item xs={12}>
          <Typography variant='h3'>Drain Sources</Typography>
          {this.getDrainSortedKeys().length > 0 ?
            <List
              height={Math.max(this.state.windowHeight - 800, 100)}
              itemCount={this.getDrainSortedKeys().length}
              itemSize={this.getDrainSize.bind(this)}
              width={this.state.windowWidth * (.82)}
            >
              {this.renderDrain.bind(this)}
            </List>
            :
            <React.Fragment></React.Fragment>
          }
        </Grid>


        <Grid item xs={12}>
          <Typography variant='h3'>Analyses</Typography>
          {this.getDrainAnalysisSortedKeys().length > 0 ?
            <List
              height={Math.max(this.state.windowHeight - 800, 100)}
              itemCount={this.getDrainAnalysisSortedKeys().length}
              itemSize={this.getDrainAnalysisSize.bind(this)}
              width={this.state.windowWidth * (.82)}
            >
              {this.renderDrainAnalysis.bind(this)}
            </List>
            :
            <React.Fragment></React.Fragment>
          }
        </Grid>


        <ActionCancelModal
          open={this.state.showConfirmDeleteDrainModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Drain for ${this.state.deleteDrainObj.fieldtitle} - ${this.state.deleteDrainObj.app_date}?`}

          onAction={this.onDrainDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteDrainModal(false)}
        />

        <ActionCancelModal
          open={this.state.showConfirmDeleteDrainAnalysisModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Drain Analysis for ${this.state.deleteDrainAnalysisObj.sample_desc} - ${this.state.deleteDrainAnalysisObj.sample_date}?`}
          onAction={this.onDrainAnalysisDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteDrainAnalysisModal(false)}
        />

        <ViewTSVsModal
          open={this.state.showViewTSVsModal}
          actionText={"" /* no action text*/}
          cancelText="Close"
          dairy_id={this.state.dairy_id}
          tsvType={this.state.tsvType}
          onClose={() => this.toggleViewTSVsModal(false)}
          BASE_URL={this.props.BASE_URL}
        />
        <UploadTSVModal
          open={this.state.showUploadFieldCropAppDrainTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Drain TSV`}
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppDrainTSV.bind(this)}
          onChange={this.onUploadFieldCropAppDrainTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppDrainTSVModal(false)}
        />
      </Grid>
    )
  }
}

export default Drain = withRouter(withTheme(Drain))
