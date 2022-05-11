import React, { Component } from 'react'
import {
  Grid, Paper, Typography, TableBody, Table, TableContainer, TableCell, TableRow, TableFooter
} from '@material-ui/core'
import { withRouter } from "react-router-dom"
import { withTheme, withStyles } from '@material-ui/core/styles'
import { get } from "../utils/requests"
import {
  PROCESS_WASTEWATER, FRESHWATER, SOLIDMANURE, FERTILIZER, MANURE, WASTEWATER, HARVEST, SOIL, PLOWDOWN_CREDIT, DRAIN, DISCHARGE, TSV_INFO
} from '../utils/TSV'
import { createHeaderMap, mapsColToTemplate } from '../utils/TSV'
import { TABLE_HEADER_BACKGROUND_COLOR, } from "../specific"
import { Dairy } from '../utils/dairy/dairy'
import { Logo } from '../utils/Logo/logo'
import { auth } from '../utils/users'


const CROP_TITLE_MAP = { 'Alfalfa Haylage': 'Alfalfa Haylage', 'Alfalfa hay': 'Alfalfa hay', 'Almond in shell': 'Almond in shell', 'Apple': 'Apple', 'Barley silage boot stage': 'Barley silage boot stage', 'Barley silage soft dough': 'Barley silage soft dough', 'Barley grain': 'Barley grain', 'Bermudagrass hay': 'Bermudagrass hay', 'Broccoli': 'Broccoli', 'Bromegrass forage': 'Bromegrass forage', 'Cabbage': 'Cabbage', 'Canola grain': 'Canola grain', 'Cantaloupe': 'Cantaloupe', 'Celery': 'Celery', 'Clover-grass hay': 'Clover-grass hay', 'Corn grain': 'Corn grain', 'Corn silage': 'Corn silage', 'Cotton lint': 'Cotton lint', 'Grape': 'Grape', 'Lettuce': 'Lettuce', 'Oats grain': 'Oats grain', 'Oats hay': 'Oats hay', 'Oats silage-soft dough': 'Oats silage', 'Orchardgrass hay': 'Orchardgrass hay', 'Pasture': 'Pasture', 'Pasture Silage': 'Pasture Silage', 'Peach': 'Peach', 'Pear': 'Pear', 'Potato': 'Potato', 'Prune': 'Prune', 'Ryegrass hay': 'Ryegrass hay', 'Safflower': 'Safflower', 'Sorghum': 'Sorghum', 'Sorghum-Sudangrass forage': 'Sorghum-Sudangrass forage', 'Squash': 'Squash', 'Sudangrass hay': 'Sudangrass hay', 'Sudangrass silage': 'Sudangrass silage', 'Sugar beets': 'Sugar beets', 'Sweet Potato': 'Sweet Potato', 'Tall Fescue hay': 'Tall Fescue hay', 'Timothy hay': 'Timothy hay', 'Tomato': 'Tomato', 'Triticale boot stage': 'Triticale boot stage', 'Triticale soft dough': 'Triticale soft dough', 'Vetch forage': 'Vetch forage', 'Wheat grain': 'Wheat grain', 'Wheat Hay': 'Wheat Hay', 'Wheat silage boot stage': 'Wheat silage boot stage', 'Wheat silage soft dough': 'Wheat silage soft dough' }

// List of nums to use

