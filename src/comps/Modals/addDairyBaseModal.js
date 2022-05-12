import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';

import { auth } from '../../utils/users';
import { Dairy } from '../../utils/dairy/dairy'




class AddBaseDairyModal extends Component {
	constructor(props) {
		super(props)
		this.state = {
			open: props.open,
			createDairyTitle: ''
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


	createBaseDairy() {
		const title = this.state.createDairyTitle
		const company_id = auth.currentUser.company_id

		if (title && title.length > 0) {
			Dairy.createDairyBase(title, company_id)
				.then(res => {
					console.log(res)
					if (res.error) {
						if (res.code === '23505') {
							this.props.onAlert(`${title} already exists!`, 'error')
						} else {
							this.props.onAlert("Failed to create new dairy.", 'error')
						}
						this.props.onClose()
						return
					}
					this.props.onAlert("Created New Dairy!", 'success')
					this.props.onDone()
					this.props.onClose()
				})
				.catch(err => {
					this.props.onAlert("Failed Creating New Dairy!", 'error')
					console.log(err)
				})
		}
	}

	listenEnter(ev) {
		if ((ev.keyCode || ev.which) === 13) {
			this.createBaseDairy()
		}
	}

	onChange(ev) {
		const { name, value } = ev.target
		this.setState({ [name]: value })
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
						<Paper style={{ height: "250px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
							<Grid item container xs={12}>
								<Grid item xs={12}>
									<Typography variant="h6" style={{ marginTop: "32px" }}>
										{this.props.modalText}
									</Typography>
								</Grid>
								<Grid item xs={12}>
									<TextField
										name='createDairyTitle'
										value={this.state.createDairyTitle}
										onChange={this.onChange.bind(this)}
										onKeyUp={this.listenEnter.bind(this)}
										label="Name of Dairy"
										style={{ width: "80%" }}
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

										onClick={this.createBaseDairy.bind(this)}>
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

export default AddBaseDairyModal = withTheme(AddBaseDairyModal);