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


import AddProcessWastewaterModal from "../Modals/addProcessWastewaterModal"
import ActionCancelModal from "../Modals/actionCancelModal"
import { timePickerDefaultProps } from '@material-ui/pickers/constants/prop-types'
import { get, post } from '../../utils/requests'

const BASE_URL = "http://localhost:3001"
const MATERIAL_TYPES = [
  '',
  'Process wastewater',
  'Process wastewater sludge',
]


const ProcessWastewaterAppEvent = (props) => {
  let process_wastewaters = props.process_wastewaters
  let { app_date, fieldtitle, croptitle, plant_date, amount_applied } = process_wastewaters[0]
  return (
    <Grid container item xs={12}  style={{margin: "0px 10px 0px 5px"}}>
      <Grid item xs={12}>
        <Typography variant="h5">
          {fieldtitle}
        </Typography>
        <Typography variant="h6">
          {croptitle}
        </Typography>
      </Grid>

      <Grid container item xs={12}>
        <Grid item xs={4}>
          <TextField disabled
            label="Date planted"
            value={plant_date}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField disabled
            label="Application date"
            value={app_date}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField disabled
            label="Applied"
            value={`${amount_applied} gallons`}
          />
        </Grid>
      </Grid>

      {
        process_wastewaters.map((wastewater, i) => {
          const { } = wastewater
          let { source_desc, material_type, totalkn,
            ammoniumn, unionizedammoniumn, nitraten, totalp, totalk, totaltds } = wastewater
          return (
            <Grid item container xs={12} component={Paper} elevation={6} style={{margin: "24px 10px 0px 5px"}}>
             <Grid item container xs={10}>
                <Grid item xs={12}>
                  <Typography variant="h6">
                    {source_desc} | Material Type: {material_type}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Total Kjeldahl-nitrogen"
                    value={totalkn}
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
                    label="Total phosphorus"
                    value={totalp}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Total potassium "
                    value={totalk}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField disabled
                    label="Total dissolved solids"
                    value={totaltds}
                  />
                </Grid>
               
               
               </Grid> 
               <Grid item container xs={2} justifyContent="center" alignItems="center">
                 <Tooltip title="Delete Process wastewater">
                   <IconButton onClick={() => props.onDelete(wastewater)}>
                     <DeleteIcon color="error"/>
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
      dairy_id: props.dairy,
      fieldCropAppEvents: props.fieldCropAppEvents,
      showAddProcessWastewaterModal: false,
      field_crop_app_process_wastewater: [],
      showConfirmDeleteProcessWastewaterModal: false, 
      deleteProcessWastewaterObj: {},
      createProcessWastewaterObj: {
        dairy_id: 0,
        app_event_idx: 0,
        material_type_idx: 0,
        material_type: '',
        source_desc: '',
        amount_applied: '',
        totalKN: '',
        ammoniumN: '',
        unionizedAmmoniumN: '',
        nitrateN: '',
        totalP: '',
        totalK: '',
        totalTDS: '',

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
        console.log("Process wastewaters", res)
        let process_wastewater_by_app_event = {}
        res.forEach(wastewater => {
          let key = wastewater.field_crop_app_id
          if (process_wastewater_by_app_event[key]) {
            process_wastewater_by_app_event[key].push(wastewater)
          } else {
            process_wastewater_by_app_event[key] = [wastewater]
          }
          console.log("Process wastewaters", process_wastewater_by_app_event)
        })
        this.setState({ field_crop_app_process_wastewater: process_wastewater_by_app_event })
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

    createObj.app_event_id = this.state.fieldCropAppEvents[createObj.app_event_idx].pk
    createObj.material_type = MATERIAL_TYPES[createObj.material_type_idx]

    createObj.totalKN = parseFloat(createObj.totalKN.replace(',', ''))
    createObj.unionizedAmmoniumN = parseFloat(createObj.unionizedAmmoniumN.replace(',', ''))
    createObj.ammoniumN = parseFloat(createObj.ammoniumN.replace(',', ''))
    createObj.nitrateN = parseFloat(createObj.nitrateN.replace(',', ''))
    createObj.totalP = parseFloat(createObj.totalP.replace(',', ''))
    createObj.totalK = parseFloat(createObj.totalK.replace(',', ''))
    createObj.totalTDS = parseFloat(createObj.totalTDS.replace(',', ''))
    createObj.amount_applied = parseInt(createObj.amount_applied.replace(',', ''))


    console.log("creating process wasterwater event: ", createObj)
    // NEEd to create a DB table for this now and the wires in the two index.js files....
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


  onConfirmProcessWastewaterDelete(delProcessWaswaterObj){
    this.setState({showConfirmDeleteProcessWastewaterModal: true, deleteProcessWastewaterObj: delProcessWaswaterObj})
  }
  toggleShowConfirmDeleteProcessWastewaterModal(val){
    this.setState({showConfirmDeleteProcessWastewaterModal: val})
  }
  onProcessWastewaterDelete(){
    if(Object.keys(this.state.deleteProcessWastewaterObj).length > 0){
      post(`${BASE_URL}/api/field_crop_app_process_wastewater/delete`, {pk: this.state.deleteProcessWastewaterObj.pk})
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


  render() {
    return (
      <Grid item xs={12} container>
        <Grid item xs={12}>
          <Button color="secondary" variant="outlined"
            onClick={() => this.toggleShowAddProcessWastewaterModal(true)}
          >
            Add process wastewater to application event
          </Button>
        </Grid>
        <Grid item xs={12}>
          {Object.keys(this.state.field_crop_app_process_wastewater).length > 0 ?
            Object.keys(this.state.field_crop_app_process_wastewater).map((app_event_id, i) => {
              let process_wastewaters = this.state.field_crop_app_process_wastewater[app_event_id]
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
      </Grid>
    )
  }
}

export default ProcessWastewater = withRouter(withTheme(ProcessWastewater))
