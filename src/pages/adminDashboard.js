
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
import { withStyles } from '@material-ui/styles'
import FlareIcon from '@material-ui/icons/Flare'
import NightsStayIcon from '@material-ui/icons/NightsStay'
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';

/**
 * CRUD  companies
 *  - & company admin accounts (2) for each company
 * 
 *  View companies and their accounts
 * 
 */


const CoolBGGrid = withStyles({
    root: {
        background: '#373B44',  /* fallback for old browsers */
        background: '-webkit-linear-gradient(to right, #2980b9, #6dd5fa, #ffffff)',  /* Chrome 10-25, Safari 5.1-6 */
        background: 'linear-gradient(to right, #2980b9, #6dd5fa, #ffffff)', /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
        marginTop: '8px',
        borderRadius: '4px'
    }
})(Grid);




const CompanyRow = (props) => {
    const company = props.company
    return (
        <Grid container item alignItems='center' justifyContent='center' alignContent='center' xs={12} >
            <Grid item xs={10}>
                <Typography variant='subtitle1'>
                    {company.title} ({company.pk})
                </Typography>
            </Grid>
            <Grid item xs={2}>
                <Tooltip title='View'>
                    <IconButton onClick={() => props.showCompanyManagementModal(company.pk, company.title)}>
                        <RemoveRedEyeIcon color='primary' />
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

    showCompanyManagementModal(pk, title) {
        this.setState({ showCompanyManagementModal: true, managementCompanyID: pk, managementTitle: title })
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

    onCreateCompany() {
        this.getAllCompanies()
    }

    onCompanyDelete() {
        this.getAllCompanies()

    }

    render() {

        return (
            <Grid item xs={12}  >
                <Grid item container xs={12} align="center" >
                    {
                        auth.currentUser.account_type === ROLES.HACKER ?
                            <Fragment>

                                <Grid item xs={12} container alignContent='center' justifyContent='center' alignItems='center'>
                                    <Grid item xs={3}></Grid>
                                    <Grid item xs={6}>
                                        <Typography variant='h2'>Admin Dashboard</Typography>
                                    </Grid>
                                    <Grid item container xs={3}>
                                        <Grid item xs={6} align='center'>
                                            <Tooltip title="Light Theme">
                                                <IconButton color="primary" variant="outlined" style={{ marginTop: "0px" }}
                                                    onClick={() => this.props.toggleTheme('Light')}>
                                                    <FlareIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
                                        <Grid item xs={6} align='center'>
                                            <Tooltip title="Dark Theme">
                                                <IconButton color="primary" variant="outlined" style={{ marginTop: "0px" }}
                                                    onClick={() => this.props.toggleTheme('Dark')}>
                                                    <NightsStayIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item container xs={6}>
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

                                    <Grid container item xs={12} >
                                        <Grid item xs={2}></Grid>
                                        <Grid item xs={8}>
                                            {this.state.companies.length > 0 ?
                                                this.state.companies.map((company, i) => {
                                                    return (<CoolBGGrid key={`company_row_${i}`}><CompanyRow
                                                        company={company}
                                                        showCompanyManagementModal={this.showCompanyManagementModal.bind(this)}
                                                    /></CoolBGGrid>)
                                                })
                                                :
                                                <Fragment></Fragment>
                                            }
                                        </Grid>
                                        <Grid item xs={2}></Grid>
                                    </Grid>

                                </Grid>

                                <Grid item container xs={6}>
                                    <Grid item xs={12} >
                                        <Typography variant='h4'>Panel Template </Typography>
                                    </Grid>
                                </Grid>

                                <AddCompanyModal
                                    open={this.state.showAddCompanyModal}
                                    onClose={() => this.toggleShowAddCompanyModal(false)}
                                    onCreateCompany={this.onCreateCompany.bind(this)}
                                    modalText='Add Company'
                                    actionText='Add'
                                    cancelText='Cancel'
                                    onAlert={this.props.onAlert}
                                />

                                <CompanyManagementModal
                                    open={this.state.showCompanyManagementModal}
                                    onClose={() => this.toggleShowCompanyManagementModal(false)}
                                    onDelete={this.onCompanyDelete.bind(this)}
                                    managementCompanyID={this.state.managementCompanyID}
                                    managementTitle={this.state.managementTitle}
                                    cancelText='Close'
                                    onAlert={this.props.onAlert}
                                />
                            </Fragment>

                            :
                            <Fragment></Fragment>
                    }
                </Grid>
            </Grid>
        )
    }
}

export default AdminDashboard = withTheme(AdminDashboard)
