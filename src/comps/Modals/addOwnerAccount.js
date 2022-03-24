import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField, CircularProgress } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';
import { auth } from '../../utils/users'


// Reportrr Management
class AddOwnerAccount extends Component {

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: '',
            passwordConfirm: '',
        }
    }

    componentDidUpdate(prevProps, prevState) {
        console.log("OwnerAccoutn update", this.props.companyID)

    }

    onChange(ev) {
        const { name, value } = ev.target
        this.setState({ [name]: value })
    }

    async createAccount() {
        console.log("Creating account for company: ", this.props.companyID)
        const email = this.state.email
        const password = this.state.password
        const passwordConfirm = this.state.passwordConfirm

        if (password !== passwordConfirm) {
            return
        }
        console.log("Creating account: ", email, password)
        const res = await auth.registerUser(email, password, this.props.companyID)

        if (res.error) {
            console.log(res)
        } else {
            console.log(res)
        }

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
                    width: "80vw",
                    transform: "translate(-50%, -50%)",
                    zIndex: 100
                }}>
                    <Grid
                        item
                        align="center"
                        xs={12}
                    >
                        <Paper style={{ height: "45vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <Grid item container xs={12}>
                                <Grid item xs={12}>
                                    <Typography style={{ marginTop: "32px" }}>
                                        {this.props.modalText} to company {this.props.companyID}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name='email'
                                        value={this.state.email}
                                        onChange={this.onChange.bind(this)}
                                        label="Email"
                                        style={{ width: "75%" }}

                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name='password'
                                        type='password'
                                        value={this.state.password}
                                        onChange={this.onChange.bind(this)}
                                        label="Password"
                                        style={{ width: "75%" }}

                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name='passwordConfirm'
                                        type='password'
                                        value={this.state.passwordConfirm}
                                        onChange={this.onChange.bind(this)}
                                        label="Confirm password"
                                        style={{ width: "75%" }}

                                    />
                                </Grid>

                                <Grid item xs={6}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => { this.props.onClose() }}>
                                        {this.props.cancelText}
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        disabled={this.state.isLoading}
                                        color="primary"
                                        variant="outlined"
                                        onClick={this.createAccount.bind(this)}>
                                        {this.props.actionText}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </div>
            </Modal>

        )
    }

}

export default AddOwnerAccount = withTheme(AddOwnerAccount);