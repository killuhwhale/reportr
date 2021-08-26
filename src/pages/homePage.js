import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField, AppBar, Tabs, Tab
} from '@material-ui/core'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import DairyTab from "../comps/Dairy/dairyTab"
import HerdTab from "../comps/Herds/herdTab"
import CropTab from "../comps/Crops/cropTab"
import HarvestTab from "../comps/Harvests/harvestTab"
import AddDairyModal from "../comps/Modals/addDairyModal"
import NutrientApplicationTab from "../comps/Applications/appNutrientTab"
import ExportTab from "../comps/Exports/exportTab"

import { get, post, uploadFiles } from "../utils/requests"

import "../App.css"

const BASE_URL = "http://localhost:3001"
const COUNTIES = ["Merced", "San Joaquin"]
const BASINS = ["River", "Rio"]
const BREEDS = ["Heffy guy", "Milker Boi", "Steakz"]


class HomePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      reportingYr: 2021,
      dairies: [],
      showAddDairyModal: false,
      createDairyTitle: "",
      dairy: 0, // current dairy being edited
      updateDairyObj: {},
      tabs: {
        0: "show",
        1: "hide",
        2: "hide",
        3: "hide",
        4: "hide",
        5: "hide"
      },
      tabIndex: 0
    }
  }
  static getDerivedStateFromProps(props, state) {
    return state
  }

  componentDidMount() {
    this.getDairiesForReportingYear(this.state.reportingYr)
  }
  getDairiesForReportingYear(year) {
    let url = `/api/dairies/${year}`

    get(`${BASE_URL}${url}`)
      .then(res => {

        this.setState({ dairies: res })
      })

  }
  onChange(ev) {
    const { name, value } = ev.target
    // when select name changes query new data and update state
    if (name == "reportingYr") {
      // query api for all dairies with this year
      this.getDairiesForReportingYear(value)
    }
    this.setState({ [name]: value })
  }
  onDairyChange(ev) {
    const { name, value } = ev.target
    let _dairies = this.state.dairies  // listput updated
    let _dairy = this.state.dairy      // index
    let updateDairy = _dairies[_dairy] // copy object

    updateDairy[name] = value            // update object
    _dairies[_dairy] = updateDairy      // store updated object
    this.setState({ dairies: _dairies })
  }


  updateDairy() {
    let url = `${BASE_URL}/api/dairies/update`
    let dairy = this.state.dairies[this.state.dairy]
    const { street, cross_street, county, city, city_state, title, city_zip, basin_plan, p_breed, began } = dairy




    let data = {
      street,
      cross_street,
      county,
      city,
      city_state,
      city_zip,
      title,
      basin_plan,
      p_breed,
      began,
      dairy_id: dairy.pk
    }

    post(url, data)
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
  }
  toggleDairyModal(show) {
    this.setState({ showAddDairyModal: show })
  }
  createDairy() {
    let data = { reportingYr: this.state.reportingYr, title: this.state.createDairyTitle }
    post(`${BASE_URL}/api/dairies/create`, data)
      .then(res => {
        this.getDairiesForReportingYear(this.state.reportingYr)
        this.toggleDairyModal(false)
      })
      .catch(err => {
        console.log(err)
      })
  }
  handleTabChange(ev, index) {
    let tabs = this.state.tabs
    tabs[this.state.tabIndex] = "hide"
    tabs[index] = "show"
    this.setState({ tabIndex: index, tabs: tabs })
  }
  render() {
    return (
      <Grid container direction="row" item xs={12} spacing={2}>
        <Grid item xs={2} >

          <TextField select
            name='reportingYr'
            value={this.state.reportingYr}
            onChange={this.onChange.bind(this)}
            label="Reporting Year"
            SelectProps={{
              native: true,
            }}
            style={{ width: "100%" }}
          >
            <option value="2020">2020</option>
            <option value="2021">2021</option>
          </TextField>

          <TextField select
            name='dairy'
            value={this.state.dairy}
            onChange={this.onChange.bind(this)}
            label="Dairy"
            SelectProps={{
              native: true,
            }}
            style={{ width: "100%" }}
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


          <Tooltip title="Add Dairy">
            <Button color="primary" fullWidth variant="outlined" style={{ marginTop: "16px" }}
              onClick={() => this.toggleDairyModal(true)} >

              <Grid item container xs={12} >
                <Grid item xs={9} align="center">
                  <Typography variant="caption" >Add Dairy</Typography>
                </Grid>
                <Grid item xs={3} alight="right">
                  <AddIcon style={{ color: this.props.theme.palette.text.primary }} />
                </Grid>
              </Grid>

            </Button>
          </Tooltip>

        </Grid>

        <Grid item container xs={10}>
          <Grid item xs={12}>

            {this.state.dairies.length > 0 ?
              <React.Fragment>
                <AppBar position="static" style={{ marginBottom: "32px", backgroundColor: "black" }} key='homePageAppBar'>
                  <Tabs value={this.state.tabIndex} variant="fullWidth" selectionFollowsFocus
                    onChange={this.handleTabChange.bind(this)} aria-label="simple tabs example" key='homePageAppBar'>
                    <Tab label="Dairy" style={{ color: "#ec00d9" }} key='homePageAppBarTab0' />
                    <Tab label="Herds" style={{ color: "#ec00d9" }} key='homePageAppBarTab1' />
                    <Tab label="Crops planted" style={{ color: "#ec00d9" }} key='homePageAppBarTab2' />
                    <Tab label="Crops harvested" style={{ color: "#ec00d9" }} key='homePageAppBarTab3' />
                    <Tab label="Nutrient Applications " style={{ color: "#ec00d9" }} key='homePageAppBarTab4' />
                    <Tab label="Nutrient Exports " style={{ color: "#ec00d9" }} key='homePageAppBarTab5' />
                  </Tabs>
                </AppBar>

                {
                  this.state.tabs[0] === "show" ?
                    <Grid item xs={12} className={`${this.state.tabs[0]}`} key='DairyTab'>
                      <DairyTab
                        reportingYr={this.state.reportingYr}
                        dairy={this.state.dairies.length > 0 ? this.state.dairies[this.state.dairy] : {}}
                        BASINS={BASINS}
                        COUNTIES={COUNTIES}
                        BREEDS={BREEDS}
                        onChange={this.onDairyChange.bind(this)}
                        onUpdate={this.updateDairy.bind(this)}
                      />
                    </Grid>

                    : this.state.tabs[1] === "show" ?
                      <Grid item xs={12} key='HerdTab'>
                        <HerdTab
                          dairy={this.state.dairies.length > 0 ? this.state.dairies[this.state.dairy] : {}}
                        />
                      </Grid>
                      : this.state.tabs[2] === "show" ?
                        <Grid item xs={12} key='CropTab'>
                          <CropTab
                            dairy={this.state.dairies.length > 0 ? this.state.dairies[this.state.dairy] : {}}
                          />
                        </Grid>
                        : this.state.tabs[3] === "show" ?
                          <Grid item xs={12} key='HarvestTab'>
                            <HarvestTab
                              dairy={this.state.dairies.length > 0 ? this.state.dairies[this.state.dairy] : {}}
                            />
                          </Grid>
                          : this.state.tabs[4] === "show" ?
                            <Grid item xs={12} key='NutrientTab'>
                              <NutrientApplicationTab
                                dairy={this.state.dairies[this.state.dairy]}
                              />
                            </Grid>
                            : this.state.tabs[5] === "show" ?
                              <Grid item xs={12} key='NutrientTab'>
                                <ExportTab
                                  dairy={this.state.dairies[this.state.dairy]}
                                />
                              </Grid>
                              :
                              <React.Fragment></React.Fragment>
                }


              </React.Fragment>
              :
              <React.Fragment>Loading....</React.Fragment>
            }

          </Grid>
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
