import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers'
import AssessmentIcon from '@material-ui/icons/Assessment';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';

import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import Chart from 'chart.js/auto';
import { get, post } from '../../utils/requests'
import ParcelAndFieldView from "../Parcel/parcelAndFieldView"
import OperatorView from "../Operators/operatorView"
import AddParcelModal from "../Modals/addParcelModal"
import AddFieldModal from "../Modals/addFieldModal"
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"
import dd from "./pdf"
import { getAnnualReportData } from "./pdfDB"
import ActionCancelModal from "../Modals/actionCancelModal"


import { formatFloat } from "../../utils/format"
import { toFloat, zeroTimeDate } from "../../utils/convertCalc"
import { AddCircleOutline, ImportExport } from '@material-ui/icons'

pdfMake.vfs = pdfFonts.pdfMake.vfs


const HORIBAR_WIDTH = '600px'
const HORIBAR_HEIGHT = '300px'
const BAR_WIDTH = '500px'
const BAR_HEIGHT = '333px'
const CHART_BACKGROUND_COLOR = "#f7f7f7"
const RADIUS = 40
const PAD = 10



/**
 * street VARCHAR(100) NOT NULL,
  cross_street VARCHAR(50),
  county VARCHAR(30),
  city VARCHAR(30) NOT NULL,
  city_state VARCHAR(3),
  city_zip VARCHAR(20) NOT NULL,
  title VARCHAR(30) NOT NULL,
  basin_plan VARCHAR(30),
  began timestamp,
 */


