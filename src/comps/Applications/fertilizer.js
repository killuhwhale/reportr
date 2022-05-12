import React, { Component } from 'react'
import {
  Grid, Typography, IconButton, Tooltip,
  Card, CardContent, CardActions
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import WbCloudyIcon from '@material-ui/icons/WbCloudy' // viewTSV
import { CloudUpload } from '@material-ui/icons' // uploadTSV
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'

import UploadTSVModal from "../Modals/uploadTSVModal"
import ViewTSVsModal from "../Modals/viewTSVsModal"

import { formatDate, formatFloat, naturalSort, naturalSortBy, nestedGroupBy, splitDate } from "../../utils/format"
import { renderFieldButtons, renderCropButtons, CurrentFieldCrop } from './selectButtonGrid'
import AddNutrientImportModal from "../Modals/addNutrientImportModal"
import AddFertilizerModal from "../Modals/addFertilizerModal"
import ActionCancelModal from "../Modals/actionCancelModal"
import { get, post } from '../../utils/requests'
import { checkEmpty } from '../../utils/TSV'

import { TSVUtil } from "../../utils/TSV"
import { FixedPageSize } from '../utils/FixedPageSize'


/** View for Process Wastewater Entry in DB */
const FertilizerAppEvent = (props) => {
  return (

    <FixedPageSize container item xs={12} key='pwae' height='375px' style={{ marginBottom: "40px", marginTop: "15px", ...props.style }}>

      {
        props.fertilizers.sort((a, b) => naturalSortBy(a, b, 'app_date')).map((fertilizer, i) => {
          return (
            <FertilizerAppEventCard
              fertilizer={fertilizer}
              onDelete={props.onDelete}
              index={i}
              key={`fap_${i}`}
            />
          )
        })
      }
    </FixedPageSize>
  )
}

const FertilizerAppEventCard = withTheme((props) => {
  const { app_date, app_method, croptitle, import_desc, amount_applied, material_type, moisture, n_con, p_con, k_con
  } = props.fertilizer
  return (
    <Grid item xs={12} md={4} lg={3}>
      <Card variant="outlined" key={`pwwaer${props.index}`} className='showOnHoverParent'>
        <CardContent>
          <Grid item xs={12} align='right'>
            <Typography variant='caption' >
              <Tooltip title='Sample date' placement="top">
                <span style={{ color: props.theme.palette.secondary.main }}>
                  {` ${formatDate(splitDate(app_date))}`}
                </span>
              </Tooltip>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='subtitle1' >
              <span style={{ color: props.theme.palette.primary.main }}>
                {` ${croptitle} ${app_method}`}
              </span>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle1' >
              <span style={{ color: props.theme.palette.secondary.main }}>
                {` ${import_desc} ${material_type}`}
              </span>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='caption'>

              N: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(n_con)} `}
              </span>
              P: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(p_con)} `}
              </span>
              K: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(k_con)} `}
              </span>

              Moisture: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(moisture)} `}
              </span>

            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='caption'>
              Amount applied: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(amount_applied)} `}
              </span>
            </Typography>
          </Grid>
        </CardContent>
        <CardActions>
          <Grid item xs={2}>
            <Tooltip title="Delete Nutrient Import">
              <IconButton className='showOnHover' size='small'
                onClick={() => props.onDelete(props.fertilizer)}
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

const NutrientImport = withTheme((props) => {
  const { import_date, import_desc, material_type, method_of_reporting, amount_imported, n_con, p_con, k_con, salt_con } = props.nutrientImport
  return (
    <Grid item xs={12} md={4} lg={3}>
      <Card variant="outlined" key={`pwwaer${props.index}`} className='showOnHoverParent'>
        <CardContent>
          <Grid item xs={12} align='right'>
            <Typography variant='caption' >
              <Tooltip title='Sample date' placement="top">
                <span style={{ color: props.theme.palette.secondary.main }}>
                  {` ${formatDate(splitDate(import_date))}`}
                </span>
              </Tooltip>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='subtitle1' >
              <span style={{ color: props.theme.palette.primary.main }}>
                {` ${import_desc} ${method_of_reporting}`}
              </span>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle1' >
              <span style={{ color: props.theme.palette.secondary.main }}>
                {` ${material_type}`}
              </span>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='caption'>

              N: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(n_con)} `}
              </span>
              P: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(p_con)} `}
              </span>
              K: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(k_con)} `}
              </span>
              Salt: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(salt_con)} `}
              </span>



            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='caption'>
              Amount Imported: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(amount_imported)} `}
              </span>
            </Typography>
          </Grid>
        </CardContent>
        <CardActions>
          <Grid item xs={2}>
            <Tooltip title="Delete Nutrient Import">
              <IconButton className='showOnHover' size='small'
                onClick={() => props.onConfirmNutrientImportDelete(props.nutrientImport)}
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


