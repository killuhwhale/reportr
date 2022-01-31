import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField,
  Card, CardContent, CardActions
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
import { VariableSizeList as List } from "react-window";
import { zeroTimeDate } from "../../utils/convertCalc"
import { renderFieldButtons, renderCropButtons, CurrentFieldCrop } from '../Applications/selectButtonGrid'
import { get, post } from '../../utils/requests';
import { PollTwoTone, SpeakerGroup } from '@material-ui/icons';
import { formatFloat, naturalSort, naturalSortBy, nestedGroupBy } from '../../utils/format';


const CropViewTable = withTheme((props) => {
  const fc = props && props.field_crops && typeof props.field_crops === typeof [] && props.field_crops.length > 0 ? props.field_crops[0] : {}
  const fcs = props && props.field_crops && typeof props.field_crops === typeof [] && props.field_crops.length > 0 ? props.field_crops : []
  return (
    <Grid item xs={12} style={{ marginBottom: "32px", ...props.style }}>
      <Grid item container xs={12}>
        <Grid item xs={4}>
          <Typography variant="h4" >
            {fc.fieldtitle}
          </Typography>
        </Grid>
        <Grid item xs={4} >
          <Typography variant="h6" gutterBottom>
            {fc.acres} Total Acres
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h6" gutterBottom>
            {fc.cropable} Cropable Acres
          </Typography>
        </Grid>
      </Grid>
      {fcs.map((field_crop, i) => {
        return (
          <Grid item container spacing={2} xs={12} key={`cwtfc${i}`} style={{ marginBottom: "16px" }}>
            <Grid item container xs={12}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  {field_crop.croptitle}
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={2} align="right">
              <DatePicker label="Plant Date"
                value={field_crop.plant_date}
                open={false}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Acres Planted"
                name="acres_planted"
                value={field_crop.acres_planted}

                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Typical Yield"
                name="typical_yield"
                value={field_crop.typical_yield}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                label="Moisture"
                name="moisture"
                value={field_crop.moisture}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                label="N"
                name="n"
                value={parseFloat(field_crop.n).toFixed(3)}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                label="P"
                name="p"
                value={parseFloat(field_crop.p).toFixed(3)}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                label="K"
                name="k"
                value={parseFloat(field_crop.k).toFixed(3)}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                label="Salt"
                name="salt"
                value={parseFloat(field_crop.salt).toFixed(3)}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={1}>
              <Tooltip title="Remove Crop">
                <IconButton onClick={() => props.onDelete(field_crop)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        )
      })}
    </Grid>
  )
})


const FieldCrop = (props) => {
  return (


    props.fieldCrops && props.fieldCrops.sort((a, b) => naturalSortBy(a, b, 'plant_date')).map((fieldCrop, i) => {
      const { croptitle, acres, cropable, plant_date, acres_planted, typical_yield, moisture, n, p, k, salt,
      } = fieldCrop
      return (
        <Card variant="outlined" key={`fieldCrop${props.index}`} className='showOnHoverParent'>
          <CardContent>
            <Typography>
              {croptitle}
            </Typography>
            <DatePicker label="App Date"
              value={plant_date}
              open={false}
            />
            <Grid item xs={12}>
              <Typography variant='caption'>
                {`N ${formatFloat(n)} P ${formatFloat(p)} K ${formatFloat(k)} TFS ${formatFloat(salt)} `}
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
}


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
    this.setWindowListener()
    this.formatFieldCrops()
  }

  getConvertedFieldCropKeys(fc) {
    return Object.keys(fc)
      .sort(new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.dairy.pk !== this.state.dairy.pk || prevProps.field_crops !== this.props.field_crops) {
      this.formatFieldCrops()
    }
  }



  formatFieldCrops() {
    let fieldCropsByFieldtitle = nestedGroupBy(this.props.field_crops_list, ['fieldtitle', 'plant_date'])
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

  componentDidUpdate(prevProps, prevState) {
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
        const data = { pk, plant_date, acres_planted, typical_yield, moisture, n, p, k, salt }
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
  setWindowListener() {
    window.addEventListener('resize', (ev) => {
      this.setState({ windowHeight: window.innerHeight, windowWidth: window.innerWidth })
    })
  }
  getItemSize(index) {
    let headerSize = 75
    let itemSize = 135
    let keys = this.getConvertedFieldCropKeys(this.state.convertedFieldCrops)
    let field_id = keys[index]
    let field_crops = this.state.convertedFieldCrops[field_id]
    let numRows = field_crops && field_crops.length ? field_crops.length : 45

    return headerSize + (numRows * itemSize)
  }
  renderItem({ index, style }) {
    let keys = this.getConvertedFieldCropKeys(this.state.convertedFieldCrops)
    let field_id = keys[index]
    let field_crops = this.state.convertedFieldCrops[field_id]
    return (
      <CropViewTable key={`cwtz${index}`} style={style}
        field_crops={field_crops}
        onChange={this.onFieldCropChange.bind(this)}
        onDelete={this.onFieldCropDelete.bind(this)}
      />
    )
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
              {this.getFieldCropsByViewKeys().length > 0 ?
                <FieldCrop
                  fieldCrops={this.getFieldCropsByViewKeys()}
                  onDelete={this.onFieldCropDelete.bind(this)}
                />
                :
                <React.Fragment></React.Fragment>
              }
            </Grid>
            {/* <Grid item xs={12}>
              {this.getConvertedFieldCropKeys(this.state.convertedFieldCrops).length > 0 ?
                <List
                  height={Math.max(this.state.windowHeight - 265, 100)}
                  itemCount={this.getConvertedFieldCropKeys(this.state.convertedFieldCrops).length}
                  itemSize={this.getItemSize.bind(this)}
                  width={this.state.windowWidth * (.82)}
                >
                  {this.renderItem.bind(this)}
                </List>
                :
                <React.Fragment></React.Fragment>
              }

            </Grid> */}
          </Grid>
          :
          <React.Fragment>Loading....</React.Fragment>
        }
        <ActionCancelModal
          open={this.state.showDeleteFieldCropModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Are you sure you want to delete: ${this.state.delFieldCropObj.fieldtitle} / ${this.state.delFieldCropObj.croptitle}`}
          onAction={() => {

            this.props.onDeleteFieldCrop(this.state.delFieldCropObj)
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
