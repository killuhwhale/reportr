import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField, Switch, FormControlLabel, FormGroup } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';
import ParcelNumber from '../Parcel/parcelNumber';

// Creates a new Field
// Starting with empty Field object,
//  Give to FieldForm to update each TextField to that object
//  This calls on udpated and sets the state to save the updated info
// The onAction method given by the parent will send the Field object to be saved in the data base
//                  Data flow
//       this file          <==>   destn.
//  empty data in Modal      => form component
//  Updated data from user   <= form component
//  Updated data -> onAction => parent

class AddExportRecipientModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      createExportRecipientObj: props.createExportRecipientObj,
    }
    /*
    open
    actionText
    cancelText
    modalText
    onAction
    onClose

    dest_type,
    title,
    primary_phone,
    street,
    cross_street,
    county,
    city,
    city_state,
    city_zip
    */
  }

  static getDerivedStateFromProps(props, state) {
    return props
  }

  render() {
    return (
      <Modal open={this.state.open} onClose={this.props.onClose} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <div style={{
          position: 'absolute', top: "50%", left: "50%", width: "80vw",
          transform: "translate(-50%, -50%)",
        }}>
          <Grid item align="center" xs={12} >
            <Paper style={{ height: "85vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Grid item container xs={12}>
                <Grid item xs={12}>
                  <Typography style={{ marginTop: "32px" }}>
                    {this.props.modalText}
                  </Typography>
                </Grid>

                <Grid item container alignItems="center" xs={12} style={{ height: '55vh' }}>

                  <Grid item xs={6}>
                    <TextField select
                      name='dest_type_idx'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportRecipientObj.dest_type_idx}
                      label="Destination type"
                      style={{ width: "100%" }}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      {this.props.DEST_TYPES.length > 0 ?
                        this.props.DEST_TYPES.map((dest_type, i) => {
                          return (
                            <option key={`dest_type${i}`} value={i}>{dest_type}</option>
                          )
                        })
                        :
                        <option key={`dest_type`}>No destination types</option>
                      }
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='title'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportRecipientObj.title}
                      label="Recipient title"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='street'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportRecipientObj.street}
                      label="Street"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='primary_phone'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportRecipientObj.primary_phone}
                      label="Phone"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='cross_street'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportRecipientObj.cross_street}
                      label="Cross street"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='county'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportRecipientObj.county}
                      label="County"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='city'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportRecipientObj.city}
                      label="City"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='city_state'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportRecipientObj.city_state}
                      label="State"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='city_zip'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportRecipientObj.city_zip}
                      label="Zip"
                      style={{ width: "100%" }}
                    />
                  </Grid>


                </Grid>
                <Grid item container xs={12}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      onClick={() => { this.props.onClose() }}>
                      {this.props.cancelText}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => { this.props.onAction(this.state.field) }}>
                      {this.props.actionText}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </div>
      </Modal>

    )
  }

}

export default AddExportRecipientModal = withTheme(AddExportRecipientModal);