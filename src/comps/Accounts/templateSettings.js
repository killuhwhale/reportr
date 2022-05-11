import {
    Modal, Grid, Paper, Tooltip, IconButton, Typography,
    Button, Card, CardContent, CardActionArea, CardActions,
    AppBar, Tabs, Tab, TextField
} from "@material-ui/core"
import { withTheme } from "@material-ui/core/styles"
import React, { Component, Fragment } from "react"
import CloseIcon from '@material-ui/icons/Close';
import UpdateIcon from '@material-ui/icons/Update';
import TemplateSettings from '../../utils/settings/settings'
import { MaxPageSize } from '../utils/FixedPageSize'
import { DatePicker } from '@material-ui/pickers'
import {
    REPORTING_METHODS, SOURCE_OF_ANALYSES, PRECIPITATIONS, APP_METHODS,
    MATERIAL_TYPES, WASTEWATER_MATERIAL_TYPES, NUTRIENT_IMPORT_MATERIAL_TYPES,
    EXPORT_MATERIAL_TYPES, FRESHWATER_SOURCE_TYPES, DEST_TYPES,
    DISCHARGE_TYPES, DISCHARGE_SOURCES, VOL_UNITS, CROPS
} from '../../utils/constants'
import ActionCancelModal from '../Modals/actionCancelModal'



class TemplateViewRaw extends Component {
    constructor(props) {
        super(props)
        this.state = {
            settings: props.settings,
            showConfirmUpdateModal: false,
        }
    }

    onChange(ev) {
        const { name, value } = ev.target
        this.setState({
            settings: {
                ...this.state.settings, [name]: value
            }
        })
    }

    onSelectChange(ev) {
        const { name, value } = ev.target
        const newValue = this.getOptions(name)[value]
        this.setState({
            settings: {
                ...this.state.settings, [name]: newValue
            }
        })
    }


