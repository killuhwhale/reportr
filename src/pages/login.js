import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

import React, { Component } from 'react'
import {
  Grid, Paper, Button, Typography, TextField
} from '@material-ui/core'
import { withTheme } from '@material-ui/core/styles'



class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loggingIn: true,
      //username
      usernameHelperTxt: '',
      usernameError: false,
      //password
      passwordHelperTxt: '',
      passwordError: false,

      registerInfo: {
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
      },
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }
  toggleLoggingIn(val) {
    this.setState({ loggingIn: val })
  }

  handleLoginSubmit(ev) {
    let email = document.getElementById('email')
    let pass1 = document.getElementById('password')

    signInWithEmailAndPassword(getAuth(), email.value, pass1.value)
      .then(res => {
        console.log(res.user)
        this.props.onLogin(res.user)

      })
      .catch((error) => {
        if(error.code === 'auth/wrong-password'){
          console.log("Wrong password")
          this.setState({
            passwordError: true, passwordHelperTxt: 'Wrong password',
            usernameError: false, usernameHelperTxt: ''
          })
        }else if(error.code === 'auth/user-not-found'){
          this.setState({
            usernameError: true, usernameHelperTxt: 'Email not found.',
            passwordError: false, passwordHelperTxt: ''
          })
        }else if(error.code === 'auth/invalid-email'){
          this.setState({
            usernameError: true, usernameHelperTxt: 'Invalid email.',
            passwordError: false, passwordHelperTxt: ''
          })
        }else if(error.code === ''){
          console.log(error)
          this.setState({
            passwordError: true, passwordHelperTxt: 'Error signing in.',
            usernameError: false, usernameHelperTxt: ''
          })
        }
      });
  }

  onChange(ev) {
    const { name, value } = ev.target
    const registerInfo = this.state.registerInfo
    registerInfo[name] = value
    this.setState({ registerInfo })
  }

  /* Register */
  handleSubmit(ev) {
    
    let email = this.state.registerInfo.email
    let pass1 = this.state.registerInfo.password
    let pass2 = this.state.registerInfo.passwordConfirm

    console.log(email, pass1, pass2)
    if (pass1 !== pass2) {
      this.props.onAlert({
        type: "error",
        message: "Passwords do not match"
      })
    } else if (!email) {
      this.props.onAlert({
        type: "error",
        message: "Missing E-mail"
      })
    } else if (pass1 === pass2 && email) {
      createUserWithEmailAndPassword(getAuth(), email, pass1)
        .then(res => {
          console.log(res.user)
          this.props.onLogin(res.user)
        })
        .catch(err => {
          console.log(err)
        })
    } else {
      console.log("Error logging in?")
    }
  }


  render() {
    return (
      <Grid item container xs={12} id="login" align="center" justifyContent="center">

        {
          this.state.loggingIn ?


            <Grid item xs={12} >
              <Paper style={{ height: '100vh', width: '100vw' }}>

                <Grid item container xs={12} align="center" style={{paddingTop: '25vh'}}>
                  <Grid item xs={12}>
                    <Typography variant="h2">
                      Login
                    </Typography>
                  </Grid>
                  <Grid item xs={4}></Grid>
                  <Grid item xs={4}>
                    <TextField
                      id="email"
                      fullWidth
                      error={this.state.usernameError}
                      helperText={this.state.usernameHelperTxt}
                      style={{ margin: 8 }}
                      label="Email"
                      margin="normal"
                    />
                  </Grid><Grid item xs={4}></Grid>
                  <Grid item xs={4}></Grid>
                  <Grid item xs={4}>
                    <TextField
                      id="password"
                      type="password"
                      fullWidth
                      error={this.state.passwordError}
                      helperText={this.state.passwordHelperTxt}
                      style={{ margin: 8 }}
                      label="Password"
                      margin="normal"
                    />
                  </Grid><Grid item xs={4}></Grid>

                </Grid>



                <Grid item container xs={12} align="center"  spacing={4} style={{marginTop: '32px'}}>
                  {/* <Grid item align='right' xs={6}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => this.toggleLoggingIn(false)}>
                      Register
                    </Button>
                  </Grid> */}
                  <Grid item align='center' xs={12}>
                    <Button style={{marginLeft: '4px'}}
                      variant="outlined"
                      color="primary"
                      onClick={this.handleLoginSubmit.bind(this)}>
                      Login
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            :


            <Grid item xs={12} >
              <Paper style={{ height: '100vh', width: '100vw' }}>

                <Grid item container xs={12} align="center">
                  <Grid item xs={12}>
                    <Typography variant="h4">
                      Register
                    </Typography>
                  </Grid>
                 


                  <Grid item xs={12}>
                    <TextField
                      name="email"
                      type="email"
                      onChange={this.onChange.bind(this)}
                      value={this.state.registerInfo.email}
                      style={{ margin: 8 }}
                      label="Email"
                      margin="normal"

                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="password"
                      type="password"
                      onChange={this.onChange.bind(this)}
                      value={this.state.registerInfo.password}
                      style={{ margin: 8 }}
                      label="Password"
                      margin="normal"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="passwordConfirm"
                      type="password"
                      style={{ margin: 8 }}
                      label="Confirm Password"
                      margin="normal"
                      onChange={this.onChange.bind(this)}
                      value={this.state.registerInfo.passwordConfirm}
                    />
                  </Grid>

                 

                  <Grid item container xs={12} spacing={4} style={{marginTop: '32px'}}>
                    <Grid item xs={6} align='right'>
                      <Button variant="outlined" color="secondary"
                         onClick={() => this.toggleLoggingIn(true)}>
                        Login
                      </Button>
                    </Grid>
                    <Grid item xs={6} align='left' >
                      <Button variant="outlined" style={{marginLeft: '4px'}} color="primary" onClick={this.handleSubmit.bind(this)}>
                        Submit
                      </Button>
                    </Grid>
                  </Grid>

                </Grid>

              </Paper>
            </Grid>




        }


      </Grid>
    )
  }
}

export default Login = withTheme(Login)
