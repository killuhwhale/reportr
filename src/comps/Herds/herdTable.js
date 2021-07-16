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

const LBS_PER_KG = 2.20462262
const KG_PER_LB = 0.45359237

const KG_PER_G = 0.001;
const NITROGEN_EXCRETION_DRY_COW = 0.5;
const NITROGEN_EXCRETION_HEIFER = 0.26;
const NITROGEN_EXCRETION_CALF = 0.14;

const PHOSPHORUS_EXCRETION_DRY_COW = 0.066;
const PHOSPHORUS_EXCRETION_HEIFER = 0.044;
const PHOSPHORUS_EXCRETION_CALF = 0.0099;

const POTASSIUM_EXCRETION_DRY_COW = 0.33;

const INORGANIC_SALT_EXCRETION_MILK_COW = 1.29;
const INORGANIC_SALT_EXCRETION_DRY_COW = 0.63;



let r = (num) => {
  return Math.round(num)
}

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
        console.log(res)
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
    console.log(cowType, index, value)
    let herds = this.state.herds
    herds[cowType][index] = value
    this.setState({herds: herds})
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

  updateHerds(){
    console.log("Updating Herds", this.state.herds)
    post(`${BASE_URL}/api/herds/update`, this.state.herds)
    .then(res => {
      console.log(res)
      this.calcHerd()
      // this.getHerds()
    })
    .catch(err => {
      console.log(err)
    })
  }

  calcHerd(){
    let _herdCalc = this.state.herdCalc
    let amtAvgMilkProduction = this.state.herds.milk_cows[5]
    let milk = amtAvgMilkProduction * KG_PER_LB;
    
    let amtAvgMilkCowCount = this.state.herds.milk_cows[3]
    let lblHerdManurePerYearMilkCow = ((milk * 0.647) + 43.212) * LBS_PER_KG * amtAvgMilkCowCount * 365;
    let tonsHerdManurePerYearMilkCow = lblHerdManurePerYearMilkCow / 2000;
    let lblHerdNPerYearMilkCow = amtAvgMilkCowCount * ((milk * 4.204) + 283.3) * KG_PER_G * LBS_PER_KG * 365;
    let lblHerdPPerYearMilkCow = amtAvgMilkCowCount * ((milk * 0.773) + 46.015) * KG_PER_G * LBS_PER_KG * 365;
    let lblHerdKPerYearMilkCow = amtAvgMilkCowCount * ((milk * 1.800) + 31.154) * KG_PER_G * LBS_PER_KG * 365;
    let lblHerdSaltPerYearMilkCow = amtAvgMilkCowCount * INORGANIC_SALT_EXCRETION_MILK_COW * 365;
    let milk_cows = [
      tonsHerdManurePerYearMilkCow, lblHerdNPerYearMilkCow,
      lblHerdPPerYearMilkCow, lblHerdKPerYearMilkCow, lblHerdSaltPerYearMilkCow
    ]
    _herdCalc['milk_cows'] = milk_cows



    let amtAvgDryCowCount = this.state.herds.dry_cows[3]
    let amtDryCowAvgWeight = this.state.herds.dry_cows[4]
    let lblHerdManurePerYearDryCow = (((amtDryCowAvgWeight / LBS_PER_KG) * 0.022) + 21.844) * LBS_PER_KG * amtAvgDryCowCount * 365;
    let tonsHerdManurePerYearDryCow = lblHerdManurePerYearDryCow / 2000;
    let lblHerdNPerYearDryCow = amtAvgDryCowCount * NITROGEN_EXCRETION_DRY_COW * 365;
    let lblHerdPPerYearDryCow = amtAvgDryCowCount * PHOSPHORUS_EXCRETION_DRY_COW * 365;
    let lblHerdKPerYearDryCow = amtAvgDryCowCount * POTASSIUM_EXCRETION_DRY_COW * 365;
    let lblHerdSaltPerYearDryCow = amtAvgDryCowCount * INORGANIC_SALT_EXCRETION_DRY_COW * 365;
    let dry_cows = [
      tonsHerdManurePerYearDryCow, lblHerdNPerYearDryCow, lblHerdPPerYearDryCow, 
      lblHerdKPerYearDryCow, lblHerdSaltPerYearDryCow
    ]
   console.log("Dry Cowszzzzzzzzzzzzz", dry_cows)
    _herdCalc['dry_cows'] = dry_cows
    
    let amtAvgHeifer15To24Count = this.state.herds.bred_cows[3]
    let amtHeifer15To24AvgWeight = this.state.herds.bred_cows[4]
    let lblHerdManurePerYearHeifer15To24 = (((amtHeifer15To24AvgWeight / LBS_PER_KG) * 0.018) + 17.817) * LBS_PER_KG * amtAvgHeifer15To24Count * 365;
    let tonsHerdManurePerYearHeifer15To24 = lblHerdManurePerYearHeifer15To24 / 2000;
    let lblHerdNPerYearHeifer15To24 = amtAvgHeifer15To24Count * NITROGEN_EXCRETION_HEIFER * 365;
    let lblHerdPPerYearHeifer15To24 = amtAvgHeifer15To24Count * PHOSPHORUS_EXCRETION_HEIFER * 365;

    let bred_cows = [
      tonsHerdManurePerYearHeifer15To24, lblHerdNPerYearHeifer15To24, lblHerdPPerYearHeifer15To24
    ]
    _herdCalc['bred_cows'] = bred_cows

    
    let amtAvgHeifer7To14Count = this.state.herds.cows[3]
    let amtHeifer7To14AvgWeight = this.state.herds.cows[4]
    let lblHerdManurePerYearHeifer7To14 = (((amtHeifer7To14AvgWeight / LBS_PER_KG) * 0.018) + 17.817) * LBS_PER_KG * amtAvgHeifer7To14Count * 365;
    let tonsHerdManurePerYearHeifer7To14 = lblHerdManurePerYearHeifer7To14 / 2000;
    let lblHerdNPerYearHeifer7To14 = amtAvgHeifer7To14Count * NITROGEN_EXCRETION_HEIFER * 365;
    let lblHerdPPerYearHeifer7To14 = amtAvgHeifer7To14Count * PHOSPHORUS_EXCRETION_HEIFER * 365;

    let cows = [
      tonsHerdManurePerYearHeifer7To14, lblHerdNPerYearHeifer7To14, lblHerdPPerYearHeifer7To14
    ]
    _herdCalc['cows'] = cows

    let amtAvgCalf4To6Count = this.state.herds.calf_old[3]
    let lblHerdManurePerYearCalf4To6 = 19 * amtAvgCalf4To6Count * 365;
    let tonsHerdManurePerYearCalf4To6 = lblHerdManurePerYearCalf4To6 /2000;
    let lblHerdNPerYearCalf4To6 = amtAvgCalf4To6Count * NITROGEN_EXCRETION_CALF * 365;
    let lblHerdPPerYearCalf4To6 = amtAvgCalf4To6Count * PHOSPHORUS_EXCRETION_CALF * 365;
    let calf_old = [
      tonsHerdManurePerYearCalf4To6, lblHerdNPerYearCalf4To6, lblHerdPPerYearCalf4To6
    ]
    _herdCalc['calf_old'] = calf_old


    let amtAvgCalfTo3Count = this.state.herds.calf_young[3]
    let lblHerdManurePerYearCalfTo3 = 19 * amtAvgCalfTo3Count * 365;
    let tonsHerdManurePerYearCalfTo3 = lblHerdManurePerYearCalfTo3 / 2000;
    let lblHerdNPerYearCalfTo3 = amtAvgCalfTo3Count * NITROGEN_EXCRETION_CALF * 365;
    let lblHerdPPerYearCalfTo3 = amtAvgCalfTo3Count * PHOSPHORUS_EXCRETION_CALF * 365;
    let calf_young= [
      tonsHerdManurePerYearCalfTo3, lblHerdNPerYearCalfTo3, lblHerdPPerYearCalfTo3
    ]
    _herdCalc['calf_young'] = calf_young



    let lblHerdManurePerYearTotal = lblHerdManurePerYearMilkCow + lblHerdManurePerYearDryCow + lblHerdManurePerYearHeifer15To24 + lblHerdManurePerYearHeifer7To14 + lblHerdManurePerYearCalf4To6 + lblHerdManurePerYearCalfTo3;
    let tonsHerdManurePerYearTotal = lblHerdManurePerYearTotal / 2000;
    let lblHerdNPerYearTotal = lblHerdNPerYearMilkCow + lblHerdNPerYearDryCow + lblHerdNPerYearHeifer15To24 + lblHerdNPerYearHeifer7To14 + lblHerdNPerYearCalf4To6 + lblHerdNPerYearCalfTo3;
    let lblHerdPPerYearTotal = lblHerdPPerYearMilkCow + lblHerdPPerYearDryCow + lblHerdPPerYearHeifer15To24 + lblHerdPPerYearHeifer7To14 + lblHerdPPerYearCalf4To6 + lblHerdPPerYearCalfTo3;
    let lblHerdKPerYearTotal = lblHerdKPerYearMilkCow + lblHerdKPerYearDryCow;
    let lblHerdSaltPerYearTotal = lblHerdSaltPerYearMilkCow + lblHerdSaltPerYearDryCow;

    let totals = [
      tonsHerdManurePerYearTotal, lblHerdNPerYearTotal, lblHerdPPerYearTotal, lblHerdKPerYearTotal, lblHerdSaltPerYearTotal
    ]
    _herdCalc['totals'] = totals



    this.setState({herdCalc: _herdCalc})
  }

  render() {
    console.log( Object.keys(this.state.herds).length, this.state.herds )
    return (
      <Grid item container spacing={2} xs={12} style={{marginTop: "16px"}}>
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
            

            <Grid item  xs={12} align="left" spacing={1} key="Update Herds" style={{marginTop: "16px"}}>
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
                  value={this.state.herdCalc['totals'][0].toFixed(0)}
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
                  value={this.state.herdCalc['totals'][1].toFixed(0)}
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
                  value={this.state.herdCalc['totals'][2].toFixed(0)}
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
                  value={this.state.herdCalc['totals'][3].toFixed(0)}
                  
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
                  value={this.state.herdCalc['totals'][4].toFixed(0)}
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
