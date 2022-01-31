import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import AddIcon from '@material-ui/icons/Add'

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';
import OperatorModal from "../Modals/addOperatorModal"
import OperatorForm from "./operatorForm"
import ActionCancelModal from "../Modals/actionCancelModal"

import { get, post } from '../../utils/requests';
import { ImportExport, InsertEmoticon } from '@material-ui/icons';



class OperatorView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      showOperatorModal: false,
      showDeleteOperatorModal: false,
      operators: [],
      curDeleteOperatorObj: {},
      createOperatorObj: {
        dairy_id: "",
        title: "",
        primary_phone: "",
        secondary_phone: "",
        street: "",
        city: "",
        city_state: "",
        city_zip: "",
        is_owner: false,
        is_operator: false,
        is_responsible: false
      }
    }
    this.updatedOperators = new Set()
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }
  componentDidMount() {
    this.getAllOperators()
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.dairy.pk !== this.state.dairy.pk) {
      this.getAllOperators()
    }
  }

  toggleOperatorModal(val) {
    this.setState({ showOperatorModal: val })
  }
  createOperator() {
    // console.log("Creating operator", this.state.createOperatorObj, this.state.dairy)
    post(`${this.props.BASE_URL}/api/operators/create`, {
      ...this.state.createOperatorObj, dairy_id: this.state.dairy.pk
    })
      .then(res => {
        // console.log(res)
        this.getAllOperators()
        this.props.onAlert('Success!', 'success')
        this.toggleOperatorModal(false)
      })
      .catch(err => {
        console.log(err)
        this.props.onAlert('Failed to create operator!', 'error')
      })
  }
  onOperatorModalUpdate(ev) {
    const { name, value, checked } = ev.target
    let operator = this.state.createOperatorObj
    operator[name] = value
    this.setState({ createOperatorObj: operator })
  }

  getAllOperators() {
    get(`${this.props.BASE_URL}/api/operators/${this.state.dairy.pk}`)
      .then(res => {
        this.setState({ operators: res })
      })
      .catch(err => {
        console.log(err)
      })
  }

  onOperatorChange(index, ev) {
    this.updatedOperators.add(index)
    const { name, value } = ev.target
    console.log('Operator @ index ', index, name, value)
    let operators = this.state.operators
    let operator = this.state.operators[index]
    operator[name] = value
    operators[index] = operator
    this.setState({ operators: operators })
  }

  updateOperators() {
    let operators = this.state.operators.filter((op, i) => this.updatedOperators.has(i))
    let promises = operators.map((operator, i) => {
      return (
        post(`${this.props.BASE_URL}/api/operators/update`, operator)
      )
    })
    Promise.all(promises)
      .then(res => {
        this.updatedOperators = new Set()
        this.props.onAlert('Success!', 'success')
      })
      .catch(err => {
        console.log(err)
        this.props.onAlert('Failed to update operators', 'error')
      })
  }

  confirmDeleteOperator(operator) {
    console.log("deleteing operator", operator)
    this.setState({ showDeleteOperatorModal: true, curDeleteOperatorObj: operator })
  }
  toggleDeleteOperatorModal(val) {
    this.setState({ showDeleteOperatorModal: val })
  }
  deleteOperator() {
    console.log("deleteing operator", this.state.curDeleteOperatorObj)
    post(`${this.props.BASE_URL}/api/operators/delete`, { pk: this.state.curDeleteOperatorObj.pk })
      .then(res => {
        console.log(res)
        this.getAllOperators()
        this.toggleDeleteOperatorModal(false)
      })
      .catch(err => {
        console.log(err)
      })
  }

  render() {
    return (
      <Grid item xs={12}>
        <Grid item container xs={12} style={{ marginBottom: '8px' }}>
          <Grid item xs={8}>
            <Typography variant="h4">Owner Operators</Typography>
          </Grid>
          <Grid item container xs={4}>
            <Grid item xs={10} align='right'>
              <Tooltip title="Add Owner / Operator">
                <IconButton variant="outlined" color="primary"
                  onClick={() => this.toggleOperatorModal(true)}
                >
                  <InsertEmoticon />
                </IconButton>
              </Tooltip>

            </Grid>
            <Grid item xs={2} align='right'>
              <Tooltip title="Update owner / operators">
                <IconButton color="secondary" variant="outlined"
                  onClick={this.updateOperators.bind(this)}
                >
                  <ImportExport />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>

        {this.state.operators.length > 0 ?
          this.state.operators.map((operator, i) => {
            return (
              <Paper elevation={2} key={`operatorOV${i}`} style={{ padding: '15px' }} className='showOnHoverParent'>
                <Grid item container xs={12} justifyContent="center" alignItems="center" align="center" >
                  <Grid item xs={10}>
                    <OperatorForm
                      operator={operator}
                      index={i}
                      onChange={this.onOperatorChange.bind(this)}
                    />

                  </Grid>
                  <Grid item xs={2}>
                    <Tooltip title="Delete Owner / Operator">
                      <IconButton className='showOnHover'
                        onClick={() => { this.confirmDeleteOperator(operator) }}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Paper>
            )
          })
          :
          <React.Fragment></React.Fragment>
        }

        <OperatorModal
          open={this.state.showOperatorModal}
          actionText="Add"
          cancelText="Cancel"
          modalText={`Create new Owner / Operator`}
          operator={this.state.createOperatorObj}
          onChange={this.onOperatorModalUpdate.bind(this)}
          onAction={this.createOperator.bind(this)}
          onClose={() => this.toggleOperatorModal(false)}
        />
        <ActionCancelModal
          open={this.state.showDeleteOperatorModal}
          actionText="Delete"
          cancelText="Cancel"
          modalText={`Are you sure you want to delete: ${this.state.curDeleteOperatorObj.title}`}
          onAction={this.deleteOperator.bind(this)}
          onClose={() => this.toggleDeleteOperatorModal(false)}

        />
      </Grid>
    )
  }
}

export default OperatorView = withRouter(withTheme(OperatorView))
