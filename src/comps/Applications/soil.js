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
import { formatDate, formatFloat, groupByKeys, naturalSortBy } from "../../utils/format"
import { VariableSizeList as List } from "react-window";

import UploadTSVModal from "../Modals/uploadTSVModal"
import ViewTSVsModal from "../Modals/viewTSVsModal"
import { naturalSort, nestedGroupBy } from "../../utils/format"
import { renderFieldButtons, renderCropButtons, CurrentFieldCrop } from './selectButtonGrid'
import ActionCancelModal from "../Modals/actionCancelModal"
import { get, post } from '../../utils/requests'
import {
  SOIL, TSV_INFO, readTSV, uploadNutrientApp, uploadTSVToDB
} from "../../utils/TSV"
import { DatePicker } from '@material-ui/pickers'



/** View for Process Wastewater Entry in DB */
const SoilView = (props) => {
  const soils = props && props.soils ? props.soils : []
  const headerInfo = soils && soils.length > 0 ? soils[0] : {}

  return (
    <Grid container item xs={12} style={{ marginBottom: "40px", marginTop: "15px", ...props.style }}>
      {soils.sort((a, b) => naturalSortBy(a, b, 'app_date')).map((soil, i) => {
        return (
          <SoilViewCard key={`pwwaer_${i}`}
            soil={soil}
            onDelete={props.onDelete}
            index={i}
          />
        )
      })}
    </Grid>
  )
}

const SoilViewCard = (props) => {
  let {
    app_method, n_con_0, p_con_0, k_con_0,
    n_con_1, p_con_1, k_con_1, n_con_2, p_con_2, k_con_2,
    sample_date_0, sample_date_1, sample_date_2,
    croptitle, app_date
  } = props.soil

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
            {`Lvl 1: Sample date ${sample_date_0 ? formatDate(sample_date_0.split("T")[0]) : ' '} N ${formatFloat(n_con_0)} P ${formatFloat(p_con_0)} K ${formatFloat(k_con_0)}`}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='caption'>
            {`Lvl 2: Sample date ${sample_date_1 ? formatDate(sample_date_1.split("T")[0]) : ' '} N ${formatFloat(n_con_1)} P ${formatFloat(p_con_1)} K ${formatFloat(k_con_1)}`}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='caption'>
            {`Lvl 3: Sample date ${sample_date_2 ? formatDate(sample_date_2.split("T")[0]) : ' '} N ${formatFloat(n_con_2)} P ${formatFloat(p_con_2)} K ${formatFloat(k_con_2)}`}
          </Typography>
        </Grid>

      </CardContent>
      <CardActions>
        <Tooltip title="Delete Soil">
          <IconButton className='showOnHover'
            onClick={() => props.onDelete(props.soil)}
          >
            <DeleteIcon color="error" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  )
}

const SoilAnalysisView = (props) => {
  const analyses = props && props.analyses ? props.analyses : []
  const headerInfo = analyses && analyses.length > 0 ? analyses[0] : {}
  return (
    <Grid container item xs={12} className='showOnHoverParent'>
      <Grid item xs={12}>
        <Typography variant='h6'>
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
      viewFieldKey: '',
      viewPlantDateKey: '',
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

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.dairy_id !== this.state.dairy_id || this.props.parentUpdated !== prevProps.parentUpdated) {
      this.getFieldCropAppSoils()
      this.getFieldCropAppSoilAnalyses()
    }
  }

  getFieldCropAppSoils() {
    get(`${this.props.BASE_URL}/api/field_crop_app_soil/${this.state.dairy_id}`)
      .then(res => {
        if (res.error) {
          console.log(res.error)
          return
        }

        let soilByFieldTitle = nestedGroupBy(res, ['fieldtitle', 'plant_date'])
        const keys = Object.keys(soilByFieldTitle).sort(naturalSort)
        if (keys.length > 0) {
          this.setState({ field_crop_app_soil: soilByFieldTitle, viewFieldKey: keys[0] })
        } else {
          this.setState({ field_crop_app_soil: {}, viewFieldKey: '' })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  getFieldCropAppSoilAnalyses() {
    get(`${this.props.BASE_URL}/api/field_crop_app_soil_analysis/${this.state.dairy_id}`)
      .then(field_crop_app_soil_analysis => {
        this.setState({ field_crop_app_soil_analysis: groupByKeys(field_crop_app_soil_analysis, ['field_id']) })
      })
  }

  getAppEventsByViewKeys() {
    // Returns a list of objects for the selected viewFieldKey && viewPlantDateKey
    if (this.state.viewFieldKey && this.state.viewPlantDateKey && this.state.field_crop_app_soil[this.state.viewFieldKey] &&
      this.state.field_crop_app_soil[this.state.viewFieldKey][this.state.viewPlantDateKey]) {
      return this.state.field_crop_app_soil[this.state.viewFieldKey][this.state.viewPlantDateKey]
    }
    return []
  }

  toggleShowConfirmDeleteSoilModal(val) {
    this.setState({ showConfirmDeleteSoilModal: val })
  }
  onConfirmSoilDelete(deleteSoilObj) {
    this.setState({ showConfirmDeleteSoilModal: true, deleteSoilObj })
  }
  onSoilDelete() {
    if (Object.keys(this.state.deleteSoilObj).length > 0) {
      post(`${this.props.BASE_URL}/api/field_crop_app_soil/delete`, {
        pk: this.state.deleteSoilObj.pk,
        dairy_id: this.state.dairy_id
      })
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
      post(`${this.props.BASE_URL}/api/field_crop_app_soil_analysis/delete`, {
        pk: this.state.deleteSoilAnalysisObj.pk,
        dairy_id: this.state.dairy_id
      })
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
    this.setState({
      showUploadFieldCropAppSoilTSVModal: val,
      tsvText: "",
      uploadedFilename: ""
    })
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
    uploadNutrientApp(this.state.tsvText, this.state.tsvType, dairy_pk)
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
    return 90 + (75 * num)
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
              height={250}
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

        <Grid item container xs={12}>
          {renderFieldButtons(this.state.field_crop_app_soil, this)}
          {renderCropButtons(this.state.field_crop_app_soil, this.state.viewFieldKey, this)}
          <CurrentFieldCrop
            viewFieldKey={this.state.viewFieldKey}
            viewPlantDateKey={this.state.viewPlantDateKey}
          />
          {this.getAppEventsByViewKeys().length > 0 ?
            <SoilView
              soils={this.getAppEventsByViewKeys()}
              onDelete={this.onConfirmSoilDelete.bind(this)}
            />
            :
            <React.Fragment></React.Fragment>
          }
        </Grid>
        {/* <Grid item xs={12}>
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
        </Grid> */}


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
          BASE_URL={this.props.BASE_URL}
        />
        <UploadTSVModal
          open={this.state.showUploadFieldCropAppSoilTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Soil TSV`}
          fileType="csv"
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
