import { Component } from 'react'
import { get } from '../../utils/requests'
import { Grid, Typography, Button, withTheme } from '@material-ui/core'
import { getNutrientBudgetInfo } from '../Dairy/pdfDB'
import { withRouter } from "react-router-dom"
import { renderFieldButtons, renderCropButtons, CurrentFieldCrop } from './selectButtonGrid'
import { formatDate, formatFloat, groupByKeys, naturalSort, naturalSortBy, nestedGroupBy } from "../../utils/format"
import { createBarChart, barChartConfig } from '../Dairy/pdfCharts'
import { opArrayByPos, toFloat } from '../../utils/convertCalc';
import { withStyles } from '@material-ui/styles'


const HeaderRowGrid = withStyles(theme => ({
    root: {
        border: `1px solid ${theme.palette.text.primary}`

    }
}))(Grid)

const HeaderRow = (props) => {
    const headerInfo = props.headerInfo
    return (
        <HeaderRowGrid item container xs={12}>
            <Grid item xs={2} align='center'>
                <Typography variant='caption' color='primary' > Applied: {formatDate(headerInfo['app_date'].split('T')[0])}</Typography>
            </Grid>
            <Grid item xs={3} align='center'>
                <Typography variant='caption' color='primary' > Method: {headerInfo['app_method']}</Typography>
            </Grid>
            <Grid item container xs={7}>
                <Grid item xs={4} align='center'>
                    <Typography variant='caption' color='primary' > Rain Prior: {headerInfo['precip_before']}</Typography>
                </Grid>
                <Grid item xs={4} align='center'>
                    <Typography variant='caption' color='primary' > Rain During: {headerInfo['precip_during']}</Typography>
                </Grid>
                <Grid item xs={4} align='center'>
                    <Typography variant='caption' color='primary' > Rain After: {headerInfo['precip_after']}</Typography>
                </Grid>
            </Grid>
        </HeaderRowGrid>
    )

}

const AppEventRow = (props) => {
    const ev = props.event
    return (
        <Grid item container xs={12}>
            <Grid item xs={2} align='center'>
                <Typography variant='caption'>{ev['app_desc'] || ev['src_desc']}</Typography>
            </Grid>
            <Grid item xs={2} align='center'>
                <Typography variant='caption'>{ev['material_type'] || ev['entry_type']}</Typography>
            </Grid>
            <Grid item xs={2}>

            </Grid>
            <Grid item xs={2} align='center'>
                <Typography variant='caption'>{formatFloat(ev['amount_applied'])} </Typography>
            </Grid>
            <Grid item xs={1}>
                <Typography variant='caption'>{formatFloat(ev['n_lbs_acre'])} </Typography>
            </Grid>
            <Grid item xs={1}>
                <Typography variant='caption'>{formatFloat(ev['p_lbs_acre'])} </Typography>
            </Grid>
            <Grid item xs={1}>
                <Typography variant='caption'>{formatFloat(ev['k_lbs_acre'])} </Typography>
            </Grid>
            <Grid item xs={1}>
                <Typography variant='caption'>{formatFloat(ev['salt_lbs_acre'])} </Typography>
            </Grid>

        </Grid>
    )

}


const AppEventHeaderRow = (props) => {
    return (
        <Grid item container xs={12}>
            <Grid item xs={2} align='center'>
                <Typography variant='caption' color='secondary' >Source name</Typography>
            </Grid>
            <Grid item xs={2} align='center'>
                <Typography variant='caption' color='secondary' >Material Type</Typography>
            </Grid>
            <Grid item xs={2}>

            </Grid>
            <Grid item xs={2} align='center'>
                <Typography variant='caption' color='secondary' >Amount applied</Typography>
            </Grid>
            <Grid item xs={1} >
                <Typography variant='caption' color='secondary' >N (lbs/ acre)</Typography>
            </Grid>
            <Grid item xs={1}>
                <Typography variant='caption' color='secondary' >P (lbs/ acre)</Typography>
            </Grid>
            <Grid item xs={1}>
                <Typography variant='caption' color='secondary' >K (lbs/ acre)</Typography>
            </Grid>
            <Grid item xs={1}>
                <Typography variant='caption' color='secondary' >Salt (lbs/ acre)</Typography>
            </Grid>

        </Grid>
    )

}


