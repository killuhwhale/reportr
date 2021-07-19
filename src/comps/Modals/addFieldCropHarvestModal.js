import React, { Component } from 'react'
// Material UI
import { 	Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import {
  DatePicker
} from '@material-ui/pickers';
import { withTheme } from '@material-ui/core/styles';

class AddFieldCropHarvestModal extends Component{

	constructor(props){
		super(props)
		this.state = {
			open: props.open,
      createFieldCropHarvestObj: props.createFieldCropHarvestObj
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

	static getDerivedStateFromProps(props, state){
		return props
	}

	render(){
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
					<Paper style={{height:"35vh", display: "flex", flexDirection: "column", justifyContent: "center"}}>
						<Grid item container spacing={2} xs={12}>
							<Grid item xs={12}>
								<Typography style={{marginTop: "32px"}}>
									{this.props.modalText}
								</Typography>
							</Grid>
              <Grid item xs={6}>
								 <TextField select
                  name='field_crop_idx'
                  onChange={this.props.onChange.bind(this)}
                  value={this.state.createFieldCropHarvestObj.field_crop_idx}
                  label="Field"
                  style={{ width: "100%" }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {this.props.field_crops.length > 0?
                  this.props.field_crops.map((field_crop, i) => {
                    return (
                      <option key={`fieldcropharvest${i}`} value={i}>{field_crop.plant_date} / {field_crop.fieldtitle} / {field_crop.croptitle}</option>
                    )
                  })
                  :
                  <option key={`fieldcropharvest`}>No crops planted</option>
                }
                </TextField>
							</Grid>
              <Grid item xs={6}>
              <DatePicker 
                    value={this.state.createFieldCropHarvestObj.harvest_date}
                    label="Date"
                    onChange={this.props.onChange.bind(this)} 
                    style={{width: "100%", justifyContent: "flex-end"}}
                  />
							</Grid>
              <Grid item xs={6}>
								<TextField 
                  name='actual_yield'
                  value={this.state.createFieldCropHarvestObj.actual_yield}
                  onChange={this.props.onChange.bind(this)}
                  label="Yield (tons)"
                  style={{ width: "100%" }}
                /> 
							</Grid>

              <Grid item xs={3}>
								<TextField 
                  name='density'
                  value={this.state.createFieldCropHarvestObj.density}
                  onChange={this.props.onChange.bind(this)}
                  label="Density (lbs/ cu ft)"
                  style={{ width: "100%" }}
                /> 
							</Grid>
              <Grid item xs={3}>
								<TextField 
                  name='moisture'
                  value={this.state.createFieldCropHarvestObj.moisture}
                  onChange={this.props.onChange.bind(this)}
                  label="Mositure (%)"
                  style={{ width: "100%" }}
                /> 
							</Grid>
              <Grid item xs={2}>
								 <TextField select
                  name='basis_idx'
                  onChange={this.props.onChange.bind(this)}
                  value={this.state.createFieldCropHarvestObj.basis_idx}
                  label="Basis"
                  style={{ width: "100%" }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {this.props.basis.map((basis, i) => {
                    return (
                      <option key={`fieldcropharvestbasis${i}`} value={i}>{basis}</option>
                    )
                  })
                  
                }
                </TextField>
							</Grid>
              <Grid item xs={2}>
								<TextField 
                  name='n'
                  value={this.state.createFieldCropHarvestObj.n}
                  onChange={this.props.onChange.bind(this)}
                  label="n (mg/kg)% from lab"
                  style={{ width: "100%" }}
                /> 
							</Grid>
              <Grid item xs={2}>
								<TextField 
                  name='p'
                  value={this.state.createFieldCropHarvestObj.p}
                  onChange={this.props.onChange.bind(this)}
                  label="p (mg/kg) production records tabs in G sheet"
                  style={{ width: "100%" }}
                /> 
							</Grid>
              <Grid item xs={2}>
								<TextField 
                  name='k'
                  value={this.state.createFieldCropHarvestObj.k}
                  onChange={this.props.onChange.bind(this)}
                  label="k (mg/kg)"
                  style={{ width: "100%" }}
                /> 
							</Grid>
              <Grid item xs={2}>
								<TextField 
                  name='tfs'
                  value={this.state.createFieldCropHarvestObj.tfs}
                  onChange={this.props.onChange.bind(this)}
                  label="tfs (%)"
                  style={{ width: "100%" }}
                /> 
							</Grid>
              



							<Grid item xs={6}>
								<Button
									variant="outlined"
									onClick={()=>{ this.props.onClose()}}>
									{this.props.cancelText}
								</Button>
							</Grid>
							<Grid item xs={6}>
								<Button
									color="primary"
									variant="outlined"
									onClick={()=>{ this.props.onAction()}}>
									{this.props.actionText}
								</Button>
							</Grid>
						</Grid>
					</Paper>
					</Grid>
				</div>
			</Modal>

		)
	}

}

export default AddFieldCropHarvestModal = withTheme(AddFieldCropHarvestModal);