import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import {
  DatePicker
} from '@material-ui/pickers'
import AddIcon from '@material-ui/icons/Add'
import { alpha } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import { withTheme } from '@material-ui/core/styles'
import Chart from 'chart.js/auto';
import { get, getPDF, post } from '../../utils/requests'
import ParcelAndFieldView from "../Parcel/parcelAndFieldView"
import OperatorView from "../Operators/operatorView"
import AddParcelModal from "../Modals/addParcelModal"
import AddFieldModal from "../Modals/addFieldModal"
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"
import dd from "./pdf"

import formats from "../../utils/format"
import { getByText } from '@testing-library/react'

pdfMake.vfs = pdfFonts.pdfMake.vfs

const BASE_URL = "http://localhost:3001"
const HORIBAR_WIDTH = '600px'
const HORIBAR_HEIGHT = '300px'
const BAR_WIDTH = '500px'
const BAR_HEIGHT = '333px'
const CHART_BACKGROUND_COLOR = "#ececec"
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





class DairyTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      reportingYr: props.reportingYr,
      dairy: props.dairy,
      showAddParcelModal: false,
      showAddFieldModal: false,
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
  componentDidMount(){
    this.getAllFields()
    this.getAllParcels()
  }
  onChange(ev) {
    const { name, value } = ev.target
    this.props.onChange(name, value)
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
    let data = { data: [pnumber, this.state.dairy.pk] }

    post(`${BASE_URL}/api/parcels/create`, data)
      .then(res => {
        console.log(res)
        this.toggleParcelModal(false)
        this.getAllParcels()
      })
      .catch(err => {
        console.log(err)
        this.toggleParcelModal(false)
      })
  }
  toggleParcelModal(val) {
    this.setState({ showAddParcelModal: val })
  }
  createField(field) {
    console.log("Creating Field for")
    console.log(this.state.dairy.title, this.state.dairy.pk)
    console.log(field)
    post(`${BASE_URL}/api/fields/create`, { data: { ...field, dairy_id: this.state.dairy.pk } })
      .then(res => {
        console.log(res)
        this.toggleFieldModal(false)
        this.getAllFields()
      })
      .catch(err => {
        console.log(err)
        this.toggleFieldModal(false)
      })
  }
  toggleFieldModal(val) {
    this.setState({ showAddFieldModal: val })
  }
  getAllParcels() {
    get(`${BASE_URL}/api/parcels/${this.state.dairy.pk}`)
      .then(res => {
        // console.log(res)
        this.setState({ parcels: res })
      })
      .catch(err => { console.log(err) })
  }
  getAllFields() {
    get(`${BASE_URL}/api/fields/${this.state.dairy.pk}`)
      .then(res => {
        // console.log(res)
        this.setState({ fields: res })
      })
      .catch(err => { console.log(err) })
  }



  // Annual Report Section 
  createCharts() {
    let nutrientLabels = ["N", "P", "K", "Salt"]
    let nutrientData = [
      [// data set 1
        [0, 51, 5067, 2000054],   // applied
        [6, 11, 16, 2010],   // anticipated
        [7, 12, 17, 2020],   // harvested
      ],
      [ // data set 2
        [5, 10, 15, 2000],
        [6, 11, 16, 2010],
        [7, 12, 17, 2020],
      ]
    ]

    let materialLabels = [
      'Existing soil nutrient content',
      'Plowdown credit',
      'Commercial fertilizer / Other',
      'Dry Manure',
      'Process wastewater',
      'Fresh water',
      'Atmospheric deposition',
    ]

    let materialData = [
      [31,10,52,61,73,84,20550540, "Nitrogen"]
    ]

    return new Promise((resolve, rej) => {
      // for fields and a single summery in report
      let nutrientPromises = nutrientData.map((row, i) => {
        return this._createBarChart(`nutrientHoriBar${i}`, nutrientLabels, row)
      })

      // Summarys in report
      let materialPromises = materialData.map((row, i) => {
        return this._createHoriBarChart(`materialHoriBar${i}`, materialLabels, row.slice(0,-1), row.slice(-1))
      })

      Promise.all([...nutrientPromises, ...materialPromises])
        .then((res) => {
          console.log(res)
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
    console.log("Creating horibarChart")
    console.log(key, labels, data, title)
    return new Promise((res, rej) => {
      let chart = null
      chart = new Chart(canvas, {
        type: 'bar',
        
        data: {
          labels: labels, // [x, y, z]
          datasets: [{
            label: title,
            minBarLength: 1,
            backgroundColor: ['#f00', "#0f0", "#00f", "#af0", "#0fa", "#afa", "#f0f"],
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
              title:{
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
              ctx.lineTo(PAD,0, chart.width-PAD, 0) 
              ctx.arcTo(chart.width, 0, chart.width, PAD, RADIUS)  
              
              // Right wall and bottom right corner
              ctx.lineTo(chart.width, PAD, chart.width, chart.height-PAD) 
              ctx.arcTo(chart.width, chart.height, chart.width - PAD, chart.height, RADIUS)  
              
              // Bottom line and bottom left corner
              ctx.lineTo(chart.width - PAD, chart.height,  PAD, chart.height) // right wall
              ctx.arcTo(0, chart.height,  0, chart.height - PAD, RADIUS)

              // Left wall and top left corner
              ctx.lineTo(0, chart.height - PAD,  0, PAD) // right wall
              ctx.arcTo(0, 0, PAD, 0, RADIUS)

              // Close the rectangle....
              ctx.lineTo(PAD , 0, PAD + 2, 0)
              
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
              title:{
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
        plugins:[
          {
            id: 'custom_canvas_background_color',
            beforeDraw: (chart) => {
              const ctx = chart.canvas.getContext('2d');
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = CHART_BACKGROUND_COLOR;

              // Top line and top right corner
              ctx.lineTo(PAD,0, chart.width-PAD, 0) 
              ctx.arcTo(chart.width, 0, chart.width, PAD, RADIUS)  
              
              // Right wall and bottom right corner
              ctx.lineTo(chart.width, PAD, chart.width, chart.height-PAD) 
              ctx.arcTo(chart.width, chart.height, chart.width - PAD, chart.height, RADIUS)  
              
              // Bottom line and bottom left corner
              ctx.lineTo(chart.width - PAD, chart.height,  PAD, chart.height) // right wall
              ctx.arcTo(0, chart.height,  0, chart.height - PAD, RADIUS)

              // Left wall and top left corner
              ctx.lineTo(0, chart.height - PAD,  0, PAD) // right wall
              ctx.arcTo(0, 0, PAD, 0, RADIUS)

              // Close the rectangle....
              ctx.lineTo(PAD , 0, PAD + 2, 0)
              
              ctx.fill()
              ctx.restore();
            }
          }
        ]
      })
     
    })
  }

  generatePDF() {
    // pdfMake.createPdf(dd(props)).download();
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
    let props = {} // data from db formatted nicely to plugin to pdf

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
            if(chartInstance.scales.x.type === "logarithmic"){
              ctx.fillText(dataset.data[i], bar.x + xOffset + 10 , bar.y);
            }else{
              ctx.fillText(dataset.data[i], bar.x, bar.y);

            }
          }
        });
      }
    });
    this.createCharts()
      .then(images => {
        console.log(images)
        pdfMake.createPdf(dd(props, images)).open()
      })
      .catch(err => {
        console.log(err)
      })
  }
  render() {
    return (
      <React.Fragment>
        {Object.keys(this.props.dairy).length > 0 ?
          <Grid item container xs={12}>
            <Grid item xs={6} >
              <Typography variant="h2">
                Dairy Information
              </Typography>

            </Grid>
            <Grid item xs={6} >
              <Tooltip title="Generate Annual Report">
                <IconButton
                  onClick={this.generatePDF.bind(this)} >
                  <AddIcon style={{ color: this.props.theme.palette.text.primary }} />
                </IconButton>
              </Tooltip>

            </Grid>


            <Grid item xs={12}>
              <OperatorView
                dairy={this.state.dairy}

              />
            </Grid>


            <Grid item container xs={12} style={{ marginTop: "64px" }}>
              <Grid item xs={12}>
                <Typography variant="h2">
                  Address
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name='title'
                  value={this.state.dairy.title}
                  onChange={this.onChange.bind(this)}
                  label="Dairy Name"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item container xs={4} style={{ position: "relative" }}>
                <div style={{ position: 'absolute', top: 0, left: 0 }}>
                  <Typography variant="caption">First Started Operation</Typography>
                </div>
                <DatePicker
                  value={this.state.dairy.began}
                  onChange={this.handleDateChange.bind(this)}
                  style={{ width: "100%", justifyContent: "flex-end" }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField select
                  name='p_breed'
                  value={this.state.dairy.p_breed}
                  onChange={this.onChange.bind(this)}
                  label="Primary Breed"
                  style={{ width: "100%" }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {this.props.breeds.map((el, i) => {
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
                  onChange={this.onChange.bind(this)}
                  label="Street"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name='cross_street'
                  value={this.state.dairy.cross_street}
                  onChange={this.onChange.bind(this)}
                  label="Cross Street"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField select
                  name='county'
                  value={this.state.dairy.county}
                  onChange={this.onChange.bind(this)}
                  label="County"
                  style={{ width: "100%" }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {this.props.counties.map((el, i) => {
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
                  onChange={this.onChange.bind(this)}
                  label="City"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  name='city_state'
                  value={this.state.dairy.city_state}
                  onChange={this.onChange.bind(this)}
                  label="State"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  name='city_zip'
                  value={this.state.dairy.city_zip}
                  onChange={this.onChange.bind(this)}
                  label="Zip"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField select
                  name='basin_plan'
                  value={this.state.dairy.basin_plan}
                  onChange={this.onChange.bind(this)}
                  label="Basin Plan"
                  style={{ width: "100%" }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {this.props.basins.map((el, i) => {
                    return (
                      <option key={`basin${i}`} value={i}>{el}</option>
                    )
                  })}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Grid item xs={12} container alignItems="center">
                  <Button variant="outlined" fullWidth color="primary"
                    onClick={this.props.onUpdate} style={{ marginTop: "16px" }}
                  >
                    Update
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item container key="parcel_FieldList" align="center" xs={12} style={{ marginTop: "24px" }} spacing={2}>
              <Grid item xs={6}>
                <Grid item xs={12}>
                  <Typography variant="h4">
                    Parcels
                  </Typography>
                </Grid>
                <Tooltip title="Add parcel to dairy">
                  <Button
                    onClick={() => this.toggleParcelModal(true)}
                    fullWidth variant="outlined" color="primary"
                    style={{ marginTop: "16px" }}
                  >
                    <Typography variant="subtitle2">
                      Add Parcel
                    </Typography>
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h4">
                  Fields
                </Typography>
                <Tooltip title="Add field to dairy">
                  <Button
                    onClick={() => this.toggleFieldModal(true)}
                    fullWidth variant="outlined" color="primary"
                    style={{ marginTop: "16px" }}
                  >
                    <Typography variant="subtitle2">
                      Add Field
                    </Typography>
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
            <Grid item container align="center" xs={12} style={{ marginTop: "24px" }} spacing={2}>
              <ParcelAndFieldView
                reportingYr={this.state.reportingYr}
                dairy={this.state.dairy}
                fields={this.state.fields}
                parcels={this.state.parcels}
                onFieldDelete={this.getAllFields.bind(this)}
                onParcelDelete={this.getAllParcels.bind(this)}
              />
            </Grid>

            <div id="chartArea" style={{ maxHeight: '1px', overflow: 'none' }}>

            </div>
            <AddParcelModal
              open={this.state.showAddParcelModal}
              actionText="Add"
              cancelText="Cancel"
              modalText={`Add Parcel to Dairy ${this.state.dairy.title}`}
              parcel={{ pnumber: "" }}
              onUpdate={this.onParcelChange.bind(this)}
              onAction={this.createParcel.bind(this)}
              onClose={() => this.toggleParcelModal(false)}
            />
            <AddFieldModal
              open={this.state.showAddFieldModal}
              actionText="Add"
              cancelText="Cancel"
              modalText={`Add Field to Dairy ${this.state.dairy.title}`}
              onAction={this.createField.bind(this)}
              onClose={() => this.toggleFieldModal(false)}
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
