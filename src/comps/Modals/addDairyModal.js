import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';
import { get, post } from '../../utils/requests';
import { zeroTimeDate } from "../../utils/convertCalc"


const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026]

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


const _createFieldParcel = (fieldParcel, dairy_id) => {
	// Looks up field and parcel from previous field_parcel and creates a new one.
	return new Promise((resolve, reject) => {
		Promise.all([
			get(`${this.props.BASE_URL}/api/search/fields/${fieldParcel.title}/${dairy_id}`),
			get(`${this.props.BASE_URL}/api/search/parcels/${fieldParcel.pnumber}/${dairy_id}`)
		])
			.then(([[field], [parcel]]) => {
				let fieldParcelData = {
					dairy_id,
					field_id: field.pk,
					parcel_id: parcel.pk
				}
				post(`${this.props.BASE_URL}/api/field_parcel/create`, fieldParcelData)
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

const createFieldParcel = (field_parcel, dairy_id) => {
	// Creates promises to create all previous field_parcels for new dairy year
	const fpPromises = field_parcel.map(fp => {
		return _createFieldParcel(fp, dairy_id)
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
			reportingYearIdx: 0
		}
	}

	static getDerivedStateFromProps(props, state) {
		return props
	}

	onChange(ev) {
		const { name, value } = ev.target
		this.setState({ [name]: value })
	}

	createDairy() {
		const reportingYear = YEARS[this.state.reportingYearIdx]
		const dairyBase = this.state.dairyBase
		const dairyBaseId = dairyBase.pk ? dairyBase.pk : -1

		if (dairyBaseId > 0) {
			// console.log("Creating a dairy for reporting year", reportingYear, dairyBaseId)
			// console.log("Query for last reporting year.....")

			get(`${this.props.BASE_URL}/api/dairies/dairyBaseId/${dairyBaseId}`)
				.then(dairies => {
					if (isDuplicateYear(dairies, reportingYear)) {
						this.props.onDone()
						this.props.onClose()
						this.props.onAlert(`Error: Dairy already created for year: ${reportingYear}`, 'error')
						
					}
					else if (dairies && typeof dairies === typeof [] && dairies.length > 0) {
						// This dairy will be the dairy_id that will be used to query and duplicate each table.
						const latestDairy = latestEntry(dairies)
						// console.log("Latest Dairy:", latestDairy)
						const newDairy = {
							dairy_base_id: dairyBaseId,
							...latestDairy,
							reporting_yr: reportingYear,
							period_start: `1/1/${reportingYear}`,
							period_end: `12/31/${reportingYear}`,
							began: zeroTimeDate(new Date(latestDairy.began))
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
										get(`${this.props.BASE_URL}/api/fields/${latestDairy.pk}`),
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
													return post(`${this.props.BASE_URL}/api/fields/create`, {
														data: {
															...field,
															dairy_id: dairy.pk
														}
													})
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
														createFieldParcel(field_parcel, dairy.pk)
															.then(fieldCropResult => {
																// Finish after creating field crops
																this.props.onDone()
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
														this.props.onClose()
														this.props.onAlert('Created new Dairy!', 'success')
													}
												})
												.catch(err => {
													console.log(err)
													this.props.onAlert(`Faied to duplicate previous dairy's info!`, 'error')
												})
										})
										.catch(err => {
											console.log(err)
											this.props.onAlert(`Faied to duplicate previous dairy's info while looking up info!`, 'error')
										})
								}
							})
							.catch(err => {
								console.log("Failed to create new dairy", err)
								this.props.onAlert('Faied to create new reporting year!', 'error')
							})
					} else {
						post(`${this.props.BASE_URL}/api/dairies/create`, {
							dairyBaseId,
							title: dairyBase.title,
							reportingYear,
							period_start: `1/1/${reportingYear}`,
							period_end: `12/31/${reportingYear}`
						})
							.then(res => {
								this.props.onDone()
								this.props.onClose()
								this.props.onAlert('Created new Dairy!', 'success')
							})
							.catch(err => {
								console.log(err)
								this.props.onDone()
								this.props.onClose()
								this.props.onAlert('Failed creating new Dairy for reporting year!', 'error')
							})
					}
				})


			// Need to query for latest dairy in dairies by dairyBaseId
			// if previous data:
			// Create new dairy in dairies table (reporting year and title plus duplicate infor if any from query)	
			// Duplciate the data in each table using the new dairy ID
			// dairies fields parcels field_parcel operators herds
			// Else no prev data:
			// Create new dairy with basic info: title and reporting year


		}
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
									<Button
										color="primary"
										variant="outlined"
										onClick={this.createDairy.bind(this)}>
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

export default AddDairyModal = withTheme(AddDairyModal);