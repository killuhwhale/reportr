import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import {
  DatePicker
} from '@material-ui/pickers';
import { withTheme } from '@material-ui/core/styles';

class AddSolidmanureModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      createSolidmanureObj: props.createSolidmanureObj
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
    // field_crop_app_id,
    //     field_crop_app_solidmanure_analysis_id,
    //     src_desc,
    //     amount_applied,
    //     amt_applied_per_acre, -- not included when manually added.
    //     n_lbs_acre,
    //     p_lbs_acre,
    //     k_lbs_acre,
    //     salt_lbs_acre 
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
                    value={this.state.createSolidmanureObj.field_crop_app_idx}
                    label="Crop Applicaton"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.fieldCropAppEvents.length > 0 ?
                      this.props.fieldCropAppEvents.map((app_event, i) => {
                        return (
                          <option key={`smmt${i}`} value={i}>{app_event.croptitle} {app_event.app_date}</option>
                        )
                      })
                      :
                      <option key={`smmt`}>No material types.</option>

                    }

                  </TextField>
                </Grid>
                <Grid item xs={6}>
                   <TextField select
                    name='field_crop_app_solidmanure_analysis_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureObj.field_crop_app_solidmanure_analysis_idx}
                    label="SM Analysis"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.fieldCropAppSolidmanureAnalyses.length > 0 ?
                      this.props.fieldCropAppSolidmanureAnalyses.map((analysis, i) => {
                        return (
                          <option key={`smaz${i}`} value={i}>{analysis.sample_desc} / {analysis.sample_date}</option>
                        )
                      })
                      :
                      <option key={`smaz`}>No solidmanure analyses.</option>

                    }

                  </TextField>
                </Grid>
              
                <Grid item xs={6}>
                  <TextField
                    name='src_desc'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureObj.src_desc}
                    label="Source description"
                    style={{ width: "100%" }}
                  />
                </Grid>
                
                
                <Grid item xs={6}>
                  <TextField
                    name='amount_applied'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureObj.amount_applied}
                    label="Amount applied"
                    style={{ width: "100%" }}
                  />
                </Grid>
               
                <Grid item xs={3}>
                  <TextField
                    name='n_lbs_acre'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureObj.n_lbs_acre}
                    label="Nitrogen lbs / acre"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='p_lbs_acre'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureObj.p_lbs_acre}
                    label="Phosphorus lbs /acre"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='k_lbs_acre'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureObj.k_lbs_acre}
                    label="Potassium lbs / acre"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='salt_lbs_acre'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureObj.salt_lbs_acre}
                    label="Salt lbs / acre"
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

export default AddSolidmanureModal = withTheme(AddSolidmanureModal);