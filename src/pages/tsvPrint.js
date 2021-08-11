import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField,
  TableHead, TableBody, Table, TableContainer, TableCell, TableRow, TableFooter
} from '@material-ui/core'
import { withRouter } from "react-router-dom"
import { withTheme, withStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import { get, post, uploadFiles } from "../utils/requests"
import "../App.css"

const BASE_URL = "http://localhost:3001"
const PARCELS = ["0045-0200-0012-0000", "0045-0200-0020-0000", "0045-0200-0023-0000", "0045-0200-0029-0000", "0045-0200-0033-0000",
  "0045-0200-0034-0000", "0045-0200-0035-0000", "0045-0200-0037-0000", "0045-0200-0060-0000", "0045-0200-0061-0000", "0045-0200-0074-0000", "0045-0230-0025-0000",
  "0045-0230-0066-0000", "0045-0240-0037-0000"]


const StyledTable = withStyles(theme => ({
  root: {
    padding: "0px",
    maxWidth: "100%",
  }
}))(Table)

const StyledRow = withStyles(theme => ({
  root: {
    padding: "0px",
    backgroundColor: '#eeeeee'
  }
}))(TableRow)

const StyledCell = withStyles(theme => ({
  root: {
    padding: "1px",
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

  componentDidUpdate(){
    console.log("HEADER length SHOULD PRINT?", this.state.header.length)
    if(this.state.header.length > 0){
      window.focus()
      window.document.title = this.state.tsv.title.substring(0, this.state.tsv.title.length - 4 )
      window.print()
    }
  }

  getTSV() {
    get(`${BASE_URL}/api/tsv/${this.state.dairy_id}/${this.state.tsvType}`)
      .then(res => {
        console.log(res)
        if (res[0] && res[0].data) {
          let [aboveHeader, header, dataRows] = this.tsvTextToRows(res[0].data)
          console.log("TSV Rows: ", aboveHeader, header, dataRows)

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
      let cols = row.split('\t').slice(0, this.state.numCols)
      if (dataStarted) {
        dataRows.push(cols)
      } else {
        if (cols[0] === "Start" && !dataStarted) {
          header = splitText[Math.max(0, i - 1)].split('\t').slice(0, this.state.numCols)
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
      <Grid container alignItems="center" alignContent="center" align="center" item xs={12} style={{ paddingTop: "16px", maxWidth: "100%" }} >
        
        {
          this.state.aboveHeader.length > 0 &&
          this.state.header.length > 0 ?
          
          <StyledTable size='small'>
                
                <TableHead>
                  <StyledRow>
                    {
                      this.state.header.map((headerTitle, i) => {
                        return (
                          <StyledCell key={`tsvphc${i}`}>
                            <Typography variant="caption">{headerTitle}</Typography>
                          </StyledCell>
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
                                <StyledCell key={`tsvpbc${i * j + j}`}>
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
               
              </StyledTable>
            

            :
            <React.Fragment>No data for TSV</React.Fragment>
        }
      </Grid>
    )
  }
}

export default TSVPrint = withRouter(withTheme(TSVPrint))
