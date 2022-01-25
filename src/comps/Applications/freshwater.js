import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'

import WbCloudyIcon from '@material-ui/icons/WbCloudy' // viewTSV
import { CloudUpload } from '@material-ui/icons' // uploadTSV

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'

// import { VariableSizeList as List } from "react-window"
import { naturalSort, nestedGroupBy } from "../../utils/format"
import UploadTSVModal from "../Modals/uploadTSVModal"
import ViewTSVsModal from "../Modals/viewTSVsModal"
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import AddFreshwaterSourceModal from "../Modals/addFreshwaterSourceModal"
import AddFreshwaterAnalysisModal from "../Modals/addFreshwaterAnalysisModal"
import AddFreshwaterModal from "../Modals/addFreshwaterModal"
import ActionCancelModal from "../Modals/actionCancelModal"
import { get, post } from '../../utils/requests'
import { checkEmpty } from '../../utils/TSV'
import { FRESHWATER_SOURCE_TYPES } from '../../utils/constants'
import { renderFieldButtons, renderCropButtons } from './selectButtonGrid'

import {
  readTSV, uploadTSVToDB, uploadNutrientApp
} from "../../utils/TSV"
import { DatePicker } from '@material-ui/pickers'

const SOURCE_OF_ANALYSES = [
  'Lab Analysis',
  'Other/ Estimated',
]

