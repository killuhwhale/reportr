import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import {
  DatePicker
} from '@material-ui/pickers';
import { withTheme } from '@material-ui/core/styles';
import { zeroTimeDate } from '../../utils/convertCalc';

class AddNutrientImportModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      createNutrientImportObj: props.createNutrientImportObj
    }
    /*
    open
    actionText
    cancelText
    modalText
    onAction
    onClose

    import_desc,
    import_date,
    material_type,
    amount_imported,
    method_of_reporting,
    moisture,
    n_con,
    p_con,
    k_con,
    salt_con
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

                <Grid item xs={5}>
                  <TextField
                    name='import_desc'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createNutrientImportObj.import_desc}
                    label="Description"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <DatePicker
                    value={new Date(this.state.createNutrientImportObj.import_date)}
                    name="import_date"
                    label="Import Date"
                    onChange={(date) => this.props.onChange({target: {name: 'import_date', value: zeroTimeDate(date)}})}
                    style={{ width: "100%", justifyContent: "flex-end" }}
                  />
                </Grid>
                <Grid item xs={5} align='center'>
                  <TextField select
                    name='material_type_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createNutrientImportObj.material_type_idx}
                    label="Material type"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.NUTRIENT_IMPORT_MATERIAL_TYPES.length > 0 ?
                      this.props.NUTRIENT_IMPORT_MATERIAL_TYPES.map((material_type, i) => {
                        return (
                          <option key={`nimt${i}`} value={i}>{material_type}</option>
                        )
                      })
                      :
                      <option key={`nimt`}>No material types.</option>

                    }

                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name='amount_imported'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createNutrientImportObj.amount_imported}
                    label="Amount imported"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={4} align='center'>
                  <TextField select
                    name='method_of_reporting_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createNutrientImportObj.method_of_reporting_idx}
                    label="Reporting method"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.REPORTING_METHODS.length > 0 ?
                      this.props.REPORTING_METHODS.map((reporting_method, i) => {
                        return (
                          <option key={`nirm${i}`} value={i}>{reporting_method}</option>
                        )
                      })
                      :
                      <option key={`nirm`}>No reporting methods.</option>

                    }

                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name='moisture'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createNutrientImportObj.moisture}
                    label="Moisture"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='n_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createNutrientImportObj.n_con}
                    label="Nitrogen concentration"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='p_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createNutrientImportObj.p_con}
                    label="Phosphorus concentration"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='k_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createNutrientImportObj.k_con}
                    label="Potassium concentration"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='salt_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createNutrientImportObj.salt_con}
                    label="Salt %"
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

export default AddNutrientImportModal = withTheme(AddNutrientImportModal);