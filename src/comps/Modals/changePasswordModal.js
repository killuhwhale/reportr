import { Modal, Grid, Paper, Typography, Button, TextField } from "@material-ui/core"
import { withTheme } from "@material-ui/core/styles"
import { Component } from "react"
import { auth, UserAuth } from '../../utils/users'

class ChangePasswordModal extends Component {

    // Given an account, change the password for it.
    // Owner accounts: Serveer will ignore the currentPassword (owner can put anything in the currentpassword field.)
    // User must provide currentPassword
    constructor(props) {
        super(props)
        this.state = {
            currentPasswordError: '',
            newPasswordError: '',
            confirmPasswordError: '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',

        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState, aaaa) {

    }

    changePassword() {
        const { currentPassword, newPassword, confirmPassword } = this.state
        const { pk } = this.props.account

        if (!currentPassword) {
            this.setState({ currentPasswordError: 'Invalid password', newPasswordError: '', confirmPasswordError: '' })
            return
        } else if (newPassword !== confirmPassword) {
            this.setState({ currentPasswordError: 'Invalid password', newPasswordError: 'Passwords do not match', confirmPasswordError: '' })
            return
        }
        this.setState({ currentPasswordError: '', newPasswordError: '', confirmPasswordError: '' })

        const changePasswordData = {
            currentPassword, newPassword, pk, company_id: auth.currentUser.company_id
        }


        UserAuth.changePassword(changePasswordData)
            .then(res => {
                if (!res.error) {
                    this.props.onClose()
                    this.props.onAlert('Password changed', 'success')
                } else {
                    console.log(res.error)
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    onChange(ev) {
        const { name, value } = ev.target
        this.setState({ [name]: value })
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
                                <Grid item xs={12} style={{ marginTop: '32px' }}>
                                    <Typography variant="h6">Change password for {this.props.account.email}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Current Password'
                                        value={this.state.currentPassword}
                                        error={this.state.currentPasswordError !== ''}
                                        helperText={this.state.currentPasswordError}
                                        name='currentPassword'
                                        type='password'
                                        onChange={this.onChange.bind(this)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label='New Password'
                                        value={this.state.newPassword}
                                        error={this.state.newPasswordError !== ''}
                                        helperText={this.state.newPasswordError}
                                        name='newPassword'
                                        type='password'
                                        onChange={this.onChange.bind(this)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Confirm Password'
                                        value={this.state.confirmPassword}
                                        error={this.state.confirmPasswordError !== ''}
                                        helperText={this.state.confirmPasswordError}
                                        name='confirmPassword'
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
                                            onClick={this.changePassword.bind(this)}>
                                            Change Password
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

export default ChangePasswordModal = withTheme(ChangePasswordModal)