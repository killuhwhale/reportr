import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import {
  DatePicker
} from '@material-ui/pickers';
import { withTheme } from '@material-ui/core/styles';

class AddFreshwaterModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      createFreshwaterSourceObj: props.createFreshwaterSourceObj
    }
    /*
    open
    actionText
    cancelText
    modalText
    onAction
    onClose
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
          position: 'absolute',
          top: "50%",
          left: "50%",
          width: "80vw",
          transform: "translate(-50%, -50%)",
        }}>
          <Grid
            item
            align="center"
            xs={12}
          >
            <Paper style={{ height: "45vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Grid item container spacing={2} xs={12}>
                <Grid item xs={12}>
                  <Typography style={{ marginTop: "32px" }}>
                    {this.props.modalText}
                  </Typography>
                </Grid>


                <Grid item xs={6}>
                  <TextField
                    name='src_desc'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterSourceObj.src_desc}
                    label="Source description"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    name='src_type'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterSourceObj.src_type}
                    label="Source type"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  />
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
                      onClick={() => { this.props.onAction() }}>
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

export default AddFreshwaterModal = withTheme(AddFreshwaterModal);