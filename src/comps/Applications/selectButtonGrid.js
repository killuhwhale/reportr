import {
    Grid, Paper, Button, Typography, IconButton, Tooltip, TextField
} from '@material-ui/core'
import { formatDate, groupByKeys, naturalSort, naturalSortBy, nestedGroupBy } from "../../utils/format"


/** Create buttons based on appEventObj 
 * Given and Object as appEventObj = {
 *  fieldtitle: {
 *      plant_date: [{ev}, {info}]
 *  }
 * } 
 * 
 * Fields
 *      - Create Buttons based on the keys for field by iterater over the object keys
 *      - sets state so crops will render on change
 * 
 * Crops
 *      - Create Buttons based on Selected Field key by iterating over the object keys 
 *      - appEventObj[selectedKeyFromUser]
 * */

const renderFieldButtons = (appEventObj, that) => {

    return appEventObj ?
        <Grid item container xs={12}>
            <Grid item xs={12}><Typography variant='h6'>Fields</Typography> </Grid>

            {
                Object.keys(appEventObj).sort(naturalSort).map(key => {
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
        <Grid item xs={12}>No Fields</Grid>
}

const renderCropButtons = (appEventObj, viewFieldKey, that) => {
    return viewFieldKey && appEventObj[viewFieldKey] ?

        <Grid item container xs={12} style={{ marginTop: '16px' }}>
            <Grid item xs={12}><Typography variant='h6'>Plant dates</Typography> </Grid>
            {
                Object.keys(appEventObj[viewFieldKey]).sort(naturalSort).map(key => {
                    const dateKey = key.indexOf("T") > 0 ? formatDate(key.split("T")[0]) : ''
                    return (
                        <Grid item xs={2} style={{ marginTop: '8px' }} key={`cropButton${key}`} >
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
        <Grid item xs={12}>No Plant Dates</Grid>

}

const CurrentFieldCrop = (props) => {
    const viewFieldKey = props.viewFieldKey
    const viewPlantDateKey = props.viewPlantDateKey
    return (
        <Typography variant="h6">
            {viewFieldKey.length ? viewFieldKey : 'No Fields'} {viewPlantDateKey.length > 0 ? formatDate(viewPlantDateKey.split('T')[0]) : ''}
        </Typography>
    )
}

export { renderFieldButtons, renderCropButtons, CurrentFieldCrop }