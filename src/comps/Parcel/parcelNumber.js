import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
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



class ParcelNumber extends Component {
  constructor(props) {
    super(props)
    let [num, fnum] = this.formatNumber(props.parcel.pnumber)
    this.state = {
      parcel: props.parcel,
      pnumber: num,
      formattedNumber: fnum
    }
  }

  static getDerivedStateFromProps(props, state) {
    return state
  }


  formatNumber(num) {
    let _num = num.replace(/-/g, "").replace(/\s/g, "").substring(0, 16)
    let template = "    -    -    -    "
    if (_num.length === 0) {
      return [_num, ""]
    }
    let fmt = [...template].map((ch, i) => {
      if (ch === "-") {
        return ch
      }
      let hyphenOffset = parseInt(i / 5)
      if (i < _num.length + hyphenOffset) {
        return _num.charAt(i - hyphenOffset)
      }
      return ch
    })
    return [_num.trim(), fmt.join("")]
  }

  onChange(ev) {
    const { name, value } = ev.target

    let caret = ev.target.selectionStart;
    const element = ev.target;

    // Do processing on incoming number setState to both
    // pnumber and formmated_number
    let [num, formattedNumber] = this.formatNumber(value)
    let num_len = [...num].length
    console.log(num, num_len)
    if ([4, 9, 13].indexOf(num_len) > -1) {

      caret++
    }

    this.setState({
      pnumber: num,
      formattedNumber: formattedNumber
    }, () => {
      this.onUpdate()
      window.requestAnimationFrame(() => {
        element.selectionStart = caret;
        element.selectionEnd = caret;
      });
    })
  }

  onUpdate() {
    // send number to parent for storage
    this.props.onUpdate(this.props.parcel.pk, this.state.pnumber)
  }

  render() {
    // console.log(this.state.parcel)
    return (
      <TextField
        name='pnumber'
        value={this.state.formattedNumber}
        // onChange={this.onChange.bind(this)}
        label="APN"
        style={{ width: "100%" }}
        placeholder="    -    -    "
      />
    )
  }
}
export default ParcelNumber = withTheme(ParcelNumber)