import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers';
import DeleteIcon from '@material-ui/icons/Delete'
import AddIcon from '@material-ui/icons/Add'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';
import ActionCancelModal from "../Modals/actionCancelModal"
import { get, post } from '../../utils/requests'
import { MG_KG, KG_MG } from '../../utils/convertCalc'

const BASE_URL = "http://localhost:3001"


/** Displays field_crop_harvest entries
 *      -includes fields and field_crop information
 * Handles:
 *  - Delete field_crop_harvest
 *
 */

class HarvestView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      field_crop_harvests: props.field_crop_harvests,
      groupedField_crop_harvests: props.groupedField_crop_harvests,
      delFieldCropHarvestObj: {},
      showDeleteFieldCropHarvestModal: false
    }
    this.collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }

  toggleShowDeleteFieldCropHarvestModal(val) {
    this.setState({ showDeleteFieldCropHarvestModal: val })
  }
  onDeleteFieldCropHarvest(harvest) {
    console.log("Deleting Field Crop Harvest", harvest)
    this.setState({ delFieldCropHarvestObj: harvest, showDeleteFieldCropHarvestModal: true })
  }
  deleteFieldCropHarvest() {
    console.log("Deleting field crop harvest obj", this.state.delFieldCropHarvestObj)
    post(`${BASE_URL}/api/field_crop_harvest/delete`, { pk: this.state.delFieldCropHarvestObj.pk })
      .then(res => {
        console.log(res)
        this.toggleShowDeleteFieldCropHarvestModal(false)
        this.props.getAllFieldCropHarvests()
      })
      .catch(err => {
        console.log(err)
      })
  }

  render() {

    // Changes to the inner data of the object doesnt trigger a render state change
    return (
      <React.Fragment>

        <Grid item container xs={12}>


          {Object.keys(this.state.groupedField_crop_harvests).length > 0 ?

            Object.keys(this.state.groupedField_crop_harvests).sort(this.collator.compare)
            .map(fieldKey => {
              let plant_dates_obj = this.state.groupedField_crop_harvests[fieldKey]
              if (plant_dates_obj) {
                return (
                  <Grid item xs={12} key={`hv${fieldKey}`} style={{ marginBottom: "32px" }}>
                    <Typography variant="h3">{fieldKey}</Typography>
                    {
                      Object.keys(plant_dates_obj).map(plant_dateKey => {
                        return (
                          <Grid item container xs={12} style={{ marginBottom: "16px" }} key={`hv${plant_dateKey}`}>
                            <Grid item align="right" xs={12}>
                              <Typography variant="h5">Planted: {plant_dateKey}</Typography>
                            </Grid>
                            {
                              plant_dates_obj[plant_dateKey].map((harvest, i) => {
                                return (
                                  <React.Fragment key={`hvh${harvest.pk}`}>
                                    <Grid item xs={12}>
                                      <Typography variant="subtitle1">
                                        {harvest.croptitle}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={11} container>
                                      <Grid item xs={4}>
                                        <TextField disabled
                                          label="Harvest Date"
                                          value={harvest.harvest_date}
                                          style={{ width: "100%" }}
                                        />
                                      </Grid>
                                      <Grid item xs={2}>
                                        <TextField
                                          label="Yield (total tons)"
                                          name="actual_yield"
                                          value={harvest.actual_yield}
                                          onChange={(ev) => this.props.onChange(i, harvest, ev)}
                                          style={{ width: "100%" }}
                                        />
                                      </Grid>
                                      <Grid item xs={2}>
                                        <TextField disabled
                                          label="Reporting Basis"
                                          value={harvest.basis}
                                          style={{ width: "100%" }}
                                        />
                                      </Grid>
                                      <Grid item xs={2}>
                                        <TextField disabled
                                          label="Density (lbs/cu ft)"
                                          value={parseFloat(harvest.density)}
                                          style={{ width: "100%" }}
                                        />
                                      </Grid>
                                      <Grid item xs={2}>
                                        <TextField
                                          label="Moisture %"
                                          name="actual_moisture"
                                          value={harvest.actual_moisture}
                                          onChange={(ev) => this.props.onChange(i, harvest, ev)}
                                          style={{ width: "100%" }}
                                        />
                                      </Grid>
                                      <Grid item xs={2}>
                                        <TextField
                                          label="Nitrogen (mg/ kg)"
                                          name="actual_n"
                                          value={MG_KG(harvest.actual_n)}
                                          onChange={(ev) => this.props.onChange(i, harvest, ev)}
                                          style={{ width: "100%" }}
                                        />
                                      </Grid>
                                      <Grid item xs={2}>
                                        <TextField
                                          label="Phosphorus"
                                          name="actual_p"
                                          value={MG_KG(harvest.actual_p)}
                                          onChange={(ev) => this.props.onChange(i, harvest, ev)}
                                          style={{ width: "100%" }}
                                        />
                                      </Grid>
                                      <Grid item xs={2}>
                                        <TextField
                                          label="Potassium"
                                          name="actual_k"
                                          value={MG_KG(harvest.actual_k)}
                                          onChange={(ev) => this.props.onChange(i, harvest, ev)}
                                          style={{ width: "100%" }}
                                        />
                                      </Grid>
                                      <Grid item xs={2}>
                                        <TextField disabled
                                          label="Salt"
                                          name="salt"
                                          // value={harvest.salt}
                                          value="0"
                                          onChange={(ev) => this.props.onChange(i, harvest, ev)}
                                          style={{ width: "100%" }}
                                        />
                                      </Grid>
                                      <Grid item xs={2}>
                                        <TextField
                                          label="TFS (%)"
                                          name="tfs"
                                          value={parseFloat(harvest.tfs).toFixed(2)}
                                          onChange={(ev) => this.props.onChange(i, harvest, ev)}
                                          style={{ width: "100%" }}
                                        />
                                      </Grid>
                                    </Grid>
                                    <Grid item xs={1} align="center">
                                      <Tooltip title="Delete Harvest event">
                                        <IconButton onClick={() => this.onDeleteFieldCropHarvest(harvest)}>
                                          <DeleteIcon color="error" />
                                        </IconButton>
                                      </Tooltip>
                                    </Grid>

                                  </React.Fragment>)
                              })
                            }
                          </Grid>
                        )

                      })
                    }
                  </Grid>
                )
              } else {
                return (<React.Fragment />)
              }
            })
            :
            <React.Fragment></React.Fragment>
          }
        </Grid>

        <ActionCancelModal
          open={this.state.showDeleteFieldCropHarvestModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Are you sure you want to delete: ${this.state.delFieldCropHarvestObj.harvest_date} / ${this.state.delFieldCropHarvestObj.fieldtitle} / ${this.state.delFieldCropHarvestObj.croptitle}`}
          onAction={() => {
            this.deleteFieldCropHarvest()
            this.toggleShowDeleteFieldCropHarvestModal(false)
          }
          }
          onClose={() => this.toggleShowDeleteFieldCropHarvestModal(false)}

        />
      </React.Fragment>

    )
  }
}

export default HarvestView = withRouter(withTheme(HarvestView))
