
import React, { Component, Fragment } from 'react'
import {
    Grid, Paper, Button, Typography, TextField, Tooltip, IconButton
} from '@material-ui/core'
import { withTheme } from '@material-ui/core/styles'
import { auth, UserAuth } from '../utils/users'
import { AddCircleOutline } from '@material-ui/icons'
import AddCompanyModal from '../comps/Modals/addCompanyModal'
import CompanyManagementModal from '../comps/Modals/companyManagementModal'
import { get } from '../utils/requests'
import { BASE_URL } from '../utils/environment'
import { ROLES } from '../utils/constants'
import { CompanyUtil } from '../utils/company/company'

/**
 * CRUD  companies
 *  - & company admin accounts (2) for each company
 * 
 *  View companies and their accounts
 * 
 */


const CompanyRow = (props) => {
    const company = props.company
    return (
        <Grid container item xs={12}>
            <Grid item xs={10}>
                {company.title} ({company.pk})
            </Grid>
            <Grid item xs={2}>
                <Tooltip title='View'>
                    <IconButton onClick={() => props.showCompanyManagementModal(company.pk)}>
                        <AddCircleOutline />
                    </IconButton>
                </Tooltip>
            </Grid>
        </Grid>
    )
}


class AdminDashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            companies: [],
            showAddCompanyModal: false,
            showCompanyManagementModal: false,
            managementCompanyID: null
        }
    }

    componentDidMount() {
        this.getAllCompanies()
    }

    toggleShowAddCompanyModal(val) {
        this.setState({ showAddCompanyModal: val })
    }

    toggleShowCompanyManagementModal(val) {
        this.setState({ showCompanyManagementModal: val })
    }

    showCompanyManagementModal(pk) {
        this.setState({ showCompanyManagementModal: true, managementCompanyID: pk })
    }

    async getAllCompanies() {
        try {
            const res = await CompanyUtil.getAllCompanies()
            if (res.error) {
                console.log(res)
                return
            }
            console.log(res)
            this.setState({ companies: res })
        } catch (e) {
            console.log(e)
        }

    }

    render() {

        return (
            <Grid item container xs={12} align="center" >
                {
                    auth.currentUser.account_type === ROLES.HACKER ?
                        <Fragment>

                            <Grid item xs={12} >
                                <Typography variant='h2'>Admin Dashboard</Typography>
                            </Grid>

                            <Grid item xs={12} >
                                <div style={{ display: 'inline-flex' }}>
                                    <Typography variant='h4'>Companies </Typography>
                                    <Tooltip title='Add Company'>
                                        <IconButton onClick={() => this.toggleShowAddCompanyModal(true)}>
                                            <AddCircleOutline />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </Grid>

                            <Grid item xs={12} >
                                {this.state.companies.length > 0 ?
                                    this.state.companies.map((company, i) => {
                                        return <CompanyRow key={`company_row_${i}`}
                                            company={company}
                                            showCompanyManagementModal={this.showCompanyManagementModal.bind(this)}
                                        />
                                    })
                                    :
                                    <Fragment></Fragment>
                                }
                            </Grid>

                            <AddCompanyModal
                                open={this.state.showAddCompanyModal}
                                onClose={() => this.toggleShowAddCompanyModal(false)}
                                modalText='Add Company'
                                actionText='Add'
                                cancelText='Cancel'
                                onAlert={this.props.onAlert}
                            />

                            <CompanyManagementModal
                                open={this.state.showCompanyManagementModal}
                                onClose={() => this.toggleShowCompanyManagementModal(false)}
                                managementCompanyID={this.state.managementCompanyID}
                                cancelText='Cancel'
                                onAlert={this.props.onAlert}
                            />
                        </Fragment>

                        :
                        <Fragment></Fragment>
                }

            </Grid>
        )
    }
}

export default AdminDashboard = withTheme(AdminDashboard)
