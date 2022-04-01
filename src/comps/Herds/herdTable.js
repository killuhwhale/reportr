import React, { Component } from 'react'
import {
  Grid, Button, Typography, IconButton, Tooltip, TextField, InputAdornment
} from '@material-ui/core'
import CancelIcon from '@material-ui/icons/Cancel';
import { getReportingPeriodDays } from "../../utils/herdCalculation"
import calculateHerdManNKPNaCl from "../../utils/herdCalculation"
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';
import { get, post } from '../../utils/requests';
import { ImportExport } from '@material-ui/icons';


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



const REPORTING_PERIOD = 365


class HerdTable extends Component {
  constructor(props) {
    super(props)
    this.nonDigitRE = /\D/ // Search for non digit char

    this.state = {
      dairy: props.dairy,
      hasHerds: false,
      herds: {
        bred_cows: [0, 0, 0, 0, 0],
        calf_old: [0, 0, 0, 0],
        calf_young: [0, 0, 0, 0],
        cows: [0, 0, 0, 0, 0],
        dry_cows: [0, 0, 0, 0, 0],
        milk_cows: [0, 0, 0, 0, 0, 0],
        p_breed: "Ayrshire",
        p_breed_other: "",
      },
      herdCalc: {
        milk_cows: [0, 0, 0, 0, 0],
        dry_cows: [0, 0, 0, 0, 0],
        bred_cows: [0, 0, 0],
        cows: [0, 0, 0],
        calf_young: [0, 0, 0],
        calf_old: [0, 0, 0],
        totals: [0, 0, 0, 0, 0]
      },
      displayNames: {
        milk_cows: 'Milk cows',
        dry_cows: 'Dry cows',
        bred_cows: 'Bred heifers',
        cows: 'Heifers',
        calf_young: 'Calves (4-6mo)',
        calf_old: 'Calves (0-3mo)',
        totals: 'Totals'
      },
      avgMilkProdError: false, // Must be at least 1
      maxNumErrors: {                 // open con + under roof <= max number, 
        milk_cows: false,
        dry_cows: false,
        bred_cows: false,
        cows: false,
        calf_young: false,
        calf_old: false
      },
      liveWtErrors: {                 // Live weight between 1 & 5000
        milk_cows: false,
        dry_cows: false,
        bred_cows: false,
        cows: false,
        calf_young: false,
        calf_old: false
      },
      avgMaxNumErrors: {
        milk_cows: false,
        dry_cows: false,
        bred_cows: false,
        cows: false,
        calf_young: false,
        calf_old: false
      }
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props.dairy.pk === state.dairy.pk ? state : props
  }
  componentDidMount() {
    this.getHerds()
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.dairy.pk !== this.state.dairy.pk) {
      this.getHerds()
    }
  }
  getHerds() {
    get(`${this.props.BASE_URL}/api/herds/${this.state.dairy.pk}`)
      .then(([herdInfo]) => {
        if (!herdInfo) {
          return;
        }
        if (Object.keys(herdInfo).length && !herdInfo.error) {
          this.setState({ herds: herdInfo, hasHerds: true }, () => {
            this.calcHerd()
          })
        } else {
          this.setState({ hasHerds: false })
        }
      })
      .catch(err => {
        this.setState({ hasHerds: false })
        console.log(err)
      })
  }

