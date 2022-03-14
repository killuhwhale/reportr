import { Modal, Grid, Paper, Tooltip, IconButton, Typography, Button, Card, CardContent, CardActionArea, CardActions } from "@material-ui/core"
import { withTheme } from "@material-ui/core/styles"
import { Component, Fragment } from "react"
import CloseIcon from '@material-ui/icons/Close';
import { auth, UserAuth } from '../../utils/users'
import Delete from "@material-ui/icons/Delete";
import LockOpenIcon from '@material-ui/icons/LockOpen';
import AddIcon from '@material-ui/icons/Add';
import { naturalSortBy } from "../../utils/format";
import CreateAccountModal from '../Modals/createAccountModal'
import UpdateAccountModal from '../Modals/updateAccountModal'
import UpdateIcon from '@material-ui/icons/Update';
import ChangePasswordModal from '../Modals/changePasswordModal'
import ActionCancelModal from '../Modals/actionCancelModal'


const AccountRow = (props) => {
    const account = props.account
    return (
        <Grid item xs={3} className='showOnHoverParent'>
            <Card variant="outlined">
                <CardContent>
                    <Grid item xs={12} align='right'>
                        <Typography variant='caption'>{account.account_type === 0 ? "Owner" : "Emp"} </Typography>
                    </Grid>
                    <Grid item xs={12} align='center'>
                        <Typography variant='caption'>{account.email} </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant='caption'> {account.username ? account.username : 'No username'} </Typography>
                    </Grid>
                </CardContent>

                <CardActions >
                    <Grid item container xs={12} className='showOnHover'>
                        <Grid item xs={4} align='left'>
                            <Tooltip title='Update account'>
                                <IconButton color='primary' onClick={() => props.onUpdateAccount(account)} size='small'>
                                    <UpdateIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={4} align='center'>
                            <Tooltip title='Change password'>
                                <IconButton color='primary' onClick={() => props.onChangePassword(account)} size='small'>
                                    <LockOpenIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={4} align='right'>
                            <Tooltip title='Delete Account'>
                                <IconButton onClick={() => props.onDeleteAccount(account)} size='small'>
                                    <Delete color='error' />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </CardActions>

            </Card>

        </Grid>
    )
}

class Accounts extends Component {
    constructor(props) {
        super(props)
        this.state = {
            allAccounts: [],
            allAccountInvoked: false,
            showAccountModal: false,
            showUpdateAccountModal: false,
            showChangePasswordModal: false,
            showConfirmDeleteAccountModal: false,
            deletedAccount: {},
            updateAccount: {},
            changePasswordAccount: {},
        }
    }

    componentDidMount() {
        auth.onAuthStateChange((user) => {
            // console.log("Test user: ", user)
        })
    }

    componentDidUpdate(prevProps, prevState, aaaa) {
        if (!this.state.allAccountInvoked && this.props.open) {
            this.getAccounts()
        }
    }

    getAccounts() {
        const company_id = auth.currentUser.company_id
        console.log("GEtting all accounts for comp id: ", company_id)
        UserAuth.getAllAccounts(company_id)
            .then(res => {
                console.log(res)
                if (res.data) {
                    const { data: users } = res
                    console.log("Settings users: ", users)
                    this.setState({ allAccounts: users, allAccountInvoked: true })
                } else {
                    this.setState({ allAccountInvoked: true })
                }
            })
            .catch(err => {
                console.log(err)
                this.setState({ allAccountInvoked: true })
            })
    }

    login(email, password) {
        auth.login(email, password)
    }

    logout() {
        auth.logout()
    }

    onChangePassword(account) {
        console.log("Chanign password for ", account)
        this.setState({ changePasswordAccount: account, showChangePasswordModal: true })
    }

    onDeleteAccount(account) {
        console.log("Delete acount ", account)
        this.setState({ deletedAccount: account, showConfirmDeleteAccountModal: true })
    }

    deleteAccount() {
        const { email, pk } = this.state.deletedAccount
        UserAuth.deleteAccount(pk)
            .then(res => {
                console.log("Account deleted ", res)
                this.getAccounts()
                this.toggleConfirmDeleteAccountModal(false)
                this.props.onAlert("Account deleted", 'success')
            })
    }

    onUpdateAccount(account) {
        this.setState({ updateAccount: account, showUpdateAccountModal: true })
    }

    toggleAccountModal(val) {
        this.setState({ showAccountModal: val })
    }

    toggleUpdateAccountModal(val) {
        this.setState({ showUpdateAccountModal: val })
    }

