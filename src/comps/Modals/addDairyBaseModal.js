import React, { Component } from 'react'
// Material UI
import { 	Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';

import { get, post } from "../../utils/requests"

const BASE_URL = "http://localhost:3001"



class AddBaseDairyModal extends Component{
	constructor(props){
		super(props)
		this.state = {
			open: props.open,
			createDairyTitle: ''
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


  createBaseDairy() {
    const title = this.state.createDairyTitle
    if(title && title.length > 0){
      post(`${BASE_URL}/api/dairy_base/create`, { 
        title
      })
        .then(res => {
          console.log("Call this.props.getAllDairyBases()", res)
					this.props.onDone()
          this.props.onClose()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  onChange(ev){
    const { name, value } = ev.target
    this.setState({ [name]: value })
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
								<TextField 
									name='createDairyTitle'  
									value={this.state.createDairyTitle}
									onChange={this.onChange.bind(this)}
									label="Name of Dairy"
									style={{width: "100%"}}
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
									onClick={this.createBaseDairy.bind(this)}>
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

export default AddBaseDairyModal = withTheme(AddBaseDairyModal);