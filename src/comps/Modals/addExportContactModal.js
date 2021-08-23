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

class AddExportContactModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      createExportContactObj: props.createExportContactObj,
    }
    /*
    open
    actionText
    cancelText
    modalText
    onAction
    onClose


        first_name,
        last_name,
        middle_name,
        suffix_name,
        primary_phone
    */
  }

  static getDerivedStateFromProps(props, state) {
    return props
  }

  render() {
    return (
      <Modal
        open={this.state.open}
        onClose={this.props.onClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description">
        <div style={{
          position: 'absolute', top: "50%", left: "50%", width: "80vw",
          transform: "translate(-50%, -50%)",
        }}>
          <Grid item align="center" xs={12} >
            <Paper style={{ height: "55vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Grid item container xs={12}>
                <Grid item xs={12}>
                  <Typography style={{ marginTop: "32px" }}>
                    {this.props.modalText}
                  </Typography>
                </Grid>
                <Grid item container xs={12}>
                  <Grid item xs={6}>
                    <TextField
                      name='first_name'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportContactObj.first_name}
                      label="First name"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      name='primary_phone'
                      onChange={this.props.onChange.bind(this)}
                      value={this.state.createExportContactObj.primary_phone}
                      label="Phone number"
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

export default AddExportContactModal = withTheme(AddExportContactModal);