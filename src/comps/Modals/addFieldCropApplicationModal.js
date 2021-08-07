import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import {
	DatePicker
} from '@material-ui/pickers';
import { withTheme } from '@material-ui/core/styles';

class AddFieldCropApplicationModal extends Component {

	constructor(props) {
		super(props)
		this.state = {
			open: props.open,
			createFieldCropHarvestObj: props.createFieldCropHarvestObj,
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
						<Paper style={{ height: "50vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
							<Grid item container spacing={2} xs={12}>
								<Grid item xs={12}>
									<Typography style={{ marginTop: "32px" }}>
										{this.props.modalText}
									</Typography>
								</Grid>

								<Grid item xs={6}>
									<TextField select
										name='field_idx'
										onChange={this.props.onChange.bind(this)}
										value={this.state.createFieldCropAppObj.field_idx}
										label="Field"
										style={{ width: "100%" }}
										SelectProps={{
											native: true,
										}}
									>
										{this.props.fields.length > 0 ?
											this.props.fields.map((field, i) => {
												return (
													<option key={`fieldcropapplicationfield${i}`} value={i}>{field.title}</option>
												)
											})
											:
											<option key={`fieldcropapplicationfield`}>No fields.</option>

										}
									</TextField>
								</Grid>

								<Grid item xs={6}>
									<TextField select
										name='field_crop_idx'
										onChange={this.props.onChange.bind(this)}
										value={this.state.createFieldCropAppObj.field_crop_idx}
										label="Planted"
										style={{ width: "100%" }}
										SelectProps={{
											native: true,
										}}
									>
										{this.props.field_crops.length > 0 ?
											this.props.field_crops.map((field_crop, i) => {
												return (
													<option key={`fieldcropapplicationfielcrop${i}`} value={i}>{field_crop.plant_date} / {field_crop.fieldtitle} / {field_crop.croptitle}</option>
												)
											})
											:
											<option key={`fieldcropapplicationfielcrop`}>No crops planted</option>

										}
									</TextField>
								</Grid>



								<Grid item xs={6}>
									<DatePicker
										value={this.state.createFieldCropAppObj.app_date}
										label="Date"
										onChange={(d) => this.props.onChange({ target: { name: "app_date", value: d } })}
										style={{ width: "100%", justifyContent: "flex-end" }}
									/>
								</Grid>

								<Grid item xs={6}>
									<TextField select
										name='app_method_idx'
										onChange={this.props.onChange.bind(this)}
										value={this.state.createFieldCropAppObj.app_method_idx}
										label="Application method"
										style={{ width: "100%" }}
										SelectProps={{
											native: true,
										}}
									>
										{this.props.APP_METHODS.length > 0 ?
											this.props.APP_METHODS.map((method, i) => {
												return (
													<option key={`fieldcropappmethod${i}`} value={i}>{method}</option>
												)
											})
											:
											<option key={`fieldcropappmethod`}>No crops planted</option>

										}

									</TextField>
								</Grid>



								<Grid item xs={4}>
									<TextField select
										name='precip_before_idx'
										onChange={this.props.onChange.bind(this)}
										value={this.state.createFieldCropAppObj.precip_before_idx}
										label="24 hours before"
										style={{ width: "100%" }}
										SelectProps={{
											native: true,
										}}
									>
										{this.props.PRECIPITATIONS.length > 0 ?
											this.props.PRECIPITATIONS.map((precip, i) => {
												return (
													<option key={`fieldcropAppPrecipb4${i}`} value={i}>{precip}</option>
												)
											})
											:
											<option key={`fieldcropAppPrecipb4`}>No precipitations available.</option>
										}
									</TextField>
								</Grid>

								<Grid item xs={4}>
									<TextField select
										name='precip_during_idx'
										onChange={this.props.onChange.bind(this)}
										value={this.state.createFieldCropAppObj.precip_during_idx}
										label="24 during"
										style={{ width: "100%" }}
										SelectProps={{
											native: true,
										}}
									>
										{this.props.PRECIPITATIONS.length > 0 ?
											this.props.PRECIPITATIONS.map((precip, i) => {
												return (
													<option key={`fieldcropAppPrecipDuringknot${i}`} value={i}>{precip}</option>
												)
											})
											:
											<option key={`fieldcropAppPrecipDuringknot`}>No precipitations available.</option>
										}
									</TextField>
								</Grid>

								<Grid item xs={4}>
									<TextField select
										name='precip_after_idx'
										onChange={this.props.onChange.bind(this)}
										value={this.state.createFieldCropAppObj.precip_after_idx}
										label="24 hours after"
										style={{ width: "100%" }}
										SelectProps={{
											native: true,
										}}
									>
										{this.props.PRECIPITATIONS.length > 0 ?
											this.props.PRECIPITATIONS.map((precip, i) => {
												return (
													<option key={`fieldcropAppPrecipAfter${i}`} value={i}>{precip}</option>
												)
											})
											:
											<option key={`fieldcropAppPrecipAfterknot`}>No precipitations available.</option>
										}
									</TextField>
								</Grid>





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
						</Paper>
					</Grid>
				</div>
			</Modal>

		)
	}

}

export default AddFieldCropApplicationModal = withTheme(AddFieldCropApplicationModal);