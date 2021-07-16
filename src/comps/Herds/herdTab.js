import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers';
import AddIcon from '@material-ui/icons/Add'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';
import HerdTable from './herdTable';
import { get, post } from '../../utils/requests';


const BASE_URL = "http://localhost:3001"

class HerdTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      initHerdLoad: false,
      herds: {
        // milk_cows: [0, 0, 0, 0, 0],
        // dry_cows: [],
        // bred_cows: [],
        // cows: [],
        // calf_young: [],
        // calf_old: []
      }
    }
  }

  static getDerivedStateFromProps(props, state) {
    console.log(props.dairy)
    return props
  }
  componentDidMount() {
    this.getHerds()
  }
  componentDidUpdate() {
    // if(!this.state.initHerdLoad){
    //   this.getHerds()
    // }
  }
  // Get herds for Dairy
  // If no Dairy create empty default by proving dairy_pk
  // If no Dairy show button to create a herd
  getHerds() {
    console.log(this.state.dairy)
    get(`${BASE_URL}/api/herds/${this.state.dairy.pk}`)
      .then(res => {
        console.log(res)
        if (res.test) {
          return;
        }
        this.setState({ herds: res[0], initHerdLoad: true })
      })
      .catch(err => {
        console.log(err)
      })
  }

  onChange(ev) {
      
  }

  createHerds() {
    console.log(this.state.dairy)
    post(`${BASE_URL}/api/herds/create`, { dairy_id: this.state.dairy.pk })
      .then(res => {
        console.log(res)
        this.getHerds()
      })
      .catch(err => {
        console.log(err)
      })
  }

  render() {
    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
          <HerdTable 
            dairy={this.state.dairy}
            herds={this.state.herds}
          />
          :
          <React.Fragment>Loading....</React.Fragment>
        }
      </React.Fragment>

    )
  }
}

export default HerdTab = withRouter(withTheme(HerdTab))
