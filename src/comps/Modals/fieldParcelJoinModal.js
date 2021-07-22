import React, { Component } from 'react'
// Material UI
import { 	Grid, Paper, Button, Typography, Modal, TextField } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';


class FieldParcelJoinModal extends Component{
	constructor(props){
		super(props)
		this.state = {
			open: props.open,
			parcels: props.parcels,
      fields: props.fields,
      curJoinFieldIdx: props.curJoinFieldIdx,
      curJoinParcelIdx: props.curJoinParcelIdx,
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
					<Paper style={{height:"25vh", display: "flex", flexDirection: "column", justifyContent: "center"}}>
						<Grid item container xs={12}>
							<Grid item xs={12}>
								<Typography style={{marginTop: "32px"}}>
									{this.props.modalText}
								</Typography>
							</Grid>
							<Grid item container spacing={2} justifyContent="center" alignItems='center' xs={12}>
                <Grid item xs={5}>
                  <TextField select
                    name='curJoinFieldIdx'  
                    value={this.state.curJoinFieldIdx}
                    onChange={this.props.onChange.bind(this)}
                    label="Fields"
                    style={{width: "100%"}}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.state.fields.length > 0 ?
											this.state.fields.map((field, i) => {
												return(
													<option key={`fieldJoinFPJM${i}`} value={i}>{field.title}</option>
												)
											})
										:
										<option >No Fields</option>	
									}
                  </TextField>
                </Grid>
                <Grid item xs={5}>
                  <TextField select
                    name='curJoinParcelIdx'  
                    value={this.state.curJoinParcelIdx}
                    onChange={this.props.onChange.bind(this)}
                    label="Parcels"
                    style={{width: "100%"}}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {this.state.parcels.map((parcel, i) => {
                      return(
                        <option key={`parcelJoinFPJM${i}`} value={i}>{parcel.pnumber}</option>
                      )
                    })}
                  </TextField>
                </Grid>
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
									onClick={()=>{ this.props.onAction(this.state.curNumber)}}>
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

export default FieldParcelJoinModal = withTheme(FieldParcelJoinModal);