import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DateTimePicker
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
  DISCHARGE, TSV_INFO, readTSV, processTSVText, uploadTSVToDB, lazyGet, checkEmpty
} from "../../utils/TSV"
import { toFloat } from '../../utils/convertCalc'


/** View for Process Wastewater Entry in DB */
const DischargeView = (props) => {
  const discharges = props && props.discharges ? props.discharges : []
  const headerInfo = discharges && discharges.length > 0 ? discharges[0] : {}

  return (
    <Grid container item xs={12} style={{ marginBottom: "40px", marginTop: "15px", ...props.style }}>
      <Grid item xs={12}>
        <Typography variant='h4'>
          {headerInfo.discharge_type}
        </Typography>
      </Grid>
      {discharges.map((discharge, i) => {
        return (
          <Grid item container key={`srowview${i}`} xs={12}>
            <Grid item xs={3}>
              <DateTimePicker
                open={false} // lol took much longer to find this solution, disables but doesnt alter display like the prop 'disabled' does
                fullWidth
                value={discharge.discharge_datetime}
                label='Date Time'
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                fullWidth
                value={discharge.vol}
                label={`Amount (${discharge.vol_unit})`}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                fullWidth
                value={discharge.ref_number}
                label='Reference number'
              />
            </Grid>
            <Grid item xs={2}>
              <Tooltip title='Delete Discharge'>
                <IconButton onClick={() => props.onDelete(discharge)}>
                  <DeleteIcon color='error' />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>)
      })}
    </Grid>
  )
}

class Discharge extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      discharge: {},
      tsvType: TSV_INFO[DISCHARGE].tsvType,
      numCols: TSV_INFO[DISCHARGE].numCols,
      showAddDischargeModal: false,
      showConfirmDeleteDischargeModal: false,
      showUploadFieldCropAppDischargeTSVModal: false,
      deleteDischargeObj: {},
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
    this.getFieldCropAppDischarges()
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.dairy_id !== this.state.dairy_id) {
      this.getFieldCropAppDischarges()
    }
  }
  getFieldCropAppDischarges() {
    get(`${this.props.BASE_URL}/api/discharge/${this.state.dairy_id}`)
      .then(discharge => {
        let _discharge = groupByKeys(discharge, ['discharge_type'])
        this.setState({ discharge: _discharge })
      })
  }

  toggleShowConfirmDeleteDischargeModal(val) {
    this.setState({ showConfirmDeleteDischargeModal: val })
  }
  onConfirmDischargeDelete(deleteDischargeObj) {
    this.setState({ showConfirmDeleteDischargeModal: true, deleteDischargeObj })
  }
  onDischargeDelete() {
    if (Object.keys(this.state.deleteDischargeObj).length > 0) {
      post(`${this.props.BASE_URL}/api/discharge/delete`, { pk: this.state.deleteDischargeObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteDischargeModal(false)
          this.getFieldCropAppDischarges()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  /** TSV: toggle, onChange, onUpload, View */
  toggleShowUploadFieldCropAppDischargeTSVModal(val) {
    this.setState({
      showUploadFieldCropAppDischargeTSVModal: val,
      tsvText: "",
      uploadedFilename: ""
    })
  }
  onUploadFieldCropAppDischargeTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      readTSV(files[0], (_ev) => {
        const { result } = _ev.target
        this.setState({ tsvText: result, uploadedFilename: files[0].name })
      })
    }
  }
  onUploadFieldCropAppDischargeTSV() {
    // 24 columns from TSV
    let dairy_pk = this.state.dairy_id
    let rows = processTSVText(this.state.tsvText, this.state.numCols) // extract rows from Text of tsv file TODO()


    let result_promises = rows.map((row, i) => {
      const [
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
      ] = row

      let dischargeData = {
        dairy_id: dairy_pk,
        discharge_type,
        discharge_datetime,
        discharge_loc,
        vol: toFloat(checkEmpty(vol)),
        vol_unit,
        duration_of_discharge: toFloat(checkEmpty(duration_of_discharge)),
        discharge_src,
        method_of_measuring,
        sample_location_reason,
        ref_number
      }

      return post(`${this.props.BASE_URL}/api/discharge/create`, dischargeData)
    })


    Promise.all(result_promises)            // Execute promises to create field_crop && field_crop_harvet entries in the DB
      .then(res => {
        console.log("Completed uploading Discharge TSV", res)
        uploadTSVToDB(this.state.uploadedFilename, this.state.tsvText, this.state.dairy_id, this.state.tsvType)
        this.toggleShowUploadFieldCropAppDischargeTSVModal(false)
        this.getFieldCropAppDischarges()
        this.props.onAlert('Success!', 'success')
      })
      .catch(err => {
        console.log("Error with all promises")
        console.log(err)
        this.props.onAlert('Failed uploading!', 'error')
      })
  }
  toggleViewTSVsModal(val) {
    this.setState({ showViewTSVsModal: val })
  }

  getDischargeSortedKeys() {
    return Object.keys(this.state.discharge).sort()
  }

  renderDischarge({ index, style }) {
    let key = this.getDischargeSortedKeys()[index]
    let discharges = this.state.discharge[key]
    return (
      <DischargeView key={`fcsview${index}`} style={style}
        discharges={discharges}
        onDelete={this.onConfirmDischargeDelete.bind(this)}
      />
    )
  }
  getDischargeSize(index) {
    let key = this.getDischargeSortedKeys()[index]
    let num = this.state.discharge[key].length
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
              onClick={() => this.toggleShowUploadFieldCropAppDischargeTSVModal(true)}
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
          <Typography variant='h3'>Discharges</Typography>
          {this.getDischargeSortedKeys().length > 0 ?
            <List
              height={Math.max(this.state.windowHeight - 800, 100)}
              itemCount={this.getDischargeSortedKeys().length}
              itemSize={this.getDischargeSize.bind(this)}
              width={this.state.windowWidth * (.82)}
            >
              {this.renderDischarge.bind(this)}
            </List>
            :
            <React.Fragment></React.Fragment>
          }
        </Grid>


        <ActionCancelModal
          open={this.state.showConfirmDeleteDischargeModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Discharge for ${this.state.deleteDischargeObj.fieldtitle} - ${this.state.deleteDischargeObj.app_date}?`}

          onAction={this.onDischargeDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteDischargeModal(false)}
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
          open={this.state.showUploadFieldCropAppDischargeTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Discharge TSV`}
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppDischargeTSV.bind(this)}
          onChange={this.onUploadFieldCropAppDischargeTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppDischargeTSVModal(false)}
        />
      </Grid>
    )
  }
}

export default Discharge = withRouter(withTheme(Discharge))
