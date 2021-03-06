import React, { Component } from 'react'
import {
  Grid, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import DeleteIcon from '@material-ui/icons/Delete'
import FieldForm from "../Field/fieldForm"
import FieldParcelJoinModal from "../Modals/fieldParcelJoinModal"
import JoinedView from "./joinedView"
import AddParcelModal from "../Modals/addParcelModal"
import AddFieldModal from "../Modals/addFieldModal"
import ActionCancelModal from "../Modals/actionCancelModal"

import { post } from "../../utils/requests"
import { AddCircleOutline, ImportExport } from '@material-ui/icons'
import { naturalSortBy } from '../../utils/format'
import { Field } from '../../utils/fields/fields'
import { Parcels } from '../../utils/parcels/parcels'

import { MaxPageSize } from '../utils/FixedPageSize'


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
      showDeleteParcelModal: false,
      showAddParcelModal: false,
      showAddFieldModal: false
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
    let updates = Object.keys(this.state.curUpdateParcels).map((parcel_pk, i) => {
      return updates.push(Parcels.updateParcel(this.state.curUpdateParcels[parcel_pk], this.state.dairy.pk))
    })

    Promise.all(updates)
      .then(res => {
        console.log(res)
        this.props.onAlert('Success!', 'success')
      })
      .catch(err => {
        console.log(err)
        this.props.onAlert('Failed to update.', 'error')
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
      return updates.push(post(
        `${this.props.BASE_URL}/api/fields/update`,
        {
          data: { ...this.state.curUpdateFields[field_pk], dairy_id: this.state.dairy.pk }
        }
      ))
    })

    Promise.all(updates)
      .then(res => {
        console.log(res)
        this.props.onAlert('Success!', 'success')
      })
      .catch(err => {
        console.log(err)
        this.props.onAlert('Failed to update', 'error')
      })
  }

  async getAllFieldParcels() {
    const fieldParcels = await Parcels.getFieldParcels(this.state.dairy.pk)
    if (fieldParcels.error) return this.props.onAlert(fieldParcels.error, 'error')

    this.setState({ field_parcels: fieldParcels })
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
  async createJoinFieldParcel() {
    let field = this.state.fields[this.state.curJoinFieldIdx]
    let parcel = this.state.parcels[this.state.curJoinParcelIdx]

    let field_id = field ? field.pk : 0
    let parcel_id = parcel ? parcel.pk : 0

    const res = await Parcels.createFieldParcel(field_id, parcel_id, this.state.dairy.pk)
    this.toggleShowJoinFieldParcelModal(false)

    if (res.error) return this.props.onAlert(res.error, 'error')
    this.getAllFieldParcels()
    this.props.onAlert('Created Field Parcel!', 'success')

  }


  toggleDeleteParcelModal(val) {
    this.setState({ showDeleteParcelModal: val })
  }
  toggleDeleteFieldModal(val) {
    this.setState({ showDeleteFieldModal: val })
  }
  confirmDeleteParcel(parcel) {
    this.setState({ showDeleteParcelModal: true, curDelParcel: parcel })
  }
  confirmDeleteField(field) {
    this.setState({ showDeleteFieldModal: true, curDelField: field })
  }

  async deleteParcel() {
    console.log("Deleting parcel", this.state.curDelParcel)
    const res = await Parcels.deleteParcel(this.state.curDelParcel.pk, this.state.dairy.pk)
    this.toggleDeleteParcelModal(false)

    if (res.error) return this.props.onAlert(res.error, 'error')
    this.props.onParcelDelete()
    this.getAllFieldParcels()

  }

  deleteField() {
    post(`${this.props.BASE_URL}/api/fields/delete`, { pk: this.state.curDelField.pk, dairy_id: this.state.dairy.pk })
      .then(res => {
        console.log(res)
        if (res.error) {
          this.props.onAlert('Failed to delete!', 'error')
        } else {
          this.props.onAlert('Deleted!', 'success')
          this.props.onFieldDelete()
          this.getAllFieldParcels()
        }
        this.toggleDeleteFieldModal(false)

      })
      .catch(err => {
        console.log("error: ", err)
        this.props.onAlert('Failed to delete!', 'error')
        this.toggleDeleteFieldModal(false)
      })
  }


  toggleParcelModal(val) {
    this.setState({ showAddParcelModal: val })
  }
  toggleFieldModal(val) {
    this.setState({ showAddFieldModal: val })
  }


  async createParcel(pnumber) {
    const res = await Parcels.createParcel(pnumber, this.state.dairy.pk)
    this.toggleParcelModal(false)
    if (res.error) return this.props.onAlert(res.error, 'error')

    this.props.getAllParcels()
    this.props.onAlert('Created parcel!', 'success')
  }

  createField(field) {
    Field.createField(field, this.state.dairy.pk)
      .then(res => {
        this.toggleFieldModal(false)
        this.props.getAllFields()
        this.props.onAlert('Created field!', 'success')
      })
      .catch(err => {
        console.log(err)
        this.toggleFieldModal(false)
        this.props.onAlert('Failed to create field!', 'error')
      })
  }

  fmtPNumber(num) {
    let L = num.length
    let ans = []
    for (let i = 0; i < L; i++) {
      if (i % 4 === 0 && i !== 0) {
        ans.push("-")
      }
      ans.push(num[i])
    }
    return ans.join('')
  }

  /** Display Parcel List and Field List
   *  and below Field & Parcel View with list of combined entities.
   * 
   * 
   */
  render() {
    return (
      <Grid container item xs={12} spacing={2}>
        <Grid item container key="parcel_FieldList" align="center" xs={12} style={{ marginTop: "24px" }} spacing={2}>
          <Grid item container xs={6} alignContent='center' alignItems='center' justifyContent='center'>
            <Grid item xs={12}>
              <div style={{ display: 'flex' }}>
                <Typography variant="h4" >
                  Parcels
                </Typography>
                <Tooltip title="Add parcel to dairy">
                  <IconButton
                    onClick={() => this.toggleParcelModal(true)}
                    color="primary">
                    <AddCircleOutline />
                  </IconButton>
                </Tooltip>
              </div>
            </Grid>
          </Grid>

          <Grid item container xs={6} alignItems='center' justifyContent='center'>
            <Grid item xs={10}>
              <div style={{ display: 'flex' }}>
                <Typography variant="h4" >
                  Fields
                </Typography>
                <Tooltip title="Add field to dairy">
                  <IconButton
                    onClick={() => this.toggleFieldModal(true)}
                    color="primary">
                    <AddCircleOutline />
                  </IconButton>
                </Tooltip>
              </div>
            </Grid>
            <Grid item xs={2} align='right'>
              {this.state.fields && this.state.fields.length > 0 ?
                <Tooltip title="Update Fields">
                  <IconButton onClick={this.updateFields.bind(this)} variant="outlined" color="secondary">
                    <ImportExport />
                  </IconButton>
                </Tooltip>
                :
                <React.Fragment></React.Fragment>
              }
            </Grid>
          </Grid>

        </Grid>

        <Grid item key="PVparcelNumbermn" xs={6}>
          <MaxPageSize container height='512px'>
            {this.state.parcels.length > 0 ?
              this.state.parcels.sort((a, b) => naturalSortBy(a, b, 'pnumber')).map((parcel, i) => {
                return (
                  <Grid item container xs={6} key={`parcelViewPV${i}`} justifyContent="center" alignItems="center"
                    style={{ marginBottom: '8px' }} className='showOnHoverParent'>
                    <Grid item xs={10}>
                      <TextField
                        value={this.fmtPNumber(parcel.pnumber)}
                        label="APN"
                        style={{ width: '100%' }}
                      />
                    </Grid>
                    <Grid item xs={2} container justifyContent='center' alignContent='center'>
                      <Tooltip title="Delete Parcel">
                        <IconButton size="small" className='showOnHover'
                          onClick={() => { this.confirmDeleteParcel(parcel) }}
                        >
                          <DeleteIcon color="error" />
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
          </MaxPageSize>
          {/* No longer editing parcel numbers. 
          <Grid item xs={12} style={{marginTop: "16px"}}>
            <Tooltip title="Update Parcels">
              <Button onClick={this.updateParcelNumbers.bind(this)} variant="outlined" color="secondary">
                <Typography variant="caption">Update Parcels</Typography>
              </Button>
            </Tooltip>
          </Grid>*/}
        </Grid>

        <Grid item key="PVfield" xs={6}>

          <MaxPageSize height='512px'>


            {this.state.fields.length > 0 ?
              this.state.fields.sort((a, b) => naturalSortBy(a, b, 'title')).map((field, i) => {
                return (
                  <Grid container item xs={12} key={`parcelViewFieldsPV${i}`} className='showOnHoverParent'>
                    <Grid item xs={11}>
                      <FieldForm
                        field={field}
                        titleEditable={false}
                        onUpdate={this.onFieldUpdate.bind(this)}
                      />
                    </Grid>
                    <Grid item xs={1} container justifyContent='center' alignItems='center'>
                      <Tooltip title="Delete Field">
                        <IconButton className='showOnHover'
                          onClick={() => { this.confirmDeleteField(field) }}
                        >
                          <DeleteIcon color="error" />
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
          </MaxPageSize>

        </Grid>

        <Grid item container key="PVlistfieldsandparcels" xs={12}>
          <Grid item xs={12} align="left">
            <div style={{ display: 'flex' }}>
              <Typography variant="h4" style={{ display: 'flex', alignItems: 'center' }}>
                Joined Fields & Parcels
              </Typography>
              <Tooltip title="Join Field & Parcel">
                <IconButton color="primary"
                  onClick={() => this.toggleShowJoinFieldParcelModal(true)}
                >
                  <AddCircleOutline />
                </IconButton>
              </Tooltip>
            </div>
          </Grid>
        </Grid>

        <MaxPageSize height='512px' item key="PVjoinView" xs={12}>
          <JoinedView
            dairy={this.state.dairy}
            field_parcels={this.state.field_parcels}
            onDelete={this.getAllFieldParcels.bind(this)}
            fmtPNumber={this.fmtPNumber.bind(this)}
            BASE_URL={this.props.BASE_URL}
          />

        </MaxPageSize>

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
        <AddParcelModal
          open={this.state.showAddParcelModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add Parcel to Dairy ${this.state.dairy.title}`}
          onAction={this.createParcel.bind(this)}
          onClose={() => this.toggleParcelModal(false)}
          BASE_URL={this.props.BASE_URL}
        />
        <AddFieldModal
          open={this.state.showAddFieldModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Add Field to Dairy ${this.state.dairy.title}`}
          onAction={this.createField.bind(this)}
          onClose={() => this.toggleFieldModal(false)}
          BASE_URL={this.props.BASE_URL}
        />
      </Grid>
    )
  }
}

export default ParcelView = withRouter(withTheme(ParcelView))
