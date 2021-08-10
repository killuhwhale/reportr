import React, { Component } from 'react'
// Material UI
import { 	Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';
import FieldForm from "../Field/fieldForm"


// Creates a new Field
// Starting with empty Field object,
//  Give to FieldForm to update each TextField to that object
//  This calls on udpated and sets the state to save the updated info
// The onAction method given by the parent will send the Field object to be saved in the data base
//                  Data flow
//       this file          <==>   destn.
//  empty data in Modal      => form component
//  Updated data from user   <= form component
//  Updated data -> onAction => parent

class AddFieldModal extends Component{
	constructor(props){
		super(props)
		this.state = {
			open: props.open,
      field: {title: "", acres: "", cropable: ""}
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

  onUpdate(pk, field){
    console.log("onUpdateForm Fields")
    console.log(pk, field)
    this.setState({field: field})
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
					<Paper style={{height:"25vh", display: "flex", flexDirection: "column", justifyContent: "center"}}>
						<Grid item container xs={12}>
							<Grid item xs={12}>
								<Typography style={{marginTop: "32px"}}>
									{this.props.modalText}
								</Typography>
							</Grid>
							<Grid item xs={12}>
                <FieldForm 
                  field={this.state.field}
									titleEditable={true}
                  onUpdate={this.onUpdate.bind(this)}
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
									onClick={()=>{ this.props.onAction(this.state.field)}}>
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

export default AddFieldModal = withTheme(AddFieldModal);