/** View for Process Wastewater Entry in DB */
const FreshwaterAppEvent = (props) => {
  return (
    <Grid item container xs={12} style={props.style}>
      <Grid item xs={12}>
        <Typography variant="h4">{props.freshwaters[0].fieldtitle}</Typography>
        <hr />
      </Grid>
      {
        props.freshwaters.map((freshwater, i) => {
          return (
            <Grid item container xs={12} key={`fwmainview${i}`}>
              <Grid item xs={6}>
                <Typography variant="subtitle1">{freshwater.croptitle}</Typography>
              </Grid>
              <Grid item xs={6} align="right">
                <DatePicker
                  value={freshwater.plant_date}
                  label='Planted'
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">{freshwater.src_desc} | {freshwater.src_type}</Typography>
              </Grid>
              <Grid item xs={6} align="right">
                <DatePicker
                  value={freshwater.app_date}
                  label='Applied'
                />
              </Grid>
              <Grid item container xs={10}>
                <Grid item xs={3}>
                  <TextField
                    label="Amount Applied"
                    value={freshwater.amount_applied}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="EC"
                    value={freshwater.ec}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="TDS"
                    value={freshwater.tds}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Nitrogen lbs / acre"
                    value={freshwater.totaln}
                  />
                </Grid>
              </Grid>
              <Grid item container xs={2} justifyContent="center" >
                <Tooltip title="Delete Freshwater Event">
                  <IconButton onClick={() => props.onDelete(freshwater)}>
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


const FreshwaterSource = (props) => {
  return (
    <Grid item container xs={3}>
      <Grid item container xs={10}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={props.source.src_desc}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={props.source.src_type}
          />
        </Grid>
      </Grid>

      <Grid item xs={2}>
        <Tooltip title="Delete Freshwater Source">
          <IconButton onClick={() => props.onConfirmFreshwaterSourceDelete(props.source)}>
            <DeleteIcon color="error" />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  )

}

const FreshwaterAnalysis = (props) => {
  return (
    <Grid item container xs={3} >
      <Grid item container xs={10}>
        <Grid item xs={12}>
          <DatePicker
            fullWidth
            value={props.analysis.sample_date}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={`Source: ${props.analysis.src_desc}, ${props.analysis.sample_desc}`}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            value={`N (mg/L) ${props.analysis.n_con}`}
          />
        </Grid>
      </Grid>
      <Grid item xs={2}>
        <Tooltip title="Delete Freshwater Source">
          <IconButton onClick={() => props.onConfirmFreshwaterAnalysisDelete(props.analysis)}>
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
class Freshwater extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      fieldCropAppEvents: [],
      fieldCropAppFreshwaterSources: [],
      fieldCropAppFreshwaterAnalyses: [],
      fieldCropAppFreshwaters: {},
      tsvType: props.tsvType,
      numCols: props.numCols,
      showAddFreshwaterSourceModal: false,
      showAddFreshwaterAnalysisModal: false,
      showAddFreshwaterModal: false,
      showConfirmDeleteFreshwaterSourceModal: false,
      showConfirmDeleteFreshwaterAnalysisModal: false,
      showConfirmDeleteFreshwaterModal: false,
      deleteFreshwaterSourceObj: {},
      deleteFreshwaterAnalysisObj: {},
      deleteFreshwaterObj: {},
      showUploadFieldCropAppFreshwateTSVModal: false,
      tsvText: '',
      uploadedFilename: '',
      showViewTSVsModal: false,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      toggleShowDeleteAllModal: false,
      viewFieldKey: '',
      viewPlantDateKey: '',
      createFreshwaterSourceObj: {
        dairy_id: props.dairy_id,
        src_desc: "",
        src_type: "",
        src_type_idx: 0,
      },
      createFreshwaterAnalysisObj: {
        dairy_id: props.dairy_id,
        src_idx: 0,
        fresh_water_source_id: '', // via src_idx
        sample_date: new Date(),
        sample_desc: '',
        src_of_analysis_idx: 0,
        src_of_analysis: '',
        n_con: '',
        nh4_con: '',
        no2_con: '',
        ca_con: '',
        mg_con: '',
        na_con: '',
        hco3_con: '',
        co3_con: '',
        so4_con: '',
        cl_con: '',
        ec: '',
        tds: '',
      },
      createFreshwaterObj: {
        dairy_id: props.dairy_id,
        field_crop_app_idx: 0,
        field_crop_app_freshwater_analysis_idx: 0,
        field_crop_app_id: '',
        field_crop_app_freshwater_analysis_id: '',
        app_rate: '',
        run_time: '',
        amount_applied: '',
        amt_applied_per_acre: '',
        totalN: ''
      },
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }

  componentDidMount() {
    this.getFieldCropAppEvents()
    this.getFieldCropAppFreshwaterSource()
    this.getFieldCropAppFreshwaterAnalysis()
    this.getFieldCropAppFreshwater()
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.dairy_id !== this.state.dairy_id || this.props.parentUpdated !== prevProps.parentUpdated) {
      this.getFieldCropAppEvents()
      this.getFieldCropAppFreshwaterSource()
      this.getFieldCropAppFreshwaterAnalysis()
      this.getFieldCropAppFreshwater()
    }
  }

  getFieldCropAppEvents() {
    get(`${this.props.BASE_URL}/api/field_crop_app/${this.state.dairy_id}`)
      .then(res => {
        res.sort((a, b) => {
          return `${a.fieldtitle} ${a.app_date} ${a.app_method}` > `${b.fieldtitle} ${b.app_date} ${b.app_method}` ? 1 : -1
        })

        this.setState({ fieldCropAppEvents: res })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getFieldCropAppFreshwaterSource() {
    get(`${this.props.BASE_URL}/api/field_crop_app_freshwater_source/${this.state.dairy_id}`)
      .then(res => {
        this.setState({ fieldCropAppFreshwaterSources: res })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getFieldCropAppFreshwaterAnalysis() {
    get(`${this.props.BASE_URL}/api/field_crop_app_freshwater_analysis/${this.state.dairy_id}`)
      .then(res => {
        this.setState({ fieldCropAppFreshwaterAnalyses: res })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getFieldCropAppFreshwater() {
    get(`${this.props.BASE_URL}/api/field_crop_app_freshwater/${this.state.dairy_id}`)
      .then(res => {
        let freshwastewaterByFieldtitle = nestedGroupBy(res, ['fieldtitle', 'plant_date'])
        const keys = Object.keys(freshwastewaterByFieldtitle).sort(naturalSort)
        if (keys.length > 0) {
          this.setState({ fieldCropAppFreshwaters: freshwastewaterByFieldtitle, viewFieldKey: keys[0] })
        } else {
          this.setState({ fieldCropAppFreshwaters: {}, viewFieldKey: '' })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  getAppEventsByViewKeys() {
    // Returns a list of objects for the selected viewFieldKey && viewPlantDateKey
    if (this.state.viewFieldKey && this.state.viewPlantDateKey && this.state.fieldCropAppFreshwaters[this.state.viewFieldKey] &&
      this.state.fieldCropAppFreshwaters[this.state.viewFieldKey][this.state.viewPlantDateKey]) {
      return this.state.fieldCropAppFreshwaters[this.state.viewFieldKey][this.state.viewPlantDateKey]
    }
    return []
  }



  /** Manually add Process Wastewater */
  toggleShowAddFreshwaterSourceModal(val) {
    this.setState({ showAddFreshwaterSourceModal: val })
  }
  toggleShowAddFreshwaterAnalysisModal(val) {
    this.setState({ showAddFreshwaterAnalysisModal: val })
  }
  toggleShowAddFreshwaterModal(val) {
    this.setState({ showAddFreshwaterModal: val })
  }

  onCreateFreshwaterSourceChange(ev) {
    const { name, value } = ev.target
    let createFreshwaterSourceObj = this.state.createFreshwaterSourceObj
    createFreshwaterSourceObj[name] = value
    this.setState({ createFreshwaterSourceObj: createFreshwaterSourceObj })
  }
  onCreateFreshwaterAnalysisChange(ev) {
    const { name, value } = ev.target
    let createFreshwaterAnalysisObj = this.state.createFreshwaterAnalysisObj
    createFreshwaterAnalysisObj[name] = value
    this.setState({ createFreshwaterAnalysisObj: createFreshwaterAnalysisObj })
  }
  onCreateFreshwaterChange(ev) {
    const { name, value } = ev.target
    let createFreshwaterObj = this.state.createFreshwaterObj
    createFreshwaterObj[name] = value
    this.setState({ createFreshwaterObj: createFreshwaterObj })
  }

  /** Create Freshwater */
  createFreshwater() {
    let createObj = this.state.createFreshwaterObj
    createObj.dairy_id = this.state.dairy_id
    createObj.field_crop_app_id = this.state.fieldCropAppEvents[createObj.field_crop_app_idx].pk
    createObj.field_crop_app_freshwater_analysis_id = this.state.fieldCropAppFreshwaterAnalyses[createObj.field_crop_app_freshwater_analysis_idx].pk

    createObj.app_rate = checkEmpty(createObj.app_rate)
    createObj.run_time = checkEmpty(createObj.run_time)
    createObj.amount_applied = checkEmpty(createObj.amount_applied)
    createObj.amt_applied_per_acre = checkEmpty(createObj.amt_applied_per_acre)
    createObj.totalN = checkEmpty(createObj.totalN)

    console.log("creating freshwater event: ", createObj, this.state.fieldCropAppFreshwaterAnalyses[createObj.field_crop_app_freshwater_analysis_idx])
    post(`${this.props.BASE_URL}/api/field_crop_app_freshwater/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddFreshwaterModal(false)
        this.props.getFieldCropAppFreshwater()
      })
      .catch(err => {
        console.log(err)
      })
  }
  createFreshwaterSource() {
    let createObj = this.state.createFreshwaterSourceObj
    createObj.dairy_id = this.state.dairy_id
    createObj.src_type = FRESHWATER_SOURCE_TYPES[parseInt(createObj.src_type_idx)]

    post(`${this.props.BASE_URL}/api/field_crop_app_freshwater_source/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddFreshwaterSourceModal(false)
        this.props.getFieldCropAppFreshwaterSource()
      })
      .catch(err => {
        console.log(err)
      })
  }
  createFreshwaterAnalysis() {
    let createObj = this.state.createFreshwaterAnalysisObj
    createObj.dairy_id = this.state.dairy_id
    createObj.fresh_water_source_id = this.state.fieldCropAppFreshwaterSources[createObj.src_idx].pk
    createObj.src_of_analysis = SOURCE_OF_ANALYSES[createObj.src_of_analysis_idx]



    createObj.n_con = checkEmpty(createObj.n_con)
    createObj.nh4_con = checkEmpty(createObj.nh4_con)
    createObj.no2_con = checkEmpty(createObj.no2_con)
    createObj.ca_con = checkEmpty(createObj.ca_con)
    createObj.mg_con = checkEmpty(createObj.mg_con)
    createObj.na_con = checkEmpty(createObj.na_con)
    createObj.hco3_con = checkEmpty(createObj.hco3_con)
    createObj.co3_con = checkEmpty(createObj.co3_con)
    createObj.so4_con = checkEmpty(createObj.so4_con)
    createObj.cl_con = checkEmpty(createObj.cl_con)
    createObj.ec = checkEmpty(createObj.ec)
    createObj.tds = checkEmpty(createObj.tds)

    console.log("creating freshwater event: ", createObj)

    post(`${this.props.BASE_URL}/api/field_crop_app_freshwater_analysis/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddFreshwaterAnalysisModal(false)
        this.props.getFieldCropAppFreshwaterAnalysis()
      })
      .catch(err => {
        console.log(err)
      })
  }


  /** Delete Process Wastewater entry */
  toggleShowConfirmDeleteFreshwaterModal(val) {
    this.setState({ showConfirmDeleteFreshwaterModal: val })
  }
  toggleShowConfirmDeleteFreshwaterSourceModal(val) {
    this.setState({ showConfirmDeleteFreshwaterSourceModal: val })
  }
  toggleShowConfirmDeleteFreshwaterAnalysisModal(val) {
    this.setState({ showConfirmDeleteFreshwaterAnalysisModal: val })
  }

  onConfirmFreshwaterSourceDelete(deleteFreshwaterSourceObj) {
    this.setState({ showConfirmDeleteFreshwaterSourceModal: true, deleteFreshwaterSourceObj: deleteFreshwaterSourceObj })
  }
  onConfirmFreshwaterAnalysisDelete(deleteFreshwaterAnalysisObj) {
    this.setState({ showConfirmDeleteFreshwaterAnalysisModal: true, deleteFreshwaterAnalysisObj: deleteFreshwaterAnalysisObj })
  }
  onConfirmFreshwaterDelete(deleteFreshwaterObj) {
    this.setState({ showConfirmDeleteFreshwaterModal: true, deleteFreshwaterObj: deleteFreshwaterObj })
  }

  onFreshwaterDelete() {
    if (Object.keys(this.state.deleteFreshwaterObj).length > 0) {
      post(`${this.props.BASE_URL}/api/field_crop_app_freshwater/delete`, { pk: this.state.deleteFreshwaterObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteFreshwaterModal(false)
          this.props.getFieldCropAppFreshwater()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
  onFreshwaterSourceDelete() {
    if (Object.keys(this.state.deleteFreshwaterSourceObj).length > 0) {
      post(`${this.props.BASE_URL}/api/field_crop_app_freshwater_source/delete`, { pk: this.state.deleteFreshwaterSourceObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteFreshwaterSourceModal(false)
          this.props.getFieldCropAppFreshwaterSource()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
  onFreshwaterAnalysisDelete() {
    if (Object.keys(this.state.deleteFreshwaterAnalysisObj).length > 0) {
      post(`${this.props.BASE_URL}/api/field_crop_app_freshwater_analysis/delete`, { pk: this.state.deleteFreshwaterAnalysisObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteFreshwaterAnalysisModal(false)
          this.props.getFieldCropAppFreshwaterAnalysis()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  /** TSV: toggle, onChange, onUpload, View */
  toggleShowUploadFieldCropAppFreshwateTSVModal(val) {
    this.setState({
      showUploadFieldCropAppFreshwateTSVModal: val,
      tsvText: "",
      uploadedFilename: ""
    })
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
    uploadNutrientApp(this.state.tsvText, this.state.tsvType, dairy_pk)
      .then(res => {
        console.log("Completed uploading Freshwater TSV")
        // uploadTSVToDB(this.state.uploadedFilename, this.state.tsvText, this.state.dairy_id, this.state.tsvType)
        this.toggleShowUploadFieldCropAppFreshwateTSVModal(false)
        uploadTSVToDB(this.state.uploadedFilename, this.state.tsvText, this.state.dairy_id, this.state.tsvType)
        this.getFieldCropAppFreshwater()
        this.props.onAlert('Success!', 'success')
      })
      .catch(err => {
        console.log("Error with all promises")
        console.log(err)
        this.props.onAlert('Failed uploading.', 'error')
      })
  }

  toggleViewTSVsModal(val) {
    this.setState({ showViewTSVsModal: val })
  }

  renderItem({ index, style }) {
    let field_crop_app_id = this.getSortedKeys()[index]
    let freshwaters = this.state.fieldCropAppFreshwaters[field_crop_app_id]
    return (
      <FreshwaterAppEvent key={`ppwwviewrow${index}`} style={style}
        freshwaters={freshwaters}
        onDelete={this.onConfirmFreshwaterDelete.bind(this)}
      />
    )
  }

  getSortedKeys() {
    return Object.keys(this.state.fieldCropAppFreshwaters).sort()
  }

  getStartPos() {
    let numSources = parseInt(this.state.fieldCropAppFreshwaterSources.length / 2)
    let numAnalyses = parseInt(this.state.fieldCropAppFreshwaterAnalyses.length / 2)
    let headerSize = 0 // looks better when it extends past  the page when starting so low
    let sourceSectionSize = 32 + (48 * numSources)
    let analysisSectionSize = 32 + (48 * numAnalyses)
    return headerSize + sourceSectionSize + analysisSectionSize
  }

  getItemSize(index) {
    let field_crop_app_id = this.getSortedKeys()[index]
    let numRows = this.state.fieldCropAppFreshwaters[field_crop_app_id].length
    let numSources = parseInt(this.state.fieldCropAppFreshwaterSources.length / 2)
    let numAnalyses = parseInt(this.state.fieldCropAppFreshwaterAnalyses.length / 2)

    let headerSize = 80
    let sourceSectionSize = 32 + (48 * numSources)
    let analysisSectionSize = 32 + (48 * numAnalyses)
    let itemSize = 120

    return headerSize + (numRows * itemSize)
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
      post(`${this.props.BASE_URL}/api/field_crop_app_freshwater/deleteAll`, { dairy_id: this.state.dairy_id }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy_id, tsvType: this.props.tsvType }),
    ])
      .then(res => {
        this.confirmDeleteAllFromTable(false)
        this.getFieldCropAppEvents()
        this.getFieldCropAppFreshwaterSource()
        this.getFieldCropAppFreshwaterAnalysis()
        this.getFieldCropAppFreshwater()
      })
      .catch(err => {
        console.log(err)
      })
  }


  render() {

    return (
      <Grid item xs={12} container >
        <Grid item container xs={12}>
          <Grid item xs={10} align="right">
            <Tooltip title='Upload TSV'>
              <IconButton color="primary" variant="outlined"
                onClick={() => this.toggleShowUploadFieldCropAppFreshwateTSVModal(true)}
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
          <Grid item xs={1} align="right">
            <Tooltip title='Delete all Freshwater'>
              <IconButton onClick={() => this.confirmDeleteAllFromTable(true)}>
                <DeleteSweepIcon color='error' />
              </IconButton>
            </Tooltip>

          </Grid>

          {/* 
                <Grid item xs={1} align="right">
                <Tooltip title='Add freshwater source'>
                  <IconButton color="primary" variant="outlined"
                    onClick={() => this.toggleShowAddFreshwaterSourceModal(true)}
                  >
                    <SpaIcon />
                  </IconButton>

                </Tooltip>
              </Grid>

              <Grid item xs={1} align="right">
                <Tooltip title='Add freshwater analysis'>
                  <IconButton color="primary" variant="outlined"
                    onClick={() => this.toggleShowAddFreshwaterAnalysisModal(true)}
                  >
                    <ShowChartIcon />
                  </IconButton>

                </Tooltip>
              </Grid>

              <Grid item xs={1} align="right">
                <Tooltip title='Add freshwater to application event'>
                  <IconButton color="primary" variant="outlined"
                    onClick={() => this.toggleShowAddFreshwaterModal(true)}
                  >
                    <SpeakerNotesIcon />
                  </IconButton>

                </Tooltip>
              </Grid> 
      */}
        </Grid>

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
          open={this.state.showUploadFieldCropAppFreshwateTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Freshwater TSV`}
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppFreshwateTSV.bind(this)}
          onChange={this.onUploadFieldCropAppFreshwateTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppFreshwateTSVModal(false)}
        />

        <ActionCancelModal
          open={this.state.toggleShowDeleteAllModal}
          actionText="Delete all"
          cancelText="Cancel"
          modalText={`Delete All Freshwater Application Events?`}
          onAction={this.deleteAllFromTable.bind(this)}
          onClose={() => this.confirmDeleteAllFromTable(false)}
        />





        <Grid item xs={12}>


          {this.state.fieldCropAppFreshwaterSources.length > 0 ?
            <React.Fragment>
              <Typography variant="h5">Sources</Typography>
              <Grid item container xs={12}>
                {
                  this.state.fieldCropAppFreshwaterSources.map((source, i) => {
                    return (
                      <FreshwaterSource key={`fcafwsview${i}`}
                        source={source}
                        onConfirmFreshwaterSourceDelete={this.onConfirmFreshwaterSourceDelete.bind(this)}
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

        <Grid item xs={12} style={{ marginTop: '16px' }}>
          {this.state.fieldCropAppFreshwaterAnalyses.length > 0 ?
            <React.Fragment>
              <Typography variant="h5">Analyses</Typography>
              <Grid item container xs={12}>
                {
                  this.state.fieldCropAppFreshwaterAnalyses.map((analysis, i) => {
                    return (
                      <FreshwaterAnalysis key={`fcafwaview${i}`}
                        analysis={analysis}
                        onConfirmFreshwaterAnalysisDelete={this.onConfirmFreshwaterAnalysisDelete.bind(this)}
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

        <Grid item xs={12} style={{ marginTop: '16px' }}>

          <Grid item container xs={12}>
            {renderFieldButtons(this.state.fieldCropAppFreshwaters, this)}
            {renderCropButtons(this.state.fieldCropAppFreshwaters, this.state.viewFieldKey, this)}
            {this.getAppEventsByViewKeys().length > 0 ?
              <FreshwaterAppEvent
                freshwaters={this.getAppEventsByViewKeys()}
                onDelete={this.onConfirmFreshwaterDelete.bind(this)}
              />
              :
              <div>No events to show</div>
            }
          </Grid>

          {/* // Old ways */}
          {/* {this.getSortedKeys().length > 0 ?
            <List
              height={Math.max(this.state.windowHeight - this.getStartPos(), 100)}
              itemCount={this.getSortedKeys().length}
              itemSize={this.getItemSize.bind(this)}
              width={this.state.windowWidth * (.82)}
            >
              {this.renderItem.bind(this)}
            </List>

            :
            <React.Fragment></React.Fragment>
          } */}

          {/* {Object.keys(this.state.fieldCropAppFreshwaters).length > 0 ?

            Object.keys(this.state.fieldCropAppFreshwaters)
              .sort()
              .map((field_crop_app_id, i) => {
                let freshwaters = this.state.fieldCropAppFreshwaters[field_crop_app_id]
                return (
                  <FreshwaterAppEvent key={`ppwwviewrow${i}`}
                    freshwaters={freshwaters}
                    onDelete={this.onConfirmFreshwaterDelete.bind(this)}
                  />
                )
              })
            :
            <React.Fragment></React.Fragment>
          } */}
        </Grid>

        <ActionCancelModal
          open={this.state.showConfirmDeleteFreshwaterSourceModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Freshwater source ${this.state.deleteFreshwaterSourceObj.src_desc} - ${this.state.deleteFreshwaterSourceObj.src_type}?`}

          onAction={this.onFreshwaterSourceDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteFreshwaterSourceModal(false)}
        />
        <ActionCancelModal
          open={this.state.showConfirmDeleteFreshwaterAnalysisModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Freshwater for ${this.state.deleteFreshwaterAnalysisObj.sample_date} - ${this.state.deleteFreshwaterAnalysisObj.sample_desc}?`}

          onAction={this.onFreshwaterAnalysisDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteFreshwaterAnalysisModal(false)}
        />
        <ActionCancelModal
          open={this.state.showConfirmDeleteFreshwaterModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Freshwater for ${this.state.deleteFreshwaterObj.app_date}?`}

          onAction={this.onFreshwaterDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteFreshwaterModal(false)}
        />


        <AddFreshwaterSourceModal
          open={this.state.showAddFreshwaterSourceModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add freshwater source`}
          FRESHWATER_SOURCE_TYPES={FRESHWATER_SOURCE_TYPES}
          createFreshwaterSourceObj={this.state.createFreshwaterSourceObj}

          onAction={this.createFreshwaterSource.bind(this)}
          onChange={this.onCreateFreshwaterSourceChange.bind(this)}
          onClose={() => this.toggleShowAddFreshwaterSourceModal(false)}
        />
        <AddFreshwaterAnalysisModal
          open={this.state.showAddFreshwaterAnalysisModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add freshwater analysis`}
          SOURCE_OF_ANALYSES={SOURCE_OF_ANALYSES}
          createFreshwaterAnalysisObj={this.state.createFreshwaterAnalysisObj}
          fieldCropAppFreshwaterSources={this.state.fieldCropAppFreshwaterSources}
          onAction={this.createFreshwaterAnalysis.bind(this)}
          onChange={this.onCreateFreshwaterAnalysisChange.bind(this)}
          onClose={() => this.toggleShowAddFreshwaterAnalysisModal(false)}
        />
        <AddFreshwaterModal
          open={this.state.showAddFreshwaterModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add freshwater app event`}

          createFreshwaterObj={this.state.createFreshwaterObj}
          fieldCropAppFreshwaterAnalyses={this.state.fieldCropAppFreshwaterAnalyses}
          fieldCropAppEvents={this.state.fieldCropAppEvents}
          onAction={this.createFreshwater.bind(this)}
          onChange={this.onCreateFreshwaterChange.bind(this)}
          onClose={() => this.toggleShowAddFreshwaterModal(false)}
        />



      </Grid>
    )
  }
}

export default Freshwater = withRouter(withTheme(Freshwater))
