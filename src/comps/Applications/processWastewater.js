import React, { Component } from 'react'
import {
  Grid, Typography, IconButton, Tooltip,
  Card, CardContent, CardActions
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import { CloudUpload } from '@material-ui/icons'
import WbCloudyIcon from '@material-ui/icons/WbCloudy' // viewTSV
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import { formatDate, formatFloat, naturalSort, naturalSortBy, nestedGroupBy, splitDate } from "../../utils/format"

import UploadTSVModal from "../Modals/uploadTSVModal"
import ViewTSVsModal from "../Modals/viewTSVsModal"

import AddProcessWastewaterModal from "../Modals/addProcessWastewaterModal"
import ActionCancelModal from "../Modals/actionCancelModal"
import { get, post } from '../../utils/requests'
import { WASTEWATER_MATERIAL_TYPES } from '../../utils/constants'
import { renderFieldButtons, renderCropButtons, CurrentFieldCrop } from './selectButtonGrid'
import { TSVUtil } from "../../utils/TSV"
import { FixedPageSize } from '../utils/FixedPageSize'


const WastewaterAnalysis = withTheme((props) => {
  const { kn_con, nh4_con, p_con, k_con, ec, tds, ph } = props.analysis
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
                {` ${props.analysis.sample_desc}, ${props.analysis.sample_data_src}`}
              </span>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='caption'>

              N: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(kn_con)} `}
              </span>
              NH4: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(nh4_con)} `}
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
              TDS: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(tds)} `}
              </span>
              EC: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(ec)} `}
              </span>
              pH: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(ph)} `}
              </span>

            </Typography>
          </Grid>
          <Grid item xs={12}>
            {/* <Typography variant='caption'>
              {`Amount ${formatFloat(amount_applied)}`}
            </Typography> */}
          </Grid>
        </CardContent>
        <CardActions>
          <Grid item xs={2}>
            <Tooltip title="Delete Wastewater Analysis">
              <IconButton className='showOnHover' size='small'
                onClick={() => props.onConfirmWastewaterAnalysisDelete(props.analysis)}
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

const ProcessWastewaterAppEventCard = withTheme((props) => {
  let {
    app_method, kn_con, p_con, k_con, tds, ec, ph,
    amount_applied, app_date, croptitle
  } = props.wastewater
  return (
    <Grid item xs={12} md={4} lg={3}>
      <Card variant="outlined" key={`pwwaer${props.index}`} className='showOnHoverParent'>
        <CardContent>

          <Grid item xs={12} align='right'>
            <Typography variant='caption'>
              <Tooltip title='Application date' placement="top">
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
            <Typography variant='caption'>
              N: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(kn_con)} `}
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
              TDS: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(tds)} `}
              </span>
              EC: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(ec)} `}
              </span>
              pH: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(ph)} `}
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
          <Tooltip title="Delete Process wastewater">
            <IconButton className='showOnHover'
              onClick={() => props.onDelete(props.wastewater)}
            >
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Grid>
  )
})

/** View for Process Wastewater Entry in DB */
const ProcessWastewaterAppEvent = (props) => {
  let process_wastewaters = props.process_wastewaters
  return (
    // <Grid container item xs={12} key='pwae' style={{ marginBottom: "40px", marginTop: "15px", ...props.style }}>
    <FixedPageSize container item xs={12} key='pwae' height='375px' style={{ marginBottom: "40px", marginTop: "15px", ...props.style }}>
      {
        process_wastewaters.sort((a, b) => naturalSortBy(a, b, 'app_date')).map((wastewater, i) => {
          return (
            <ProcessWastewaterAppEventCard
              wastewater={wastewater}
              onDelete={props.onDelete}
              index={i}
              key={`pwap_${i}`}
            />
          )
        })
      }
    </FixedPageSize>
  )
}

/** Component handles showing Process Wastewater Application events.
 *  - Process Waste Water List view
 *  - Upload TSV
 *  - Add Process Wastewater
 *  - Delete Process Wastewater
 * 
 */
class ProcessWastewater extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      fieldCropAppEvents: [],
      fieldCropAppWastewaterAnalyses: [],
      field_crop_app_process_wastewater: {}, // This should come from parent so it updates well, 
      tsvType: props.tsvType,
      numCols: props.numCols,
      showAddProcessWastewaterModal: false,
      showConfirmDeleteProcessWastewaterModal: false,
      showConfirmDeleteWastewaterAnalysisModal: false,
      showUploadFieldCropAppProcessWastewateTSVModal: false,
      showAnalyses: 'none',
      deleteProcessWastewaterObj: {},
      deleteAnalysis: {},
      tsvFile: "",
      uploadedFilename: "",
      toggleShowDeleteAllModal: false,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      showViewTSVsModal: false,
      viewFieldKey: '',
      viewPlantDateKey: '',
      createProcessWastewaterObj: {
        dairy_id: 0,
        app_event_idx: 0,
        material_type_idx: 0,
        material_type: '',
        source_desc: '',
        amount_applied: '',
        n_con: '',
        ammoniumN: '',
        unionizedAmmoniumN: '',
        nitrateN: '',
        p_con: '',
        k_con: '',
        tds: '',
        ec: '0',
        totalN: '',
        totalP: '',
        totalK: '',

      },
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }
  componentDidMount() {
    this.setWindowListener()
    this.getFieldCropAppWastewaterAnalysis()
    this.getFieldCropAppProcessWastewater()
    this.getFieldCropAppEvents()
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.dairy_id !== this.state.dairy_id || this.props.parentUpdated !== prevProps.parentUpdated) {
      this.getFieldCropAppEvents()
      this.getFieldCropAppWastewaterAnalysis()
      this.getFieldCropAppProcessWastewater()
    }
  }

  getFieldCropAppProcessWastewater() {
    get(`${this.props.BASE_URL}/api/field_crop_app_process_wastewater/${this.state.dairy_id}`)
      .then(res => {
        let wastewaterByFieldtitle = nestedGroupBy(res, ['fieldtitle', 'plant_date'])
        const keys = Object.keys(wastewaterByFieldtitle).sort(naturalSort)
        if (keys.length > 0) {
          this.setState({ field_crop_app_process_wastewater: wastewaterByFieldtitle, viewFieldKey: keys[0] })
        } else {
          this.setState({ field_crop_app_process_wastewater: {}, viewFieldKey: '' })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  getFieldCropAppWastewaterAnalysis() {
    get(`${this.props.BASE_URL}/api/field_crop_app_process_wastewater_analysis/${this.state.dairy_id}`)
      .then(res => {
        this.setState({ fieldCropAppWastewaterAnalyses: res })
      })
      .catch(err => {
        console.log(err)
      })
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

  /** Manually add Process Wastewater */
  toggleShowAddProcessWastewaterModal(val) {
    this.setState({ showAddProcessWastewaterModal: val })
  }
  onCreateProcessWastewaterChange(ev) {
    const { name, value } = ev.target
    let createProcessWastewaterObj = this.state.createProcessWastewaterObj
    createProcessWastewaterObj[name] = value
    this.setState({ createProcessWastewaterObj: createProcessWastewaterObj })
  }
  createProcessWastewater() {
    let createObj = this.state.createProcessWastewaterObj

    createObj.dairy_id = this.state.dairy_id

    createObj.field_crop_app_id = this.state.fieldCropAppEvents[createObj.app_event_idx].pk
    createObj.material_type = WASTEWATER_MATERIAL_TYPES[createObj.material_type_idx]



    createObj.n_con = parseFloat(createObj.n_con.replaceAll(',', ''))
    createObj.unionizedAmmoniumN = parseFloat(createObj.unionizedAmmoniumN.replaceAll(',', ''))
    createObj.ammoniumN = parseFloat(createObj.ammoniumN.replaceAll(',', ''))
    createObj.nitrateN = parseFloat(createObj.nitrateN.replaceAll(',', ''))
    createObj.p_con = parseFloat(createObj.p_con.replaceAll(',', ''))
    createObj.k_con = parseFloat(createObj.k_con.replaceAll(',', ''))
    createObj.tds = parseFloat(createObj.tds.replaceAll(',', ''))
    createObj.amount_applied = parseInt(createObj.amount_applied.replaceAll(',', ''))
    createObj.totalN = parseFloat(createObj.totalN.replaceAll(',', ''))
    createObj.totalP = parseFloat(createObj.totalP.replaceAll(',', ''))
    createObj.totalK = parseFloat(createObj.totalK.replaceAll(',', ''))

    console.log("creating process wasterwater event: ", createObj)
    // NEEd to Data a DB table for this now and the wires in the two index.js files....
    post(`${this.props.BASE_URL}/api/field_crop_app_process_wastewater/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddProcessWastewaterModal(false)
        this.getFieldCropAppProcessWastewater()
      })
      .catch(err => {
        console.log(err)
      })
  }
  /** Delete Process Wastewater entry */
  toggleShowConfirmDeleteProcessWastewaterModal(val) {
    this.setState({ showConfirmDeleteProcessWastewaterModal: val })
  }
  onConfirmProcessWastewaterDelete(delProcessWaswaterObj) {
    this.setState({ showConfirmDeleteProcessWastewaterModal: true, deleteProcessWastewaterObj: delProcessWaswaterObj })
  }
  onProcessWastewaterDelete() {
    if (Object.keys(this.state.deleteProcessWastewaterObj).length > 0) {
      post(`${this.props.BASE_URL}/api/field_crop_app_process_wastewater/delete`, {
        pk: this.state.deleteProcessWastewaterObj.pk,
        dairy_id: this.state.dairy_id
      })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteProcessWastewaterModal(false)
          this.getFieldCropAppProcessWastewater()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  onConfirmWastewaterAnalysisDelete(analysis) {
    this.setState({ deleteAnalysis: analysis, showConfirmDeleteWastewaterAnalysisModal: true })
  }

  toggleShowConfirmDeleteWastewaterAnalysisModal(val) {
    this.setState({ showConfirmDeleteWastewaterAnalysisModal: val })
  }

  deleteWatewaterAnalysis() {
    console.log("Deleting analysis: ", this.state.deleteAnalysis)
  }

  /** TSV: toggle, onChange, onUpload, View */
  toggleShowUploadFieldCropAppProcessWastewaterTSVModal(val) {
    this.setState({
      showUploadFieldCropAppProcessWastewateTSVModal: val,
      tsvFile: "",
      uploadedFilename: ""
    })
  }
  onUploadFieldCropAppProcessWastewaterTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      this.setState({ tsvFile: files[0], uploadedFilename: files[0].name })
    }
  }

  async onUploadFieldCropAppProcessWastewaterTSV() {
    // 24 columns from TSV
    let dairy_id = this.state.dairy_id

    try {
      const result = await TSVUtil.uploadTSV(this.state.tsvFile, this.state.tsvType, this.state.uploadedFilename, dairy_id)
      console.log("Upload TSV result: ", this.state.tsvType, result)
      this.toggleShowUploadFieldCropAppProcessWastewaterTSVModal(false)
      this.getFieldCropAppEvents()
      this.getFieldCropAppProcessWastewater()
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

  getAppEventsByViewKeys() {
    // Returns a list of objects for the selected viewFieldKey && viewPlantDateKey
    if (this.state.viewFieldKey && this.state.viewPlantDateKey && this.state.field_crop_app_process_wastewater[this.state.viewFieldKey] &&
      this.state.field_crop_app_process_wastewater[this.state.viewFieldKey][this.state.viewPlantDateKey]) {
      return this.state.field_crop_app_process_wastewater[this.state.viewFieldKey][this.state.viewPlantDateKey]
    }
    return []
  }

  renderItem({ index, style }) {
    let events = this.getAppEventsByViewKeys()
    return (
      <ProcessWastewaterAppEvent key={`ppwwviewrow${index}`} style={style}
        process_wastewaters={events}
        onDelete={this.onConfirmProcessWastewaterDelete.bind(this)}
      />
    )
  }

  getItemSize(index) {
    let numRows = this.getAppEventsByViewKeys().length

    // let numRows = this.state.field_crop_app_process_wastewater[this.state.viewFieldKey][field_crop_app_id].length
    let headerSize = 55
    let itemSize = 350

    return headerSize + (itemSize * numRows)
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
      post(`${this.props.BASE_URL}/api/field_crop_app_process_wastewater/deleteAll`, { dairy_id: this.state.dairy_id }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy_id, tsvType: this.props.tsvType }),
    ])
      .then(res => {
        this.getFieldCropAppProcessWastewater()
        this.getFieldCropAppEvents()
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
        <Grid item xs={10} align="right">
          <Tooltip title='Upload TSV'>
            <IconButton color="primary" variant="outlined"
              onClick={() => this.toggleShowUploadFieldCropAppProcessWastewaterTSVModal(true)}
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
          <Tooltip title='Delete all Process Wastewater'>
            <IconButton onClick={() => this.confirmDeleteAllFromTable(true)}>
              <DeleteSweepIcon color='error' />
            </IconButton>
          </Tooltip>
        </Grid>

        {/* <Grid item xs={1} align='right'>
          <Tooltip title='Add process wastewater to application event'>
            <IconButton color="primary" variant="outlined"
              onClick={() => this.toggleShowAddProcessWastewaterModal(true)}
            >
              <SpeakerNotesIcon />
            </IconButton>
          </Tooltip>
        </Grid> */}

        <Grid item xs={12} style={{ marginTop: '16px' }} >
          {this.state.fieldCropAppWastewaterAnalyses.length > 0 ?
            <Grid item container xs={12}>

              <Grid item xs={12} >
                <div style={{ display: 'flex' }}>
                  <Typography variant="h5" style={{ alignSelf: 'center' }} >Analyses</Typography>
                  <Tooltip title='Show'>
                    <IconButton onClick={this.toggleShowAnalyses.bind(this)}>
                      <ExpandMoreIcon color='primary' />
                    </IconButton>
                  </Tooltip>
                </div>

              </Grid>
              <FixedPageSize container item xs={12} height='375px' style={{ display: this.state.showAnalyses }}>
                {
                  this.state.fieldCropAppWastewaterAnalyses.map((analysis, i) => {
                    return (
                      <WastewaterAnalysis key={`fcawwaview${i}`}
                        analysis={analysis}
                        onConfirmWastewaterAnalysisDelete={this.onConfirmWastewaterAnalysisDelete.bind(this)}
                      />
                    )
                  })
                }
              </FixedPageSize>
            </Grid>
            :
            <React.Fragment></React.Fragment>

          }

        </Grid>


        <Grid item container xs={12}>
          {renderFieldButtons(this.state.field_crop_app_process_wastewater, this)}
          {renderCropButtons(this.state.field_crop_app_process_wastewater, this.state.viewFieldKey, this)}
          <CurrentFieldCrop
            viewFieldKey={this.state.viewFieldKey}
            viewPlantDateKey={this.state.viewPlantDateKey}
          />
          <FixedPageSize container item xs={12} height='375px' >
            {this.getAppEventsByViewKeys().length > 0 ?
              <ProcessWastewaterAppEvent
                process_wastewaters={this.getAppEventsByViewKeys()}
                onDelete={this.onConfirmProcessWastewaterDelete.bind(this)}
              />
              :
              <React.Fragment></React.Fragment>
            }
          </FixedPageSize>
        </Grid>

        {/* This needs to be adapted to showing each app events within the view
        Previously, this would render all events across all fields and plant dates.
        Now the user selects the specific field/ plant date combo to view, thus we need to adapted
        the list renderer to the user chosen view.

        { 
          this.getAppEventsByViewKeys().length > 0 ?
            <List
              height={Math.max(this.state.windowHeight - 390, 100)}
              itemCount={this.getAppEventsByViewKeys().length > 0 ? 1 : 0}
              itemSize={this.getItemSize.bind(this)}
              width={this.state.windowWidth * (.82)}
            >
              {this.renderItem.bind(this)}
            </List>
            :
            <React.Fragment></React.Fragment>
        } */}




        <ActionCancelModal
          open={this.state.showConfirmDeleteProcessWastewaterModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Process Wastewater for 
            ${this.state.deleteProcessWastewaterObj.fieldtitle} - 
            ${formatDate(splitDate(this.state.deleteProcessWastewaterObj.app_date))}?
          `}

          onAction={this.onProcessWastewaterDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteProcessWastewaterModal(false)}
        />

        <ActionCancelModal
          open={this.state.toggleShowDeleteAllModal}
          actionText="Delete all"
          cancelText="Cancel"
          modalText={`Delete All Process Wastewater Application Events?`}
          onAction={this.deleteAllFromTable.bind(this)}
          onClose={() => this.confirmDeleteAllFromTable(false)}
        />
        <ActionCancelModal
          open={this.state.showConfirmDeleteWastewaterAnalysisModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Process Wastewater Analysis?`}
          onAction={this.deleteWatewaterAnalysis.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteWastewaterAnalysisModal(false)}
        />
        <AddProcessWastewaterModal
          open={this.state.showAddProcessWastewaterModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add process waste water application to applciation event`}
          fieldCropAppEvents={this.state.fieldCropAppEvents}

          createProcessWastewaterObj={this.state.createProcessWastewaterObj}
          materialTypes={WASTEWATER_MATERIAL_TYPES}

          onAction={this.createProcessWastewater.bind(this)}
          onChange={this.onCreateProcessWastewaterChange.bind(this)}
          onClose={() => this.toggleShowAddProcessWastewaterModal(false)}
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
          open={this.state.showUploadFieldCropAppProcessWastewateTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Process Wastewater TSV`}
          fileType="csv"
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppProcessWastewaterTSV.bind(this)}
          onChange={this.onUploadFieldCropAppProcessWastewaterTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppProcessWastewaterTSVModal(false)}
        />
      </Grid >
    )
  }
}

export default ProcessWastewater = withRouter(withTheme(ProcessWastewater))
