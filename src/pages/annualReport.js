import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, IconButton, Tooltip, TextField, TableHead, TableBody, Table, TableContainer, TableCell, TableRow
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

const OwnOperators = [
  {
    is_owner: false,
    title: "John da Farmer",
    is_repsponsible: false
  },
  {
    is_owner: true,
    title: "Bently the owner",
    is_repsponsible: false
  },
]

const OwnerOperatorHeaderGrid = withStyles(theme => ({
  root: {
    backgroundColor: 'darkslategray',
    padding: "6px"

  }
}))(Grid)

const HerdInfoTCHeader = withStyles(theme => ({
  root: {
    border: "1px solid white",
    backgroundColor: "grey"

  }
}))(TableCell)
const HerdInfoTCBody = withStyles(theme => ({
  root: {
    border: "1px solid white"

  }
}))(TableCell)

const OwnerOperatorBodyGrid = withStyles(theme => ({
  root: {
    border: "2px solid darkslategray"
  }
}))(Grid)



const OwnerOperator = withTheme((props) => {
  const ownOperatorTitleLabel = props.info.is_owner ? `Legal owner name:` : `Operator name:`
  const isResponsible = props.info.is_repsponsible ? '' : 'not '
  const permitFeesLabel = `The ${props.info.is_owner ? "owner" : "operator"} is ${isResponsible}responsible for paying permit fees`

  return (
    <Grid item xs={12} style={{ marginBottom: "16px", marginLeft: "10px" }}>
      <OwnerOperatorHeaderGrid item xs={12} name="header">
        {props.info.title}
      </OwnerOperatorHeaderGrid>
      <OwnerOperatorBodyGrid item xs={12} name="box">
        <Grid item container xs={12} name="row1" style={{ padding: "5px" }}>
          <Grid item container xs={8}>
            <Grid item xs={2} align="center">
              <Typography variant="caption">
                {ownOperatorTitleLabel}
              </Typography>
            </Grid>

            <Grid item xs={10}>
              <TextField disabled
                value={props.info.title}
                fullWidth
                style={{ width: "100%" }}
              />
            </Grid>
          </Grid>

          <Grid item container xs={4}>
            <Grid item xs={3}>
              <Typography variant="caption">
                Telephone no.:
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <TextField disabled
                value="209-607-9722"
                helperText="Cellular"
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField disabled
                value=""
                helperText="Landline"
                fullWidth
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item container xs={12} name="row2" style={{ padding: "5px" }}>
          <Grid item xs={6}>
            <TextField disabled
              value="P.O. Box 1029"
              helperText="Mailing Address Number and Street"
              fullWidth
            />
          </Grid>

          <Grid item xs={3}>
            <TextField disabled
              value="Hilmar"
              helperText="City"
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <TextField disabled
              value="CA"
              helperText="State"
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <TextField disabled
              value="95423"
              helperText="Zip Code"
              fullWidth
            />
          </Grid>

        </Grid>
        <Grid item xs={12} name="row3" style={{ padding: "5px" }}>
          {permitFeesLabel}
        </Grid>
      </OwnerOperatorBodyGrid>
    </Grid>
  )
})