/** Component handles showing Process Wastewater Application events.
 *  - Process Waste Water List view
 *  - Upload TSV
 *  - Add Process Wastewater
 *  - Delete Process Wastewater
 * 
 *  NEEDS:
 *  - fieldCropAppEvents: applications events for the dairy
 *  - field_crop_app_process_wastewater: Process wastewater events
 * 
 */
class Fertilizer extends Component {
  constructor(props) {
    super(props)


    this.state = {
      dairy_id: props.dairy_id,
      fieldCropAppEvents: [],
      nutrientImports: [],
      fieldCropAppFertilizers: {},
      // fieldCropAppFertilizersKeys: Object.keys(props.fieldCropAppFertilizers).sort((a, b) => a < b ? -1 : 1),
      tsvType: props.tsvType,
      numCols: props.numCols,

      showAddNutrientImportModal: false,
      showAddFertilizerModal: false,
      showConfirmDeleteNutrientImportModal: false,
      showConfirmDeleteFertilizerModal: false,
      showAnalyses: 'none',
      deleteNutrientImportObj: {},
      deleteFertilizerObj: {},
      showUploadFieldCropAppFertilizerTSVModal: false,
      tsvFile: '',
      uploadedFilename: '',
      showViewTSVsModal: false,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      toggleShowDeleteAllModal: false,
      viewFieldKey: '',
      viewPlantDateKey: '',
      createNutrientImportObj: {
        dairy_id: '',
        import_desc: '',
        import_date: new Date(),
        material_type: '',
        material_type_idx: 0,
        amount_imported: '',
        method_of_reporting: '',
        method_of_reporting_idx: 0,
        moisture: '',
        n_con: '',
        p_con: '',
        k_con: '',
        salt_con: ''

      },
      createFertilizerObj: {
        dairy_id: '',
        field_crop_app_id: '',
        field_crop_app_idx: 0,
        nutrient_import_id: '',
        nutrient_import_idx: 0,
        amount_applied: '',
        n_lbs_acre: '',
        p_lbs_acre: '',
        k_lbs_acre: '',
        salt_lbs_acre: ''
      },
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }

  componentDidMount() {
    this.getFieldCropAppEvents()
    this.getFieldCropAppFertilizer()
    this.getNutrientImport()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.dairy_id !== prevState.dairy_id || this.props.parentUpdated !== prevProps.parentUpdated) {
      this.getFieldCropAppEvents()
      this.getFieldCropAppFertilizer()
      this.getNutrientImport()
    }
  }

