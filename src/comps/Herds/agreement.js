import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField, Switch
} from '@material-ui/core'

import { CloudUpload } from '@material-ui/icons'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import formats, { groupByKeys } from "../../utils/format"
import { get, post } from '../../utils/requests'

const BASE_URL = "http://localhost:3001"
const Q1 = "Was the facility's NMP updated in the reporting period?"
const Q2 = "Was the facility's NMP developed by a certified nutrient management planner (specialist) as specified in Attachment C of the General Order?"
const Q3 = "Was the facility's NMP approved by a certified nutrient management planner (specialist) as specified in Attachment C of the General Order?"
const Q4 = "Are there any new or revised written third party agreements to receive manure or process wastewater?"



class Agreement extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      note: { note: '' , pk: -1},
      agreement: {
        nmp_developed: false,
        nmp_approved: false,
        nmp_updated: false,
        new_agreements: false,

      },

    }
  }
  static getDerivedStateFromProps(props, state) {
    return state // if default props change return props | compare props.dairy == state.dairy
  }
  componentDidMount() {
    this.getAgreements()
    this.getNotes()
  }

  getNotes() {
    get(`${BASE_URL}/api/note/${this.state.dairy_id}`)
      .then((note) => {
        if (note && typeof note === typeof [] && note.length > 0) {
          this.setState({ note: note[0] })
        } else {
          post(`${BASE_URL}/api/note/create`, {
            dairy_id: this.state.dairy_id,
            note: 'No notes.',
          })
            .then(res => {
              res = res && typeof res === typeof [] && res.length > 0 ? res[0] : {}
              this.setState({ note: res })
            })
            .catch(err => {
              console.log(err)
            })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
  ﬁ

  getAgreements() {
    // Lazy get
    get(`${BASE_URL}/api/agreement/${this.state.dairy_id}`)
      .then((agreement) => {
        console.log(agreement)
        // Should only have 1 agreement per dairy
        if (agreement && typeof agreement == typeof [] && agreement.length > 0) {
          this.setState({ agreement: agreement[0] })
        } else {
          // Agreement doesnt exist for dairy, create it here.
          post(`${BASE_URL}/api/agreement/create`, {
            dairy_id: this.state.dairy_id,
            nmp_developed: false,
            nmp_approved: false,
            nmp_updated: false,
            new_agreements: false
          })
            .then(res => {
              res = res && typeof res === typeof [] && res.length > 0 ? res[0] : {}
              this.setState({ agreement: res })
            })
            .catch(err => {
              console.log(err)
            })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  onChange(ev) {
    const { name, checked } = ev.target
    let agreement = this.state.agreement
    agreement[name] = checked

    this.setState({ agreement })
  }

  onUpdate() {
    if (Object.keys(this.state.agreement).length !== 6) {
      console.log(this.state.agreement)
      alert("Incorrect amount of keys for agreement")
      return
    }

    console.log("Updating: ", this.state.agreement)
    post(`${BASE_URL}/api/agreement/update`, this.state.agreement)
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log("Error updating agreement: ", err)
      })
  }

  onNoteChange(ev) {
    const { name, value } = ev.target
    let note = this.state.note
    note.note = value
    this.setState({ note })
  }
  onUpdateNote(){

    if(!this.state.note || Object.keys(this.state.note).length !== 3 || this.state.note.pk < 0 ){
      console.log(Object.keys(this.state.note).length)
      // If note obj is invalid
      return
    }


    post(`${BASE_URL}/api/note/update`, this.state.note)
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      console.log("Error updating note: ", err)
    })
  }

  render() {
    return (
      <Grid item xs={12} container >
        <Grid item xs={12} align='right'>
          <Tooltip title="Update Agreements">
            <IconButton onClick={this.onUpdate.bind(this)}>
              <CloudUpload color='primary' />
            </IconButton>
          </Tooltip>
        </Grid>
        <Typography variant='h3' gutterBottom>
          Nutrient management plan statements
        </Typography>
        <Grid item container xs={12} style={{ marginBottom: '16px' }}>
          <Grid item xs={10}>
            <Typography variant='h6'>
              {Q1}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Switch
              name='nmp_updated'
              onChange={this.onChange.bind(this)}
              checked={this.state.agreement.nmp_updated}
            />
          </Grid>
        </Grid>

        <Grid item container xs={12} style={{ marginBottom: '16px' }}>
          <Grid item xs={10}>
            <Typography variant='h6'>
              {Q2}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Switch
              name='nmp_developed'
              onChange={this.onChange.bind(this)}
              checked={this.state.agreement.nmp_developed}
            />
          </Grid>
        </Grid>

        <Grid item container xs={12} style={{ marginBottom: '16px' }}>
          <Grid item xs={10}>
            <Typography variant='h6'>
              {Q3}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Switch
              name='nmp_approved'
              onChange={this.onChange.bind(this)}
              checked={this.state.agreement.nmp_approved}
            />
          </Grid>
        </Grid>


        <Typography variant='h3' gutterBottom>
          Export agreement statement
        </Typography>
        <Grid item container xs={12} style={{ marginBottom: '16px' }}>
          <Grid item xs={10}>
            <Typography variant='h6'>
              {Q4}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Switch
              name='new_agreements'
              onChange={this.onChange.bind(this)}
              checked={this.state.agreement.new_agreements}
            />
          </Grid>
        </Grid>


        <Grid item container xs={12} style={{ marginBottom: '16px' }}>
          <Typography variant='h3'>Notes</Typography>
          <Grid item xs={12} align='right'>
            <Tooltip title="Update Agreements">
              <IconButton onClick={this.onUpdateNote.bind(this)}>
                <CloudUpload color='primary' />
              </IconButton>
            </Tooltip>
          </Grid>
          <TextField multiline fullWidth rows={30} variant='outlined'
            value={this.state.note.note}
            onChange={this.onNoteChange.bind(this)}

          />
        </Grid>
      </Grid>
    )
  }
}

export default Agreement = withRouter(withTheme(Agreement))
