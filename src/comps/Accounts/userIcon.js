import React, { Component } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import { auth } from '../../utils/users';
import { Grid, Tooltip, Popper, Fade, Paper, ClickAwayListener, Typography, IconButton, TextField } from '@material-ui/core';
import { withTheme } from "@material-ui/core/styles"
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew'
import FlareIcon from '@material-ui/icons/Flare'
import NightsStayIcon from '@material-ui/icons/NightsStay'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import ActionCancelModal from '../Modals/actionCancelModal';
import Accounts from './accounts';
import { ROLE_LABELS } from '../../utils/constants';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    purple: {
        color: theme.palette.getContrastText(theme.palette.primary.main),
        backgroundColor: theme.palette.primary.main,
        marginTop: '8px'
    },
}));

const paperStyle = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.profilePaper.backgroundColor,
        paddingTop: '8px',
        height: "448px",
        width: '328px',
        borderRadius: '8px'
    },

}));

const poperStyle = makeStyles((theme) => ({
    root: {
        zIndex: '1200 !important'
    },

}));

function LetterAvatars(props) {
    const classes = useStyles();

    return (
        <Tooltip title={`${props.tooltip}`}>
            <Avatar onClick={props.onClick} className={classes.purple}>{props.letter.toUpperCase()}</Avatar>
        </Tooltip>

    );
}




const ProfilePopper = (props) => {
    const classes = paperStyle();
    const poperClasses = poperStyle();
    return (
        <ClickAwayListener onClickAway={props.handleClickAway}>
            <Popper id={props.id} open={props.open} anchorEl={props.anchorEl}
                placement='bottom-start' transition className={poperClasses.root}>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Grid item xs={12}>
                            <Paper className={classes.root} elevation={6} >
                                <Grid item container justifyContent='center' alignContent='center' alignItems='center' xs={12}>
                                    <Grid item xs={10} style={{ marginBottom: '16px', paddingLeft: '16px', paddingTop: '8px' }}>
                                        <Typography variant='subtitle2'>
                                            <TextField
                                                label='Email'
                                                value={props.user.email}
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </Typography>
                                    </Grid>


                                    <Grid item xs={2} align='center'>
                                        <Tooltip title='Logout'>
                                            <IconButton onClick={() => props.confirmLogout(true)} size='small'>
                                                <PowerSettingsNewIcon color='error' />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={10} style={{ marginBottom: '16px', paddingLeft: '16px', paddingTop: '8px' }}>
                                        <Typography variant='subtitle2'>
                                            <TextField
                                                label='Username'
                                                value={props.user.username}
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={2} align='center'>
                                        <Tooltip title="Light Theme">
                                            <IconButton color="primary" variant="outlined" style={{ marginTop: "0px" }}
                                                onClick={() => props.toggleTheme('Light')}>
                                                <FlareIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>

                                    <Grid item xs={10} style={{ marginBottom: '16px', paddingLeft: '16px', paddingTop: '8px' }}>
                                        <Typography variant='subtitle2'>
                                            <TextField
                                                label='Account Role'
                                                value={ROLE_LABELS[props.user.account_type]}
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} align='center'>
                                        <Tooltip title="Dark Theme">
                                            <IconButton color="primary" variant="outlined" style={{ marginTop: "0px" }}
                                                onClick={() => props.toggleTheme('Dark')}>
                                                <NightsStayIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={10} style={{ marginBottom: '16px', paddingLeft: '16px', paddingTop: '8px' }}>
                                        <Typography variant='subtitle2'>
                                            <TextField
                                                label='Company'
                                                value={props.company.title}
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </Typography>
                                    </Grid>


                                    <Grid item xs={2} align='center'>
                                        <Tooltip title="Accounts">
                                            <IconButton color="primary" variant="outlined" style={{ marginTop: "16px" }}
                                                onClick={() => props.toggleAccountsModal(true)}>
                                                <SupervisorAccountIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>



                                </Grid>



                            </Paper>
                        </Grid>
                    </Fade>
                )}
            </Popper>
        </ClickAwayListener>
    )
}



class UserIcon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            iconAnchor: null,
            initClick: true,
            toggleShowLogoutModal: false,
            showAccountsModal: false
        }
        this.openingPopper = false
    }

    toggleProfilePopper(ev) {
        const open = this.state.iconAnchor ? true : false
        if (open) {
            return this.setState({ iconAnchor: null })
        }
        this.openingPopper = true
        this.setState({ iconAnchor: ev.currentTarget })
    }

    handleClickAway() {
        if (!this.openingPopper)
            this.toggleProfilePopper({ ev: { currentTarget: null } })
        else {
            this.openingPopper = false
        }
    }

    confirmLogout(val) {
        if (val)
            this.handleClickAway()
        this.setState({ toggleShowLogoutModal: val })
    }

    async logout() {
        console.log("Loggin user out!")
        this.confirmLogout(false)
        await auth.logout()
    }

    toggleAccountsModal(val) {
        if (val)
            this.handleClickAway()

        this.setState({ showAccountsModal: val })
    }


    render() {
        const open = Boolean(this.state.iconAnchor)
        const coupleID = open ? 'popperProfileID' : undefined
        return (
            <Grid item xs={12} align='right'>
                <LetterAvatars
                    letter={auth.currentUser.email.slice(0, 2)}
                    tooltip={auth.currentUser.email}
                    onClick={this.toggleProfilePopper.bind(this)}
                    aria-describedby={coupleID}
                />
                <ProfilePopper
                    id={coupleID}
                    open={open}
                    user={auth.currentUser}
                    company={this.props.company}
                    anchorEl={this.state.iconAnchor}
                    handleClickAway={this.handleClickAway.bind(this)}
                    confirmLogout={this.confirmLogout.bind(this)}
                    toggleTheme={this.props.toggleTheme}
                    toggleAccountsModal={this.toggleAccountsModal.bind(this)}
                />

                <ActionCancelModal
                    open={this.state.toggleShowLogoutModal}
                    actionText="Logout"
                    cancelText="Cancel"
                    modalText={`Are you sure you want to logout and leave?`}
                    onAction={this.logout.bind(this)}
                    onClose={() => this.confirmLogout(false)}
                />

                <Accounts
                    key={'DOESTHISWORK'}
                    open={this.state.showAccountsModal}
                    onAlert={this.props.onAlert}
                    onClose={() => this.toggleAccountsModal(false)}
                />

            </Grid>
        )
    }


}


export default UserIcon = withTheme(UserIcon)