  getFieldCropAppEvents() {
    get(`${this.props.BASE_URL}/api/field_crop_app/${this.state.dairy_id}`)
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

  getFieldCropAppFertilizer() {
    get(`${this.props.BASE_URL}/api/field_crop_app_fertilizer/${this.state.dairy_id}`)
      .then(res => {
        let fieldCropAppFertilizers = nestedGroupBy(res, ['fieldtitle', 'plant_date'])
        const keys = Object.keys(fieldCropAppFertilizers).sort(naturalSort)
        if (keys.length > 0) {
          this.setState({ fieldCropAppFertilizers: fieldCropAppFertilizers, viewFieldKey: keys[0] })
        } else {
          this.setState({ fieldCropAppFertilizers: {}, viewFieldKey: '' })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  getNutrientImport() {
    get(`${this.props.BASE_URL}/api/nutrient_import/${this.state.dairy_id}`)
      .then(res => {

        this.setState({ nutrientImports: res })
      })
      .catch(err => {
        console.log(err)
      })
  }

  getAppEventsByViewKeys() {
    // Returns a list of objects for the selected viewFieldKey && viewPlantDateKey
    if (this.state.viewFieldKey && this.state.viewPlantDateKey && this.state.fieldCropAppFertilizers[this.state.viewFieldKey] &&
      this.state.fieldCropAppFertilizers[this.state.viewFieldKey][this.state.viewPlantDateKey]) {
      return this.state.fieldCropAppFertilizers[this.state.viewFieldKey][this.state.viewPlantDateKey]
    }
    return []
  }

  /** Manually add Process Wastewater */
  toggleShowAddNutrientImportModal(val) {
    this.setState({ showAddNutrientImportModal: val })
  }
  toggleShowAddFertilizerModal(val) {
    this.setState({ showAddFertilizerModal: val })
  }
  onCreateNutrientImportChange(ev) {
    const { name, value } = ev.target
    let createNutrientImportObj = this.state.createNutrientImportObj
    createNutrientImportObj[name] = value
    this.setState({ createNutrientImportObj: createNutrientImportObj })
  }
  onCreateFertilizerChange(ev) {
    const { name, value } = ev.target
    let createFertilizerObj = this.state.createFertilizerObj
    createFertilizerObj[name] = value
    this.setState({ createFertilizerObj: createFertilizerObj })
  }
  createFertilizer() {
    let createObj = this.state.createFertilizerObj
    createObj.dairy_id = this.state.dairy_id
    createObj.field_crop_app_id = this.state.fieldCropAppEvents[createObj.field_crop_app_idx].pk
    createObj.nutrient_import_id = this.state.nutrientImports[createObj.nutrient_import_idx].pk

    createObj.amount_applied = checkEmpty(createObj.amount_applied)

    createObj.n_lbs_acre = checkEmpty(createObj.n_lbs_acre)
    createObj.p_lbs_acre = checkEmpty(createObj.p_lbs_acre)
    createObj.k_lbs_acre = checkEmpty(createObj.k_lbs_acre)
    createObj.salt_lbs_acre = checkEmpty(createObj.salt_lbs_acre)

    console.log("creating fertilizer event: ", createObj)
    post(`${this.props.BASE_URL}/api/field_crop_app_fertilizer/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddFertilizerModal(false)
        this.getFieldCropAppFertilizer()
      })
      .catch(err => {
        console.log(err)
      })
  }
  createNutrientImport() {
    let createObj = this.state.createNutrientImportObj
    createObj.dairy_id = this.state.dairy_id
    createObj.material_type = this.props.NUTRIENT_IMPORT_MATERIAL_TYPES[createObj.material_type_idx]
    createObj.method_of_reporting = this.props.REPORTING_METHODS[createObj.method_of_reporting_idx]

    createObj.moisture = checkEmpty(createObj.moisture)
    createObj.n_con = checkEmpty(createObj.n_con)
    createObj.p_con = checkEmpty(createObj.p_con)
    createObj.k_con = checkEmpty(createObj.k_con)
    createObj.salt_con = checkEmpty(createObj.salt_con)

    console.log("creating nutirent import event: ", createObj)

    post(`${this.props.BASE_URL}/api/nutrient_import/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddNutrientImportModal(false)
        this.props.getNutrientImport()
      })
      .catch(err => {
        console.log(err)
      })
  }
  /** Delete Process Wastewater entry */
  toggleShowConfirmDeleteFertilizerModal(val) {
    this.setState({ showConfirmDeleteFertilizerModal: val })
  }
  toggleShowConfirmDeleteNutrientImportModal(val) {
    this.setState({ showConfirmDeleteNutrientImportModal: val })
  }
  onConfirmNutrientImportDelete(deleteNutrientImportObj) {
    this.setState({ showConfirmDeleteNutrientImportModal: true, deleteNutrientImportObj: deleteNutrientImportObj })
  }
  onConfirmFertilizerDelete(deleteFertilizerObj) {
    this.setState({ showConfirmDeleteFertilizerModal: true, deleteFertilizerObj: deleteFertilizerObj })
  }
  onFertilizerDelete() {
    if (Object.keys(this.state.deleteFertilizerObj).length > 0) {
      post(`${this.props.BASE_URL}/api/field_crop_app_fertilizer/delete`, {
        pk: this.state.deleteFertilizerObj.pk,
        dairy_id: this.state.dairy_id
      })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteFertilizerModal(false)
          this.getFieldCropAppFertilizer()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
  onNutrientImportDelete() {
    if (Object.keys(this.state.deleteNutrientImportObj).length > 0) {
      post(`${this.props.BASE_URL}/api/nutrient_import/delete`, {
        pk: this.state.deleteNutrientImportObj.pk,
        dairy_id: this.state.dairy_id
      })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteNutrientImportModal(false)
          this.props.getNutrientImport()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
  /** TSV: toggle, onChange, onUpload, View */
  toggleShowUploadFieldCropAppFertilizerTSVModal(val) {
    this.setState({
      showUploadFieldCropAppFertilizerTSVModal: val,
      tsvFile: "",
      uploadedFilename: ""
    })
  }
  onUploadFieldCropAppFreshwateTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      this.setState({ tsvFile: files[0], uploadedFilename: files[0].name })

    }
  }
  async onUploadFieldCropAppFreshwateTSV() {
    // 24 columns from TSV
    let dairy_id = this.state.dairy_id


    try {
      const result = await TSVUtil.uploadTSV(this.state.tsvFile, this.state.tsvType, this.state.uploadedFilename, dairy_id)
      console.log("Upload TSV result: ", this.state.tsvType, result)
      this.toggleShowUploadFieldCropAppFertilizerTSVModal(false)
      this.getFieldCropAppFertilizer()
      this.getNutrientImport()
      this.props.onAlert('Uploaded!', 'success')
    } catch (e) {
      console.log("Error with all promises")
      console.log(e)
      this.props.onAlert('Failed uploading!', 'error')
    }

    // uploadNutrientApp(this.state.tsvFile, this.state.tsvType, dairy_pk)
    //   .then(res => {
    //     console.log("Completed uploading Fertilizer TSV")
    //     uploadTSVToDB(this.state.uploadedFilename, this.state.tsvFile, this.state.dairy_id, this.state.tsvType)
    //     this.toggleShowUploadFieldCropAppFertilizerTSVModal(false)
    //     this.getFieldCropAppFertilizer()
    //     this.getNutrientImport()
    //     this.props.onAlert('Success!', 'success')
    //   })
    //   .catch(err => {
    //     console.log("Error with all promises")
    //     console.log(err)
    //     this.props.onAlert('Failed uploading.', 'error')
    //   })
  }


  toggleViewTSVsModal(val) {
    this.setState({ showViewTSVsModal: val })
  }

  renderItem({ index, style }) {
    let field_crop_app_id = this.getSortedKeys()[index]
    let fertilizers = this.state.fieldCropAppFertilizers[field_crop_app_id]
    return (
      <FertilizerAppEvent key={`fcafviewfertzs${index}`} style={style}
        fertilizers={fertilizers}
        onDelete={this.onConfirmFertilizerDelete.bind(this)}
      />
    )
  }

  getItemSize(index) {
    let field_crop_app_id = this.getSortedKeys()[index]
    let numRows = this.state.fieldCropAppFertilizers[field_crop_app_id].length
    let headerSize = 80
    let itemSize = 165
    return headerSize + (numRows * itemSize)
  }

  setWindowListener() {
    window.addEventListener('resize', (ev) => {
      this.setState({ windowHeight: window.innerHeight, windowWidth: window.innerWidth })
    })
  }

  getStartPos() {

    let numAnalyses = parseInt(this.state.nutrientImports.length / 2)
    let headerSize = 0
    let analysisSectionSize = 32 + (120 * numAnalyses)
    return headerSize + analysisSectionSize
  }
  getSortedKeys() {
    return Object.keys(this.state.fieldCropAppFertilizers).sort()
  }
  confirmDeleteAllFromTable(val) {
    this.setState({ toggleShowDeleteAllModal: val })
  }
  deleteAllFromTable() {
    Promise.all([
      post(`${this.props.BASE_URL}/api/field_crop_app_fertilizer/deleteAll`, { dairy_id: this.state.dairy_id }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy_id, tsvType: this.props.tsvType }),
    ])
      .then(res => {
        this.getFieldCropAppEvents()
        this.getFieldCropAppFertilizer()
        this.getNutrientImport()
        this.confirmDeleteAllFromTable(false)
      })
      .catch(err => {
        console.log(err)
      })
  }

  toggleShowAnalyses() {
    this.setState({ showAnalyses: this.state.showAnalyses === 'none' ? 'flex' : this.state.showAnalyses === 'flex' ? 'none' : 'flex' })
  }

  render() {

    return (
      <Grid item xs={12} container >
        <Grid item xs={12} container >

          <Grid item xs={10} align="right">
            <Tooltip title='Upload TSV'>
              <IconButton color="primary" variant="outlined"
                onClick={() => this.toggleShowUploadFieldCropAppFertilizerTSVModal(true)}
              >
                <CloudUpload />
              </IconButton>
            </Tooltip>
          </Grid>

          <Grid item xs={1} align="right">
            <Tooltip title='View Uploaded TSVs'>
              <IconButton color="secondary" variant="outlined"
                onClick={() => this.toggleViewTSVsModal(true)}
              >
                <WbCloudyIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs={1} align='right'>
            <Tooltip title='Delete all Commercial Fertilizers'>
              <IconButton onClick={() => this.confirmDeleteAllFromTable(true)}>
                <DeleteSweepIcon color='error' />
              </IconButton>
            </Tooltip>
          </Grid>

          {/* <Grid item xs={1} align="right">
            <Tooltip title='Add nutrient import'>
              <IconButton color="secondary" variant="outlined"
                onClick={() => this.toggleShowAddNutrientImportModal(true)}
              >
                <ShowChartIcon />
              </IconButton>
            </Tooltip>
          </Grid>

          <Grid item xs={1} align="right">
            <Tooltip title='Add fertilizer to application event'>
              <IconButton color="secondary" variant="outlined"
                onClick={() => this.toggleShowAddFertilizerModal(true)}
              >
                <SpeakerNotesIcon />
              </IconButton>
            </Tooltip>
          </Grid> */}
        </Grid>

        <ViewTSVsModal
          open={this.state.showViewTSVsModal}
          actionText={"" /* no action text*/}
          cancelText="Close"
          dairy_id={this.state.dairy_id}
          tsvType={this.state.tsvType}
          onClose={() => this.toggleViewTSVsModal(false)}
          BASE_URL={this.props.BASE_URL}
        />
        <UploadTSVModal
          open={this.state.showUploadFieldCropAppFertilizerTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Fertilizer TSV`}
          fileType="csv"
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppFreshwateTSV.bind(this)}
          onChange={this.onUploadFieldCropAppFreshwateTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppFertilizerTSVModal(false)}
        />
        <Grid item xs={12}>
          {this.state.nutrientImports.length > 0 ?
            <React.Fragment>

              <Grid item xs={12} >
                <div style={{ display: 'flex' }}>
                  <Typography variant="h5" style={{ alignSelf: 'center' }} >Nutrient Imports (Fertilizers)</Typography>
                  <Tooltip title='Show'>
                    <IconButton onClick={this.toggleShowAnalyses.bind(this)}>
                      <ExpandMoreIcon color='primary' />
                    </IconButton>
                  </Tooltip>
                </div>

              </Grid>

              <FixedPageSize container item xs={12} key='pwae' height='375px' style={{ marginBottom: "40px", marginTop: "15px", display: this.state.showAnalyses }}>
                {
                  this.state.nutrientImports.map((nutrientImport, i) => {
                    return (
                      <NutrientImport key={`fcafviewni${i}`}
                        nutrientImport={nutrientImport}
                        onConfirmNutrientImportDelete={this.onConfirmNutrientImportDelete.bind(this)}
                      />
                    )
                  })
                }
              </FixedPageSize>
            </React.Fragment>
            :
            <React.Fragment></React.Fragment>

          }

        </Grid>


        <Grid item container xs={12} style={{ marginTop: '16px' }}>
          {renderFieldButtons(this.state.fieldCropAppFertilizers, this)}
          {renderCropButtons(this.state.fieldCropAppFertilizers, this.state.viewFieldKey, this)}
          <Grid item xs={12} style={{ marginTop: '16px' }}>
            <CurrentFieldCrop
              viewFieldKey={this.state.viewFieldKey}
              viewPlantDateKey={this.state.viewPlantDateKey}
            />

          </Grid>
          <FixedPageSize container item xs={12} height='375px'>
            {this.getAppEventsByViewKeys().length > 0 ?
              <FertilizerAppEvent
                fertilizers={this.getAppEventsByViewKeys()}
                onDelete={this.onConfirmFertilizerDelete.bind(this)}
              />
              :
              <React.Fragment></React.Fragment>
            }
          </FixedPageSize>
        </Grid>

        {/* {this.getSortedKeys().length > 0 ?
          <Grid item xs={12} style={{ marginTop: "32px" }}>
            <List
              height={Math.max(this.state.windowHeight - this.getStartPos(), 100)}
              itemCount={this.getSortedKeys().length}
              itemSize={this.getItemSize.bind(this)}
              width={this.state.windowWidth * (.82)}
            >
              {this.renderItem.bind(this)}
            </List>
          </Grid>
          :
          <React.Fragment></React.Fragment>
        } */}


        <ActionCancelModal
          open={this.state.showConfirmDeleteNutrientImportModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Nutrient Import for: 
            ${formatDate(splitDate(this.state.deleteNutrientImportObj.import_date))} - 
            ${this.state.deleteNutrientImportObj.import_desc}?
          `}
          onAction={this.onNutrientImportDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteNutrientImportModal(false)}
        />
        <ActionCancelModal
          open={this.state.toggleShowDeleteAllModal}
          actionText="Delete all"
          cancelText="Cancel"
          modalText={`Delete All Fertilizer Application Events?`}
          onAction={this.deleteAllFromTable.bind(this)}
          onClose={() => this.confirmDeleteAllFromTable(false)}
        />

        <ActionCancelModal
          open={this.state.showConfirmDeleteFertilizerModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Fertilizer for: ${formatDate(splitDate(this.state.deleteFertilizerObj.app_date))}?`}
          onAction={this.onFertilizerDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteFertilizerModal(false)}
        />

        <AddNutrientImportModal
          open={this.state.showAddNutrientImportModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add nutrient import`}
          NUTRIENT_IMPORT_MATERIAL_TYPES={this.props.NUTRIENT_IMPORT_MATERIAL_TYPES}
          REPORTING_METHODS={this.props.REPORTING_METHODS}
          createNutrientImportObj={this.state.createNutrientImportObj}
          onAction={this.createNutrientImport.bind(this)}
          onChange={this.onCreateNutrientImportChange.bind(this)}
          onClose={() => this.toggleShowAddNutrientImportModal(false)}
        />

        <AddFertilizerModal
          open={this.state.showAddFertilizerModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add fertilizer app event`}

          createFertilizerObj={this.state.createFertilizerObj}
          nutrientImports={this.state.nutrientImports}
          fieldCropAppEvents={this.state.fieldCropAppEvents}
          onAction={this.createFertilizer.bind(this)}
          onChange={this.onCreateFertilizerChange.bind(this)}
          onClose={() => this.toggleShowAddFertilizerModal(false)}
        />
      </Grid>
    )
  }
}

export default Fertilizer = withRouter(withTheme(Fertilizer))