    isDateKey(key) {
        return /date/.test(key) ||
            /Date/.test(key) ||
            /Dates/.test(key)
    }
    isNumericKey(key) {
        return /%/.test(key) ||
            /DL/.test(key) ||
            /PH/.test(key) ||
            /\(mg\/L\)/.test(key) ||
            /\(mg\/Kg\)/.test(key) ||
            /hos\/cm\)/.test(key) ||
            /\(PPM\)/.test(key) ||
            /\(Gals\)/.test(key) ||
            /\(Tons\)/.test(key) ||
            /\(mins\)/.test(key) ||
            /GPM/.test(key) ||
            /Hours/.test(key) ||
            /Acres/.test(key) ||
            /Cropable/.test(key) ||
            /Expected Yield Tons\/Acre/.test(key) ||
            /Actual Yield Total Tons/.test(key) ||
            /Total Gallons Applied/.test(key) ||
            /\(Gallons\/acre\)/.test(key) ||
            /^Amount Applied$/.test(key) ||
            /Tons\/Acre/.test(key) ||
            /^Volume discharged$/.test(key) ||
            /lbs\/ acre$/.test(key) ||
            /^Reference Number/.test(key)
    }

    isSelectKey(key) {
        return /^Crop$/.test(key) ||
            /^Source of Analysis/.test(key) ||
            /^Material Type$/.test(key) ||
            /Rain Day/.test(key) ||
            /^Reporting Method$/.test(key) ||
            /^Method of Reporting$/.test(key) ||
            /^App Method$/.test(key) ||
            /^Sample Data Source$/.test(key) ||
            /^Source Type$/.test(key) ||
            /^Destination Type$/.test(key) ||
            /^Volume Unit$/.test(key) ||
            /^Type$/.test(key) ||
            /^Discharge Source$/.test(key)
    }

    containsPercentChar(key) {
        return /%/.test(key)
    }

    showSettingToUser(key) {
        return /DL/.test(key) ||
            /escription/.test(key) ||
            this.isSelectKey(key)


    }

    isSwitch(key) {
        return /Operator Is/.test(key) ||
            /Operator Responsible/.test(key)
    }

    getOptions(key) {
        let options = null

        if (/^Crop$/.test(key)) {
            options = CROPS
        }

        if (/Rain Day/.test(key)) {
            options = PRECIPITATIONS
        }
        if (/^Source of Analysis/.test(key)) {
            options = SOURCE_OF_ANALYSES
        }
        if (/^Material Type$/.test(key)) {
            // Which ones have material types
            // wwTemplate, sm, comfertilizer, smExport, wwExports

            if (this.props.template === TemplateSettings.WASTEWATER_TEMPLATE_NAME) {
                options = WASTEWATER_MATERIAL_TYPES
            }
            if (this.props.template === TemplateSettings.SOLIDMANURE_TEMPLATE_NAME) {
                options = MATERIAL_TYPES
            }
            if (this.props.template === TemplateSettings.FERTILIZER_TEMPLATE_NAME) {
                options = NUTRIENT_IMPORT_MATERIAL_TYPES
            }
            if (this.props.template === TemplateSettings.SOLIDMANURE_EXPORT_TEMPLATE_NAME) {
                options = EXPORT_MATERIAL_TYPES
            }
            if (this.props.template === TemplateSettings.WASTEWATER_EXPORT_TEMPLATE_NAME) {
                options = EXPORT_MATERIAL_TYPES
            }
        }
        if (/^Reporting Method$/.test(key) || /^Method of Reporting$/.test(key)) {
            options = REPORTING_METHODS
        }
        if (/^App Method$/.test(key)) {
            options = APP_METHODS
        }
        if (/^Sample Data Source$/.test(key)) {
            options = REPORTING_METHODS
        }
        if (/^Source Type$/.test(key)) {
            options = FRESHWATER_SOURCE_TYPES
        }
        if (/^Destination Type$/.test(key)) {
            options = DEST_TYPES
        }
        if (/^Volume Unit$/.test(key)) {
            options = VOL_UNITS
        }
        if (/^Type$/.test(key)) {
            options = DISCHARGE_TYPES
        }
        if (/^Discharge Source$/.test(key)) {
            options = DISCHARGE_SOURCES
        }

        return options

    }

    getIndex(key, value) {
        console.log('Options for ', key, value, this.getOptions(key).indexOf(value))
        return this.getOptions(key).indexOf(value)
    }

    toggleConfirmUpdateModal(val) {
        this.setState({ showConfirmUpdateModal: val })
    }

    async onUpdate() {
        console.log("Updating: ", this.props.template, this.state.settings, this.props.dairy_id)
        const updateRes = await TemplateSettings.updateSettings(this.props.template, this.state.settings, this.props.dairy_id)
        console.log("Update Result: ", updateRes)
    }

    // What do I need to show the user, really?
    // DLs, Drop down options, Rain days, descriptions?

    render() {
        return (
            <Grid item xs={12}>
                <Grid item xs={12}>
                    <Tooltip title='Update Settings'>
                        <IconButton color='primary' onClick={() => this.toggleConfirmUpdateModal(true)} size='small'>
                            <UpdateIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Grid container item xs={12}>
                    {Object.keys(this.state.settings).length > 0 ?
                        Object.keys(this.state.settings)
                            .filter(key => this.showSettingToUser(key))
                            .sort()
                            .map((key, i) => {
                                const value = this.state.settings[key]
                                return (
                                    <Grid item xs={12} md={6} lg={3} key={`${key}_temp_settings_${i}`}>
                                        {this.isNumericKey(key) ?
                                            <TextField
                                                type="number"
                                                color='primary'
                                                inputProps={{
                                                    style: {
                                                        textAlign: 'right',
                                                        color: this.props.theme.palette.secondary.main,
                                                    }
                                                }}
                                                style={{ width: '80%' }}
                                                onChange={this.onChange.bind(this)}
                                                value={value}
                                                name={key}
                                                label={key}
                                            />
                                            : this.isSelectKey(key) ?
                                                <TextField select
                                                    color='primary'
                                                    inputProps={{
                                                        style: {
                                                            textAlign: 'right',
                                                            color: this.props.theme.palette.secondary.main,
                                                        }
                                                    }}
                                                    SelectProps={{
                                                        native: true,
                                                    }}
                                                    style={{ width: '80%' }}
                                                    onChange={this.onSelectChange.bind(this)}
                                                    value={this.getIndex(key, value)}
                                                    name={key}
                                                    label={key}
                                                >
                                                    {this.getOptions(key).map((option, i) => {
                                                        return (
                                                            <option value={i} key={`${option}_${i}`}>{option}</option>
                                                        )
                                                    })}
                                                </TextField>
                                                :
                                                <TextField

                                                    color='primary'
                                                    inputProps={{
                                                        style: {
                                                            textAlign: 'right',
                                                            color: this.props.theme.palette.secondary.main,
                                                        }
                                                    }}
                                                    style={{ width: '80%' }}
                                                    onChange={this.onChange.bind(this)}
                                                    value={value}
                                                    name={key}
                                                    label={key}
                                                />
                                        }
                                    </Grid>
                                )
                            })
                        :
                        <React.Fragment></React.Fragment>

                    }
                </Grid>

                <ActionCancelModal
                    open={this.state.showConfirmUpdateModal}
                    actionText="Update"
                    cancelText="Cancel"
                    modalText={`Update Settings?`}
                    onAction={this.onUpdate.bind(this)}
                    onClose={() => this.toggleConfirmUpdateModal(false)}
                />
            </Grid>
        )
    }
}

