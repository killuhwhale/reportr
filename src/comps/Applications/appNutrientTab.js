import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, AppBar, Tabs, Tab
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers'
import AddIcon from '@material-ui/icons/Add'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import ProcessWastewater from "./processWastewater"
import Freshwater from "./freshwater"
import Solidmanure from "./solidmanure"
import Fertilizer from "./fertilizer"
import AddFieldCropApplicationModal from "../Modals/addFieldCropApplicationModal"
import formats from "../../utils/format"
import { get, post } from '../../utils/requests';
import { TSV_INFO, PROCESS_WASTEWATER, FRESHWATER, SOLIDMANURE, FERTILIZER, } from '../../utils/TSV'

const BASE_URL = "http://localhost:3001"
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
const MATERIAL_TYPES = ['Separator solids', 'Corral solids', "Scraped material", 'Bedding', 'Compost']

const NUTRIENT_IMPORT_MATERIAL_TYPES = ['Commercial fertilizer/ Other: Liquid commercial fertilizer', 'Commercial fertilizer/ Other: Solid commercial fertilizer', 'Commercial fertilizer/ Other: Other liquid nutrient source', 'Commercial fertilizer/ Other: Other solid nutrient source', 'Dry manure: Separator solids', 'Dry manure: Corral solids', 'Dry manure: Scraped material', 'Dry manure: Bedding', 'Dry manure: Compost', 'Process wastewater', 'Process wastewater: Process wastewater sludge']

const groupBySortBy = (list, groupBy, sortBy) => {
  let grouped = {}
  list.forEach(item => {
    let key = `${item[groupBy]}`
    if (grouped[key]) {
      grouped[key].push(item)
    } else {
      grouped[key] = [item]
    }
  })

  // Sort each list by sortBy 
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => {
      return a[sortBy] > b[sortBy] ? 1 : -1
    })
  })
  return grouped
}

class NutrientApplicationTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      showAddFieldCropAppModal: false,
      fields: [],
      field_crops: {},
      fieldCropAppEvents: [],
      fieldCropAppFreshwaterSources: [],
      fieldCropAppFreshwaterAnalyses: [],
      fieldCropAppFreshwaters: {},
      fieldCropAppSolidmanureAnalyses: [],
      fieldCropAppSolidmanures: {},
      fieldCropAppFertilizers: {},
      nutrientImports: [],
      field_crop_app_process_wastewater: {}, // obj, holds lists of process_wastewater by Field Title, then sorted by app date.
      createFieldCropAppObj: {
        dairy_id: props.dairy.pk,
        app_date: new Date(),
        field_idx: 0,
        field_crop_idx: 0,
        precip_before_idx: 0,
        precip_during_idx: 0,
        precip_after_idx: 0,
      },

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
    return props // if default props change return props | compare props.dairy == state.dairy
  }
  componentDidMount() {
    this.getFields()
    this.getFieldCrops()
    this.getFieldCropAppEvents()
    this.getFieldCropAppProcessWastewater()
    this.getFieldCropAppFreshwaterSource()
    this.getFieldCropAppFreshwaterAnalysis()
    this.getFieldCropAppFreshwater()
    this.getFieldCropAppSolidmanureAnalysis()
    this.getFieldCropAppSolidmanure()
    this.getNutrientImport()
    this.getFieldCropAppFertilizer()
  }
  handleTabChange(ev, index) {
    let tabs = this.state.tabs
    tabs[this.state.tabIndex] = "hide"
    tabs[index] = "show"
    this.setState({ tabIndex: index, tabs: tabs })
  }

  /** Get data */
  getFieldCropAppEvents() {
    get(`${BASE_URL}/api/field_crop_app/${this.state.dairy.pk}`)
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
    get(`${BASE_URL}/api/fields/${this.state.dairy.pk}`)
      .then(fields => {
        this.setState({ fields: fields })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getFieldCrops() {
    get(`${BASE_URL}/api/field_crop/${this.state.dairy.pk}`)
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

  getFieldCropAppProcessWastewater() {
    get(`${BASE_URL}/api/field_crop_app_process_wastewater/${this.state.dairy.pk}`)
      .then(res => {
        let process_wastewater_by_fieldtitle = groupBySortBy(res, 'fieldtitle', 'app_date')
        this.setState({ field_crop_app_process_wastewater: process_wastewater_by_fieldtitle })
      })
      .catch(err => {
        console.log(err)
      })
  }

  getFieldCropAppFreshwaterSource() {
    get(`${BASE_URL}/api/field_crop_app_freshwater_source/${this.state.dairy.pk}`)
      .then(res => {
        this.setState({ fieldCropAppFreshwaterSources: res })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getFieldCropAppFreshwaterAnalysis() {
    get(`${BASE_URL}/api/field_crop_app_freshwater_analysis/${this.state.dairy.pk}`)
      .then(res => {
        this.setState({ fieldCropAppFreshwaterAnalyses: res })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getFieldCropAppFreshwater() {
    get(`${BASE_URL}/api/field_crop_app_freshwater/${this.state.dairy.pk}`)
      .then(res => {
        let fieldCropAppFreshwaters = groupBySortBy(res, 'fieldtitle', 'app_date')
        this.setState({ fieldCropAppFreshwaters: fieldCropAppFreshwaters })
      })
      .catch(err => {
        console.log(err)
      })
  }

  getFieldCropAppSolidmanureAnalysis() {
    get(`${BASE_URL}/api/field_crop_app_solidmanure_analysis/${this.state.dairy.pk}`)
      .then(res => {
        this.setState({ fieldCropAppSolidmanureAnalyses: res })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getFieldCropAppSolidmanure() {
    get(`${BASE_URL}/api/field_crop_app_solidmanure/${this.state.dairy.pk}`)
      .then(res => {
        let fieldCropAppSolidmanures = groupBySortBy(res, 'fieldtitle', 'app_date')
        this.setState({ fieldCropAppSolidmanures: fieldCropAppSolidmanures })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getFieldCropAppFertilizer() {
    get(`${BASE_URL}/api/field_crop_app_fertilizer/${this.state.dairy.pk}`)
      .then(res => {
        let fieldCropAppSolidmanures = groupBySortBy(res, 'fieldtitle', 'app_date')
        this.setState({ fieldCropAppFertilizers: fieldCropAppSolidmanures })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getNutrientImport() {
    get(`${BASE_URL}/api/nutrient_import/${this.state.dairy.pk}`)
      .then(res => {

        this.setState({ nutrientImports: res })
      })
      .catch(err => {
        console.log(err)
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


          post(`${BASE_URL}/api/field_crop_app/create`, createObj)
            .then(res => {
              console.log(res)
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
              <Typography variant="h2">Nutrient Applications
                <Typography variant="subtitle1" component="span"> ({this.state.fieldCropAppEvents.length})</Typography>
              </Typography>
            </Grid>

            <Grid item xs={5} align="center" >

              <Button variant="outlined" color="primary" fullWidth
                onClick={() => this.toggleShowAddFieldCropAppModal(true)}>
                Create New Application Event
              </Button>
            </Grid>





            <AppBar position="static" style={{ marginBottom: "32px", backgroundColor: "black" }} key='appNutrientAppBar'>
              <Tabs value={this.state.tabIndex} variant="fullWidth" selectionFollowsFocus
                onChange={this.handleTabChange.bind(this)} aria-label="simple tabs example" key='appNutrientAppBarTabs'>
                <Tab label="Process Wastewater" style={{ color: "#ec00d9" }} key='appNutrientAppBarTab0' />
                <Tab label="Fresh Water" style={{ color: "#ec00d9" }} key='appNutrientAppBarTab1' />
                <Tab label="Solid Manure" style={{ color: "#ec00d9" }} key='appNutrientAppBarTab2' />
                <Tab label="Commercial Fertilizer" style={{ color: "#ec00d9" }} key='appNutrientAppBarTab3' />
              </Tabs>
            </AppBar>

            {
              this.state.tabs[0] == "show" ?
                <Grid item xs={12} style={{ marginTop: "30px" }} key='appNutrientAppBarTab0'>

                  <ProcessWastewater
                    dairy_id={this.state.dairy.pk}
                    fieldCropAppEvents={this.state.fieldCropAppEvents}
                    getFieldCropAppEvents={this.getFieldCropAppEvents.bind(this)}
                    getFieldCropAppProcessWastewater={this.getFieldCropAppProcessWastewater.bind(this)}
                    field_crop_app_process_wastewater={this.state.field_crop_app_process_wastewater}
                    tsvType={TSV_INFO[PROCESS_WASTEWATER].tsvType}
                    numCols={TSV_INFO[PROCESS_WASTEWATER].numCols}
                  />
                </Grid>

                : this.state.tabs[1] == "show" ?
                  <Grid item xs={12} style={{ marginTop: "30px" }} key='appNutrientAppBarTab1'>
                    <Freshwater
                      dairy_id={this.state.dairy.pk}
                      tsvType={TSV_INFO[FRESHWATER].tsvType}
                      numCols={TSV_INFO[FRESHWATER].numCols}
                      fieldCropAppEvents={this.state.fieldCropAppEvents}
                      fieldCropAppFreshwaterSources={this.state.fieldCropAppFreshwaterSources}
                      fieldCropAppFreshwaterAnalyses={this.state.fieldCropAppFreshwaterAnalyses}
                      fieldCropAppFreshwaters={this.state.fieldCropAppFreshwaters}
                      getFieldCropAppFreshwaterSource={this.getFieldCropAppFreshwaterSource.bind(this)}
                      getFieldCropAppFreshwaterAnalysis={this.getFieldCropAppFreshwaterAnalysis.bind(this)}
                      getFieldCropAppFreshwater={this.getFieldCropAppFreshwater.bind(this)}
                      getFieldCropAppEvents={this.getFieldCropAppEvents.bind(this)}

                    />

                  </Grid>

                  : this.state.tabs[2] == "show" ?
                    <Grid item xs={12} style={{ marginTop: "30px" }} key='appNutrientAppBarTab2'>

                      <Solidmanure
                        dairy_id={this.state.dairy.pk}
                        tsvType={TSV_INFO[SOLIDMANURE].tsvType}
                        numCols={TSV_INFO[SOLIDMANURE].numCols}
                        fieldCropAppEvents={this.state.fieldCropAppEvents}
                        fieldCropAppSolidmanureAnalyses={this.state.fieldCropAppSolidmanureAnalyses}
                        fieldCropAppSolidmanures={this.state.fieldCropAppSolidmanures}
                        MATERIAL_TYPES={MATERIAL_TYPES}
                        SOURCE_OF_ANALYSES={SOURCE_OF_ANALYSES}
                        REPORTING_METHODS={REPORTING_METHODS}
                        getFieldCropAppSolidmanureAnalysis={this.getFieldCropAppSolidmanureAnalysis.bind(this)}
                        getFieldCropAppSolidmanure={this.getFieldCropAppSolidmanure.bind(this)}
                        getFieldCropAppEvents={this.getFieldCropAppEvents.bind(this)}

                      />

                    </Grid>

                    : this.state.tabs[3] == "show" ?
                      <Grid item xs={12} style={{ marginTop: "30px" }} key='appNutrientAppBarTab3'>

                        <Typography variant="h2">Fertilizer</Typography>
                        <Fertilizer
                          dairy_id={this.state.dairy.pk}
                          tsvType={TSV_INFO[FERTILIZER].tsvType}
                          numCols={TSV_INFO[FERTILIZER].numCols}
                          fieldCropAppEvents={this.state.fieldCropAppEvents}
                          nutrientImports={this.state.nutrientImports}
                          fieldCropAppFertilizers={this.state.fieldCropAppFertilizers}
                          NUTRIENT_IMPORT_MATERIAL_TYPES={NUTRIENT_IMPORT_MATERIAL_TYPES}
                          REPORTING_METHODS={REPORTING_METHODS}
                          getFieldCropAppFertilizer={this.getFieldCropAppFertilizer.bind(this)}
                          getNutrientImport={this.getNutrientImport.bind(this)}
                          getFieldCropAppEvents={this.getFieldCropAppEvents.bind(this)}

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
