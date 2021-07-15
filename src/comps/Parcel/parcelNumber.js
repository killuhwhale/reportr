import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
}from '@material-ui/core'

import { withTheme } from '@material-ui/core/styles';


/**
 * street VARCHAR(100) NOT NULL,
  cross_street VARCHAR(50),
  county VARCHAR(30),
  city VARCHAR(30) NOT NULL,
  city_state VARCHAR(3),
  city_zip VARCHAR(20) NOT NULL,
  title VARCHAR(30) NOT NULL,
  basin_plan VARCHAR(30),
  began timestamp,
 */



class ParcelNumber extends Component {
  constructor(props){
    super(props)
    let [num, fnum] = this.formatNumber(props.parcel.pnumber)
    this.state = {
      parcel: props.parcel,
      pnumber: num,
      formattedNumber: fnum
    }
  }
  
  static getDerivedStateFromProps(props, state){
    return state
  }


  formatNumber(num){
    // console.log("Incoming number")
    // console.log(num)
    let _num = num.replace(/~/g, "")
    // Take current number and format to => ____-____-____-____
    // console.log("Outgoing number")
    // console.log(_num)

    if(_num.length === 0){
      return [_num, ""]
    }
    return [_num, `~${_num}~`]
  }

  onChange(ev){
    const {name, value} = ev.target
    // Do processing on incoming number setState to both
    // pnumber and formmated_number
    let [ num, formattedNumber ] = this.formatNumber(value)
    this.setState({
      pnumber: num,
      formattedNumber: formattedNumber
    }, () => {
      this.onUpdate()
    })
  }

  onUpdate(){
    // send number to parent for storage
    this.props.onUpdate(this.props.parcel.pk, this.state.pnumber)
  }
  
  render(){
    // console.log(this.state.parcel)
    return(
      <Grid item container xs={12}>
        <Grid item xs={12}>
          <TextField
            name='pnumber'  
            value={this.state.formattedNumber}
            onChange={this.onChange.bind(this)}
            label="APN"
            style={{width: "100%"}}        
            placeholder="    -    -    "
          />
        </Grid>
      </Grid>
    )
  }
}
export default ParcelNumber = withTheme(ParcelNumber)