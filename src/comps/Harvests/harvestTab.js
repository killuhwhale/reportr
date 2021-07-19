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
import HarvestView from "./harvestView"
import AddFieldCropHarvestModal from '../Modals/addFieldCropHarvestModal'
import UploadHarvestCSVModal from '../Modals/uploadHarvestCSVModal';
import { get, post } from '../../utils/requests';


const BASE_URL = "http://localhost:3001"
const BASIS = ['As-is', "Dry wt"]
class HarvestTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      field_crops: [], // The planted crops to choose from to create a harvest event in field_crop_harvest DB table
      field_crop_harvests: [],
      showAddFieldCropHarvestModal: false,
      showUploadCSV: false,
      createFieldCropHarvestObj: {
        harvest_date: new Date(),
        field_crop_idx: 0,
        basis_idx: 0,
        density: 0,
        actual_yield: 0,
        moisture: 0,
        n: 0,
        p: 0,
        k:0,
        tfs: 0
      } // TODO fill out required keys to create object....
    }
  }
  static getDerivedStateFromProps(props, state) {
    return state
  }
  componentDidMount() {
    this.getAllFieldCrops()
    this.getAllFieldCropHarvests()

  }
  getAllFieldCrops(){
    get(`${BASE_URL}/api/field_crop/${this.state.dairy.pk}`)
    .then(res => {
      console.log(res)
      this.setState({field_crops: res})
    })
    .catch(err => {
      console.log(err)
    })
  }

  toggleShowAddFieldCropHarvestModal(val){
    this.setState({showAddFieldCropHarvestModal: val})
  }

  onFieldCropHarvestChange(ev){
    let createObj = this.state.createFieldCropHarvestObj
    if(ev.target){
      const {name, value} = ev.target
      createObj[name] = value
      this.setState({createFieldCropHarvestObj: createObj})
    }else{
      createObj['harvest_date'] = ev
      this.setState({createFieldCropHarvestObj: createObj})
    }
    
  }

  createFieldCropHarvest(){
    const field_crop_idx = this.state.createFieldCropHarvestObj.field_crop_idx
    console.log("Creating field crop harvest", this.state.field_crops, field_crop_idx)
    const field_crop_id = this.state.field_crops[field_crop_idx].pk
    const basis_idx = this.state.createFieldCropHarvestObj.basis_idx
    const basis = BASIS[basis_idx]

    console.log("Create field crop harvest w/ field_crop id: ", field_crop_id, basis)

    let data = {
      ...this.state.createFieldCropHarvestObj,
      dairy_id: this.state.dairy.pk,
      basis: basis,
      field_crop_id: field_crop_id
    }
    post(`${BASE_URL}/api/field_crop_harvest/create`, data)
    .then(res => {
      console.log(res)
      this.toggleShowAddFieldCropHarvestModal(false)
      this.getAllFieldCropHarvests()
    })
    .catch(err => {
      console.log(err)
    })
  }

  getAllFieldCropHarvests(){
    get(`${BASE_URL}/api/field_crop_harvest/${this.state.dairy.pk}`)
    .then(res => {
      console.log(res)
      this.setState({field_crop_harvests: res})
    })
    .catch(err => {
      console.log(err)
    })
  }

  toggleShowUploadCSV(val){
    this.setState({showUploadCSV: val})
  }
  onCSVChange(ev){
    console.log(ev)
    const {files } = ev.target;
    console.log(files);
    if(files.length > 0){
      this.readCSV(files[0])
    }
  }


  readCSV(file){
    const reader = new FileReader();
    reader.addEventListener('load', (ev) => {
      const { result } = ev.target;
      console.log(result)
      console.log(ev.target)
    });
    reader.readAsText(file);
  }

  uploadCSV(){
    console.log("Uploading CSV")
  }

  render() {
    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
          this.state.field_crops.length > 0 ?

          <Grid item container xs={12}>
            <Button variant="outlined" fullWidth color="primary"
              onClick={() => this.toggleShowAddFieldCropHarvestModal(true)}>
              Add new harvest
            </Button>
            <Button variant="outlined" fullWidth color="primary"
              onClick={() => this.toggleShowUploadCSV(true)}>
              Import Harvest from CSV Production Records
            </Button>
            {
              this.state.field_crop_harvests.length > 0 ?
                <HarvestView 
                  dairy={this.state.dairy}
                  field_crop_harvests={this.state.field_crop_harvests}
                  getAllFieldCropHarvests={this.getAllFieldCropHarvests.bind(this)}
                />
            :
              <React.Fragment></React.Fragment>
            }
          </Grid>
          :
          <React.Fragment>No crops planted, see Crops tab</React.Fragment>
          :
          <React.Fragment>Loading....</React.Fragment>
        }

        <UploadHarvestCSVModal 
          open={this.state.showUploadCSV}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Import CSV`}
          onAction={this.uploadCSV.bind(this)}
          onChange={this.onCSVChange.bind(this)}
          onClose={() => this.toggleShowUploadCSV(false)}
        />
        <AddFieldCropHarvestModal
          open={this.state.showAddFieldCropHarvestModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Select Field and Planted Crop`}
          field_crops={this.state.field_crops}
          createFieldCropHarvestObj={this.state.createFieldCropHarvestObj}
          basis={BASIS}
          onAction={this.createFieldCropHarvest.bind(this)}
          onChange={this.onFieldCropHarvestChange.bind(this)}
          onClose={() => this.toggleShowAddFieldCropHarvestModal(false)}
        />
      </React.Fragment>

    )
  }
}

export default HarvestTab = withRouter(withTheme(HarvestTab))
