import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import ParcelNumber from "../Parcel/parcelNumber"
import FieldForm from "../Field/fieldForm"
import FieldParcelJoinModal from "../Modals/fieldParcelJoinModal"
import JoinedView from "../Parcel/joinedView"
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
      parcels: [],
      fields: [],
      field_parcels: [],
      curUpdateParcels: {},  // pk of parcel to update: parcel object with all updated info
      curUpdateFields: {},
      showJoinFieldParcelModal: false,
      curJoinFieldIdx: 0, // Currently selected Field in FieldParcelJoinModal Index in list of fields
      curJoinParcelIdx: 0,
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }
  componentDidMount() {
    this.getAllParcels()
    this.getAllFields()
    this.getAllFieldParcels()
  }
  getAllParcels() {
    get(`${BASE_URL}/api/parcels/${this.state.dairy.pk}`)
      .then(res => {
        // console.log(res)
        this.setState({ parcels: res })
      })
      .catch(err => { console.log(err) })
  }
  getAllFields() {
    get(`${BASE_URL}/api/fields/${this.state.dairy.pk}`)
      .then(res => {
        // console.log(res)
        this.setState({ fields: res })
      })
      .catch(err => { console.log(err) })
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
        console.log(res)
        this.setState({ field_parcels: res })
      })
      .catch(err => { console.log(err) })
  }

  toggleFieldParcelModal(val) {
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
        //append the row obj to the list of
        console.log("Try forcing child components to refresh - unmount/ remount")
        this.getAllFieldParcels()
      })
      .catch(err => {
        console.log(err)
      })
  }

  render() {
    // console.log(this.state)
    return (
      <Grid container item xs={12} spacing={2}>
        <Grid item xs={6}>
          
          <Grid item container xs={12}>
            {this.state.parcels.length > 0 ?
              this.state.parcels.map((parcel, i) => {
                return (
                  <Grid item xs={6}>
                    <ParcelNumber key={`parcelView${i}`}
                      parcel={parcel}
                      onUpdate={this.onParcelNumberUpdate.bind(this)}
                    />
                  </Grid>
                )
              })
              :
              <React.Fragment>
                No Parcels
              </React.Fragment>
            }
          </Grid>
          <Grid item xs={12}>
            <Tooltip title="Update Parcels">
              <Button onClick={this.updateParcelNumbers.bind(this)} fullWidth variant="outlined" color="secondary">
                <Typography variant="caption">Update Parcels</Typography>
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          
          {this.state.fields.length > 0 ?
            this.state.fields.map((field, i) => {
              return (
                <FieldForm key={`parcelViewFields${i}`}
                  field={field}
                  onUpdate={this.onFieldUpdate.bind(this)}
                />
              )
            })
            :
            <React.Fragment>
              No Fields
            </React.Fragment>
          }
          <Grid item xs={12}>
            <Tooltip title="Update Fields">
              <Button onClick={this.updateFields.bind(this)} fullWidth variant="outlined" color="secondary">
                <Typography variant="caption">Update Fields</Typography>
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid item align="left">
            <Typography variant="h4">
                Field & Parcel View
            </Typography>
          </Grid>
          <Tooltip title="Join Field & Parcel">
            <Button
              onClick={() => this.toggleFieldParcelModal(true)}
              variant="outlined" color="primary" fullWidth
            >
              <Typography variant="subtitle1">
                Join New Field & Parcel
              </Typography>
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <JoinedView
            dairy={this.state.dairy}
            field_parcels={this.state.field_parcels}
            onDelete={this.getAllFieldParcels.bind(this)}
          />
        </Grid>
        <FieldParcelJoinModal
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
          onClose={() => this.toggleFieldParcelModal(false)}
        />
      </Grid>
    )
  }
}

export default ParcelView = withRouter(withTheme(ParcelView))
