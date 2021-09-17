import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import {
  DatePicker
} from '@material-ui/pickers';
import { withTheme } from '@material-ui/core/styles';
import { zeroTimeDate } from '../../utils/convertCalc';

class AddFreshwaterAnalysisModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      createFreshwaterAnalysisObj: props.createFreshwaterAnalysisObj
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
                    name='src_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.src_idx}
                    label="Freshwater Source"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.fieldCropAppFreshwaterSources.length > 0 ?
                      this.props.fieldCropAppFreshwaterSources.map((freshwaterSource, i) => {
                        return (
                          <option key={`fwsources${i}`} value={i}>{freshwaterSource.src_desc} / {freshwaterSource.src_type}</option>
                        )
                      })
                      :
                      <option key={`fwsources`}>No freshwater sources.</option>

                    }

                  </TextField>
                </Grid>

                <Grid item xs={6}>
                  <DatePicker
                    value={new Date(this.state.createFreshwaterAnalysisObj.sample_date)}
                    label="Sample Date"
                    onChange={(_date) => this.props.onChange({target: {name: 'sample_date', value: zeroTimeDate(_date)}})}
                    style={{ width: "100%", justifyContent: "flex-end" }}
                  />


                </Grid>
                <Grid item xs={6}>
                   <TextField select
                    name='src_of_analysis_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.src_of_analysis_idx}
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
                      <option key={`fwasoa`}>No freshwater analysis: LAB ANALYSIS SOURCE.</option>

                    }

                  </TextField>
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    name='sample_desc'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.sample_desc}
                    label="Sample description"
                    style={{ width: "100%" }}
                  />
                </Grid>
                
                <Grid item xs={3}>
                  <TextField
                    name='n_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.n_con}
                    label="Nitrogen"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='nh4_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.nh4_con}
                    label="Ammonium-N"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='no2_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.no2_con}
                    label="Nitrite-N"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='ca_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.ca_con}
                    label="Calcium"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='mg_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.mg_con}
                    label="Magnesium"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='na_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.na_con}
                    label="Sodium"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='hco3_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.hco3_con}
                    label="Bicarbonate"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='co3_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.co3_con}
                    label="Carbonate"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='so4_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.so4_con}
                    label="Sulfate"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='cl_con'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.cl_con}
                    label="Cloride"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='ec'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.ec}
                    label="EC"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='tds'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createFreshwaterAnalysisObj.tds}
                    label="Disolved solids"
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
                    <Button disabled={this.props.fieldCropAppFreshwaterSources.length === 0}
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

export default AddFreshwaterAnalysisModal = withTheme(AddFreshwaterAnalysisModal);