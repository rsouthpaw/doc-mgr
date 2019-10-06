import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContentText from "@material-ui/core/DialogContentText";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Api from "../api/Api";

const styles = theme => ({
  textField: {}
});

class FileRevisions extends React.Component {
  downloadFile(fileId) {
    Api.files.download(fileId);
  }
  handleClose() {
    this.props.handleClose();
  }
  render() {
    console.log(this.props);
    return (
      <div>
        <Dialog
          open={this.props.open}
          onClose={this.handleClose.bind(this)}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">File Revisions</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You can see all the revisions of a file here. Click on any one of
              them to download.
            </DialogContentText>
            <List dense={true}>
              {this.props.revisions.map(revision => (
                <ListItem key={revision.file_id} button onClick={this.downloadFile.bind(this, revision.file_id)}>
                  <ListItemText
                    primary={
                      "Date: " +
                      new Date(revision.ts_revised).toLocaleDateString()
                    }
                    secondary="Click to download"
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose.bind(this)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(FileRevisions);

/*
              {this.props.revisions.map(
                <ListItem>
                  <ListItemText
                    primary="Single-line item"
                    secondary="ala"
                  />
                </ListItem>,
              )}
*/
