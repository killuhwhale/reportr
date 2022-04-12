import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField, CircularProgress } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';
import { get, post } from '../../utils/requests';
import { zeroTimeDate } from "../../utils/convertCalc"
import { YEARS } from '../../utils/constants'
import { auth } from '../../utils/users';
import { Field } from '../../utils/fields/fields'

const latestEntry = (entries) => {
	// Returns the object in the list with the highest pk 
	let _max = 0
	let latest = {}
	entries.forEach(entry => {
		if (entry.pk > _max) {
			_max = entry.pk
			latest = entry
		}
	})
	return latest
}

const isDuplicateYear = (entries, reportingYr) => {
	// Returns the object in the list with the highest pk 
	let isDup = false
	entries.forEach(entry => {
		if (entry.reporting_yr === reportingYr) {
			isDup = true
		}
	})
	return isDup
}


const _createFieldParcel = (base_url, fieldParcel, dairy_id) => {
	// Looks up field and parcel from previous field_parcel and creates a new one.
	return new Promise((resolve, reject) => {
		Promise.all([
			get(`${base_url}/api/search/fields/${fieldParcel.title}/${dairy_id}`),
			get(`${base_url}/api/search/parcels/${fieldParcel.pnumber}/${dairy_id}`)
		])
			.then(([[field], [parcel]]) => {
				let fieldParcelData = {
					dairy_id,
					field_id: field.pk,
					parcel_id: parcel.pk
				}
				post(`${base_url}/api/field_parcel/create`, fieldParcelData)
					.then(res => {
						resolve(res)
					})
					.catch(err => {
						console.log(err)
						reject(err)
					})
			})
			.catch(err => {
				console.log(err)
				reject(err)
			})
	})
}

