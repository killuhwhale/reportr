import React, { Component, Fragment } from 'react'
// Material UI
import { Grid, Paper, Typography, Modal, Tooltip, IconButton } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';
import { UserAuth } from '../../utils/users';
import { AddCircleOutline } from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/Delete'
import { withStyles } from '@material-ui/styles'
import AddOwnerAccount from './addOwnerAccount';
import ChangePasswordModal from './changePasswordModal'
import LockOpenIcon from '@material-ui/icons/LockOpen';
import ActionCancelModal from './actionCancelModal'
import { Company } from '../../utils/company/company';



const AccountGrid = withStyles({
    root: {
        maxHeight: '560px',
        overflowY: 'auto'
    }
})(Grid);


const AccountRow = (props) => {
    const { account, username } = props
    const { email } = account
    return (
        <Grid item container alignContent='center' alignItems='center' justifyContent='center' xs={12} align='left'>
            <Grid item xs={4} align='left' style={{ paddingLeft: '36px' }}>
                {username || 'No username'}
            </Grid>
            <Grid item xs={4} >
                {email}
            </Grid>
            <Grid item xs={2} align='center'>
                <Tooltip title='Change Password'>
                    <IconButton onClick={() => props.onChangePassword(account)}>
                        <LockOpenIcon color='primary' />
                    </IconButton>
                </Tooltip>
            </Grid>
            <Grid item xs={2} align='center'>
                <Tooltip title='Delete Account'>
                    <IconButton onClick={() => props.onDeleteAccount(account)}>
                        <DeleteIcon color='error' />
                    </IconButton>
                </Tooltip>
            </Grid>

        </Grid>
    )
}


class CompanyManagementModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            accounts: [],
            showAddAccount: false,
            showChangePasswordModal: false,
            showConfirmDeleteAccountModal: false,
            showDeleteCompanyModal: false,
            changePasswordAccount: {},
            deletedAccount: {},

        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.managementCompanyID !== this.props.managementCompanyID) {
            console.log("Render new stuff for new thang")
            this.getAccounts()
        }
    }

    async getAccounts() {
        try {
            const res = await UserAuth.getAllAccounts(this.props.managementCompanyID)
            if (res.error) {
                console.log(res)
                return this.setState({ accounts: [] })
            }

            this.setState({ accounts: res.data })

        } catch (e) {
            console.log(e)
            return this.setState({ accounts: [] })
        }
    }




    toggleChangePasswordModal(val) {
        this.setState({ showChangePasswordModal: val })
    }

    toggleShowAddAccount(val) {
        this.setState({ showAddAccount: val })
    }
    toggleConfirmDeleteAccountModal(val) {
        this.setState({ showConfirmDeleteAccountModal: val })
    }

    toggleDeleteCompanyModal(val) {
        this.setState({ showDeleteCompanyModal: val })
    }

    onAccountCreated(user) {
        console.log('Created', user)
        this.getAccounts()
    }

    onChangePassword(account) {
        this.setState({ changePasswordAccount: account, showChangePasswordModal: true })
    }

    onDeleteAccount(deletedAccount) {
        this.setState({ deletedAccount, showConfirmDeleteAccountModal: true })

    }

    async deleteAccount() {
        console.log("Deleting account: ", this.state.deletedAccount)
        const res = await UserAuth.deleteAccount(this.state.deletedAccount.pk, this.state.deletedAccount.company_id)
        console.log("Deleted res: ", res)
        this.toggleConfirmDeleteAccountModal(false)
        if (res.error) {
            console.log(res.error)
            return this.props.onAlert('Failed to delete account.', 'error')
        }
        this.props.onAlert('Account deleted', 'success')
        this.getAccounts()
    }

    async deleteCompany() {
        console.log("Deleting company with ID: ", this.props.managementCompanyID)
        const res = await Company.deleteCompany(this.props.managementCompanyID)
        this.props.onClose()
        this.toggleConfirmDeleteAccountModal(false)
        if (res.error) {
            console.log(res.error)
            return this.props.onAlert('Failed to delete company.', 'error')
        }
        this.props.onAlert('Company deleted', 'success')
        this.props.onDelete()
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
                }}>
                    <Grid
                        item
                        align="center"
                        xs={12}
                    >
                        <Paper style={{ height: "90vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <Grid item container xs={12}>

                                <Grid item container alignContent='center' alignItems='center' justifyContent='center' xs={12}>

                                    <Grid item xs={4}></Grid>
                                    <Grid item xs={4}>
                                        <Typography variant='h5' style={{ marginTop: "32px" }}>
                                            {this.props.managementTitle}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} align='right'>
                                        <Tooltip title={`Create Admin Account for ${this.props.managementTitle}`}>
                                            <IconButton onClick={() => this.toggleShowAddAccount(true)}>
                                                <AddCircleOutline color='primary' />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={2} align='right'>
                                        <Tooltip title='Delete Company'>
                                            <IconButton onClick={() => this.toggleDeleteCompanyModal(true)} style={{ marginRight: '8px' }}>
                                                <DeleteIcon color='error' />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                </Grid>

                                <Grid item xs={12} align='left' style={{ paddingLeft: '36px' }}>
                                    <Typography variant='h6' > Accounts </Typography>
                                </Grid>
                                <Grid item container alignContent='center' alignItems='center'
                                    justifyContent='center' xs={12} align='left'>
                                    <Grid item xs={4} align='left' style={{ paddingLeft: '36px' }}>
                                        <Typography variant='subtitle1'> Username </Typography>
                                    </Grid>
                                    <Grid item xs={4} >
                                        <Typography variant='subtitle1'> E-mail </Typography>
                                    </Grid>
                                    <Grid item xs={2} align='center'>
                                        <Typography variant='subtitle1'> Change Password </Typography>
                                    </Grid>
                                    <Grid item xs={2} align='center'>
                                        <Typography variant='subtitle1'> Delete Account </Typography>
                                    </Grid>

                                </Grid>

                                <AccountGrid item container xs={12}>
                                    {/* Header Row */}
                                    {
                                        this.state.accounts.length > 0 ?
                                            this.state.accounts.map((account, i) => {
                                                return (
                                                    <AccountRow
                                                        key={`account_company_detail_${i}`}
                                                        onDeleteAccount={this.onDeleteAccount.bind(this)}
                                                        onChangePassword={this.onChangePassword.bind(this)}
                                                        account={account}
                                                    />
                                                )
                                            })
                                            :
                                            <Fragment></Fragment>
                                    }
                                </AccountGrid>




                                <AddOwnerAccount
                                    open={this.state.showAddAccount}
                                    onClose={() => this.toggleShowAddAccount(false)}
                                    modalText='Add Account'
                                    companyID={this.props.managementCompanyID}
                                    onAccountCreated={this.onAccountCreated.bind(this)}
                                    actionText='Add'
                                    cancelText='Cancel'
                                />
                                <ChangePasswordModal
                                    open={this.state.showChangePasswordModal}
                                    account={this.state.changePasswordAccount}
                                    onAlert={this.props.onAlert}
                                    onClose={() => this.toggleChangePasswordModal(false)}
                                />

                                <ActionCancelModal
                                    open={this.state.showConfirmDeleteAccountModal}
                                    actionText="Delete"
                                    cancelText="Cancel"
                                    modalText={`Delete Account: ${this.state.deletedAccount.email}?`}
                                    onAction={this.deleteAccount.bind(this)}
                                    onClose={() => this.toggleConfirmDeleteAccountModal(false)}
                                />
                                <ActionCancelModal
                                    open={this.state.showDeleteCompanyModal}
                                    actionText="Delete"
                                    cancelText="Cancel"
                                    modalText={`Delete Company: ${this.props.managementTitle}?`}
                                    onAction={this.deleteCompany.bind(this)}
                                    onClose={() => this.toggleDeleteCompanyModal(false)}
                                />
                            </Grid>
                        </Paper>
                    </Grid>
                </div>
            </Modal>

        )
    }

}

export default CompanyManagementModal = withTheme(CompanyManagementModal);