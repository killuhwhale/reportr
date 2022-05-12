import React, { Component } from 'react'
import {
  Grid, TextField
} from '@material-ui/core'

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
  constructor(props) {
    super(props)
    this.state = {
      field: props.field
    }
  }

  static getDerivedStateFromProps(props, state) {
    return props
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.field.pk !== this.state.field.pk) {
      this.setState({ ...this.state })
    }
  }

  onChange(ev) {
    const { name, value } = ev.target
    let _field = this.state.field
    _field[name] = value

    this.setState({
      field: _field
    }, () => {
      this.onUpdate()
    })
  }

  onUpdate() {
    // send number to parent for storage
    // Check if there is an issue when passing pk as a data in the field object.
    this.props.onUpdate(this.props.field.pk, this.state.field)
  }

  render() {
    return (
      <Grid item container xs={12} style={{ marginBottom: '8px' }}>
        <Grid item xs={7} >
          <TextField
            name='title'
            value={this.state.field.title}
            onChange={this.props.titleEditable ? this.onChange.bind(this) : null}
            label="Field Name"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={2} >
          <TextField
            name='acres'
            value={this.state.field.acres}
            onChange={this.onChange.bind(this)}
            label="Acres"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={3} >
          <TextField
            name='cropable'
            value={this.state.field.cropable}
            onChange={this.onChange.bind(this)}
            label="Acres Cropable"
            style={{ width: "100%" }}
          />
        </Grid>
      </Grid>
    )
  }
}
export default FieldForm = withTheme(FieldForm)