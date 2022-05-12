import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';
import { Company } from '../../utils/company/company'

class AddCompanyModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            companyTitle: ''
        }
    }

    onChange(ev) {
        const { name, value } = ev.target
        this.setState({ [name]: value })
    }

    async addCompany() {
        const companyTitle = this.state.companyTitle
        if (companyTitle.length <= 0) {
            return
        }

        const res = await Company.createCompany(companyTitle)

        if (res.error) {
            return this.props.onAlert('Company not created!', 'error')
        }


        this.props.onClose()
        this.props.onAlert('Company created!', 'success')
        this.props.onCreateCompany()
        return res
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
                        <Paper style={{ height: "200px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <Grid item container xs={12}>
                                <Grid item xs={12}>
                                    <Typography style={{ marginTop: "32px" }}>
                                        {this.props.modalText}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name='companyTitle'
                                        value={this.state.companyTitle}
                                        onChange={this.onChange.bind(this)}
                                        label="Company name"
                                        style={{ width: "75%" }}

                                    />
                                </Grid>


                                <Grid item xs={6}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => { this.props.onClose() }}>
                                        {this.props.cancelText}
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        color="primary"
                                        variant="outlined"
                                        onClick={this.addCompany.bind(this)}>
                                        {this.props.actionText}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </div>
            </Modal>

        )
    }

}

export default AddCompanyModal = withTheme(AddCompanyModal);