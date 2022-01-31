import { getAuth, sendPasswordResetEmail } from "firebase/auth"
import { Modal, Grid, Paper, Tooltip, IconButton, Typography, Button } from "@material-ui/core"
import { withTheme } from "@material-ui/core/styles"
import { Component, Fragment } from "react"
import CloseIcon from '@material-ui/icons/Close';
import { BASE_URL } from "../../utils/environment"
import { get, post } from '../../utils/requests'

class Accounts extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    componentDidMount() {
        console.log("Mounted")
        this.getAccounts()
    }

    getAccounts() {
        console.log('Getting:: ', `${BASE_URL}/accounts/all`)
        get(`${BASE_URL}/accounts/all`)
            .then(res => {
                console.log(res)
            })
            .catch(err => {
                console.log(err)
            })
        return [{ 'email': 'test' }]
    }


    createUser(email, password) {
        post(`${BASE_URL}/accounts/create`, { email, password })
            .then(res => {
                console.log(res)
            })
            .catch(err => {
                console.log(err)
            })
    }

    registerUser(email, password) {
        post(`${BASE_URL}/accounts/register`, { email, password })
            .then(res => {
                console.log(res)
            })
            .catch(err => {
                console.log(err)
            })
    }

    login(email, password) {
        post(`${BASE_URL}/accounts/login`, { email, password })
            .then(res => {
                if (res.data) {
                    const token = res.data
                    console.log("Storing in local storage", token)
                    localStorage.setItem('jwtToken', token)
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    render() {
        return (
            <Modal
                open={this.props.open}
                onClose={this.props.onClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description">

                <div style={{
                    position: 'absolute',
                    top: "50%",
                    left: "50%",
                    width: "100vw",
                    height: "100vh",
                    transform: "translate(-50%, -50%)",
                }}>
                    <Grid
                        item
                        align="center"
                        xs={12}
                    >
                        <Paper style={{ height: "100vh", justifyContent: "center" }}>
                            <Grid item container xs={12}>
                                <Grid item xs={12} align="right">
                                    <Tooltip title='Close'>
                                        <IconButton color='primary' onClick={() => this.props.onClose()}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant='h6'> Accounts </Typography>
                                    {this.props.open ?
                                        [{ email: 'testEmail' }].map((account, i) => {
                                            return (
                                                <Grid item xs={12} key={`accounts${i}`}>
                                                    {account.email}
                                                </Grid>
                                            )
                                        })
                                        :
                                        <Fragment></Fragment>
                                    }
                                </Grid>
                                <Grid item xs={12}>
                                    <Button onClick={() => this.createUser('testUser2@g.com', 'leet1337')}>CreateUser</Button>
                                    <Button onClick={() => this.registerUser('testUser3@g.com', 'leet1337')}>Register</Button>
                                    <Button onClick={() => this.login('testuser@g.com', 'leet1337')}>Login</Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </div>
            </Modal>
        )
    }
}

export default Accounts = withTheme(Accounts)