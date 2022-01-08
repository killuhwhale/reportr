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
  PLOWDOWN_CREDIT, TSV_INFO, readTSV, uploadNutrientApp, uploadTSVToDB
} from "../../utils/TSV"



/** View for Process Wastewater Entry in DB */
const PlowdownCreditView = (props) => {
  const plowdownCredits = props && props.plowdownCredits ? props.plowdownCredits : []
  const headerInfo = plowdownCredits && plowdownCredits.length > 0 ? plowdownCredits[0] : {}

  return (
    <Grid container item xs={12} style={{ marginBottom: "40px", marginTop: "15px", ...props.style }}>
      <Grid item xs={12}>
        <Typography variant='h3'>
          {headerInfo.fieldtitle}
        </Typography>
      </Grid>
      {plowdownCredits.map((plowdownCredit, i) => {
        return (
          <Grid item container key={`srowview${i}`} xs={12}>
            <Grid item xs={3}>
              <TextField
                value={plowdownCredit.app_date ? plowdownCredit.app_date.split('T')[0] : ''}
                label='App date'
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                value={plowdownCredit.src_desc}
                label='Source description'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={plowdownCredit.n_lbs_acre}
                label='N lbs/ acre'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={plowdownCredit.p_lbs_acre}
                label='P lbs/ acre'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={plowdownCredit.k_lbs_acre}
                label='K lbs/ acre'
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={plowdownCredit.salt_lbs_acre}
                label='Salt'
              />
            </Grid>
            <Grid item xs={2}>
              <Tooltip title='Delete PlowdownCredit'>
                <IconButton onClick={() => props.onDelete(plowdownCredit)}>
                  <DeleteIcon color='error' />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>)
      })}
    </Grid>
  )
}

