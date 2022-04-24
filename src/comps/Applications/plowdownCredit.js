import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField,
  Card, CardContent, CardActions
} from '@material-ui/core'


import DeleteIcon from '@material-ui/icons/Delete'
import { CloudUpload } from '@material-ui/icons'
import WbCloudyIcon from '@material-ui/icons/WbCloudy' // viewTSV
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import { formatDate, formatFloat, naturalSortBy, splitDate } from "../../utils/format"
import { VariableSizeList as List } from "react-window";

import UploadTSVModal from "../Modals/uploadTSVModal"
import ViewTSVsModal from "../Modals/viewTSVsModal"
import { naturalSort, nestedGroupBy } from "../../utils/format"
import { renderFieldButtons, renderCropButtons, CurrentFieldCrop } from './selectButtonGrid'
import ActionCancelModal from "../Modals/actionCancelModal"
import { get, post } from '../../utils/requests'
import { PLOWDOWN_CREDIT, TSVUtil } from "../../utils/TSV"
import { DatePicker } from '@material-ui/pickers'



/** View for Process Wastewater Entry in DB */
const PlowdownCreditView = (props) => {
  const plowdownCredits = props && props.plowdownCredits ? props.plowdownCredits : []
  const headerInfo = plowdownCredits && plowdownCredits.length > 0 ? plowdownCredits[0] : {}

  return (
    <Grid container item xs={12} style={{ marginBottom: "40px", marginTop: "15px", ...props.style }}>
      {plowdownCredits.sort((a, b) => naturalSortBy(a, b, 'app_date')).map((plowdownCredit, i) => {
        return (
          <PlowdownCreditViewCard
            plowdownCredit={plowdownCredit}
            onDelete={props.onDelete}
            key={`pdcv${i}`}
          />
        )
      })}
    </Grid>
  )
}


const PlowdownCreditViewCard = (props) => {
  let {
    app_method, n_lbs_acre, p_lbs_acre, k_lbs_acre,
    croptitle, app_date
  } = props.plowdownCredit

  return (
    <Card variant="outlined" key={`pwwaer${props.index}`} className='showOnHoverParent'>
      <CardContent>
        <Typography>
          {croptitle} - {app_method}
        </Typography>
        <DatePicker label="App Date"
          value={app_date}
          open={false}
        />
        <Grid item xs={12}>
          <Typography variant='caption'>
            {`Lbs per Acre:  N ${formatFloat(n_lbs_acre)} P ${formatFloat(p_lbs_acre)} K ${formatFloat(k_lbs_acre)}`}
          </Typography>
        </Grid>


      </CardContent>
      <CardActions>
        <Tooltip title="Delete PlowdownCredit">
          <IconButton className='showOnHover'
            onClick={() => props.onDelete(props.plowdownCredit)}
          >
            <DeleteIcon color="error" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  )
}

