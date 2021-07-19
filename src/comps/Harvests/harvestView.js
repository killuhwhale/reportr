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

import { get, post } from '../../utils/requests';

const BASE_URL = "http://localhost:3001"





class HarvestViewTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      // field_crop_harvests: props.field_crop_harvests
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }

  componentDidUpdate() {

  }

  render() {
    return (
      <Grid item xs={12} style={{ marginBottom: "32px" }}>

      </Grid>
    )
  }
}
HarvestViewTable = withRouter(withTheme(HarvestViewTable))

class HarvestView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      field_crop_harvests: props.field_crop_harvests,
      delFieldCropHarvestObj: {},
      showDeleteFieldCropHarvestModal: false
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }

  toggleShowDeleteFieldCropHarvestModal(val) {
    this.setState({ showDeleteFieldCropHarvestModal: val })
  }


  onDeleteFieldCropHarvest(harvest) {
    console.log("Deleting Field Crop Harvest", harvest)
    this.setState({ delFieldCropHarvestObj: harvest, showDeleteFieldCropHarvestModal: true})
  }

  deleteFieldCropHarvest() {
    console.log("Deleting field crop harvest obj", this.state.delFieldCropHarvestObj)
    post(`${BASE_URL}/api/field_crop_harvest/delete`, {pk: this.state.delFieldCropHarvestObj.pk})
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
          {this.state.field_crop_harvests.map((harvest, i) => {
            return (
              <Grid item container xs={12}>
                <Grid item xs={10}>
                  {harvest.harvest_date} / {harvest.fieldtitle} / {harvest.croptitle} / {harvest.actual_yield} / N:{harvest.actual_n} / P:{harvest.actual_p} / K:{harvest.actual_k}
                </Grid>
                <Grid item xs={2}>
                  <Tooltip title="Delete Harvest event">
                    <IconButton onClick={() => this.onDeleteFieldCropHarvest(harvest)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            )
          })}
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
