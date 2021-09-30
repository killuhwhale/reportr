import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
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
      fieldCropHarvests: props.fieldCropHarvests,
      groupedFieldCropHarvests: props.groupedFieldCropHarvests,
      groupedFieldCropHarvestsKeys: Object.keys(props.groupedFieldCropHarvests)
        .sort(new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare),
      delFieldCropHarvestObj: {},
      showDeleteFieldCropHarvestModal: false,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }
  componentDidMount(){
    this.setWindowListener()
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

  setWindowListener(){
    window.addEventListener('resize', (ev) => {
      console.log(window.innerWidth, window.innerHeight)
      this.setState({windowHeight: window.innerHeight, windowWidth: window.innerWidth})
    })
  }

  renderItem({ index, style }) {
    let fieldKey = this.state.groupedFieldCropHarvestsKeys[index]
    let plant_dates_obj = this.state.groupedFieldCropHarvests[fieldKey]
    if (plant_dates_obj) {
      return (
        <Grid item xs={12} key={`hv${fieldKey}`} style={{ marginBottom: "32px", ...style }}>
          <Typography variant="h3">{fieldKey}</Typography>
          {
            Object.keys(plant_dates_obj).map(plant_dateKey => {
              return (
                <Grid item container xs={12} style={{ marginBottom: "16px" }} key={`hv${plant_dateKey}`}>
                  <Grid item align="right" xs={12}>
                    <DatePicker
                      value={new Date(plant_dateKey)}
                      label="Planted"
                      open={false}
                    />
                  </Grid>
                  {
                    plant_dates_obj[plant_dateKey].map((harvest, i) => {
                      return (
                        <React.Fragment key={`hvh${harvest.pk}`}>
                          <Grid item xs={12}>
                            <Typography variant="h6">
                              {harvest.croptitle}
                            </Typography>
                          </Grid>
                          <Grid item xs={11} container>
                            <Grid item xs={2}>
                              <DatePicker
                                value={new Date(harvest.harvest_date)}
                                label="Harvest Date"
                                open={false}
                                fullWidth
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
                              <TextField
                                label="Reporting Basis"
                                value={harvest.method_of_reporting}
                                style={{ width: "100%" }}
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                label="Moisture %"
                                name="actual_moisture"
                                value={harvest.actual_moisture}
                                // onChange={(ev) => this.props.onChange(i, harvest, ev)}
                                style={{ width: "100%" }}
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                label="Nitrogen (mg/ kg)"
                                name="actual_n"
                                value={MG_KG(harvest.actual_n)}
                                // onChange={(ev) => this.props.onChange(i, harvest, ev)}
                                style={{ width: "100%" }}
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                label="Phosphorus"
                                name="actual_p"
                                value={MG_KG(harvest.actual_p)}
                                // onChange={(ev) => this.props.onChange(i, harvest, ev)}
                                style={{ width: "100%" }}
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                label="Potassium"
                                name="actual_k"
                                value={MG_KG(harvest.actual_k)}
                                // onChange={(ev) => this.props.onChange(i, harvest, ev)}
                                style={{ width: "100%" }}
                              />
                            </Grid>

                            <Grid item xs={2}>
                              <TextField
                                label="TFS (%)"
                                name="tfs"
                                value={parseFloat(harvest.tfs).toFixed(2)}
                                // onChange={(ev) => this.props.onChange(i, harvest, ev)}
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
      return (<React.Fragment style={style} />)
    }
  }

  getItemSize(index) {
    let offset = 5
    let fixedHeaderSize = 55 + offset
    let subHeaderSize = 80 + offset
    let subRowSize = 125 + offset

    let fieldKey = this.state.groupedFieldCropHarvestsKeys[index]
    let plantDateObj  = this.state.groupedFieldCropHarvests[fieldKey]
    let numPlantDates = Object.keys(plantDateObj).length

    let numRows = 0
    Object.keys(plantDateObj).forEach(key => {
      numRows += plantDateObj[key].length
    })
    return fixedHeaderSize + (subHeaderSize * numPlantDates) + (subRowSize * numRows)
  }

  render() {
    return (
      <React.Fragment>

        <List
          height={Math.max(this.state.windowHeight - 260, 100)}
          itemCount={this.state.groupedFieldCropHarvestsKeys.length}
          itemSize={this.getItemSize.bind(this)}
          width={this.state.windowWidth * (.82)}
        >
          {this.renderItem.bind(this)}
        </List>

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
