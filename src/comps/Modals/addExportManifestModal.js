import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField, Switch, FormControlLabel, FormGroup } from '@material-ui/core'
import { withTheme } from '@material-ui/core/styles'
import ParcelNumber from '../Parcel/parcelNumber'
import {
  DatePicker
} from '@material-ui/pickers'

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

class AddExportManifestModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      createExportManifestObj: props.createExportManifestObj,
    }
    /*
    open
    actionText
    cancelText
    modalText
    onAction
    onClose

    dairy_id,
    operator_id,
    export_contact_id,
  
    export_dest_id,
    last_date_hauled,
    amount_hauled,
    material_type,
    amount_hauled_method,
  
    reporting_method, 
    moisture,
    n_con_mg_kg,
    p_con_mg_kg,
    k_con_mg_kg,
    tfs,
    
    kn_con_mg_l,
    nh4_con_mg_l,
    nh3_con_mg_l,
    no3_con_mg_l,
    p_con_mg_l,
    k_con_mg_l,
    tds
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
            <Paper style={{ height: "85vh", display: "flex", flexDirection: "column", justifyContent: "center"}}>
              <Grid item container spacing={2} xs={12} style={{height: '85vh', overflow: 'auto', padding: "10px"}}>
                <Grid item xs={12}>
                  <Typography style={{ marginTop: "32px" }}>
                    {this.props.modalText}
                  </Typography>
                </Grid>

                <Grid item xs={4}>
                  <TextField select
                    name='export_dest_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createExportManifestObj.export_dest_idx}
                    label="Destination"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.exportDests.length > 0 ?
                      this.props.exportDests.map((dest, i) => {
                        return (
                          <option key={`destmanifest${i}`} value={i}>
                            {dest.title} {dest.dest_type}: {`${dest.pnumber} ${dest.street} ${dest.cross_street} ${dest.city_zip}`}
                          </option>
                        )
                      })
                      :
                      <option key={`destmanifest`}>No destinations</option>
                    }
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField select
                    name='export_contact_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createExportManifestObj.export_contact_idx}
                    label="Contact"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.exportContacts.length > 0 ?
                      this.props.exportContacts.map((contact, i) => {
                        return (
                          <option key={`manifestcontact${i}`} value={i}>
                            {contact.first_name} {contact.middle_name} {contact.last_name} {contact.suffix_name} {contact.primary_phone}
                          </option>
                        )
                      })
                      :
                      <option key={`manifestcontact`}>No contacts</option>
                    }
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField select
                    name='operator_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createExportManifestObj.operator_idx}
                    label="Operator"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.operators.length > 0 ?
                      this.props.operators.map((operator, i) => {
                        return (
                          <option key={`manifestcontact${i}`} value={i}>
                            {operator.title} {operator.primary_phone}
                          </option>
                        )
                      })
                      :
                      <option key={`manifestcontact`}>No operators</option>
                    }
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField select
                    name='export_hauler_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createExportManifestObj.export_hauler_idx}
                    label="Hauler"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.exportHaulers.length > 0 ?
                      this.props.exportHaulers.map((hauler, i) => {
                        return (
                          <option key={`manifesthauler${i}`} value={i}>
                            {hauler.title}
                          </option>
                        )
                      })
                      :
                      <option key={`manifestcontact`}>No haulers</option>
                    }
                  </TextField>
                </Grid>
                
                <Grid item xs={4}>
                  <TextField
                    name='amount_hauled'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createExportManifestObj.amount_hauled}
                    label="Amount hauled"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <DatePicker label="Date last hauled"
                    value={this.state.createExportManifestObj.last_date_hauled}
                    onChange={(date) => this.props.onChange({target: {name: 'last_date_hauled', value: date}})}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField multiline rows={4}
                    name='amount_hauled_method'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createExportManifestObj.amount_hauled_method}
                    label="Method used to determine amount hauled:"
                    style={{ width: "100%" }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField select
                    name='material_type_idx'
                    onChange={this.props.onChange.bind(this)}
                    value={this.state.createExportManifestObj.material_type_idx}
                    label="Material type"
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.MANIFEST_MATERIAL_TYPES.length > 0 ?
                      this.props.MANIFEST_MATERIAL_TYPES.map((material, i) => {
                        return (
                          <option key={`manifestmaterial${i}`} value={i}>
                            {material}
                          </option>
                        )
                      })
                      :
                      <option key={`manifestmaterial`}>No materials</option>
                    }
                  </TextField>
                </Grid>

                <Grid item container alignItems="center" xs={12} style={{ height: '55vh' }}>
                  {
                    this.state.createExportManifestObj.material_type_idx <= 4 ?
                      <Grid item container xs={12}>

                        <Grid item xs={12}>
                          <TextField select
                            name='reporting_method_idx'
                            onChange={this.props.onChange.bind(this)}
                            value={this.state.createExportManifestObj.reporting_method_idx}
                            label="Reporting method"
                            style={{ width: "100%" }}
                            SelectProps={{
                              native: true,
                            }}
                          >
                            {this.props.REPORTING_METHODS.length > 0 ?
                              this.props.REPORTING_METHODS.map((reporting_method, i) => {
                                return (
                                  <option key={`eportingMethodManifest${i}`} value={i}>
                                    {reporting_method}
                                  </option>
                                )
                              })
                              :
                              <option key={`reportingMethodManifest`}>No reporting methods</option>
                            }
                          </TextField>
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            name='moisture'
                            onChange={this.props.onChange.bind(this)}
                            value={this.state.createExportManifestObj.moisture}
                            label="Moisture"
                            style={{ width: "100%" }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            name='n_con_mg_kg'
                            onChange={this.props.onChange.bind(this)}
                            value={this.state.createExportManifestObj.n_con_mg_kg}
                            label="Nitrogen"
                            style={{ width: "100%" }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            name='p_con_mg_kg'
                            onChange={this.props.onChange.bind(this)}
                            value={this.state.createExportManifestObj.p_con_mg_kg}
                            label="Phosphorus"
                            style={{ width: "100%" }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            name='k_con_mg_kg'
                            onChange={this.props.onChange.bind(this)}
                            value={this.state.createExportManifestObj.k_con_mg_kg}
                            label="Potassium"
                            style={{ width: "100%" }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            name='tfs'
                            onChange={this.props.onChange.bind(this)}
                            value={this.state.createExportManifestObj.tfs}
                            label="Total Fixed Solids"
                            style={{ width: "100%" }}
                          />
                        </Grid>
                      </Grid>

                      : this.state.createExportManifestObj.material_type < 7 ?

                        <Grid item container xs={12}>
                          <Grid item xs={6}>
                            <TextField
                              name='kn_con_mg_l'
                              onChange={this.props.onChange.bind(this)}
                              value={this.state.createExportManifestObj.kn_con_mg_l}
                              label="KN-Nitrogen"
                              style={{ width: "100%" }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              name='nh4_con_mg_l'
                              onChange={this.props.onChange.bind(this)}
                              value={this.state.createExportManifestObj.nh4_con_mg_l}
                              label="Ammonium-Nitrogen"
                              style={{ width: "100%" }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              name='nh3_con_mg_l'
                              onChange={this.props.onChange.bind(this)}
                              value={this.state.createExportManifestObj.nh3_con_mg_l}
                              label="Unionized Ammonium-Nitrogen"
                              style={{ width: "100%" }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              name='no3_con_mg_l'
                              onChange={this.props.onChange.bind(this)}
                              value={this.state.createExportManifestObj.no3_con_mg_l}
                              label="Nitrate-Nitrogen"
                              style={{ width: "100%" }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              name='p_con_mg_l'
                              onChange={this.props.onChange.bind(this)}
                              value={this.state.createExportManifestObj.p_con_mg_l}
                              label="Phosphorus"
                              style={{ width: "100%" }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              name='k_con_mg_l'
                              onChange={this.props.onChange.bind(this)}
                              value={this.state.createExportManifestObj.k_con_mg_l}
                              label="Potassium"
                              style={{ width: "100%" }}
                            />
                          </Grid>
                        </Grid>
                        :
                        <React.Fragment></React.Fragment>
                  }
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

export default AddExportManifestModal = withTheme(AddExportManifestModal);