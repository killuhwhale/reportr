import React, { Component } from 'react'
import {
  Grid, Typography, IconButton, Tooltip,
  Card, CardContent, CardActions
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';
import ActionCancelModal from "../Modals/actionCancelModal"

import { renderFieldButtons, renderCropButtons, CurrentFieldCrop } from '../Applications/selectButtonGrid'
import { post } from '../../utils/requests';
import { formatDate, formatFloat, naturalSort, naturalSortBy, nestedGroupBy, splitDate } from '../../utils/format';
import { FixedPageSize } from '../utils/FixedPageSize'


const FieldCrop = withTheme((props) => {
  return (


    props.fieldCrops && props.fieldCrops.sort((a, b) => naturalSortBy(a, b, 'plant_date')).map((fieldCrop, i) => {
      const { croptitle, plant_date, n, p, k, salt,
      } = fieldCrop
      return (
        <Card variant="outlined" key={`fieldCrop${props.index}`} className='showOnHoverParent'>
          <CardContent>

            <Grid item xs={12} align='right'>
              <Typography variant='caption'>
                <Tooltip title='Application date' placement="top">
                  <span style={{ color: props.theme.palette.secondary.main }}>
                    {` ${formatDate(splitDate(plant_date))}`}
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
                {`N ${formatFloat(n)} P ${formatFloat(p)} K ${formatFloat(k)} TFS ${formatFloat(salt)} `}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='caption'>
                N: <span style={{ color: props.theme.palette.secondary.main }}>
                  {`${formatFloat(n)} `}
                </span>
                P: <span style={{ color: props.theme.palette.secondary.main }}>
                  {`${formatFloat(p)} `}
                </span>
                K: <span style={{ color: props.theme.palette.secondary.main }}>
                  {`${formatFloat(k)} `}
                </span>
                TFS: <span style={{ color: props.theme.palette.secondary.main }}>
                  {`${formatFloat(salt)} `}
                </span>
              </Typography>
            </Grid>
          </CardContent>
          <CardActions>
            <Tooltip title="Delete Field Crop">
              <IconButton className='showOnHover'
                onClick={() => props.onDelete(fieldCrop)}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Tooltip>
          </CardActions>
        </Card>
      )
    })



  )
})


class CropView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      field_crops: props.field_crops,
      delFieldCropObj: {},
      showDeleteFieldCropModal: false,
      viewFieldKey: '',
      viewPlantDateKey: '',
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }
  componentDidMount() {
    this.formatFieldCrops()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.dairy.pk !== this.state.dairy.pk || this.state.field_crops_list.length !== prevState.field_crops_list.length) {
      this.formatFieldCrops()
    }
  }

  formatFieldCrops() {
    let fieldCropsByFieldtitle = nestedGroupBy(this.state.field_crops_list, ['fieldtitle', 'plant_date'])
    const keys = Object.keys(fieldCropsByFieldtitle).sort(naturalSort)
    if (keys.length > 0) {
      this.setState({ field_crops: fieldCropsByFieldtitle, viewFieldKey: keys[0] })
    } else {
      this.setState({ field_crops: {}, viewFieldKey: '' })
    }
  }

  getFieldCropsByViewKeys() {
    // Returns a list of objects for the selected viewFieldKey && viewPlantDateKey
    if (this.state.viewFieldKey && this.state.viewPlantDateKey && this.state.field_crops[this.state.viewFieldKey] &&
      this.state.field_crops[this.state.viewFieldKey][this.state.viewPlantDateKey]) {
      return this.state.field_crops[this.state.viewFieldKey][this.state.viewPlantDateKey]
    }
    return []
  }

  onFieldCropChange(ev, key, index) {
    let updates = this.state.convertedFieldCrops
    let updateField = updates[key]  // key is the field which is a list of field_crops

    if (!ev.target) {
      updateField[index]["plant_date"] = ev      // ev is the date,
    } else {
      const { name, value } = ev.target
      if (!value) {
        return
      }
      updateField[index][name] = value      // set value of field_crop @ inde
    }
    this.setState({ convertedFieldCrops: updates })
  }
  updateFieldCrops() {
    /**
     * converted field crops lools like
     * 
     * field_crops = {
     *  field_id: [{        // field_crop obj
     *    acres_planted: 2,
     *    typical_yield: 2,
     *    moisture: 2,
     *    n: 0, p: 2, k: 2, salt: 2
     * }],
     * field_id2: [{},...]  // field_list
     * }
     */
    const field_crops = this.state.convertedFieldCrops
    let promises = []
    Object.keys(field_crops).forEach(field_id => {
      let field_list = field_crops[field_id] // list of field_crop objects by field_id
      field_list.forEach(field_crop => {
        const { pk, plant_date, acres_planted, typical_yield, moisture, n, p, k, salt } = field_crop
        const data = { pk, plant_date, acres_planted, typical_yield, moisture, n, p, k, salt, dairy_id: this.state.dairy.pk }
        promises.push(post(`${this.props.BASE_URL}/api/field_crop/update`, data))
      })

    })

    Promise.all(promises)
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
  }


  toggleShowDeleteFieldCropModal(val) {
    this.setState({ showDeleteFieldCropModal: val })
  }
  onFieldCropDelete(fieldCrop) {

    this.setState({ delFieldCropObj: fieldCrop })
    this.toggleShowDeleteFieldCropModal(true)
  }



  render() {
    return (
      <Grid item xs={12}>
        {Object.keys(this.state.dairy).length > 0 ?
          <Grid item container xs={12}>
            <Grid item xs={12} align='right'>
              {/* <Tooltip title="Add new Crop">
                <IconButton variant="outlined" color="primary"
                  onClick={() => this.props.addNewCrop(true)}>
                  <SpeakerGroup />
                </IconButton>
              </Tooltip> */}
            </Grid>



            <Grid item container xs={12}>
              {renderFieldButtons(this.state.field_crops, this)}
              {renderCropButtons(this.state.field_crops, this.state.viewFieldKey, this)}
              <Grid item xs={12}>
                <CurrentFieldCrop
                  viewFieldKey={this.state.viewFieldKey}
                  viewPlantDateKey={this.state.viewPlantDateKey}
                />
              </Grid>
              <FixedPageSize container item xs={12} height='375px' >
                {this.getFieldCropsByViewKeys().length > 0 ?
                  <FieldCrop
                    fieldCrops={this.getFieldCropsByViewKeys()}
                    onDelete={this.onFieldCropDelete.bind(this)}
                  />
                  :
                  <React.Fragment></React.Fragment>
                }
              </FixedPageSize>
            </Grid>
          </Grid>
          :
          <React.Fragment>Loading....</React.Fragment>
        }
        <ActionCancelModal
          open={this.state.showDeleteFieldCropModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Are you sure you want to delete: ${this.state.delFieldCropObj.fieldtitle} - ${this.state.delFieldCropObj.croptitle}`}
          onAction={async () => {

            await this.props.onDeleteFieldCrop(this.state.delFieldCropObj)
            this.getFieldCropsByViewKeys()
            this.toggleShowDeleteFieldCropModal(false)
          }
          }
          onClose={() => this.toggleShowDeleteFieldCropModal(false)}

        />
      </Grid>

    )
  }
}

export default CropView = withRouter(withTheme(CropView))
