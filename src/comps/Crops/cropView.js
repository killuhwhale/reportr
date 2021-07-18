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

import { get, post } from '../../utils/requests';


const BASE_URL = "http://localhost:3001"





class CropViewTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      field_crops: props.field_crops
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }

  componentDidUpdate(){

  }
  
  render(){
    console.log("Table Length", this.state.field_crops.length)
    return(
      <Grid item xs={12} style={{marginBottom: "32px"}}> 
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Field: {this.state.field_crops[0].fieldtitle}
          </Typography>
        </Grid>
        {this.state.field_crops.map((field_crop, i) => {
          return(
            <Grid item container xs={12} key={`cwtfc${i}`} style={{marginBottom: "16px"}}>
              <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Crop: {field_crop.croptitle}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Acres Planted"
                name="acres_planted"
                value={field_crop.acres_planted}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{width: "100%"}}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Yield (typical/ anticipated)"
                name="typical_yield"
                value={field_crop.typical_yield}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{width: "100%"}}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Moisture"
                name="moisture"
                value={field_crop.moisture}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{width: "100%"}}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="N"
                name="n"
                value={field_crop.n}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{width: "100%"}}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="P"
                name="p"
                value={field_crop.p}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{width: "100%"}}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="K"
                name="k"
                value={field_crop.k}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{width: "100%"}}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Salt"
                name="salt"
                value={field_crop.salt}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{width: "100%"}}
              />
            </Grid>
          </Grid>
          )
        })}
      </Grid>
    )
  }
}
CropViewTable = withRouter(withTheme(CropViewTable))

class CropView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      field_crops: props.field_crops,
      convertedFieldCrops: props.convertedFieldCrops
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }
  
  onFieldCropChange(ev, key, index){
      let updates = this.state.convertedFieldCrops
      console.log("onChange")
      
      const {name, value} = ev.target
      console.log(key, index, name, value)
      if(!value){
        return
      }
      let updateField = updates[key]  // key is the field which is a list of field_crops
      updateField[index][name] = value      // set value of field_crop @ inde
      this.setState({convertedFieldCrops: updates})
  }

  updateFieldCrops(){
    console.log("Updating field cropszzz")
    console.log(this.state.convertedFieldCrops)
  }

  render(){
   
   // Changes to the inner data of the object doesnt trigger a render state change
    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
        <Grid item container xs={12}>
          <Typography>Crop View</Typography>
          {this.state.field_crops.length > 0?
            Object.keys(this.state.convertedFieldCrops).map((field_id, i) => {
              return(
                <CropViewTable key={`cwt${i}`}
                  field_crops={this.state.convertedFieldCrops[field_id]}
                  onChange={this.onFieldCropChange.bind(this)}
                />
              )
            })
          :
          <React.Fragment></React.Fragment>
          }
          <Button fullWidth color="secondary" variant="outlined"
           onClick={this.updateFieldCrops.bind(this)} >
             Update Crops
           </Button>
        </Grid>
          :
          <React.Fragment>Loading....</React.Fragment>
        }
       
      </React.Fragment>

    )
  }
}

export default CropView = withRouter(withTheme(CropView))
