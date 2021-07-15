import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
}from '@material-ui/core'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import DairyTab from "../comps/Dairy/dairyTab"
import AddDairyModal from "../comps/Modals/addDairyModal"
import { get, post, uploadFiles } from "../utils/requests"

const BASE_URL = "http://localhost:3001"
const COUNTIES = ["Merced", "San Joaquin"]
const BASINS = ["River", "Rio"]
const BREEDS = ["Heffy guy", "Milker Boi", "Steakz"]


class HomePage extends Component {
  constructor(props){
    super(props)
    this.state = {
      reportingYr: 2021,
      dairies: [],
      showAddDairyModal: false,
      createDairyTitle: "",
      dairy: 0, // current dairy being edited
    }
  }
  static getDerivedStateFromProps(props, state){
    return state
  }

  componentDidMount(){
    this.getDairiesForReportingYear(this.state.reportingYr)
  }
  getDairiesForReportingYear(year){
    let url = `/api/dairies/${year}`
  
    get(`${BASE_URL}${url}`)
    .then(res => {
      console.log("All Dairies for RYear")
      console.log(res)
      this.setState({dairies: res})
    })
    
  }
  onChange(ev){
    const {name, value} = ev.target
    // when select name changes query new data and update state
    if(name == "reportingYr"){
      // query api for all dairies with this year
      this.getDairiesForReportingYear(value)
    }
    this.setState({[name]: value})
  }
  onDairyChange(name, value){
    let _dairies = this.state.dairies  // listput updated
    let _dairy = this.state.dairy      // index
    let updateDairy = _dairies[_dairy] // copy object
    
    updateDairy[name] = value            // update object
    _dairies[_dairy] = updateDairy      // store updated object
    this.setState({dairies: _dairies})
  }
  updateDairy(){
    let url =`${BASE_URL}/api/dairies/update`
    let dairy = this.state.dairies[this.state.dairy]
    const {street, cross_street, county, city, city_state, title, city_zip, basin_plan, p_breed, began} = dairy
    let data = {data: [street, cross_street, county, city, city_state, city_zip, title, basin_plan, p_breed, began, dairy.pk]}
    
    post(url, data)
    .then(res =>{
      console.log(res)
    })
    .catch(err => {
      console.log(err)
    })
  }
  toggleDairyModal(show){
    this.setState({showAddDairyModal: show})
  }
  createDairy(){
    this.toggleDairyModal(false)
    console.log("Create a dairy with this title and year")
    console.log(this.state.reportingYr, this.state.createDairyTitle)
    let url = "/api/dairies/create"
    let data = {reportingYr: this.state.reportingYr, title: this.state.createDairyTitle}
    post(`${BASE_URL}${url}`, data)
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      console.log(err)
    })
  }
  

  render(){
    return(
      <Grid container item xs={12}>
        <Grid item xs={12}>
          <TextField select
            name='reportingYr'
            value={this.state.reportingYr}
            onChange={this.onChange.bind(this)}
            label="Reporting Year"
            SelectProps={{
              native: true,
            }}
            style={{width: "100%"}}
          >
            <option value="2020">2020</option>
            <option value="2021">2021</option>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField select
            name='dairy'
            value={this.state.dairy}
            onChange={this.onChange.bind(this)}
            label="Dairy"
            SelectProps={{
              native: true,
            }}
            style={{width: "100%"}}
          >
            {this.state.dairies.length > 0 ?
              this.state.dairies.map((el, i) => {
                return (
                  <option key={`daries${i}`} value={i}>{el.title}</option>
                )
              })
            :
              <option value="2021">No Dairies</option>
            }
          </TextField>
        </Grid>
        <Grid item align="right" xs={12}>
          <Tooltip title="Add Dairy">
            <IconButton onClick={() => this.toggleDairyModal(true)}> 
              <AddIcon style={{color: this.props.theme.palette.text.primary}}/>
            </IconButton>
          </Tooltip>
        </Grid>
        <hr />
        <Grid item xs={12}>
          <DairyTab 
            reportingYr={this.state.reportingYr}
            dairy={this.state.dairies.length > 0? this.state.dairies[this.state.dairy]: {}}
            basins={BASINS}
            counties={COUNTIES}
            breeds={BREEDS}
            onChange={this.onDairyChange.bind(this)}
            onUpdate={this.updateDairy.bind(this)}
          />
        </Grid>
        <AddDairyModal
          open={this.state.showAddDairyModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add Dairy to current Reporting Year ${this.state.reportingYr}`}
          createDairyTitle={this.state.createDairyTitle}
          onChange={this.onChange.bind(this)}
          onAction={this.createDairy.bind(this)}
          onClose={() => this.toggleDairyModal(false)}
        />
      </Grid>
    )
  }
}

export default HomePage = withRouter(withTheme(HomePage))