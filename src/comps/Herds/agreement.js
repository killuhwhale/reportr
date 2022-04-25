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
import { CertAgreementNotes } from '../../utils/certAgreementNotes/certAgreementNotes'


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
    return state.dairy_id !== props.dairy_id ? props : state
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

  async getAgreements() {
    const agreement = await CertAgreementNotes.getAgreements(this.state.dairy_id)
    if (agreement.error) return console.log(agreement)
    console.log(agreement)
    this.setState({ agreement: agreement[0] })
  }

  async getNotes() {
    const note = await CertAgreementNotes.getNotes(this.state.dairy_id)
    if (note.error) return console.log(note.error)
    this.setState({ note: note[0] })


  }

  async getCertification() {
    const _certification = await CertAgreementNotes.getCertification(this.state.dairy_id)
    if (_certification.error) return console.log(_certification.error)
    const certification = _certification[0]

    // Get Owner Oeprators
    get(`${this.props.BASE_URL}/api/operators/${this.state.dairy_id}`)
      .then(ownerOperators => {
        const owners = ownerOperators.filter(el => el.is_owner)
        const operators = [{ title: 'No operator', }, ...ownerOperators.filter(el => el.is_operator)]


        // Certification in DB possibly not created.
        const owner_idx = certification ? this.searchByPK(owners, certification.owner_id) : 0
        const operator_idx = certification ? this.searchByPK(operators, certification.operator_id) : 0
        const responsible_idx = certification ? this.searchByPK(ownerOperators, certification.responsible_id) : 0
        const certification_id = certification ? certification.pk : -1

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
  }

  onAgreementChange(ev) {
    const { name, checked } = ev.target
    let agreement = this.state.agreement
    agreement[name] = checked

    this.setState({ agreement })
  }

  onNoteChange(ev) {
    const { name, value } = ev.target
    let note = this.state.note
    note.note = value
    this.setState({ note })
  }

  onCertificationChange(ev) {
    const { name, value } = ev.target
    this.setState({ [name]: value })
  }

  async onUpdateAgreement() {
    const res = await CertAgreementNotes.onUpdateAgreement(this.state.agreement, this.state.dairy_id)
    if (res.error) return this.props.onAlert('Error updating agreement', 'error')
    this.props.onAlert('Updated agreement!', 'success')

  }

  async onUpdateNote() {
    const res = await CertAgreementNotes.onUpdateNote(this.state.note, this.state.dairy_id)
    if (res.error) return this.props.onAlert('Error updating note', 'error')
    this.props.onAlert('Updated note!', 'success')
  }

  async onUpdateCertification() {
    let owner = this.state.owners[this.state.owner_idx]
    let operator = this.state.operators[this.state.operator_idx]
    let responsible = this.state.ownerOperators[this.state.responsible_idx]

    const res = await CertAgreementNotes.onUpdateCertification(owner, operator, responsible, this.state.dairy_id)
    if (res.error) return this.props.onAlert('Error updating cert', 'error')
    this.props.onAlert('Updated cert!', 'success')
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

  render() {
    return (
      <Grid item xs={12} container >
        <Typography variant='h3' gutterBottom>
          Nutrient management plan statements
        </Typography>
        <Grid item xs={12} align='right'>
          <Tooltip title="Update Agreements">
            <IconButton onClick={this.onUpdateAgreement.bind(this)}>
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
              onChange={this.onAgreementChange.bind(this)}
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
              onChange={this.onAgreementChange.bind(this)}
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
              onChange={this.onAgreementChange.bind(this)}
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
              onChange={this.onAgreementChange.bind(this)}
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
              <IconButton onClick={() => this.onUpdateCertification()}>
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
