import React, { Component } from 'react'
import {
  Grid, Typography, IconButton, Tooltip, TextField,
  Card, CardContent, CardActions
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'

import WbCloudyIcon from '@material-ui/icons/WbCloudy' // viewTSV
import { CloudUpload } from '@material-ui/icons' // uploadTSV
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'

// import { VariableSizeList as List } from "react-window"
import { formatDate, formatFloat, naturalSort, naturalSortBy, nestedGroupBy, splitDate } from "../../utils/format"
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
import { renderFieldButtons, renderCropButtons, CurrentFieldCrop } from './selectButtonGrid'

import { TSVUtil } from "../../utils/TSV"
import { FixedPageSize } from '../utils/FixedPageSize'


const SOURCE_OF_ANALYSES = [
  'Lab Analysis',
  'Other/ Estimated',
]

/** View for Process Wastewater Entry in DB */
const FreshwaterAppEvent = (props) => {
  return (

    <Grid container item xs={12} style={props.style}>
      {
        props.freshwaters.sort((a, b) => naturalSortBy(a, b, 'app_date')).map((freshwater, i) => {
          return (
            <FreshwaterAppEventCard
              freshwater={freshwater}
              index={i}
              onDelete={props.onDelete}
              key={`fwap_${i}`}
            />
          )

        })
      }
    </Grid>
  )
}

const FreshwaterAppEventCard = withTheme((props) => {
  const { app_method, croptitle, plant_date, src_desc, src_type, app_date, n_con, amount_applied, ec, tds } = props.freshwater
  return (
    <Grid item xs={12} md={4} lg={3}>
      <Card variant="outlined" key={`pwwaer${props.index}`} className='showOnHoverParent' >
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
                {` ${croptitle}, ${app_method}`}
              </span>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='caption'>

              N: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(n_con)} `}
              </span>
              EC: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(ec)} `}
              </span>
              TDS: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(tds)} `}
              </span>




            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='caption'>
              Amount: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(amount_applied)} `}
              </span>
            </Typography>
          </Grid>
        </CardContent>
        <CardActions>
          <Grid item xs={2}>
            <Tooltip title="Delete Freshwater">
              <IconButton className='showOnHover' size='small'
                onClick={() => props.onDelete(props.freshwater)}
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

const FreshwaterSource = withTheme((props) => {
  return (
    <Grid item xs={12} md={4} lg={3}>
      <Card variant="outlined" key={`pwwaer${props.index}`} className='showOnHoverParent'>
        <CardContent>

          <Grid item container alignContent='center' alignItems='center' justifyContent='center' xs={12}>
            <Grid item xs={10}>
              <Grid item xs={12}>
                <Typography variant='subtitle2' >
                  <span style={{ color: props.theme.palette.primary.main }}>
                    {` ${props.source.src_desc}`}
                  </span>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1' >
                  <span style={{ color: props.theme.palette.primary.main }}>
                    {`${props.source.src_type}`}
                  </span>
                </Typography>
              </Grid>
            </Grid>

            <Grid item xs={2} align='center'>
              <Grid item xs={2}>
                <Tooltip title="Delete Freshwater Source">
                  <IconButton className='showOnHover' size='small'
                    onClick={() => props.onConfirmFreshwaterSourceDelete(props.source)}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>

        </CardContent>
      </Card>
    </Grid>

  )

})

