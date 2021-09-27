import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';
import CropView from "./cropView"
import AddFieldCropModal from "../Modals/addFieldCropModal"
import { get, post } from '../../utils/requests'
import { groupBySortBy } from "../../utils/format"

import ActionCancelModal from "../Modals/actionCancelModal"
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';

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
      toggleShowDeleteAllModal: false,
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
  componentDidUpdate(prevProps, prevState) {
    if (prevState.dairy.pk !== this.state.dairy.pk) {
      this.getFields()
      this.getCrops()
      this.getAllFieldCrops()
    }
  }

  toggleShowAddFieldCropModal(val) {
    this.setState({ showAddFieldCropModal: val })
  }
  onFieldCropChange(ev) {
    let createFieldCropObj = this.state.createFieldCropObj
    const { name, value } = ev.target
    createFieldCropObj[name] = value

    this.setState({ createFieldCropObj })
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
          let convertedFieldCrops = groupBySortBy(res, ['fieldtitle'])
          this.setState({ field_crops: res, convertedFieldCrops })
        }
      })
  }

  deleteFieldCrop(delFieldCropObj) {
    console.log("Deleting field crop ", delFieldCropObj)
    post(`${BASE_URL}/api/field_crop/delete`, { pk: delFieldCropObj.pk })
      .then(res => {
        console.log(res)
        this.getAllFieldCrops()
      })
  }

  confirmDeleteAllFromTable(val){
      this.setState({toggleShowDeleteAllModal: val})
  }
  deleteAllFromTable(){
    post(`${BASE_URL}/api/field_crop/deleteAll`,{dairy_id: this.state.dairy.pk})
    .then(res => {
      this.getAllFieldCrops()
      this.confirmDeleteAllFromTable(false)
    })
    .catch(err => {
      console.log(err)
    })
  }

  render() {
    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
          <Grid item container xs={12}>
            {this.state.field_crops.length > 0 ?
              <Grid item xs={12}>
                <Grid item xs={12} align='right'>
                  <Tooltip title='Delete'>
                    <IconButton onClick={() => this.confirmDeleteAllFromTable(true)}>
                      <DeleteSweepIcon color='error' />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={12}>
                  <CropView
                    dairy={this.state.dairy}
                    field_crops={this.state.field_crops}
                    convertedFieldCrops={this.state.convertedFieldCrops}
                    onDeleteFieldCrop={this.deleteFieldCrop.bind(this)}
                    addNewCrop={this.toggleShowAddFieldCropModal.bind(this)}
                  />

                </Grid>
              </Grid>
              :
              <Grid item container xs={12}>
                <Grid item container xs={12}>
                  <Grid item xs={12}>
                    <Typography variant='h3'>
                      No crops planted
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1'>
                      Add via Production Records Sheet under CROPS HARVESTED tab
                    </Typography>
                  </Grid>
                </Grid>
                {/* <Grid item container xs={12}>
                  <Button onClick={() => this.toggleShowAddFieldCropModal(true)} variant='outlined' color='primary'>
                    Add new planted crop
                  </Button>
                </Grid> */}
              </Grid>
            }
          </Grid>
          :
          <React.Fragment>Loading....</React.Fragment>
        }

        <ActionCancelModal
          open={this.state.toggleShowDeleteAllModal}
          actionText="Delete all "
          cancelText="Cancel"
          modalText={`Delete Field Crops for ${this.state.dairy.title}?`}
          onAction={this.deleteAllFromTable.bind(this)}
          onClose={() => this.confirmDeleteAllFromTable(false)}
        />
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