class PlowdownCredit extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      field_crop_app_plowdown_credit: {},
      tsvType: TSV_INFO[PLOWDOWN_CREDIT].tsvType,
      numCols: TSV_INFO[PLOWDOWN_CREDIT].numCols,
      showAddPlowdownCreditModal: false,
      showConfirmDeletePlowdownCreditModal: false,
      showUploadFieldCropAppPlowdownCreditTSVModal: false,
      deletePlowdownCreditObj: {},
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
    this.getFieldCropAppPlowdownCredits()
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.dairy_id !== this.state.dairy_id || this.props.parentUpdated !== prevProps.parentUpdated) {
      this.getFieldCropAppPlowdownCredits()
    }
  }

  getFieldCropAppPlowdownCredits() {
    get(`${this.props.BASE_URL}/api/field_crop_app_plowdown_credit/${this.state.dairy_id}`)
      .then(field_crop_app_plowdown_credit => {
        this.setState({ field_crop_app_plowdown_credit: groupByKeys(field_crop_app_plowdown_credit, ['field_id']) })
      })
  }

  toggleShowConfirmDeletePlowdownCreditModal(val) {
    this.setState({ showConfirmDeletePlowdownCreditModal: val })
  }
  onConfirmPlowdownCreditDelete(deletePlowdownCreditObj) {
    console.log(deletePlowdownCreditObj)
    this.setState({ showConfirmDeletePlowdownCreditModal: true, deletePlowdownCreditObj })
  }
  onPlowdownCreditDelete() {
    if (Object.keys(this.state.deletePlowdownCreditObj).length > 0) {
      post(`${this.props.BASE_URL}/api/field_crop_app_plowdown_credit/delete`, { pk: this.state.deletePlowdownCreditObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeletePlowdownCreditModal(false)
          this.getFieldCropAppPlowdownCredits()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }


  /** TSV: toggle, onChange, onUpload, View */
  toggleShowUploadFieldCropAppPlowdownCreditTSVModal(val) {
    this.setState({
      showUploadFieldCropAppPlowdownCreditTSVModal: val,
      tsvText: "",
      uploadedFilename: ""
    })
  }
  onUploadFieldCropAppPlowdownCreditTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      readTSV(files[0], (_ev) => {
        const { result } = _ev.target
        this.setState({ tsvText: result, uploadedFilename: files[0].name })
      })
    }
  }
  onUploadFieldCropAppPlowdownCreditTSV() {
    // 24 columns from TSV
    let dairy_pk = this.state.dairy_id
    uploadNutrientApp(this.state.tsvText, this.state.tsvType, dairy_pk)
      .then(res => {
        console.log("Completed uploading Plowdown Credit TSV", res)
        uploadTSVToDB(this.state.uploadedFilename, this.state.tsvText, this.state.dairy_id, this.state.tsvType)
        this.toggleShowUploadFieldCropAppPlowdownCreditTSVModal(false)
        this.getFieldCropAppPlowdownCredits()
        this.props.onAlert('Success!', 'success')
      })
      .catch(err => {
        console.log("Error with all promises")
        console.log(err)
        this.props.onAlert('Failed uploading', 'error')
      })
  }
  toggleViewTSVsModal(val) {
    this.setState({ showViewTSVsModal: val })
  }

  getPlowdownCreditSortedKeys() {
    return Object.keys(this.state.field_crop_app_plowdown_credit).sort()
  }


  renderPlowdownCredit({ index, style }) {
    let key = this.getPlowdownCreditSortedKeys()[index]
    let plowdownCredits = this.state.field_crop_app_plowdown_credit[key]
    return (
      <PlowdownCreditView key={`fcsview${index}`} style={style}
        plowdownCredits={plowdownCredits}
        onDelete={this.onConfirmPlowdownCreditDelete.bind(this)}
      />
    )
  }
  getPlowdownCreditSize(index) {
    let key = this.getPlowdownCreditSortedKeys()[index]
    let num = this.state.field_crop_app_plowdown_credit[key].length
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
      post(`${this.props.BASE_URL}/api/field_crop_app_plowdown_credit/deleteAll`, { dairy_id: this.state.dairy_id }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy_id, tsvType: this.props.tsvType }),
    ])
      .then(res => {
        this.getFieldCropAppPlowdownCredits()
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
              onClick={() => this.toggleShowUploadFieldCropAppPlowdownCreditTSVModal(true)}
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
          <Tooltip title='Delete all Plowdown Credit'>
            <IconButton onClick={() => this.confirmDeleteAllFromTable(true)}>
              <DeleteSweepIcon color='error' />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid item xs={12}>
          <Typography variant='h3'>Plowdown Credit Applications</Typography>
          {this.getPlowdownCreditSortedKeys().length > 0 ?
            <List
              height={Math.max(this.state.windowHeight - 500, 100)}
              itemCount={this.getPlowdownCreditSortedKeys().length}
              itemSize={this.getPlowdownCreditSize.bind(this)}
              width={this.state.windowWidth * (.82)}
            >
              {this.renderPlowdownCredit.bind(this)}
            </List>
            :
            <React.Fragment></React.Fragment>
          }
        </Grid>


        <ActionCancelModal
          open={this.state.showConfirmDeletePlowdownCreditModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete PlowdownCredit for ${this.state.deletePlowdownCreditObj.fieldtitle} - ${this.state.deletePlowdownCreditObj.app_date}?`}
          onAction={this.onPlowdownCreditDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeletePlowdownCreditModal(false)}
        />

        <ActionCancelModal
          open={this.state.toggleShowDeleteAllModal}
          actionText="Delete all"
          cancelText="Cancel"
          modalText={`Delete All Plowdown Credit Events?`}
          onAction={this.deleteAllFromTable.bind(this)}
          onClose={() => this.confirmDeleteAllFromTable(false)}
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
          open={this.state.showUploadFieldCropAppPlowdownCreditTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Plowdown Credit TSV`}
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppPlowdownCreditTSV.bind(this)}
          onChange={this.onUploadFieldCropAppPlowdownCreditTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppPlowdownCreditTSVModal(false)}
        />
      </Grid>
    )
  }
}

export default PlowdownCredit = withRouter(withTheme(PlowdownCredit))