const AppEventTotalRow = (props) => {
    const totals = props.totals
    return (
        <Grid item container xs={12}>
            <Grid item xs={8} align='right' style={{ paddingRight: '8px' }}>
                <Typography variant='caption'>Totals</Typography>
            </Grid>
            <Grid item xs={1}>
                <Typography variant='caption'>{formatFloat(totals[0])} </Typography>
            </Grid>
            <Grid item xs={1}>
                <Typography variant='caption'>{formatFloat(totals[1])} </Typography>
            </Grid>
            <Grid item xs={1}>
                <Typography variant='caption'>{formatFloat(totals[2])} </Typography>
            </Grid>
            <Grid item xs={1}>
                <Typography variant='caption'>{formatFloat(totals[3])} </Typography>
            </Grid>

        </Grid>
    )

}

const AppEvent = (props) => {
    const appEvents = groupByKeys(props.events, ['app_date', 'app_method'])
    return (
        <Grid item xs={12}>
            {Object.keys(appEvents).sort(naturalSort).map((key, i) => {
                const appDateEvents = appEvents[key]
                let appDateEventSubTotals = [0, 0, 0, 0] // NPKSalt
                let headerInfo = appDateEvents.length > 0 ? appDateEvents[0] : {}
                return (
                    <Grid item xs={12} key={`${key + i}`}>
                        <HeaderRow headerInfo={headerInfo} />
                        <AppEventHeaderRow />
                        {
                            appDateEvents.sort((a, b) => naturalSortBy(a, b, 'entry_type')).map((ev, j) => {
                                appDateEventSubTotals = opArrayByPos(appDateEventSubTotals, [toFloat(ev.n_lbs_acre), toFloat(ev.p_lbs_acre), toFloat(ev.k_lbs_acre), toFloat(ev.salt_lbs_acre)])
                                return <AppEventRow key={`appDateEventRow${i}-${j}`} event={ev} />
                            })
                        }
                        <AppEventTotalRow totals={appDateEventSubTotals} />
                    </Grid>
                )
            })}


        </Grid>
    )
}

const TotalsRowUnderLineGrid = withStyles(theme => ({
    root: {
        borderBottom: `1px solid ${theme.palette.text.primary}`
    }
}))(Grid)


