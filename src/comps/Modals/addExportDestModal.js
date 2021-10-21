import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField, Switch, FormControlLabel, FormGroup } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';

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

class AddExportDestModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      createExportDestObj: props.createExportDestObj,
    }
    /*
    open
    actionText
    cancelText
    modalText
    onAction
    onClose

    export_recipient_id,

        pnumber,
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

                <Grid item xs={12}>
                  <TextField select
                    name='export_recipient_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createExportDestObj.export_recipient_idx}
                    label="Recipient"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.exportRecipients.length > 0 ?
                      this.props.exportRecipients.map((recipient, i) => {
                        return (
                          <option key={`recipient${i}`} value={i}>{recipient.title}</option>
                        )
                      })
                      :
                      <option key={`recipient`}>No recipients</option>
                    }
                  </TextField>
                </Grid>


                <Grid item container alignItems="center" xs={12} style={{ height: '55vh' }}>

                  <Grid item xs={6}>
                    <TextField
                        name='pnumber'
                        onChange={this.props.onChange.bind(this)}
                        value={this.state.createExportDestObj.pnumber}
                        label="Parcel Number"
                        style={{ width: "100%" }}
                      />
                  </Grid>


                  <Grid item xs={6}>
                    <TextField
                      name='street'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportDestObj.street}
                      label="Street"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='cross_street'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportDestObj.cross_street}
                      label="Cross street"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='county'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportDestObj.county}
                      label="County"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='city'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportDestObj.city}
                      label="City"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='city_state'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportDestObj.city_state}
                      label="State"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='city_zip'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportDestObj.city_zip}
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

export default AddExportDestModal = withTheme(AddExportDestModal);