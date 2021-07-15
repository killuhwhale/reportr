import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
}from '@material-ui/core'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import Delete from '@material-ui/icons/Delete'
import ActionCancelModal from "../Modals/actionCancelModal"
import { get, post } from "../../utils/requests"

const BASE_URL = "http://localhost:3001"



class ParcelView extends Component {
  constructor(props){
    super(props)
    this.state = {
      dairy: props.dairy,
      field_parcels: props.field_parcels,
      showDeleteJoinFieldParcel: false,
      curDeleteFieldParcel: {}
    }
  }
  static getDerivedStateFromProps(props, state){
    return props
  }
  
  toggleDeletejJoinFieldParcel(val){
    this.setState({
      showDeleteJoinFieldParcel: val,
    })
  }

  confirmJoinedFieldParcel(fieldParcel){
    this.setState({
      showDeleteJoinFieldParcel: true,
      curDeleteFieldParcel: fieldParcel
    })
  }

  deleteJoinedFieldParcel(){
    if(Object.keys(this.state.curDeleteFieldParcel).length > 0){
      let pk = this.state.curDeleteFieldParcel.pk
      console.log("Deleteing", pk)
      post(`${BASE_URL}/api/field_parcel/delete`, {data: pk})
      .then(res => {
        console.log(res)
        this.toggleDeletejJoinFieldParcel(false)
        this.props.onDelete()
      })
      .catch(err => {
        console.log(err)
      })
    }
  }

  render(){
    console.log(this.state)
    return(
      <Grid container item xs={12}>
          {this.state.field_parcels.length > 0 ?
            this.state.field_parcels.map((fieldParcel, i) => {
              return(
              <Grid key={`fieldParcel${i}`} item container xs={6} justifyContent="center" alignItems="center">
                <Grid item xs={10} >
                  <Typography>{`${fieldParcel.title} - ${fieldParcel.pnumber}`}</Typography>  
                </Grid>
                 <Grid item xs={2}>
                   <Tooltip title="Delete join">
                     <IconButton onClick={() => this.confirmJoinedFieldParcel(fieldParcel)}>
                       <Delete color="error"/>
                     </IconButton>
                   </Tooltip>
                 </Grid>
              </Grid>
              )
            })
          :
            <React.Fragment>No joined field parcels</React.Fragment>
          }
          <ActionCancelModal
            open={this.state.showDeleteJoinFieldParcel}
            actionText="Delete"
            cancelText="Cancel"
            modalText={`Are you sure you want to delete: 
                          ${this.state.curDeleteFieldParcel.title} /
                           ${this.state.curDeleteFieldParcel.pnumber}`}
            onAction={this.deleteJoinedFieldParcel.bind(this)}
            onClose={() => this.toggleDeletejJoinFieldParcel(false)}
            
          />
      </Grid>
    )
  }
}

export default ParcelView = withRouter(withTheme(ParcelView))
