import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import formats from "../../utils/format"

import UploadTSVModal from "../Modals/uploadTSVModal"
import ViewTSVsModal from "../Modals/viewTSVsModal"

import AddFreshwaterSourceModal from "../Modals/addFreshwaterSourceModal"
import ActionCancelModal from "../Modals/actionCancelModal"
import { timePickerDefaultProps } from '@material-ui/pickers/constants/prop-types'
import { get, post } from '../../utils/requests'

import {
  readTSV, processTSVText, createFieldSet, createFieldsFromTSV, createDataFromTSVListRow, uploadTSVToDB
} from "../../utils/TSV" 

const BASE_URL = "http://localhost:3001"
const MATERIAL_TYPES = [
  '',
  'Process wastewater',
  'Process wastewater sludge',
]

/** View for Process Wastewater Entry in DB */
const FreshwaterAppEvent = (props) => {
  let freshwaters = props.freshwaters
  let { fieldtitle } = freshwaters[0]

  return (<span>Testy</span>)
  // return (
  //   <Grid container item xs={12} style={{ marginBottom: "40px", marginTop: "15px" }}>
  //     <Grid item xs={12}>
  //       <Typography variant="h3">
  //         {fieldtitle}
  //       </Typography>
  //       <hr />
  //     </Grid>

  //     {
  //       process_wastewaters.map((wastewater, i) => {
  //         let {
  //           app_desc, material_type, kn_con, nh4_con, nh3_con, no3_con, p_con, k_con, tds, ec, ph, totaln, totalp, totalk, amount_applied, app_date, croptitle, plant_date
  //         } = wastewater
  //         return (
  //           <Grid item container xs={12} key={`pwwviews${i}`} component={Paper} elevation={6} style={{ marginBottom: "30px" }}>
  //             <Grid item container xs={12}>
  //               <Grid item xs={6}>
  //                 <Typography variant="subtitle1">
  //                   {croptitle}
  //                 </Typography>
  //               </Grid>
  //               <Grid item xs={6} align="right">
  //                 <Typography variant="subtitle1">
  //                   Planted: {plant_date.split('T')[0]}
  //                 </Typography>
  //               </Grid>


  //               <Grid item container xs={12}>
  //                 <Grid item xs={6}>
  //                   <Typography variant="subtitle2">
  //                     {app_desc} | Material Type: {material_type}
  //                   </Typography>
  //                 </Grid>

  //                 <Grid item xs={6} align="right">
  //                   <Typography variant="subtitle2">
  //                     Date Applied: {app_date.split('T')[0]}
  //                   </Typography>
  //                 </Grid>
  //                 <Grid item xs={12} align="right">
  //                   <Typography variant="subtitle2">
  //                     Amount Applied: {amount_applied} gals
  //                   </Typography>
  //                 </Grid>

  //               </Grid>

  //             </Grid>

  //             <Grid item container xs={10}>

  //               <Grid item xs={3}>
  //                 <TextField disabled
  //                   label="Kjeldahl-nitrogen"
  //                   value={kn_con}
  //                 />
  //               </Grid>
  //               <Grid item xs={3}>
  //                 <TextField disabled
  //                   label="Ammonium-nitrogen"
  //                   value={nh4_con}
  //                 />
  //               </Grid>
  //               <Grid item xs={3}>
  //                 <TextField disabled
  //                   label="NH3-N"
  //                   value={nh3_con}
  //                 />
  //               </Grid>
  //               <Grid item xs={3}>
  //                 <TextField disabled
  //                   label="Nitrate-nitrogen"
  //                   value={no3_con}
  //                 />
  //               </Grid>
  //               <Grid item xs={3}>
  //                 <TextField disabled
  //                   label="Total phosphorus"
  //                   value={p_con}
  //                 />
  //               </Grid>
  //               <Grid item xs={3}>
  //                 <TextField disabled
  //                   label="Total potassium "
  //                   value={k_con}
  //                 />
  //               </Grid>
  //               <Grid item xs={3}>
  //                 <TextField disabled
  //                   label="TDS"
  //                   value={tds}
  //                 />
  //               </Grid>



  //               <Grid item xs={3}>
  //                 <TextField disabled
  //                   label="EC"
  //                   value={ec}
  //                 />
  //               </Grid>
  //               <Grid item xs={3}>
  //                 <TextField disabled
  //                   label="N lbs/acre"
  //                   value={totaln}
  //                 />
  //               </Grid>
  //               <Grid item xs={3}>
  //                 <TextField disabled
  //                   label="P lbs / acre"
  //                   value={totalp}
  //                 />
  //               </Grid>
  //               <Grid item xs={3}>
  //                 <TextField disabled
  //                   label="K lbs / acre"
  //                   value={totalk}
  //                 />
  //               </Grid>
  //             </Grid>

  //             <Grid item container xs={2} justifyContent="center" alignItems="center">
  //               <Tooltip title="Delete Process wastewater">
  //                 <IconButton onClick={() => props.onDelete(wastewater)}>
  //                   <DeleteIcon color="error" />
  //                 </IconButton>
  //               </Tooltip>
  //             </Grid>

  //           </Grid>

  //         )
  //       })
  //     }

  //   </Grid>
  // )
}


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
class Freshwater extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      fieldCropAppEvents: props.fieldCropAppEvents,
      fieldCropAppFreshwaterSources: props.fieldCropAppFreshwaterSources,
      fieldCropAppFreshwaterAnalyses: props.fieldCropAppFreshwaterAnalyses,
      fieldCropAppFreshwaters: props.fieldCropAppFreshwaters,
      tsvType: props.tsvType,
      numCols: props.numCols,
      showAddFreshwaterSourceModal: false,
      showAddFreshwaterAnalysisModal: false,
      showAddFreshwaterModal: false,
      showConfirmDeleteFreshwaterSourceModal: false,
      showConfirmDeleteFreshwaterAnalysisModal: false,
      showConfirmDeleteFreshwaterModal: false,
      deleteFreshwaterSourceObj: {},
      deleteFreshwaterAnalysisObj: {},
      deleteFreshwaterObj: {},
      showUploadFieldCropAppFreshwateTSVModal: false,
      tsvText: '',
      uploadedFilename: '',
      showViewTSVsModal: false,
      createFreshwaterSourceObj: {
        src_desc: "",
        src_type: "",
        dairy_id: props.dairy_id
      },
      createFreshwaterAnalysisObj: {
        dairy_id: props.dairy_id
      },
      createFreshwaterObj: {
        dairy_id: props.dairy_id,
        app_event_idx: 0,
      },
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }

  /** Manually add Process Wastewater */
  toggleShowAddFreshwaterSourceModal(val) {
    this.setState({ showAddFreshwaterSourceModal: val })
  }
  toggleShowAddFreshwaterAnalysisModal(val) {
    this.setState({ showAddFreshwaterAnalysisModal: val })
  }
  toggleShowAddFreshwaterModal(val) {
    this.setState({ showAddFreshwaterModal: val })
  }

  onCreateFreshwaterSourceChange(ev) {
    const { name, value } = ev.target
    let createFreshwaterSourceObj = this.state.createFreshwaterSourceObj
    createFreshwaterSourceObj[name] = value
    this.setState({ createFreshwaterSourceObj: createFreshwaterSourceObj })
  }
  onCreateFreshwaterAnalysisChange(ev) {
    const { name, value } = ev.target
    let createFreshwaterAnalysisObj = this.state.createFreshwaterAnalysisObj
    createFreshwaterAnalysisObj[name] = value
    this.setState({ createFreshwaterAnalysisObj: createFreshwaterAnalysisObj })
  }
  onCreateFreshwaterChange(ev) {
    const { name, value } = ev.target
    let createFreshwaterObj = this.state.createFreshwaterObj
    createFreshwaterObj[name] = value
    this.setState({ createFreshwaterObj: createFreshwaterObj })
  }


  createFreshwater() {
    let createObj = this.state.createFreshwaterObj
    createObj.dairy_id = this.state.dairy_id
    createObj.field_crop_app_id = this.state.fieldCropAppEvents[createObj.app_event_idx].pk

    console.log("creating freshwater event: ", createObj)
    // post(`${BASE_URL}/api/field_crop_app_freshwater/create`, createObj)
    //   .then(res => {
    //     console.log(res)
    //     this.toggleShowAddFreshwaterModal(false)
    //     this.props.getFieldCropAppFreshwater()
    //   })
    //   .catch(err => {
    //     console.log(err)
    //   })
  }
  createFreshwaterSource() {
    let createObj = this.state.createFreshwaterSourceObj
    createObj.dairy_id = this.state.dairy_id

    console.log("creating freshwater event: ", createObj)
    post(`${BASE_URL}/api/field_crop_app_freshwater_source/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddFreshwaterSourceModal(false)
        this.props.getFieldCropAppFreshwaterSource()
      })
      .catch(err => {
        console.log(err)
      })
  }
  createFreshwaterAnalysis() {
    let createObj = this.state.createFreshwaterAnalysisObj
    createObj.dairy_id = this.state.dairy_id

    console.log("creating freshwater event: ", createObj)
    post(`${BASE_URL}/api/field_crop_app_freshwater_analysis/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddFreshwaterAnalysisModal(false)
        this.props.getFieldCropAppFreshwaterAnalysis()
      })
      .catch(err => {
        console.log(err)
      })
  }


  /** Delete Process Wastewater entry */
  toggleShowConfirmDeleteFreshwaterModal(val) {
    this.setState({ showConfirmDeleteFreshwaterModal: val })
  }
  toggleShowConfirmDeleteFreshwaterSourceModal(val) {
    this.setState({ showConfirmDeleteFreshwaterSourceModal: val })
  }
  toggleShowConfirmDeleteFreshwaterAnalysisModal(val) {
    this.setState({ showConfirmDeleteFreshwaterAnalysisModal: val })
  }

  onConfirmFreshwaterSourceDelete(deleteFreshwaterSourceObj) {
    this.setState({ showConfirmDeleteFreshwaterSourceModal: true, deleteFreshwaterSourceObj: deleteFreshwaterSourceObj })
  }
  onConfirmFreshwaterAnalysisDelete(deleteFreshwaterAnalysisObj) {
    this.setState({ showConfirmDeleteFreshwaterAnalysisModal: true, deleteFreshwaterAnalysisObj: deleteFreshwaterAnalysisObj })
  }
  onConfirmFreshwaterDelete(deleteFreshwaterObj) {
    this.setState({ showConfirmDeleteFreshwaterModal: true, deleteFreshwaterObj: deleteFreshwaterObj })
  }

  onFreshwaterDelete() {
    if (Object.keys(this.state.deleteFreshwaterObj).length > 0) {
      post(`${BASE_URL}/api/field_crop_app_freshwater/delete`, { pk: this.state.deleteFreshwaterObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteFreshwaterModal(false)
          this.getFieldCropAppFreshwater()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
  onFreshwaterSourceDelete() {
    if (Object.keys(this.state.deleteFreshwaterSourceObj).length > 0) {
      post(`${BASE_URL}/api/field_crop_app_freshwater_source/delete`, { pk: this.state.deleteFreshwaterSourceObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteFreshwaterSourceModal(false)
          this.getFieldCropAppFreshwaterSource()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
  onFreshwaterAnalysisDelete() {
    if (Object.keys(this.state.deleteFreshwaterAnalysisObj).length > 0) {
      post(`${BASE_URL}/api/field_crop_app_freshwater_analysis/delete`, { pk: this.state.deleteFreshwaterAnalysisObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteFreshwaterAnalysisModal(false)
          this.getFieldCropAppFreshwaterAnalysis()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  /** TSV: toggle, onChange, onUpload, View */
  toggleShowUploadFieldCropAppFreshwateTSVModal(val) {
    this.setState({ showUploadFieldCropAppFreshwateTSVModal: val })
  }
  onUploadFieldCropAppFreshwateTSVModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      readTSV(files[0], (_ev) => {
        const { result } = _ev.target
        this.setState({ tsvText: result, uploadedFilename: files[0].name })
      })
    }
  }
  onUploadFieldCropAppFreshwateTSV() {
    // 24 columns from TSV
    let dairy_pk = this.state.dairy_id
    let rows = processTSVText(this.state.tsvText, this.state.numCols) // extract rows from Text of tsv file TODO()

    // Create a set of fields to ensure duplicates are not attempted.
    let fields = createFieldSet(rows)

    createFieldsFromTSV(fields, dairy_pk)      // Create fields before proceeding
      .then(createFieldRes => {
        let result_promises = rows.map((row, i) => {
          return createDataFromTSVListRow(row, i, dairy_pk, this.state.tsvType)    // Create entries for ea row in TSV file
        })

        Promise.all(result_promises)            // Execute promises to create field_crop && field_crop_harvet entries in the DB
          .then(res => {
            console.log("Completed uploading Process Wastewater TSV")
            uploadTSVToDB(this.state.uploadedFilename, this.state.tsvText, this.state.dairy_id, this.state.tsvType)
            this.toggleShowUploadFieldCropAppFreshwateTSVModal(false)
            this.props.getFieldCropAppFreshwater()
            this.props.getFieldCropAppFreshwaterSource()
            this.props.getFieldCropAppFreshwaterAnalysis()
          })
          .catch(err => {
            console.log("Error with all promises")
            console.log(err)
          })
      })
      .catch(createFieldErr => {
        console.log(createFieldErr)
      })
  }

  toggleViewTSVsModal(val) {
    this.setState({ showViewTSVsModal: val })
  }

  render() {
    return (
      <Grid item xs={12} container >
        <Grid item xs={12} align="right">
          <Button color="primary" variant="outlined"
            onClick={() => this.toggleShowUploadFieldCropAppFreshwateTSVModal(true)}
          >
            Upload TSV
          </Button>
          <Button color="secondary" variant="outlined"
            onClick={() => this.toggleViewTSVsModal(true)}
          >
            View Uploaded TSVs
          </Button>
        </Grid>

        <ViewTSVsModal
          open={this.state.showViewTSVsModal}
          actionText={"" /* no action text*/}
          cancelText="Close"
          dairy_id={this.state.dairy_id}
          tsvType={this.state.tsvType}
          onClose={() => this.toggleViewTSVsModal(false)}
        />
        <UploadTSVModal
          open={this.state.showUploadFieldCropAppFreshwateTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Freshwater TSV`}
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppFreshwateTSV.bind(this)}
          onChange={this.onUploadFieldCropAppFreshwateTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppFreshwateTSVModal(false)}
        />
        {this.state.fieldCropAppEvents.length > 0 ? // Render Add Process Wastewater
          <React.Fragment>

            <Grid item xs={12} align="right">
              <Button color="secondary" variant="outlined"
                onClick={() => this.toggleShowAddFreshwaterSourceModal(true)}
              >
                Add freshwater source
              </Button>
            </Grid>
            <Grid item xs={12} align="right">
              <Button color="secondary" variant="outlined"
                onClick={() => this.toggleShowAddFreshwaterModal(true)}
              >
                Add freshwater to application event
              </Button>
            </Grid>

            <Grid item xs={12}>
              {Object.keys(this.state.fieldCropAppFreshwaters).length > 0 ?
                Object.keys(this.state.fieldCropAppFreshwaters)
                  .sort((a, b) => a.fieldtitle > b.fieldtitle ? -1 : 1)
                  .map((field_crop_app_id, i) => {
                    let freshwaters = this.state.fieldCropAppFreshwaters[field_crop_app_id]
                    return (
                      <FreshwaterAppEvent key={`ppwwviewrow${i}`}
                        freshwaters={freshwaters}
                        onDelete={this.onConfirmFreshwaterDelete.bind(this)}
                      />
                    )
                  })
                :
                <React.Fragment></React.Fragment>
              }
            </Grid>

            <ActionCancelModal
              open={this.state.showConfirmDeleteFreshwaterModal}
              actionText="Delete"
              cancelText="Cancel"
              modalText={`Delete Freshwater for ${this.state.deleteFreshwaterObj.fieldtitle} - ${this.state.deleteFreshwaterObj.app_date}?`}

              onAction={this.onFreshwaterDelete.bind(this)}
              onClose={() => this.toggleShowConfirmDeleteFreshwaterModal(false)}
            />
            <AddFreshwaterSourceModal
              open={this.state.showAddFreshwaterSourceModal}
              actionText="Add"
              cancelText="Cancel"
              modalText={`Add freshwater source`}

              createFreshwaterSourceObj={this.state.createFreshwaterSourceObj}
              
              onAction={this.createFreshwaterSource.bind(this)}
              onChange={this.onCreateFreshwaterSourceChange.bind(this)}
              onClose={() => this.toggleShowAddFreshwaterSourceModal(false)}
            />
          </React.Fragment>
          :
          <React.Fragment></React.Fragment>
        }

      </Grid>
    )
  }
}

export default Freshwater = withRouter(withTheme(Freshwater))
