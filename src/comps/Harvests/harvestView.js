import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField,
  Card, CardContent, CardActions
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import AddIcon from '@material-ui/icons/Add'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';
import { VariableSizeList as List } from "react-window";
import {
  DatePicker
} from '@material-ui/pickers'
import ActionCancelModal from "../Modals/actionCancelModal"
import { get, post } from '../../utils/requests'
import { MG_KG, KG_MG } from '../../utils/convertCalc'
import { renderFieldButtons, renderCropButtons, CurrentFieldCrop } from '../Applications/selectButtonGrid'
import { formatFloat, naturalSort, naturalSortBy, nestedGroupBy, percentageAsMGKG } from '../../utils/format'

/** Displays field_crop_harvest entries
 *      -includes fields and field_crop information
 * Handles:
 *  - Delete field_crop_harvest
 *
 */
const HarvestEventCard = (props) => {
  const { croptitle, harvest_date, actual_n, actual_p, actual_k, tfs } = props.harvest
  return (
    <Grid item xs={3} className='showOnHoverParent'>
      <Card variant="outlined" key={`pwwaer${props.index}`}>
        <CardContent>
          <Typography>
            {croptitle}
          </Typography>
          <DatePicker label="Harvest Date"
            value={harvest_date}
            open={false}
          />
          <Grid item xs={12}>
            <Typography variant='caption'>
              {`N ${formatFloat(percentageAsMGKG(actual_n))} P ${formatFloat(percentageAsMGKG(actual_p))}`}
            </Typography><br />
            <Typography variant='caption'>
              {` K ${formatFloat(percentageAsMGKG(actual_k))} TFS ${formatFloat(tfs)} `}
            </Typography>
          </Grid>
        </CardContent>
        <CardActions>
          <Tooltip title="Delete Process wastewater">
            <IconButton className='showOnHover'
              onClick={() => props.onDelete(props.harvest)}
            >
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Grid>
  )
}

const HarvestEvent = (props) => {
  return (
    <Grid item container xs={12}>
      {
        props.harvests.sort((a, b) => naturalSortBy(a, b, 'harvest_date')).map((harvest, i) => {
          return (
            <HarvestEventCard
              harvest={harvest}
              onDelete={props.onDelete}
              key={`harvestevent${i}`}
            />
          )
        })
      }
    </Grid>
  )
}

class HarvestView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      fieldCropHarvests: {},
      delFieldCropHarvestObj: {},
      showDeleteFieldCropHarvestModal: false,
      viewFieldKey: '',
      viewPlantDateKey: '',
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }
  componentDidMount() {
    this.formatHarvests()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.dairy.pk !== this.state.dairy.pk || prevProps.fieldCropHarvestEvents !== this.props.fieldCropHarvestEvents) {
      this.formatHarvests()
    }
  }


  formatHarvests() {
    let harvestByFieldtitle = nestedGroupBy(this.props.fieldCropHarvestEvents, ['fieldtitle', 'plant_date'])
    const keys = Object.keys(harvestByFieldtitle).sort(naturalSort)
    if (keys.length > 0) {
      this.setState({ fieldCropHarvests: harvestByFieldtitle, viewFieldKey: keys[0] })
    } else {
      this.setState({ fieldCropHarvests: {}, viewFieldKey: '' })
    }
  }
  getAppEventsByViewKeys() {
    // Returns a list of objects for the selected viewFieldKey && viewPlantDateKey
    if (this.state.viewFieldKey && this.state.viewPlantDateKey && this.state.fieldCropHarvests[this.state.viewFieldKey] &&
      this.state.fieldCropHarvests[this.state.viewFieldKey][this.state.viewPlantDateKey]) {
      return this.state.fieldCropHarvests[this.state.viewFieldKey][this.state.viewPlantDateKey]
    }
    return []
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
    post(`${this.props.BASE_URL}/api/field_crop_harvest/delete`, { pk: this.state.delFieldCropHarvestObj.pk })
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
    return (
      <React.Fragment>
        <Grid item container xs={12}>
          {renderFieldButtons(this.state.fieldCropHarvests, this)}
          {renderCropButtons(this.state.fieldCropHarvests, this.state.viewFieldKey, this)}
          <Grid item xs={12} style={{ marginTop: '16px' }}>
            <CurrentFieldCrop
              viewFieldKey={this.state.viewFieldKey}
              viewPlantDateKey={this.state.viewPlantDateKey}
            />
          </Grid>

          {this.getAppEventsByViewKeys().length > 0 ?
            <HarvestEvent
              harvests={this.getAppEventsByViewKeys()}
              onDelete={this.onDeleteFieldCropHarvest.bind(this)}
            />
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
