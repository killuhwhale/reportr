import React, { Component } from 'react'
// Material UI
import{
  Grid, Paper, Button, Typography, Modal, TextField, Switch 
}
from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';

class OperatorModal extends Component{

	constructor(props){
		super(props)
		this.state = {
			open: props.open,
      operator: props.operator
		}
		/*
		open
		actionText
		cancelText
		modalText
		onAction
		onClose
		*/
	}

	static getDerivedStateFromProps(props, state){
		return props
	}

	render(){
		return (
			<Modal
			    open={this.state.open}
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
					<Paper style={{height:"40vh", display: "flex", flexDirection: "column", justifyContent: "center"}}>
						<Grid item container xs={12}>
							<Grid item xs={12}>
								<Typography style={{marginTop: "32px"}}>
									{this.props.modalText}
								</Typography>
							</Grid>
							<Grid item xs={4}>
								<TextField 
									name='title'  
									value={this.state.operator.title}
									onChange={this.props.onChange}
									label="Owner / Operator Name"
									style={{width: "100%"}}
								/>
							</Grid>
              <Grid item xs={4}>
								<TextField 
									name='primary_phone'  
									value={this.state.operator.primary_phone}
									onChange={this.props.onChange}
									label="Primary phone number"
									style={{width: "100%"}}
								/>
							</Grid>
              <Grid item xs={4}>
								<TextField 
									name='secondary_phone'  
									value={this.state.operator.secondary_phone}
									onChange={this.props.onChange}
									label="Secondary phone number"
									style={{width: "100%"}}
								/>
							</Grid>
              <Grid item xs={6}>
								<TextField 
									name='street'  
									value={this.state.operator.street}
									onChange={this.props.onChange}
									label="Street"
									style={{width: "100%"}}
								/>
							</Grid>
              <Grid item xs={4}>
								<TextField 
									name='city'  
									value={this.state.operator.city}
									onChange={this.props.onChange}
									label="City"
									style={{width: "100%"}}
								/>
							</Grid>
              <Grid item xs={2}>
								<TextField 
									name='city_state'  
									value={this.state.operator.city_state}
									onChange={this.props.onChange}
									label="State"
									style={{width: "100%"}}
								/>
							</Grid>
              <Grid item xs={4}>
								<TextField 
									name='city_zip'  
									value={this.state.operator.city_zip}
									onChange={this.props.onChange}
									label="Zip"
									style={{width: "100%"}}
								/>
							</Grid>

              <Grid item xs={4}>
                <Typography variant="caption">
                  Responsible for permit fees
                </Typography>
                <Switch
                  color="secondary"
                  label="Responsible for permit fees"
                  checked={this.state.operator.is_responsible}
                  onChange={(ev) => this.props.onChange({target: {name: 'is_responsible', value: ev.target.checked}})}
                />
              </Grid>

              <Grid item xs={2}>
                <Typography variant="caption">
                    Is Owner
                </Typography>
                <Switch
                  color="secondary"
                  label="Owner"
                  checked={this.state.operator.is_owner}
                  onChange={(ev) => this.props.onChange({target: {name: 'is_owner', value: ev.target.checked}})}
                />
              </Grid>
							<Grid item xs={2}>
                <Typography variant="caption">
                    Is Operator
                </Typography>
                <Switch
                  color="secondary"
                  label="Owner"
                  checked={this.state.operator.is_operator}
                  onChange={(ev) => this.props.onChange({target: {name: 'is_operator', value: ev.target.checked}})}
                />
              </Grid>
              


							<Grid item xs={6}>
								<Button
									variant="outlined"
									onClick={()=>{ this.props.onClose()}}>
									{this.props.cancelText}
								</Button>
							</Grid>
							<Grid item xs={6}>
								<Button
									color="primary"
									variant="outlined"
									onClick={()=>{ this.props.onAction()}}>
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

export default OperatorModal = withTheme(OperatorModal);