const HerdInformation = withTheme((props) => {
  return (
    <Grid item xs={10} style={{marginBottom: "16px"}}>
      <Grid item xs={12}>
        <Typography>
          A. Herd Information
        </Typography>
      </Grid>
      <Grid item xs={12} style={{marginLeft: "16px"}}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <HerdInfoTCBody></HerdInfoTCBody>
                <HerdInfoTCHeader>Milk Cows</HerdInfoTCHeader>
                <HerdInfoTCHeader>Dry Cows</HerdInfoTCHeader>
                <HerdInfoTCHeader>Bred Heifers (15-24 mo.)</HerdInfoTCHeader>
                <HerdInfoTCHeader>Calves (4-6 mo.)</HerdInfoTCHeader>
                <HerdInfoTCHeader>Calves (0-3 mo.</HerdInfoTCHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow align="right">
                <HerdInfoTCBody>
                  Number open confinement
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>

              </TableRow>

              <TableRow>
                <HerdInfoTCBody>
                  Number under roof
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>

              </TableRow>
              <TableRow>
                <HerdInfoTCBody>
                  Maximum Number
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>

              </TableRow>
              <TableRow>
                <HerdInfoTCBody>
                  Average Number
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>

              </TableRow>
              <TableRow>
                <HerdInfoTCBody>
                  Average Live Weight
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCBody align="right">
                  0
                </HerdInfoTCBody>
                <HerdInfoTCHeader></HerdInfoTCHeader>
                <HerdInfoTCHeader></HerdInfoTCHeader>

              </TableRow>

            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item container xs={12}>
        <Grid item xs={3}>
          <Typography variant="caption"> Predominant milk cow breed:</Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField disabled
            value="Holstein"
            style={{ width: "100%" }}
          />
        </Grid>
      </Grid>
      <Grid item container alignContent="center" alignItems='center' xs={12}>
        <Grid item xs={3}>
          <Typography variant="caption">Average milk production:</Typography>
        </Grid>
        <Grid item xs={2}>
          <TextField disabled
            align="right"
            value="75"
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={3} alignItems="flex-end">
          <Typography variant="caption">pounds per cow per day</Typography>
        </Grid>
      </Grid>

    </Grid>
  )
})

// const CropsAndHarvests = withTheme((props) => {
//   return(

//   )
// })

const ManureGenerated = withTheme((props) => {
  return (
    <Grid item container xs={12} style={{marginBottom: "16px"}}>
      <Grid item xs={12}>
        <Typography> B. Manure Generated</Typography>
      </Grid>
      <Grid item container xs={12} style={{marginLeft:"16px"}}>

        <Grid item container xs={6}>
          <Grid item xs={5}>
            <Typography variant="caption">Total Manure Excreted by the herd</Typography>
          </Grid>
          <Grid item xs={3}>
            <TextField
              value="70,026.15"
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption">tons per reporting period</Typography>
          </Grid>
        </Grid><Grid item xs={6}></Grid>

        <Grid item container xs={6}>
          <Grid item xs={5}>
            <Typography variant="caption">Total Nitrogen from manure</Typography>
          </Grid>
          <Grid item xs={3}>
            <TextField
              value="881,742.55"
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption">lbs reporting period</Typography>
          </Grid>
        </Grid>

        <Grid item container xs={6}>
          <Grid item xs={5}>
            <Typography variant="caption">After Ammonia losses(30% applied)</Typography>
          </Grid>
          <Grid item xs={3}>
            <TextField
              value="617,219.79"
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption">lbs reporting period</Typography>
          </Grid>
        </Grid>

        <Grid item container xs={6}>
          <Grid item xs={5}>
            <Typography variant="caption">Total phosphorus from manure</Typography>
          </Grid>
          <Grid item xs={3}>
            <TextField
              value="881,742.55"
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption">tons lbs reporting period</Typography>
          </Grid>
        </Grid><Grid item xs={6}></Grid>

        <Grid item container xs={6}>
          <Grid item xs={5}>
            <Typography variant="caption">Total potassium from manure</Typography>
          </Grid>
          <Grid item xs={3}>
            <TextField
              value="881,742.55"
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption">tons lbs reporting period</Typography>
          </Grid>
        </Grid><Grid item xs={6}></Grid>

        <Grid item container xs={6}>
          <Grid item xs={5}>
            <Typography variant="caption">Total salt from manure</Typography>
          </Grid>
          <Grid item xs={3}>
            <TextField
              value="881,742.55"
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption">tons lbs reporting period</Typography>
          </Grid>
        </Grid><Grid item xs={6}></Grid>
      </Grid>



    </Grid>
  )
})

class AnnualReportPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dairy_id: props.dairy_id,
    }
  }

  static getDerivedStateFromProps(props, state) {
    return state
  }

  componentDidMount() {
    this.getDairyAnnualReportInfo()
  }

  getDairyAnnualReportInfo() {
    console.log("Getting Annual report info")
    console.log("Getting Dairy Info")
    console.log("Getting Owners and Operators")

  }


  render() {
    return (
      <Grid container direction="row" item xs={12} spacing={2}>
        <Grid item container xs={12} id="A" justifyContent="flex-end" alignItems="flex-end">
          <Grid item xs={3}>
            <Typography variant="subtitle2">
              A. NAME OF DAIRY OR BUSINESS OPERATING THE DAIRY:
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <TextField disabled
              value="Da Farm"
              fullWidth
            />
          </Grid>

          <Grid item xs={6} align="left">
            <TextField disabled
              value="20723 Geer RD"
              label="Physical address of dairy"
              helperText="Number and Street"
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <TextField disabled
              value="Hilmar"
              helperText="City"
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <TextField disabled
              value="Merced"
              helperText="County"
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <TextField disabled
              value="95324"
              helperText="Zip Code"
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <Typography variant="caption">
              Street and nearest cross street (if no address):
            </Typography>
          </Grid>
          <Grid item xs={10}>
            <TextField disabled
              value=""
              fullWidth
            />
          </Grid>

          <Grid item xs={2}>
            <Typography variant="caption">
              Date facility was originally placed in operation:
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <TextField disabled
              value="01/01/1921"
              fullWidth
            />
          </Grid>
          <Grid item xs={8}></Grid>

          <Grid item xs={3}>
            <Typography variant="caption">
              Regional Water Quality Control Board Basin Plan designation:
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <TextField disabled
              value="San Joaquin River Basin"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}></Grid>

          <Grid item xs={12}>
            <Typography variant="caption">
              County Assessor Parcel Number(s) for dairy facility:
            </Typography>
          </Grid>
          <Grid item container xs={12} style={{ marginLeft: "10px" }}>
            {
              PARCELS.map((parcel, i) => {
                return (
                  <Grid item xs={2}>
                    <Typography variant="caption">
                      {parcel}
                    </Typography>
                  </Grid>
                )
              })
            }
          </Grid>

        </Grid>
        <Grid item container xs={12} id="A" justifyContent="flex-end" alignItems="flex-end">
          <Grid item xs={12}>
            <Typography variant="subtitle2">
              B. OPERATORS
            </Typography>
          </Grid>
          <Grid item container xs={12}>
            {
              OwnOperators.map((ownOperator, i) => {
                return (
                  <OwnerOperator key={`aroo${i}`}
                    info={ownOperator}
                  />
                )
              })
            }
          </Grid>
          <Grid item xs={12}>
            <HerdInformation />
          </Grid>
          <Grid item xs={12}>
            <ManureGenerated />
          </Grid>







        </Grid>

      </Grid>
    )
  }
}

export default AnnualReportPage = withRouter(withTheme(AnnualReportPage))
