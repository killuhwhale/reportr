import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField,
  Card, CardContent, CardActions
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import WbCloudyIcon from '@material-ui/icons/WbCloudy' // viewTSV
import { CloudUpload } from '@material-ui/icons' // uploadTSV
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import { VariableSizeList as List } from "react-window";

import UploadTSVModal from "../Modals/uploadTSVModal"
import ViewTSVsModal from "../Modals/viewTSVsModal"
import AddSolidmanureAnalysisModal from "../Modals/addSolidmanureAnalysisModal"
import AddSolidmanureModal from "../Modals/addSolidmanureModal"
import ActionCancelModal from "../Modals/actionCancelModal"
import { get, post } from '../../utils/requests'
import { checkEmpty } from '../../utils/TSV'
import { formatDate, formatFloat, naturalSort, naturalSortBy, nestedGroupBy, splitDate } from "../../utils/format"
import { renderFieldButtons, renderCropButtons, CurrentFieldCrop } from './selectButtonGrid'
import { TSVUtil } from "../../utils/TSV"
import { FixedPageSize } from '../utils/FixedPageSize'


/** View for Process Wastewater Entry in DB */
const SolidmanureAppEvent = (props) => {
  return (

    <FixedPageSize container item xs={12} height='375px' style={props.style}>
      {
        props.solidmanures.sort((a, b) => naturalSortBy(a, b, 'app_date')).map((manure, i) => {
          return (
            <SolidmanureAppEventCard
              manure={manure}
              onDelete={props.onDelete}
              index={i}
              key={`smape_${i}`}
            />
          )
        })
      }
    </FixedPageSize>
  )
}

const SolidmanureAppEventCard = withTheme((props) => {
  let {
    app_method, material_type, n_con, p_con,
    k_con, amount_applied, app_date, croptitle, plant_date, moisture
  } = props.manure
  console.log(props.manure)
  return (
    <Grid item xs={12} md={4} lg={3}>
      <Card variant="outlined" key={`pwwaer${props.index}`} className='showOnHoverParent'>
        <CardContent>
          <Grid item xs={12} align='right'>
            <Typography variant='caption' >
              <Tooltip title='Sample date' placement="top">
                <span style={{ color: props.theme.palette.secondary.main }}>
                  {` ${formatDate(splitDate(app_date))}`}
                </span>
              </Tooltip>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle1' >
              <span style={{ color: props.theme.palette.primary.main }}>
                {` ${croptitle}: ${app_method}`}
              </span>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle1' >
              <span style={{ color: props.theme.palette.secondary.main }}>
                {` ${material_type}`}
              </span>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='caption'>

              N: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(n_con)} `}
              </span>
              P: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(p_con)} `}
              </span>
              K: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(k_con)} `}
              </span>
            </Typography>
            <Typography variant='caption'>
              Moisture: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(moisture)}`}
              </span>
            </Typography>
          </Grid>

          <Grid item xs={12}>

            <Typography variant='caption'>
              Amount: <span style={{ color: props.theme.palette.secondary.main }}>
                {` ${formatFloat(amount_applied)}`}
              </span>
            </Typography>
          </Grid>


        </CardContent>
        <CardActions>
          <Grid item xs={2}>
            <Tooltip title="Delete Wastewater Analysis">
              <IconButton className='showOnHover' size='small'
                onClick={() => props.onDelete(props.manure)}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Tooltip>
          </Grid>
        </CardActions>
      </Card>
    </Grid>

  )
})

