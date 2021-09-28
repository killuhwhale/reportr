import { app, FirebaseAuthContext } from "./firebaseConfig"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React from "react";
import {
  Switch, Route, Link, BrowserRouter
} from 'react-router-dom';
import {
  createTheme, withStyles, ThemeProvider, responsiveFontSizes
} from '@material-ui/core/styles';
import {
  Grid, Paper
} from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import apptheme from "./css/apptheme"
import pdftheme from "./css/lightTheme"

import Login from "./pages/login"
import HomePage from "./pages/homePage"
import TSVPrint from "./pages/tsvPrint"

import { TSV_INFO } from "./utils/TSV"




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
      alertInfo: {},
      alertOpen: false,
    }
  }

  static getDerivedStateFromProps(props, state) {
    return state
  }

  componentDidMount(){
    this.listenUser()
  }

  listenUser(){
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user)
        this.setState({user})
      } else {
       console.log("Logged out!")
       this.setState({user: {}})
      }
    });
  }

  onAlert(alert) {
    console.log(alert)
    // this.setState({alertInfo: alert, alertOpen: true})
  }

  onCloseAlert() {
    // this.setState({alertOpen: false, alertInfo: false})
  }
  onLogin(user){
    console.log("App.js onLogin:", user)
    this.setState({user})
  }


  render() {
    return (
        this.state.user && this.state.user.uid?
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
                              onAlert={this.onAlert.bind(this)}
                            />
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