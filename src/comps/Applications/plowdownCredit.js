import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers'
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
  PLOWDOWN_CREDIT, TSV_INFO, readTSV, processTSVText, createFieldSet, createFieldsFromTSV, createDataFromTSVListRow, uploadTSVToDB
} from "../../utils/TSV"

const BASE_URL = "http://localhost:3001"

/** View for Process Wastewater Entry in DB */
const PlowdownCreditView = (props) => {
  const plowdownCredits = props && props.plowdownCredits ? props.plowdownCredits : []
  const headerInfo = plowdownCredits && plowdownCredits.length > 0 ? plowdownCredits[0]: {}

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
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      showViewTSVsModal: false,
    }
  }
  static getDerivedStateFromProps(props, state) {
    return state // if default props change return props | compare props.dairy == state.dairy
  }
  componentDidMount() {
    // this.setWindowListener()
    this.getFieldCropAppPlowdownCredits()
  }

  getFieldCropAppPlowdownCredits() {
    get(`${BASE_URL}/api/field_crop_app_plowdown_credit/${this.state.dairy_id}`)
      .then(field_crop_app_plowdown_credit => {
        console.log(field_crop_app_plowdown_credit)
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
      post(`${BASE_URL}/api/field_crop_app_plowdown_credit/delete`, { pk: this.state.deletePlowdownCreditObj.pk })
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
    this.setState({ showUploadFieldCropAppPlowdownCreditTSVModal: val })
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
            console.log("Completed uploading Plowdown Credit TSV", res)
            uploadTSVToDB(this.state.uploadedFilename, this.state.tsvText, this.state.dairy_id, this.state.tsvType)
            this.toggleShowUploadFieldCropAppPlowdownCreditTSVModal(false)
            this.getFieldCropAppPlowdownCredits()
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

        <ViewTSVsModal
          open={this.state.showViewTSVsModal}
          actionText={"" /* no action text*/}
          cancelText="Close"
          dairy_id={this.state.dairy_id}
          tsvType={this.state.tsvType}
          onClose={() => this.toggleViewTSVsModal(false)}
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