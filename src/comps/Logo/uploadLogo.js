import { Button, Grid, IconButton, Tooltip } from '@material-ui/core'
import { withTheme } from '@material-ui/core/styles'
import PanoramaIcon from '@material-ui/icons/Panorama';
import React, { Component } from 'react'
import { withRouter } from "react-router-dom"
import { Logo } from '../../utils/Logo/logo'
import UploadTSVModal from '../Modals/uploadTSVModal'


class UploadLogo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            logoUrl: '',
            company_id: props.company_id,
            showUploadModal: false,
            filename: '',
            file: null,
            filetype: ''

        }
    }

    componentDidMount() {
        this.getLogo()
    }

    componentDidUpdate(prevProps, prevState) {

    }

    async getCompanyLogo() {

    }

    async getLogo() {
        console.log("Starting to Getting Logo ")
        try {
            const logo = await Logo.getLogo(this.state.company_id)
            if (logo.error) {
                return console.log(logo)
            }
            this.setState({ logoUrl: logo })
        } catch (e) {
            console.log(e)
            return { error: e }
        }

    }

    onFileChange(ev) {
        console.log(ev.target.files)
        const { files } = ev.target
        const file = files[0]
        this.setState({ filename: file.name, file, filetype: file.type })

    }
    async uploadCompanyLogo() {
        const res = await Logo.uploadLogo(this.state.file, this.state.filetype, this.state.company_id)
        console.log(res)
        if (res.error) {
            return console.log("Error uploading image")
        }
        this.getLogo()
        this.toggleUploadModal(false)
    }

    toggleUploadModal(val) {
        this.setState({ showUploadModal: val })
    }

    render() {
        return (
            <Grid item xs={12} container className='showOnHoverParent'>
                {this.state.logoUrl ?
                    <div style={{ position: 'relative', width: '100%' }}>
                        <img src={this.state.logoUrl} style={{ width: '100%', height: '65px', borderRadius: '8px' }} />
                        <Tooltip title='Update logo' className='showOnHover' style={{ position: 'absolute', bottom: '0px', right: '0px' }}>
                            <IconButton onClick={() => this.toggleUploadModal(true)} size='medium' >
                                <PanoramaIcon style={{ fontSize: '2.75rem', color: '#54efd3' }} />
                            </IconButton>
                        </Tooltip>
                    </div>
                    :
                    <Grid item xs={12}>

                        <Button variant="outlined" color="primary" component="label" onClick={() => this.toggleUploadModal(true)}>
                            Select Logo
                        </Button>
                    </Grid>
                }

                <UploadTSVModal
                    open={this.state.showUploadModal}
                    actionText="Upload"
                    cancelText="Cancel"
                    modalText={`Upload Company Logo`}
                    selectFileText='Select Image'
                    fileType="image/png,image/jpeg,image/jpg"
                    uploadedFilename={this.state.filename}
                    onAction={this.uploadCompanyLogo.bind(this)}
                    onChange={this.onFileChange.bind(this)}
                    onClose={() => this.toggleUploadModal(false)}
                />
            </Grid>
        )
    }
}

export default UploadLogo = withRouter(withTheme(UploadLogo))
