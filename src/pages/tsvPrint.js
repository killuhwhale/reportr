import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField,
  TableHead, TableBody, Table, TableContainer, TableCell, TableRow, TableFooter
} from '@material-ui/core'
import { withRouter } from "react-router-dom"
import { withTheme, withStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import { get, post, uploadFiles } from "../utils/requests"
import {
  PROCESS_WASTEWATER, FRESHWATER, SOLIDMANURE, FERTILIZER, MANURE, WASTEWATER, HARVEST, SOIL, PLOWDOWN_CREDIT, DRAIN, DISCHARGE
} from '../utils/TSV'

import "../App.css"


const PARCELS = ["0045-0200-0012-0000", "0045-0200-0020-0000", "0045-0200-0023-0000", "0045-0200-0029-0000", "0045-0200-0033-0000",
  "0045-0200-0034-0000", "0045-0200-0035-0000", "0045-0200-0037-0000", "0045-0200-0060-0000", "0045-0200-0061-0000", "0045-0200-0074-0000", "0045-0230-0025-0000",
  "0045-0230-0066-0000", "0045-0240-0037-0000"]

const pngLogo = () => {
 return `data:image/jpeg;base64,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`
}
  
  

// List of nums to use

const tsvPrintCols = {
  [PROCESS_WASTEWATER]: [0,1,2,5,12,14,18,19,27,28, 47,48,49,50,51,52,53,54],
  [FRESHWATER]: [0,1,2,5,12,  16,  26,27, 40,41,42,43,44 ],
  [SOLIDMANURE]: [0,1,2,5,13,   17,18,19,20,21,22,28, 38,39,40,41],
  [FERTILIZER]: [0,1,2,5,11,  17,18,19,20,21,22,23,24,25],
  [HARVEST]: [0,1,4,5,6,7,8,9,    12,13,14,15,16,17, 22,23,24,25],

  [SOIL]: [0,1,5,  11,12, 27,28,  42,43 ],
  [PLOWDOWN_CREDIT]: [0,1,2,   5,6,     11,12,13,14,15],
  [DRAIN]: [0,1,2,3,4,5,6,7,8,9,10,11,12,13],
  [DISCHARGE]: [0,1,2,3,4,5,6,7,8,9],


  [MANURE]: [0, 21, 31,33,34,35,36,  40, 41,42,43,44,45,46,47,48,49  ], // Exports
  [WASTEWATER]: [0, 21, 31,33,34,35,36,  39,40, 41,42,43,44,45,46,47,48,49,50 ], // Exports
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
    backgroundColor: '#c6d9f0'
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
    console.log("HEADER length SHOULD PRINT?", this.state.header.length)
    if (this.state.header.length > 0) {
      window.focus()
      window.document.title = this.state.tsv.title.substring(0, this.state.tsv.title.length - 4)
      window.print()
    }
  }

  getTSV() {
    get(`${this.props.BASE_URL}/api/tsv/${this.state.dairy_id}/${this.state.tsvType}`)
      .then(res => {
        console.log(res)
        if (res[0] && res[0].data) {
          let [aboveHeader, header, dataRows] = this.tsvTextToRows(res[0].data)

          this.setState({
            tsv: res[0],
            aboveHeader: aboveHeader,
            header: header,
            dataRows: dataRows
          })
        }
      })
  }

  tsvTextToRows(tsvText) {
    let dataStarted = false
    let rows = []

    let aboveHeader = []
    let header = []
    let dataRows = []

    let splitText = tsvText.split('\n')
    splitText.forEach((row, i) => {
      // Need a function to extract the cols I need
      let printCols = tsvPrintCols[this.state.tsvType]  // List of ints representing indices to print from TSV
      let cols = row && row.length > 0 ? row.split('\t'): [] // List of all Cols
      
      // Ensure the row has more cols than what is going to be printed
      if(printCols[printCols.length - 1] <= cols.length - 1){
        cols = printCols.map(index => cols[index]) // For each print col index, get the data from the row 
      }
      


      if (dataStarted) {
        dataRows.push(cols)
      } else {
        if (cols[0] === "Start" && !dataStarted) {
          // We only know the row w/ header info is just before the start row.
          header = splitText[Math.max(0, i - 1)].split('\t')
          
          if(printCols[printCols.length - 1] <= header.length - 1){
            header = printCols.map(index => header[index])
          }

          dataStarted = true
        } else if (cols[0].length > 0) {
          aboveHeader.push(cols)
        }
      }
    })
    return [aboveHeader, header, dataRows]
  }


  render() {
    return (
      <Grid container alignItems="center" alignContent="center" align="center" item xs={12} style={{maxWidth: "100%" }} >
        {
          this.state.aboveHeader.length > 0 &&
            this.state.header.length > 0 ?
            <TableContainer component={Paper}>
              <StyledTable size='small'>
                <TableHead>
                  <StyledRow>
                    {
                      this.state.header.map((headerTitle, i) => {
                        return (
                          <StyledHeaderCell align='center' key={`tsvphc${i}`}>
                            <Typography variant="caption">{headerTitle}</Typography>
                          </StyledHeaderCell>
                        )
                      })
                    }
                  </StyledRow>
                </TableHead>
                <TableBody>
                  {this.state.dataRows.length > 0 ?
                    this.state.dataRows.map((row, i) => {
                      return (
                        <TableRow key={`tsvpbr${i}`}>
                          {
                            row.map((cellText, j) => {
                              return (
                                <StyledCell align='center' key={`tsvpbc${i * j + j}`}>
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
                    <TableRow>
                      <TableCell colSpan={this.state.header.length} align="center">No data</TableCell>
                    </TableRow>
                  }
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell align='center' colSpan={this.state.header.length}>
                        <img src={pngLogo()} height={72}/>

                    </TableCell>
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