class PlowdownCredit extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      field_crop_app_plowdown_credit: {},
      tsvType: PLOWDOWN_CREDIT,
      showAddPlowdownCreditModal: false,
      showConfirmDeletePlowdownCreditModal: false,
      showUploadFieldCropAppPlowdownCreditTSVModal: false,
      deletePlowdownCreditObj: {},
      tsvFile: "",
      uploadedFilename: "",
      toggleShowDeleteAllModal: false,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      showViewTSVsModal: false,
      viewFieldKey: '',
      viewPlantDateKey: '',
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
      .then(res => {
        let plowByFieldtitle = nestedGroupBy(res, ['fieldtitle', 'plant_date'])
        const keys = Object.keys(plowByFieldtitle).sort(naturalSort)
        if (keys.length > 0) {
          this.setState({ field_crop_app_plowdown_credit: plowByFieldtitle, viewFieldKey: keys[0] })
        } else {
          this.setState({ field_crop_app_plowdown_credit: {}, viewFieldKey: '' })
        }
      })
  }

  getAppEventsByViewKeys() {
    // Returns a list of objects for the selected viewFieldKey && viewPlantDateKey
    if (this.state.viewFieldKey && this.state.viewPlantDateKey && this.state.field_crop_app_plowdown_credit[this.state.viewFieldKey] &&
      this.state.field_crop_app_plowdown_credit[this.state.viewFieldKey][this.state.viewPlantDateKey]) {
      return this.state.field_crop_app_plowdown_credit[this.state.viewFieldKey][this.state.viewPlantDateKey]
    }
    return []
  }

  toggleShowConfirmDeletePlowdownCreditModal(val) {
    this.setState({ showConfirmDeletePlowdownCreditModal: val })
  }
  onConfirmPlowdownCreditDelete(deletePlowdownCreditObj) {
    this.setState({ showConfirmDeletePlowdownCreditModal: true, deletePlowdownCreditObj })
  }
  onPlowdownCreditDelete() {
    if (Object.keys(this.state.deletePlowdownCreditObj).length > 0) {
      post(`${this.props.BASE_URL}/api/field_crop_app_plowdown_credit/delete`, {
        pk: this.state.deletePlowdownCreditObj.pk,
        dairy_id: this.state.dairy_id
      })
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
      tsvFile: "",
      uploadedFilename: ""
    })
  }
  onUploadFieldCropAppPlowdownCreditTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      this.setState({ tsvFile: files[0], uploadedFilename: files[0].name })
    }
  }
  async onUploadFieldCropAppPlowdownCreditTSV() {
    // 24 columns from TSV
    let dairy_id = this.state.dairy_id

    try {
      const result = await TSVUtil.uploadTSV(this.state.tsvFile, this.state.tsvType, this.state.uploadedFilename, dairy_id)
      console.log("Upload TSV result: ", this.state.tsvType, result)
      this.toggleShowUploadFieldCropAppPlowdownCreditTSVModal(false)
      this.getFieldCropAppPlowdownCredits()
      this.props.onAlert('Uploaded!', 'success')
    } catch (e) {
      console.log("Error with all promises")
      console.log(e)
      this.props.onAlert('Failed uploading!', 'error')
    }

    // uploadNutrientApp(this.state.tsvFile, this.state.tsvType, dairy_pk)
    //   .then(res => {
    //     console.log("Completed uploading Plowdown Credit TSV", res)
    //     uploadTSVToDB(this.state.uploadedFilename, this.state.tsvFile, this.state.dairy_id, this.state.tsvType)
    //     this.toggleShowUploadFieldCropAppPlowdownCreditTSVModal(false)
    //     this.getFieldCropAppPlowdownCredits()
    //     this.props.onAlert('Success!', 'success')
    //   })
    //   .catch(err => {
    //     console.log("Error with all promises")
    //     console.log(err)
    //     this.props.onAlert('Failed uploading', 'error')
    //   })
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


        <Grid item container xs={12}>
          {renderFieldButtons(this.state.field_crop_app_plowdown_credit, this)}
          {renderCropButtons(this.state.field_crop_app_plowdown_credit, this.state.viewFieldKey, this)}
          <CurrentFieldCrop
            viewFieldKey={this.state.viewFieldKey}
            viewPlantDateKey={this.state.viewPlantDateKey}
          />
          {this.getAppEventsByViewKeys().length > 0 ?
            <PlowdownCreditView
              plowdownCredits={this.getAppEventsByViewKeys()}
              onDelete={this.onConfirmPlowdownCreditDelete.bind(this)}
            />
            :
            <React.Fragment></React.Fragment>
          }
        </Grid>

        {/* <Grid item xs={12}>
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
        </Grid> */}


        <ActionCancelModal
          open={this.state.showConfirmDeletePlowdownCreditModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete PlowdownCredit for: 
            ${this.state.deletePlowdownCreditObj.fieldtitle} - 
            ${formatDate(splitDate(this.state.deletePlowdownCreditObj.app_date))}?
          `}
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
          fileType="csv"
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