  validate() {
    // Validate herd input
    // Sum of num under roof and open confinement must be <= maxium number
    if (!this.state.herds || Object.keys(this.state.herds).length <= 1) {
      console.log("Error, herdInfo not found.")
      return false
    }
    const keys = Object.keys(this.state.herds).sort()
    let maxNumErrors = {
      milk_cows: false,
      dry_cows: false,
      bred_cows: false,
      cows: false,
      calf_young: false,
      calf_old: false
    }
    let liveWtErrors = {
      milk_cows: false,
      dry_cows: false,
      bred_cows: false,
      cows: false,
      calf_young: false,
      calf_old: false
    }
    let avgMaxNumErrors = {
      milk_cows: false,
      dry_cows: false,
      bred_cows: false,
      cows: false,
      calf_young: false,
      calf_old: false
    }

    let valid = true
    keys.forEach((key, i) => {
      if (key !== 'dairy_id' && key !== 'pk' && key !== 'p_breed' && key !== 'p_breed_other') {
        const row = this.state.herds[key]
        console.log(row)
        console.log(key, row[0], row[1], row[2])
        if (row[0] + row[1] > row[2]) {
          this.props.onAlert(`Check ${this.state.displayNames[key]}, Number Open Confinement + Number Under Roof must be equal to or below Max Number.`)
          console.log("Error, max number exceeded", this.state.displayNames[key])
          valid = false
          maxNumErrors[key] = true
        }

        if (row[3] > row[2]) {
          this.props.onAlert(`Check ${this.state.displayNames[key]}, Avg number must be lower than max number.`)
          console.log("Error, max number exceeded by average number", this.state.displayNames[key])
          valid = false
          avgMaxNumErrors[key] = true
        }


        if (key !== 'calf_old' && key !== 'calf_young') {
          if (row[2] > 0 && row[4] <= 0 || row[4] > 5000) {
            this.props.onAlert(`Check ${this.state.displayNames[key]}, Avg Live Wt must be between 1-5000.`)
            console.log("Error, Avg Wt must be between 1-5000", this.state.displayNames[key])
            valid = false
            liveWtErrors[key] = true

          }
        }
      }
    })
    this.setState({ maxNumErrors: maxNumErrors, liveWtErrors: liveWtErrors, avgMaxNumErrors: avgMaxNumErrors })

    return valid
  }
  onChange(ev) {
    const { name, value } = ev.target
    let [cowType, index] = name.split("~")
    let herds = this.state.herds
    if (this.nonDigitRE.test(value)) {
      // Tests for a match
      console.log("Non digit char entered")
      return
    }
    herds[cowType][index] = isNaN(value) || value === '' ? 0 : parseInt(value)
    this.setState({ herds: herds })
  }

  onPrimaryBreedChange(ev) {
    const { name, value } = ev.target
    const herds = this.state.herds
    herds[name] = value
    this.setState({ herds })
  }

  createHerds() {
    // console.log(this.state.dairy)
    post(`${this.props.BASE_URL}/api/herds/create`, { dairy_id: this.state.dairy.pk })
      .then(res => {
        // console.log(res)
        this.getHerds()
      })
      .catch(err => {
        console.log(err)
      })
  }

  updateHerds() {
    // console.log("Updating Herds", this.state.herds)
    if (this.validate()) {
      const herds = this.state.herds
      herds.p_breed = herds.p_breed.length > 0 ? herds.p_breed : this.props.BREEDS[0]

      post(`${this.props.BASE_URL}/api/herds/update`, { ...this.state.herds, dairy_id: this.state.dairy.pk })
        .then(res => {
          // console.log(res)
          this.calcHerd()
          // this.getHerds()
          this.props.onAlert('Updated!', 'success')
        })
        .catch(err => {
          console.log(err)
          this.props.onAlert('Failed to update herds!', 'error')
        })
    }
  }

  calcHerd() {
    // Extracts the state obj
    // Uses the extracted state obj for data to do the calculations
    // calculations produce and array of information where the order is important
    //      - calculation list order corresponds to the field it is display, UI uses the index pos to fetch the correct data point
    // Each array corresponds to a Column in the UI
    //    - This column has a key: milk_cows, dry_cows_bred_cows, etc...
    // The Calc function should just return the extracted & updated state obj
    // Then the calling function can use the returned object as they need.\

    getReportingPeriodDays(this.props.BASE_URL, this.state.dairy.pk)
      .then(rpDays => {
        if (this.state.herds) {
          let _herdCalc = calculateHerdManNKPNaCl(this.state.herds, rpDays)
          this.setState({ herdCalc: _herdCalc })
        }
      })
  }

