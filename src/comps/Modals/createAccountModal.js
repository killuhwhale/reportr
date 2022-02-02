import { Modal, Grid, Paper, Tooltip, IconButton, Typography, Button, Card, CardContent, CardActionArea, CardActions, TextField } from "@material-ui/core"
import { withTheme } from "@material-ui/core/styles"
import { Component, Fragment } from "react"
import { auth, UserAuth } from '../../utils/users'

class CreateAccountModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            emailError: '',
            usernameError: '',
            passwordError: '',

            accountInfo: {
                email: '',
                username: '',
                password1: '',
                password2: ''
            }
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState, aaaa) {

    }

    createAccount() {
        const { email, username, password1, password2 } = this.state.accountInfo
        console.log(email)
        if (!email) {
            this.setState({ emailError: 'Invalid email', passwordError: '' })
            return
        } else if (password1 !== password2) {
            this.setState({ emailError: '', passwordError: 'Passwords do not match' })
            return
        }
        this.setState({ emailError: '', passwordError: '' })

        const newUser = {
            email, username, password: password1
        }
        UserAuth.createUser(newUser)
            .then(res => {
                if (!res.error) {
                    this.props.getAccounts()
                } else {
                    console.log(res.error)
                    if (res.error.code === "23505") {
                        this.setState({ emailError: 'Email already exists', passwordError: '' })
                    } else if (res.error.code === "23514") {
                        this.setState({ emailError: 'Invalid Email', passwordError: '' })
                    }
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    onChange(ev) {
        const { name, value } = ev.target
        const accountInfo = this.state.accountInfo
        accountInfo[name] = value
        this.setState({ accountInfo })
    }

    render() {
        return (
            <Modal open={this.props.open} onClose={this.props.onClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description">
                <div style={{
                    position: 'absolute',
                    top: "50%",
                    left: "50%",
                    width: "85vw",
                    height: "50vh",
                    transform: "translate(-50%, -50%)",
                }}>
                    <Grid item align="center" xs={12}>
                        <Paper style={{ height: "50vh", justifyContent: "center" }}>
                            <Grid item container xs={12}>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Username'
                                        value={this.state.username}
                                        error={this.state.usernameError !== ''}
                                        helperText={this.state.usernameError}
                                        name='username'
                                        type='text'
                                        onChange={this.onChange.bind(this)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Email'
                                        value={this.state.email}
                                        error={this.state.emailError !== ''}
                                        helperText={this.state.emailError}
                                        name='email'
                                        type='text'
                                        onChange={this.onChange.bind(this)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        autoComplete="new-password"
                                        label='Password'
                                        value={this.state.password}
                                        error={this.state.passwordError !== ''}
                                        helperText={this.state.passwordError}
                                        name='password1'
                                        type='password'
                                        onChange={this.onChange.bind(this)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Confirm password'
                                        value={this.state.password}
                                        name='password2'
                                        type='password'
                                        onChange={this.onChange.bind(this)}
                                    />
                                </Grid>

                                <Grid item container xs={12} style={{ marginTop: '32px' }}>
                                    <Grid item xs={6}>
                                        <Button color='secondary' variant='contained'
                                            onClick={this.props.onClose}>
                                            Cancel
                                        </Button>

                                    </Grid>
                                    <Grid item xs={6}>
                                        <Button color="primary" variant='contained'
                                            onClick={this.createAccount.bind(this)}>
                                            Create
                                        </Button>

                                    </Grid>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </div>
            </Modal>
        )
    }
}

export default CreateAccountModal = withTheme(CreateAccountModal)