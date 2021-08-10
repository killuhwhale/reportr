import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, AppBar, Tabs, Tab
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers'
import AddIcon from '@material-ui/icons/Add'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import ProcessWastewater from "./processWastewater"
import AddFieldCropApplicationModal from "../Modals/addFieldCropApplicationModal"
import formats from "../../utils/format"
import { get, post } from '../../utils/requests';


const BASE_URL = "http://localhost:3001"
const PRECIPITATIONS = [
  "No Precipitation",
  "Standing water",
  "Lightrain",
  "Steady rain",
  "Heavy rain",
  "Hail",
  "Snow",
]

const APP_METHODS = [
  'No till (plowdown credit)',
  'Plow/disc',
  'Broadcast/incorporate',
  'Shank',
  'Injection',
  'Sweep',
  'Banding',
  'Sidedress',
  'Pipeline',
  'Surface (irragation',
  'Subsurface (irragation',
  'Towed tank',
  'Towed hose',
  'Other',
]

class NutrientApplicationTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      showAddFieldCropAppModal: false,
      fields: [],
      field_crops: {},
      fieldCropAppEvents: [],
      field_crop_app_process_wastewater: {}, // obj, holds lists of process_wastewater by Field Title, then sorted by app date.
      createFieldCropAppObj: {
        dairy_id: props.dairy.pk,
        app_date: new Date(),
        field_idx: 0,
        field_crop_idx: 0,
        precip_before_idx: 0,
        precip_during_idx: 0,
        precip_after_idx: 0,
      },
      tabs: {
        0: "show",
        1: "hide",
        2: "hide",
        3: "hide",
      },
      tabIndex: 0,
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }
  componentDidMount() {
    this.getFields()
    this.getFieldCrops()
    this.getFieldCropAppEvents()
    this.getFieldCropAppProcessWastewater()
  }
  handleTabChange(ev, index) {
    let tabs = this.state.tabs
    tabs[this.state.tabIndex] = "hide"
    tabs[index] = "show"
    this.setState({ tabIndex: index, tabs: tabs })
  }

  /** Get data */
  getFieldCropAppEvents() {
    get(`${BASE_URL}/api/field_crop_app/${this.state.dairy.pk}`)
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
  getFields() {
    get(`${BASE_URL}/api/fields/${this.state.dairy.pk}`)
      .then(fields => {
        this.setState({ fields: fields })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getFieldCrops() {
    get(`${BASE_URL}/api/field_crop/${this.state.dairy.pk}`)
      .then(field_crops => {

        let field_crop_lists = {}
        field_crops.forEach(field_crop => {
          if (field_crop_lists[field_crop.field_id]) {
            field_crop_lists[field_crop.field_id].push(field_crop)
          } else {
            field_crop_lists[field_crop.field_id] = [field_crop]
          }
        })
        this.setState({ field_crops: field_crop_lists })
      })
  }

  /** Field Application Event
   * Field Application Event - General event w/ a application date
   * Ties Nutrient applications, like Porcess Wastewater, to a day and field it was applied. Plus how much and nutirent details.
   * Used with mulitple nutrient applcaitons
   * 
   */
  onCreateFieldCropAppChange(ev) {
    const { name, value } = ev.target
    let createFieldCropAppObj = this.state.createFieldCropAppObj
    createFieldCropAppObj[name] = value

    if (name === "field_idx") {
      createFieldCropAppObj.field_crop_idx = 0
    }
    this.setState({ createFieldCropAppObj: createFieldCropAppObj })
  }
  createFieldCropApp() {
    let createObj = this.state.createFieldCropAppObj
    let chosen_field_idx = createObj.field_idx
    let field = this.state.fields[chosen_field_idx]

    if (field) {
      let field_pk = field.pk
      let _field_crops = this.state.field_crops[field_pk]
      if (_field_crops) {
        let chosen_field_crop = _field_crops[createObj.field_crop_idx]
        if (chosen_field_crop) {
          createObj['field_crop_id'] = chosen_field_crop.pk
          createObj['precip_before'] = PRECIPITATIONS[createObj.precip_before_idx]
          createObj['precip_during'] = PRECIPITATIONS[createObj.precip_during_idx]
          createObj['precip_after'] = PRECIPITATIONS[createObj.precip_after_idx]
          createObj['app_method'] = APP_METHODS[createObj.app_method_idx]


          post(`${BASE_URL}/api/field_crop_app/create`, createObj)
            .then(res => {
              console.log(res)
            })
            .catch(err => {
              console.log(err)
            })
        } else {
          console.log('Chosen field crop not valid for field or field_crops list: ', field, _field_crops)
        }
      } else {
        console.log("Field crops not found for field: ", field)
      }
    } else {
      console.log("Fields not found")
    }

  }
  toggleShowAddFieldCropAppModal(val) {
    this.setState({ showAddFieldCropAppModal: val })
  }


  /** Process Wastewater Applications
   * Process Wastewater Applications
   * - table anme: field_crop_app_process_wastewater
   */
  getFieldCropAppProcessWastewater() {
    console.log("Getting processwastewaters......")
    get(`${BASE_URL}/api/field_crop_app_process_wastewater/${this.state.dairy.pk}`)
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

        console.log("Seeting  process wastewaters...", process_wastewater_by_fieldtitle)
        this.setState({ field_crop_app_process_wastewater: process_wastewater_by_fieldtitle })
      })
      .catch(err => {
        console.log(err)
      })
  }
  onProcessWastewaterTSVUpload() {
    this.getFieldCropAppEvents()
    this.getFieldCropAppProcessWastewater()
  }




  render() {
    /** Gets field_crop_apps 
    * Gets field_crop_apps according to chosen field by the user in the create field crop application modal
    * Object w/ keys set to field.pk where value is the list of field_crops for that field.
    * Extract the list of field_crops for the chosen field.
     */
    let chosen_field_idx = this.state.createFieldCropAppObj.field_idx
    let field = this.state.fields[chosen_field_idx]
    let _field_crops = []
    if (field) {
      let field_pk = field.pk
      // Ensures that _field_crops isnt undefined.
      _field_crops = this.state.field_crops[field_pk] ? this.state.field_crops[field_pk] : []
    }


    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
          <Grid item xs={12} container alignItems="baseline">
            <Grid item xs={7}>
              <Typography variant="h2">Nutrient Applications
                <Typography variant="subtitle1" component="span"> ({this.state.fieldCropAppEvents.length})</Typography>
              </Typography>
            </Grid>

            <Grid item xs={5} align="center" >

              <Button variant="outlined" color="primary" fullWidth
                onClick={() => this.toggleShowAddFieldCropAppModal(true)}>
                Create New Application Event
              </Button>
            </Grid>





            <AppBar position="static" style={{ marginBottom: "32px", backgroundColor: "black" }}>
              <Tabs value={this.state.tabIndex} variant="fullWidth" selectionFollowsFocus
                onChange={this.handleTabChange.bind(this)} aria-label="simple tabs example">
                <Tab label="Process Wastewater" style={{ color: "#ec00d9" }} />
                <Tab label="Fresh Water" style={{ color: "#ec00d9" }} />
                <Tab label="Solid Manure" style={{ color: "#ec00d9" }} />
                <Tab label="Commercial Fertilizer" style={{ color: "#ec00d9" }} />
              </Tabs>
            </AppBar>

            <Grid item xs={12} style={{ marginTop: "30px" }} className={`${this.state.tabs[0]}`}>
              <ProcessWastewater
                dairy_id={this.state.dairy.pk}
                fieldCropAppEvents={this.state.fieldCropAppEvents}
                onProcessWastewaterTSVUpload={this.onProcessWastewaterTSVUpload.bind(this)}
                field_crop_app_process_wastewater={this.state.field_crop_app_process_wastewater}
              />

            </Grid>
            <Grid item xs={12} style={{ marginTop: "30px" }} className={`${this.state.tabs[1]}`}>
              <Typography variant="h2">Fresh Water</Typography>

            </Grid>
            <Grid item xs={12} style={{ marginTop: "30px" }} className={`${this.state.tabs[2]}`}>
              <Typography variant="h2">Solid Manure</Typography>

            </Grid>
            <Grid item xs={12} style={{ marginTop: "30px" }} className={`${this.state.tabs[3]}`}>

              <Typography variant="h2">Fertilizer</Typography>
            </Grid>






            <AddFieldCropApplicationModal
              open={this.state.showAddFieldCropAppModal}
              actionText="Add"
              cancelText="Cancel"
              modalText={`Select Field, Planted Crop, and Application Date precip...`}
              fields={this.state.fields}
              // an object holds lists of field_crops by the fields pk
              field_crops={_field_crops}
              createFieldCropAppObj={this.state.createFieldCropAppObj}
              PRECIPITATIONS={PRECIPITATIONS}
              APP_METHODS={APP_METHODS}
              onAction={this.createFieldCropApp.bind(this)}
              onChange={this.onCreateFieldCropAppChange.bind(this)}
              onClose={() => this.toggleShowAddFieldCropAppModal(false)}
            />
          </Grid>
          :
          <React.Fragment>
            <Grid item xs={12}>
              <Typography>No dairy selected or no fields created/ crops planted.</Typography>
            </Grid>
          </React.Fragment>
        }

      </React.Fragment>
    )
  }
}

export default NutrientApplicationTab = withRouter(withTheme(NutrientApplicationTab))
