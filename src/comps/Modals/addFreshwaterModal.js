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
      createFreshwaterObj: props.createFreshwaterObj
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
    // sample_date,
    //       sample_desc,
    //       src_of_analysis,
    //       n_con,
    //       nh4_con, 
    //       no2_con,
    //       ca_con,
    //       mg_con,
    //       na_con,
    //       hco3_con,
    //       co3_con,
    //       so4_con,
    //       cl_con,
    //       ec, 
    //       // tds,
    return (
      <Modal
        open={this.state.open}
        onClose={this.props.onClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description">
        <div style={{
          position: 'absolute', top: "50%", left: "50%", width: "80vw", transform: "translate(-50%, -50%)",
        }}>
          <Grid item align="center" xs={12}>
            <Paper style={{ height: "75vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Grid item container spacing={2} xs={12}>
                <Grid item xs={12}>
                  <Typography style={{ marginTop: "32px" }}>
                    {this.props.modalText}
                  </Typography>
                </Grid>


                <Grid item xs={6} align='center'>
                  <TextField select
                    name='field_crop_app_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterObj.field_crop_app_idx}
                    label="Application Event"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.fieldCropAppEvents.length > 0 ?
                      this.props.fieldCropAppEvents.map((app_event, i) => {
                        return (
                          <option key={`fwapp_event${i}`} value={i}>{app_event.app_date} / {app_event.croptitle}</option>
                        )
                      })
                      :
                      <option key={`fwapp_event`}>No applicaiton events.</option>

                    }

                  </TextField>
                </Grid>

                <Grid item xs={6} align='center'>
                  <TextField select
                    name='field_crop_app_freshwater_analysis_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterObj.field_crop_app_freshwater_analysis_idx}
                    label="Freshwater Analysis"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.fieldCropAppFreshwaterAnalyses.length > 0 ?
                      this.props.fieldCropAppFreshwaterAnalyses.map((anaylsis, i) => {
                        return (
                          <option key={`fwanaylsis${i}`} value={i}>{anaylsis.sample_date} / {anaylsis.sample_desc}</option>
                        )
                      })
                      :
                      <option key={`fwanaylsis`}>No freshwater analyses.</option>

                    }

                  </TextField>
                </Grid>

                <Grid item xs={2}>
                  <TextField
                    name='app_rate'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterObj.app_rate}
                    label="App rate GPM"
                    style={{ width: "100%" }}
                  />
                </Grid>

                <Grid item xs={2}>
                  <TextField
                    name='run_time'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterObj.run_time}
                    label="Hours ran"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='amount_applied'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterObj.amount_applied}
                    label="Amount applied"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='amt_applied_per_acre'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterObj.amt_applied_per_acre}
                    label="Gallons per acre"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='totalN'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterObj.totalN}
                    label="Nitrogen lbs / acre"
                    style={{ width: "100%" }}
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
                    <Button disabled={this.props.fieldCropAppEvents.length === 0 || this.props.fieldCropAppFreshwaterAnalyses.length === 0}
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