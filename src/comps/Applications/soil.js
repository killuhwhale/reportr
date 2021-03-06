import React, { Component } from 'react'
import {
  Grid, Typography, IconButton, Tooltip,
  Card, CardContent, CardActions
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import { CloudUpload } from '@material-ui/icons'
import WbCloudyIcon from '@material-ui/icons/WbCloudy' // viewTSV
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import { formatDate, formatFloat, groupByKeys, naturalSortBy, splitDate } from "../../utils/format"
import { VariableSizeList as List } from "react-window";

import UploadTSVModal from "../Modals/uploadTSVModal"
import ViewTSVsModal from "../Modals/viewTSVsModal"
import { naturalSort, nestedGroupBy } from "../../utils/format"
import { renderFieldButtons, renderCropButtons, CurrentFieldCrop } from './selectButtonGrid'
import ActionCancelModal from "../Modals/actionCancelModal"
import { get, post } from '../../utils/requests'
import {
  SOIL, TSVUtil
} from "../../utils/TSV"
import { FixedPageSize } from '../utils/FixedPageSize'



/** View for Process Wastewater Entry in DB */
const SoilView = (props) => {
  const soils = props && props.soils ? props.soils : []
  // const headerInfo = soils && soils.length > 0 ? soils[0] : {}

  return (
    <Grid container item xs={12} style={{ marginBottom: "40px", marginTop: "15px", ...props.style }}>
      {soils.sort((a, b) => naturalSortBy(a, b, 'app_date')).map((soil, i) => {
        return (
          <SoilViewCard key={`pwwaer_${i}`}
            soil={soil}
            onDelete={props.onDelete}
            index={i}
          />
        )
      })}
    </Grid>
  )
}

const SoilViewCard = withTheme((props) => {
  let {
    app_method, n_con_0, p_con_0, k_con_0,
    n_con_1, p_con_1, k_con_1, n_con_2, p_con_2, k_con_2,
    sample_date_0, sample_date_1, sample_date_2,
    croptitle, app_date
  } = props.soil

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
                {` ${croptitle}: ${app_method}`}
              </span>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='caption'>
              Sample date: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatDate(splitDate(sample_date_0))} `}
              </span>
              N: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(n_con_0)} `}
              </span>

              P: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(p_con_0)} `}
              </span>
              K: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(k_con_0)} `}
              </span>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='caption'>
              Sample date: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatDate(splitDate(sample_date_1))} `}
              </span>
              N: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(n_con_1)} `}
              </span>

              P: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(p_con_1)} `}
              </span>
              K: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(k_con_1)} `}
              </span>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='caption'>
              Sample date: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatDate(splitDate(sample_date_2))} `}
              </span>
              N: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(n_con_2)} `}
              </span>

              P: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(p_con_2)} `}
              </span>
              K: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(k_con_2)} `}
              </span>
            </Typography>
          </Grid>

        </CardContent>
        <CardActions>
          <Grid item xs={2}>
            <Tooltip title="Delete Wastewater Analysis">
              <IconButton className='showOnHover' size='small'
                onClick={() => props.onDelete(props.soil)}
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

const SoilAnalysisView = withTheme((props) => {
  const analyses = props && props.analyses ? props.analyses : []
  const headerInfo = analyses && analyses.length > 0 ? analyses[0] : {}
  return (

    <Grid item xs={12} >
      <Grid item xs={12}>
        <Typography variant='h6'>
          {headerInfo.title}
        </Typography>
      </Grid>
      <div style={{ display: 'flex' }}>
        {analyses.map((analysis, i) => {
          return (
            <Card variant="outlined" key={`pwwaer_${props.index}_${i}`} className='showOnHoverParent'>
              <CardContent>
                <Grid item xs={12} align='right'>
                  <Typography variant='caption' >
                    <Tooltip title='Sample date' placement="top">
                      <span style={{ color: props.theme.palette.secondary.main }}>
                        {` ${formatDate(splitDate(analysis.sample_date))}`}
                      </span>
                    </Tooltip>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' >
                    <span style={{ color: props.theme.palette.primary.main }}>
                      {` ${analysis.sample_desc}`}
                    </span>
                  </Typography>
                </Grid>


                <Grid item xs={12}>
                  <Typography variant='caption'>

                    N: <span style={{ color: props.theme.palette.secondary.main }}>
                      {`${formatFloat(analysis.kn_con)} `}
                    </span>
                    P: <span style={{ color: props.theme.palette.secondary.main }}>
                      {`${formatFloat(analysis.p_con)} `}
                    </span>
                    K: <span style={{ color: props.theme.palette.secondary.main }}>
                      {`${formatFloat(analysis.k_con)} `}
                    </span>
                    EC: <span style={{ color: props.theme.palette.secondary.main }}>
                      {`${formatFloat(analysis.ec)} `}
                    </span>



                  </Typography>
                </Grid>

              </CardContent>
              <CardActions>
                <Grid item xs={2}>
                  <Tooltip title="Delete Soil Analysis">
                    <IconButton className='showOnHover' size='small'
                      onClick={() => props.onDelete(analysis)}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </CardActions>
            </Card>
          )
        })}

      </div>
    </Grid>
  )
})