const SolidmanureAnalysis = withTheme((props) => {
  const { n_con, p_con, k_con, moisture } = props.analysis
  return (
    <Grid item xs={12} md={4} lg={3}>
      <Card variant="outlined" key={`pwwaer${props.index}`} className='showOnHoverParent'>
        <CardContent>
          <Grid item xs={12} align='right'>
            <Typography variant='caption' >
              <Tooltip title='Sample date' placement="top">
                <span style={{ color: props.theme.palette.secondary.main }}>
                  {` ${formatDate(splitDate(props.analysis.sample_date))}`}
                </span>
              </Tooltip>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle1' >
              <span style={{ color: props.theme.palette.primary.main }}>
                {`${props.analysis.sample_desc} ${props.analysis.material_type}`}
              </span>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='subtitle2' >
              <span style={{ color: props.theme.palette.secondary.main }}>
                {`${props.analysis.src_of_analysis} ${props.analysis.method_of_reporting} `}
              </span>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='caption'>

              N: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(n_con)} `}
              </span>
              P: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(p_con)} `}
              </span>
              K: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(k_con)} `}
              </span>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='caption'>

              Moisture: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(moisture)} `}
              </span>
            </Typography>
          </Grid>

        </CardContent>
        <CardActions>
          <Grid item xs={2}>
            <Tooltip title="Delete Solid Manure Analysis">
              <IconButton className='showOnHover' size='small'
                onClick={() => props.onConfirmSolidmanureAnalysisDelete(props.analysis)}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Tooltip>
          </Grid>
        </CardActions>
      </Card>
    </Grid>
  )

})


