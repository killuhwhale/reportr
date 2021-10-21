import { app, FirebaseAuthContext } from "./firebaseConfig"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React from "react";
import {
  Switch, Route, Link, BrowserRouter
} from 'react-router-dom';
import {
  createTheme, withStyles, withTheme, ThemeProvider, responsiveFontSizes
} from '@material-ui/core/styles';
import {
  Grid, IconButton, Paper, Typography, ClickAwayListener
} from '@material-ui/core';


import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import CloseIcon from '@material-ui/icons/Close';
import apptheme from "./css/apptheme"
import pdftheme from "./css/lightTheme"

import Login from "./pages/login"
import HomePage from "./pages/homePage"
import TSVPrint from "./pages/tsvPrint"

import { TSV_INFO } from "./utils/TSV"


const isProd = window.location.hostname !== 'localhost'
const BASE_URL = isProd ? 'https://reportr-paai9.ondigitalocean.app' : 'http://localhost:3001'


const AlertGrid = withStyles(theme => ({
  root: {
    position: "fixed",
    top: 0,
    display: 'flex', // make us of Flexbox
    alignItems: 'center', // does vertically center the desired content
    justifyContent: 'center', // horizontally centers single line items
    textAlign: 'center',
    width: '98vw',

  }
}))(Grid)

const GreenGrid = withStyles(theme => ({
  root: {
    backgroundColor: '#f4f9f6',
    border: '3px solid #0aa653',
    borderRadius: '8px',
    marginTop: '64px',
    color: '#0aa653',
    minHeight: '75px',
  }
}))(Grid)

const RedGrid = withStyles(theme => ({
  root: {
    backgroundColor: '#f9f4f4',
    border: '3px solid #a60a0a',
    borderRadius: '8px',
    marginTop: '64px',
    color: '#a60a0a',
    minHeight: '75px',
  }
}))(Grid)


const SeverityAlert = withTheme((props) => {
  const Inner = () => {
    return (
      <Grid item container justifyContent='center' alignItems='center' xs={12}>
        <Grid item xs={10}>
          <Typography variant='h6'>
            {props.msg}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <IconButton onClick={props.onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
    )
  }


  return (
    <ClickAwayListener onClickAway={props.onClose}>
      <AlertGrid item xs={12}>
        <Grid item xs={3}></Grid>
        <Grid item xs={6}>
          {
            props.severity === 'success' ?
              <GreenGrid item container xs={12}>
                <Inner props={props} />
              </GreenGrid>

              :
              <RedGrid item container xs={12}>
                <Inner props={props} />
              </RedGrid>
          }
        </Grid>
        <Grid item xs={3}></Grid>
      </AlertGrid>
    </ClickAwayListener>
  )
})

const BackgroundGrid = withStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    position: "absolute",
    minHeight: "100vh",
    maxHeight: "100vh",
    overflowY: "auto"
  }
}))(Grid)

const breakPoints = ['xs', 'sm', 'md', 'lg', 'xl']
let darkTheme = responsiveFontSizes(createTheme(apptheme), breakPoints)
let pdfTheme = responsiveFontSizes(createTheme(pdftheme), breakPoints)

const auth = getAuth();


export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {},
      theme: darkTheme,
      showAlert: false,
      alertSeverity: '',
      alertMsg: '',
    }
  }

  static getDerivedStateFromProps(props, state) {
    return state
  }

  componentDidMount() {
    this.listenUser()
    this.delayedClose()
  }


  listenUser() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.setState({ user })
      } else {
        console.log("Logged out!")
        this.setState({ user: {} })
      }
    });
  }

  onAlert(alertMsg, alertSeverity) {
    this.setState({ alertMsg: alertMsg, alertSeverity: alertSeverity, showAlert: true })
    this.delayedClose()
  }

  delayedClose() {
    new Promise(resolve => setTimeout(resolve, 2100))
      .then(() => {
        this.onCloseAlert()
      })
  }
  onCloseAlert() {
    this.setState({ showAlert: false })
  }

  onLogin(user) {
    console.log("App.js onLogin:", user)
    this.setState({ user })
  }


  render() {
    return (
      this.state.user && this.state.user.uid ?
        <FirebaseAuthContext.Provider value={app}>
          <BrowserRouter >
            <ThemeProvider theme={this.state.theme}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Switch>
                  <Route exact path="/">
                    <BackgroundGrid container direction="column" alignItems="center">
                      <Grid item container xs={12}
                        style={{
                          minHeight: "100%",
                          paddingTop: "8px",
                          paddingLeft: "8px",
                          paddingRight: "8px"
                        }}
                      >
                        <Paper style={{ minWidth: "100%" }}>
                          <HomePage
                            user={this.state.user}
                            BASE_URL={BASE_URL}
                            onAlert={this.onAlert.bind(this)}
                          />
                          {
                            this.state.showAlert ?
                              <SeverityAlert
                                onClose={this.onCloseAlert.bind(this)}
                                severity={this.state.alertSeverity}
                                msg={this.state.alertMsg} />
                              :
                              <React.Fragment></React.Fragment>

                          }
                        </Paper>
                      </Grid>
                    </BackgroundGrid>
                  </Route>

                  <Route path="/tsv/:dairy_id/:tsvType"
                    render={props => {
                      return (
                        <ThemeProvider theme={pdfTheme}>
                          <TSVPrint
                            dairy_id={props.match.params.dairy_id}
                            tsvType={props.match.params.tsvType}
                            numCols={TSV_INFO[props.match.params.tsvType].numCols}
                            BASE_URL={BASE_URL}
                            onAlert={this.onAlert.bind(this)} />
                        </ThemeProvider>
                      )
                    }
                    }
                  />
                </Switch>



              </MuiPickersUtilsProvider>
            </ThemeProvider>
          </BrowserRouter>
        </FirebaseAuthContext.Provider>
        :
        <ThemeProvider theme={this.state.theme}>
          <Login
            onLogin={this.onLogin.bind(this)}
          />
        </ThemeProvider>
    )
  }
}