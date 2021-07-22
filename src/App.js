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
import HomePage  from "./pages/homePage"

const BackgroundGrid = withStyles(theme =>({
  root:{
    backgroundColor: theme.palette.background.paper,
    position: "absolute",
    minHeight: "100vh",
    maxHeight: "100vh",
    overflowY: "auto"
  }
}))(Grid)

const breakPoints = ['xs', 'sm', 'md', 'lg', 'xl']
let darkTheme = responsiveFontSizes(createTheme(apptheme), breakPoints)

export default class App extends React.Component {
  constructor(props){
    super(props)
    this.state={
      theme: darkTheme,
      alertInfo: {},
      alertOpen: false,
    }
  }

  static getDerivedStateFromProps(props, state){
    return state
  }

  onAlert(alert){
    console.log(alert)
    // this.setState({alertInfo: alert, alertOpen: true})
  }

  onCloseAlert(){
    // this.setState({alertOpen: false, alertInfo: false})
  }

  render(){
    return(
      <BrowserRouter >
      <ThemeProvider theme={this.state.theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <BackgroundGrid container direction="column" alignItems="center">
      <Grid item container xs={12}
        style={{
          minHeight: "100%",
          paddingTop: "8px",
          paddingLeft: "8px",
          paddingRight: "8px"
        }}
      >
        <Paper style={{width: "100%"}}>
        <Switch>
          <Route exact path="/">
            <HomePage
              onAlert={this.onAlert.bind(this)}
            />
          </Route>

          
        </Switch>
        </Paper>
      </Grid>
      </BackgroundGrid>
      </MuiPickersUtilsProvider>
      </ThemeProvider>
      </BrowserRouter>
    )
  }
}