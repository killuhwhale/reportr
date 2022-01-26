import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, AppBar, Tabs, Tab
} from '@material-ui/core'

import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import AppsByField from "./appsByField"
import ProcessWastewater from "./processWastewater"
import Freshwater from "./freshwater"
import Solidmanure from "./solidmanure"
import Fertilizer from "./fertilizer"
import Soil from "./soil"
import PlowdownCredit from "./plowdownCredit"
import AddFieldCropApplicationModal from "../Modals/addFieldCropApplicationModal"
import ActionCancelModal from "../Modals/actionCancelModal"

import { get, post } from '../../utils/requests';
import { TSV_INFO, PROCESS_WASTEWATER, FRESHWATER, SOLIDMANURE, FERTILIZER, WASTEWATER, SOIL, PLOWDOWN_CREDIT, } from '../../utils/TSV'
import { NUTRIENT_IMPORT_MATERIAL_TYPES, MATERIAL_TYPES } from '../../utils/constants'


const PRECIPITATIONS = [
  "No Precipitation",
  "Standing water",
  "Lightrain",
  "Steady rain",
  "Heavy rain",
  "Hail",
  "Snow",
]
const APP_METHODS = [
  'No till (plowdown credit)',
  'Plow/disc',
  'Broadcast/incorporate',
  'Shank',
  'Injection',
  'Sweep',
  'Banding',
  'Sidedress',
  'Pipeline',
  'Surface (irragation',
  'Subsurface (irragation',
  'Towed tank',
  'Towed hose',
  'Other',
]

const REPORTING_METHODS = ['dry-weight', 'as-is']
const SOURCE_OF_ANALYSES = ['Lab Analysis', 'Other/ estimated']


class NutrientApplicationTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      showAddFieldCropAppModal: false,
      fields: [],
      field_crops: {},
      fieldCropAppEvents: [],
      toggleShowDeleteAllModal: false,
      createFieldCropAppObj: {
        dairy_id: props.dairy.pk,
        app_date: new Date(),
        field_idx: 0,
        field_crop_idx: 0,
        precip_before_idx: 0,
        precip_during_idx: 0,
        precip_after_idx: 0,
      },
      parentUpdated: false,
      tabs: {
        0: "show",
        1: "hide",
        2: "hide",
        3: "hide",
        4: 'hide',
        5: 'hide',
        6: 'hide',
      },
      tabIndex: 0,
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }
  componentDidMount() {
    // I only need this if allowing the user to manually add field crop app events but deciding not to.
    // this.getFields()
    // this.getFieldCrops()
    // this.getFieldCropAppEvents()

  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.dairy.pk !== this.state.dairy.pk) {
      // I only need this if allowing the user to manually add field crop app events but deciding not to.
      // this.getFields()
      // this.getFieldCrops()
      // this.getFieldCropAppEvents()
    }
  }

  handleTabChange(ev, index) {
    let tabs = this.state.tabs
    tabs[this.state.tabIndex] = "hide"
    tabs[index] = "show"
    this.setState({ tabIndex: index, tabs: tabs })
  }

  /** Get data */
  getFieldCropAppEvents() {
    get(`${this.props.BASE_URL}/api/field_crop_app/${this.state.dairy.pk}`)
      .then(res => {
        res.sort((a, b) => {
          return `${a.fieldtitle} ${a.app_date} ${a.app_method}` > `${b.fieldtitle} ${b.app_date} ${b.app_method}` ? 1 : -1
        })

        this.setState({ fieldCropAppEvents: res })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getFields() {
    get(`${this.props.BASE_URL}/api/fields/${this.state.dairy.pk}`)
      .then(fields => {
        this.setState({ fields: fields })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getFieldCrops() {
    get(`${this.props.BASE_URL}/api/field_crop/${this.state.dairy.pk}`)
      .then(field_crops => {

        let field_crop_lists = {}
        field_crops.forEach(field_crop => {
          if (field_crop_lists[field_crop.field_id]) {
            field_crop_lists[field_crop.field_id].push(field_crop)
          } else {
            field_crop_lists[field_crop.field_id] = [field_crop]
          }
        })
        this.setState({ field_crops: field_crop_lists })
      })
  }

  /** Field Application Event
   * Field Application Event - General event w/ a application date
   * Ties Nutrient applications, like Porcess Wastewater, to a day and field it was applied. Plus how much and nutirent details.
   * Used with mulitple nutrient applcaitons
   * 
   */
  onCreateFieldCropAppChange(ev) {
    const { name, value } = ev.target
    let createFieldCropAppObj = this.state.createFieldCropAppObj
    createFieldCropAppObj[name] = value

    if (name === "field_idx") {
      createFieldCropAppObj.field_crop_idx = 0
    }
    this.setState({ createFieldCropAppObj: createFieldCropAppObj })
  }
  createFieldCropApp() {
    let createObj = this.state.createFieldCropAppObj
    let chosen_field_idx = createObj.field_idx
    let field = this.state.fields[chosen_field_idx]

    if (field) {
      let field_pk = field.pk
      let _field_crops = this.state.field_crops[field_pk]
      if (_field_crops) {
        let chosen_field_crop = _field_crops[createObj.field_crop_idx]
        if (chosen_field_crop) {
          createObj['field_crop_id'] = chosen_field_crop.pk
          createObj['precip_before'] = PRECIPITATIONS[createObj.precip_before_idx]
          createObj['precip_during'] = PRECIPITATIONS[createObj.precip_during_idx]
          createObj['precip_after'] = PRECIPITATIONS[createObj.precip_after_idx]
          createObj['app_method'] = APP_METHODS[createObj.app_method_idx]


          post(`${this.props.BASE_URL}/api/field_crop_app/create`, createObj)
            .then(res => {
              this.getFieldCropAppEvents()
              this.toggleShowAddFieldCropAppModal(false)
            })
            .catch(err => {
              console.log(err)
            })
        } else {
          console.log('Chosen field crop not valid for field or field_crops list: ', field, _field_crops)
        }
      } else {
        console.log("Field crops not found for field: ", field)
      }
    } else {
      console.log("Fields not found")
    }

  }
  toggleShowAddFieldCropAppModal(val) {
    this.setState({ showAddFieldCropAppModal: val })
  }
  confirmDeleteAllFromTable(val) {
    this.setState({ toggleShowDeleteAllModal: val })
  }
  deleteAllFromTable() {
    Promise.all([
      post(`${this.props.BASE_URL}/api/field_crop_app/deleteAll`, { dairy_id: this.state.dairy.pk }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy.pk, tsvType: TSV_INFO[FRESHWATER].tsvType }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy.pk, tsvType: TSV_INFO[PROCESS_WASTEWATER].tsvType }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy.pk, tsvType: TSV_INFO[SOLIDMANURE].tsvType }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy.pk, tsvType: TSV_INFO[FERTILIZER].tsvType }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy.pk, tsvType: TSV_INFO[SOIL].tsvType }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy.pk, tsvType: TSV_INFO[PLOWDOWN_CREDIT].tsvType }),
    ])
      .then(res => {
        this.confirmDeleteAllFromTable(false)
        this.setState({ parentUpdated: !this.state.parentUpdated }) // toggle to trigger update.
      })
      .catch(err => {
        console.log(err)
      })
  }

  render() {
    /** Gets field_crop_apps 
    * Gets field_crop_apps according to chosen field by the user in the create field crop application modal
    * Object w/ keys set to field.pk where value is the list of field_crops for that field.
    * Extract the list of field_crops for the chosen field.
     */
    let chosen_field_idx = this.state.createFieldCropAppObj.field_idx
    let field = this.state.fields[chosen_field_idx]
    let _field_crops = []
    if (field) {
      let field_pk = field.pk
      // Ensures that _field_crops isnt undefined.
      _field_crops = this.state.field_crops[field_pk] ? this.state.field_crops[field_pk] : []
    }


    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
          <Grid item xs={12} container alignItems="baseline">
            <Grid item xs={7}>
              <Typography variant="h2">Nutrient Applications</Typography>
            </Grid>

            <Grid item xs={5} align="right" >

              <Tooltip title='Delete all Nutrient Applications'>
                <IconButton onClick={() => this.confirmDeleteAllFromTable(true)}>
                  <DeleteSweepIcon color='error' />
                </IconButton>
              </Tooltip>


              {/* <Button variant="outlined" color="primary"
                onClick={() => this.toggleShowAddFieldCropAppModal(true)}>
                Create New Application Event
              </Button> */}
            </Grid>


            <AppBar position="static" style={{ marginBottom: "32px" }} key='appNutrientAppBar'>
              <Tabs value={this.state.tabIndex} variant="fullWidth" selectionFollowsFocus
                onChange={this.handleTabChange.bind(this)} aria-label="simple tabs example" key='appNutrientAppBarTabs'>
                <Tab label="Events" key='appNutrientAppBarTab00' />
                <Tab label="Process Wastewater" key='appNutrientAppBarTab0' />
                <Tab label="Fresh Water" key='appNutrientAppBarTab1' />
                <Tab label="Solid Manure" key='appNutrientAppBarTab2' />
                <Tab label="Commercial Fertilizer" key='appNutrientAppBarTab3' />
                <Tab label="Soil" key='appNutrientAppBarTab4' />
                <Tab label="Plowdown Credit" key='appNutrientAppBarTab5' />
              </Tabs>
            </AppBar>

            {

              this.state.tabs[0] === "show" ?
                <Grid item xs={12} style={{ marginTop: "30px" }} key='appNutrientAppBarTab0'>
                  <AppsByField
                    dairy_id={this.state.dairy.pk}
                    parentUpdated={this.state.parentUpdated}
                    tsvType={TSV_INFO[PROCESS_WASTEWATER].tsvType}
                    numCols={TSV_INFO[PROCESS_WASTEWATER].numCols}
                    BASE_URL={this.props.BASE_URL}
                    onAlert={this.props.onAlert}
                  />
                </Grid>

                :
                this.state.tabs[0] === "show" ?
                  <Grid item xs={12} style={{ marginTop: "30px" }} key='appNutrientAppBarTab0'>
                    <ProcessWastewater
                      dairy_id={this.state.dairy.pk}
                      parentUpdated={this.state.parentUpdated}
                      tsvType={TSV_INFO[PROCESS_WASTEWATER].tsvType}
                      numCols={TSV_INFO[PROCESS_WASTEWATER].numCols}
                      BASE_URL={this.props.BASE_URL}
                      onAlert={this.props.onAlert}
                    />
                  </Grid>

                  : this.state.tabs[1] === "show" ?
                    <Grid item xs={12} style={{ marginTop: "30px" }} key='appNutrientAppBarTab1'>
                      <Freshwater
                        dairy_id={this.state.dairy.pk}
                        parentUpdated={this.state.parentUpdated}
                        tsvType={TSV_INFO[FRESHWATER].tsvType}
                        numCols={TSV_INFO[FRESHWATER].numCols}
                        onAlert={this.props.onAlert}
                        BASE_URL={this.props.BASE_URL}
                      />

                    </Grid>

                    : this.state.tabs[2] === "show" ?
                      <Grid item xs={12} style={{ marginTop: "30px" }} key='appNutrientAppBarTab2'>

                        <Solidmanure
                          dairy_id={this.state.dairy.pk}
                          parentUpdated={this.state.parentUpdated}
                          tsvType={TSV_INFO[SOLIDMANURE].tsvType}
                          numCols={TSV_INFO[SOLIDMANURE].numCols}
                          MATERIAL_TYPES={MATERIAL_TYPES}
                          SOURCE_OF_ANALYSES={SOURCE_OF_ANALYSES}
                          REPORTING_METHODS={REPORTING_METHODS}
                          onAlert={this.props.onAlert}
                          BASE_URL={this.props.BASE_URL}
                        />

                      </Grid>

                      : this.state.tabs[3] === "show" ?
                        <Grid item xs={12} style={{ marginTop: "30px" }} key='appNutrientAppBarTab3'>
                          <Fertilizer
                            dairy_id={this.state.dairy.pk}
                            parentUpdated={this.state.parentUpdated}
                            tsvType={TSV_INFO[FERTILIZER].tsvType}
                            numCols={TSV_INFO[FERTILIZER].numCols}
                            NUTRIENT_IMPORT_MATERIAL_TYPES={NUTRIENT_IMPORT_MATERIAL_TYPES}
                            REPORTING_METHODS={REPORTING_METHODS}
                            onAlert={this.props.onAlert}
                            BASE_URL={this.props.BASE_URL}
                          />
                        </Grid>

                        : this.state.tabs[4] === "show" ?
                          <Grid item xs={12} style={{ marginTop: "30px" }} key='appNutrientAppBarTab4'>
                            <Soil
                              dairy_id={this.state.dairy.pk}
                              parentUpdated={this.state.parentUpdated}
                              tsvType={TSV_INFO[SOIL].tsvType}
                              numCols={TSV_INFO[SOIL].numCols}
                              onAlert={this.props.onAlert}
                              BASE_URL={this.props.BASE_URL}
                            />
                          </Grid>
                          : this.state.tabs[5] === 'show' ?
                            <Grid item xs={12} style={{ marginTop: "30px" }} key='appNutrientAppBarTab5'>
                              <PlowdownCredit
                                dairy_id={this.state.dairy.pk}
                                parentUpdated={this.state.parentUpdated}
                                tsvType={TSV_INFO[PLOWDOWN_CREDIT].tsvType}
                                numCols={TSV_INFO[PLOWDOWN_CREDIT].numCols}
                                onAlert={this.props.onAlert}
                                BASE_URL={this.props.BASE_URL}
                              />
                            </Grid>
                            : <React.Fragment></React.Fragment>
            }
            <AddFieldCropApplicationModal
              open={this.state.showAddFieldCropAppModal}
              actionText="Add"
              cancelText="Cancel"
              modalText={`Select Field, Planted Crop, and Application Date precip...`}
              fields={this.state.fields}
              // an object holds lists of field_crops by the fields pk
              field_crops={_field_crops}
              createFieldCropAppObj={this.state.createFieldCropAppObj}
              PRECIPITATIONS={PRECIPITATIONS}
              APP_METHODS={APP_METHODS}
              onAction={this.createFieldCropApp.bind(this)}
              onChange={this.onCreateFieldCropAppChange.bind(this)}
              onClose={() => this.toggleShowAddFieldCropAppModal(false)}
              BASE_URL={this.props.BASE_URL}
            />

            <ActionCancelModal
              open={this.state.toggleShowDeleteAllModal}
              actionText="Delete all"
              cancelText="Cancel"
              modalText={`Delete All Nutrient Application Events for ${this.state.dairy.title}?`}
              onAction={this.deleteAllFromTable.bind(this)}
              onClose={() => this.confirmDeleteAllFromTable(false)}
            />
          </Grid>
          :
          <React.Fragment>
            <Grid item xs={12}>
              <Typography>No dairy selected or no fields created/ crops planted.</Typography>
            </Grid>
          </React.Fragment>
        }

      </React.Fragment>
    )
  }
}

export default NutrientApplicationTab = withRouter(withTheme(NutrientApplicationTab))
