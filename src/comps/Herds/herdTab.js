import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField, AppBar, Tabs, Tab
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers'
import AddIcon from '@material-ui/icons/Add'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import HerdTable from './herdTable'
import Drain from './drain'
import { get, post } from '../../utils/requests'


const BASE_URL = "http://localhost:3001"

class HerdTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      initHerdLoad: false,
      herds: {
        // milk_cows: [0, 0, 0, 0, 0],
        // dry_cows: [],
        // bred_cows: [],
        // cows: [],
        // calf_young: [],
        // calf_old: []
      },
      tabs: {
        0: "show",
        1: "hide",
      },
      tabIndex: 0,
    }
  }

  static getDerivedStateFromProps(props, state) {
    return props
  }
  handleTabChange(ev, index) {
    let tabs = this.state.tabs
    tabs[this.state.tabIndex] = "hide"
    tabs[index] = "show"
    this.setState({ tabIndex: index, tabs: tabs })
  }
  componentDidMount() {
    this.getHerds()
  }
  
  getHerds() {
    // Get herds for Dairy
    // If no Dairy create empty default by proving dairy_pk
    // If no Dairy show button to create a herd
    get(`${BASE_URL}/api/herds/${this.state.dairy.pk}`)
      .then(res => {
        console.log(res)
        if (res.test || res.length === 0) {
          return;
        }
        this.setState({ herds: res[0], initHerdLoad: true })
      })
      .catch(err => {
        console.log(err)
      })
  }

  onChange(ev) {
      
  }

  createHerds() {
    console.log(this.state.dairy)
    post(`${BASE_URL}/api/herds/create`, { dairy_id: this.state.dairy.pk })
      .then(res => {
        console.log(res)
        this.getHerds()
      })
      .catch(err => {
        console.log(err)
      })
  }

  render() {
    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
          <Grid item xs={12}>
            <AppBar position="static" style={{ marginBottom: "32px", backgroundColor: "black" }} key='herdAppBar'>
              <Tabs value={this.state.tabIndex} variant="fullWidth" selectionFollowsFocus
                onChange={this.handleTabChange.bind(this)} aria-label="simple tabs example" key='herdTabs'>
                <Tab label="Herds" style={{ color: "#ec00d9" }} key='herdTab0' />
                <Tab label="Tile Drainage" style={{ color: "#ec00d9" }} key='herdTab1' />
              </Tabs>
            </AppBar>
            {
              this.state.tabs[0] === "show" ? 
                <Grid item xs={12}>
                <HerdTable 
                  dairy={this.state.dairy}
                  herds={this.state.herds}
                />
              </Grid>
              : this.state.tabs[1] === 'show' ? 
                <Grid item xs={12}>
                    <Drain 
                      dairy_id={this.state.dairy.pk}
                    />
                  </Grid>
              :
              <React.Fragment></React.Fragment>
            }
          </Grid>

          :
          <React.Fragment>Loading herds....</React.Fragment>
        }
      </React.Fragment>
    )
  }
}

export default HerdTab = withRouter(withTheme(HerdTab))
