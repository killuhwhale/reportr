import React, { Component } from 'react'
import {
  Grid, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers'
import AssessmentIcon from '@material-ui/icons/Assessment';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import { CloudUpload } from '@material-ui/icons'

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import { get, post, postXLSX } from '../../utils/requests'
import ParcelAndFieldView from "../Parcel/parcelAndFieldView"
import OperatorView from "../Operators/operatorView"

import { generatePDF } from './pdfCharts';
import ActionCancelModal from "../Modals/actionCancelModal"
import UploadTSVModal from "../Modals/uploadTSVModal"

import { zeroTimeDate } from "../../utils/convertCalc"
import { ImportExport } from '@material-ui/icons'

import { getReportingPeriodDays } from "../../utils/herdCalculation"
import XLSX from 'xlsx'
import { BASE_URL } from '../../utils/environment';
import { Field } from '../../utils/fields/fields'
import { Dairy } from '../../utils/dairy/dairy';

const ReportingPeriod = (props) => {
  // onUpdate
  // onChange
  //   period_start
  // period_end

  return (
    <Grid container item xs={12} style={{ marginBottom: '32px', marginTop: '32px' }}>

      <Grid item xs={5}>
        <DatePicker
          value={new Date(props.period_start)}
          label="Start"
          onChange={(_date) => props.onChange({ target: { name: 'period_start', value: zeroTimeDate(_date) } })}
          style={{ width: "100%", justifyContent: "flex-end" }}
        />
      </Grid>
      <Grid item xs={5}>
        <DatePicker
          value={new Date(props.period_end)}
          label="End"
          onChange={(_date) => {
            props.onChange({ target: { name: 'period_end', value: zeroTimeDate(_date) } })
          }}
          style={{ width: "100%", justifyContent: "flex-end" }}
        />
      </Grid>
      <Grid item xs={2} align="right">
        <Tooltip title='Update Reporting Period'>
          <IconButton variant="outlined" color="secondary"
            onClick={props.onUpdate} style={{ marginTop: "16px" }}>
            <ImportExport />
          </IconButton>
        </Tooltip>
      </Grid>

      <Grid item xs={12}>
        <Typography variant='subtitle2'>Reporting Period ({props.daysInPeriod} days)</Typography>
      </Grid>

    </Grid>
  )
}


class DairyTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy: props.dairy,
      showAddParcelModal: false,
      showAddFieldModal: false,
      toggleShowDeleteAllModal: false,
      daysInPeriod: 0,
      fields: [],
      parcels: [],
      uploadedFileData: null,
      uploadedFilename: '',
      showUploadXLSX: false,
      rawFileForServer: null
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }
  componentDidMount() {
    this.getAllFields()
    this.getAllParcels()
    this.getDaysInPeriod()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.dairy.pk !== this.state.dairy.pk) {
      this.getAllFields()
      this.getAllParcels()
      this.getDaysInPeriod()
    }
  }


  getDaysInPeriod() {
    getReportingPeriodDays(this.state.dairy.pk)
      .then(days => this.setState({ daysInPeriod: days }))
      .catch(err => console.log(err))
  }


  getAllParcels() {
    get(`${this.props.BASE_URL}/api/parcels/${this.state.dairy.pk}`)
      .then(res => {
        console.log(res)
        if (res && res.length > 0) this.setState({ parcels: res })
      })
      .catch(err => { console.log(err) })
  }
  getAllFields() {
    Field.getField(this.state.dairy.pk)
      .then(res => {
        // console.log(res)
        this.setState({ fields: res })
      })
      .catch(err => { console.log(err) })
  }

  generatePDF() {
    let area = document.getElementById('chartArea')
    generatePDF(area, this.state.dairy.pk)
      .then(res => {
        console.log(res)
        this.props.onAlert('Generating PDF!', 'success')
      })
      .catch(err => {
        console.log(err)
        this.props.onAlert('Information not found.', 'error')
      })
  }

  confirmDeleteAllFromTable(val) {
    this.setState({ toggleShowDeleteAllModal: val })
  }
  deleteAllFromTable() {

    // post(`${this.props.BASE_URL}/api/dairies/delete`, { dairy_id: this.state.dairy.pk })
    Dairy.deleteDairy(this.state.dairy.pk)
      .then(res => {
        this.getAllFields()
        this.getAllParcels()
        this.confirmDeleteAllFromTable(false)
        this.props.onDairyDeleted()

      })
      .catch(err => {
        console.log(err)
      })
  }

  onUploadXLSXModalChange(ev) {
    const { files } = ev.target
    if (files.length > 0) {
      const file = files[0];

      file.arrayBuffer().then(data => {
        const workbook = XLSX.read(data);
        console.log(data)
        this.setState({ uploadedFileData: workbook, uploadedFilename: file.name, rawFileForServer: data })
      })
    }
  }

  onUploadXLSX() {

    const file = this.state.rawFileForServer
    postXLSX(`${BASE_URL}/tsv/uploadXLSX/${this.state.dairy.pk}`, file)
      .then(res => {
        console.log(res)
        if (res.error) {
          const { error, tsvType, uploadedFilename } = res
          console.log(error)
          const errMsg = `${tsvType} ${error.error}`
          this.toggleShowUploadXLSX(false)
          this.props.onAlert(errMsg, 'error')
          return
        }
        console.log("Completed! C-engineer voice")
        this.toggleShowUploadXLSX(false)
        this.props.refreshAfterXLSXUpload()
        this.getAllFields()
        this.props.onAlert('Success!', 'success')
      })
      .catch(err => {
        console.log(err)
      })

    // Client side upload
    // const workbook = this.state.uploadedFileData
    // uploadXLSX(workbook, this.state.dairy.pk)
    //   .then(res => {
    //     console.log("Completed! C-engineer voice")
    //     this.toggleShowUploadXLSX(false)
    //     this.props.refreshAfterXLSXUpload()
    //     this.getAllFields()
    //     this.props.onAlert('Success!', 'success')
    //   })
    //   .catch(err => {
    //     console.log('Failure! SSBM Voice', err)
    //     this.props.onAlert('Failed to Upload Workbook', 'error')
    //   })

  }

  toggleShowUploadXLSX(val) {
    this.setState({ showUploadXLSX: val })
  }

  render() {
    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
          <Grid item container xs={12} alignItems='center'>

            <Grid item container xs={12}>
              <Grid item container xs={7} alignItems='center'>
                <Grid item xs={12}>
                  <Typography color='primary' variant="h3">
                    {this.state.dairy.title}
                  </Typography>
                </Grid>
                <Grid item xs={12} align='right'>
                  <Typography color='secondary' variant="h5" style={{ marginRight: '25px' }}>
                    {this.state.dairy.reporting_yr}
                  </Typography>
                </Grid>

              </Grid>
              <Grid item container xs={5}>
                <Grid item container xs={12}>
                  <Grid item xs={4} align='left'>
                    <Tooltip title='Upload XLSX Workbook'>
                      <IconButton color="primary" variant="outlined"
                        onClick={() => this.toggleShowUploadXLSX(true)}
                      >
                        <CloudUpload />
                      </IconButton>
                    </Tooltip>
                    <UploadTSVModal
                      open={this.state.showUploadXLSX}
                      actionText="Add"
                      cancelText="Cancel"
                      modalText={`Upload XLSX`}
                      uploadedFilename={this.state.uploadedFilename}
                      onAction={this.onUploadXLSX.bind(this)}
                      onChange={this.onUploadXLSXModalChange.bind(this)}
                      onClose={() => this.toggleShowUploadXLSX(false)}
                    />
                  </Grid>

                  <Grid item xs={4} align='center'>
                    <Tooltip title="Generate Annual Report">
                      <IconButton onClick={this.generatePDF.bind(this)} >
                        <AssessmentIcon color='primary' />
                      </IconButton>
                    </Tooltip>
                  </Grid>

                  <Grid item xs={4} align='right'>
                    <Tooltip title='Delete Dairy'>
                      <IconButton onClick={() => this.confirmDeleteAllFromTable(true)}>
                        <DeleteSweepIcon color='error' />
                      </IconButton>
                    </Tooltip>
                  </Grid>

                </Grid>

                <Grid item xs={12}>
                  <ReportingPeriod
                    onUpdate={this.props.onUpdate}
                    onChange={this.props.onChange}
                    daysInPeriod={this.state.daysInPeriod}
                    period_start={this.state.dairy.period_start}
                    period_end={this.state.dairy.period_end}
                  />
                </Grid>
              </Grid>
            </Grid>


            <Grid item xs={12} style={{ marginTop: "64px", marginBottom: '32px' }}>

              <Grid item container xs={12}>
                <Grid container item xs={12}>
                  <Grid item xs={3}>
                    <Typography variant="h4">
                      Address
                    </Typography>
                  </Grid>
                  <Grid item xs={9} align="right">
                    <Tooltip title='Update Address'>
                      <IconButton variant="outlined" color="secondary"
                        onClick={this.props.onUpdate} style={{ marginTop: "16px" }}
                      >
                        <ImportExport />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name='title'
                    value={this.state.dairy.title}
                    onChange={this.props.onChange}
                    label="Dairy Name"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item container xs={4} style={{ position: "relative" }}>
                  <div style={{ position: 'absolute', top: 0, left: 0 }}>
                    <Typography variant="caption">First Started Operation</Typography>
                  </div>
                  <DatePicker
                    value={new Date(this.state.dairy.began)}
                    onChange={(_date) => this.props.onChange({ target: { name: 'began', value: zeroTimeDate(_date) } })}
                    style={{ width: "100%", justifyContent: "flex-end" }}
                  />
                </Grid>
                <Grid item xs={4}>

                </Grid>
              </Grid>
              <Grid item container xs={12} style={{ marginTop: "16px" }}>
                <Grid item xs={4}>
                  <TextField
                    name='street'
                    value={this.state.dairy.street}
                    onChange={this.props.onChange}
                    label="Street"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name='cross_street'
                    value={this.state.dairy.cross_street}
                    onChange={this.props.onChange}
                    label="Cross Street"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField select
                    label="County"
                    value={
                      Math.max(0, this.props.COUNTIES.indexOf(this.state.dairy.county))
                    }
                    onChange={(ev) => {
                      this.props.onChange({ target: { name: 'county', value: this.props.COUNTIES[ev.target.value] } })
                    }}
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.COUNTIES.map((el, i) => {
                      return (
                        <option name="county" key={`county${i}`} value={i}>{el}</option>
                      )
                    })}
                  </TextField>
                </Grid>

              </Grid>
              <Grid item container xs={12} style={{ marginTop: "16px" }}>
                <Grid item xs={3}>
                  <TextField
                    name='city'
                    value={this.state.dairy.city}
                    onChange={this.props.onChange}
                    label="City"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='city_state'
                    value={this.state.dairy.city_state}
                    onChange={this.props.onChange}
                    label="State"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name='city_zip'
                    value={this.state.dairy.city_zip}
                    onChange={this.props.onChange}
                    label="Zip"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField select
                    label="Basin Plan"
                    value={
                      Math.max(0, this.props.BASINS.indexOf(this.state.dairy.basin_plan))
                    }
                    onChange={(ev) => {
                      this.props.onChange({ target: { name: 'basin_plan', value: this.props.BASINS[ev.target.value] } })
                    }}
                    style={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.props.BASINS.map((el, i) => {
                      return (
                        <option key={`basin${i}`} value={i}>{el}</option>
                      )
                    })}
                  </TextField>
                </Grid>
              </Grid>

            </Grid>

            <Grid item xs={12} style={{ marginTop: '64px' }}>
              <OperatorView
                dairy={this.state.dairy}
                onAlert={this.props.onAlert}
                BASE_URL={this.props.BASE_URL}
              />
            </Grid>



            <Grid item container align="center" xs={12} style={{ marginTop: "24px" }} spacing={2}>
              <ParcelAndFieldView
                reportingYr={this.state.dairy.reporting_yr}
                dairy={this.state.dairy}
                fields={this.state.fields}
                parcels={this.state.parcels}
                getAllParcels={this.getAllParcels.bind(this)}
                getAllFields={this.getAllFields.bind(this)}
                onFieldDelete={this.getAllFields.bind(this)}
                onParcelDelete={this.getAllParcels.bind(this)}
                onAlert={this.props.onAlert}
                BASE_URL={this.props.BASE_URL}
              />
            </Grid>

            <div id="chartArea" style={{ maxHeight: '1px', overflow: 'hidden' }}></div>

            <ActionCancelModal
              open={this.state.toggleShowDeleteAllModal}
              actionText="Delete Dairy"
              cancelText="Cancel"
              modalText={`Delete ${this.state.dairy.title} for year ${this.state.dairy.reporting_yr}?`}
              onAction={this.deleteAllFromTable.bind(this)}
              onClose={() => this.confirmDeleteAllFromTable(false)}
            />
          </Grid>
          :
          <React.Fragment>
            <Grid item xs={12}>
              <Typography>No dairy selected!</Typography>
            </Grid>
          </React.Fragment>
        }

      </React.Fragment>
    )
  }
}

export default DairyTab = withRouter(withTheme(DairyTab))