const createFieldParcel = (base_url, field_parcel, dairy_id) => {
	// Creates promises to create all previous field_parcels for new dairy year
	const fpPromises = field_parcel.map(fp => {
		return _createFieldParcel(base_url, fp, dairy_id)
	})

	return new Promise((resolve, reject) => {
		Promise.all(fpPromises)
			.then(res => {
				console.log("Created field_parcels:", res)
				resolve(res)
			})
			.catch(err => {
				console.log(err)
				reject(err)
			})
	})
}


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
			console.log(`Cannot get company ID: ${auth.currentUser}`)
			console.log(auth.currentUser)
			return this.props.onAlert('Cannot find comapny ID', 'error')
		}

		if (dairyBaseID > 0) {
			// console.log("Creating a dairy for reporting year", reportingYear, dairyBaseID)
			// console.log("Query for last reporting year.....")

			get(`${this.props.BASE_URL}/api/dairies/dairyBaseID/${dairyBaseID}`)
				.then(dairies => {
					console.log("Checking for duplicates in: ", dairies)
					if (isDuplicateYear(dairies, reportingYear)) {
						this.props.onDone()
						this.props.onClose()
						this.toggleIsLoading(false)
						this.props.onAlert(`Dairy already created for reporting year: ${reportingYear}`, 'error')
					}
					else if (dairies && typeof dairies === typeof [] && dairies.length > 0) {
						// This dairy will be the dairy_id that will be used to query and duplicate each table.
						const latestDairy = latestEntry(dairies)
						// console.log("Latest Dairy:", latestDairy)
						const newDairy = {
							dairyBaseID,
							...latestDairy,
							reporting_yr: reportingYear,
							period_start: `1/1/${reportingYear}`, // Default date based on year chosed to create.
							period_end: `12/31/${reportingYear}`,
							began: zeroTimeDate(new Date(latestDairy.began)),
							company_id
						}
						// console.log("New dairy data:", newDairy)
						// Create dairy with all prev information
						post(`${this.props.BASE_URL}/api/dairies/full/create`, newDairy)
							.then(([dairy]) => {
								console.log("Newly created Dairy", dairy)
								// Newly created dairy, use this dairy.pk to create new fields
								// Fetch other prev data using latestDairy
								if (dairy && typeof dairy === typeof {} && Object.keys(dairy).length > 0) {
									Promise.all([
										Field.getField(latestDairy.pk),
										get(`${this.props.BASE_URL}/api/parcels/${latestDairy.pk}`),
										get(`${this.props.BASE_URL}/api/field_parcel/${latestDairy.pk}`),
										get(`${this.props.BASE_URL}/api/operators/${latestDairy.pk}`),
										get(`${this.props.BASE_URL}/api/herds/${latestDairy.pk}`),
									])
										.then(([fields, parcels, field_parcel, operators, herds]) => {
											let promises = []
											if (fields.length > 0) {
												console.log("Creating fields")
												promises = fields.map(field => {
													return Field.createField(field, dairy.pk)
												})

											}
											if (parcels.length > 0) {
												console.log("Creating parcels")
												let createParcelPromises = parcels.map(parcel => {
													return post(`${this.props.BASE_URL}/api/parcels/create`, {
														...parcel,
														dairy_id: dairy.pk
													})
												})
												promises.push(...createParcelPromises)
											}
											if (operators.length > 0) {
												let operatorPromises = operators.map(op => {
													post(`${this.props.BASE_URL}/api/operators/create`, {
														...op,
														dairy_id: dairy.pk
													})
												})
												promises.push(...operatorPromises)
											}
											if (herds.length > 0) {
												let herdPromises = herds.map(herd => {
													post(`${this.props.BASE_URL}/api/herds/full/create`, {
														...herd,
														dairy_id: dairy.pk
													})
												})
												promises.push(...herdPromises)
												// Just gets new dairies shouldn't matter if fields aprcels are created yet
											}
											Promise.all(promises)
												.then(res => {
													if (fields.length > 0 && parcels.length > 0 && field_parcel.length > 0) {
														createFieldParcel(this.props.BASE_URL, field_parcel, dairy.pk)
															.then(fieldCropResult => {
																// Finish after creating field crops
																this.props.onDone()
																this.toggleIsLoading(false)
																this.props.onClose()
																this.props.onAlert('Created new Dairy!', 'success')
															})
															.catch(err => {
																console.log(err)
																this.props.onAlert(`Faied to duplicate previous dairy's field parcels!`, 'error')
															})
													} else {
														// Finish now
														this.props.onDone()
														this.toggleIsLoading(false)
														this.props.onClose()
														this.props.onAlert('Created new Dairy!', 'success')
													}
												})
												.catch(err => {
													console.log(err)
													this.toggleIsLoading(false)
													this.props.onAlert(`Faied to duplicate previous dairy's info!`, 'error')
												})
										})
										.catch(err => {
											console.log(err)
											this.toggleIsLoading(false)
											this.props.onAlert(`Faied to duplicate previous dairy's info while looking up info!`, 'error')
										})
								}
							})
							.catch(err => {
								console.log("Failed to create new dairy", err)
								this.toggleIsLoading(false)
								this.props.onAlert('Faied to create new reporting year!', 'error')
							})
					} else {

						post(`${this.props.BASE_URL}/api/dairies/create`, {
							dairyBaseID,
							title: dairyBase.title,
							reportingYear,
							period_start: `1/1/${reportingYear}`,
							period_end: `12/31/${reportingYear}`,
							company_id
						})
							.then(res => {
								this.props.onDone()
								this.toggleIsLoading(false)
								this.props.onClose()
								this.props.onAlert('Created new Dairy!', 'success')
							})
							.catch(err => {
								console.log(err)
								this.props.onDone()
								this.toggleIsLoading(false)
								this.props.onClose()
								this.props.onAlert('Failed creating new Dairy for reporting year!', 'error')
							})
					}
				})


			// Need to query for latest dairy in dairies by dairyBaseID
			// if previous data:
			// Create new dairy in dairies table (reporting year and title plus duplicate infor if any from query)	
			// Duplciate the data in each table using the new dairy ID
			// dairies fields parcels field_parcel operators herds
			// Else no prev data:
			// Create new dairy with basic info: title and reporting year


		}
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