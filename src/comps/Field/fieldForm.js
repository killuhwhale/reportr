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



class FieldForm extends Component {
  constructor(props){
    super(props)
    this.state = {
      field: props.field
    }
  }
  
  static getDerivedStateFromProps(props, state){
    return state
  }

  

  onChange(ev){
    const {name, value} = ev.target
    let _field = this.state.field
    _field[name] = value

    this.setState({
      field: _field    
    }, () => {
      this.onUpdate()
    })
  }

  onUpdate(){
    // send number to parent for storage
    // Check if there is an issue when passing pk as a data in the field object.
    this.props.onUpdate(this.props.field.pk, this.state.field)
  }
  
  render(){
    return(
      <Grid item container xs={12}>
        <Grid item xs={4} style={{marginTop: "16px"}}>
          <TextField disabled
            name='title'  
            value={this.state.field.title}
            onChange={this.onChange.bind(this)}
            label="Field Name"
            style={{width: "100%"}}        
          />
        </Grid>
        <Grid item xs={4} style={{marginTop: "16px"}}>
          <TextField
            name='acres'  
            value={this.state.field.acres}
            onChange={this.onChange.bind(this)}
            label="Acres"
            style={{width: "100%"}}        
          />
        </Grid>
        <Grid item xs={4} style={{marginTop: "16px"}}>
          <TextField
            name='cropable'  
            value={this.state.field.cropable}
            onChange={this.onChange.bind(this)}
            label="Acres Cropable"
            style={{width: "100%"}}        
          />
        </Grid>
      </Grid>
    )
  }
}
export default FieldForm = withTheme(FieldForm)