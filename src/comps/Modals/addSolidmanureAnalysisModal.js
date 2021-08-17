import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import {
  DatePicker
} from '@material-ui/pickers';
import { withTheme } from '@material-ui/core/styles';

class AddSolidmanureAnalysisModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      createSolidmanureAnalysisObj: props.createSolidmanureAnalysisObj
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
    //     sample_date,
    //     material_type,
    //     src_of_analysis,
    //     method_of_reporting,
    // sample_desc,
    //     moisture,
    //     n_con,
    //     p_con,
    //     k_con,
    //     ca_con,
    //     mg_con,
    //     na_con,
    //     s_con,
    //     cl_con,
    //     tfs,
    // REPORTING_METHODS, SOURCE_OF_ANALYSES, MATERIAL_TYPES
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
                    name='material_type_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureAnalysisObj.material_type_idx}
                    label="Material Type"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.MATERIAL_TYPES.length > 0 ?
                      this.props.MATERIAL_TYPES.map((material, i) => {
                        return (
                          <option key={`smmt${i}`} value={i}>{material}</option>
                        )
                      })
                      :
                      <option key={`smmt`}>No material types.</option>

                    }

                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    value={this.state.createSolidmanureAnalysisObj.sample_date}
                    label="Sample Date"
                    onChange={this.props.onChange.bind(this)}
                    style={{ width: "100%", justifyContent: "flex-end" }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name='sample_desc'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureAnalysisObj.sample_desc}
                    label="Sample description"
                    style={{ width: "100%" }}
                  />
                </Grid>
                
                <Grid item xs={4}>
                   <TextField select
                    name='src_of_analysis_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureAnalysisObj.src_of_analysis_idx}
                    label="Source of analysis"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.SOURCE_OF_ANALYSES.length > 0 ?
                      this.props.SOURCE_OF_ANALYSES.map((analysis_source, i) => {
                        return (
                          <option key={`fwasoa${i}`} value={i}>{analysis_source}</option>
                        )
                      })
                      :
                      <option key={`fwasoa`}>No solidmanure analysis: LAB ANALYSIS SOURCE.</option>

                    }

                  </TextField>
                </Grid>
                <Grid item xs={4}>
                   <TextField select
                    name='method_of_reporting_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureAnalysisObj.method_of_reporting_idx}
                    label="Method of Reporting"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.REPORTING_METHODS.length > 0 ?
                      this.props.REPORTING_METHODS.map((reporting_method, i) => {
                        return (
                          <option key={`smrm${i}`} value={i}>{reporting_method}</option>
                        )
                      })
                      :
                      <option key={`smrm`}>No reporting methods</option>

                    }

                  </TextField>
                </Grid>
                
                
                <Grid item xs={3}>
                  <TextField
                    name='n_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureAnalysisObj.n_con}
                    label="Nitrogen"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='p_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureAnalysisObj.p_con}
                    label="Phosphorus"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='k_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureAnalysisObj.k_con}
                    label="Potassium"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='ca_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureAnalysisObj.ca_con}
                    label="Calcium"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='mg_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureAnalysisObj.mg_con}
                    label="Magnesium"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='na_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureAnalysisObj.na_con}
                    label="Sodium"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='s_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureAnalysisObj.s_con}
                    label="Sulfur"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name='cl_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureAnalysisObj.cl_con}
                    label="Chloride"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='tfs'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createSolidmanureAnalysisObj.tfs}
                    label="Fixed Solids"
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

export default AddSolidmanureAnalysisModal = withTheme(AddSolidmanureAnalysisModal);