const TemplateView = withTheme(TemplateViewRaw)



class TemplateSetting extends Component {
    constructor(props) {
        super(props)
        this.state = {
            settings: {},
            tabIndex: 0,
            // TO solve material type issue,
            // We can tell the template view which sheet is being shown
            // Therefore, we will know which material types to show to the user
            tabs: {
                0: "show",
                1: "hide",
                2: "hide",
                3: "hide",
                4: 'hide',
                5: 'hide',
                6: 'hide',
                7: 'hide',
                8: 'hide',
                9: 'hide',
                10: 'hide',
            },
        }
    }

    componentDidMount() {
        this.getSettings()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.dairy_id !== this.props.dairy_id) {
            this.getSettings()
        }
    }

    async getSettings() {
        console.log("Getting dairy Id for dairy id: ", this.props.dairy_id)
        const res = await TemplateSettings.lazyGetSettings(this.props.dairy_id)
        if (res.error) return console.log(res)
        console.log(res)
        this.setState({ settings: res[0] })

    }

    handleTabChange(ev, index) {
        let tabs = this.state.tabs
        tabs[this.state.tabIndex] = "hide"
        tabs[index] = "show"
        this.setState({ tabIndex: index, tabs: tabs })
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
                                    <Typography variant='h6'>Template Settings {this.props.dairy_id}</Typography>
                                </Grid>
                                <AppBar position="static" style={{ marginBottom: "32px" }} key='appNutrientAppBar'>
                                    <Tabs value={this.state.tabIndex} variant="fullWidth" selectionFollowsFocus variant="scrollable"
                                        onChange={this.handleTabChange.bind(this)} aria-label="simple tabs example" key='appNutrientAppBarTabs'>
                                        <Tab label="Harvest" key='Harvest__key_0' />
                                        <Tab label="Process Wastewater" key='Process__key_0' />
                                        <Tab label="Fresh Water" key='Fresh__key_0' />
                                        <Tab label="Solid Manure" key='Solid__key_0' />
                                        <Tab label="Commercial Fertilizer" key='Commercial__key_0' />
                                        <Tab label="Soil" key='Soil__key_0' />
                                        <Tab label="Plowdown Credit" key='Plowdown__key_0' />
                                        <Tab label="Solid Manure Export" key='Solid_export__key_0' />
                                        <Tab label="Wastewater Export" key='Wastewater__key_0' />
                                        <Tab label="Tile Drainage" key='Tile__key_0' />
                                        <Tab label="Discharges" key='Discharges__key_0' />
                                    </Tabs>
                                </AppBar>

                                <MaxPageSize height='568px' item xs={12}>
                                    {

                                        this.state.tabs[0] === "show" ?
                                            <Grid item xs={12} style={{ marginTop: "30px" }} key='Harvest__tab_0'>
                                                {this.state.settings[TemplateSettings.HARVEST_TEMPLATE_NAME] ?
                                                    <TemplateView
                                                        dairy_id={this.props.dairy_id}
                                                        template={TemplateSettings.HARVEST_TEMPLATE_NAME}
                                                        settings={this.state.settings[TemplateSettings.HARVEST_TEMPLATE_NAME]}
                                                    />
                                                    :
                                                    <React.Fragment></React.Fragment>
                                                }
                                            </Grid>
                                            :
                                            this.state.tabs[1] === "show" ?
                                                <Grid item xs={12} style={{ marginTop: "30px" }} key='Process__tab_0'>
                                                    {this.state.settings[TemplateSettings.WASTEWATER_TEMPLATE_NAME] ?
                                                        <TemplateView
                                                            dairy_id={this.props.dairy_id}
                                                            template={TemplateSettings.WASTEWATER_TEMPLATE_NAME}
                                                            settings={this.state.settings[TemplateSettings.WASTEWATER_TEMPLATE_NAME]}
                                                        />
                                                        :
                                                        <React.Fragment></React.Fragment>
                                                    }
                                                </Grid>
                                                :
                                                this.state.tabs[2] === "show" ?
                                                    <Grid item xs={12} style={{ marginTop: "30px" }} key='Fresh__tab_0'>
                                                        {this.state.settings[TemplateSettings.FRESHWATER_TEMPLATE_NAME] ?
                                                            <TemplateView
                                                                dairy_id={this.props.dairy_id}
                                                                template={TemplateSettings.FRESHWATER_TEMPLATE_NAME}
                                                                settings={this.state.settings[TemplateSettings.FRESHWATER_TEMPLATE_NAME]}
                                                            />
                                                            :
                                                            <React.Fragment></React.Fragment>
                                                        }
                                                    </Grid>
                                                    :
                                                    this.state.tabs[3] === "show" ?
                                                        <Grid item xs={12} style={{ marginTop: "30px" }} key='Solid__tab_0'>
                                                            {this.state.settings[TemplateSettings.SOLIDMANURE_TEMPLATE_NAME] ?
                                                                <TemplateView
                                                                    dairy_id={this.props.dairy_id}
                                                                    template={TemplateSettings.SOLIDMANURE_TEMPLATE_NAME}
                                                                    settings={this.state.settings[TemplateSettings.SOLIDMANURE_TEMPLATE_NAME]}
                                                                />
                                                                :
                                                                <React.Fragment></React.Fragment>
                                                            }
                                                        </Grid>
                                                        :
                                                        this.state.tabs[4] === "show" ?
                                                            <Grid item xs={12} style={{ marginTop: "30px" }} key='Commercial__tab_0'>
                                                                {this.state.settings[TemplateSettings.FERTILIZER_TEMPLATE_NAME] ?
                                                                    <TemplateView
                                                                        dairy_id={this.props.dairy_id}
                                                                        template={TemplateSettings.FERTILIZER_TEMPLATE_NAME}
                                                                        settings={this.state.settings[TemplateSettings.FERTILIZER_TEMPLATE_NAME]}
                                                                    />
                                                                    :
                                                                    <React.Fragment></React.Fragment>
                                                                }
                                                            </Grid>
                                                            :
                                                            this.state.tabs[5] === "show" ?
                                                                <Grid item xs={12} style={{ marginTop: "30px" }} key='Soil__tab_0'>
                                                                    {this.state.settings[TemplateSettings.SOIL_TEMPLATE_NAME] ?
                                                                        <TemplateView
                                                                            dairy_id={this.props.dairy_id}
                                                                            template={TemplateSettings.SOIL_TEMPLATE_NAME}
                                                                            settings={this.state.settings[TemplateSettings.SOIL_TEMPLATE_NAME]}
                                                                        />
                                                                        :
                                                                        <React.Fragment></React.Fragment>
                                                                    }
                                                                </Grid>
                                                                :
                                                                this.state.tabs[6] === "show" ?
                                                                    <Grid item xs={12} style={{ marginTop: "30px" }} key='Plowdown__tab_0'>
                                                                        {this.state.settings[TemplateSettings.PLOW_TEMPLATE_NAME] ?
                                                                            <TemplateView
                                                                                dairy_id={this.props.dairy_id}
                                                                                template={TemplateSettings.PLOW_TEMPLATE_NAME}
                                                                                settings={this.state.settings[TemplateSettings.PLOW_TEMPLATE_NAME]}
                                                                            />
                                                                            :
                                                                            <React.Fragment></React.Fragment>
                                                                        }
                                                                    </Grid>
                                                                    :
                                                                    this.state.tabs[7] === "show" ?
                                                                        <Grid item xs={12} style={{ marginTop: "30px" }} key='Solid__tab_0'>
                                                                            {this.state.settings[TemplateSettings.SOLIDMANURE_EXPORT_TEMPLATE_NAME] ?
                                                                                <TemplateView
                                                                                    dairy_id={this.props.dairy_id}
                                                                                    template={TemplateSettings.SOLIDMANURE_EXPORT_TEMPLATE_NAME}
                                                                                    settings={this.state.settings[TemplateSettings.SOLIDMANURE_EXPORT_TEMPLATE_NAME]}
                                                                                />
                                                                                :
                                                                                <React.Fragment></React.Fragment>
                                                                            }
                                                                        </Grid>
                                                                        :
                                                                        this.state.tabs[8] === "show" ?
                                                                            <Grid item xs={12} style={{ marginTop: "30px" }} key='Wastewater__tab_0'>
                                                                                {this.state.settings[TemplateSettings.WASTEWATER_EXPORT_TEMPLATE_NAME] ?
                                                                                    <TemplateView
                                                                                        dairy_id={this.props.dairy_id}
                                                                                        template={TemplateSettings.WASTEWATER_EXPORT_TEMPLATE_NAME}
                                                                                        settings={this.state.settings[TemplateSettings.WASTEWATER_EXPORT_TEMPLATE_NAME]}
                                                                                    />
                                                                                    :
                                                                                    <React.Fragment></React.Fragment>
                                                                                }
                                                                            </Grid>
                                                                            :
                                                                            this.state.tabs[9] === "show" ?
                                                                                <Grid item xs={12} style={{ marginTop: "30px" }} key='Tile__tab_0'>
                                                                                    {this.state.settings[TemplateSettings.TILE_TEMPLATE_NAME] ?
                                                                                        <TemplateView
                                                                                            dairy_id={this.props.dairy_id}
                                                                                            template={TemplateSettings.TILE_TEMPLATE_NAME}
                                                                                            settings={this.state.settings[TemplateSettings.TILE_TEMPLATE_NAME]}
                                                                                        />
                                                                                        :
                                                                                        <React.Fragment></React.Fragment>
                                                                                    }
                                                                                </Grid>
                                                                                :
                                                                                this.state.tabs[10] === "show" ?
                                                                                    <Grid item xs={12} style={{ marginTop: "30px" }} key='Discharges__tab_0'>
                                                                                        {this.state.settings[TemplateSettings.DISCHARGE_TEMPLATE_NAME] ?
                                                                                            <TemplateView
                                                                                                dairy_id={this.props.dairy_id}
                                                                                                template={TemplateSettings.DISCHARGE_TEMPLATE_NAME}
                                                                                                settings={this.state.settings[TemplateSettings.DISCHARGE_TEMPLATE_NAME]}
                                                                                            />
                                                                                            :
                                                                                            <React.Fragment></React.Fragment>
                                                                                        }
                                                                                    </Grid>
                                                                                    : <React.Fragment></React.Fragment>

                                    }
                                </MaxPageSize>


                                {/* <ActionCancelModal
                                    open={this.state.showConfirmDeleteAccountModal}
                                    actionText="Delete"
                                    cancelText="Cancel"
                                    modalText={`Delete Account ${this.state.deletedAccount.email}?`}
                                    onAction={this.deleteAccount.bind(this)}
                                    onClose={() => this.toggleConfirmDeleteAccountModal(false)}
                                /> */}
                            </Grid>
                        </Paper>
                    </Grid>
                </div>

            </Modal>
        )
    }
}

export default TemplateSetting = withTheme(TemplateSetting)