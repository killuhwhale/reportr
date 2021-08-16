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


// import AddNutrientImportModal from "../Modals/addNutrientImportModal"
// import AddFertilizerModal from "../Modals/addFertilizerModal"
import ActionCancelModal from "../Modals/actionCancelModal"
import { timePickerDefaultProps } from '@material-ui/pickers/constants/prop-types'
import { get, post } from '../../utils/requests'
import { checkEmpty } from '../../utils/TSV'

import {
  readTSV, processTSVText, createFieldSet, createFieldsFromTSV, createDataFromTSVListRow, uploadTSVToDB
} from "../../utils/TSV"

const BASE_URL = "http://localhost:3001"

//Move to appnutrient and pass as prop
const SOURCE_OF_ANALYSES = [
  'Lab Analysis',
  'Other/ Estimated',
]



/** View for Process Wastewater Entry in DB */
const FertilizerAppEvent = (props) => {
  return (<span>Test FertilizerAppEvent</span>)
  // return (
  //   <Grid item container xs={12}>
  //     <Grid item xs={12}>
  //       <Typography variant="h4">{props.fertilizers[0].fieldtitle}</Typography>
  //       <hr />
  //     </Grid>
  //     {
  //       props.fertilizers.map((fertilizer, i) => {
  //         return (
  //           <Grid item container xs={12} key={`fwmainview${i}`}>
  //             <Grid item xs={6}>
  //               <Typography variant="subtitle1">{fertilizer.croptitle}</Typography>
  //             </Grid>
  //             <Grid item xs={6} align="right">
  //               <Typography variant="subtitle1">Planted: {fertilizer.plant_date}</Typography>
  //             </Grid>
  //             <Grid item xs={6}>
  //               <Typography variant="subtitle2">{fertilizer.sample_desc} | {fertilizer.src_desc}</Typography>
  //             </Grid>
  //             <Grid item xs={6} align="right">
  //               <Typography variant="subtitle2">Applied: {fertilizer.app_date}</Typography>
  //             </Grid>
  //             <Grid item container xs={10}>
  //               <Grid item xs={3}>
  //                 <TextField disabled
  //                   label="Amount Applied"
  //                   value={fertilizer.amount_applied}
  //                   fullWidth
  //                 />
  //               </Grid>
  //               <Grid item xs={2}>
  //                 <TextField disabled
  //                   label="Nitrogen lbs / acre"
  //                   value={fertilizer.n_lbs_acre}
  //                 />
  //               </Grid>
  //               <Grid item xs={3}>
  //                 <TextField disabled
  //                   label="Phosphorus lbs / acre"
  //                   value={fertilizer.p_lbs_acre}
  //                   fullWidth
  //                 />
  //               </Grid>
  //               <Grid item xs={2}>
  //                 <TextField disabled
  //                   label="Potassium lbs / acre"
  //                   value={fertilizer.k_lbs_acre}
  //                 />
  //               </Grid>
  //               <Grid item xs={2}>
  //                 <TextField disabled
  //                   label="Salt lbs / acre"
  //                   value={fertilizer.salt_lbs_acre}
  //                 />
  //               </Grid>
  //             </Grid>
  //             <Grid item container xs={2} justifyContent="center" >
  //               <Tooltip title="Delete Fertilizer Event">
  //                 <IconButton onClick={() => props.onConfirmFertilizerDelete(fertilizer)}>
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

const NutrientImport = (props) => {
  return (<span>Test FertilizerAppEvent</span>)
  // return (
  //   <Grid item container xs={6}>
  //     <Grid item xs={10}>
  //       <Typography>{props.analysis.sample_date} / {props.analysis.sample_desc}</Typography>
  //     </Grid>
  //     <Grid item xs={2}>
  //       <Tooltip title="Delete Fertilizer Source">
  //         <IconButton onClick={() => props.onConfirmNutrientImportDelete(props.analysis)}>
  //           <DeleteIcon color="error" />
  //         </IconButton>
  //       </Tooltip>
  //     </Grid>
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
class Fertilizer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      fieldCropAppEvents: props.fieldCropAppEvents,
      nutrientImports: props.nutrientImports,
      fieldCropAppFertilizers: props.fieldCropAppFertilizers,
      tsvType: props.tsvType,
      numCols: props.numCols,

      showAddNutrientImportModal: false,
      showAddFertilizerModal: false,
      showConfirmDeleteNutrientImportModal: false,
      showConfirmDeleteFertilizerModal: false,
      deleteNutrientImportObj: {},
      deleteFertilizerObj: {},
      showUploadFieldCropAppFertilizerTSVModal: false,
      tsvText: '',
      uploadedFilename: '',
      showViewTSVsModal: false,

      createNutrientImportObj: {
        dairy_id: '',
        import_desc: '',
        import_date: '',
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
    createObj.field_crop_app_fertilizer_analysis_id = this.state.nutrientImports[createObj.field_crop_app_fertilizer_analysis_idx].pk

    createObj.amount_applied = checkEmpty(createObj.amount_applied)
    createObj.amt_applied_per_acre = checkEmpty(createObj.amt_applied_per_acre)
    createObj.n_lbs_acre = checkEmpty(createObj.n_lbs_acre)
    createObj.p_lbs_acre = checkEmpty(createObj.p_lbs_acre)
    createObj.k_lbs_acre = checkEmpty(createObj.k_lbs_acre)
    createObj.salt_lbs_acre = checkEmpty(createObj.salt_lbs_acre)

    console.log("creating fertilizer event: ", createObj)
    post(`${BASE_URL}/api/field_crop_app_fertilizer/create`, createObj)
      .then(res => {
        console.log(res)
        this.toggleShowAddFertilizerModal(false)
        this.props.getFieldCropAppFertilizer()
      })
      .catch(err => {
        console.log(err)
      })
  }

  createNutrientImport() {
    let createObj = this.state.createNutrientImportObj
    createObj.dairy_id = this.state.dairy_id
    createObj.src_of_analysis = this.props.SOURCE_OF_ANALYSES[createObj.src_of_analysis_idx]
    createObj.material_type = this.props.MATERIAL_TYPES[createObj.material_type_idx]
    createObj.method_of_reporting = this.props.REPORTING_METHODS[createObj.method_of_reporting_idx]

    createObj.moisture = checkEmpty(createObj.moisture)
    createObj.n_con = checkEmpty(createObj.n_con)
    createObj.p_con = checkEmpty(createObj.p_con)
    createObj.k_con = checkEmpty(createObj.k_con)
    createObj.ca_con = checkEmpty(createObj.ca_con)
    createObj.mg_con = checkEmpty(createObj.mg_con)
    createObj.na_con = checkEmpty(createObj.na_con)
    createObj.s_con = checkEmpty(createObj.s_con)
    createObj.cl_con = checkEmpty(createObj.cl_con)
    createObj.tfs = checkEmpty(createObj.tfs)

    console.log("creating fertilizer event: ", createObj)

    post(`${BASE_URL}/api/nutrient_import/create`, createObj)
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
      post(`${BASE_URL}/api/field_crop_app_fertilizer/delete`, { pk: this.state.deleteFertilizerObj.pk })
        .then(res => {
          console.log(res)
          this.toggleShowConfirmDeleteFertilizerModal(false)
          this.props.getFieldCropAppFertilizer()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  onNutrientImportDelete() {
    if (Object.keys(this.state.deleteNutrientImportObj).length > 0) {
      post(`${BASE_URL}/api/nutrient_import/delete`, { pk: this.state.deleteNutrientImportObj.pk })
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
    this.setState({ showUploadFieldCropAppFertilizerTSVModal: val })
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
            console.log("Completed uploading Fertilizer TSV")
            uploadTSVToDB(this.state.uploadedFilename, this.state.tsvText, this.state.dairy_id, this.state.tsvType)
            this.toggleShowUploadFieldCropAppFertilizerTSVModal(false)
            this.props.getFieldCropAppFertilizer()
            this.props.getNutrientImport()
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
            onClick={() => this.toggleShowUploadFieldCropAppFertilizerTSVModal(true)}
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
          open={this.state.showUploadFieldCropAppFertilizerTSVModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Upload Fertilizer TSV`}
          uploadedFilename={this.state.uploadedFilename}
          onAction={this.onUploadFieldCropAppFreshwateTSV.bind(this)}
          onChange={this.onUploadFieldCropAppFreshwateTSVModalChange.bind(this)}
          onClose={() => this.toggleShowUploadFieldCropAppFertilizerTSVModal(false)}
        />

        <Grid item xs={12} align="right">
          <Button color="secondary" variant="outlined"
            onClick={() => this.toggleShowAddNutrientImportModal(true)}
          >
            Add nutrient import 
          </Button>
        </Grid>
        <Grid item xs={12} align="right">
          <Button color="secondary" variant="outlined"
            onClick={() => this.toggleShowAddFertilizerModal(true)}
          >
            Add fertilizer to application event
          </Button>
        </Grid>


        <Grid item xs={12}>
          {this.state.nutrientImports.length > 0 ?
            <React.Fragment>
              <Typography variant="h5">Nutrient Imports (Fertilizer)</Typography>
              <Grid item container xs={12}>
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
              </Grid>
            </React.Fragment>
            :
            <React.Fragment></React.Fragment>

          }

        </Grid>

        <Grid item xs={12}>
          {Object.keys(this.state.fieldCropAppFertilizers).length > 0 ?

            Object.keys(this.state.fieldCropAppFertilizers)
              .sort((a, b) => a.fieldtitle > b.fieldtitle ? -1 : 1)
              .map((field_crop_app_id, i) => {
                let fertilizers = this.state.fieldCropAppFertilizers[field_crop_app_id]
                return (
                  <FertilizerAppEvent key={`fcafviewfertzs${i}`}
                    fertilizers={fertilizers}
                    onDelete={this.onConfirmFertilizerDelete.bind(this)}
                  />
                )
              })
            :
            <React.Fragment></React.Fragment>
          }
        </Grid>


        <ActionCancelModal
          open={this.state.showConfirmDeleteNutrientImportModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Nutrient Import for ${this.state.deleteNutrientImportObj.import_date} - ${this.state.deleteNutrientImportObj.import_desc}?`}

          onAction={this.onNutrientImportDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteNutrientImportModal(false)}
        />
        <ActionCancelModal
          open={this.state.showConfirmDeleteFertilizerModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Delete Fertilizer for ${this.state.deleteFertilizerObj.app_date}?`}

          onAction={this.onFertilizerDelete.bind(this)}
          onClose={() => this.toggleShowConfirmDeleteFertilizerModal(false)}
        />



        {/* Here ya go buddy, implement these manana :)
            You also need to fix your branches, currently updating backup :(

        <AddNutrientImportModal
          open={this.state.showAddNutrientImportModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add nutrient import`}
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
        /> */}



      </Grid>
    )
  }
}

export default Fertilizer = withRouter(withTheme(Fertilizer))
