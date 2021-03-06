import React, { Component } from 'react'
import {
  Grid, Typography, IconButton, Tooltip
} from '@material-ui/core'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import Delete from '@material-ui/icons/Delete'
import ActionCancelModal from "../Modals/actionCancelModal"
import { naturalSortByKeys } from '../../utils/format'
import { Parcels } from '../../utils/parcels/parcels'

class JoinedView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      field_parcels: props.field_parcels,
      showDeleteJoinFieldParcel: false,
      curDeleteFieldParcel: {}
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }

  toggleDeletejJoinFieldParcel(val) {
    this.setState({
      showDeleteJoinFieldParcel: val,
    })
  }

  confirmJoinedFieldParcel(fieldParcel) {
    this.setState({
      showDeleteJoinFieldParcel: true,
      curDeleteFieldParcel: fieldParcel
    })
  }

  async deleteJoinedFieldParcel() {
    if (Object.keys(this.state.curDeleteFieldParcel).length > 0) {
      let pk = this.state.curDeleteFieldParcel.pk
      const res = await Parcels.deleteFieldParcel(pk, this.state.dairy.pk)
      this.toggleDeletejJoinFieldParcel(false)
      if (res.error) return this.props.onAlert(res.error, 'error')
      this.props.onDelete()

    }
  }

  render() {
    return (
      <Grid container item xs={12}>
        {this.state.field_parcels.length > 0 ?
          this.state.field_parcels.sort((a, b) => naturalSortByKeys(a, b, ['title', 'pnumber'])).map((fieldParcel, i) => {
            return (
              <Grid key={`fieldParcel1337${i}`} item container xs={6} justifyContent="center" alignItems="center" className='showOnHoverParent'>
                <Grid item xs={10} style={{ display: 'flex' }}>
                  <Typography variant="subtitle1" style={{ marginRight: '12px' }}> {`${fieldParcel.title}`} </Typography>
                  <Typography variant="subtitle1" color='secondary'>{`${this.props.fmtPNumber(fieldParcel.pnumber)}`}</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Tooltip title="Delete join">
                    <IconButton className='showOnHover'
                      onClick={() => this.confirmJoinedFieldParcel(fieldParcel)}
                    >
                      <Delete color="error" />
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
                          ${this.state.curDeleteFieldParcel.title} -
                           ${this.state.curDeleteFieldParcel.pnumber}`}
          onAction={this.deleteJoinedFieldParcel.bind(this)}
          onClose={() => this.toggleDeletejJoinFieldParcel(false)}

        />
      </Grid>
    )
  }
}

export default JoinedView = withRouter(withTheme(JoinedView))