const ReportingPeriod = (props) => {
  // onUpdate
  // onChange
  //   period_start
  // period_end

  return (
    <Grid container item xs={12} style={{ marginBottom: '32px', marginTop: '32px' }}>

      <Grid item xs={3}>
        <DatePicker
          value={new Date(props.period_start)}
          label="Start"
          onChange={(_date) => props.onChange({ target: { name: 'period_start', value: zeroTimeDate(_date) } })}
          style={{ width: "100%", justifyContent: "flex-end" }}
        />
      </Grid>
      <Grid item xs={3}>
        <DatePicker
          value={new Date(props.period_end)}
          label="End"
          onChange={(_date) => {
            props.onChange({ target: { name: 'period_end', value: zeroTimeDate(_date) } })
          }}
          style={{ width: "100%", justifyContent: "flex-end" }}
        />
      </Grid>
      <Grid item xs={3} align="right">
        <Tooltip title='Update Reporting Period'>
          <IconButton variant="outlined" color="secondary"
            onClick={props.onUpdate} style={{ marginTop: "16px" }}>
            <ImportExport />
          </IconButton>
        </Tooltip>
      </Grid>

      <Grid item xs={12}>
        <Typography variant='subtitle2'>Reporting Period</Typography>
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

      fields: [],
      parcels: [],
    }
    this.canvas = React.createRef()
    this.chart = null
    this.charts = {}
  }
  static getDerivedStateFromProps(props, state) {
    return props // if default props change return props | compare props.dairy == state.dairy
  }
  componentDidMount() {
    this.getAllFields()
    this.getAllParcels()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.dairy.pk !== this.state.dairy.pk) {
      this.getAllFields()
      this.getAllParcels()
    }
  }

  handleDateChange(date) {
    this.props.onChange("began", date)
  }
  onParcelChange(pk, pnumber) {
    console.log("onParcelChange")
    console.log(pk, pnumber)
  }
  createParcel(pnumber) {
    console.log("Creating Parcel for")
    console.log(this.state.dairy.title, this.state.dairy.pk, pnumber)

    post(`${this.props.BASE_URL}/api/parcels/create`, {
      pnumber, dairy_id: this.state.dairy.pk
    })
      .then(res => {
        console.log(res)
        this.toggleParcelModal(false)
        this.getAllParcels()
        this.props.onAlert('Created parcel!', 'success')
      })
      .catch(err => {
        console.log(err)
        this.toggleParcelModal(false)
        this.props.onAlert('Failed creating parcel!', 'error')
      })
  }
  toggleParcelModal(val) {
    this.setState({ showAddParcelModal: val })
  }
  createField(field) {
    console.log("Creating Field for")
    console.log(this.state.dairy.title, this.state.dairy.pk)
    console.log(field)
    post(`${this.props.BASE_URL}/api/fields/create`, { data: { ...field, dairy_id: this.state.dairy.pk } })
      .then(res => {
        console.log(res)
        this.toggleFieldModal(false)
        this.getAllFields()
        this.props.onAlert('Created field!', 'success')
      })
      .catch(err => {
        console.log(err)
        this.toggleFieldModal(false)
        this.props.onAlert('Failed to create field!', 'error')
      })
  }
  toggleFieldModal(val) {
    this.setState({ showAddFieldModal: val })
  }
  getAllParcels() {
    get(`${this.props.BASE_URL}/api/parcels/${this.state.dairy.pk}`)
      .then(res => {
        // console.log(res)
        this.setState({ parcels: res })
      })
      .catch(err => { console.log(err) })
  }
  getAllFields() {
    get(`${this.props.BASE_URL}/api/fields/${this.state.dairy.pk}`)
      .then(res => {
        // console.log(res)
        this.setState({ fields: res })
      })
      .catch(err => { console.log(err) })
  }



  // Annual Report Section 
  createCharts(props) {
    let nutrientLabels = ["N", "P", "K", "Salt"]

    let nutrientBudgetB = props[0]
    let summary = props[1]


    let nutrientData = Object.keys(nutrientBudgetB).map(key => {
      const ev = nutrientBudgetB[key]
      return { key: key, data: [ev.total_app, ev.anti_harvests, ev.actual_harvests] }
    })

    let totalNutrientAppAntiHarvestData = [summary.total_app, summary.anti_harvests, summary.actual_harvests]
    // console.log("Creating Overall Summary Chart:", totalNutrientAppAntiHarvestData, summary)



    let materialLabels = [
      'Existing soil nutrient content',
      'Plowdown credit',
      'Commercial fertilizer / Other',
      'Dry Manure',
      'Process wastewater',
      'Fresh water',
      'Atmospheric deposition',
    ]

    //              n,p,k,salt from each source plus the label
    let materialData = [0, 0, 0, 0].map((_, i) => {
      return [
        summary.soils[i], // Existing soil content
        summary.plows[i], // Plowdown credit
        summary.fertilizers[i],
        summary.manures[i],
        summary.wastewaters[i],
        summary.freshwaters[i],
        i === 0 ? summary.atmospheric_depo : 0, // Atmoshperic depo is only for nitrogen.
        i === 0 ? 'Nitrogen' : i === 1 ? 'Phosphorus' : i === 2 ? 'Potassium' : 'Salt'
      ]
    })


    return new Promise((resolve, rej) => {
      // for fields and a single summery in report
      let nutrientPromises = nutrientData.map((row, i) => {
        return this._createBarChart(row.key, nutrientLabels, row.data)
      })
      let totalNutrientAppAntiHarvestDataPromise = this._createBarChart('totalNutrientAppAntiHarvestData', nutrientLabels, totalNutrientAppAntiHarvestData)


      // Summarys in report
      let materialPromises = materialData.map((row, i) => {
        let key = row && row.length === 8 ? row[row.length - 1] : ''
        return this._createHoriBarChart(key, materialLabels, row.slice(0, -1), row.slice(-1))
      })

      Promise.all([...nutrientPromises, totalNutrientAppAntiHarvestDataPromise, ...materialPromises])
        .then((res) => {
          resolve(Object.fromEntries(res))
        })
        .catch(err => {
          console.log(err)
        })

    })

  }
  onLoadBase64() {
    return this.chart.toBase64Image()
  }

  _createHoriBarChart(key, labels, data, title) {

    let canvas = document.createElement('canvas')
    canvas.style.width = HORIBAR_WIDTH
    canvas.style.height = HORIBAR_HEIGHT
    let area = document.getElementById('chartArea')
    area.appendChild(canvas)
    return new Promise((res, rej) => {
      if (key.length <= 0) {
        rej('Error: invalid key for horizontal bar chart. Data:', data)
        return
      }
      let chart = null
      chart = new Chart(canvas, {
        type: 'bar',

        data: {
          labels: labels, // [x, y, z]
          datasets: [{
            label: title,
            minBarLength: 1,
            backgroundColor: ['#f00', "#0f0", "#5656fb", "#af0", "#0fa", "#afa", "#f0f"],
            data: data
          }
          ]
        },
        options: {
          showDatapoints: true,
          indexAxis: 'y',
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: title,
              font: {
                size: 20,
              },
              // PADding: {
              //   top: 10,
              //   bottom: 30
              // }
            },
            subtitle: {
              display: true,
              text: `lbs of ${title} applied`,
              font: {
                size: 16,
              },
              // PADding: {
              //   top: 10,
              //   bottom: 30
              // }
            },
            tooltip: {
              enabled: false
            },
          },

          scales: {
            x: {
              type: 'logarithmic',
              color: "#0f0",
              // position: 'left', // `axis` is determined by the position as `'y'`
              title: {
                text: "lbs",
                display: true,
                font: {
                  size: 14
                }
              },
              // ticks: {
              //   // Include a dollar sign in the ticks
              //   callback: function (value, index, values) {
              //     return `${value} lbs/ton`
              //   }
              // }
            }
          },
          animation: {
            onComplete: () => {
              const img = chart.toBase64Image('image/png', 1)
              area.removeChild(canvas)
              res([
                key, img
              ])
            }
          },
        },
        plugins: [
          {
            id: 'custom_canvas_background_color',
            beforeDraw: (chart) => {
              const ctx = chart.canvas.getContext('2d');
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = CHART_BACKGROUND_COLOR

              // Top line and top right corner
              ctx.lineTo(PAD, 0, chart.width - PAD, 0)
              ctx.arcTo(chart.width, 0, chart.width, PAD, RADIUS)

              // Right wall and bottom right corner
              ctx.lineTo(chart.width, PAD, chart.width, chart.height - PAD)
              ctx.arcTo(chart.width, chart.height, chart.width - PAD, chart.height, RADIUS)

              // Bottom line and bottom left corner
              ctx.lineTo(chart.width - PAD, chart.height, PAD, chart.height) // right wall
              ctx.arcTo(0, chart.height, 0, chart.height - PAD, RADIUS)

              // Left wall and top left corner
              ctx.lineTo(0, chart.height - PAD, 0, PAD) // right wall
              ctx.arcTo(0, 0, PAD, 0, RADIUS)

              // Close the rectangle....
              ctx.lineTo(PAD, 0, PAD + 2, 0)

              ctx.fill()
              ctx.restore();
            }
          }
        ]
      })

    })
  }
  _createBarChart(key, labels, data) {
    let canvas = document.createElement('canvas')
    canvas.style.width = BAR_WIDTH
    canvas.style.height = BAR_HEIGHT
    canvas.style.borderRADIUS = "25px"
    let area = document.getElementById('chartArea')
    area.appendChild(canvas)
    return new Promise((res, rej) => {
      let chart = null
      chart = new Chart(canvas, {
        type: 'bar',

        data: {
          labels: labels, // [x, y, z]
          datasets: [{
            label: "Applied",
            minBarLength: 1,
            backgroundColor: ['#f00'],
            data: data[0]
          },
          {
            label: "Anticipated",
            minBarLength: 1,
            backgroundColor: ['#0f0'],
            data: data[1]
          },
          {
            label: "Harvest",
            minBarLength: 1,
            backgroundColor: ['#00f'],
            data: data[2]
          }
          ]
        },
        options: {
          showDatapoints: true,
          plugins: {
            title: {
              display: true,
              text: 'Nutrient Budget',
              font: {
                size: 20,
              },
              // PADding: {
              //   top: 10,
              //   bottom: 30
              // }
            },
            subtitle: {
              display: true,
              text: 'lbs/ acre',
              font: {
                size: 16,
              },
              // PADding: {
              //   top: 10,
              //   bottom: 30
              // }
            },
            tooltip: {
              enabled: false
            },
          },

          scales: {
            y: {
              type: 'logarithmic',
              color: "#0f0",
              position: 'left', // `axis` is determined by the position as `'y'`
              title: {
                text: "lbs / acre",
                display: true,
              },
              // ticks: {
              //   // Include a dollar sign in the ticks
              //   callback: function (value, index, values) {
              //     return `${value} lbs/ton`
              //   }
              // }
            }
          },
          animation: {
            onComplete: () => {
              const img = chart.toBase64Image('image/png', 1)
              area.removeChild(canvas)
              res([
                key, img
              ])
            }
          },
        },
        plugins: [
          {
            id: 'custom_canvas_background_color',
            beforeDraw: (chart) => {
              const ctx = chart.canvas.getContext('2d');
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = CHART_BACKGROUND_COLOR;

              // Top line and top right corner
              ctx.lineTo(PAD, 0, chart.width - PAD, 0)
              ctx.arcTo(chart.width, 0, chart.width, PAD, RADIUS)

              // Right wall and bottom right corner
              ctx.lineTo(chart.width, PAD, chart.width, chart.height - PAD)
              ctx.arcTo(chart.width, chart.height, chart.width - PAD, chart.height, RADIUS)

              // Bottom line and bottom left corner
              ctx.lineTo(chart.width - PAD, chart.height, PAD, chart.height) // right wall
              ctx.arcTo(0, chart.height, 0, chart.height - PAD, RADIUS)

              // Left wall and top left corner
              ctx.lineTo(0, chart.height - PAD, 0, PAD) // right wall
              ctx.arcTo(0, 0, PAD, 0, RADIUS)

              // Close the rectangle....
              ctx.lineTo(PAD, 0, PAD + 2, 0)

              ctx.fill()
              ctx.restore();
            }
          }
        ]
      })

    })
  }

  generatePDF() {
    pdfMake.fonts = {
      // download default Roboto font from cdnjs.com
      Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
      }
    }
    pdfMake.tableLayouts = {
      formLayout: {
        PADdingBottom: function (i, node) { return 0; },
      }
    }

    Chart.register({
      id: 'testyplugzzz',
      afterDraw: (chartInstance) => {
        var ctx = chartInstance.ctx;
        // render the value of the chart above the bar
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        chartInstance.data.datasets.forEach((dataset, di) => {
          for (var i = 0; i < dataset.data.length; i++) {
            // rewrite text if it is too close to edge for hoizontal bar chart

            let bar = chartInstance._metasets[di].data[i]
            let maxX = chartInstance.scales.x.maxWidth
            // let maxY = chartInstance.scales.y.maxHeight
            let numChars = dataset.data[i].toString().length
            let singleCharLen = 4
            var xOffset = (500 - bar.x) / 500 < 0.03 ? ((numChars * -singleCharLen) - 10) : 0;
            let num = Math.round(toFloat(dataset.data[i]))
            num = num && num >= 1e4 ? `${formatFloat(Math.round(num / 1000))}K` : formatFloat(num)
            if (chartInstance.scales.x.type === "logarithmic") {
              ctx.fillText(num, bar.x + xOffset + 10, bar.y);
            } else {
              // Vertical bars, when the numbers are too big, they overlap,
              ctx.fillText(num, bar.x, bar.y);
            }
          }
        });
      }
    })

    getAnnualReportData(this.state.dairy.pk)
      .then(arPDFData => {
        const props = arPDFData
        this.createCharts([props.nutrientBudgetB.allEvents, props.naprbalA])
          .then(images => {
            // pdfMake.createPdf(dd(props)).download();
            pdfMake.createPdf(dd(props, images)).open()
          })
          .catch(err => {
            console.log(err)
          })
      })
  }
  confirmDeleteAllFromTable(val) {
    this.setState({ toggleShowDeleteAllModal: val })
  }
  deleteAllFromTable() {

    post(`${this.props.BASE_URL}/api/dairies/delete`, { pk: this.state.dairy.pk })
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

  render() {
    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
          <Grid item container xs={12} alignItems='center'>
            <Grid item xs={5} >
              <Typography variant="h1">
                {this.state.dairy.title} {this.state.dairy.reporting_yr}
              </Typography>
            </Grid>

            <Grid item xs={5}>
              <ReportingPeriod
                onUpdate={this.props.onUpdate}
                onChange={this.props.onChange}
                period_start={this.state.dairy.period_start}
                period_end={this.state.dairy.period_end}
              />
            </Grid>

            <Grid item xs={1} align='center'>
              <Tooltip title="Generate Annual Report">
                <IconButton onClick={this.generatePDF.bind(this)} >
                  <AssessmentIcon color='primary' />
                </IconButton>
              </Tooltip>
            </Grid>

            <Grid item xs={1} align='right'>
              <Tooltip title='Delete Dairy'>
                <IconButton onClick={() => this.confirmDeleteAllFromTable(true)}>
                  <DeleteSweepIcon color='error' />
                </IconButton>
              </Tooltip>
            </Grid>


            <Grid item xs={12} style={{ marginTop: '64px' }}>
              <OperatorView
                dairy={this.state.dairy}
                onAlert={this.props.onAlert}
                BASE_URL={this.props.BASE_URL}
              />
            </Grid>

            <Grid item xs={12} style={{ marginTop: "64px" }}>
              <Paper elevation={4}>
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
                    <TextField select
                      label="Primary Breed"
                      value={
                        Math.max(0, this.props.BREEDS.indexOf(this.state.dairy.p_breed))
                      }
                      onChange={(ev) => {
                        this.props.onChange({ target: { name: 'p_breed', value: this.props.BREEDS[ev.target.value] } })
                      }}
                      style={{ width: "100%" }}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      {this.props.BREEDS.map((el, i) => {
                        return (
                          <option key={`breeds${i}`} value={i}>{el}</option>
                        )
                      })}
                    </TextField>
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
              </Paper>
            </Grid>
            <Grid item container key="parcel_FieldList" align="center" xs={12} style={{ marginTop: "24px" }} spacing={2}>
              <Grid item container xs={6} alignItems='center' justifyContent='center'>
                <Grid item xs={6}>
                  <Typography variant="h4">
                    Parcels
                  </Typography>
                </Grid>
                <Grid item xs={6} align='left'>
                  <Tooltip title="Add parcel to dairy">
                    <IconButton
                      onClick={() => this.toggleParcelModal(true)}
                      color="primary"
                      style={{ marginTop: "16px" }}
                    >
                      <AddCircleOutline />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>

              <Grid item container xs={6} alignItems='center' justifyContent='center'>
                <Grid item xs={6}>
                  <Typography variant="h4">
                    Fields
                  </Typography>
                </Grid>
                <Grid item xs={6} align='left'>
                  <Tooltip title="Add field to dairy">
                    <IconButton
                      onClick={() => this.toggleFieldModal(true)}
                      color="primary"
                      style={{ marginTop: "16px" }}
                    >
                      <AddCircleOutline />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>

             </Grid>
            <Grid item container align="center" xs={12} style={{ marginTop: "24px" }} spacing={2}>
              <ParcelAndFieldView
                reportingYr={this.state.dairy.reporting_yr}
                dairy={this.state.dairy}
                fields={this.state.fields}
                parcels={this.state.parcels}
                onFieldDelete={this.getAllFields.bind(this)}
                onParcelDelete={this.getAllParcels.bind(this)}
                onAlert={this.props.onAlert}
                BASE_URL={this.props.BASE_URL}
              />
            </Grid>

            <div id="chartArea" style={{ maxHeight: '1px', overflow: 'none' }}></div>
            <AddParcelModal
              open={this.state.showAddParcelModal}
              actionText="Add"
              cancelText="Cancel"
              modalText={`Add Parcel to Dairy ${this.state.dairy.title}`}
              parcel={{ pnumber: "" }}
              onUpdate={this.onParcelChange.bind(this)}
              onAction={this.createParcel.bind(this)}
              onClose={() => this.toggleParcelModal(false)}
              BASE_URL={this.props.BASE_URL}
            />
            <AddFieldModal
              open={this.state.showAddFieldModal}
              actionText="Add"
              cancelText="Cancel"
              modalText={`Add Field to Dairy ${this.state.dairy.title}`}
              onAction={this.createField.bind(this)}
              onClose={() => this.toggleFieldModal(false)}
              BASE_URL={this.props.BASE_URL}
            />
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
