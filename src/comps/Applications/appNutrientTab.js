import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
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
      field_crops: [],
      fieldCropAppEvents: [],
      createFieldCropAppObj: {
        dairy_id: props.dairy.pk,
        app_date: new Date(),
        field_idx: 0,
        field_crop_idx: 0,
        precip_before_idx: 0,
        precip_during_idx: 0,
        precip_after_idx: 0,
      },
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }
  componentDidMount() {
    this.getFields()
    this.getFieldCrops()
    this.getFieldCropAppEvents()
  }
  toggleShowAddFieldCropAppModal(val) {
    this.setState({ showAddFieldCropAppModal: val })
  }

  getFieldCropAppEvents() {
    get(`${BASE_URL}/api/field_crop_app/${this.state.dairy.pk}`)
      .then(res => {
        res.sort((a, b) => {
          return `${a.fieldtitle} ${a.app_date} ${a.app_method}` > `${b.fieldtitle} ${b.app_date} ${b.app_method}` ? 1 : -1
        }) 
        
        this.setState({ fieldCropAppEvents: res})
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
        console.log("field crop  OBJ", field_crop_lists)
        this.setState({ field_crops: field_crop_lists })
      })
  }

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
      let chosen_field_crop = _field_crops[createObj.field_crop_idx]
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
    }

  }

  render() {
    let chosen_field_idx = this.state.createFieldCropAppObj.field_idx
    let field = this.state.fields[chosen_field_idx]
    let _field_crops = []
    if (field) {
      let field_pk = field.pk
      _field_crops = this.state.field_crops[field_pk]
    }

    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 && this.state.fields.length > 0 && Object.keys(this.state.field_crops).length > 0 ?
          <Grid item xs={12} container>
            <Grid item xs={12}>
              <Typography variant="h1">Nutrient Applications 
                <Typography variant="subtitle1" component="span"> ({this.state.fieldCropAppEvents.length})</Typography>
              </Typography>
              </Grid>

              <Grid item xs={12} align="center">
              
              <Button variant="outlined" color="primary" fullWidth
                onClick={() => this.toggleShowAddFieldCropAppModal(true)}>
                Create New Application Event
              </Button>
            </Grid>

            <Grid item xs={12} style={{marginTop: "30px"}}>
              <Typography variant="h2">Process Wastewater</Typography>
              <ProcessWastewater
                dairy_id={this.state.dairy.pk}
                fieldCropAppEvents={this.state.fieldCropAppEvents}
              />

            </Grid>
            <Grid item xs={12} style={{marginTop: "30px"}}>
              <Typography variant="h2">Fresh Water</Typography>

            </Grid>
            <Grid item xs={12} style={{marginTop: "30px"}}>
              <Typography variant="h2">Solid Manure</Typography>

            </Grid>
            <Grid item xs={12} style={{marginTop: "30px"}}>

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
