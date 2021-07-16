import React, { Component } from 'react'
// Material UI
import {
  Grid, Paper, Button, Typography, Modal, TextField, Switch
}
  from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';

class OperatorForm extends Component {

  constructor(props) {
    super(props)
    this.state = {
      operator: props.operator
    }
  }

  static getDerivedStateFromProps(props, state) {
    return state
  }

  onChange(ev){
    const {name, value, checked} = ev.target
    let _operator = this.state.operator
    
    if(['is_owner', 'is_responsible'].indexOf(name) >= 0){
      _operator[name] = checked  
    }else{
      _operator[name] = value
    }

    this.setState({
      operator: _operator    
    }, () => {
      this.onUpdate()
    })
  }

  onUpdate(){
    // send number to parent for storage
    // Check if there is an issue when passing pk as a data in the field object.
    this.props.onUpdate(this.props.operator.pk, this.state.operator)
  }

  render() {
    return (
      <Grid item container xs={12}>
        <Grid item xs={12}>
          <Typography style={{ marginTop: "32px" }}>
            {this.props.modalText}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            name='title'
            value={this.state.operator.title}
            onChange={this.onChange.bind(this)}
            label="Owner / Operator Name"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name='primary_phone'
            value={this.state.operator.primary_phone}
            onChange={this.onChange.bind(this)}
            label="Primary phone number"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name='secondary_phone'
            value={this.state.operator.secondary_phone}
            onChange={this.onChange.bind(this)}
            label="Secondary phone number"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name='street'
            value={this.state.operator.street}
            onChange={this.onChange.bind(this)}
            label="Street"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name='city'
            value={this.state.operator.city}
            onChange={this.onChange.bind(this)}
            label="City"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={2}>
          <TextField
            name='city_state'
            value={this.state.operator.city_state}
            onChange={this.onChange.bind(this)}
            label="State"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name='city_zip'
            value={this.state.operator.city_zip}
            onChange={this.onChange.bind(this)}
            label="Zip"
            style={{ width: "100%" }}
          />
        </Grid>

        <Grid item xs={4}>
          <Typography variant="caption">
            Responsible for permit fees
          </Typography>
          <Switch
            name="is_responsible" color="secondary"
            label="Responsible for permit fees"
            checked={this.state.operator.is_responsible}
            onChange={this.onChange.bind(this)}
          />
        </Grid>

        <Grid item xs={4}>
          <Typography variant="caption">
            Is Owner
          </Typography>
          <Switch
            name="is_owner" color="secondary"
            label="Owner"
            checked={this.state.operator.is_owner}
            onChange={this.onChange.bind(this)}
          />
        </Grid>
      </Grid>
    )
  }

}

export default OperatorForm = withTheme(OperatorForm);