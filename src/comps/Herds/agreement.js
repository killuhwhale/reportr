import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField, Switch
} from '@material-ui/core'

import { CloudUpload } from '@material-ui/icons'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import formats, { groupByKeys } from "../../utils/format"
import { get, post } from '../../utils/requests'

import { lazyGet } from '../../utils/TSV'


const Q1 = "Was the facility's NMP updated in the reporting period?"
const Q2 = "Was the facility's NMP developed by a certified nutrient management planner (specialist) as specified in Attachment C of the General Order?"
const Q3 = "Was the facility's NMP approved by a certified nutrient management planner (specialist) as specified in Attachment C of the General Order?"
const Q4 = "Are there any new or revised written third party agreements to receive manure or process wastewater?"



class Agreement extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      note: { note: '', pk: -1 },
      ownerOperators: [],
      owners: [],
      operators: [],
      owner_idx: 0,
      operator_idx: 0,
      responsible_idx: 0,
      certification_id: -1,
      agreement: {
        nmp_developed: false,
        nmp_approved: false,
        nmp_updated: false,
        new_agreements: false,

      },

    }
  }
  static getDerivedStateFromProps(props, state) {
    return state.dairy_id !== props.dairy_id? props: state 
  }

  componentDidMount() {
    this.getAgreements()
    this.getNotes()
    this.getCertification()
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.dairy_id !== this.state.dairy_id) {
      this.getAgreements()
      this.getNotes()
      this.getCertification()
    }
  }

  getNotes() {
    get(`${this.props.BASE_URL}/api/note/${this.state.dairy_id}`)
      .then((note) => {
        if (note && typeof note === typeof [] && note.length > 0) {
          this.setState({ note: note[0] })
        } else {
          post(`${this.props.BASE_URL}/api/note/create`, {
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


  getAgreements() {
    // Lazy get
    get(`${this.props.BASE_URL}/api/agreement/${this.state.dairy_id}`)
      .then((agreement) => {
        // Should only have 1 agreement per dairy
        if (agreement && typeof agreement == typeof [] && agreement.length > 0) {
          this.setState({ agreement: agreement[0] })
        } else {
          // Agreement doesnt exist for dairy, create it here.
          post(`${this.props.BASE_URL}/api/agreement/create`, {
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
    post(`${this.props.BASE_URL}/api/agreement/update`, this.state.agreement)
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
  onUpdateNote() {

    if (!this.state.note || Object.keys(this.state.note).length !== 3 || this.state.note.pk < 0) {
      console.log(Object.keys(this.state.note).length)
      // If note obj is invalid
      return
    }


    post(`${this.props.BASE_URL}/api/note/update`, this.state.note)
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log("Error updating note: ", err)
      })
  }


  onCertificationChange(ev) {
    const { name, value } = ev.target
    this.setState({ [name]: value })
  }


  searchByPK(list, id) {
    let idx = 0
    list.map((el, i) => {
      if (el.pk === id) {
        idx = i
      }
    })
    return idx
  }

  getCertification() {
    let newCertification = {
      dairy_id: this.state.dairy_id,
      owner_id: 0,
      operator_id: 0,
      responsible_id: 0
    }
    lazyGet('certification', `noSearchValueNeeded`, newCertification, this.state.dairy_id)
      .then(([certification]) => {
        if(!certification){
          console.log("Certficiation not found", certification)
        }        
        // Get Owner Oeprators
        get(`${this.props.BASE_URL}/api/operators/${this.state.dairy_id}`)
          .then(ownerOperators => {
            let owners = ownerOperators.filter(el => el.is_owner)
            let operators = ownerOperators.filter(el => el.is_operator)


            // Certification in DB possibly not created.
            let owner_idx = certification ? this.searchByPK(owners, certification.owner_id) : 0
            let operator_idx = certification ? this.searchByPK(operators, certification.operator_id) : 0
            let responsible_idx = certification ? this.searchByPK(ownerOperators, certification.responsible_id) : 0
            let certification_id = certification ? certification.pk : -1
            this.setState({
              ownerOperators, owners, operators,
              owner_idx,
              operator_idx,
              responsible_idx,
              certification_id
            })
          })
          .catch(err => {
            console.log(err)
          })
      })
      .catch(err => {
        console.log(err)
      })
  }

  onUpdateCertification() {
    let owner = this.state.owners[this.state.owner_idx]
    let operator = this.state.operators[this.state.operator_idx]
    let responsible = this.state.ownerOperators[this.state.responsible_idx]
    if(!owner || !operator || !responsible){
      let msg = `${!owner? 'Owner': !operator? 'Operator': !responsible? 'Responsible party': 'Error:'} not found.`
      this.props.onAlert(msg, 'error')
      return
    }
    
    let certification = {
      dairy_id: this.state.dairy_id,
      owner_id: owner.pk,
      operator_id: operator.pk,
      responsible_id: responsible.pk,
      pk: this.state.certification_id
    }

    // Owner and operator cannot be the same pk
    if (certification.owner_id !== certification.operator_id) {
      // If certiciation is created already, its pk will be stored and not -1
      if (this.state.certification_id !== -1) {
        post(`${this.props.BASE_URL}/api/certification/update`, certification)
          .then((res => {
            console.log("Updated", res)
          }))
          .catch(err => {
            console.log(err)
          })
      } else {
        post(`${this.props.BASE_URL}/api/certification/create`, certification)
          .then((res => {
            console.log("Updated", res)
          }))
          .catch(err => {
            console.log(err)
          })
      }

    }
  }

  render() {
    return (
      <Grid item xs={12} container >
        <Typography variant='h3' gutterBottom>
          Nutrient management plan statements
        </Typography>
        <Grid item xs={12} align='right'>
          <Tooltip title="Update Agreements">
            <IconButton onClick={this.onUpdate.bind(this)}>
              <CloudUpload color='primary' />
            </IconButton>
          </Tooltip>
        </Grid>

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

        <Typography variant='h3' gutterBottom>
          Certification
        </Typography>
        <Grid item container xs={12} style={{ marginBottom: '16px' }}>

          <Grid item xs={3}>
            <TextField select fullWidth
              name='owner_idx'
              label='Owner'
              onChange={this.onCertificationChange.bind(this)}
              value={this.state.owner_idx}
              SelectProps={{
                native: true,
              }}
            >

              {this.state.owners && this.state.owners.length > 0 ?
                this.state.owners.map((el, i) => {
                  return (
                    <option key={`oocownerid${i}`} value={i}> {el.title} </option>
                  )
                })
                :
                <option key={`oocownerid`}> No Owners </option>
              }
            </TextField>
          </Grid>

          <Grid item xs={3}>
            <TextField select fullWidth
              name='operator_idx'
              label='Operator'
              onChange={this.onCertificationChange.bind(this)}
              value={this.state.operator_idx}
              SelectProps={{
                native: true,
              }}

            >
              {this.state.operators && this.state.operators.length > 0 ?
                this.state.operators.map((el, i) => {
                  return (
                    <option key={`oocoperatorid${i}`} value={i}> {el.title} </option>
                  )
                })
                :
                <option key='oocoperatorid_0'>No Operators</option>

              }
            </TextField>
          </Grid>

          <Grid item xs={3}>
            <TextField select fullWidth
              name='responsible_idx'
              label='Owner/operator Responsible for Fees'
              onChange={this.onCertificationChange.bind(this)}
              value={this.state.responsible_idx}
              SelectProps={{
                native: true,
              }}
            >
              {this.state.ownerOperators && this.state.ownerOperators.length > 0 ?
                this.state.ownerOperators.map((el, i) => {
                  return (
                    <option key={`oocowneroperatorid${i}`} value={i}> {el.title} </option>
                  )
                })
                :
                <option key='oocowneroperatorid_0'>No Owners or Operators</option>

              }
            </TextField>
          </Grid>
          <Grid item xs={3} align='right'>
            <Tooltip title="Update Certification">
              <IconButton onClick={this.onUpdateCertification.bind(this)}>
                <CloudUpload color='primary' />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>




        <Grid item container xs={12} style={{ marginBottom: '16px' }}>
          <Typography variant='h3'>Notes</Typography>
          <Grid item xs={12} align='right'>
            <Tooltip title="Update Notes">
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
