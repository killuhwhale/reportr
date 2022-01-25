import {
    Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import { formatDate, groupByKeys, naturalSort, naturalSortBy, nestedGroupBy } from "../../utils/format"


const renderFieldButtons = (appEventObj, that) => {
    return appEventObj ?
        <Grid item container xs={12}>
            <Grid item xs={12}><Typography variant='h6'>Fields</Typography> </Grid>

            {
                Object.keys(appEventObj).sort(naturalSort).map(key => {
                    const fieldCropObj = appEventObj[key]
                    return (
                        <Grid item xs={2} key={`fieldButton${key}`} style={{ marginTop: '8px' }}>
                            <Button variant='outlined' color='primary'
                                onClick={() => that.setState({ viewFieldKey: key, viewPlantDateKey: '' })}>
                                {key}
                            </Button>
                        </Grid>
                    )
                })
            }
        </Grid>
        :
        <span>empty</span>
}

const renderCropButtons = (appEventObj, viewFieldKey, that) => {
    return viewFieldKey && appEventObj[viewFieldKey] ?

        <Grid item container xs={12} style={{ marginTop: '16px' }}>
            <Grid item xs={12}><Typography variant='h6'>Plant dates</Typography> </Grid>
            {
                Object.keys(appEventObj[viewFieldKey]).sort(naturalSort).map(key => {
                    const fieldCropAppList = appEventObj[viewFieldKey][key]
                    const dateKey = key.indexOf("T") > 0 ? formatDate(key.split("T")[0]) : ''
                    return (
                        <Grid item xs={3} style={{ marginTop: '8px' }} key={`cropButton${key}`} >
                            <Button variant='outlined' color='secondary'
                                onClick={() => that.setState({ viewPlantDateKey: key })}>
                                {dateKey}
                            </Button>
                        </Grid>
                    )
                })
            }
        </Grid>
        :
        <div> No Field Chosen </div>

}

export { renderFieldButtons, renderCropButtons }