const FieldTotals = (props) => {
    const totals = props.totals
    return (
        <Grid item container xs={12}>
            <Grid item container xs={12}>
                <Grid item xs={4}></Grid>
                <Grid item xs={2}><Typography variant='caption' color='secondary'>Total N (lbs/ acre)</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='secondary'>Total P (lbs/ acre)</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='secondary'>Total K (lbs/ acre)</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='secondary'>Total Salt (lbs/ acre)</Typography></Grid>
            </Grid>
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Exisiting Soil Nutrient Content</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.soils[0])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.soils[1])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.soils[2])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.soils[3])}</Typography></Grid>
            </TotalsRowUnderLineGrid>
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Plowdown credit</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.plows[0])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.plows[1])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.plows[2])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.plows[3])}</Typography></Grid>
            </TotalsRowUnderLineGrid>
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Commercial Fertilizer/ Other</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.fertilizers[0])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.fertilizers[1])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.fertilizers[2])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.fertilizers[3])}</Typography></Grid>
            </TotalsRowUnderLineGrid>
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Dry manure</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.manures[0])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.manures[1])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.manures[2])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.manures[3])}</Typography></Grid>
            </TotalsRowUnderLineGrid>
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Process wastewater</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.wastewaters[0])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.wastewaters[1])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.wastewaters[2])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.wastewaters[3])}</Typography></Grid>
            </TotalsRowUnderLineGrid>
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Fresh water</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.freshwaters[0])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.freshwaters[1])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.freshwaters[2])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.freshwaters[3])}</Typography></Grid>
            </TotalsRowUnderLineGrid>

            {/* <Grid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Plant Tissue</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(0)}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(0)}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(0)}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(0)}</Typography></Grid>
            </Grid> */}
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Atmoshperic deposition</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.atmospheric_depo)}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(0)}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(0)}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(0)}</Typography></Grid>
            </TotalsRowUnderLineGrid>
            {/* <Grid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Subsurface (tile) drainage</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(0)}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(0)}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(0)}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(0)}</Typography></Grid>
            </Grid> */}
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Nutrients applied</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.total_app[0])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.total_app[1])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.total_app[2])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.total_app[3])}</Typography></Grid>
            </TotalsRowUnderLineGrid>
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Anticipated crop nutrient removal</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.anti_harvests[0])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.anti_harvests[1])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.anti_harvests[2])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.anti_harvests[3])}</Typography></Grid>
            </TotalsRowUnderLineGrid>
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Actual crop nutrient removal</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.actual_harvests[0])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.actual_harvests[1])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.actual_harvests[2])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.actual_harvests[3])}</Typography></Grid>
            </TotalsRowUnderLineGrid>
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Nutrient balance</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.nutrient_bal[0])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.nutrient_bal[1])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.nutrient_bal[2])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.nutrient_bal[3])}</Typography></Grid>
            </TotalsRowUnderLineGrid>
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={4}><Typography variant='caption' color='secondary'>Nutrient balance ratio</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.nutrient_bal_ratio[0])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.nutrient_bal_ratio[1])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.nutrient_bal_ratio[2])}</Typography></Grid>
                <Grid item xs={2}><Typography variant='caption' color='primary'>{formatFloat(totals.nutrient_bal_ratio[3])}</Typography></Grid>
            </TotalsRowUnderLineGrid>

            <Grid item container xs={12}>
                <Grid item xs={6}><Typography variant='caption' color='secondary'></Typography></Grid>
                <Grid item xs={2} align='right'><Typography variant='caption' color='secondary'>gallons</Typography></Grid>
                <Grid item xs={2} align='right'><Typography variant='caption' color='secondary'>acre-inches</Typography></Grid>
                <Grid item xs={2} align='right'><Typography variant='caption' color='secondary'>inches/acre</Typography></Grid>
            </Grid>
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={6}><Typography variant='caption' color='secondary'>Fresh water applied</Typography></Grid>
                <Grid item xs={2} align='right'><Typography variant='caption' color='primary'>{formatFloat(totals.freshwater_app[0])}</Typography></Grid>
                <Grid item xs={2} align='right'><Typography variant='caption' color='primary'>{formatFloat(totals.freshwater_app[1])}</Typography></Grid>
                <Grid item xs={2} align='right'><Typography variant='caption' color='primary'>{formatFloat(totals.freshwater_app[2])}</Typography></Grid>
            </TotalsRowUnderLineGrid>
            <TotalsRowUnderLineGrid item container xs={12}>
                <Grid item xs={6}><Typography variant='caption' color='secondary'>Process wastewater applied</Typography></Grid>
                <Grid item xs={2} align='right'><Typography variant='caption' color='primary'>{formatFloat(totals.wastewater_app[0])}</Typography></Grid>
                <Grid item xs={2} align='right'><Typography variant='caption' color='primary'>{formatFloat(totals.wastewater_app[1])}</Typography></Grid>
                <Grid item xs={2} align='right'><Typography variant='caption' color='primary'>{formatFloat(totals.wastewater_app[2])}</Typography></Grid>
            </TotalsRowUnderLineGrid>
        </Grid>
    )
}


