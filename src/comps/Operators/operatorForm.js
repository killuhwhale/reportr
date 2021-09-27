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
    return props
  }

  render() {
    return (
      <Grid item container xs={12} style={{marginBottom: '32px'}}>
        <Grid item xs={4}>
          <TextField
            name='title'
            value={this.state.operator.title}
            onChange={(ev) => this.props.onChange(this.props.index, ev)}
            label="Owner / Operator Name"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name='primary_phone'
            value={this.state.operator.primary_phone}
            onChange={(ev) => this.props.onChange(this.props.index, ev)}
            label="Primary phone number"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name='secondary_phone'
            value={this.state.operator.secondary_phone}
            onChange={(ev) => this.props.onChange(this.props.index, ev)}
            label="Secondary phone number"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name='street'
            value={this.state.operator.street}
            onChange={(ev) => this.props.onChange(this.props.index, ev)}
            label="Street"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name='city'
            value={this.state.operator.city}
            onChange={(ev) => this.props.onChange(this.props.index, ev)}
            label="City"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={2}>
          <TextField
            name='city_state'
            value={this.state.operator.city_state}
            onChange={(ev) => this.props.onChange(this.props.index, ev)}
            label="State"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name='city_zip'
            value={this.state.operator.city_zip}
            onChange={(ev) => this.props.onChange(this.props.index, ev)}
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
            onChange={(ev) => this.props.onChange(this.props.index, {target: {name: 'is_responsible', value: ev.target.checked}})}
          />
        </Grid>

        <Grid item xs={2}>
          <Typography variant="caption">
            Is Owner
          </Typography>
          <Switch
            name="is_owner" color="secondary"
            label="Owner"
            checked={this.state.operator.is_owner}
            onChange={(ev) => this.props.onChange(this.props.index, {target: {name: 'is_owner', value: ev.target.checked}})}
          />
        </Grid>
        <Grid item xs={2}>
          <Typography variant="caption">
            Is Operator
          </Typography>
          <Switch
            name="is_operator" color="secondary"
            label="Operator"
            checked={this.state.operator.is_operator}
            onChange={(ev) => this.props.onChange(this.props.index, {target: {name: 'is_operator', value: ev.target.checked}})}
          />
        </Grid>
      </Grid>
    )
  }

}

export default OperatorForm = withTheme(OperatorForm);