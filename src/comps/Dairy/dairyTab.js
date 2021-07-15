import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
}from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers';
import AddIcon from '@material-ui/icons/Add'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';
import { get, post } from '../../utils/requests';
import ParcelNumber from "../Parcel/parcelNumber"
import AddParcelModal from "../Modals/addParcelModal"
import AddFieldModal from "../Modals/addFieldModal"

const BASE_URL = "http://localhost:3001"

/**
 * street VARCHAR(100) NOT NULL,
  cross_street VARCHAR(50),
  county VARCHAR(30),
  city VARCHAR(30) NOT NULL,
  city_state VARCHAR(3),
  city_zip VARCHAR(20) NOT NULL,
  title VARCHAR(30) NOT NULL,
  basin_plan VARCHAR(30),
  began timestamp,
 */





class DairyTab extends Component {
  constructor(props){
    super(props)
    this.state = {
      reportingYr: props.reportingYr,
      dairy: props.dairy,
      showAddParcelModal: false,
      showAddFieldModal: false
    }
  }
  static getDerivedStateFromProps(props, state){
    return props // if default props change return props | compare props.dairy == state.dairy
  }
  onChange(ev){
    const {name, value} = ev.target
    this.props.onChange(name, value)
  }
  handleDateChange(date){
    this.props.onChange("began", date)
  }
  onParcelChange(pk, pnumber){
    console.log("onParcelChange")
    console.log(pk, pnumber)
  }
  createParcel(pnumber){
    console.log("Creating Parcel for")
    console.log(this.state.dairy.title, this.state.dairy.pk, pnumber)
    let data = { data: [pnumber, this.state.dairy.pk] } 

    post(`${BASE_URL}/api/parcels/create`, data)
    .then(res => {
      console.log(res)
      this.toggleParcelModal(false)
    })
    .catch(err => {
      console.log(err)
      this.toggleParcelModal(false)
    })
  }
  toggleParcelModal(val){
    this.setState({showAddParcelModal: val})
  }
  createField(field){
    console.log("Creating Field for")
    console.log(this.state.dairy.title, this.state.dairy.pk)
    console.log(field)
    post(`${BASE_URL}/api/fields/create`, {...field, dairy_id: this.state.dairy.pk})
    .then(res => {
      console.log(res)
      this.toggleFieldModal(false)
    })
    .catch(err => {
      console.log(err)
      this.toggleFieldModal(false)
    })
  }

  toggleFieldModal(val){
    this.setState({showAddFieldModal: val})
  }

  render(){
    console.log(this.state.dairy)
    return(
      <React.Fragment>
      {Object.keys(this.props.dairy).length > 0?
        <Grid item container xs={12}>
          <Typography>
            Dairy Tab
          </Typography>
          <Typography>
            Each tab will corresspond to a Dairy and fill out a db entry
          </Typography>
          <Grid item xs={12}>
            <TextField 
                name='title'  
                value={this.state.dairy.title}
                onChange={this.onChange.bind(this)}
                label="Dairy Name"
                style={{width: "100%"}}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField 
                name='street'  
                value={this.state.dairy.street}
                onChange={this.onChange.bind(this)}
                label="Street"
                style={{width: "100%"}}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField 
                name='cross_street'  
                value={this.state.dairy.cross_street}
                onChange={this.onChange.bind(this)}
                label="Cross Street"
                style={{width: "100%"}}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField select
                name='county'  
                value={this.state.dairy.county}
                onChange={this.onChange.bind(this)}
                label="County"
                style={{width: "100%"}}
                SelectProps={{
                  native: true,
                }}
            >
              {this.props.counties.map((el, i) => {
                return(
                  <option name="county" key={`county${i}`} value={i}>{el}</option>
                )
              })}
              </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField 
                name='city'  
                value={this.state.dairy.city}
                onChange={this.onChange.bind(this)}
                label="City"
                style={{width: "100%"}}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField 
                name='city_state'  
                value={this.state.dairy.city_state}
                onChange={this.onChange.bind(this)}
                label="State"
                style={{width: "100%"}}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField 
                name='city_zip'  
                value={this.state.dairy.city_zip}
                onChange={this.onChange.bind(this)}
                label="Zip"
                style={{width: "100%"}}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField select
                name='basin_plan'  
                value={this.state.dairy.basin_plan}
                onChange={this.onChange.bind(this)}
                label="Basin Plan"
                style={{width: "100%"}}
                SelectProps={{
                  native: true,
                }}
            >
              {this.props.basins.map((el, i) => {
                return(
                  <option key={`basin${i}`} value={i}>{el}</option>
                )
              })}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <DatePicker value={this.state.dairy.began} onChange={this.handleDateChange.bind(this)} />
          </Grid>
          <Grid item xs={12}>
          <TextField select
                name='p_breed'  
                value={this.state.dairy.p_breed}
                onChange={this.onChange.bind(this)}
                label="Primary Breed"
                style={{width: "100%"}}
                SelectProps={{
                  native: true,
                }}
            >
              {this.props.breeds.map((el, i) => {
                return(
                  <option key={`breeds${i}`} value={i}>{el}</option>
                )
              })}
            </TextField>
          </Grid>
          
          <hr />
        
          <Grid item xs={12}>
            <Typography variant="subtitle2">Add new Parcel</Typography>
          
            <Tooltip title="Add parcel to dairy">
              <IconButton onClick={() => this.toggleParcelModal(true)}> 
                <AddIcon style={{color: this.props.theme.palette.text.primary}}/>
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Add new Field</Typography>
          
            <Tooltip title="Add field to dairy">
              <IconButton onClick={() => this.toggleFieldModal(true)}> 
                <AddIcon style={{color: this.props.theme.palette.text.primary}}/>
              </IconButton>
            </Tooltip>
          </Grid>

          <hr />

          <Grid item  xs={12} container alignItems="center">
              <Button variant="outlined" fullWidth color="primary"
                onClick={this.props.onUpdate}
              >
                Update
              </Button>
          </Grid>
        </Grid>  
      :
        <React.Fragment>
          <Grid item xs={12}>
            <Typography>No dairy selected!</Typography> 
          </Grid>
        </React.Fragment>
      }
      <AddParcelModal
          open={this.state.showAddParcelModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add Parcel to Dairy ${this.state.dairy.title}`}
          parcel={{pnumber: ""}}
          onUpdate={this.onParcelChange.bind(this)}

          onAction={this.createParcel.bind(this)}
          onClose={() => this.toggleParcelModal(false)}
        />
        <AddFieldModal
          open={this.state.showAddFieldModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add Field to Dairy ${this.state.dairy.title}`}
          onAction={this.createField.bind(this)}
          onClose={() => this.toggleFieldModal(false)}
        />
    </React.Fragment>
    )
  }
}

export default DairyTab = withRouter(withTheme(DairyTab))
