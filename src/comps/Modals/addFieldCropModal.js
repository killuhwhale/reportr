import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import {
	DatePicker
} from '@material-ui/pickers';
import { zeroTimeDate } from "../../utils/convertCalc"
import { withTheme } from '@material-ui/core/styles';

class AddFieldCropModal extends Component {

	constructor(props) {
		super(props)
		this.state = {
			open: props.open,
			createFieldCropObj: props.createFieldCropObj
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
						<Paper style={{ height: "35vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
							<Grid item container xs={12}>
								<Grid item xs={12}>
									<Typography variant="h6" style={{ marginTop: "32px" }}>
										{this.props.modalText}
									</Typography>
								</Grid>


								<Grid item xs={6}>
									<TextField select
										name='createFieldIdx'
										onChange={this.props.onChange.bind(this)}
										value={this.state.createFieldCropObj.createFieldIdx}
										label="Field"
										style={{ width: "100%" }}
										SelectProps={{
											native: true,
										}}
									>
										{this.props.fields.length > 0 ?
											this.props.fields.map((field, i) => {
												return (
													<option key={`fieldcropfield${i}`} value={i}>{field.title}</option>
												)
											})
											:
											<option key={`fieldcropfield`}>No fields</option>
										}
									</TextField>
								</Grid>
								<Grid item xs={6}>
									<TextField select
										name='createCropIdx'
										onChange={this.props.onChange.bind(this)}
										value={this.state.createFieldCropObj.createCropIdx}
										label="Crop"
										style={{ width: "100%" }}
										SelectProps={{
											native: true,
										}}
									>
										{this.props.crops.length > 0 ?
											this.props.crops.map((crop, i) => {
												return (
													<option key={`fieldcropcrop${i}`} value={i}>{crop.title}</option>
												)
											})
											:
											<option key={`fieldcropcrop`}>No crops</option>
										}
									</TextField>
								</Grid>

								<Grid item xs={6}>
									<DatePicker
										value={new Date(this.state.createFieldCropObj.plant_date)}
										label="Date"
										onChange={(_date) => this.props.onChange({ target: { name: 'plant_date', value: zeroTimeDate(_date) } })}
										style={{ width: "100%", justifyContent: "flex-end" }}
									/>
								</Grid>

								<Grid item xs={6}>
									<TextField
										name='acres_planted'
										value={this.state.createFieldCropObj.acres_planted}
										onChange={this.props.onChange.bind(this)}
										label="Acres Planted"
										style={{ width: "100%" }}
									/>

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

export default AddFieldCropModal = withTheme(AddFieldCropModal);