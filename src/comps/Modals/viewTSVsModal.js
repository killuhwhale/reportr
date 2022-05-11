import React, { Component } from 'react'
// Material UI
import { Grid, Paper, Button, Typography, Modal, IconButton, Tooltip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete'
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import { withTheme } from '@material-ui/core/styles';
import ActionCancelModal from './actionCancelModal';
import { get, post } from '../../utils/requests';


class ViewTSVsModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      dairy_id: props.dairy_id,
      tsvType: props.tsvType,
      tsvs: [],
      checkedForTSVs: false,
      showDeleteTSV: false,
      curDeleteObj: {}
    }
  }
  static getDerivedStateFromProps(props, state) {
    return props
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.state.open && this.state.tsvs.length == 0 && !this.state.checkedForTSVs) {
      this.getAllTSVs()
    } else if (prevState.open !== this.state.open) {
      this.getAllTSVs()
    }
  }
  getAllTSVs() {
    get(`${this.props.BASE_URL}/api/tsv/${this.state.dairy_id}/${this.state.tsvType}`)
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
    post(`${this.props.BASE_URL}/api/tsv/delete`, {
      pk: this.state.curDeleteObj.pk,
      dairy_id: this.state.dairy_id
    })
      .then(res => {
        console.log(res)
        this.toggleShowDeleteTSV(false)
        this.getAllTSVs()
      })
      .catch(err => {
        console.log(err)
      })

  }

  printTSV() {
    let frame = document.getElementById('tsvPrintFrame')
    if (frame) {
      frame.src = `/tsv/${this.state.dairy_id}/${this.state.tsvType}`;                   // Set source.
    } else {
      frame = document.createElement('iframe')
      frame.id = "tsvPrintFrame"
      frame.style.visibility = 'hidden';                // Hide the frame.
      frame.src = `/tsv/${this.state.dairy_id}/${this.state.tsvType}`;                   // Set source.
      document.body.appendChild(frame);  // Add the frame to the web page.
    }
    // frame.contentWindow.focus();       // Set focus.
    // frame.contentWindow.print();       // Print it.
  }

  downloadTSV(tsv) {

    console.log("Downloading TSV", tsv)

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(tsv.data));
    element.setAttribute('download', tsv.title);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);



  }

  onModalClose() {
    let frame = document.getElementById('tsvPrintFrame')

    if (frame) {
      document.body.removeChild(frame)
    }

    this.props.onClose()
  }

  render() {
    return (
      <Modal
        open={this.state.open}
        onClose={this.onModalClose.bind(this)}
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
            <Paper style={{ height: "235px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Grid item container xs={12}>
                <Grid item xs={12} style={{ marginBottom: "16px" }}>
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
                            <Tooltip title="Print TSV file">
                              <IconButton onClick={this.printTSV.bind(this)}>
                                <RemoveRedEyeIcon color='primary' />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                          <Grid item xs={1} align="center">
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
                  <Button
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