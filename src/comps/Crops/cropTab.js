import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers';
import AddIcon from '@material-ui/icons/Add'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';
import CropView from "./cropView"
import AddFieldCropModal from "../Modals/addFieldCropModal"
import { get, post } from '../../utils/requests';


const BASE_URL = "http://localhost:3001"

class CropTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      fields: [], // fields from dairy
      crops: [],  // crops stored in DB with default data
      field_crops: [],
      convertedFieldCrops: {},
      createFieldCropObj: {
        createFieldIdx: 0,
        createCropIdx: 0,
        plant_date: new Date(),
        acres_planted: 0
      },
      showAddFieldCropModal: false
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }
  componentDidMount() {
    this.getFields()
    this.getCrops()
    this.getAllFieldCrops()
  }
  toggleShowAddFieldCropModal(val) {
    this.setState({ showAddFieldCropModal: val })
  }
  onFieldCropChange(ev) {
    let createObj = this.state.createFieldCropObj
    if (ev.target) {
      const { name, value } = ev.target
      createObj[name] = value
      this.setState({ createFieldCropObj: createObj })
    } else {
      createObj['plant_date'] = ev
      this.setState({ createFieldCropObj: createObj })
    }
  }
  getFields() {
    get(`${BASE_URL}/api/fields/${this.state.dairy.pk}`)
      .then(res => {
        this.setState({ fields: res })
      })
      .catch(err => [
        console.log(err)
      ])
  }
  getCrops() {
    get(`${BASE_URL}/api/crops`)
      .then(res => {
        this.setState({ crops: res })
      })
      .catch(err => [
        console.log(err)
      ])
  }
  createFieldCrop() {
    console.log("Create field_crop")
    let createFieldObj = this.state.createFieldCropObj
    let field = this.state.fields[createFieldObj.createFieldIdx]
    let crop = this.state.crops[createFieldObj.createCropIdx]

    let field_crop = {
      dairy_id: this.state.dairy.pk,
      field_id: field.pk,
      crop_id: crop.pk,
      plant_date: createFieldObj.plant_date,
      acres_planted: createFieldObj.acres_planted,
      typical_yield: crop.typical_yield,
      moisture: crop.moisture,
      n: crop.n,
      p: crop.p,
      k: crop.k,
      salt: crop.salt
    }
    console.log(field_crop)

    post(`${BASE_URL}/api/field_crop/create`, field_crop)
      .then(res => {
        console.log(res)
        this.toggleShowAddFieldCropModal(false)
        this.getAllFieldCrops()
      })
      .catch(err => {
        console.log(err)
      })
  }

  getAllFieldCrops() {
    get(`${BASE_URL}/api/field_crop/${this.state.dairy.pk}`)
      .then(res => {
        if (res.test) {
          console.log("Field Crops not found.")
        } else {
          this.setState({ field_crops: res, convertedFieldCrops: this.convertFieldCrops(res) })
        }
      })
  }


  // converts to  GROUPY by Field view of crops
  convertFieldCrops(field_crops) {
    let obj = {}
    field_crops.forEach(field_crop => {
      let l = obj[field_crop.field_id] ? obj[field_crop.field_id] : []
      l.push(field_crop)
      obj[field_crop.field_id] = l
    })
    return obj
  }

  deleteFieldCrop(delFieldCropObj) {
    console.log("Deleting field crop ", delFieldCropObj)
    post(`${BASE_URL}/api/field_crop/delete`, { pk: delFieldCropObj.pk })
      .then(res => {
        console.log(res)
        this.getAllFieldCrops()
      })
  }

  render() {
    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
          <Grid item container xs={12}>
            {this.state.field_crops.length > 0 ?
              <CropView
                dairy={this.state.dairy}
                field_crops={this.state.field_crops}
                convertedFieldCrops={this.state.convertedFieldCrops}
                onDeleteFieldCrop={this.deleteFieldCrop.bind(this)}
                addNewCrop={this.toggleShowAddFieldCropModal.bind(this)}
              />
              :
              <Grid item container xs={12}>
                <Grid item container xs={12}>
                  <Typography variant='h3'>
                    No crops planted
                  </Typography>
                </Grid>
                <Grid item container xs={12}>
                  <Button onClick={() => this.toggleShowAddFieldCropModal(true)} variant='outlined' color='primary'>
                    Add new planted crop
                  </Button>
                </Grid>
              </Grid>
            }
          </Grid>
          :
          <React.Fragment>Loading....</React.Fragment>
        }
        <AddFieldCropModal
          open={this.state.showAddFieldCropModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Select Field and Crop`}
          fields={this.state.fields}
          crops={this.state.crops}
          createFieldCropObj={this.state.createFieldCropObj}
          onAction={this.createFieldCrop.bind(this)}
          onChange={this.onFieldCropChange.bind(this)}
          onClose={() => this.toggleShowAddFieldCropModal(false)}
        />
      </React.Fragment>

    )
  }
}

export default CropTab = withRouter(withTheme(CropTab))
