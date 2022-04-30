import React, { Component } from 'react'
import {
  Grid, Typography, IconButton, Tooltip,
  Card, CardContent, CardActions
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';
import { VariableSizeList as List } from "react-window";

import ActionCancelModal from "../Modals/actionCancelModal"
import { get, post } from '../../utils/requests'
import { MG_KG, KG_MG } from '../../utils/convertCalc'
import { renderFieldButtons, renderCropButtons, CurrentFieldCrop } from '../Applications/selectButtonGrid'
import { formatDate, formatFloat, naturalSort, naturalSortBy, nestedGroupBy, percentageAsMGKG, splitDate } from '../../utils/format'
import { FixedPageSize } from '../utils/FixedPageSize'


/** Displays field_crop_harvest entries
 *      -includes fields and field_crop information
 * Handles:
 *  - Delete field_crop_harvest
 *
 */
const HarvestEventCard = withTheme((props) => {
  const { croptitle, harvest_date, actual_n, actual_p, actual_k, tfs } = props.harvest
  return (

    <Grid item xs={12} md={4} lg={3} className='showOnHoverParent'>
      <Card variant="outlined" key={`pwwaer${props.index}`}>
        <CardContent>
          <Grid item xs={12} align='right'>
            <Typography variant='caption'>
              <Tooltip title='Application date' placement="top">
                <span style={{ color: props.theme.palette.secondary.main }}>
                  {` ${formatDate(splitDate(harvest_date))}`}
                </span>
              </Tooltip>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle1' >
              <span style={{ color: props.theme.palette.primary.main }}>
                {` ${croptitle}`}
              </span>
            </Typography>
          </Grid>



          <Grid item xs={12}>
            <Typography variant='caption'>
              N: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(actual_n)} `}
              </span>
              P: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(actual_p)} `}
              </span>
              K: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(actual_k)} `}
              </span>
              TFS: <span style={{ color: props.theme.palette.secondary.main }}>
                {`${formatFloat(tfs)} `}
              </span>
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
})

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
    const formattedHarvestDate = formatDate(splitDate(harvest.harvest_date))
    this.setState({ delFieldCropHarvestObj: { ...harvest, harvest_date: formattedHarvestDate }, showDeleteFieldCropHarvestModal: true })
  }
  deleteFieldCropHarvest() {
    console.log("Deleting field crop harvest obj", this.state.delFieldCropHarvestObj)
    post(`${this.props.BASE_URL}/api/field_crop_harvest/delete`, {
      pk: this.state.delFieldCropHarvestObj.pk,
      dairy_id: this.state.dairy.pk
    }
    )
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

          <FixedPageSize container item xs={12} height='375px' >
            {this.getAppEventsByViewKeys().length > 0 ?
              <HarvestEvent
                harvests={this.getAppEventsByViewKeys()}
                onDelete={this.onDeleteFieldCropHarvest.bind(this)}
              />
              :
              <React.Fragment></React.Fragment>
            }
          </FixedPageSize>
        </Grid>


        <ActionCancelModal
          open={this.state.showDeleteFieldCropHarvestModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Are you sure you want to delete: 
            ${this.state.delFieldCropHarvestObj.fieldtitle} - 
            ${this.state.delFieldCropHarvestObj.croptitle} - 
            ${this.state.delFieldCropHarvestObj.harvest_date}
          `}
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
