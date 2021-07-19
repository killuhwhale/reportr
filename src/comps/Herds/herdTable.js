import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers';
import AddIcon from '@material-ui/icons/Add'

import calculateHerdManNKPNaCl from "../../utils/herdCalculation"
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';
import { get, post } from '../../utils/requests';


/**
 * WHEN YOU NEED HERD CALCULATIONS< JUST GET ALL HERD INFO AND RUN THROUGH THE CALC FUNTION.
 * 
 * 
 * 
 * Need to save herd calculations.
 * 
 * 1. Create herd calc table
 *    - SQL
 *    - Add create table to the button when creating a new table for a dairy
 * 2. Follow same pattern as herds
 *    - use empty object for init state
 *    - If no keys, do not disaply View Component
 *    - Fetch from DB and update State
 * 
 * 3. When clicking update herds
 *    -Currently, this updates an object holding updates.....
 *    -Once the update is done, the app fetches all herds again, passing through to the calc function, and setting state for the calcs
 *    - To update the calcs as well, 
 * 
 * When
 */

const BASE_URL = "http://localhost:3001"

const REPORTING_PERIOD = 365


class HerdTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      herds: props.herds,
      herdCalc: { 
        milk_cows: [0, 0, 0, 0, 0],
        dry_cows:  [0, 0, 0, 0, 0],
        bred_cows: [0, 0, 0],
        cows:      [0, 0, 0],
        calf_young: [0, 0, 0],
        calf_old:   [0 ,0, 0],
        totals:    [0 ,0 ,0 ,0 ,0]
      }
    }
  }
  static getDerivedStateFromProps(props, state) {

    return state
  }
  componentDidMount() {
    this.getHerds()
  }
  getHerds() {
    get(`${BASE_URL}/api/herds/${this.state.dairy.pk}`)
      .then(res => {
        // console.log(res)
        if (res.test) {
          return;
        }
        this.setState({
          herds: res[0], initHerdLoad: true 
        },
        () => {
            this.calcHerd()
        })
      })
      .catch(err => {
        console.log(err)
      })
  }
  onChange(ev) {
    const {name, value } = ev.target
    let [ cowType, index ] = name.split("~")
    // console.log(cowType, index, value)
    let herds = this.state.herds
    herds[cowType][index] = value
    this.setState({herds: herds})
  }
  createHerds() {
    // console.log(this.state.dairy)
    post(`${BASE_URL}/api/herds/create`, { dairy_id: this.state.dairy.pk })
      .then(res => {
        // console.log(res)
        this.getHerds()
      })
      .catch(err => {
        console.log(err)
      })
  }

  updateHerds(){
    // console.log("Updating Herds", this.state.herds)
    post(`${BASE_URL}/api/herds/update`, this.state.herds)
    .then(res => {
      // console.log(res)
      this.calcHerd()
      // this.getHerds()
    })
    .catch(err => {
      console.log(err)
    })
  }

  

  calcHerd(){
    // Extracts the state obj
    // Uses the extracted state obj for data to do the calculations
    // calculations produce and array of information where the order is important
    //      - calculation list order corresponds to the field it is display, UI uses the index pos to fetch the correct data point
    // Each array corresponds to a Column in the UI
    //    - This column has a key: milk_cows, dry_cows_bred_cows, etc...
    // The Calc function should just return the extracted & updated state obj
    // Then the calling function can use the returned object as they need.
    let _herdCalc = calculateHerdManNKPNaCl(this.state.herds)
    this.setState({herdCalc: _herdCalc})
  }

  render() {
    return (
      <Grid item container spacing={2} xs={12} style={{marginTop: "16px"}}>
         <Grid item xs={12}>
          <Typography variant="h2">
            Dairy Herd Input
          </Typography>
        </Grid>
      {
        Object.keys(this.state.herds).length > 0 ?
          <React.Fragment>
            <Grid item container style={{ borderLeft: "1px solid white", borderBottom: "1px solid chartreuse" }} xs={6} spacing={1} justifyContent="space-between" key="Milk Cow Col/ data row" >
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Milk Cowz
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name='milk_cows~5'
                  value={this.state.herds.milk_cows[5]}
                  onChange={this.onChange.bind(this)}
                  label="Avg milk production (lbs/cow/day)"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='milk_cows~0'
                  value={this.state.herds.milk_cows[0]}
                  onChange={this.onChange.bind(this)}
                  label="Open confinement"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='milk_cows~1'
                  value={this.state.herds.milk_cows[1]}
                  onChange={this.onChange.bind(this)}
                  label="Under roof"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='milk_cows~2'
                  value={this.state.herds.milk_cows[2]}
                  onChange={this.onChange.bind(this)}
                  label="Max number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='milk_cows~3'
                  value={this.state.herds.milk_cows[3]}
                  onChange={this.onChange.bind(this)}
                  label="Avg number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='milk_cows~4'
                  value={this.state.herds.milk_cows[4]}
                  onChange={this.onChange.bind(this)}
                  label="Avg live wt (lbs)"
                  style={{ width: "100%" }}
                />
              </Grid>
            </Grid>
            <Grid item container style={{ borderLeft: "1px solid white", borderBottom: "1px solid #56c6ff" }} xs={6} spacing={1} justifyContent="space-between" key="Bred cow">
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Bred Heifers (15-24mo)
                </Typography>

              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='bred_cows~0'
                  value={this.state.herds.bred_cows[0]}
                  onChange={this.onChange.bind(this)}
                  label="Open confinement"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='bred_cows~1'
                  value={this.state.herds.bred_cows[1]}
                  onChange={this.onChange.bind(this)}
                  label="Under roof"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='bred_cows~2'
                  value={this.state.herds.bred_cows[2]}
                  onChange={this.onChange.bind(this)}
                  label="Max number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='bred_cows~3'
                  value={this.state.herds.bred_cows[3]}
                  onChange={this.onChange.bind(this)}
                  label="Avg number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='bred_cows~4'
                  value={this.state.herds.bred_cows[4]}
                  onChange={this.onChange.bind(this)}
                  label="Avg live wt (lbs)"
                  style={{ width: "100%" }}
                />
              </Grid>
            </Grid>

            <Grid item container style={{ borderLeft: "1px solid white", borderBottom: "1px solid chartreuse" }} xs={6} spacing={1} justifyContent="space-between" key="Dry cow">
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Dry Cowz
                </Typography>

              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='dry_cows~0'
                  value={this.state.herds.dry_cows[0]}
                  onChange={this.onChange.bind(this)}
                  label="Open confinement"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='dry_cows~1'
                  value={this.state.herds.dry_cows[1]}
                  onChange={this.onChange.bind(this)}
                  label="Under roof"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='dry_cows~2'
                  value={this.state.herds.dry_cows[2]}
                  onChange={this.onChange.bind(this)}
                  label="Max number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='dry_cows~3'
                  value={this.state.herds.dry_cows[3]}
                  onChange={this.onChange.bind(this)}
                  label="Avg number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='dry_cows~4'
                  value={this.state.herds.dry_cows[4]}
                  onChange={this.onChange.bind(this)}
                  label="Avg live wt (lbs)"
                  style={{ width: "100%" }}
                />
              </Grid>
            </Grid>
            <Grid item container style={{ borderLeft: "1px solid white", borderBottom: "1px solid #56c6ff" }} xs={6} spacing={1} justifyContent="space-between" key="Calf young">
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Calves (0-3mo)
                </Typography>

              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='calf_young~0'
                  value={this.state.herds.calf_young[0]}
                  onChange={this.onChange.bind(this)}
                  label="Open confinement"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='calf_young~1'
                  value={this.state.herds.calf_young[1]}
                  onChange={this.onChange.bind(this)}
                  label="Under roof"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='calf_young~2'
                  value={this.state.herds.calf_young[2]}
                  onChange={this.onChange.bind(this)}
                  label="Max number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='calf_young~3'
                  value={this.state.herds.calf_young[3]}
                  onChange={this.onChange.bind(this)}
                  label="Avg number"
                  style={{ width: "100%" }}
                />
              </Grid>
            </Grid>

            <Grid item container style={{ borderLeft: "1px solid white", borderBottom: "1px solid chartreuse" }} xs={6} spacing={1} justifyContent="space-between" key="Cow">
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Heifers (7-14mo to breeding)
                </Typography>

              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='cows~0'
                  value={this.state.herds.cows[0]}
                  onChange={this.onChange.bind(this)}
                  label="Open confinement"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='cows~1'
                  value={this.state.herds.cows[1]}
                  onChange={this.onChange.bind(this)}
                  label="Under roof"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='cows~2'
                  value={this.state.herds.cows[2]}
                  onChange={this.onChange.bind(this)}
                  label="Max number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='cows~3'
                  value={this.state.herds.cows[3]}
                  onChange={this.onChange.bind(this)}
                  label="Avg number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='cows~4'
                  value={this.state.herds.cows[4]}
                  onChange={this.onChange.bind(this)}
                  label="Avg live wt (lbs)"
                  style={{ width: "100%" }}
                />
              </Grid>
            </Grid>
            <Grid item container style={{ borderLeft: "1px solid white", borderBottom: "1px solid #56c6ff" }} xs={6} spacing={1} justifyContent="space-between" key="Calf old">
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Calves (4-6mo)
                </Typography>

              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='calf_old~0'
                  value={this.state.herds.calf_old[0]}
                  onChange={this.onChange.bind(this)}
                  label="Open confinement"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='calf_old~1'
                  value={this.state.herds.calf_old[1]}
                  onChange={this.onChange.bind(this)}
                  label="Under roof"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='calf_old~2'
                  value={this.state.herds.calf_old[2]}
                  onChange={this.onChange.bind(this)}
                  label="Max number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name='calf_old~3'
                  value={this.state.herds.calf_old[3]}
                  onChange={this.onChange.bind(this)}
                  label="Avg number"
                  style={{ width: "100%" }}
                />
              </Grid>
            </Grid>
            

            <Grid item  xs={12} align="left"  key="Update Herds" style={{marginTop: "16px"}}>
              <Tooltip title="Update herds">
                <Button color="primary" variant="outlined" fullWidth
                  onClick={()=>{ this.updateHerds() }}
                > 
                  <Typography variant="subtitle1">
                    Update Herds
                  </Typography>
                </Button>
              </Tooltip>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h2">
                  Output Data
                </Typography>
              </Grid>

            
            <Grid item container style={{ borderLeft: "1px solid white", borderBottom: "1px solid #ff2fbc", marginTop: "16px"}} xs={12} spacing={1} justifyContent="flex-start" key="Manure" >
              <Grid item xs={3}>
                <Typography variant="subtitle1">
                  Manure (tons/ yr)
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <TextField disabled
                  name="milk_cows_man"
                  label="Milk"
                  value={this.state.herdCalc['milk_cows'][0].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="dry_cows_man"
                  label="Dry"
                  value={this.state.herdCalc['dry_cows'][0].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="bred_cows_man"
                  label="Bred"
                  value={this.state.herdCalc['bred_cows'][0].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="cows_man"
                  label="Heifer"
                  value={this.state.herdCalc['cows'][0].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="calf_old_man"
                  label="Calf Old"
                  value={this.state.herdCalc['calf_old'][0].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="calf_young_man"
                  label="Calf Young"
                  value={this.state.herdCalc['calf_young'][0].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={3} align="right">
              <TextField disabled
                  name="total_man"
                  label="Total Manure"
                  value={this.state.herdCalc['totals'][0].toFixed(2)}
                />
              </Grid>
            </Grid>
            <Grid item container style={{ borderLeft: "1px solid white", borderBottom: "1px solid #ff2fbc" }} xs={12} spacing={1} justifyContent="flex-start" key="Nitrogen" >
              <Grid item xs={3}>
                <Typography variant="subtitle1">
                  Nitrogen (lbs/ yr)
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <TextField disabled
                  name="milk_cows_N"
                  value={this.state.herdCalc['milk_cows'][1].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="dry_cows_N"
                  value={this.state.herdCalc['dry_cows'][1].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="bred_cows_N"
                  value={this.state.herdCalc['bred_cows'][1].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="cows_N"
                  value={this.state.herdCalc['cows'][1].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="calf_old_N"
                  value={this.state.herdCalc['calf_old'][1].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="calf_young_N"
                  value={this.state.herdCalc['calf_young'][1].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={3} align="right">
              <TextField disabled
                  name="total_N"
                  label="Total N"
                  value={this.state.herdCalc['totals'][1].toFixed(2)}
                />
              </Grid>
            </Grid>
            <Grid item container style={{ borderLeft: "1px solid white", borderBottom: "1px solid #ff2fbc" }} xs={12} spacing={1} justifyContent="flex-start" key="Phosphorus" >
              <Grid item xs={3}>
                <Typography variant="subtitle1">
                  Phosphorus (lbs/ yr)
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <TextField disabled
                  name="milk_cows_P"
                  value={this.state.herdCalc['milk_cows'][2].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="dry_cows_P"
                  value={this.state.herdCalc['dry_cows'][2].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="bred_cows_P"
                  value={this.state.herdCalc['bred_cows'][2].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="cows_P"
                  value={this.state.herdCalc['cows'][2].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="calf_old_P"
                  value={this.state.herdCalc['calf_old'][2].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="calf_young_P"
                  value={this.state.herdCalc['calf_young'][2].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={3} align="right">
              <TextField disabled
                  name="total_P"
                  label="Total Phosphorus"
                  value={this.state.herdCalc['totals'][2].toFixed(2)}
                />
              </Grid>
            </Grid>
            <Grid item container style={{ borderLeft: "1px solid white", borderBottom: "1px solid #ff2fbc" }} xs={12} spacing={1} justifyContent="flex-start" key="Potassium" >
              <Grid item xs={3}>
                <Typography variant="subtitle1">
                  Potassium (lbs/ yr)
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <TextField disabled
                  name="milk_cows_K"
                  value={this.state.herdCalc['milk_cows'][3].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="dry_cows_K"
                  value={this.state.herdCalc['dry_cows'][3].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
             
              <Grid item xs={7} align="right">
              <TextField disabled
                  name="total_K"
                  label="Total Potassium"
                  value={this.state.herdCalc['totals'][3].toFixed(2)}
                  
                />
              </Grid>
            </Grid>
            <Grid item container style={{ borderLeft: "1px solid white", borderBottom: "1px solid #ff2fbc" }} xs={12} spacing={1} justifyContent="flex-start" key="Salt" >
              <Grid item xs={3}>
                <Typography variant="subtitle1">
                  Salt (lbs/ yr)
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <TextField disabled
                  name="milk_cows_nacl"
                  value={this.state.herdCalc['milk_cows'][4].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={1}>
              <TextField disabled
                  name="dry_cows_nacl"
                  value={this.state.herdCalc['dry_cows'][4].toFixed(0)}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={7} align="right">
              <TextField disabled
                  name="total_nacl"
                  label="Total Salt"
                  value={this.state.herdCalc['totals'][4].toFixed(2)}
                />
              </Grid>
            </Grid>

            
          </React.Fragment>
          :
          <Grid item xs={2}>
            <Typography title="Create new herd sheet">
              <Button variant="outlined" fullWidth color="primary"
                onClick={this.createHerds.bind(this)}
              >
                <Typography variant="h1">
                  Create New Herd Sheet
                </Typography>
              </Button>
            </Typography>
          </Grid>
      }
      </Grid>

    )
  }
}

export default HerdTable = withRouter(withTheme(HerdTable))
