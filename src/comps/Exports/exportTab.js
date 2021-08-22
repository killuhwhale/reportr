import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, AppBar, Tabs, Tab
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import ContactPhoneIcon from '@material-ui/icons/ContactPhone'
import LocalShippingIcon from '@material-ui/icons/LocalShipping'
import CallReceivedIcon from '@material-ui/icons/CallReceived'
import ExploreIcon from '@material-ui/icons/Explore'
import AssessmentIcon from '@material-ui/icons/Assessment';


import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import ActionCancelModal from '../Modals/actionCancelModal'
import AddExportContactModal from "../Modals/addExportContactModal"
import AddExportHaulerModal from "../Modals/addExportHaulerModal"
import AddExportRecipientModal from '../Modals/AddExportRecipientModal'
import AddExportDestModal from "../Modals/addExportDestModal"
import AddExportManifestModal from "../Modals/addExportManifestModal"
import formats from "../../utils/format"
import { get, post } from '../../utils/requests';
import { TSV_INFO, checkEmpty } from '../../utils/TSV'


const BASE_URL = "http://localhost:3001"



// Might need to pull these up from here and appNutrientTab.js to homePage.js
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

const MANIFEST_MATERIAL_TYPES = [
  "Dry manure: Separator solids",
  "Dry manure: Corral solids",
  "Dry manure: Scraped material",
  "Dry manure: Bedding",
  "Dry manure: Compost",
  "Process wastewater",
  "Process wastewater: Process wastewater sludge"
]
const DEST_TYPES = ['Broker', 'Composting Facility', 'Farmer', 'Other']

class ExportTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      showAddExportContactModal: false,
      showAddExportHaulerModal: false,
      showAddExportRecipientModal: false,
      showAddExportDestModal: false,
      showAddExportManifestModal: false,
      operators: [],
      exportContacts: [],
      exportHaulers: [],
      exportRecipients: [],
      exportDests: [],
      exportManifests: [],
      createExportContactObj: {
        first_name: '',
        last_name: '',
        middle_name: '',
        suffix_name: '',
        primary_phone: ''
      },
      createExportHaulerObj: {
        title: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        suffix_name: '',
        primary_phone: '',
        street: '',
        cross_street: '',
        county: '',
        city: '',
        city_state: 'CA',
        city_zip: ''
      },
      createExportRecipientObj: {
        dest_type_idx: 0,
        dest_type: '',
        title: '',
        primary_phone: '',
        street: '',
        cross_street: '',
        county: '',
        city: '',
        city_state: '',
        city_zip: '',
      },
      createExportDestObj: {
        export_recipient_id: '',
        export_recipient_idx: 0,

        dest_is_pnumber: false,
        pnumber: '',
        street: '',
        cross_street: '',
        county: '',
        city: '',
        city_state: '',
        city_zip: '',
      },
      createExportManifestObj: {
        dairy_id: '',
        operator_id: '',
        export_contact_id: '',
        export_dest_id: '',
        operator_idx: 0,
        export_contact_idx: 0,
        export_dest_idx: 0,

        export_hauler_idx: 0,
        export_hauler_id: '',


        last_date_hauled: new Date(),
        amount_hauled: '',
        material_type: '',
        material_type_idx: 0,
        amount_hauled_method: '',

        is_solid: true,

        reporting_method: '',
        reporting_method_idx: 0,
        moisture: '',
        n_con_mg_kg: '',
        p_con_mg_kg: '',
        k_con_mg_kg: '',
        tfs: '',

        kn_con_mg_l: '',
        nh4_con_mg_l: '',
        nh3_con_mg_l: '',
        no3_con_mg_l: '',
        p_con_mg_l: '',
        k_con_mg_l: '',
        tds: '',
      },
      showConfirmDeleteExportContactModal: false,
      showConfirmDeleteExportHaulerModal: false,
      showConfirmDeleteExportRecipientModal: false,
      showConfirmDeleteExportDestModal: false,
      showConfirmDeleteExportManifestModal: false,
      deleteExportContactObj: {},
      deleteExportHaulerObj: {},
      deleteExportRecipientObj: {},
      deleteExportDestObj: {},
      deleteExportManifestObj: {},
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }
  componentDidMount() {
    this.getExportContact()
    this.getOperators()
    this.getExportHaulers()
    this.getExportRecipients()
    this.getExportDests()
    this.getExportManifests()
  }
  handleTabChange(ev, index) {
    let tabs = this.state.tabs
    tabs[this.state.tabIndex] = "hide"
    tabs[index] = "show"
    this.setState({ tabIndex: index, tabs: tabs })
  }
  getExportContact() {
    get(`${BASE_URL}/api/export_contact/${this.state.dairy.pk}`)
      .then(res => {
        console.log(res)
        this.setState({ exportContacts: res })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getOperators() {
    get(`${BASE_URL}/api/operators/${this.state.dairy.pk}`)
      .then(res => {
        console.log(res)
        this.setState({ operators: res })
      })
      .catch(err => {
        console.log(err)
      })
  }

  getExportRecipients() {
    get(`${BASE_URL}/api/export_recipient/${this.state.dairy.pk}`)
      .then(res => {
        console.log(res)
        this.setState({ exportRecipients: res })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getExportHaulers() {
    get(`${BASE_URL}/api/export_hauler/${this.state.dairy.pk}`)
      .then(res => {
        console.log(res)
        this.setState({ exportHaulers: res })
      })
      .catch(err => {
        console.log(err)
      })
  }

  getExportDests() {
    get(`${BASE_URL}/api/export_dest/${this.state.dairy.pk}`)
      .then(res => {
        console.log(res)
        this.setState({ exportDests: res })
      })
      .catch(err => {
        console.log(err)
      })
  }

  getExportManifests() {
    get(`${BASE_URL}/api/export_manifest/${this.state.dairy.pk}`)
      .then(res => {
        console.log(res)
        this.setState({ exportManifests: res })
      })
      .catch(err => {
        console.log(err)
      })
  }


  toggleShowAddExportContactModal(val) {
    this.setState({ showAddExportContactModal: val })
  }
  onCreateExportContact() {
    let createObj = this.state.createExportContactObj
    createObj.dairy_id = this.state.dairy.pk

    post(`${BASE_URL}/api/export_contact/create`, createObj)
      .then(res => {
        console.log(res)
        this.getExportContact()
        this.toggleShowAddExportContactModal(false)
      })
      .catch(err => {
        console.log(err)
      })
  }
  onCreateExportContactChange(ev) {
    const { name, value } = ev.target
    let createObj = this.state.createExportContactObj
    createObj[name] = value
    this.setState({ createExportContactObj: createObj })
  }

  onCreateExportHauler() {
    let createObj = this.state.createExportHaulerObj
    createObj.dairy_id = this.state.dairy.pk

    post(`${BASE_URL}/api/export_hauler/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddExportHaulerModal(false)
      })
      .catch(err => {
        console.log(err)
      })
  }
  onCreateExportHaulerChange(ev) {
    const { name, value } = ev.target
    let createObj = this.state.createExportHaulerObj
    createObj[name] = value
    this.setState({ createExportHaulerObj: createObj })
  }
  toggleShowAddExportHaulerModal(val) {
    this.setState({ showAddExportHaulerModal: val })
  }

  onCreateExportRecipient() {
    let createObj = this.state.createExportRecipientObj
    createObj.dairy_id = this.state.dairy.pk
    createObj.dest_type = DEST_TYPES[this.state.createExportRecipientObj.dest_type_idx]
    post(`${BASE_URL}/api/export_recipient/create`, createObj)
      .then(res => {
        console.log(res)
        this.getExportRecipients()
        this.toggleShowAddExportRecipientModal(false)
      })
      .catch(err => {
        console.log(err)
      })
  }
  onCreateExportRecipientChange(ev) {
    const { name, value } = ev.target
    let createObj = this.state.createExportRecipientObj
    console.log(name, value)
    createObj[name] = value
    this.setState({ createExportRecipientObj: createObj })
  }
  toggleShowAddExportRecipientModal(val) {
    this.setState({ showAddExportRecipientModal: val })
  }

  onCreateExportDest() {
    let createObj = this.state.createExportDestObj
    createObj.dairy_id = this.state.dairy.pk
    if (this.state.exportRecipients.length > 0) {
      createObj.export_recipient_id = this.state.exportRecipients[createObj.export_recipient_idx].pk
      console.log("Creating export dest", createObj)
      post(`${BASE_URL}/api/export_dest/create`, createObj)
        .then(res => {
          console.log(res)
          this.toggleShowAddExportDestModal(false)
          this.getExportDests()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
  onCreateExportDestChange(ev) {
    const { name, value } = ev.target
    let createObj = this.state.createExportDestObj
    console.log(name, value)
    createObj[name] = value
    this.setState({ createExportDestObj: createObj })
  }
  toggleShowAddExportDestModal(val) {
    this.setState({ showAddExportDestModal: val })
  }

  onCreateExportManifest() {
    let createObj = this.state.createExportManifestObj
    createObj.dairy_id = this.state.dairy.pk
    console.log()
    if (this.state.exportDests.length > 0 && this.state.operators.length > 0 && this.state.exportContacts.length > 0) {
      createObj.export_dest_id = this.state.exportDests[createObj.export_dest_idx].pk
      createObj.export_contact_id = this.state.exportContacts[createObj.export_contact_idx].pk
      createObj.export_hauler_id = this.state.exportHaulers[createObj.export_hauler_idx].pk
      createObj.operator_id = this.state.operators[createObj.operator_idx].pk
      createObj.material_type = MANIFEST_MATERIAL_TYPES[createObj.material_type_idx]
      if (createObj.material_type_idx < 5) {
        createObj.reporting_method = REPORTING_METHODS[createObj.reporting_method_idx]
      }

      createObj.amount_hauled = checkEmpty(createObj.amount_hauled)

      createObj.moisture = checkEmpty(createObj.moisture)
      createObj.n_con_mg_kg = checkEmpty(createObj.n_con_mg_kg)
      createObj.p_con_mg_kg = checkEmpty(createObj.p_con_mg_kg)
      createObj.k_con_mg_kg = checkEmpty(createObj.k_con_mg_kg)
      createObj.tfs = checkEmpty(createObj.tfs)

      createObj.kn_con_mg_l = checkEmpty(createObj.kn_con_mg_l)
      createObj.nh4_con_mg_l = checkEmpty(createObj.nh4_con_mg_l)
      createObj.nh3_con_mg_l = checkEmpty(createObj.nh3_con_mg_l)
      createObj.no3_con_mg_l = checkEmpty(createObj.no3_con_mg_l)
      createObj.p_con_mg_l = checkEmpty(createObj.p_con_mg_l)
      createObj.k_con_mg_l = checkEmpty(createObj.k_con_mg_l)
      createObj.tds = checkEmpty(createObj.tds)



      console.log("Creating export manifest", createObj)
      post(`${BASE_URL}/api/export_manifest/create`, createObj)
        .then(res => {
          console.log(res)
          this.toggleShowAddExportManifestModal(false)
          this.getExportManifests()
        })
        .catch(err => {
          console.log(err)
        })
    } else {
      console.log("Error: Destinations, Operators, or Contacts not found.")
    }
  }
  onCreateExportManifestChange(ev) {
    const { name, value } = ev.target
    let createObj = this.state.createExportManifestObj
    console.log(name, value)
    createObj[name] = value
    this.setState({ createExportManifestObj: createObj })
  }
  toggleShowAddExportManifestModal(val) {
    this.setState({ showAddExportManifestModal: val })
  }



  onConfirmExportContactDelete(deleteObj) {
    this.setState({ showConfirmDeleteExportContactModal: true, deleteExportContactObj: deleteObj })
  }
  onExportContactDelete() {
    if (Object.keys(this.state.deleteExportContactObj).length > 0) {
      post(`${BASE_URL}/api/export_contact/delete`, { pk: this.state.deleteExportContactObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteExportContactModal(false)
          this.getExportContact()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  onConfirmExportHaulerDelete(deleteObj) {
    this.setState({ showConfirmDeleteExportHaulerModal: true, deleteExportHaulerObj: deleteObj })
  }
  onExportHaulerDelete() {
    if (Object.keys(this.state.deleteExportHaulerObj).length > 0) {
      post(`${BASE_URL}/api/export_hauler/delete`, { pk: this.state.deleteExportHaulerObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteExportHaulerModal(false)
          this.getExportHauler()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  onConfirmExportRecipientDelete(deleteObj) {
    this.setState({ showConfirmDeleteExportRecipientModal: true, deleteExportRecipientObj: deleteObj })
  }
  onExportRecipientDelete() {
    if (Object.keys(this.state.deleteExportRecipientObj).length > 0) {
      post(`${BASE_URL}/api/export_recipient/delete`, { pk: this.state.deleteExportRecipientObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteExportRecipientModal(false)
          this.getExportRecipient()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  onConfirmExportDestDelete(deleteObj) {
    this.setState({ showConfirmDeleteExportDestModal: true, deleteExportDestObj: deleteObj })
  }
  onExportDestDelete() {
    if (Object.keys(this.state.deleteExportDestObj).length > 0) {
      post(`${BASE_URL}/api/export_dest/delete`, { pk: this.state.deleteExportDestObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteExportDestModal(false)
          this.getExportDest()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  onConfirmExportManifestDelete(deleteObj) {
    this.setState({ showConfirmDeleteExportManifestModal: true, deleteExportManifestObj: deleteObj })
  }
  onExportManifestDelete() {
    if (Object.keys(this.state.deleteExportManifestObj).length > 0) {
      post(`${BASE_URL}/api/export_manifest/delete`, { pk: this.state.deleteExportManifestObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteExportManifestModal(false)
          this.getExportManifest()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }


  render() {


    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
          <Grid item xs={12} container alignItems="baseline">
            <Grid item xs={12}>
              <Typography variant="h2">Nutrient Exports
                <Typography variant="subtitle1" component="span"> (1337)</Typography>
              </Typography>
            </Grid>
            <Grid item container xs={12}>
              <Grid item xs={2}>
                <Tooltip title="Add Export Contact">
                  <IconButton color='primary'
                    onClick={() => this.toggleShowAddExportContactModal(true)}
                  >
                    <ContactPhoneIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={2}>
                <Tooltip title="Add Export Hauler">
                  <IconButton color='primary'
                    onClick={() => this.toggleShowAddExportHaulerModal(true)}
                  >
                    <LocalShippingIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={2}>
                <Tooltip title="Add Export Recipient">
                  <IconButton color='primary'
                    onClick={() => this.toggleShowAddExportRecipientModal(true)}
                  >
                    <CallReceivedIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={2}>
                <Tooltip title="Add Export Dest">
                  <IconButton color='primary'
                    onClick={() => this.toggleShowAddExportDestModal(true)}
                  >
                    <ExploreIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={2}>
                <Tooltip title="Add Export Manifest">
                  <IconButton color='primary'
                    onClick={() => this.toggleShowAddExportManifestModal(true)}
                  >
                    <AssessmentIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Typography variant='h3'>
                Contacts
              </Typography>
              {this.state.exportContacts.length > 0 ?
                this.state.exportContacts.map((contact, i) => {
                  return (
                    <Grid item container xs={12} key={`ecview${i}`}>
                      <Grid item container xs={10}>
                        <Typography variant="subtitle1">
                          {contact.first_name} {contact.middle_name} {contact.last_name} {contact.suffix_name} {contact.primary_phone}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Tooltip title="Delete contact">
                          <IconButton
                            onClick={() => this.onConfirmExportContactDelete(contact)}
                          >
                            <DeleteIcon color='error' />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  )
                })
                :
                <React.Fragment></React.Fragment>
              }
            </Grid>

            <Grid item xs={6}>
              <Typography variant='h3'>
                Haulers
              </Typography>
              {this.state.exportHaulers.length > 0 ?
                this.state.exportHaulers.map((hauler, i) => {
                  return (
                    <Grid item container xs={12} key={`ehview${i}`}>
                      <Grid item container xs={10}>
                        <Typography variant="subtitle1">
                          {hauler.title} {hauler.first_name} {hauler.last_name} {hauler.primary_phone}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Tooltip title="Delete hauler">
                          <IconButton
                            onClick={() => this.onConfirmExportHaulerDelete(hauler)}
                          >
                            <DeleteIcon color='error' />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  )
                })
                :
                <React.Fragment></React.Fragment>
              }
            </Grid>

            <Grid item xs={6}>
              <Typography variant='h3'>
                Recipients
              </Typography>
              {this.state.exportRecipients.length > 0 ?
                this.state.exportRecipients.map((recipient, i) => {
                  return (
                    <Grid item container xs={12} key={`erview${i}`}>
                      <Grid item container xs={10}>
                        <Typography variant="subtitle1">
                          {recipient.title} {recipient.dest_type} {recipient.primary_phone}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Tooltip title="Delete recipient">
                          <IconButton
                            onClick={() => this.onConfirmExportRecipientDelete(recipient)}
                          >
                            <DeleteIcon color='error' />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  )
                })
                :
                <React.Fragment></React.Fragment>
              }
            </Grid>

            <Grid item xs={6}>
              <Typography variant='h3'>
                Destinations
              </Typography>
              {this.state.exportDests.length > 0 ?
                this.state.exportDests.map((dest, i) => {
                  return (
                    <Grid item container xs={12} key={`edview${i}`}>
                      <Grid item container xs={10}>
                        <Typography variant="subtitle1">
                          {dest.title} {dest.dest_type}: {dest.dest_is_pnumber ? dest.pnumber : `${dest.street} ${dest.cross_street} ${dest.city_zip}`}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Tooltip title="Delete destination">
                          <IconButton
                            onClick={() => this.onConfirmExportDestDelete(dest)}
                          >
                            <DeleteIcon color='error' />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  )
                })
                :
                <React.Fragment></React.Fragment>
              }
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h3'>
                Manifests
              </Typography>
              {this.state.exportManifests.length > 0 ?
                this.state.exportManifests.map((manifest, i) => {
                  return (
                    <Grid item container xs={12} key={`emview${i}`}>
                      <Grid item container xs={10}>
                        <Typography variant="subtitle1">
                          {manifest.last_date_hauled} {manifest.material_type} {manifest.amount_hauled}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Tooltip title="Delete manifest">
                          <IconButton
                            onClick={() => this.onConfirmExportManifestDelete(manifest)}
                          >
                            <DeleteIcon color='error' />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  )
                })
                :
                <React.Fragment></React.Fragment>
              }
            </Grid>

          </Grid>
          :
          <React.Fragment>
            <Grid item xs={12}>
              <Typography>No dairy selected</Typography>
            </Grid>
          </React.Fragment>
        }

        <AddExportContactModal
          open={this.state.showAddExportContactModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Create Export Contact`}
          createExportContactObj={this.state.createExportContactObj}
          onAction={this.onCreateExportContact.bind(this)}
          onChange={this.onCreateExportContactChange.bind(this)}
          onClose={() => this.toggleShowAddExportContactModal(false)}
        />

        <AddExportHaulerModal
          open={this.state.showAddExportHaulerModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Create Export Hauler`}
          createExportHaulerObj={this.state.createExportHaulerObj}
          onAction={this.onCreateExportHauler.bind(this)}
          onChange={this.onCreateExportHaulerChange.bind(this)}
          onClose={() => this.toggleShowAddExportHaulerModal(false)}
        />


        <AddExportRecipientModal
          open={this.state.showAddExportRecipientModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Create Export Recipient`}
          createExportRecipientObj={this.state.createExportRecipientObj}
          DEST_TYPES={DEST_TYPES}
          onAction={this.onCreateExportRecipient.bind(this)}
          onChange={this.onCreateExportRecipientChange.bind(this)}
          onClose={() => this.toggleShowAddExportRecipientModal(false)}
        />

        <AddExportDestModal
          open={this.state.showAddExportDestModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Create Export Dest`}
          createExportDestObj={this.state.createExportDestObj}
          exportRecipients={this.state.exportRecipients}
          onAction={this.onCreateExportDest.bind(this)}
          onChange={this.onCreateExportDestChange.bind(this)}
          onClose={() => this.toggleShowAddExportDestModal(false)}
        />

        <AddExportManifestModal
          open={this.state.showAddExportManifestModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Create Export Manifest`}
          createExportManifestObj={this.state.createExportManifestObj}
          exportDests={this.state.exportDests}
          exportContacts={this.state.exportContacts}
          operators={this.state.operators}
          exportHaulers={this.state.exportHaulers}
          MANIFEST_MATERIAL_TYPES={MANIFEST_MATERIAL_TYPES}
          REPORTING_METHODS={REPORTING_METHODS}
          onAction={this.onCreateExportManifest.bind(this)}
          onChange={this.onCreateExportManifestChange.bind(this)}
          onClose={() => this.toggleShowAddExportManifestModal(false)}
        />

        <ActionCancelModal
          open={this.state.showConfirmDeleteExportContactModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Export Contact ${this.state.deleteExportContactObj.first_name} ${this.state.deleteExportContactObj.last_name}?`}
          onAction={this.onExportContactDelete.bind(this)}
          onClose={() => this.setState({showConfirmDeleteExportContactModal: false})}
        />

        <ActionCancelModal
          open={this.state.showConfirmDeleteExportHaulerModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Export Hauler ${this.state.deleteExportHaulerObj.title} - ${this.state.deleteExportHaulerObj.first_name}?`}
          onAction={this.onExportHaulerDelete.bind(this)}
          onClose={() => this.setState({showConfirmDeleteExportHaulerModal: false})}
        />

        <ActionCancelModal
          open={this.state.showConfirmDeleteExportRecipientModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Export Recipient ${this.state.deleteExportRecipientObj.title} ${this.state.deleteExportRecipientObj.primary_phone}?`}
          onAction={this.onExportRecipientDelete.bind(this)}
          onClose={() => this.setState({showConfirmDeleteExportRecipientModal: false})}
        />


        <ActionCancelModal
          open={this.state.showConfirmDeleteExportDestModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Export Dest ${this.state.deleteExportDestObj.title} - ${this.state.deleteExportDestObj.pnumber}${this.state.deleteExportDestObj.street} ${this.state.deleteExportDestObj.cross_street} ${this.state.deleteExportDestObj.city_zip}?`}
          onAction={this.onExportDestDelete.bind(this)}
          onClose={() => this.setState({showConfirmDeleteExportDestModal: false})}
        />


        <ActionCancelModal
          open={this.state.showConfirmDeleteExportManifestModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Export Manifest ${this.state.deleteExportManifestObj.last_date_hauled} ${this.state.deleteExportManifestObj.amount_hauled}?`}
          onAction={this.onExportManifestDelete.bind(this)}
          onClose={() => this.setState({showConfirmDeleteExportManifestModal: false})}
        />

      </React.Fragment>
    )
  }
}

export default ExportTab = withRouter(withTheme(ExportTab))
