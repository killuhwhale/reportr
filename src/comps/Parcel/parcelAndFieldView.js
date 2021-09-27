import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import DeleteIcon from '@material-ui/icons/Delete'
import ParcelNumber from "./parcelNumber"
import FieldForm from "../Field/fieldForm"
import FieldParcelJoinModal from "../Modals/fieldParcelJoinModal"
import JoinedView from "./joinedView"
import ActionCancelModal from "../Modals/actionCancelModal"

import { get, post } from "../../utils/requests"

const BASE_URL = "http://localhost:3001"
const COUNTIES = ["Merced", "San Joaquin"]
const BASINS = ["River", "Rio"]
const BREEDS = ["Heffy guy", "Milker Boi", "Steakz"]


class ParcelView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      reportingYr: props.reportingYr,
      dairy: props.dairy,
      parcels: props.parcels,
      fields: props.fields,
      field_parcels: [],
      curUpdateParcels: {},  // pk of parcel to update: parcel object with all updated info
      curUpdateFields: {},
      showJoinFieldParcelModal: false,
      curJoinFieldIdx: 0, // Currently selected Field in FieldParcelJoinModal Index in list of fields
      curJoinParcelIdx: 0,
      curDelParcel: {}, // Parcel to be deleted, placed here by ActionCacelDialog
      curDelField: {},
      showDeleteFieldModal: false,
      showDeleteParcelModal: false
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }
  componentDidMount() {
    this.getAllFieldParcels()
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.dairy.pk !== this.state.dairy.pk) {
      this.getAllFieldParcels()
    }
  }
 
  onParcelNumberUpdate(parcel_pk, num) {
    let parcels = this.state.curUpdateParcels
    parcels[parcel_pk] = {
      pnumber: num,
      pk: parcel_pk
    }

    this.setState({
      curUpdateParcels: parcels
    })
  }
  updateParcelNumbers() {
    console.log("Send Parcels for Update")
    console.log(this.state.curUpdateParcels)
    let updates = []
    Object.keys(this.state.curUpdateParcels).map((parcel_pk, i) => {
      updates.push(post(
        `${BASE_URL}/api/parcels/update`,
        {
          data: this.state.curUpdateParcels[parcel_pk]
        }
      ))
    })

    Promise.all(updates)
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
  }
  onFieldUpdate(field_pk, field) {
    let fields = this.state.curUpdateFields
    fields[field.pk] = field

    this.setState({
      curUpdateFields: fields
    })
  }
  updateFields() {
    console.log("Send Fields for Update")
    console.log(this.state.curUpdateFields)
    let updates = []
    Object.keys(this.state.curUpdateFields).map((field_pk, i) => {
      updates.push(post(
        `${BASE_URL}/api/fields/update`,
        {
          data: this.state.curUpdateFields[field_pk]
        }
      ))
    })

    Promise.all(updates)
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
  }

  getAllFieldParcels() {
    get(`${BASE_URL}/api/field_parcel/${this.state.dairy.pk}`)
      .then(res => {
        // console.log(res)
        this.setState({ field_parcels: res })
      })
      .catch(err => { console.log(err) })
  }

  toggleShowJoinFieldParcelModal(val) {
    this.setState({ showJoinFieldParcelModal: val })
  }
  onFieldParcelChange(ev) {
    const { name, value } = ev.target
    console.log("fieldParcel Change")
    console.log(name, value)
    this.setState({ [name]: value })
  }
  createJoinFieldParcel() {
    let field_id = this.state.fields[this.state.curJoinFieldIdx].pk
    let parcel_id = this.state.parcels[this.state.curJoinParcelIdx].pk

    post(`${BASE_URL}/api/field_parcel/create`, {
      dairy_id: this.state.dairy.pk,
      field_id: field_id,
      parcel_id: parcel_id
    })
      .then(res => {
        console.log(res)
        this.toggleShowJoinFieldParcelModal(false)
        this.getAllFieldParcels()
      })
      .catch(err => {
        console.log(err)
      })
  }


  toggleDeleteParcelModal(val){
    this.setState({showDeleteParcelModal: val})
  }
  toggleDeleteFieldModal(val){
    this.setState({showDeleteFieldModal: val})
  }
  confirmDeleteParcel(parcel){
    this.setState({showDeleteParcelModal: true, curDelParcel: parcel})
  }
  confirmDeleteField(field){
    this.setState({showDeleteFieldModal: true, curDelField: field})
  }

  deleteParcel(){
    console.log("Deleting parcel", this.state.curDelParcel)
    post(`${BASE_URL}/api/parcels/delete`, {pk : this.state.curDelParcel.pk})
    .then(res => {
      console.log(res)
      this.props.onParcelDelete()
      this.toggleDeleteParcelModal(false)
    })
  }
  deleteField(){
    console.log("Deleting field", this.state.curDelField)
    post(`${BASE_URL}/api/fields/delete`, {pk : this.state.curDelField.pk})
    .then(res => {
      console.log(res)
      this.props.onFieldDelete()
      this.toggleDeleteFieldModal(false)
    })
  }

  /** Display Parcel List and Field List
   *  and below Field & Parcel View with list of combined entities.
   * 
   * 
   */
  render() {
    // console.log(this.state)
    return (
      <Grid container item xs={12} spacing={2}>
        <Grid item key="PVparcelNumbermn" xs={6}>
          <Grid item container key="dumbKey1" xs={12}>
            {this.state.parcels.length > 0 ?
              this.state.parcels.map((parcel, i) => {
                return (
                  <Grid item container xs={6} key={`parcelViewPV${i}`} justifyContent="center" alignItems="center">
                    <Grid item xs={10}>
                      <ParcelNumber 
                        parcel={parcel}
                        onUpdate={this.onParcelNumberUpdate.bind(this)}
                      />
                    </Grid>
                    <Grid item xs={2} container justifyContent='center' alignContent='center'>
                      <Tooltip title="Delete Parcel">
                        <IconButton size="small" onClick={() => {this.confirmDeleteParcel(parcel)}}>
                          <DeleteIcon  color="error"/>
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                )
              })
              :
              <React.Fragment key="emptyPVP">
                No Parcels
              </React.Fragment>
            }
          </Grid>
          <Grid item xs={12} style={{marginTop: "16px"}}>
            <Tooltip title="Update Parcels">
              <Button onClick={this.updateParcelNumbers.bind(this)} variant="outlined" color="secondary">
                <Typography variant="caption">Update Parcels</Typography>
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
        <Grid item key="PVfield" xs={6}>
          
          {this.state.fields.length > 0 ?
            this.state.fields.map((field, i) => {
              return (
                <Grid container item xs={12} key={`parcelViewFieldsPV${i}`}>
                  <Grid item xs={11}>
                    <FieldForm 
                      field={field}
                      titleEditable={false}
                      onUpdate={this.onFieldUpdate.bind(this)}
                    />
                  </Grid>
                  <Grid item xs={1} container  justifyContent='center' alignItems='center'>
                  <Tooltip title="Delete Field">
                        <IconButton onClick={() => {this.confirmDeleteField(field)}}>
                          <DeleteIcon color="error"/>
                        </IconButton>
                      </Tooltip>
                  </Grid>
                </Grid>
              )
            })
            :
            <React.Fragment key="emptyPVF">
              No Fields
            </React.Fragment>
          }
          <Grid item xs={12} style={{marginTop: "16px"}}>
            <Tooltip title="Update Fields">
              <Button onClick={this.updateFields.bind(this)} variant="outlined" color="secondary">
                <Typography variant="caption">Update Fields</Typography>
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
        <Grid item key="PVlistfieldsandparcels" xs={12}>
          <Grid item align="left">
            <Typography variant="h4">
                Field & Parcel View
            </Typography>
          </Grid>
        </Grid>
        <Grid item key="PVjoinView" xs={12}>
          <JoinedView
            dairy={this.state.dairy}
            field_parcels={this.state.field_parcels}
            onDelete={this.getAllFieldParcels.bind(this)}
          />
          <Tooltip title="Join Field & Parcel">
            <Button
              onClick={() => this.toggleShowJoinFieldParcelModal(true)}
              variant="outlined" color="primary"
            >
              <Typography variant="subtitle1">
                Join New Field & Parcel
              </Typography>
            </Button>
          </Tooltip>
        </Grid>
        <FieldParcelJoinModal key="PVparcelJoinModal"
          open={this.state.showJoinFieldParcelModal}
          actionText="Join"
          cancelText="Cancel"
          modalText={`Join Field and Parcel for: ${this.state.dairy.title}`}
          fields={this.state.fields}
          parcels={this.state.parcels}
          curJoinFieldIdx={this.state.curJoinFieldIdx}
          curJoinParcelIdx={this.state.curJoinParcelIdx}
          onChange={this.onFieldParcelChange.bind(this)}
          onAction={this.createJoinFieldParcel.bind(this)}
          onClose={() => this.toggleShowJoinFieldParcelModal(false)}
        />
        <ActionCancelModal
          open={this.state.showDeleteParcelModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Are you sure you want to delete: ${this.state.curDelParcel.pnumber}`}
          onAction={this.deleteParcel.bind(this)}
          onClose={() => this.toggleDeleteParcelModal(false)}
          
        />
        <ActionCancelModal
          open={this.state.showDeleteFieldModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Are you sure you want to delete: ${this.state.curDelField.title}`}
          onAction={this.deleteField.bind(this)}
          onClose={() => this.toggleDeleteFieldModal(false)}
          
        />
      </Grid>
    )
  }
}

export default ParcelView = withRouter(withTheme(ParcelView))
