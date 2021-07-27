import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, IconButton, Tooltip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete'
import AddIcon from '@material-ui/icons/Add'
import { withTheme } from '@material-ui/core/styles';
import ActionCancelModal from './actionCancelModal';
import { get, post } from '../../utils/requests';
const BASE_URL = "http://localhost:3001"

class ViewTSVsModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      dairy_id: props.dairy_id,
      tsvs: [],
      checkedForTSVs: false,
      showDeleteTSV: false,
      curDeleteObj: {}
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
  static getDerivedStateFromProps(props, state) {
    return props
  }
  componentDidUpdate() {
    if (this.state.open && this.state.tsvs.length == 0 && !this.state.checkedForTSVs) {
      this.getAllTSVs()
    }
  }
  getAllTSVs() {
    get(`${BASE_URL}/api/tsv/${this.state.dairy_id}`)
      .then(res => {
        this.setState({
          hasTSVs: res.length > 0,
          tsvs: res
        })
      })
  }
  onDeleteTSV(tsv) {
    console.log(tsv)
    this.setState({ curDeleteObj: tsv, showDeleteTSV: true })
  }
  toggleShowDeleteTSV(val) {
    this.setState({ showDeleteTSV: val })
  }
  deleteTSV() {
    console.log("Deleteing tsv", this.state.curDeleteObj)
    post(`${BASE_URL}/api/tsv/delete`, {pk: this.state.curDeleteObj.pk})
    .then(res => {
      console.log(res)
      this.toggleShowDeleteTSV(false)
      this.getAllTSVs()
    })
    .catch(err => {
      console.log(err)
    })
  
  }

  downloadTSV(tsv){
    console.log("Downloading TSV", tsv)

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(tsv.data));
    element.setAttribute('download', tsv.title);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  
   
    
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
            <Paper style={{ height: "75vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Grid item container xs={12}>
                <Grid item xs={12} style={{marginBottom: "16px"}}>
                  <Typography variant="h2" color="secondary">
                    TSVs
                  </Typography>
                </Grid>
                <Grid item xs={12} style={{ maxHeight: "50vh", overflow: "auto" }}>
                  {this.state.tsvs.length > 0 ?
                    this.state.tsvs.map((tsv, i) => {
                      return (
                        <Grid item container xs={12} key={`vtsvsm${i}`}>
                          <Grid item xs={10}>
                            {tsv.title}
                          </Grid>
                          <Grid item xs={1} align="right">
                            <Tooltip title="Download TSV file">
                              <IconButton onClick={() => this.downloadTSV(tsv)}>
                                <AddIcon style={{color: this.props.theme.palette.text.primary}} />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                          <Grid item xs={1}align="center">
                            <Tooltip title="Delete TSV file">
                              <IconButton onClick={() => this.onDeleteTSV(tsv)}>
                                <DeleteIcon color="error" />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      )
                    })
                    :
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        Could not find any TSVs.
                      </Typography>
                    </Grid>
                  }

                </Grid>
                <Grid item xs={12}>
                  <Button fullWidth
                    variant="outlined"
                    onClick={() => { this.props.onClose() }}>
                    {this.props.cancelText}
                  </Button>
                </Grid>
              </Grid>


              <ActionCancelModal
                open={this.state.showDeleteTSV}
                actionText="Delete"
                cancelText="Cancel"
                modalText={`Delete ${this.state.curDeleteObj.title}?`}
                onAction={() => {
                  this.deleteTSV()
                  this.toggleShowDeleteTSV(false)
                }
                }
                onClose={() => this.toggleShowDeleteTSV(false)}

              />
            </Paper>
          </Grid>
        </div>

      </Modal>
    )
  }
}

export default ViewTSVsModal = withTheme(ViewTSVsModal);