import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';

import { withTheme } from '@material-ui/core/styles';

class AddFertilizerModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      createFertilizerObj: props.createFertilizerObj
    }
    /*
    open
    actionText
    cancelText
    modalText
    onAction
    onClose

    field_crop_app_id,
    nutrient_import_id,
    amount_applied,
    ç,
    p_lbs_acre,
    k_lbs_acre,
    salt_lbs_acre 
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
        <div
          style={{
            position: 'absolute',
            top: "50%",
            left: "50%",
            width: "80vw",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Grid item align="center" xs={12}>
            <Paper style={{ height: "75vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Grid item container spacing={2} xs={12}>
                <Grid item xs={12}>
                  <Typography style={{ marginTop: "32px" }}>
                    {this.props.modalText}
                  </Typography>
                </Grid>

             
                <Grid item xs={5} align='center'>
                  <TextField select
                    name='nutrient_import_id_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFertilizerObj.nutrient_import_id_idx}
                    label="Nutrient Import"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.nutrientImports.length > 0 ?
                      this.props.nutrientImports.map((nutrientImport, i) => {
                        return (
                          <option key={`afmni${i}`} value={i}>{nutrientImport.import_date} / {nutrientImport.import_desc}</option>
                        )
                      })
                      :
                      <option key={`afmni`}>No nutrient imports</option>

                    }

                  </TextField>
                </Grid>
              
                <Grid item xs={4} align='center'>
                  <TextField select
                    name='field_crop_app_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFertilizerObj.field_crop_app_idx}
                    label="Applciation Event"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.fieldCropAppEvents.length > 0 ?
                      this.props.fieldCropAppEvents.map((appEvent, i) => {
                        return (
                          <option key={`afmae${i}`} value={i}>{appEvent.app_date} - {appEvent.fieldtitle} / {appEvent.croptitle}</option>
                        )
                      })
                      :
                      <option key={`afmae`}>No applciation events</option>

                    }

                  </TextField>
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    name='amount_applied'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFertilizerObj.amount_applied}
                    label="Amount Applied"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='n_lbs_acre'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFertilizerObj.n_con}
                    label="Nitrogen concentration"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='p_lbs_acre'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFertilizerObj.p_con}
                    label="Phosphorus lbs acre"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='k_lbs_acre'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFertilizerObj.k_con}
                    label="Potassium lbs acre"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='salt_lbs_acre'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFertilizerObj.salt_con}
                    label="Salt lbs acre"
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

export default AddFertilizerModal = withTheme(AddFertilizerModal);