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

import { TABLE_HEADER_BACKGROUND_COLOR, B64_LOGO, } from "../specific"


const CROP_TITLE_MAP = {'Alfalfa Haylage': 'Alfalfa Haylage', 'Alfalfa hay': 'Alfalfa hay', 'Almond in shell': 'Almond in shell', 'Apple': 'Apple', 'Barley silage boot stage': 'Barley silage boot stage', 'Barley silage soft dough': 'Barley silage soft dough', 'Barley grain': 'Barley grain', 'Bermudagrass hay': 'Bermudagrass hay', 'Broccoli': 'Broccoli', 'Bromegrass forage': 'Bromegrass forage', 'Cabbage': 'Cabbage', 'Canola grain': 'Canola grain', 'Cantaloupe': 'Cantaloupe', 'Celery': 'Celery', 'Clover-grass hay': 'Clover-grass hay', 'Corn grain': 'Corn grain', 'Corn silage': 'Corn silage', 'Cotton lint': 'Cotton lint', 'Grape': 'Grape', 'Lettuce': 'Lettuce', 'Oats grain': 'Oats grain', 'Oats hay': 'Oats hay', 'Oats silage-soft dough': 'Oats silage', 'Orchardgrass hay': 'Orchardgrass hay', 'Pasture': 'Pasture', 'Pasture Silage': 'Pasture Silage', 'Peach': 'Peach', 'Pear': 'Pear', 'Potato': 'Potato', 'Prune': 'Prune', 'Ryegrass hay': 'Ryegrass hay', 'Safflower': 'Safflower', 'Sorghum': 'Sorghum', 'Sorghum-Sudangrass forage': 'Sorghum-Sudangrass forage', 'Squash': 'Squash', 'Sudangrass hay': 'Sudangrass hay', 'Sudangrass silage': 'Sudangrass silage', 'Sugar beets': 'Sugar beets', 'Sweet Potato': 'Sweet Potato', 'Tall Fescue hay': 'Tall Fescue hay', 'Timothy hay': 'Timothy hay', 'Tomato': 'Tomato', 'Triticale boot stage': 'Triticale boot stage', 'Triticale soft dough': 'Triticale soft dough', 'Vetch forage': 'Vetch forage', 'Wheat grain': 'Wheat grain', 'Wheat Hay': 'Wheat Hay', 'Wheat silage boot stage': 'Wheat silage boot stage', 'Wheat silage soft dough': 'Wheat silage soft dough'}

// List of nums to use

const tsvPrintCols = {
  [PROCESS_WASTEWATER]: [0, 1, 2, 5, 12, 14, 18, 19, 27, 28, 47, 48, 49, 50, 51, 52, 53, 54],
  [FRESHWATER]: [0, 1, 2, 5, 12, 16, 26, 27, 40, 41, 42, 43, 44],
  [SOLIDMANURE]: [0, 1, 2, 5, 13, 17, 18, 19, 20, 21, 22, 28, 38, 39, 40, 41],
  [FERTILIZER]: [0, 1, 2, 5, 11, 17, 18, 19, 20, 21, 22, 23, 24, 25],
  [HARVEST]: [0, 1, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 22, 23, 24, 25],

  [SOIL]: [0, 1, 5, 11, 12, 27, 28, 42, 43],
  [PLOWDOWN_CREDIT]: [0, 1, 2, 5, 6, 11, 12, 13, 14, 15],
  [DRAIN]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  [DISCHARGE]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],


  [MANURE]: [0, 21, 31, 33, 34, 35, 36, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49], // Exports
  [WASTEWATER]: [0, 21, 31, 33, 34, 35, 36, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50], // Exports
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

