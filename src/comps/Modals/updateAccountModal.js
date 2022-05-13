import { Modal, Grid, Paper, Tooltip, IconButton, Typography, Button, TextField, InputAdornment } from "@material-ui/core"
import { withTheme } from "@material-ui/core/styles"
import { Component } from "react"
import { auth, UserAuth } from '../../utils/users'
import CancelIcon from '@material-ui/icons/Cancel';
import { ROLES } from "../../utils/constants";

class UpdateAccountModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            emailError: '',
            usernameError: '',
            passwordError: '',
            accountInfo: {
                email: props.updateAccount.email ?? '',
                username: props.updateAccount.username ?? '',
                account_type: props.updateAccount.account_type ?? 1,
            }

        }
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.updateAccount !== prevProps.updateAccount) {
            const { username, email, account_type } = this.props.updateAccount
            this.setState({ accountInfo: { email, username, account_type } })
        }
    }

    updateAccount() {
        const { email, username, account_type } = this.state.accountInfo
        const { email: oldEmail, username: oldUsername, pk, account_type: old_account_type } = this.props.updateAccount

        const user = {
            username, email, pk, account_type, company_id: auth.currentUser.company_id
        }

        if (email !== oldEmail || username !== oldUsername || account_type !== old_account_type) {
            UserAuth.updateAccount(user)
                .then(res => {
                    if (auth.currentUser.account_type === ROLES.ADMIN) {
                        this.props.getAccounts()
                    } else {
                        auth.getUserByToken()
                    }
                    this.props.onClose()
                })
                .catch(err => {
                    console.log(err)
                })
        } else {
            console.log("Not updating")

        }
    }


    onChange(ev) {
        const { name, value } = ev.target
        const accountInfo = this.state.accountInfo
        accountInfo[name] = value
        this.setState({ accountInfo })
    }

    resetEmail() {
        const { email } = this.props.updateAccount
        const accountInfo = this.state.accountInfo
        accountInfo['email'] = email
        this.setState({ accountInfo })
    }

    resetUsername() {
        const { username } = this.props.updateAccount
        const accountInfo = this.state.accountInfo
        accountInfo['username'] = username
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
                                    <Typography variant="h6" style={{ marginTop: "32px" }}>
                                        Update Account {this.state.accountInfo.email}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} style={{ marginTop: '32px' }}>
                                    <TextField
                                        label='Username'
                                        value={this.state.accountInfo.username}
                                        error={this.state.usernameError !== ''}
                                        helperText={this.state.usernameError}
                                        name='username'
                                        type='text'
                                        style={{ width: '50%', marginTop: '12px' }}
                                        onChange={this.onChange.bind(this)}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position='end'>
                                                    <Tooltip title='Reset'>
                                                        <IconButton
                                                            onClick={() => this.resetUsername()}
                                                        >
                                                            <CancelIcon color='secondary' />
                                                        </IconButton>
                                                    </Tooltip>
                                                </InputAdornment>
                                            ),
                                        }}

                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Email'
                                        value={this.state.accountInfo.email}
                                        error={this.state.emailError !== ''}
                                        helperText={this.state.emailError}
                                        name='email'
                                        type='text'
                                        style={{ width: '50%', marginTop: '12px' }}
                                        onChange={this.onChange.bind(this)}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position='end'>
                                                    <Tooltip title='Reset'>
                                                        <IconButton
                                                            onClick={() => this.resetEmail()}
                                                        >
                                                            <CancelIcon color='secondary' />
                                                        </IconButton>
                                                    </Tooltip>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField select
                                        label='Access Level'
                                        value={this.state.accountInfo.account_type ?? 1}
                                        name='account_type'
                                        defaultValue={ROLES[ROLES.READ]}
                                        type='text'
                                        onChange={this.onChange.bind(this)}
                                        style={{ width: '50%', marginTop: '12px' }}
                                        SelectProps={{
                                            native: true,
                                        }}
                                    >
                                        {
                                            Object.keys(ROLES).filter(role => ROLES[role] <= ROLES.ADMIN).map(role => {
                                                return (
                                                    <option value={ROLES[role]} key={`key_${role}`}>
                                                        {role}
                                                    </option>
                                                )
                                            })
                                        }
                                    </TextField>
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
                                            onClick={this.updateAccount.bind(this)}>
                                            Update
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

export default UpdateAccountModal = withTheme(UpdateAccountModal)