class Solidmanure extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      fieldCropAppEvents: [],
      fieldCropAppSolidmanureAnalyses: [],
      fieldCropAppSolidmanures: {},

      tsvType: props.tsvType,
      numCols: props.numCols,
      toggleShowDeleteAllModal: false,

      showAddSolidmanureAnalysisModal: false,
      showAddSolidmanureModal: false,
      showConfirmDeleteSolidmanureAnalysisModal: false,
      showConfirmDeleteSolidmanureModal: false,
      showAnalyses: 'none',
      deleteSolidmanureAnalysisObj: {},
      deleteSolidmanureObj: {},
      showUploadFieldCropAppSolidmanureTSVModal: false,
      tsvFile: '',
      uploadedFilename: '',
      showViewTSVsModal: false,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      viewFieldKey: '',
      viewPlantDateKey: '',

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


  componentDidMount() {
    this.getFieldCropAppSolidmanureAnalysis()
    this.getFieldCropAppSolidmanure()
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.dairy_id !== this.state.dairy_id || this.props.parentUpdated !== prevProps.parentUpdated) {
      this.getFieldCropAppSolidmanureAnalysis()
      this.getFieldCropAppSolidmanure()
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
  getFieldCropAppSolidmanureAnalysis() {
    get(`${this.props.BASE_URL}/api/field_crop_app_solidmanure_analysis/${this.state.dairy_id}`)
      .then(res => {
        this.setState({ fieldCropAppSolidmanureAnalyses: res })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getFieldCropAppSolidmanure() {
    get(`${this.props.BASE_URL}/api/field_crop_app_solidmanure/${this.state.dairy_id}`)
      .then(res => {
        let fieldCropAppSolidmanures = nestedGroupBy(res, ['fieldtitle', 'plant_date'])
        const keys = Object.keys(fieldCropAppSolidmanures).sort(naturalSort)
        if (keys.length > 0) {
          this.setState({ fieldCropAppSolidmanures: fieldCropAppSolidmanures, viewFieldKey: keys[0] })
        } else {
          this.setState({ fieldCropAppSolidmanures: {}, viewFieldKey: '' })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
  getAppEventsByViewKeys() {
    // Returns a list of objects for the selected viewFieldKey && viewPlantDateKey
    if (this.state.viewFieldKey && this.state.viewPlantDateKey && this.state.fieldCropAppSolidmanures[this.state.viewFieldKey] &&
      this.state.fieldCropAppSolidmanures[this.state.viewFieldKey][this.state.viewPlantDateKey]) {
      return this.state.fieldCropAppSolidmanures[this.state.viewFieldKey][this.state.viewPlantDateKey]
    }
    return []
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
    post(`${this.props.BASE_URL}/api/field_crop_app_solidmanure/create`, createObj)
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

    post(`${this.props.BASE_URL}/api/field_crop_app_solidmanure_analysis/create`, createObj)
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
      post(`${this.props.BASE_URL}/api/field_crop_app_solidmanure/delete`, {
        pk: this.state.deleteSolidmanureObj.pk,
        dairy_id: this.state.dairy_id
      })
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
      post(`${this.props.BASE_URL}/api/field_crop_app_solidmanure_analysis/delete`, {
        pk: this.state.deleteSolidmanureAnalysisObj.pk,
        dairy_id: this.state.dairy_id
      }
      )
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
    this.setState({
      showUploadFieldCropAppSolidmanureTSVModal: val,
      tsvFile: "",
      uploadedFilename: ""
    })
  }
  onUploadFieldCropAppFreshwateTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      this.setState({ tsvFile: files[0], uploadedFilename: files[0].name })

    }
  }
  async onUploadFieldCropAppFreshwateTSV() {
    // 24 columns from TSV
    let dairy_id = this.state.dairy_id

    try {
      const result = await TSVUtil.uploadTSV(this.state.tsvFile, this.state.tsvType, this.state.uploadedFilename, dairy_id)
      console.log("Upload TSV result: ", this.state.tsvType, result)
      this.toggleShowUploadFieldCropAppSolidmanureTSVModal(false)
      this.getFieldCropAppSolidmanure()
      this.getFieldCropAppSolidmanureAnalysis()
      this.props.onAlert('Uploaded!', 'success')
    } catch (e) {
      console.log("Error with all promises")
      console.log(e)
      this.props.onAlert('Failed uploading!', 'error')
    }
  }

  toggleViewTSVsModal(val) {
    this.setState({ showViewTSVsModal: val })
  }

  renderItem({ index, style }) {
    let field_crop_app_id = this.getSortedKeys()[index]
    let solidmanures = this.state.fieldCropAppSolidmanures[field_crop_app_id]

    return (
      <SolidmanureAppEvent key={`ppwwviewrow${index}`} style={style}
        solidmanures={solidmanures}
        onDelete={this.onConfirmSolidmanureDelete.bind(this)}
      />
    )
  }
  getSortedKeys() {
    return Object.keys(this.state.fieldCropAppSolidmanures).sort()
  }
  getItemSize(index) {
    let field_crop_app_id = this.getSortedKeys()[index]
    let numRows = this.state.fieldCropAppSolidmanures[field_crop_app_id].length
    let headerSize = 50
    let itemSize = 145
    return headerSize + (numRows * itemSize)
  }

  setWindowListener() {
    window.addEventListener('resize', (ev) => {
      this.setState({ windowHeight: window.innerHeight, windowWidth: window.innerWidth })
    })
  }

  getStartPos() {

    let numAnalyses = parseInt(this.state.fieldCropAppSolidmanureAnalyses.length / 2)
    let headerSize = 0
    let analysisSectionSize = 32 + (48 * numAnalyses)
    return headerSize + analysisSectionSize
  }

  confirmDeleteAllFromTable(val) {
    this.setState({ toggleShowDeleteAllModal: val })
  }
  deleteAllFromTable() {
    Promise.all([
      post(`${this.props.BASE_URL}/api/field_crop_app_solidmanure/deleteAll`, { dairy_id: this.state.dairy_id }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy_id, tsvType: this.props.tsvType }),
    ])
      .then(res => {
        this.getFieldCropAppSolidmanureAnalysis()
        this.getFieldCropAppSolidmanure()
        this.confirmDeleteAllFromTable(false)
      })
      .catch(err => {
        console.log(err)
      })
  }
  toggleShowAnalyses() {
    this.setState({ showAnalyses: this.state.showAnalyses === 'none' ? 'flex' : this.state.showAnalyses === 'flex' ? 'none' : 'flex' })
  }
  render() {
    return (
      <Grid item xs={12} container >
        <Grid item container xs={12}>
          <Grid item xs={10} align="right">
            <Tooltip title='Upload TSV'>
              <IconButton color="primary" variant="outlined"
                onClick={() => this.toggleShowUploadFieldCropAppSolidmanureTSVModal(true)}
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
            <Tooltip title='Delete all Solid Manure'>
              <IconButton onClick={() => this.confirmDeleteAllFromTable(true)}>
                <DeleteSweepIcon color='error' />
              </IconButton>
            </Tooltip>
          </Grid>
          {/* <Grid item xs={1} align="right">
            <Tooltip title='Add solidmanure analysis'>
              <IconButton color="primary" variant="outlined"
                onClick={() => this.toggleShowAddSolidmanureAnalysisModal(true)}
              >
                <ShowChartIcon />
              </IconButton>

            </Tooltip>
          </Grid>
          <Grid item xs={1} align="right">
            <Tooltip title='Add solidmanure to application event'>
              <IconButton color="primary" variant="outlined"
                onClick={() => this.toggleShowAddSolidmanureModal(true)}
              >
                <SpeakerNotesIcon />
              </IconButton>

            </Tooltip>
          </Grid> */}

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

        <ActionCancelModal
          open={this.state.toggleShowDeleteAllModal}
          actionText="Delete all"
          cancelText="Cancel"
          modalText={`Delete All Solid Manure Application Events?`}
          onAction={this.deleteAllFromTable.bind(this)}
          onClose={() => this.confirmDeleteAllFromTable(false)}
        />
        <UploadTSVModal
          open={this.state.showUploadFieldCropAppSolidmanureTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Solidmanure TSV`}
          fileType="csv"
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppFreshwateTSV.bind(this)}
          onChange={this.onUploadFieldCropAppFreshwateTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppSolidmanureTSVModal(false)}
        />





        <Grid item xs={12}>
          {this.state.fieldCropAppSolidmanureAnalyses.length > 0 ?
            <React.Fragment>
              <Grid item xs={12} >
                <div style={{ display: 'flex' }}>
                  <Typography variant="h5" style={{ alignSelf: 'center' }} >Analyses</Typography>
                  <Tooltip title='Show' placement='top'>
                    <IconButton onClick={this.toggleShowAnalyses.bind(this)}>
                      <ExpandMoreIcon color='primary' />
                    </IconButton>
                  </Tooltip>
                </div>

              </Grid>
              <FixedPageSize container item xs={12} height='375px' style={{ display: this.state.showAnalyses }}>
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
              </FixedPageSize>
            </React.Fragment>
            :
            <React.Fragment></React.Fragment>

          }

        </Grid>


        <Grid item container xs={12}>
          {renderFieldButtons(this.state.fieldCropAppSolidmanures, this)}
          {renderCropButtons(this.state.fieldCropAppSolidmanures, this.state.viewFieldKey, this)}
          <CurrentFieldCrop
            viewFieldKey={this.state.viewFieldKey}
            viewPlantDateKey={this.state.viewPlantDateKey}
          />
          {this.getAppEventsByViewKeys().length > 0 ?
            <SolidmanureAppEvent
              solidmanures={this.getAppEventsByViewKeys()}
              onDelete={this.onConfirmSolidmanureDelete.bind(this)}
            />
            :
            <React.Fragment></React.Fragment>
          }
        </Grid>

        {/* <Grid item xs={12}>
          {this.getSortedKeys().length > 0 ?
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
          }
        </Grid> */}


        <ActionCancelModal
          open={this.state.showConfirmDeleteSolidmanureAnalysisModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Solidmanure Analysis for: 
            ${formatDate(splitDate(this.state.deleteSolidmanureAnalysisObj.sample_date))} - 
            ${this.state.deleteSolidmanureAnalysisObj.sample_desc}?
          `}

          onAction={this.onSolidmanureAnalysisDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteSolidmanureAnalysisModal(false)}
        />
        <ActionCancelModal
          open={this.state.showConfirmDeleteSolidmanureModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Solidmanure for: ${formatDate(splitDate(this.state.deleteSolidmanureObj.app_date))}?`}

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