const BorderlessCell =  withStyles(theme => ({
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
      window.focus()
      window.document.title = this.state.tsv.title.substring(0, this.state.tsv.title.length - 4)
      let footerImg = document.getElementById('footerImg')
      footerImg.src = B64_LOGO
      footerImg.onload = () => {
        window.print()
      }
    }
  }

  getTSV() {
    Promise.all([
      get(`${this.props.BASE_URL}/api/tsv/${this.state.dairy_id}/${this.state.tsvType}`),
      get(`${this.props.BASE_URL}/api/dairy/${this.state.dairy_id}`),
    ])
      .then(([res, dairy]) => {
        let aboveHeader = []
        let header = []
        let dataRows = []
        if (res[0] && res[0].data) {
          [aboveHeader, header, dataRows] = this.tsvTextToRows(res[0].data)
          console.log(aboveHeader)
          this.setState({
            tsv: res[0],
            aboveHeader: aboveHeader,
            header: header,
            dataRows: dataRows
          })
        }
      })
  }

  moveYearToEndOfRow(firstRow, headerRow){
    //ONLY FOR ABOVE HEADER ROW aka FIRSTROW
    // firstRow is the whole row containing the year and the value
    // headerRow is the row of headers which is the true length of cols

    // search firstRow for year
    // move to position determined by headerrow
    
    let res = new Array(headerRow.length-4).fill(' ')
    firstRow = firstRow.filter(el => typeof el === typeof '' && el.length > 0)

    res[0] = firstRow[0]
    res[3] = firstRow[1]
    res[res.length - 2] = firstRow[2]
    res[res.length - 1] = firstRow[3]
    console.log(res)
    return res
  }


  // Need to include two rows at top...

  // want year: 2020 to be at the end of the row
  // Need to create a row equal length of the header row and fill it in correctlt
  tsvTextToRows(tsvText) {
    let dataStarted = false
    let rows = []
    let numCols = TSV_INFO[this.state.tsvType].numCols
    let aboveHeader = []
    let header = []
    let dataRows = []

    let splitText = tsvText.split('\n')
    let printCols = tsvPrintCols[this.state.tsvType]  // List of ints representing indices to print from TSV

    splitText.forEach((row, i) => {
      // Need a function to extract the cols I need
      if(i === 0){
        // let _col = row && row.length > 0 ? row.split('\t') : [] // List of all Cols
        // console.log(row, _col)
      }
      let _cols = row && row.length > 0 ? row.split('\t') : [] // List of all Cols
      let cols = []
      // Ensure the row has more cols than what is going to be printed
      if (printCols[printCols.length - 1] <= _cols.length - 1) {
        cols = printCols.map(index => _cols[index]) // For each print col index, get the data from the row 
      }

      if (dataStarted) {
        dataRows.push(cols)
      } else {
        if (_cols[0] === "Start" && !dataStarted) {
          // We only know the row w/ header info is just before the start row.
          header = splitText[Math.max(0, i - 1)].split('\t')

          if (printCols[printCols.length - 1] <= header.length - 1) {
            header = printCols.map(index => header[index])
          }
          
          dataStarted = true
        } else{
          if(i == 0){
            _cols = this.moveYearToEndOfRow(_cols, printCols)
          }
          aboveHeader.push(_cols.slice(0, Math.min(numCols, printCols.length - 4)))  // picked 4 via trial and error.
        }
      }
    })
    return [aboveHeader, header, dataRows]
  }

  findCropIndex(){
    // Searches header for 'Crop' in header, returns index if found. 
    // If not found, return -1
    // Used to shorten text length of Crop titles in TSV
    let index = -1
    this.state.header && this.state.header.forEach((header, i) => {
      if(header === 'Crop'){
        index = i
      }
    })
    return index
  }

  render() {
    const cropIndex = this.findCropIndex()
    return (
      <Grid container alignItems="center" alignContent="center" align="center" item xs={12} style={{ maxWidth: "100%" }} >


        {
          this.state.header.length > 0 ?
            <TableContainer component={Paper}>
              <StyledTable size='small'>
                <TableBody>
                {
                  this.state.aboveHeader.length > 0 ?

                    this.state.aboveHeader.slice(0, -1).map((row, i) => {
                      return (
                        <TableRow key={`tsvpah${i}`}>
                          {
                            row.map((cellText, j) => {
                              return (
                                <StyledCell align='center' colSpan={j===0 || j===3? 3:1} key={`tsvpbc${i * j + j}`}>
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
                  <StyledRow>
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
                                <StyledCell align='center' key={`tsvpbc${i * j + j}`}>
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
                      <img id='footerImg' style={{height: '64px'}}/>
                    </BorderlessCell>
                  </TableRow>
                </TableFooter>
              </StyledTable>
            </TableContainer>


            :
            <React.Fragment>No data for TSV</React.Fragment>
        }
      </Grid>
    )
  }
}

export default TSVPrint = withRouter(withTheme(TSVPrint))