class Soil extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      field_crop_app_soil: {},
      field_crop_app_soil_analysis: {},
      tsvType: SOIL,
      showAddSoilModal: false,
      showConfirmDeleteSoilModal: false,
      showConfirmDeleteSoilAnalysisModal: false,
      showUploadFieldCropAppSoilTSVModal: false,
      showAnalyses: 'none',
      deleteSoilObj: {},
      deleteSoilAnalysisObj: {},
      tsvFile: "",
      uploadedFilename: "",
      toggleShowDeleteAllModal: false,

      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      showViewTSVsModal: false,
      viewFieldKey: '',
      viewPlantDateKey: '',
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }
  componentDidMount() {
    // this.setWindowListener()
    this.getFieldCropAppSoils()
    this.getFieldCropAppSoilAnalyses()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.dairy_id !== this.state.dairy_id || this.props.parentUpdated !== prevProps.parentUpdated) {
      this.getFieldCropAppSoils()
      this.getFieldCropAppSoilAnalyses()
    }
  }

  getFieldCropAppSoils() {
    get(`${this.props.BASE_URL}/api/field_crop_app_soil/${this.state.dairy_id}`)
      .then(res => {
        if (res.error) {
          console.log(res.error)
          return
        }

        let soilByFieldTitle = nestedGroupBy(res, ['fieldtitle', 'plant_date'])
        const keys = Object.keys(soilByFieldTitle).sort(naturalSort)
        if (keys.length > 0) {
          this.setState({ field_crop_app_soil: soilByFieldTitle, viewFieldKey: keys[0] })
        } else {
          this.setState({ field_crop_app_soil: {}, viewFieldKey: '' })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  getFieldCropAppSoilAnalyses() {
    get(`${this.props.BASE_URL}/api/field_crop_app_soil_analysis/${this.state.dairy_id}`)
      .then(field_crop_app_soil_analysis => {
        this.setState({ field_crop_app_soil_analysis: groupByKeys(field_crop_app_soil_analysis, ['field_id']) })
      })
  }

  getAppEventsByViewKeys() {
    // Returns a list of objects for the selected viewFieldKey && viewPlantDateKey
    if (this.state.viewFieldKey && this.state.viewPlantDateKey && this.state.field_crop_app_soil[this.state.viewFieldKey] &&
      this.state.field_crop_app_soil[this.state.viewFieldKey][this.state.viewPlantDateKey]) {
      return this.state.field_crop_app_soil[this.state.viewFieldKey][this.state.viewPlantDateKey]
    }
    return []
  }

  toggleShowConfirmDeleteSoilModal(val) {
    this.setState({ showConfirmDeleteSoilModal: val })
  }
  onConfirmSoilDelete(deleteSoilObj) {
    this.setState({ showConfirmDeleteSoilModal: true, deleteSoilObj })
  }
  onSoilDelete() {
    if (Object.keys(this.state.deleteSoilObj).length > 0) {
      post(`${this.props.BASE_URL}/api/field_crop_app_soil/delete`, {
        pk: this.state.deleteSoilObj.pk,
        dairy_id: this.state.dairy_id
      })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteSoilModal(false)
          this.getFieldCropAppSoils()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }


  toggleShowConfirmDeleteSoilAnalysisModal(val) {
    this.setState({ showConfirmDeleteSoilAnalysisModal: val })
  }
  onConfirmSoilAnalysisDelete(deleteSoilAnalysisObj) {
    console.log("onConfirmDel: ", deleteSoilAnalysisObj)
    this.setState({ showConfirmDeleteSoilAnalysisModal: true, deleteSoilAnalysisObj })
  }
  onSoilAnalysisDelete() {
    if (Object.keys(this.state.deleteSoilAnalysisObj).length > 0) {
      post(`${this.props.BASE_URL}/api/field_crop_app_soil_analysis/delete`, {
        pk: this.state.deleteSoilAnalysisObj.pk,
        dairy_id: this.state.dairy_id
      })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteSoilAnalysisModal(false)
          this.getFieldCropAppSoilAnalyses()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }


  /** TSV: toggle, onChange, onUpload, View */
  toggleShowUploadFieldCropAppSoilTSVModal(val) {
    this.setState({
      showUploadFieldCropAppSoilTSVModal: val,
      tsvFile: "",
      uploadedFilename: ""
    })
  }
  onUploadFieldCropAppSoilTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      this.setState({ tsvFile: files[0], uploadedFilename: files[0].name })

    }
  }
  async onUploadFieldCropAppSoilTSV() {
    // 24 columns from TSV
    let dairy_id = this.state.dairy_id
    try {
      const result = await TSVUtil.uploadTSV(this.state.tsvFile, this.state.tsvType, this.state.uploadedFilename, dairy_id)
      console.log("Upload TSV result: ", this.state.tsvType, result)
      this.toggleShowUploadFieldCropAppSoilTSVModal(false)
      this.getFieldCropAppSoils()
      this.getFieldCropAppSoilAnalyses()
      this.props.onAlert('Uploaded!', 'success')
    } catch (e) {
      console.log("Error with all promises")
      console.log(e)
      this.props.onAlert('Failed uploading!', 'error')
    }


    // uploadNutrientApp(this.state.tsvFile, this.state.tsvType, dairy_pk)
    //   .then(res => {
    //     console.log("Completed uploading Process Wastewater TSV", res)
    //     uploadTSVToDB(this.state.uploadedFilename, this.state.tsvFile, this.state.dairy_id, this.state.tsvType)
    //     this.toggleShowUploadFieldCropAppSoilTSVModal(false)
    //     this.getFieldCropAppSoils()
    //     this.getFieldCropAppSoilAnalyses()
    //     this.props.onAlert('Success!', 'success')
    //   })
    //   .catch(err => {
    //     console.log("Error with all promises")
    //     console.log(err)
    //     this.props.onAlert('Failed uploading', 'error')
    //   })
  }

  toggleViewTSVsModal(val) {
    this.setState({ showViewTSVsModal: val })
  }

  getSoilSortedKeys() {
    return Object.keys(this.state.field_crop_app_soil).sort()
  }
  getSoilAnalysisSortedKeys() {
    return Object.keys(this.state.field_crop_app_soil_analysis).sort()
  }

  renderSoilAnalysis({ index, style }) {
    let key = this.getSoilAnalysisSortedKeys()[index]
    let analyses = this.state.field_crop_app_soil_analysis[key]
    return (
      <SoilAnalysisView key={`fcsaview${index}`} style={style}
        analyses={analyses}
        onDelete={this.onConfirmSoilAnalysisDelete.bind(this)}
      />
    )
  }
  renderSoil({ index, style }) {
    let key = this.getSoilSortedKeys()[index]
    let soils = this.state.field_crop_app_soil[key]
    return (
      <SoilView key={`fcsview${index}`} style={style}
        soils={soils}
        onDelete={this.onConfirmSoilDelete.bind(this)}
      />
    )
  }

  getSoilAnalysisSize(index) {
    let key = this.getSoilAnalysisSortedKeys()[index]
    let num = this.state.field_crop_app_soil_analysis[key].length
    return 90 + (75 * num)
  }
  getSoilSize(index) {
    let key = this.getSoilSortedKeys()[index]
    let num = this.state.field_crop_app_soil[key].length
    return 80 + (75 * num)
  }
  setWindowListener() {
    window.addEventListener('resize', (ev) => {
      this.setState({ windowHeight: window.innerHeight, windowWidth: window.innerWidth })
    })
  }
  confirmDeleteAllFromTable(val) {
    this.setState({ toggleShowDeleteAllModal: val })
  }
  deleteAllFromTable() {
    Promise.all([
      post(`${this.props.BASE_URL}/api/field_crop_app_soil/deleteAll`, { dairy_id: this.state.dairy_id }),
      post(`${this.props.BASE_URL}/api/tsv/type/delete`, { dairy_id: this.state.dairy_id, tsvType: this.props.tsvType }),
    ])
      .then(res => {
        this.getFieldCropAppSoils()
        this.getFieldCropAppSoilAnalyses()
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
        <Grid item xs={10} align="right">
          <Tooltip title='Upload TSV'>
            <IconButton color="primary" variant="outlined"
              onClick={() => this.toggleShowUploadFieldCropAppSoilTSVModal(true)}
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
          <Tooltip title='Delete all Soil'>
            <IconButton onClick={() => this.confirmDeleteAllFromTable(true)}>
              <DeleteSweepIcon color='error' />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Grid item xs={12} >
            <div style={{ display: 'flex' }}>
              <Typography variant="h5" style={{ alignSelf: 'center' }} >Analyses</Typography>
              <Tooltip title='Show'>
                <IconButton onClick={this.toggleShowAnalyses.bind(this)}>
                  <ExpandMoreIcon color='primary' />
                </IconButton>
              </Tooltip>
            </div>

          </Grid>
          {this.getSoilAnalysisSortedKeys().length > 0 ?
            <FixedPageSize item xs={12} height='375px' style={{ display: this.state.showAnalyses }}>
              <List
                height={250}
                itemCount={this.getSoilAnalysisSortedKeys().length}
                itemSize={this.getSoilAnalysisSize.bind(this)}
                width={this.state.windowWidth * (.82)}
              >
                {this.renderSoilAnalysis.bind(this)}
              </List>
            </FixedPageSize>
            :
            <React.Fragment></React.Fragment>
          }
        </Grid>

        <Grid item container xs={12}>
          {renderFieldButtons(this.state.field_crop_app_soil, this)}
          {renderCropButtons(this.state.field_crop_app_soil, this.state.viewFieldKey, this)}
          <CurrentFieldCrop
            viewFieldKey={this.state.viewFieldKey}
            viewPlantDateKey={this.state.viewPlantDateKey}
          />
          <FixedPageSize container item xs={12} height='375px'>
            {this.getAppEventsByViewKeys().length > 0 ?
              <SoilView
                soils={this.getAppEventsByViewKeys()}
                onDelete={this.onConfirmSoilDelete.bind(this)}
              />
              :
              <React.Fragment></React.Fragment>
            }
          </FixedPageSize>
        </Grid>
        {/* <Grid item xs={12}>
          <Typography variant='h3'>Soil Applications</Typography>
          {this.getSoilSortedKeys().length > 0 ?
            <List
              height={Math.max(this.state.windowHeight - 500, 100)}
              itemCount={this.getSoilSortedKeys().length}
              itemSize={this.getSoilSize.bind(this)}
              width={this.state.windowWidth * (.82)}
            >
              {this.renderSoil.bind(this)}
            </List>
            :
            <React.Fragment></React.Fragment>
          }
        </Grid> */}


        <ActionCancelModal
          open={this.state.showConfirmDeleteSoilModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Soil for: 
            ${this.state.deleteSoilObj.fieldtitle} - 
            ${formatDate(splitDate(this.state.deleteSoilObj.app_date))}?
          `}

          onAction={this.onSoilDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteSoilModal(false)}
        />

        <ActionCancelModal
          open={this.state.toggleShowDeleteAllModal}
          actionText="Delete all"
          cancelText="Cancel"
          modalText={`Delete All Soil Sample Events?`}
          onAction={this.deleteAllFromTable.bind(this)}
          onClose={() => this.confirmDeleteAllFromTable(false)}
        />

        <ActionCancelModal
          open={this.state.showConfirmDeleteSoilAnalysisModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Soil Analysis for: 
            ${this.state.deleteSoilAnalysisObj.sample_desc} - 
            ${formatDate(splitDate(this.state.deleteSoilAnalysisObj.sample_date))}?
            `}
          onAction={this.onSoilAnalysisDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteSoilAnalysisModal(false)}
        />

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
          open={this.state.showUploadFieldCropAppSoilTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Soil TSV`}
          fileType="csv"
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppSoilTSV.bind(this)}
          onChange={this.onUploadFieldCropAppSoilTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppSoilTSVModal(false)}
        />
      </Grid>
    )
  }
}

export default Soil = withRouter(withTheme(Soil))
