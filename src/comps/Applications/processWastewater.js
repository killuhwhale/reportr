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
import formats from "../../utils/format"
import { VariableSizeList as List } from "react-window";
import {
  DatePicker
} from '@material-ui/pickers';
import UploadTSVModal from "../Modals/uploadTSVModal"
import ViewTSVsModal from "../Modals/viewTSVsModal"

import AddProcessWastewaterModal from "../Modals/addProcessWastewaterModal"
import ActionCancelModal from "../Modals/actionCancelModal"
import { timePickerDefaultProps } from '@material-ui/pickers/constants/prop-types'
import { get, post } from '../../utils/requests'
import { WASTEWATER_MATERIAL_TYPES } from '../../utils/constants'
import { groupBySortBy } from "../../utils/format"
import {
  readTSV, processTSVText, createFieldSet, createFieldsFromTSV, createDataFromTSVListRow, uploadTSVToDB
} from "../../utils/TSV"



/** View for Process Wastewater Entry in DB */
const ProcessWastewaterAppEvent = (props) => {
  let process_wastewaters = props.process_wastewaters
  let { fieldtitle } = process_wastewaters[0]
  return (
    <Grid container item xs={12} style={{ marginBottom: "40px", marginTop: "15px", ...props.style }}>
      <Grid item xs={12}>
        <Typography variant="h4">
          {fieldtitle}
        </Typography>
      </Grid>

      {
        process_wastewaters.map((wastewater, i) => {
          let {
            app_desc, material_type, kn_con, nh4_con, nh3_con, no3_con, p_con, k_con, tds, ec, ph, totaln, totalp, totalk, amount_applied, app_date, croptitle, plant_date
          } = wastewater
          return (
            <Grid item container xs={12} key={`pwwviews${i}`} component={Paper} elevation={6} style={{ marginBottom: "30px" }}>
              <Grid item container xs={12}>
                <Grid item xs={6}>
                  <Typography variant="h6">
                    {croptitle}
                  </Typography>
                </Grid>
                <Grid item xs={6} align="right">
                  <DatePicker label="Plant Date"
                    value={plant_date}
                    open={false}
                  />
                </Grid>


                <Grid item container xs={12}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">
                      {app_desc} | Material Type: {material_type}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} align="right">
                    <DatePicker label="Date Applied"
                      value={app_date}
                      open={false}
                    />

                  </Grid>
                  <Grid item xs={12} align="right">
                    <TextField
                      label="Amount Applied"
                      value={`${amount_applied} gals`}
                    />
                  </Grid>

                </Grid>

              </Grid>

              <Grid item container xs={10}>

                <Grid item xs={3}>
                  <TextField disabled
                    label="Kjeldahl-nitrogen"
                    value={kn_con}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Ammonium-nitrogen"
                    value={nh4_con}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="NH3-N"
                    value={nh3_con}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Nitrate-nitrogen"
                    value={no3_con}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Total phosphorus"
                    value={p_con}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Total potassium "
                    value={k_con}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="TDS"
                    value={tds}
                  />
                </Grid>



                <Grid item xs={3}>
                  <TextField disabled
                    label="EC"
                    value={ec}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="N lbs/acre"
                    value={totaln}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="P lbs / acre"
                    value={totalp}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="K lbs / acre"
                    value={totalk}
                  />
                </Grid>
              </Grid>

              <Grid item container xs={2} justifyContent="center" alignItems="center">
                <Tooltip title="Delete Process wastewater">
                  <IconButton onClick={() => props.onDelete(wastewater)}>
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
class ProcessWastewater extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      fieldCropAppEvents: [],
      field_crop_app_process_wastewater: {}, // This should come from parent so it updates well, 
      tsvType: props.tsvType,
      numCols: props.numCols,
      showAddProcessWastewaterModal: false,
      showConfirmDeleteProcessWastewaterModal: false,
      showUploadFieldCropAppProcessWastewateTSVModal: false,
      deleteProcessWastewaterObj: {},
      tsvText: "",
      uploadedFilename: "",
      toggleShowDeleteAllModal: false,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      showViewTSVsModal: false,
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
    this.getFieldCropAppProcessWastewater()
    this.getFieldCropAppEvents()
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.dairy_id !== this.state.dairy_id || this.props.parentUpdated !== prevProps.parentUpdated) {
      this.getFieldCropAppEvents()
      this.getFieldCropAppProcessWastewater()
    }
  }

  getFieldCropAppProcessWastewater() {
    get(`${this.props.BASE_URL}/api/field_crop_app_process_wastewater/${this.state.dairy_id}`)
      .then(res => {
        let process_wastewater_by_fieldtitle = groupBySortBy(res, 'fieldtitle', 'app_date')
        this.setState({ field_crop_app_process_wastewater: process_wastewater_by_fieldtitle })
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
      post(`${this.props.BASE_URL}/api/field_crop_app_process_wastewater/delete`, { pk: this.state.deleteProcessWastewaterObj.pk })
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

  /** TSV: toggle, onChange, onUpload, View */
  toggleShowUploadFieldCropAppProcessWastewaterTSVModal(val) {
    this.setState({ showUploadFieldCropAppProcessWastewateTSVModal: val })
  }
  onUploadFieldCropAppProcessWastewaterTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      readTSV(files[0], (_ev) => {
        const { result } = _ev.target
        this.setState({ tsvText: result, uploadedFilename: files[0].name })
      })
    }
  }
  onUploadFieldCropAppProcessWastewaterTSV() {
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
            console.log("Completed uploading Process Wastewater TSV")
            uploadTSVToDB(this.state.uploadedFilename, this.state.tsvText, this.state.dairy_id, this.state.tsvType)
            this.toggleShowUploadFieldCropAppProcessWastewaterTSVModal(false)
            this.getFieldCropAppEvents()
            this.getFieldCropAppProcessWastewater()
            this.props.onAlert('Success!', 'success')
          })
          .catch(err => {
            console.log("Error with all promises")
            console.log(err)
            this.props.onAlert('Failed uploading', 'error')
          })
      })
      .catch(createFieldErr => {
        console.log(createFieldErr)
      })
  }
  toggleViewTSVsModal(val) {
    this.setState({ showViewTSVsModal: val })
  }

  getSortedKeys() {
    return Object.keys(this.state.field_crop_app_process_wastewater).sort()
  }

  renderItem({ index, style }) {
    let field_crop_app_id = this.getSortedKeys()[index]
    let process_wastewaters = this.state.field_crop_app_process_wastewater[field_crop_app_id]
    return (
      <ProcessWastewaterAppEvent key={`ppwwviewrow${index}`} style={style}
        process_wastewaters={process_wastewaters}
        onDelete={this.onConfirmProcessWastewaterDelete.bind(this)}
      />
    )
  }

  getItemSize(index) {
    let field_crop_app_id = this.getSortedKeys()[index]
    let numRows = this.state.field_crop_app_process_wastewater[field_crop_app_id].length
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

        {this.getSortedKeys().length > 0 ?
          <List
            height={Math.max(this.state.windowHeight - 390, 100)}
            itemCount={this.getSortedKeys().length}
            itemSize={this.getItemSize.bind(this)}
            width={this.state.windowWidth * (.82)}
          >
            {this.renderItem.bind(this)}
          </List>
          :
          <React.Fragment></React.Fragment>
        }

        <ActionCancelModal
          open={this.state.showConfirmDeleteProcessWastewaterModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Process Wastewater for ${this.state.deleteProcessWastewaterObj.fieldtitle} - ${this.state.deleteProcessWastewaterObj.app_date}?`}

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
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppProcessWastewaterTSV.bind(this)}
          onChange={this.onUploadFieldCropAppProcessWastewaterTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppProcessWastewaterTSVModal(false)}
        />
      </Grid>
    )
  }
}

export default ProcessWastewater = withRouter(withTheme(ProcessWastewater))
