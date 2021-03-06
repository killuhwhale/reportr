import React, { Component } from 'react'
import {
  Grid, Typography, IconButton, Tooltip, Card, CardContent, CardActions
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import AirlineSeatLegroomReducedIcon from '@material-ui/icons/AirlineSeatLegroomReduced'
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';

import LocalDrinkIcon from '@material-ui/icons/LocalDrink'

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import ActionCancelModal from '../Modals/actionCancelModal'
import AddExportContactModal from "../Modals/addExportContactModal"
import AddExportHaulerModal from "../Modals/addExportHaulerModal"
import AddExportRecipientModal from '../Modals/AddExportRecipientModal'
import AddExportDestModal from "../Modals/addExportDestModal"
import AddExportManifestModal from "../Modals/addExportManifestModal"
import ViewTSVsModal from '../Modals/viewTSVsModal'
import UploadTSVModal from "../Modals/uploadTSVModal"

import { get, post } from '../../utils/requests';
import {
  checkEmpty, MANURE, WASTEWATER, TSVUtil
} from '../../utils/TSV'
import { getAvailableNutrientsG } from '../Dairy/pdfDB'
import { formatDate, formatFloat, groupBySortBy, splitDate } from '../../utils/format'
import { REPORTING_METHODS } from '../../utils/constants'

import { FixedPageSize } from '../utils/FixedPageSize'
import { DEST_TYPES, EXPORT_MATERIAL_TYPES } from '../../utils/constants'



// Might need to pull these up from here and appNutrientTab.js to homePage.js
const MANIFEST_MATERIAL_TYPES = EXPORT_MATERIAL_TYPES


const ContactView = (props) => {
  const contact = props.contact
  return (

    <Grid item container xs={12} alignItems='center' style={{ marginTop: '16px' }} className='showOnHoverParent'>
      <Grid item xs={10} >
        <Typography variant="caption">
          {contact.first_name} {contact.middle_name} {contact.last_name} {contact.suffix_name} {contact.primary_phone}
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <Tooltip title="Delete contact" >
          <IconButton className='showOnHover'
            onClick={() => props.onConfirmExportContactDelete(contact)}
          >
            <DeleteIcon color='error' />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>


  )
}

const HaulerView = (props) => {
  let hauler = props.hauler
  return (
    <Grid item container xs={12} style={{ marginTop: '16px' }} align='align' className='showOnHoverParent'>
      <Grid item container xs={10}>
        <Grid item xs={12}>
          <Typography variant="caption" gutterBottom={false}>
            {hauler.title}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" gutterBottom={false} style={{ marginLeft: "15px" }}>
            {hauler.first_name} {hauler.primary_phone}
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs={2}>
        <Tooltip title="Delete hauler">
          <IconButton className='showOnHover'
            onClick={() => props.onConfirmExportHaulerDelete(hauler)}
          >
            <DeleteIcon color='error' />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  )
}

const RecipientView = (props) => {
  let recipient = props.recipient
  return (
    <Grid item container xs={12} style={{ marginTop: '16px' }} alignItems='center' className='showOnHoverParent'>
      <Grid item xs={10}>
        <Typography variant="caption">
          {recipient.title} {recipient.dest_type} {recipient.primary_phone}
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <Tooltip title="Delete recipient">
          <IconButton className='showOnHover'
            onClick={() => props.onConfirmExportRecipientDelete(recipient)}
          >
            <DeleteIcon color='error' />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  )
}

const DestView = (props) => {
  const dest = props.dest
  return (
    <Grid item container xs={12} style={{ marginTop: '16px' }} alignItems='center' className='showOnHoverParent'>
      <Grid item xs={10}>
        <Typography variant="caption">
          {dest.title} {dest.dest_type}: {`${dest.pnumber} ${dest.street} ${dest.cross_street} ${dest.city_zip}`}
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <Tooltip title="Delete destination">
          <IconButton className='showOnHover'
            onClick={() => props.onConfirmExportDestDelete(dest)}
          >
            <DeleteIcon color='error' />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  )
}

const ManifestView = withTheme((props) => {
  const manifests = props.manifest
  const recipientTitle = manifests[0].recipient_title
  return (
    <Grid item container xs={12} style={{ marginTop: '16px' }} >
      <Grid item xs={12}>
        <Typography variant="subtitle1" color='secondary'>
          {recipientTitle}
        </Typography>
      </Grid>

      {manifests.map((manifest, i) => {
        return (


          <Grid item xs={12} md={4} lg={3} key={`${i}_mview`}>
            <Card variant="outlined" key={`expmani_${i}`} className='showOnHoverParent'>
              <CardContent>
                <Grid item xs={12} align='right'>
                  <Typography variant='caption' >
                    <Tooltip title='Last hauled' placement="top">
                      <span style={{ color: props.theme.palette.secondary.main }}>
                        {` ${formatDate(splitDate(manifest.last_date_hauled))}`}
                      </span>
                    </Tooltip>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' >
                    <span style={{ color: props.theme.palette.primary.main }}>
                      {` ${manifest.material_type} `}
                    </span>
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='caption'>

                    {
                      /rocess/.test(manifest.material_type) ?
                        <React.Fragment>
                          N <span style={{ color: props.theme.palette.primary.main }}>
                            {` ${formatFloat(manifest.kn_con_mg_l)} mg/L `}
                          </span>
                          P <span style={{ color: props.theme.palette.primary.main }}>
                            {` ${formatFloat(manifest.p_con_mg_l)} mg/L `}
                          </span>
                          K <span style={{ color: props.theme.palette.primary.main }}>
                            {` ${formatFloat(manifest.k_con_mg_l)} mg/L `}
                          </span>
                        </React.Fragment>
                        :
                        <React.Fragment>
                          N <span style={{ color: props.theme.palette.primary.main }}>
                            {` ${formatFloat(manifest.n_con_mg_kg)} mg/kg `}
                          </span>
                          P <span style={{ color: props.theme.palette.primary.main }}>
                            {` ${formatFloat(manifest.p_con_mg_kg)} mg/kg `}
                          </span>
                          K <span style={{ color: props.theme.palette.primary.main }}>
                            {` ${formatFloat(manifest.k_con_mg_kg)} mg/kg `}
                          </span>
                        </React.Fragment>
                    }


                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='caption'>
                    {`Amount hauled ${formatFloat(manifest.amount_hauled)}`}
                  </Typography>
                </Grid>
              </CardContent>
              <CardActions>
                <Grid item xs={2}>
                  <Tooltip title="Delete Export Manifest">
                    <IconButton className='showOnHover' size='small'
                      onClick={() => props.onConfirmExportManifestDelete(manifest)}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </CardActions>
            </Card>

          </Grid>

        )
      })
      }
    </Grid>
  )
})


const ExportTotals = (props) => {
  const [manureExported, wastewaterExported, nutrientsExported] = props.totals
  const [n_lbs, p_lbs, k_lbs, salt_lbs] = nutrientsExported

  return (
    <Grid item container xs={12}>
      <Grid item container xs={12}>
        <Grid item xs={2} align='right'>
          <Typography variant='caption' color='primary'>Total manure exported</Typography>
        </Grid>
        <Grid item xs={3} align='right'>
          <Typography variant='caption' color='primary'>Total process wastewater exported</Typography>
        </Grid>


        <Grid item container xs={7} >
          <Grid item xs={3} align='right'>
            <Typography variant='caption' color='primary'>Total N exported</Typography>
          </Grid>
          <Grid item xs={3} align='right'>
            <Typography variant='caption' color='primary'>Total P exported</Typography>
          </Grid>
          <Grid item xs={3} align='right'>
            <Typography variant='caption' color='primary'>Total K exported</Typography>
          </Grid>
          <Grid item xs={3} align='right'>
            <Typography variant='caption' color='primary'>Total salt exported</Typography>
          </Grid>

        </Grid>

      </Grid>

      <Grid item container xs={12}>
        <Grid item xs={2} align='right'>
          <Typography variant='caption' color='secondary'>{formatFloat(manureExported)} tons</Typography>
        </Grid>
        <Grid item xs={3} align='right'>
          <Typography variant='caption' color='secondary'>{formatFloat(wastewaterExported)} gals</Typography>
        </Grid>

        <Grid item container xs={7} >
          <Grid item xs={3} align='right'>
            <Typography variant='caption' color='secondary'>{formatFloat(n_lbs)}</Typography>
          </Grid>
          <Grid item xs={3} align='right'>
            <Typography variant='caption' color='secondary'>{formatFloat(p_lbs)}</Typography>
          </Grid>
          <Grid item xs={3} align='right'>
            <Typography variant='caption' color='secondary'>{formatFloat(k_lbs)}</Typography>
          </Grid>
          <Grid item xs={3} align='right'>
            <Typography variant='caption' color='secondary'>{formatFloat(salt_lbs)}</Typography>
          </Grid>
        </Grid>

      </Grid>
    </Grid>
  )
}

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
      showUploadManureTSVModal: false,
      showUploadWastewaterTSVModal: false,
      showViewManureTSVsModal: false,
      showViewWastewaterTSVsModal: false,
      manureTsvFile: '',
      manureUploadedFilename: '',
      wastewaterTsvFile: '',
      wastewaterUploadedFilename: '',
      tsvType: MANURE,
      numCols: '',
      manureExported: 0,
      wastewaterExported: 0,
      nutrientsExported: [0, 0, 0, 0],
      operators: [],
      exportContacts: [],
      exportHaulers: [],
      exportRecipients: [],
      exportDests: [],
      exportManifests: {},
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      toggleShowDeleteAllModal: false,


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
    this.fetchExportTotals()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.dairy.pk !== this.state.dairy.pk) {
      this.getExportContact()
      this.getOperators()
      this.getExportHaulers()
      this.getExportRecipients()
      this.getExportDests()
      this.getExportManifests()
      this.fetchExportTotals()
    }
  }

  handleTabChange(ev, index) {
    let tabs = this.state.tabs
    tabs[this.state.tabIndex] = "hide"
    tabs[index] = "show"
    this.setState({ tabIndex: index, tabs: tabs })
  }
  getExportContact() {
    get(`${this.props.BASE_URL}/api/export_contact/${this.state.dairy.pk}`)
      .then(res => {
        this.setState({ exportContacts: res })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getOperators() {
    get(`${this.props.BASE_URL}/api/operators/${this.state.dairy.pk}`)
      .then(res => {
        this.setState({ operators: res })
      })
      .catch(err => {
        console.log(err)
      })
  }

  getExportRecipients() {
    get(`${this.props.BASE_URL}/api/export_recipient/${this.state.dairy.pk}`)
      .then(res => {
        this.setState({ exportRecipients: res })
      })
      .catch(err => {
        console.log(err)
      })
  }
  getExportHaulers() {
    get(`${this.props.BASE_URL}/api/export_hauler/${this.state.dairy.pk}`)
      .then(res => {
        this.setState({ exportHaulers: res })
      })
      .catch(err => {
        console.log(err)
      })
  }

  getExportDests() {
    get(`${this.props.BASE_URL}/api/export_dest/${this.state.dairy.pk}`)
      .then(res => {
        this.setState({ exportDests: res })
      })
      .catch(err => {
        console.log(err)
      })
  }

  getExportManifests() {
    get(`${this.props.BASE_URL}/api/export_manifest/${this.state.dairy.pk}`)
      .then(res => {
        let groupedManifests = groupBySortBy(res, 'recipient_id', 'last_date_hauled')
        this.setState({ exportManifests: groupedManifests }, () => {
          this.fetchExportTotals()
        })
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

    post(`${this.props.BASE_URL}/api/export_contact/create`, createObj)
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

    post(`${this.props.BASE_URL}/api/export_hauler/create`, createObj)
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
    post(`${this.props.BASE_URL}/api/export_recipient/create`, createObj)
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
      post(`${this.props.BASE_URL}/api/export_dest/create`, createObj)
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
      post(`${this.props.BASE_URL}/api/export_manifest/create`, createObj)
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

  toggleShowConfirmDeleteExportContactModal(val) {
    this.setState({ showConfirmDeleteExportContactModal: val })
  }

  onExportContactDelete() {
    if (Object.keys(this.state.deleteExportContactObj).length > 0) {
      post(`${this.props.BASE_URL}/api/export_contact/delete`, {
        pk: this.state.deleteExportContactObj.pk,
        dairy_id: this.state.dairy.pk
      })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteExportContactModal(false)
          this.getExportContact()
          this.getOperators()
          this.getExportHaulers()
          this.getExportRecipients()
          this.getExportDests()
          this.getExportManifests()
          this.fetchExportTotals()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  onConfirmExportHaulerDelete(deleteObj) {
    this.setState({ showConfirmDeleteExportHaulerModal: true, deleteExportHaulerObj: deleteObj })
  }

  toggleShowConfirmDeleteExportHaulerModal(val) {
    this.setState({ showConfirmDeleteExportHaulerModal: val })
  }

  onExportHaulerDelete() {
    if (Object.keys(this.state.deleteExportHaulerObj).length > 0) {
      post(`${this.props.BASE_URL}/api/export_hauler/delete`, {
        pk: this.state.deleteExportHaulerObj.pk,
        dairy_id: this.state.dairy.pk
      })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteExportHaulerModal(false)
          this.getExportHaulers()
          this.getExportRecipients()
          this.getExportDests()
          this.getExportManifests()
          this.fetchExportTotals()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  onConfirmExportRecipientDelete(deleteObj) {
    this.setState({ showConfirmDeleteExportRecipientModal: true, deleteExportRecipientObj: deleteObj })
  }
  toggleShowConfirmDeleteExportRecipientModal(val) {
    this.setState({ showConfirmDeleteExportRecipientModal: val })
  }


  onExportRecipientDelete() {
    if (Object.keys(this.state.deleteExportRecipientObj).length > 0) {
      post(`${this.props.BASE_URL}/api/export_recipient/delete`, {
        pk: this.state.deleteExportRecipientObj.pk,
        dairy_id: this.state.dairy.pk
      })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteExportRecipientModal(false)
          this.getExportRecipients()
          this.getExportDests()
          this.getExportManifests()
          this.fetchExportTotals()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  onConfirmExportDestDelete(deleteObj) {
    this.setState({ showConfirmDeleteExportDestModal: true, deleteExportDestObj: deleteObj })
  }
  toggleShowConfirmDeleteExportDestModal(val) {
    this.setState({ showConfirmDeleteExportDestModal: val })
  }
  onExportDestDelete() {
    if (Object.keys(this.state.deleteExportDestObj).length > 0) {
      post(`${this.props.BASE_URL}/api/export_dest/delete`, {
        pk: this.state.deleteExportDestObj.pk,
        dairy_id: this.state.dairy.pk
      })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteExportDestModal(false)
          this.getExportDests()
          this.getExportManifests()
          this.fetchExportTotals()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  onConfirmExportManifestDelete(deleteObj) {
    this.setState({ showConfirmDeleteExportManifestModal: true, deleteExportManifestObj: deleteObj })
  }

  toggleShowConfirmDeleteExportManifestModal(val) {
    this.setState({ showConfirmDeleteExportManifestModal: val })
  }

  onExportManifestDelete() {
    console.log("Deleting...", this.state.deleteExportManifestObj)
    if (Object.keys(this.state.deleteExportManifestObj).length > 0) {
      post(`${this.props.BASE_URL}/api/export_manifest/delete`, {
        pk: this.state.deleteExportManifestObj.pk,
        dairy_id: this.state.dairy.pk
      })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteExportManifestModal(false)
          this.getExportManifests()
          this.fetchExportTotals()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  async onUploadExportManureTSV() {
    let dairy_id = this.state.dairy.pk

    try {
      const result = await TSVUtil.uploadTSV(this.state.manureTsvFile, MANURE, this.state.uploadedFilename, dairy_id)
      console.log("TSV upload result: ", result)
      this.toggleShowUploadManureTSVModal(false)
      this.getExportContact()
      this.getOperators()
      this.getExportHaulers()
      this.getExportRecipients()
      this.getExportDests()
      this.getExportManifests()
      this.props.onAlert('Success!', 'success')
    } catch (e) {

      console.log(e)
      this.props.onAlert('Failed uploading!', 'error')
      this.toggleShowUploadManureTSVModal(false)

    }

  }

  async onUploadExportWastewaterTSV() {
    let dairy_id = this.state.dairy.pk

    try {
      const result = await TSVUtil.uploadTSV(this.state.wastewaterTsvFile, WASTEWATER, this.state.uploadedFilename, dairy_id)
      console.log("TSV upload result: ", result)
      this.toggleShowUploadWastewaterTSVModal(false)

      this.getExportContact()
      this.getOperators()
      this.getExportHaulers()
      this.getExportRecipients()
      this.getExportDests()
      this.getExportManifests()
      this.props.onAlert('Success!', 'success')
    } catch (e) {

      console.log(e)
      this.props.onAlert('Failed uploading!', 'error')
      this.toggleShowUploadWastewaterTSVModal(false)

    }

    // uploadExportTSV(this.state.wastewaterTsvFile, WASTEWATER, dairy_id)
    //   .then(result => {
    //     uploadTSVToDB(this.state.wastewaterUploadedFilename, this.state.wastewaterTsvFile, this.state.dairy.pk, TSV_INFO[WASTEWATER].tsvType)
    //       .then(tsvUploadRes => {
    //         console.log("Uploaded TSV to DB")
    //         this.toggleShowUploadWastewaterTSVModal(false)
    //         this.getExportContact()
    //         this.getOperators()
    //         this.getExportHaulers()
    //         this.getExportRecipients()
    //         this.getExportDests()
    //         this.getExportManifests()
    //         this.props.onAlert('Success!', 'success')
    //       })
    //       .catch(err => {
    //         console.log(err)
    //         this.toggleShowUploadWastewaterTSVModal(false)
    //         this.props.onAlert('Failed uploading', 'error')
    //       })
    //   })
    //   .catch(err => {
    //     console.log(err)
    //     this.toggleShowUploadWastewaterTSVModal(false)
    //     this.props.onAlert('Failed uploading', 'error')
    //   })



  }

  toggleShowUploadManureTSVModal(val) {
    this.setState({
      showUploadManureTSVModal: val,
      manureTsvFile: "",
      manureUploadedFilename: ""
    })
  }

  toggleShowUploadWastewaterTSVModal(val) {
    this.setState({
      showUploadWastewaterTSVModal: val,
      wastewaterTsvFile: "",
      wastewaterUploadedFilename: ""
    })
  }


  toggleShowViewManureTSVModal(val) {
    this.setState({ showViewManureTSVsModal: val })
  }
  toggleShowViewWastewaterTSVModal(val) {
    this.setState({ showViewWastewaterTSVsModal: val })
  }


  confirmDeleteAllFromTable(val) {
    this.setState({ toggleShowDeleteAllModal: val })
  }
  deleteAllFromTable() {
    Promise.all([
      post(`${this.props.BASE_URL}/api/export_manifest/deleteAll`, { dairy_id: this.state.dairy.pk }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy.pk, tsvType: MANURE }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy.pk, tsvType: WASTEWATER }),
    ])
      .then(res => {
        console.log("Delete all exports: ", res)
        this.getExportContact()
        this.getExportHaulers()
        this.getExportRecipients()
        this.getExportDests()
        this.getExportManifests()
        this.confirmDeleteAllFromTable(false)

      })
      .catch(err => {
        console.log(err)
      })
  }


  onUploadManureTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      this.setState({ manureTsvFile: files[0], manureUploadedFilename: files[0].name })
    }
  }
  onUploadWastewaterTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      this.setState({ wastewaterTsvFile: files[0], wastewaterUploadedFilename: files[0].name })
    }
  }

  async fetchExportTotals() {
    try {
      const { availableNutrientsG: { manureExported, wastewaterExported, total: nutrientsExported } } = await getAvailableNutrientsG(this.props.dairy.pk)
      this.setState({ manureExported, wastewaterExported, nutrientsExported })
    } catch (e) {
      console.log(e)
    }
  }

  getExportTotals() {
    return [this.state.manureExported, this.state.wastewaterExported, this.state.nutrientsExported]
  }

  render() {
    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
          <Grid item xs={12} container alignItems="baseline">
            <Grid item xs={12}>
              <Typography variant="h2">Nutrient Exports </Typography>
            </Grid>
            <Grid item container xs={12}>
              <Grid item container xs={8}>
                {/* <Grid item xs={2}>
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
                </Grid> */}

              </Grid>



              <Grid item container xs={4}>
                <Grid item xs={2}>
                  <Tooltip title="Upload Manure TSV">
                    <IconButton color='primary'
                      onClick={() => this.toggleShowUploadManureTSVModal(true)}
                    >
                      <CloudUploadIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={2}>
                  <Tooltip title="Upload Wastewater TSV">
                    <IconButton color='secondary'
                      onClick={() => this.toggleShowUploadWastewaterTSVModal(true)}
                    >
                      <CloudUploadIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={2}>
                  <Tooltip title="View Manure TSV">
                    <IconButton color='primary'
                      onClick={() => this.toggleShowViewManureTSVModal(true)}
                    >
                      <AirlineSeatLegroomReducedIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={2}>
                  <Tooltip title="View Wastewater TSV">
                    <IconButton color='secondary'
                      onClick={() => this.toggleShowViewWastewaterTSVModal(true)}
                    >
                      <LocalDrinkIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={3} align='right'>
                  <Tooltip title='Delete all Export Manifests'>
                    <IconButton onClick={() => this.confirmDeleteAllFromTable(true)}>
                      <DeleteSweepIcon color='error' />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} style={{
              marginTop: '24px', marginBottom: '12px', borderBottom: '1px solid',
              borderColor: this.props.theme.palette.primary.main,
              borderBottomWidth: 'thick'
            }}>
              {
                this.state.nutrientsExported.length > 0 ?
                  <ExportTotals
                    totals={this.getExportTotals()}
                  />
                  :
                  <React.Fragment></React.Fragment>
              }
            </Grid>

            <Grid item container xs={3}>
              <Grid item xs={12}>
                <Typography variant='h6'>
                  Contacts
                </Typography>
              </Grid>
              {this.state.exportContacts.length > 0 ?
                <FixedPageSize item xs={12} height='256px'>
                  {this.state.exportContacts.map((contact, i) => {
                    return (
                      <ContactView key={`etcview${i}`}
                        contact={contact}
                        onConfirmExportContactDelete={this.onConfirmExportContactDelete.bind(this)}
                      />
                    )
                  })}
                </FixedPageSize>
                :
                <Grid item xs={12} align='center'>
                  <Typography variant='subtitle2'>No contacts</Typography>
                </Grid>
              }
            </Grid>

            <Grid item container xs={3}>
              <Grid item xs={12}>
                <Typography variant='h6'>
                  Haulers
                </Typography>
              </Grid>
              {this.state.exportHaulers.length > 0 ?
                <FixedPageSize item xs={12} height='256px'>
                  {
                    this.state.exportHaulers.map((hauler, i) => {
                      return (
                        <HaulerView key={`ethview${i}`}
                          hauler={hauler}
                          onConfirmExportHaulerDelete={this.onConfirmExportHaulerDelete.bind(this)}
                        />
                      )
                    })
                  }
                </FixedPageSize>


                :
                <Grid item xs={12} align='center'>
                  <Typography variant='subtitle2'>No haulers</Typography>
                </Grid>
              }
            </Grid>

            <Grid item xs={3}>
              <Typography variant='h6'>
                Recipients
              </Typography>
              {this.state.exportRecipients.length > 0 ?
                <FixedPageSize item xs={12} height='256px'>
                  {
                    this.state.exportRecipients.map((recipient, i) => {
                      return (
                        <RecipientView key={`etrview${i}`}
                          recipient={recipient}
                          onConfirmExportRecipientDelete={this.onConfirmExportRecipientDelete.bind(this)}
                        />
                      )
                    })
                  }

                </FixedPageSize>

                :
                <Grid item xs={12} align='center'>
                  <Typography variant='subtitle2'>No Recipients</Typography>
                </Grid>
              }
            </Grid>

            <Grid item xs={3}>
              <Typography variant='h6'>
                Destinations
              </Typography>
              {this.state.exportDests.length > 0 ?
                <FixedPageSize item xs={12} height='256px'>
                  {
                    this.state.exportDests.map((dest, i) => {
                      return (
                        <DestView key={`etdview${i}`}
                          dest={dest}
                          onConfirmExportDestDelete={this.onConfirmExportDestDelete.bind(this)}
                        />
                      )
                    })
                  }
                </FixedPageSize>

                :
                <Grid item xs={12} align='center'>
                  <Typography variant='subtitle2'>No destinations</Typography>
                </Grid>
              }
            </Grid>

            <Grid item xs={12}>
              <Grid item xs={12}>
                <Typography variant='h5'>
                  Manifests
                </Typography>
              </Grid>
              {Object.keys(this.state.exportManifests).length > 0 ?
                <FixedPageSize item xs={12} height='512px'>

                  {
                    Object.keys(this.state.exportManifests).map((manifestKey, i) => {
                      return (
                        <ManifestView key={`etcview${i}`}
                          manifest={this.state.exportManifests[manifestKey]}
                          onConfirmExportManifestDelete={this.onConfirmExportManifestDelete.bind(this)}
                        />
                      )
                    })
                  }
                </FixedPageSize>
                :
                <Grid item xs={12} align='center'>
                  <Typography variant='subtitle2'>No manifests</Typography>
                </Grid>
              }


            </Grid>

          </Grid>
          :
          <React.Fragment>
            <Grid item xs={12}>
              <Typography>None selected</Typography>
            </Grid>
          </React.Fragment>
        }

        <ViewTSVsModal
          open={this.state.showViewManureTSVsModal}
          actionText={"" /* no action text*/}
          cancelText="Close"
          dairy_id={this.state.dairy.pk}
          tsvType={MANURE}
          onClose={() => this.toggleShowViewManureTSVModal(false)}
          BASE_URL={this.props.BASE_URL}
        />
        <ViewTSVsModal
          open={this.state.showViewWastewaterTSVsModal}
          actionText={"" /* no action text*/}
          cancelText="Close"
          dairy_id={this.state.dairy.pk}
          tsvType={WASTEWATER}
          onClose={() => this.toggleShowViewWastewaterTSVModal(false)}
          BASE_URL={this.props.BASE_URL}
        />
        <ActionCancelModal
          open={this.state.toggleShowDeleteAllModal}
          actionText="Delete all"
          cancelText="Cancel"
          modalText={`Delete All Export Manifests (Contacts, Haulers, Recipients & Destinations)?`}
          onAction={this.deleteAllFromTable.bind(this)}
          onClose={() => this.confirmDeleteAllFromTable(false)}
        />
        {/* <UploadExportTSVModal
          open={this.state.showUploadTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Export TSV`}
          uploadedFilename={this.state.uploadedFilename}

          uploadManureTSV={this.onUploadExportManureTSV.bind(this)}
          uploadWastewaterTSV={this.onUploadExportWastewaterTSV.bind(this)}
          onChange={this.onUploadExportTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadTSVModal(false)}
        /> */}


        <UploadTSVModal
          open={this.state.showUploadManureTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Manure TSV`}
          fileType="csv"
          uploadedFilename={this.state.manureUploadedFilename}
          onAction={this.onUploadExportManureTSV.bind(this)}
          onChange={this.onUploadManureTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadManureTSVModal(false)}
        />

        <UploadTSVModal
          open={this.state.showUploadWastewaterTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Wastewater TSV`}
          fileType="csv"
          uploadedFilename={this.state.wastewaterUploadedFilename}
          onAction={this.onUploadExportWastewaterTSV.bind(this)}
          onChange={this.onUploadWastewaterTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadWastewaterTSVModal(false)}
        />

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
          modalText={`Delete Export Contact ${this.state.deleteExportContactObj.first_name} ${this.state.deleteExportContactObj.primary_phone}?`}
          onAction={this.onExportContactDelete.bind(this)}
          onClose={() => this.setState({ showConfirmDeleteExportContactModal: false })}
        />

        <ActionCancelModal
          open={this.state.showConfirmDeleteExportHaulerModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Export Hauler ${this.state.deleteExportHaulerObj.title} - ${this.state.deleteExportHaulerObj.first_name}?`}
          onAction={this.onExportHaulerDelete.bind(this)}
          onClose={() => this.setState({ showConfirmDeleteExportHaulerModal: false })}
        />

        <ActionCancelModal
          open={this.state.showConfirmDeleteExportRecipientModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Export Recipient ${this.state.deleteExportRecipientObj.title} ${this.state.deleteExportRecipientObj.primary_phone}?`}
          onAction={this.onExportRecipientDelete.bind(this)}
          onClose={() => this.setState({ showConfirmDeleteExportRecipientModal: false })}
        />


        <ActionCancelModal
          open={this.state.showConfirmDeleteExportDestModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Export Dest ${this.state.deleteExportDestObj.title} - ${this.state.deleteExportDestObj.pnumber}${this.state.deleteExportDestObj.street} ${this.state.deleteExportDestObj.cross_street} ${this.state.deleteExportDestObj.city_zip}?`}
          onAction={this.onExportDestDelete.bind(this)}
          onClose={() => this.setState({ showConfirmDeleteExportDestModal: false })}
        />


        <ActionCancelModal
          open={this.state.showConfirmDeleteExportManifestModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Export Manifest from ${formatDate(splitDate(this.state.deleteExportManifestObj.last_date_hauled))}?`}
          onAction={this.onExportManifestDelete.bind(this)}
          onClose={() => this.setState({ showConfirmDeleteExportManifestModal: false })}
        />

      </React.Fragment>
    )
  }
}

export default ExportTab = withRouter(withTheme(ExportTab))
