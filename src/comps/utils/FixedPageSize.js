import { withStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'

const FixedPageSize = withStyles((theme) =>
({
    root: {
        minHeight: props => props.height,
        maxHeight: props => props.height,
        alignContent: 'baseline',
        overflow: 'auto'
    }
})
)(Grid)

const MinPageSize = withStyles((theme) =>
({
    root: {
        minHeight: props => props.height,
        overflow: 'auto'
    }
})
)(Grid)

const MaxPageSize = withStyles((theme) =>
({
    root: {
        maxHeight: props => props.height,
        overflow: 'auto'
    }
})
)(Grid)

export { FixedPageSize, MinPageSize, MaxPageSize }