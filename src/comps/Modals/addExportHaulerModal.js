import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
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

class AddExportHaulerModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      createExportHaulerObj: props.createExportHaulerObj,
    }
    /*
    open
    actionText
    cancelText
    modalText
    onAction
    onClose

    title,
    first_name,
    last_name,
    middle_name,
    suffix_name,
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
            <Paper style={{ height: "75vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Grid item container xs={12}>
                <Grid item xs={12}>
                  <Typography style={{ marginTop: "32px" }}>
                    {this.props.modalText}
                  </Typography>
                </Grid>
                <Grid item container xs={12}>
                  <Grid item xs={6}>
                    <TextField
                      name='title'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportHaulerObj.title}
                      label="Company"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='first_name'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportHaulerObj.first_name}
                      label="First name"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='last_name'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportHaulerObj.last_name}
                      label="Last name"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='middle_name'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportHaulerObj.middle_name}
                      label="Middle name"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='suffix_name'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportHaulerObj.suffix_name}
                      label="Appelation"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name='primary_phone'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportHaulerObj.primary_phone}
                      label="Phone number"
                      style={{ width: "100%" }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      name='street'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportHaulerObj.street}
                      label="Street"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='cross_street'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportHaulerObj.cross_street}
                      label="Cross street"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='county'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportHaulerObj.county}
                      label="County"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='city'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportHaulerObj.city}
                      label="City"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='city_state'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportHaulerObj.city_state}
                      label="State"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name='city_zip'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportHaulerObj.city_zip}
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

export default AddExportHaulerModal = withTheme(AddExportHaulerModal);