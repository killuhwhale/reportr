import React, { Component } from 'react'
import {
  Grid, AppBar, Tabs, Tab
} from '@material-ui/core'

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import HerdTable from './herdTable'
import Discharge from './discharge'
import Agreement from './agreement'

import Drain from './drain'



class HerdTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      initHerdLoad: false,

      tabs: {
        0: "show",
        1: "hide",
        2: "hide",
        3: "hide",
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


  onChange(ev) {

  }



  render() {
    return (
      <React.Fragment>
        {Object.keys(this.state.dairy).length > 0 ?
          <Grid item xs={12}>
            <AppBar position="static" style={{ marginBottom: "32px" }} key='herdAppBar'>
              <Tabs value={this.state.tabIndex} selectionFollowsFocus variant="scrollable"
                onChange={this.handleTabChange.bind(this)} aria-label="simple tabs example" key='herdTabs'>
                <Tab label="Herds" key='herdTab0' />
                <Tab label="Tile Drainage" key='herdTab1' />
                <Tab label="Discharges" key='herdTab2' />
                <Tab label="NMP and Export Agreements" key='herdTab3' />
              </Tabs>
            </AppBar>

            {
              this.state.tabs[0] === "show" ?
                <Grid item xs={12}>
                  <HerdTable
                    dairy={this.state.dairy}
                    herds={this.state.herds}
                    BREEDS={this.props.BREEDS}
                    onAlert={this.props.onAlert}
                    BASE_URL={this.props.BASE_URL}
                  />
                </Grid>
                : this.state.tabs[1] === 'show' ?
                  <Grid item xs={12}>
                    <Drain
                      dairy_id={this.state.dairy.pk}
                      onAlert={this.props.onAlert}
                      BASE_URL={this.props.BASE_URL}
                    />
                  </Grid>
                  : this.state.tabs[2] === 'show' ?
                    <Grid item xs={12}>
                      <Discharge
                        dairy_id={this.state.dairy.pk}
                        onAlert={this.props.onAlert}
                        BASE_URL={this.props.BASE_URL}
                      />
                    </Grid>
                    : this.state.tabs[3] === 'show' ?
                      <Grid item xs={12}>
                        <Agreement
                          dairy_id={this.state.dairy.pk}
                          onAlert={this.props.onAlert}
                          BASE_URL={this.props.BASE_URL}
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