const FreshwaterAnalysis = withTheme((props) => {
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
                {` ${props.analysis.src_desc}, ${props.analysis.sample_desc}`}
              </span>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle1' >
              <span style={{ color: props.theme.palette.secondary.main }}>
                {` ${props.analysis.src_type}, ${props.analysis.src_of_analysis}`}
              </span>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='caption'>

              N: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(props.analysis.n_con)} `}
              </span>
              EC: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(props.analysis.ec)} `}
              </span>
              TDS: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(props.analysis.tds)} `}
              </span>

            </Typography>
          </Grid>
        </CardContent>
        <CardActions>
          <Grid item xs={2}>
            <Tooltip title="Delete Wastewater Analysis">
              <IconButton className='showOnHover' size='small'
                onClick={() => props.onConfirmFreshwaterAnalysisDelete(props.analysis)}
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


/** Component handles showing Process Wastewater Application events.
 *  - Process Waste Water List view
 *  - Upload TSV
 *  - Add Process Wastewater
 *  - Delete Process Wastewater
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
      showSources: 'none',
      showAnalyses: 'none',
      deleteFreshwaterSourceObj: {},
      deleteFreshwaterAnalysisObj: {},
      deleteFreshwaterObj: {},
      showUploadFieldCropAppFreshwateTSVModal: false,
      tsvFile: '',
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
      post(`${this.props.BASE_URL}/api/field_crop_app_freshwater/delete`, {
        pk: this.state.deleteFreshwaterObj.pk,
        dairy_id: this.state.dairy_id
      }
      )
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
      post(`${this.props.BASE_URL}/api/field_crop_app_freshwater_source/delete`, {
        pk: this.state.deleteFreshwaterSourceObj.pk,
        dairy_id: this.state.dairy_id
      }
      )
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
      post(`${this.props.BASE_URL}/api/field_crop_app_freshwater_analysis/delete`, {
        pk: this.state.deleteFreshwaterAnalysisObj.pk,
        dairy_id: this.state.dairy_id
      }
      )
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
      this.toggleShowUploadFieldCropAppFreshwateTSVModal(false)
      this.getFieldCropAppFreshwater()
      this.props.onAlert('Uploaded!', 'success')
    } catch (e) {
      console.log("Error with all promises")
      console.log(e)
      this.props.onAlert('Failed uploading!', 'error')
    }


    // uploadNutrientApp(this.state.tsvFile, this.state.tsvType, dairy_pk)
    //   .then(res => {
    //     console.log("Completed uploading Freshwater TSV")
    //     // uploadTSVToDB(this.state.uploadedFilename, this.state.tsvFile, this.state.dairy_id, this.state.tsvType)
    //     uploadTSVToDB(this.state.uploadedFilename, this.state.tsvFile, this.state.dairy_id, this.state.tsvType)
    //     this.toggleShowUploadFieldCropAppFreshwateTSVModal(false)
    //     this.getFieldCropAppFreshwater()
    //     this.props.onAlert('Success!', 'success')
    //   })
    //   .catch(err => {
    //     console.log("Error with all promises")
    //     console.log(err)
    //     this.props.onAlert('Failed uploading.', 'error')
    //   })
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

  toggleShowAnalyses() {
    this.setState({ showAnalyses: this.state.showAnalyses === 'none' ? 'flex' : this.state.showAnalyses === 'flex' ? 'none' : 'flex' })
  }
  toggleShowSources() {
    this.setState({ showSources: this.state.showSources === 'none' ? 'flex' : this.state.showSources === 'flex' ? 'none' : 'flex' })
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
          fileType="csv"
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

              <Grid item xs={12} >
                <div style={{ display: 'flex' }}>
                  <Typography variant="h5" style={{ alignSelf: 'center' }} >
                    Sources
                  </Typography>
                  <Tooltip title='Show'>
                    <IconButton onClick={this.toggleShowSources.bind(this)}>
                      <ExpandMoreIcon color='primary' />
                    </IconButton>
                  </Tooltip>
                </div>
              </Grid>

              <FixedPageSize container item xs={12} height='375px' style={{ display: this.state.showSources }}>
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
              </FixedPageSize>

            </React.Fragment>
            :
            <React.Fragment></React.Fragment>

          }

        </Grid>

        <Grid item xs={12} style={{ marginTop: '16px' }}>
          {this.state.fieldCropAppFreshwaterAnalyses.length > 0 ?
            <React.Fragment>
              <Grid item xs={12} >
                <div style={{ display: 'flex' }}>
                  <Typography variant="h5" style={{ alignSelf: 'center' }} >
                    Analyses
                  </Typography>
                  <Tooltip title='Show'>
                    <IconButton onClick={this.toggleShowAnalyses.bind(this)}>
                      <ExpandMoreIcon color='primary' />
                    </IconButton>
                  </Tooltip>
                </div>

              </Grid>
              <FixedPageSize container item xs={12} height='375px' style={{ display: this.state.showAnalyses }}>
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
              </FixedPageSize>
            </React.Fragment>
            :
            <React.Fragment></React.Fragment>

          }

        </Grid>

        <Grid item xs={12} style={{ marginTop: '16px' }}>

          <Grid item container xs={12}>
            {renderFieldButtons(this.state.fieldCropAppFreshwaters, this)}
            {renderCropButtons(this.state.fieldCropAppFreshwaters, this.state.viewFieldKey, this)}
            <CurrentFieldCrop
              viewFieldKey={this.state.viewFieldKey}
              viewPlantDateKey={this.state.viewPlantDateKey}
            />
            <FixedPageSize container item xs={12} height='375px' >
              {this.getAppEventsByViewKeys().length > 0 ?
                <FreshwaterAppEvent
                  freshwaters={this.getAppEventsByViewKeys()}
                  onDelete={this.onConfirmFreshwaterDelete.bind(this)}
                />
                :
                <React.Fragment></React.Fragment>
              }
            </FixedPageSize>
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
          modalText={`Delete Freshwater Source: ${this.state.deleteFreshwaterSourceObj.src_desc} - ${this.state.deleteFreshwaterSourceObj.src_type}?`}

          onAction={this.onFreshwaterSourceDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteFreshwaterSourceModal(false)}
        />
        <ActionCancelModal
          open={this.state.showConfirmDeleteFreshwaterAnalysisModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Freshwater for: 
            ${formatDate(splitDate(this.state.deleteFreshwaterAnalysisObj.sample_date))} - 
            ${this.state.deleteFreshwaterAnalysisObj.sample_desc}?
          `}

          onAction={this.onFreshwaterAnalysisDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteFreshwaterAnalysisModal(false)}
        />
        <ActionCancelModal
          open={this.state.showConfirmDeleteFreshwaterModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Freshwater for ${formatDate(splitDate(this.state.deleteFreshwaterObj.app_date))}?`}

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
