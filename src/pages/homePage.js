import React, { Component } from 'react'
import {
  Grid, Button, Typography, IconButton, Tooltip, TextField, AppBar, Tabs, Tab
} from '@material-ui/core'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew'
import FlareIcon from '@material-ui/icons/Flare'
import NightsStayIcon from '@material-ui/icons/NightsStay'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'

import DairyTab from "../comps/Dairy/dairyTab"
import HerdTab from "../comps/Herds/herdTab"
import CropTab from "../comps/Crops/cropTab"
import HarvestTab from "../comps/Harvests/harvestTab"
import AddDairyModal from "../comps/Modals/addDairyModal"
import AddDairyBaseModal from "../comps/Modals/addDairyBaseModal"
import NutrientApplicationTab from "../comps/Applications/appNutrientTab"
import ExportTab from "../comps/Exports/exportTab"
import ActionCancelModal from "../comps/Modals/actionCancelModal"
import Accounts from "../comps/Accounts/accounts"
import { auth } from '../utils/users'
import { get, post } from "../utils/requests"
import { Dairy } from '../utils/dairy/dairy'
import { ALPHA_LOGO } from "../specific"
import { COUNTIES, BASINS, BREEDS } from '../utils/constants'


class HomePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: props.user,
      baseDairies: [],
      checkedForBaseDairies: false,
      baseDairiesIdx: 0,
      dairies: [],
      dairyIdx: 0, // current dairy being edited      
      dairyBase: {},
      dairy: {},
      showAddDairyModal: false,
      showAddDairyBaseModal: false,
      showAccountsModal: false,
      createDairyTitle: "",
      updateDairyObj: {},
      toggleShowLogoutModal: false,
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
    this.getBaseDairies()
  }


  getBaseDairies() {

    const companyID = auth.currentUser.company_id
    // get(`${this.props.BASE_URL}/api/dairy_base/${companyID}`)
    Dairy.getDairyBaseByCompanyID(companyID)
      .then(res => {
        const dairyBase = res && typeof res === typeof [] && res.length > 0 ? res[0] : {}
        if (Object.keys(dairyBase).length > 0) {
          let baseDairiesIdx = this.state.baseDairiesIdx < res.length ? this.state.baseDairiesIdx : 0
          this.setState({ baseDairies: res, checkedForBaseDairies: true, baseDairiesIdx: baseDairiesIdx, dairyBase }, () => {
            this.getDairies()
          })
        } else {
          this.setState({ baseDairies: res, checkedForBaseDairies: true, baseDairiesIdx: 0, dairyBase })
        }
      })
      .catch(err => {
        console.log(err)
        this.props.onAlert('Failed getting base dairies.', 'error')
      })
  }
  getDairies() {
    const dairyBase = this.state.baseDairies[this.state.baseDairiesIdx]
    const baseDairiesID = dairyBase && dairyBase.pk ? dairyBase.pk : null
    const company_id = auth.currentUser.company_id

    if (!company_id) return this.props.onAlert('Cannot find company ID', 'error')

    if (baseDairiesID) {
      get(`${this.props.BASE_URL}/api/dairies/dairyBaseID/${baseDairiesID}`)
        .then(res => {
          const dairy = res && typeof res === typeof [] && res.length > 0 ? res[0] : {}
          let dairyIdx = this.state.dairyIdx < res.length ? this.state.dairyIdx : 0
          this.setState({ dairies: res, dairyIdx: dairyIdx, dairy })
        })
        .catch(err => {
          console.log(err)
          this.props.onAlert(`Failed getting dairies for BaseDairyID: ${baseDairiesID}`, 'error')
        })
    }
  }
  onDairyChange(ev) {
    // Dairy info address info change
    const { name, value } = ev.target
    let _dairies = this.state.dairies  // listput updated
    let _dairy = this.state.dairyIdx      // index
    let updateDairy = _dairies[_dairy] // copy object

    updateDairy[name] = value            // update object
    console.log(updateDairy)
    _dairies[_dairy] = updateDairy      // store updated object
    this.setState({ dairies: _dairies })
  }
  updateDairy() {
    let url = `${this.props.BASE_URL}/api/dairies/update`
    let dairy = this.state.dairies[this.state.dairyIdx]
    let dairyInfo = { ...dairy, dairy_id: dairy.pk }

    // IF not selected, choose default values 
    dairyInfo.county = dairyInfo.county ? dairyInfo.county : COUNTIES[0]
    dairyInfo.basin_plan = dairyInfo.basin_plan ? dairyInfo.basin_plan : BASINS[0]


    post(url, dairyInfo)
      .then(res => {
        console.log(res)
        this.props.onAlert('Updated!', 'success')
      })
      .catch(err => {
        console.log(err)
        this.props.onAlert('Failed to update.', 'error')
      })
  }

  toggleAddDairyModal(val) {
    this.setState({ showAddDairyModal: val })
  }

  toggleAddDairyBaseModal(val) {
    this.setState({ showAddDairyBaseModal: val })
  }

  toggleAccountsModal(val) {
    this.setState({ showAccountsModal: val })
  }



  handleTabChange(ev, index) {
    let tabs = this.state.tabs
    tabs[this.state.tabIndex] = "hide"
    tabs[index] = "show"
    this.setState({ tabIndex: index, tabs: tabs })
  }



  onBaseDairyChange(ev) {
    const { name, value: baseDairiesIdx } = ev.target
    const dairyBase = this.state.baseDairies[baseDairiesIdx]
    const baseDairiesID = dairyBase && dairyBase.pk ? dairyBase.pk : null
    const company_id = auth.currentUser.company_id

    if (!company_id) return this.props.onAlert('Cannot find company ID', 'error')

    if (baseDairiesID) {
      // Query dairies by dairy_base_id
      // Display all dairies by reporting year,
      get(`${this.props.BASE_URL}/api/dairies/dairyBaseID/${baseDairiesID}`)
        .then(res => {
          const dairy = res && typeof res === typeof [] && res.length > 0 ? res[0] : {}
          this.setState({ dairies: res, dairyIdx: 0, dairy, baseDairiesIdx, dairyBase })
        })
        .catch(err => {
          console.log(err)
        })

    }
  }

  onDairyIdxChange(ev) {
    const { name, value: dairyIdx } = ev.target
    const dairy = this.state.dairies[dairyIdx]
    // Actualy setState of dairyObj and the index of list....
    this.setState({ dairy, dairyIdx })
  }


  confirmLogout(val) {
    this.setState({ toggleShowLogoutModal: val })
  }

  logout() {
    console.log("Loggin user out!")
    auth.logout()
    console.log("After user logout")
    this.confirmLogout(false)
  }





  refreshAfterXLSXUpload() {
    console.log("Calling getBaseDairies()")
    this.getBaseDairies()
  }

  render() {
    return (
      <Grid container direction="row" item xs={12} spacing={2}>
        <Grid item container alignItems='flex-start' xs={2} >
          <Grid item container xs={12}>
            <Grid item xs={12} align='center'>
              {/* <img src={'/fr_logo_alpha.png'} width="100%" height='65px' /> */}
              <img src={ALPHA_LOGO} width="100%" height='65px' />

            </Grid>
            <Grid item container justifyContent='center' alignItems='center' xs={12}>
              <Grid item xs={10} style={{ marginBottom: '16px' }}>
                <Typography variant='subtitle1'>
                  <TextField
                    label='Email'
                    value={this.state.user.email}
                  />
                </Typography>
              </Grid>


              <Grid item xs={2}>
                <Tooltip title='Logout'>
                  <IconButton onClick={() => this.confirmLogout(true)} size='small'>
                    <PowerSettingsNewIcon color='error' />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <TextField select
                name='baseDairiesIdx'
                value={this.state.baseDairiesIdx}
                onChange={this.onBaseDairyChange.bind(this)}
                label="Dairy"
                SelectProps={{
                  native: true,
                }}
                style={{ width: "100%" }}
              >
                {this.state.baseDairies.length > 0 ?
                  this.state.baseDairies.map((el, i) => {
                    return (
                      <option key={`daries${i}`} value={i}>{el.title}</option>
                    )
                  })
                  :
                  <option value="2021">No Dairies</option>
                }
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField select
                name='dairyIdx'
                value={this.state.dairyIdx}
                onChange={this.onDairyIdxChange.bind(this)}
                label="Reporting Year"
                SelectProps={{
                  native: true,
                }}
                style={{ width: "100%" }}
              >
                {this.state.dairies.length > 0 ?
                  this.state.dairies.map((el, i) => {
                    return (
                      <option key={`daries${i}`} value={i}>{el.reporting_yr}</option>
                    )
                  })
                  :
                  <option value="20133769420">No Dairies</option>
                }
              </TextField>
            </Grid>


            <Grid item xs={12}>

              <Tooltip title="Add Dairy">
                <Button fullWidth color="primary" variant="outlined" style={{ marginTop: "16px" }}
                  onClick={() => this.toggleAddDairyBaseModal(true)} >
                  Add Dairy
                </Button>
              </Tooltip>
            </Grid>
            <Grid item xs={12}>
              <Tooltip title="Add Reporting Year">
                <Button fullWidth color="primary" variant="outlined" style={{ marginTop: "0px" }}
                  onClick={() => this.toggleAddDairyModal(true)} >
                  Add Reporting Year
                </Button>
              </Tooltip>
            </Grid>

            <Grid item container xs={12}>
              <Grid item xs={6} align='center'>
                <Tooltip title="Light Theme">
                  <IconButton color="primary" variant="outlined" style={{ marginTop: "0px" }}
                    onClick={() => this.props.toggleTheme('Light')}>
                    <FlareIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={6} align='center'>
                <Tooltip title="Dark Theme">
                  <IconButton color="primary" variant="outlined" style={{ marginTop: "0px" }}
                    onClick={() => this.props.toggleTheme('Dark')}>
                    <NightsStayIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            <Grid item container xs={12}>
              <Grid item xs={12} align='center'>
                <Tooltip title="Accounts">
                  <IconButton color="primary" variant="outlined" style={{ marginTop: "16px" }}
                    onClick={() => this.toggleAccountsModal(true)}>
                    <SupervisorAccountIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>

          </Grid>






        </Grid>

        <Grid item container xs={10}>
          <Grid item xs={12}>

            {this.state.dairy && Object.keys(this.state.dairy).length > 0 ?
              <React.Fragment>
                <AppBar position="static" style={{ marginBottom: "32px" }} key='homePageAppBar'>
                  <Tabs value={this.state.tabIndex} variant="fullWidth" selectionFollowsFocus variant="scrollable"
                    onChange={this.handleTabChange.bind(this)} aria-label="simple tabs example" key='homePageAppBar'>
                    <Tab label="Dairy" key='homePageAppBarTab0' />
                    <Tab label="Info" key='homePageAppBarTab1' />
                    <Tab label="Planted" key='homePageAppBarTab2' />
                    <Tab label="Harvested" key='homePageAppBarTab3' />
                    <Tab label="Applications " key='homePageAppBarTab4' />
                    <Tab label="Exports " key='homePageAppBarTab5' />
                  </Tabs>
                </AppBar>

                {
                  this.state.tabs[0] === "show" ?
                    <Grid item xs={12} className={`${this.state.tabs[0]}`} key='DairyTab'>
                      <DairyTab
                        dairy={this.state.dairies.length > 0 ? this.state.dairies[this.state.dairyIdx] : {}}
                        BASINS={BASINS}
                        COUNTIES={COUNTIES}

                        onDairyDeleted={this.getBaseDairies.bind(this)}
                        onChange={this.onDairyChange.bind(this)}
                        onUpdate={this.updateDairy.bind(this)}
                        BASE_URL={this.props.BASE_URL}
                        onAlert={this.props.onAlert}
                        refreshAfterXLSXUpload={this.refreshAfterXLSXUpload.bind(this)}
                      />
                    </Grid>

                    : this.state.tabs[1] === "show" ?
                      <Grid item xs={12} key='HerdTab'>
                        <HerdTab
                          dairy={this.state.dairies.length > 0 ? this.state.dairies[this.state.dairyIdx] : {}}
                          BASE_URL={this.props.BASE_URL}
                          BREEDS={BREEDS}
                          onAlert={this.props.onAlert}
                        />
                      </Grid>
                      : this.state.tabs[2] === "show" ?
                        <Grid item xs={12} key='CropTab'>
                          <CropTab
                            dairy={this.state.dairies.length > 0 ? this.state.dairies[this.state.dairyIdx] : {}}
                            BASE_URL={this.props.BASE_URL}
                            onAlert={this.props.onAlert}
                          />
                        </Grid>
                        : this.state.tabs[3] === "show" ?
                          <Grid item xs={12} key='HarvestTab'>
                            <HarvestTab
                              dairy={this.state.dairy}
                              BASE_URL={this.props.BASE_URL}
                              onAlert={this.props.onAlert}
                            />
                          </Grid>
                          : this.state.tabs[4] === "show" ?
                            <Grid item xs={12} key='NutrientTab'>
                              <NutrientApplicationTab
                                dairy={this.state.dairies[this.state.dairyIdx]}
                                BASE_URL={this.props.BASE_URL}
                                onAlert={this.props.onAlert}
                              />
                            </Grid>
                            : this.state.tabs[5] === "show" ?
                              <Grid item xs={12} key='NutrientTab'>
                                <ExportTab
                                  dairy={this.state.dairies[this.state.dairyIdx]}
                                  BASE_URL={this.props.BASE_URL}
                                  onAlert={this.props.onAlert}
                                />
                              </Grid>
                              :
                              <React.Fragment></React.Fragment>
                }


              </React.Fragment>
              : this.state.baseDairies.length > 0 ?
                <Grid item xs={12}>
                  "We have at least one base dairy, but no dairy for reporting year allow to create a new one...."
                </Grid>
                :
                <React.Fragment>Loading....</React.Fragment>
            }

          </Grid>
        </Grid>


        <AddDairyModal
          open={this.state.showAddDairyModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add Dairy Reporting Year`}
          onDone={() => { this.getDairies() }}
          dairyBase={Object.keys(this.state.dairyBase).length > 0 ? this.state.dairyBase : {}}
          onClose={() => this.toggleAddDairyModal(false)}
          onAlert={this.props.onAlert}
          BASE_URL={this.props.BASE_URL}
        />

        <AddDairyBaseModal
          open={this.state.showAddDairyBaseModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add Dairy Base`}
          onDone={() => { this.getBaseDairies() }}
          onClose={() => this.toggleAddDairyBaseModal(false)}
          onAlert={this.props.onAlert}
          BASE_URL={this.props.BASE_URL}
        />


        <Accounts
          key={'DOESTHISWORK'}
          open={this.state.showAccountsModal}
          onAlert={this.props.onAlert}
          onClose={() => this.toggleAccountsModal(false)}
        />

        <ActionCancelModal
          open={this.state.toggleShowLogoutModal}
          actionText="Logout"
          cancelText="Cancel"
          modalText={`Are you sure you want to logout and leave?`}
          onAction={this.logout.bind(this)}
          onClose={() => this.confirmLogout(false)}
        />

      </Grid>
    )
  }
}

export default HomePage = withRouter(withTheme(HomePage))