    toggleChangePasswordModal(val) {
        this.setState({ showChangePasswordModal: val })
    }

    toggleConfirmDeleteAccountModal(val) {
        this.setState({ showConfirmDeleteAccountModal: val })
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
                    width: "90vw",
                    height: "100vh",

                    transform: "translate(-50%, -50%)",
                }}>
                    <Grid item align="center" xs={12}>
                        <Paper style={{ height: "100vh", justifyContent: "center", maxHeight: "100vh", overflowY: 'auto' }}>
                            <Grid item container xs={12}>
                                <Grid item xs={12} align="right">
                                    <Tooltip title='Close'>
                                        <IconButton color='primary' onClick={() => this.props.onClose()}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                                <Grid item xs={12} align="center" style={{ marginBottom: '32px' }}>
                                    <Typography variant='h6'>Account Management</Typography>
                                </Grid>

                                <Grid item xs={1}></Grid>
                                <Grid item container xs={10}>
                                    {auth.currentUser && (auth.currentUser.account_type === 2 || auth.currentUser.account_type === 3) ?
                                        <Fragment>

                                            <Grid item xs={12} align='right'>
                                                <Tooltip title='Create User'>
                                                    <IconButton color='secondary' onClick={() => this.toggleAccountModal(true)}>
                                                        <AddIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Typography variant='h6'> Accounts </Typography>
                                            </Grid>

                                            <Grid item xs={12} style={{ marginTop: '32px' }}>
                                                <Grid item container xs={12} spacing={4}>
                                                    {this.props.open ?
                                                        this.state.allAccounts.sort((a, b) => naturalSortBy(a, b, 'email')).map((account, i) => {
                                                            return (
                                                                <AccountRow key={`acctRow_${i}`}
                                                                    account={account}
                                                                    onUpdateAccount={this.onUpdateAccount.bind(this)}
                                                                    onChangePassword={this.onChangePassword.bind(this)}
                                                                    onDeleteAccount={this.onDeleteAccount.bind(this)}
                                                                >
                                                                </AccountRow>
                                                            )
                                                        })
                                                        :
                                                        <Fragment></Fragment>
                                                    }
                                                </Grid>
                                            </Grid>
                                        </Fragment>

                                        :
                                        <Grid item xs={12}>
                                            <Grid item container xs={12} >
                                                <Grid item xs={4} align='left'>
                                                    <Tooltip title='Update account'>
                                                        <IconButton color='primary' onClick={() => this.onUpdateAccount(auth.currentUser)} size='small'>
                                                            <UpdateIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Grid>
                                                <Grid item xs={4} align='center'>
                                                    <Tooltip title='Change password'>
                                                        <IconButton color='primary' onClick={() => this.onChangePassword(auth.currentUser)} size='small'>
                                                            <LockOpenIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Grid>
                                                <Grid item xs={4} align='right'>
                                                    <Tooltip title='Delete Account'>
                                                        <IconButton onClick={() => this.onDeleteAccount(auth.currentUser)} size='small'>
                                                            <Delete color='error' />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Grid>
                                            </Grid>

                                        </Grid>
                                    }



                                </Grid>
                                <Grid item xs={1}></Grid>

                                <CreateAccountModal
                                    open={this.state.showAccountModal}
                                    getAccounts={this.getAccounts.bind(this)}
                                    onClose={() => this.toggleAccountModal(false)}
                                />

                                <ChangePasswordModal
                                    open={this.state.showChangePasswordModal}
                                    account={this.state.changePasswordAccount}
                                    changePasswordAccount={this.state.changePasswordAccount}
                                    onAlert={this.props.onAlert}
                                    onClose={() => this.toggleChangePasswordModal(false)}
                                />
                                <UpdateAccountModal
                                    open={this.state.showUpdateAccountModal}
                                    updateAccount={this.state.updateAccount}
                                    getAccounts={this.getAccounts.bind(this)}
                                    onClose={() => this.toggleUpdateAccountModal(false)}
                                />

                                <ActionCancelModal
                                    open={this.state.showConfirmDeleteAccountModal}
                                    actionText="Delete"
                                    cancelText="Cancel"
                                    modalText={`Delete Accounts for ${this.state.deletedAccount.email}?`}
                                    onAction={this.deleteAccount.bind(this)}
                                    onClose={() => this.toggleConfirmDeleteAccountModal(false)}
                                />
                            </Grid>
                        </Paper>
                    </Grid>
                </div>

            </Modal>
        )
    }
}

export default Accounts = withTheme(Accounts)