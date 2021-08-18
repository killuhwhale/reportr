import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers';
import DeleteIcon from '@material-ui/icons/Delete'
import AddIcon from '@material-ui/icons/Add'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles';


class List extends Component {
  constructor(props) {
    super(props)
    this.state = {
      
    }

    
  }

  render(){
    console.log(this.props.children)
    return(
      <Grid item xs={12}>
        List here. we track scroll position and update elements accordibgly.
      </Grid>
    )
  }
}


export default List = withRouter(withTheme(List))