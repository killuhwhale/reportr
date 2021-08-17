import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import {
  DatePicker
} from '@material-ui/pickers';
import { withTheme } from '@material-ui/core/styles';

class AddProcessWastewaterModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      fieldCropAppEvents: props.fieldCropAppEvents,
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
            <Paper style={{ height: "75vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Grid item container spacing={2} xs={12}>
                <Grid item xs={12}>
                  <Typography style={{ marginTop: "32px" }}>
                    {this.props.modalText}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <TextField select
                    name='app_event_idx'
                    onChange={this.props.onChange.bind(this)}
                    // value={this.state.createProcessWastewaterObj.app_event_idx}
                    label="Application Event - Field name / App date / App method"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.fieldCropAppEvents.length > 0 ?
                      this.props.fieldCropAppEvents.map((event, i) => {
                        return (
                          <option key={`ppwwae${i}`} value={i}>{event.fieldtitle} / {event.app_date} / {event.app_method}</option>
                        )
                      })
                      :
                      <option key={`ppwwae`}>No application events.</option>

                    }

                  </TextField>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    name='source_desc'
                    onChange={this.props.onChange.bind(this)}
                    // value={this.state.createProcessWastewaterObj.source_desc}
                    label="Source description"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField select
                    name='material_type_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createProcessWastewaterObj.material_type_idx}
                    label="Material type"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.materialTypes.length > 0 ?
                      this.props.materialTypes.map((materialType, i) => {
                        return (
                          <option key={`ppwwaem${i}`} value={i}>{materialType}</option>
                        )
                      })
                      :
                      <option key={`ppwwaem`}>No material types.</option>

                    }

                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name='amount_applied'
                    onChange={this.props.onChange.bind(this)}
                    // value={this.state.createProcessWastewaterObj.amount_applied}
                    label="Amount applied"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name='n_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createProcessWastewaterObj.n_con}
                    label="Total Kjeldahl-nitrogen concentration"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  />
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    name='ammoniumN'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createProcessWastewaterObj.ammoniumN}
                    label="Ammonium-nitrogen"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name='unionizedAmmoniumN'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createProcessWastewaterObj.unionizedAmmoniumN}
                    label="Un-ionized ammonia-nitrogen"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name='nitrateN'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createProcessWastewaterObj.nitrateN}
                    label="Nitrate-nitroge"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  />
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    name='p_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createProcessWastewaterObj.p_con}
                    label="Total phosphorus"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name='k_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createProcessWastewaterObj.k_con}
                    label="Total potassium"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name='tds'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createProcessWastewaterObj.tds}
                    label="Total dissolved solids"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  />
                </Grid>
                    
                <Grid item xs={4}><hr /></Grid>
                <Grid item xs={4}><hr /></Grid>
                <Grid item xs={4}>
                  <TextField
                    name='totalN'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createProcessWastewaterObj.totalN}
                    label="N lbs/acre"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  />
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    name='totalP'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createProcessWastewaterObj.totalP}
                    label="P lbs/acre"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  />
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    name='totalK'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createProcessWastewaterObj.totalK}
                    label="K lbs/acre"
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

export default AddProcessWastewaterModal = withTheme(AddProcessWastewaterModal);