const TSV_PRINT_COLS = {
  [PROCESS_WASTEWATER]:
    [
      "Application Date",
      "Field",
      "Acres Planted",
      "Crop",
      "Sample Description",
      "N (mg/L)",
      "P (mg/L)",
      "K (mg/L)",
      "EC (umhos/cm)",
      "TDS (mg/L)",
      "Application Rate (GPM)",
      "Run Time (Hours)",
      "Total Gallons Applied",
      "Application Rate per acre (Gallons/ acre)",
      'N (Lbs/ Acre)',
      'P (Lbs/ Acre)',
      'K (Lbs/ Acre)',
    ],
  [FRESHWATER]:
    [
      "Application Date",
      "Field",
      "Acres Planted",
      "Crop",
      "Source Description",
      "Application Rate (GPM)",
      "Run Time (Hours)",
      "Total Gallons Applied",
      "Application Rate per Acre (Gallons/acre)",
      "N (mg/L)",
      "EC (umhos/cm)",
      "TDS (mg/L)",
      "Lbs/Acre N"
    ],
  [SOLIDMANURE]:
    [
      "Application Date",
      "Field",
      "Acres Planted",
      "Crop",
      "Source Description",
      "Application Rate per Acre (Tons/acre)",
      "% Moisture",
      "% N",
      "% P",
      "% K",
      "% TFS",
      "Lbs/Acre N",
      "Lbs/Acre P",
      "Lbs/Acre K",
      "Lbs/Acre Salt",
    ],
  [FERTILIZER]:
    [
      "Application Date",
      "Field",
      "Acres Planted",
      "Crop",
      "Import Description",
      "Application Rate (Lbs/Acre)",
      "% Moisture",
      "% N",
      "% P",
      "% K",
      "Lbs/Acre N",
      "Lbs/Acre P",
      "Lbs/Acre K",
    ],
  [HARVEST]: [
    'Field',
    'Acres Planted',
    'Crop',
    'Plant Date',
    'Harvest Dates',
    'Expected Yield Tons/Acre',
    'Actual Yield Tons/Acre',
    'Actual Yield Total Tons',
    'Reporting Method',
    '% Moisture',
    '% N',
    '% P',
    '% K',
    '% TFS Salt (Dry Basis)',
    'Lbs/Acre N',
    'Lbs/Acre P',
    'Lbs/Acre K',
    'Lbs/Acre Salt',
  ],

  [SOIL]: ['Application Date', 'Field', 'Acres Planted', 'Crop', 'Sample Date1', 'Sample Date2', 'Sample Date3'],
  [PLOWDOWN_CREDIT]: ['Application Date', 'Field', 'Acres Planted', 'Crop', 'App Method', 'Source Description', 'N lbs/ acre', 'P lbs/ acre', 'K lbs/ acre', 'Salt lbs/ acre'],
  [DRAIN]: ['Source Description', 'Sample Date', 'Sample Description', 'NH4-N (mg/L)', 'NO3-N (mg/L)', 'P (mg/L)', 'EC (umhos/cm)', 'TDS (mg/L)'],
  [DISCHARGE]: ['Type', 'Date Time', 'Location', 'Volume discharged', 'Volume Unit', 'Duration of Discharge (mins)', 'Discharge Source', 'Method of Measuring', 'Rationale for Sample Location', 'Reference Number for Discharge Site'],


  [MANURE]: [
    "Date",
    "Recipient",
    "Destination Street",
    "Amount (Tons)",
    "Material Type",
    "% Moisture",
    "% N",
    "% P",
    "% K",
    "% TFS",
    'Lbs of N Removed',
    'Lbs of P Removed',
    'Lbs of K Removed',
    'Lbs of Salt Removed',
  ], // Exports
  [WASTEWATER]: [
    "Date",
    "Recipient",
    "Destination Street",
    "Hours",
    "GPM",
    "Amount (Gals)",
    "Source Description",
    "N (PPM)",
    "P (PPM)",
    "K (PPM)",
    "EC (umhos/cm)",
    "TDS (mg/L)",
    'Lbs of N Removed',
    'Lbs of P Removed',
    'Lbs of K Removed',
  ], // Exports
}

const StyledTable = withStyles(theme => ({
  root: {
    // padding: "0px",
    maxWidth: "100%",
  }
}))(Table)

const StyledRow = withStyles(theme => ({
  root: {
    // padding: "0px",
    border: '1px solid grey',
    // borderRight: '1px solid grey'
  }
}))(TableRow)