class AppsByField extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dairy_id: props.dairy_id,
            viewFieldKey: '',
            viewPlantDateKey: '',
            allAppEvents: {},
            eventKeyObj: {},
            allFieldAppSummary: {}
        }
        this.chart = null
    }

    componentDidMount() {
        this.getNutrientBudget()
        this.createChart()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.dairy_id !== this.props.dairy_id || this.props.parentUpdated !== prevProps.parentUpdated) {
            this.getNutrientBudget().then(res => this.updateChart())
        }
        else if (this.state.viewFieldKey !== prevState.viewFieldKey ||
            this.state.viewPlantDateKey !== prevState.viewPlantDateKey) {
            this.updateChart()
        }
    }

    async getNutrientBudget() {
        const { allAppEvents,  // Used to get all events for a field crop 
            eventKeyObj, // Used to get fields and plant_date {field: {plant_date: {}}}
            nutrientBudgetB: { allEvents: allFieldAppSummary }  // Summaries for each field crop, key: 'fieldtitle plant_date'
        } = await getNutrientBudgetInfo(this.props.dairy_id)

        const keys = Object.keys(eventKeyObj).sort(naturalSort)
        if (keys.length > 0) {
            this.setState({
                allAppEvents,
                eventKeyObj,
                allFieldAppSummary,
                viewFieldKey: keys[0]
            })
        } else {
            this.setState({
                allAppEvents: {},
                eventKeyObj: {},
                allFieldAppSummary: {},
                viewFieldKey: ''
            })
        }
    }


    getAppEventsByViewKeys() {
        // Returns a list of objects for the selected viewFieldKey && viewPlantDateKey
        if (this.state.viewFieldKey && this.state.viewPlantDateKey && this.state.allAppEvents[`${this.state.viewFieldKey}${this.state.viewPlantDateKey}`]) {
            return this.state.allAppEvents[`${this.state.viewFieldKey}${this.state.viewPlantDateKey}`]
        }
        return []
    }

    getAppEventTotalsByViewKeys() {
        // Returns a list of objects for the selected viewFieldKey && viewPlantDateKey
        if (this.state.viewFieldKey && this.state.viewPlantDateKey && this.state.allFieldAppSummary[`${this.state.viewFieldKey}${this.state.viewPlantDateKey}`]) {
            const data = this.state.allFieldAppSummary[`${this.state.viewFieldKey}${this.state.viewPlantDateKey}`]
            return [data.total_app, data.anti_harvests, data.actual_harvests]
        }
        return [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
    }


    getFieldTotalsByViewKeys() {
        // Returns a list of objects for the selected viewFieldKey && viewPlantDateKey
        if (this.state.viewFieldKey && this.state.viewPlantDateKey && this.state.allFieldAppSummary[`${this.state.viewFieldKey}${this.state.viewPlantDateKey}`]) {
            const data = this.state.allFieldAppSummary[`${this.state.viewFieldKey}${this.state.viewPlantDateKey}`]
            return data
        }
        return {}
    }

    createChart() {
        let chartData = this.getAppEventTotalsByViewKeys()
        const labels = ['N', 'P', 'K', "Salt"]
        chartData = [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]]
        this.chart = createBarChart(document.getElementById('fieldSummaryChart'), barChartConfig(labels, chartData, '#00000000'))
    }
    /** Chart isnt displaying Numbers on top of bars 
     */

    updateChart() {
        let chartData = this.getAppEventTotalsByViewKeys()
        this.addData(this.chart, chartData)
    }

    addData(chart, data) {
        this.chart.data.datasets.forEach((dataset, i) => {
            dataset.data = data[i]
        });
        this.chart.update();
    }

    render() {
        return (
            <Grid item container xs={12}>
                <Grid item container xs={12}>
                    {renderFieldButtons(this.state.eventKeyObj, this)}
                    {renderCropButtons(this.state.eventKeyObj, this.state.viewFieldKey, this)}
                </Grid>
                <Grid item xs={12} style={{ marginTop: '8px', marginBottom: '8px' }}>
                    <CurrentFieldCrop
                        viewFieldKey={this.state.viewFieldKey}
                        viewPlantDateKey={this.state.viewPlantDateKey}
                    />
                </Grid>
                <Grid item container spacing={4} xs={12}>
                    <Grid item xs={6}>
                        <canvas id="fieldSummaryChart" style={{ maxHeight: "350px" }}></canvas>
                    </Grid>
                    <Grid item xs={6}>
                        {Object.keys(this.getFieldTotalsByViewKeys()).length > 0 ?
                            <FieldTotals
                                totals={this.getFieldTotalsByViewKeys()}
                            />
                            :
                            <div>No totals to show</div>
                        }
                    </Grid>

                    <Grid item xs={12} style={{ marginTop: '24px' }}>
                        {this.getAppEventsByViewKeys().length > 0 ?
                            <AppEvent
                                events={this.getAppEventsByViewKeys()}
                            />
                            :
                            <div>No events to show</div>
                        }
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}

export default AppsByField = withTheme(withRouter(AppsByField))