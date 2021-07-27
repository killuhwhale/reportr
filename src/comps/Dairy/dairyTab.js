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
import { get, getPDF, post } from '../../utils/requests';
import ParcelView from "../Parcel/parcelView"
import OperatorView from "../Operators/operatorView"
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
  constructor(props) {
    super(props)
    this.state = {
      reportingYr: props.reportingYr,
      dairy: props.dairy,
      showAddParcelModal: false,
      showAddFieldModal: false
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }
  onChange(ev) {
    const { name, value } = ev.target
    this.props.onChange(name, value)
  }
  handleDateChange(date) {
    this.props.onChange("began", date)
  }
  onParcelChange(pk, pnumber) {
    console.log("onParcelChange")
    console.log(pk, pnumber)
  }
  createParcel(pnumber) {
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
  toggleParcelModal(val) {
    this.setState({ showAddParcelModal: val })
  }
  createField(field) {
    console.log("Creating Field for")
    console.log(this.state.dairy.title, this.state.dairy.pk)
    console.log(field)
    post(`${BASE_URL}/api/fields/create`, { data: { ...field, dairy_id: this.state.dairy.pk } })
      .then(res => {
        console.log(res)
        this.toggleFieldModal(false)
      })
      .catch(err => {
        console.log(err)
        this.toggleFieldModal(false)
      })
  }
  toggleFieldModal(val) {
    this.setState({ showAddFieldModal: val })
  }

  generatePDF(){
    
    console.log("Generating pdf ")
    getPDF(`${BASE_URL}/api/pdf/${this.state.dairy.pk}`)
    .then(res => {
      console.log(res.data)
      const blob = new Blob([res.data], {type: 'application/pdf'})
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `test.pdf`
      link.click()
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
            <Grid item xs={6} >
              <Typography variant="h2">
                Dairy Information
              </Typography>

            </Grid>
            <Grid item xs={6} >
              <Tooltip title="Generate Annual Report">
                <IconButton 
                  onClick={this.generatePDF.bind(this)} >
                  <AddIcon style={{color: this.props.theme.palette.text.primary}}/>
                </IconButton>
              </Tooltip>

            </Grid>


            <Grid item xs={12}>
              <OperatorView
                dairy={this.state.dairy}
              
              />
            </Grid>


            <Grid item container xs={12} style={{marginTop: "64px"}}>
              <Grid item xs={12}>
                <Typography variant="h2">
                  Address
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name='title'
                  value={this.state.dairy.title}
                  onChange={this.onChange.bind(this)}
                  label="Dairy Name"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item container xs={4} style={{position:"relative"}}> 
                  <div style={{position: 'absolute', top: 0, left: 0}}>
                    <Typography variant="caption">First Started Operation</Typography>
                  </div>
                  <DatePicker 
                    value={this.state.dairy.began}
                    onChange={this.handleDateChange.bind(this)} 
                    style={{width: "100%", justifyContent: "flex-end"}}
                  />
              </Grid>
              <Grid item xs={4}>
                <TextField select
                  name='p_breed'
                  value={this.state.dairy.p_breed}
                  onChange={this.onChange.bind(this)}
                  label="Primary Breed"
                  style={{ width: "100%" }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {this.props.breeds.map((el, i) => {
                    return (
                      <option key={`breeds${i}`} value={i}>{el}</option>
                    )
                  })}
                </TextField>
              </Grid>
            </Grid>
            <Grid item container xs={12} style={{marginTop:"16px"}}>
              <Grid item xs={4}>
                <TextField
                  name='street'
                  value={this.state.dairy.street}
                  onChange={this.onChange.bind(this)}
                  label="Street"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name='cross_street'
                  value={this.state.dairy.cross_street}
                  onChange={this.onChange.bind(this)}
                  label="Cross Street"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField select
                  name='county'
                  value={this.state.dairy.county}
                  onChange={this.onChange.bind(this)}
                  label="County"
                  style={{ width: "100%" }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {this.props.counties.map((el, i) => {
                    return (
                      <option name="county" key={`county${i}`} value={i}>{el}</option>
                    )
                  })}
                </TextField>
              </Grid>

            </Grid>
            <Grid item container xs={12} style={{marginTop:"16px"}}>
              <Grid item xs={3}>
                <TextField
                  name='city'
                  value={this.state.dairy.city}
                  onChange={this.onChange.bind(this)}
                  label="City"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  name='city_state'
                  value={this.state.dairy.city_state}
                  onChange={this.onChange.bind(this)}
                  label="State"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  name='city_zip'
                  value={this.state.dairy.city_zip}
                  onChange={this.onChange.bind(this)}
                  label="Zip"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField select
                  name='basin_plan'
                  value={this.state.dairy.basin_plan}
                  onChange={this.onChange.bind(this)}
                  label="Basin Plan"
                  style={{ width: "100%" }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {this.props.basins.map((el, i) => {
                    return (
                      <option key={`basin${i}`} value={i}>{el}</option>
                    )
                  })}
                </TextField>
              </Grid>
              <Grid item xs={12}>
              <Grid item xs={12} container alignItems="center">
                <Button variant="outlined" fullWidth color="primary"
                  onClick={this.props.onUpdate} style={{marginTop:"16px"}}
                >
                  Update
                </Button>
              </Grid>
              </Grid>
            </Grid>
            <Grid item container key="parcel_FieldList"align="center" xs={12} style={{marginTop:"24px"}} spacing={2}>
              <Grid item xs={6}>
                <Grid item xs={12}>
                  <Typography variant="h4">
                    Parcels
                  </Typography>
                </Grid>
                <Tooltip title="Add parcel to dairy">
                  <Button 
                    onClick={() => this.toggleParcelModal(true)} 
                    fullWidth variant="outlined" color="primary"
                    style={{marginTop:"16px"}}
                  >
                    <Typography variant="subtitle2">
                      Add Parcel
                    </Typography>
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item xs={6}>           
                <Typography variant="h4">
                  Fields
                </Typography>
                <Tooltip title="Add field to dairy">
                  <Button 
                    onClick={() => this.toggleFieldModal(true)} 
                    fullWidth variant="outlined" color="primary"
                    style={{marginTop:"16px"}}
                  >
                    <Typography variant="subtitle2">
                      Add Field
                    </Typography>
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
            <Grid item container align="center" xs={12} style={{marginTop:"24px"}} spacing={2}>
              <ParcelView
                reportingYr={this.state.reportingYr}
                dairy={this.state.dairy}
              />
            </Grid>


        <AddParcelModal
          open={this.state.showAddParcelModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add Parcel to Dairy ${this.state.dairy.title}`}
          parcel={{ pnumber: "" }}
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
          </Grid>
          :
          <React.Fragment>
            <Grid item xs={12}>
              <Typography>No dairy selected!</Typography>
            </Grid>
          </React.Fragment>
        }
        
      </React.Fragment>
    )
  }
}

export default DairyTab = withRouter(withTheme(DairyTab))
