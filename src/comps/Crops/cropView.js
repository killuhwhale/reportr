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
import { VariableSizeList as List } from "react-window";

import { get, post } from '../../utils/requests';
import { PollTwoTone, SpeakerGroup } from '@material-ui/icons';


const BASE_URL = "http://localhost:3001"





const CropViewTable = withTheme((props) => {


  return (
    <Grid item xs={12} style={{ marginBottom: "32px", ...props.style}}>
      <Grid item container align="center" justifyContent="center" alignItems="center" xs={12}>
        <Grid item xs={4}>
          <Typography variant="h3" gutterBottom>
            Field: {props.field_crops[0].fieldtitle}
          </Typography>

        </Grid>
        <Grid item xs={4} >
          <Typography variant="h5">
            Acres: {props.field_crops[0].acres}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h5" >
            Cropable: {props.field_crops[0].cropable}
          </Typography>
        </Grid>
      </Grid>
      {props.field_crops.map((field_crop, i) => {
        return (
          <Grid item container spacing={2} xs={12} key={`cwtfc${i}`} style={{ marginBottom: "16px" }}>
            <Grid item container xs={12}>
              <Grid item xs={6}>
                <Typography variant="h5" gutterBottom>
                  Crop: {field_crop.croptitle} (concentrations in lb/ton)
                </Typography>
              </Grid>
              <Grid item xs={6} align="right">
                <DatePicker label="Plant Date" disabled
                  value={field_crop.plant_date}
                  onChange={(date) => this.props.onChange(date, field_crop.field_id, i)}

                />
              </Grid>
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Acres Planted"
                name="acres_planted"
                value={field_crop.acres_planted}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Typical Yield"
                name="typical_yield"
                value={field_crop.typical_yield}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                label="Moisture"
                name="moisture"
                value={field_crop.moisture}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                label="N"
                name="n"
                value={parseFloat(field_crop.n).toFixed(3)}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                label="P"
                name="p"
                value={parseFloat(field_crop.p).toFixed(3)}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                label="K"
                name="k"
                value={parseFloat(field_crop.k).toFixed(3)}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                label="Salt"
                name="salt"
                value={parseFloat(field_crop.salt).toFixed(3)}
                onChange={(ev) => this.props.onChange(ev, field_crop.field_id, i)}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={1}>
              <Tooltip title="Remove Crop">
                <IconButton onClick={() => this.props.onDelete(field_crop)}>
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


class CropView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      field_crops: props.field_crops,
      convertedFieldCrops: props.convertedFieldCrops,
      convertedFieldCropsKeys: Object.keys(props.convertedFieldCrops)
        .sort(new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare),
      delFieldCropObj: {},
      showDeleteFieldCropModal: false,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }
  componentDidMount() {
    this.setWindowListener()
  }
  onFieldCropChange(ev, key, index) {
    let updates = this.state.convertedFieldCrops
    let updateField = updates[key]  // key is the field which is a list of field_crops

    if (!ev.target) {
      console.log("Updating date field")
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
        console.log("Updating field_crop", data)
        promises.push(post(`${BASE_URL}/api/field_crop/update`, data))
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
      console.log(window.innerWidth, window.innerHeight)
      this.setState({ windowHeight: window.innerHeight, windowWidth: window.innerWidth })
    })
  }
  getItemSize(index) {
    let headerSize = 75
    let itemSize = 135
    let field_id = this.state.convertedFieldCropsKeys[index]
    let field_crops = this.state.convertedFieldCrops[field_id]
    let numRows = field_crops.length
    
    return headerSize + (numRows * itemSize)
  }
  renderItem({ index, style }) {
    let field_id = this.state.convertedFieldCropsKeys[index]
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

    // Changes to the inner data of the object doesnt trigger a render state change
    return (
      <Grid item xs={12}>
        {Object.keys(this.props.dairy).length > 0 ?
          <Grid item container xs={12}>
            <Grid item xs={12} align='right'>
              <Tooltip title="Add new Crop">
                <IconButton variant="outlined" color="primary"
                  onClick={() => this.props.addNewCrop(true)}>
                  <SpeakerGroup />
                </IconButton>
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <List
                height={Math.max(this.state.windowHeight - 265, 100)}
                itemCount={this.state.convertedFieldCropsKeys.length}
                itemSize={this.getItemSize.bind(this)}
                width={this.state.windowWidth * (.82)}
              >
                {this.renderItem.bind(this)}
              </List>

            </Grid>
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
