import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers';
import DeleteIcon from '@material-ui/icons/Delete'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';
import OperatorModal from "../Modals/addOperatorModal"
import OperatorForm from "./operatorForm"
import ActionCancelModal from "../Modals/actionCancelModal"

import { get, post } from '../../utils/requests';

const BASE_URL = "http://localhost:3001"


class OperatorView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      showOperatorModal: false,
      operators:[],
      updateOperatorObjs: {},
      curDeleteOperatorObj:{},
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
        is_responsible: false
      }
    }
  }
  static getDerivedStateFromProps(props, state) {
    return state // if default props change return props | compare props.dairy == state.dairy
  }
  componentDidMount(){
    this.getAllOperators()
  }
  toggleOperatorModal(val){
    this.setState({showOperatorModal: val})
  }
  createOperator(){
    console.log("Creating operator", this.state.createOperatorObj, this.state.dairy)
    post(`${BASE_URL}/api/operators/create`, {
      ...this.state.createOperatorObj, dairy_id: this.state.dairy.pk
    })
    .then(res => {
      // console.log(res)
      this.getAllOperators()
    })
    .catch(err => {
      console.log(err)
    })
  }
  onOperatorModalUpdate(ev){
    const { name, value, checked } = ev.target
    let operator = this.state.createOperatorObj
    if(['is_owner', 'is_responsible'].indexOf(name) >= 0){
      operator[name] = checked  
    }else{
      operator[name] = value
    }
    this.setState({createOperatorObj: operator})
  }

  getAllOperators(){
    get(`${BASE_URL}/api/operators/${this.state.dairy.pk}`)
    .then(res => {
      // console.log(res)
      this.setState({operators: res})
    })
    .catch(err => {
      console.log(err)
    })
  }

  onOperatorUpdate(pk, operator){
    let operators = this.state.updateOperatorObjs
    operators[pk] = operator

    this.setState({updateOperatorObjs: operators})
  }

  updateOperators(){
    console.log("Updating operators", this.state.updateOperatorObjs)
    let operators = this.state.updateOperatorObjs
    let promises = Object.keys(operators).map((pk, i) => {
      return(
        post(`${BASE_URL}/api/operators/update`, operators[pk])
      )
    })
    
    Promise.all(promises)
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      console.log(err)
    })

  }

  confirmDeleteOperator(operator){
    console.log("deleteing operator", operator)
    this.setState({showDeleteOperatorModal: true, curDeleteOperatorObj: operator})
  }
  toggleDeleteOperatorModal(val){
    this.setState({showDeleteOperatorModal: val})
  }
  deleteOperator(){
    console.log("deleteing operator", this.state.curDeleteOperatorObj)
    post(`${BASE_URL}/api/operators/delete`, {pk: this.state.curDeleteOperatorObj.pk})
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
        <Typography variant="h2">Owner Operators</Typography>
        <Tooltip title="Add Owner / Operator">
          <Button variant="outlined" color="primary"
            onClick={() => this.toggleOperatorModal(true)}
          >
            <Typography variant="subtitle1">
              Add Owner / Operator
            </Typography>
          </Button>
        </Tooltip>
        {this.state.operators.length > 0 ?
          this.state.operators.map((operator, i) => {
            return(
              <Grid item container xs={12} key={`operatorOV${i}` } justifyContent="center" alignItems="center" align="center">
                <Grid item xs={10}>
                  <OperatorForm key={`operatorOV${i}`}
                    operator={operator}
                    onUpdate={this.onOperatorUpdate.bind(this)}
                  />

                </Grid>
                <Grid item  xs={2}>
                    <Tooltip title="Delete Owner / Operator">
                      <IconButton onClick={() => {this.confirmDeleteOperator(operator)}}>
                        <DeleteIcon color="error"/>
                      </IconButton>
                    </Tooltip>
                </Grid>
              </Grid>
            )
          })
        :
          <React.Fragment></React.Fragment>
        }
        <Grid item xs={12}>
          <Tooltip title="Update owner / operators">
            <Button color="secondary" variant="outlined"
              onClick={this.updateOperators.bind(this)}
            >
              <Typography gutterBottom variant="subtitle1">
                Update Owner / Operators
              </Typography>
            </Button>
          </Tooltip>
        </Grid>

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