const StyledCell = withStyles(theme => ({
  root: {
    padding: "1px",
  }
}))(TableCell)

const StyledHeaderCell = withStyles(theme => ({
  root: {
    padding: "1px",
    backgroundColor: TABLE_HEADER_BACKGROUND_COLOR
  }
}))(TableCell)

const BorderlessCell = withStyles(theme => ({
  root: {
    border: 'none',
  }
}))(TableCell)

class TSVPrint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
      tsvType: props.tsvType,
      tsv: {},
      numCols: props.numCols,
      aboveHeader: [], // 2d array
      header: [], // 1d array
      dataRows: [] // 2d array
    }
  }

  static getDerivedStateFromProps(props, state) {
    return props
  }

  componentDidMount() {
    this.getTSV()
  }

  componentDidUpdate() {
    if (this.state.header.length > 0) {

    }
  }

  async printTSV() {
    window.focus()
    window.document.title = this.state.tsv.title.substring(0, this.state.tsv.title.length - 4)
    let footerImg = document.getElementById('footerImg')

    try {
      const logo = await Logo.getLogo(auth.currentUser.company_id)
      if (logo.error) {
        return console.log(logo)
      }
      footerImg.src = logo
    } catch (e) {
      console.log(e)
      return { error: e }
    }


    footerImg.onload = () => {
      window.print()
    }
  }

  getTSV() {
    Promise.all([
      get(`${this.props.BASE_URL}/api/tsv/${this.state.dairy_id}/${this.state.tsvType}`),
      Dairy.getDairyByPK(this.state.dairy_id)
    ])
      .then(([res, dairy]) => {
        let aboveHeader = []
        let header = []
        let dataRows = []
        if (res[0] && res[0].data) {
          [aboveHeader, header, dataRows] = this.tsvTextToRows(res[0].data)

          this.setState({
            tsv: res[0],
            aboveHeader: aboveHeader,
            header: header,
            dataRows: dataRows
          }, () => this.printTSV())
        }
      })
  }

  moveYearToEndOfRow(firstRow, rowLength) {
    //ONLY FOR ABOVE HEADER ROW aka FIRSTROW
    // firstRow is the whole row containing the year and the value
    // headerRow is the row of headers which is the true length of cols

    // search firstRow for year
    // move to position determined by headerro
    let newRow = new Array(rowLength - 4).fill(' ')  // colSpan on first two elements ends up expanding the exisint cells, and makes the rows uneven, remove 4 of the empty cells to account for this
    // Filter empty cols
    firstRow = firstRow.filter(el => typeof el === typeof '' && el.length > 0)

    newRow[0] = firstRow[0]
    newRow[3] = firstRow[1]
    newRow[newRow.length - 2] = firstRow[2]
    newRow[newRow.length - 1] = firstRow[3]
    return newRow
  }

  formatAboveHeaderRow(row, headerRow) {
    let res = new Array(headerRow.length - 4).fill(' ')
    row = row.filter(el => typeof el === typeof '' && el.length > 0)
    res[0] = row[0]
    res[3] = row[1]
    return res
  }

  // Need to include two rows at top...

  // want year: 2020 to be at the end of the row
  // Need to create a row equal length of the header row and fill it in correctlt
  tsvTextToRows(tsvText) {
    let dataStarted = false
    let rows = []
    let aboveHeader = []
    let header = []
    let dataRows = []
    let headerMap = {}

    let splitText = tsvText.split('\n')
    let printCols = TSV_PRINT_COLS[this.state.tsvType]  // List of ints representing indices to print from TSV

    splitText.forEach((row, i) => {
      // Need a function to extract the cols I need
      if (i === 0) {
        // let _col = row && row.length > 0 ? row.split('\t') : [] // List of all Cols
        // console.log(row, _col)
      }
      let _cols = row && row.length > 0 ? row.split('\t') : [] // List of all Cols

      // Ensure the row has more cols than what is going to be printed

      if (dataStarted) {
        const cols = printCols.map(key => _cols[headerMap[key]]) // For each print col index, get the data from the row 
        dataRows.push(cols)
      } else {
        if (_cols[0] === "Start" && !dataStarted) {
          // We only know the row w/ header info is just before the start row.
          header = splitText[Math.max(0, i - 1)].split('\t')
          headerMap = createHeaderMap(header, false)
          dataStarted = true
        } else {
          if (i === 0) {
            _cols = this.moveYearToEndOfRow(_cols, printCols.length)
          } else if (i === 1) {
            _cols = this.formatAboveHeaderRow(_cols, printCols)
          }
          aboveHeader.push(_cols.slice(0, printCols.length))
        }
      }
    })
    return [aboveHeader, printCols, dataRows]
  }

  findCropIndex() {
    // Searches header for 'Crop' in header, returns index if found. 
    // If not found, return -1
    // Used to shorten text length of Crop titles in TSV
    let index = -1
    this.state.header && this.state.header.forEach((header, i) => {
      if (header === 'Crop') {
        index = i
      }
    })
    return index
  }

  render() {
    const cropIndex = this.findCropIndex()
    return (
      <Grid container alignItems="center" alignContent="center" align="center" item xs={12} style={{ maxWidth: "99%" }} >
        {
          this.state.header.length > 0 ?
            // <TableContainer style={{ overflowX: 'hidden' }}>
            <StyledTable size='small'>
              <TableBody>
                {
                  this.state.aboveHeader.length > 0 ?

                    this.state.aboveHeader.slice(0, -1).map((row, i) => {
                      return (
                        <TableRow key={`tsvpah${i}`} style={{ border: '1px solid black' }} >
                          {
                            row.map((cellText, j) => {
                              return (
                                <StyledCell align='center' colSpan={j === 0 || j === 3 ? 3 : 1} key={`tsvpbc${i * j + j}`}>
                                  <Typography variant="caption">
                                    {cellText}
                                  </Typography>
                                </StyledCell>
                              )
                            })
                          }
                        </TableRow>
                      )
                    })

                    :
                    <React.Fragment></React.Fragment>
                }
                <StyledRow >
                  {
                    this.state.header.map((headerTitle, i) => {
                      return (
                        <StyledHeaderCell align='center' key={`tsvphc${i}`}>
                          <Typography
                            variant="caption" style={{ fontWeight: 600 }}>
                            {headerTitle}
                          </Typography>
                        </StyledHeaderCell>
                      )
                    })
                  }
                </StyledRow>
                {this.state.dataRows.length > 0 ?
                  this.state.dataRows.map((row, i) => {
                    return (
                      <TableRow key={`tsvpbr${i}`}>
                        {
                          row.map((cellText, j) => {
                            const text = j === cropIndex ? CROP_TITLE_MAP[cellText] : cellText
                            return (
                              <StyledCell align='center' style={{ border: '1px solid grey' }} key={`tsvpbc${i * j + j}`}>
                                <Typography variant="caption">
                                  {text}
                                </Typography>
                              </StyledCell>
                            )
                          })
                        }
                      </TableRow>
                    )
                  })
                  :
                  <TableRow>
                    <TableCell colSpan={this.state.header.length} align="center">No data</TableCell>
                  </TableRow>
                }
              </TableBody>
              <TableFooter>
                <TableRow>
                  <BorderlessCell align='center' colSpan={this.state.header.length}>
                    <img id='footerImg' style={{ height: '64px' }} />
                  </BorderlessCell>
                </TableRow>
              </TableFooter>
            </StyledTable>
            // </TableContainer>


            :
            <React.Fragment>No data for TSV</React.Fragment>
        }
      </Grid>
    )
  }
}

export default TSVPrint = withRouter(withTheme(TSVPrint))
