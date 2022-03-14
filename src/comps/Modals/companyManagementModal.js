import React, { Component, Fragment } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField, CircularProgress, Tooltip, Icon, IconButton } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';
import { get, post } from '../../utils/requests';
import { UserAuth } from '../../utils/users';
import { AddCircleOutline } from '@material-ui/icons';
import AddOwnerAccount from './addOwnerAccount';

const AccountRow = (props) => {
    const { account } = props
    return (
        <Grid item xs={12}>
            {account.email}
        </Grid>
    )
}


class CompanyManagementModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            accounts: [],
            showAddAccount: false
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
                return
            } console.log("res", res)

            this.setState({ accounts: res.data })

        } catch (e) {
            console.log(e)
        }
    }

    toggleShowAddAccount(val) {
        this.setState({ showAddAccount: val })
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
                                <Grid item xs={12}>
                                    <Typography style={{ marginTop: "32px" }}>
                                        Details for ({this.props.managementCompanyID})
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} align='center'>
                                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <Typography variant="h6">
                                            Create Account for Company
                                        </Typography>
                                        <Tooltip title='Create Admin Account'>
                                            <IconButton onClick={() => this.toggleShowAddAccount(true)}>
                                                <AddCircleOutline />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </Grid>

                                <Grid item xs={12}>
                                    {
                                        this.state.accounts.length > 0 ?
                                            this.state.accounts.map((account, i) => {
                                                return (
                                                    <AccountRow
                                                        key={`account_company_detail_${i}`}
                                                        account={account}
                                                    />
                                                )
                                            })
                                            :
                                            <Fragment></Fragment>
                                    }
                                </Grid>


                                <Grid item xs={12}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => { this.props.onClose() }}>
                                        {this.props.cancelText}
                                    </Button>
                                </Grid>

                                <AddOwnerAccount
                                    open={this.state.showAddAccount}
                                    onClose={() => this.toggleShowAddAccount(false)}
                                    modalText='Add Account'
                                    companyID={this.props.managementCompanyID}
                                    actionText='Add'
                                    cancelText='Cancel'
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