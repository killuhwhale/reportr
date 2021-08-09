import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import formats from "../../utils/format"

import UploadFieldCropAppProcessWastewateTSVModal from "../Modals/uploadFieldCropAppProcessWastewaterTSVModal"

import AddProcessWastewaterModal from "../Modals/addProcessWastewaterModal"
import ActionCancelModal from "../Modals/actionCancelModal"
import { timePickerDefaultProps } from '@material-ui/pickers/constants/prop-types'
import { get, post } from '../../utils/requests'

import { lazyGet, readTSV, processTSVText, createFieldSet, createFieldsFromTSV, createDataFromTSVListRow } from "../../utils/TSV"

const BASE_URL = "http://localhost:3001"
const MATERIAL_TYPES = [
  '',
  'Process wastewater',
  'Process wastewater sludge',
]

const _numCols = 24 // number of columns in each data row, needs to be the first set of columns.


const ProcessWastewaterAppEvent = (props) => {
  let process_wastewaters = props.process_wastewaters
  let { fieldtitle } = process_wastewaters[0]
  return (
    <Grid container item xs={12} style={{marginBottom: "40px", marginTop: "15px"}}>
      <Grid item xs={12}>
        <Typography variant="h3">
          {fieldtitle}
        </Typography>
        <hr />
      </Grid>

      {
        process_wastewaters.map((wastewater, i) => {
          let {
            source_desc, material_type, n_con, p_con, k_con, tds, ec, ammoniumn, unionizedammoniumn, nitraten,
            totaln, totalp, totalk, amount_applied, app_date, croptitle, plant_date
          } = wastewater
          return (
            <Grid item container xs={12} key={`pwwviews${i}`} component={Paper} elevation={6} style={{ marginBottom: "30px" }}>
              <Grid item container xs={12}>
                <Grid item xs={6}>
                  <Typography  variant="subtitle1">
                    {croptitle}
                  </Typography>
                </Grid>
                <Grid item xs={6} align="right">
                  <Typography variant="subtitle1">
                    Planted: {plant_date.split('T')[0]}
                  </Typography>
                </Grid>


                <Grid item container xs={12}>
                  <Grid xs={6}>
                    <Typography variant="subtitle2">
                      {source_desc} | Material Type: {material_type}
                    </Typography>
                  </Grid>

                  <Grid xs={6} align="right">
                    <Typography variant="subtitle2">
                      Date Applied: {app_date.split('T')[0]}
                    </Typography>
                  </Grid>
                  <Grid xs={12} align="right">
                    <Typography variant="subtitle2">
                      Amount Applied: {amount_applied} gals
                    </Typography>
                  </Grid>

                </Grid>

              </Grid>

              <Grid item container xs={10}>

                <Grid item xs={3}>
                  <TextField disabled
                    label="Kjeldahl- nitrogen"
                    value={n_con}
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
                    label="Total dissolved solids"
                    value={tds}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Ammonium-nitrogen"
                    value={ammoniumn}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Un-ionized ammonia-nitrogen"
                    value={unionizedammoniumn}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Nitrate-nitrogen"
                    value={nitraten}
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

class ProcessWastewater extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      fieldCropAppEvents: props.fieldCropAppEvents,
      showAddProcessWastewaterModal: false,
      field_crop_app_process_wastewater: [],
      showConfirmDeleteProcessWastewaterModal: false,
      showUploadFieldCropAppProcessWastewateTSVModal: false,
      deleteProcessWastewaterObj: {},
      tsvText: "",
      uploadedFilename: "",
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
    this.getFieldCropAppProcessWastewater()
  }

  getFieldCropAppProcessWastewater() {
    get(`${BASE_URL}/api/field_crop_app_process_wastewater/${this.state.dairy_id}`)
      .then(res => {
        // list of process, sort by app event
        // Group by field, sort by application date.

        let process_wastewater_by_fieldtitle = {}
        res.forEach(wastewater => {
          let key = `${wastewater.fieldtitle}`
          if (process_wastewater_by_fieldtitle[key]) {
            process_wastewater_by_fieldtitle[key].push(wastewater)
          } else {
            process_wastewater_by_fieldtitle[key] = [wastewater]
          }
        })
        // Sort each list in each key by Fieldtitle

        Object.keys(process_wastewater_by_fieldtitle).forEach(key => {
          process_wastewater_by_fieldtitle[key].sort((a, b) => {
            return a.app_date > b.app_date ? 1 : -1
          })
        })


        this.setState({ field_crop_app_process_wastewater: process_wastewater_by_fieldtitle })
      })
      .catch(err => {
        console.log(err)
      })
  }
  onChange(ev) {
    const { name, value } = ev.target
    this.props.onChange(name, value)
  }
  toggleShowAddProcessWastewaterModal(val) {
    this.setState({ showAddProcessWastewaterModal: val })
  }

  createProcessWastewater() {
    let createObj = this.state.createProcessWastewaterObj


    createObj.dairy_id = this.state.dairy_id

    createObj.field_crop_app_id = this.state.fieldCropAppEvents[createObj.app_event_idx].pk
    createObj.material_type = MATERIAL_TYPES[createObj.material_type_idx]



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
    post(`${BASE_URL}/api/field_crop_app_process_wastewater/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddProcessWastewaterModal(false)
        this.getFieldCropAppProcessWastewater()
      })
      .catch(err => {
        console.log(err)
      })
  }

  onCreateProcessWastewaterChange(ev) {
    const { name, value } = ev.target
    let createProcessWastewaterObj = this.state.createProcessWastewaterObj
    createProcessWastewaterObj[name] = value
    this.setState({ createProcessWastewaterObj: createProcessWastewaterObj })
  }
  onConfirmProcessWastewaterDelete(delProcessWaswaterObj) {
    this.setState({ showConfirmDeleteProcessWastewaterModal: true, deleteProcessWastewaterObj: delProcessWaswaterObj })
  }
  toggleShowConfirmDeleteProcessWastewaterModal(val) {
    this.setState({ showConfirmDeleteProcessWastewaterModal: val })
  }
  onProcessWastewaterDelete() {
    if (Object.keys(this.state.deleteProcessWastewaterObj).length > 0) {
      post(`${BASE_URL}/api/field_crop_app_process_wastewater/delete`, { pk: this.state.deleteProcessWastewaterObj.pk })
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



  onUploadFieldCropAppProcessWastewateTSV() {
    // 24 columns from TSV

    let dairy_pk = this.state.dairy_id
    let rows = processTSVText(this.state.tsvText, _numCols) // extract rows from Text of tsv file TODO()

    // Create a set of fields to ensure duplicates are not attempted.
    let fields = createFieldSet(rows)


    createFieldsFromTSV(fields, dairy_pk)      // Create fields before proceeding
      .then(createFieldRes => {
        let result_promises = rows.map((row, i) => {
          return createDataFromTSVListRow(row, i, dairy_pk, 'field_crop_app_process_wastewater')    // Create entries for ea row in TSV file
        })

        Promise.all(result_promises)            // Execute promises to create field_crop && field_crop_harvet entries in the DB
          .then(res => {
            console.log("Completed Results")
            // this.uploadTSVToDB() TODO()implement this function // remove this when done testing, do this after the data was successfully create in DB
            this.getFieldCropAppProcessWastewater()
            this.toggleShowUploadFieldCropAppProcessWastewateTSVModal(false)

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
  onUploadFieldCropAppProcessWastewateTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      readTSV(files[0], (_ev) => {
        const { result } = _ev.target
        this.setState({ tsvText: result, uploadedFilename: files[0].name })
      })
    }
  }
  toggleShowUploadFieldCropAppProcessWastewateTSVModal(val) {
    this.setState({ showUploadFieldCropAppProcessWastewateTSVModal: val })
  }


  render() {
    const process_wastewater_keys = Object.keys(this.state.field_crop_app_process_wastewater)
    process_wastewater_keys.sort((a, b) => a.fieldtitle > b.fieldtitle ? -1 : 1)
    return (
      <Grid item xs={12} container >
        <Grid item xs={12} align="right">
          <Button color="secondary" variant="outlined"
            onClick={() => this.toggleShowUploadFieldCropAppProcessWastewateTSVModal(true)}
          >
            Upload TSV
          </Button>
        </Grid>


        <UploadFieldCropAppProcessWastewateTSVModal
          open={this.state.showUploadFieldCropAppProcessWastewateTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Process Wastewater TSV`}
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppProcessWastewateTSV.bind(this)}
          onChange={this.onUploadFieldCropAppProcessWastewateTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppProcessWastewateTSVModal(false)}
        />
        {this.state.fieldCropAppEvents.length > 0 ?
          <React.Fragment>

            <Grid item xs={12} align="right">
              <Button color="secondary" variant="outlined"
                onClick={() => this.toggleShowAddProcessWastewaterModal(true)}
              >
                Add process wastewater to application event
              </Button>
            </Grid>

            <Grid item xs={12}>
              {Object.keys(this.state.field_crop_app_process_wastewater).length > 0 ?

                process_wastewater_keys.map((field_crop_app_id, i) => {
                  let process_wastewaters = this.state.field_crop_app_process_wastewater[field_crop_app_id]
                  return (
                    <ProcessWastewaterAppEvent key={`ppwwviewrow${i}`}
                      process_wastewaters={process_wastewaters}
                      onDelete={this.onConfirmProcessWastewaterDelete.bind(this)}
                    />
                  )
                })
                :
                <React.Fragment></React.Fragment>
              }
            </Grid>

            <ActionCancelModal
              open={this.state.showConfirmDeleteProcessWastewaterModal}
              actionText="Delete"
              cancelText="Cancel"
              modalText={`Delete Process Wastewater for ${this.state.deleteProcessWastewaterObj.fieldtitle} - ${this.state.deleteProcessWastewaterObj.app_date}?`}

              onAction={this.onProcessWastewaterDelete.bind(this)}
              onClose={() => this.toggleShowConfirmDeleteProcessWastewaterModal(false)}
            />
            <AddProcessWastewaterModal
              open={this.state.showAddProcessWastewaterModal}
              actionText="Add"
              cancelText="Cancel"
              modalText={`Add process waste water application to applciation event`}
              fieldCropAppEvents={this.state.fieldCropAppEvents}
              createProcessWastewaterObj={this.state.createProcessWastewaterObj}
              materialTypes={MATERIAL_TYPES}

              onAction={this.createProcessWastewater.bind(this)}
              onChange={this.onCreateProcessWastewaterChange.bind(this)}
              onClose={() => this.toggleShowAddProcessWastewaterModal(false)}
            />
          </React.Fragment>
          :
          <React.Fragment></React.Fragment>
        }

      </Grid>
    )
  }
}

export default ProcessWastewater = withRouter(withTheme(ProcessWastewater))