  render() {
    return (
      <Grid item container spacing={2} xs={12} style={{ marginTop: "16px" }}>
        <Grid item container alignItems="center" xs={12}>
          <Grid item xs={5}>
            <Typography variant="h3" color='primary'>
              Dairy Herd Input
            </Typography>
          </Grid>
          <Grid item xs={7} align='left'>
            <Tooltip title="Update herds">
              <IconButton color="primary" variant="outlined"
                onClick={() => { this.updateHerds() }}
              >
                <ImportExport />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        {
          this.state.herds && this.state.hasHerds ?
            <React.Fragment>
              <Grid item container xs={6} key="Milk Cow Col/ data row" >
                <Grid item xs={12}>
                  <Typography variant="h5" color='primary'>
                    Milk Cowz
                  </Typography>
                </Grid>
                <Grid item xs={5} style={{ marginBottom: '8px' }}>
                  <TextField
                    name='milk_cows~5'
                    value={this.state.herds.milk_cows[5]}
                    onChange={this.onChange.bind(this)}
                    label="Avg milk production (lbs/cow/day)"
                    style={{ width: "95%" }}
                  />
                </Grid>

                <Grid item xs={5} style={{ marginBottom: '8px' }}>
                  {this.state.herds && this.state.herds.p_breed !== 'Other' ?
                    <TextField select
                      label="Primary Breed"
                      value={
                        Math.max(0, this.props.BREEDS.indexOf(this.state.herds.p_breed))
                      }
                      onChange={(ev) => {
                        this.onPrimaryBreedChange({ target: { name: 'p_breed', value: this.props.BREEDS[ev.target.value] } })
                      }}
                      style={{ width: "100%" }}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      {this.props.BREEDS.map((el, i) => {
                        return (
                          <option key={`breeds${i}`} value={i}>{el}</option>
                        )
                      })}
                    </TextField>
                    :
                    <TextField
                      name='p_breed_other'
                      value={this.state.herds.p_breed_other}
                      onChange={(ev) => {
                        this.onPrimaryBreedChange({ target: { name: 'p_breed_other', value: ev.target.value } })
                      }}
                      label="Other"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <Tooltip title='Show options'>
                              <IconButton
                                onClick={() => this.onPrimaryBreedChange({ target: { name: 'p_breed', value: this.props.BREEDS[0] } })}
                              >
                                <CancelIcon color='secondary' />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                      style={{ width: "100%" }}
                    />}
                </Grid>

                <Grid item xs={2}> </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='milk_cows~0'
                    value={this.state.herds.milk_cows[0]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['milk_cows']}
                    label="Open confinement"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='milk_cows~1'
                    value={this.state.herds.milk_cows[1]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['milk_cows']}
                    label="Under roof"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='milk_cows~2'
                    value={this.state.herds.milk_cows[2]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['milk_cows']}
                    label="Max number"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='milk_cows~3'
                    value={this.state.herds.milk_cows[3]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.avgMaxNumErrors['milk_cows']}
                    label="Avg number"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='milk_cows~4'
                    value={this.state.herds.milk_cows[4]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.liveWtErrors['milk_cows']}
                    label="Avg live wt (lbs)"
                    style={{ width: "100%" }}
                  />
                </Grid>
              </Grid>

              <Grid item container xs={6} key="Bred cow">
                <Grid item xs={12}>
                  <Typography variant="h5" color='primary'>
                    Bred Heifers (15-24mo)
                  </Typography>

                </Grid>

                <Grid item container alignContent='flex-end' xs={12}>
                  <Grid item xs={2}>
                    <TextField
                      name='bred_cows~0'
                      value={this.state.herds.bred_cows[0]}
                      onChange={this.onChange.bind(this)}
                      error={this.state.maxNumErrors['bred_cows']}
                      label="Open confinement"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      name='bred_cows~1'
                      value={this.state.herds.bred_cows[1]}
                      onChange={this.onChange.bind(this)}
                      error={this.state.maxNumErrors['bred_cows']}
                      label="Under roof"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      name='bred_cows~2'
                      value={this.state.herds.bred_cows[2]}
                      onChange={this.onChange.bind(this)}
                      error={this.state.maxNumErrors['bred_cows']}
                      label="Max number"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      name='bred_cows~3'
                      value={this.state.herds.bred_cows[3]}
                      onChange={this.onChange.bind(this)}
                      error={this.state.avgMaxNumErrors['bred_cows']}
                      label="Avg number"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      name='bred_cows~4'
                      value={this.state.herds.bred_cows[4]}
                      error={this.state.liveWtErrors['bred_cows']}
                      onChange={this.onChange.bind(this)}
                      label="Avg live wt (lbs)"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                </Grid>

              </Grid>

              <Grid item container xs={6} key="Dry cow">
                <Grid item xs={12}>
                  <Typography variant="h5" color='primary'>
                    Dry Cowz
                  </Typography>

                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='dry_cows~0'
                    value={this.state.herds.dry_cows[0]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['dry_cows']}
                    label="Open confinement"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='dry_cows~1'
                    value={this.state.herds.dry_cows[1]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['dry_cows']}
                    label="Under roof"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='dry_cows~2'
                    value={this.state.herds.dry_cows[2]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['dry_cows']}
                    label="Max number"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='dry_cows~3'
                    value={this.state.herds.dry_cows[3]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.avgMaxNumErrors['dry_cows']}
                    label="Avg number"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='dry_cows~4'
                    value={this.state.herds.dry_cows[4]}
                    error={this.state.liveWtErrors['dry_cows']}
                    onChange={this.onChange.bind(this)}
                    label="Avg live wt (lbs)"
                    style={{ width: "100%" }}
                  />
                </Grid>
              </Grid>
              <Grid item container xs={6} key="Calf young">
                <Grid item xs={12}>
                  <Typography variant="h5" color='primary'>
                    Calves (0-3mo)
                  </Typography>

                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='calf_young~0'
                    value={this.state.herds.calf_young[0]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['calf_young']}
                    label="Open confinement"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='calf_young~1'
                    value={this.state.herds.calf_young[1]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['calf_young']}
                    label="Under roof"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='calf_young~2'
                    value={this.state.herds.calf_young[2]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['calf_young']}
                    label="Max number"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name='calf_young~3'
                    value={this.state.herds.calf_young[3]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.avgMaxNumErrors['calf_young']}
                    label="Avg number"
                    style={{ width: "100%" }}
                  />
                </Grid>
              </Grid>

              <Grid item container xs={6} key="Cow">
                <Grid item xs={12}>
                  <Typography variant="h5" color='primary'>
                    Heifers (7-14mo to breeding)
                  </Typography>

                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='cows~0'
                    value={this.state.herds.cows[0]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['cows']}
                    label="Open confinement"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='cows~1'
                    value={this.state.herds.cows[1]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['cows']}
                    label="Under roof"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='cows~2'
                    value={this.state.herds.cows[2]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['cows']}
                    label="Max number"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='cows~3'
                    value={this.state.herds.cows[3]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.avgMaxNumErrors['cows']}
                    label="Avg number"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='cows~4'
                    value={this.state.herds.cows[4]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.liveWtErrors['cows']}
                    label="Avg live wt (lbs)"
                    style={{ width: "100%" }}
                  />
                </Grid>
              </Grid>
              <Grid item container xs={6} key="Calf old">
                <Grid item xs={12}>
                  <Typography variant="h5" color='primary'>
                    Calves (4-6mo)
                  </Typography>

                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='calf_old~0'
                    value={this.state.herds.calf_old[0]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['calf_old']}
                    label="Open confinement"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='calf_old~1'
                    value={this.state.herds.calf_old[1]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['calf_old']}
                    label="Under roof"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='calf_old~2'
                    value={this.state.herds.calf_old[2]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.maxNumErrors['calf_old']}
                    label="Max number"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name='calf_old~3'
                    value={this.state.herds.calf_old[3]}
                    onChange={this.onChange.bind(this)}
                    error={this.state.avgMaxNumErrors['calf_old']}
                    label="Avg number"
                    style={{ width: "100%" }}
                  />
                </Grid>
              </Grid>



              <Grid item xs={12}>
                <Typography variant="h3" color='secondary'>
                  Output Data
                </Typography>
              </Grid>


              <Grid item container xs={12} spacing={1} justifyContent="flex-start" key="Manure" >
                <Grid item xs={3}>
                  <Typography variant="h6" color='secondary'>
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
              <Grid item container xs={12} spacing={1} justifyContent="flex-start" key="Nitrogen" >
                <Grid item xs={3}>
                  <Typography variant="h6" color='secondary'>
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
              <Grid item container xs={12} spacing={1} justifyContent="flex-start" key="Phosphorus" >
                <Grid item xs={3}>
                  <Typography variant="h6" color='secondary'>
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
              <Grid item container xs={12} spacing={1} justifyContent="flex-start" key="Potassium" >
                <Grid item xs={3}>
                  <Typography variant="h6" color='secondary'>
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
              <Grid item container xs={12} spacing={1} justifyContent="flex-start" key="Salt" >
                <Grid item xs={3}>
                  <Typography variant="h6" color='secondary'>
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
              <Tooltip title="Create new herd sheet">
                <Button variant="outlined" color="primary"
                  onClick={this.createHerds.bind(this)}
                >
                  <Typography variant="subtitle2">
                    Create New Herd Sheet
                  </Typography>
                </Button>
              </Tooltip>
            </Grid>
        }
      </Grid>

    )
  }
}

export default HerdTable = withRouter(withTheme(HerdTable))
