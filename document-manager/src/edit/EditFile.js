import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Api from "../api/Api";

const styles = theme => ({
  textField: {}
});

class EditFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileData: "",
    };
  }
  handleClose() {
    this.props.handleClose();
  }
  pullFileData() {
    Api.files.pullData(this.props.fileId).then(
      response => {
        console.log(response);
        if (response.data.success && response.data.data != null) {
          this.setState({ fileData: response.data.data });
        } else {
          // handle error
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  updateFile() {
    var json = {};
    json.data = this.state.fileData;
    json.file_id = this.props.fileId;
    Api.files.update(json).then(
      response => {
        console.log(response);
        if (response.data.success) {
          this.props.fileUpdated();
          // show snackbar
        } else {
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  render() {
    const { classes } = this.props;
    return (
      <div>
        <Dialog
          open={this.props.open}
          onEnter={this.pullFileData.bind(this)}
          onClose={this.handleClose.bind(this)}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Edit File</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Create new revision of this file. Edit file and click on update to
              save new revision for file.
            </DialogContentText>
            <TextField
              id="outlined-multiline-flexible"
              label="Multiline"
              value={this.state.fileData}
              multiline
              rowsMax="16"
              fullWidth
              onChange={e => this.setState({ fileData : e.target.value })}
              className={classes.textField}
              margin="normal"
              helperText="File Contents"
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose.bind(this)} color="primary">
              Cancel
            </Button>
            <Button onClick={this.updateFile.bind(this)} color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(EditFile);
