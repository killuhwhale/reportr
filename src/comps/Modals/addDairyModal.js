import React, { Component } from 'react';
import { Grid, Paper, Button, Typography, Modal, TextField, CircularProgress } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';
import { YEARS } from '../../utils/constants';
import { auth } from '../../utils/users';
import { Dairy } from '../../utils/dairy/dairy';

class AddDairyModal extends Component {
	constructor(props) {
		super(props)
		this.state = {
			open: props.open,
			reportingYearIdx: 0,
			isLoading: false
		}
	}

	static getDerivedStateFromProps(props, state) {
		return props
	}

	onChange(ev) {
		const { name, value } = ev.target
		this.setState({ [name]: value })
	}

	toggleIsLoading(val) {
		this.setState({ isLoading: val })
	}

	createDairy() {
		const company_id = auth.currentUser.company_id
		const reportingYear = YEARS[this.state.reportingYearIdx]
		const dairyBase = this.state.dairyBase
		const dairyBaseID = dairyBase.pk ? dairyBase.pk : -1
		this.toggleIsLoading(true)

		if (!company_id) {
			console.log(`Cannot get company ID: ${auth.currentUser}`, auth.currentUser)
			return this.props.onAlert('Cannot find comapny ID', 'error')
		}

		Dairy.createDairy(dairyBaseID, dairyBase.title, reportingYear, company_id)
			.then(res => {
				console.log(res)
				this.toggleIsLoading(false)
				this.props.onClose()

				if (res.error) {
					this.props.onAlert(res.error, 'error')
				} else {
					this.props.onAlert('Created new Dairy!', 'success')
					this.props.onDairyCreated(res.pk)
				}


			})
			.catch(err => {
				console.log(err)
				this.toggleIsLoading(false)
				this.props.onClose()
				this.props.onAlert('Failed creating new Dairy for reporting year!', 'error')
			})


	}

	listenEnter(ev) {
		if ((ev.keyCode || ev.which) === 13) {
			this.createDairy()
		}
	}

	render() {
		return (
			<Modal
				open={this.props.open}
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
						<Paper style={{ height: "200px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
							<Grid item container xs={12}>
								<Grid item xs={12}>
									<Typography style={{ marginTop: "32px" }}>
										{this.props.modalText}
									</Typography>
								</Grid>
								<Grid item xs={12}>
									<TextField select
										name='reportingYearIdx'
										value={this.state.reportingYearIdx}
										onChange={this.onChange.bind(this)}
										onKeyUp={this.listenEnter.bind(this)}
										label="Reporting year"
										style={{ width: "75%" }}
										SelectProps={{
											native: true,
										}}
									>
										{
											YEARS.map((yr, i) => <option key={`yrsKey${i}`} value={i}>{yr}</option>)
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
									{this.state.isLoading ?
										<CircularProgress color='primary' />
										:
										<Button
											disabled={this.state.isLoading}
											color="primary"
											variant="outlined"
											onClick={this.createDairy.bind(this)}>
											{this.props.actionText}
										</Button>
									}
								</Grid>
							</Grid>
						</Paper>
					</Grid>
				</div>
			</Modal>

		)
	}

}

export default AddDairyModal = withTheme(AddDairyModal);