import React from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import DescriptionIcon from "@material-ui/icons/Description";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import HistoryIcon from "@material-ui/icons/History";
import GetAppIcon from "@material-ui/icons/GetApp";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import Api from "../api/Api";
import SearchIcon from "@material-ui/icons/Search";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import EditFile from "../edit/EditFile";
import FileRevisions from "../revisions/FileRevisions";

const styles = theme => ({
  icon: {
    marginRight: theme.spacing(2)
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  cardMedia: {
    paddingTop: "56.25%"
  },
  cardContent: { flexGrow: 1 },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6)
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  },
  textField: {
    margin: "6px"
  },
  inputSearchBar: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  serachBar: {
    padding: "6px 8px",
    display: "flex",
    alignItems: "center",
    marginTop: "20px",
    width: 370,
    background: "#fff"
  },
  dropdown: { marginLeft: "6px", marginBottom: "10px", paddingTop: "6px" }
});

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openAddDialogOpen: false,
      files: [],
      savedFiles: [],
      filteredFiles: [],
      fileIds: [],
      fileName: "",
      department: "",
      showRevisionDialog: false,
      expiry: new Date("2020-12-25T10:30"),
      description: "",
      editFile: false,
      selectedRevisions: []
    };
  }
  componentDidMount() {
    this.fetchDocuments();
  }
  openAddDialog() {
    this.setState({ addDialogOpen: true });
  }
  closeAddDialog() {
    this.clearFileState();
    this.setState({ addDialogOpen: false });
  }
  handleLogout() {
    this.props.onLogout();
  }
  saveFile() {
    if (this.state.files.length === 0) {
      // Show error and return
      return;
    }
    if (this.state.fileName === "") {
      // Show error and return
      return;
    }
    var json = {};
    json.file_id = this.state.files[0].serverId;
    json.name = this.state.fileName;
    json.expiry = new Date(this.state.expiry).toISOString();
    json.department = this.state.department;
    console.log(json);
    Api.files.add(json).then(
      response => {
        console.log(response);
        if (response.data.success) {
          this.closeAddDialog();
          this.fetchDocuments();
          // show snackbar
        } else {
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  clearFileState() {
    this.setState({ files: [] });
  }
  fetchDocuments() {
    Api.files.get().then(
      response => {
        console.log(response);
        if (response.data.success) {
          if (response.data.files != null) {
            this.setState({
              savedFiles: this.filterDocuments(response.data.files)
            });
            this.setState({
              filteredFiles: this.state.savedFiles
            });
          } else {
            this.setState({
              savedFiles: []
            });
          }
          console.log(this.state.savedFiles);
          // update array
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  downloadFile(fileId, name) {
    Api.files.download(fileId, name);
  }
  filterDocuments(files) {
    for (var i = 0; i < files.length; i++) {
      files[i].created_at_readable = new Date(
        files[i].created_at
      ).toDateString();
      files[i].expiry_readable = new Date(files[i].expiry).toDateString();
    }
    return files;
  }
  departmentChanged(e) {
    console.log(this.state.department);
    this.setState({ department: e.target.value });
    console.log(this.state.department);
  }
  editFile(fileId) {
    this.setState({ editFile: true, selectedFileId: fileId });
  }
  deleteFile(fileId) {
    var json = {};
    json.file_id = fileId;
    Api.files.delete(json).then(
      response => {
        console.log(response);
        if (response.data.success) {
          this.fetchDocuments();
          // update array
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  closeEditFile() {
    this.setState({ editFile: false });
  }
  fileUpdated() {
    this.closeEditFile();
    this.fetchDocuments();
  }
  viewRevisions() {}
  searchTextChanged(e) {
    if (e.target.value == null || e.target.value === "") {
      this.setState({
        filteredFiles: this.state.savedFiles
      });
      return;
    }
    var val = e.target.value;
    var files = this.state.savedFiles;
    var filtered = [];
    for (var i = 0; i < files.length; i++) {
      if (
        JSON.stringify(files[i])
          .toLowerCase()
          .indexOf(val) !== -1
      ) {
        filtered.push(files[i]);
      }
    }
    this.setState({ filteredFiles: filtered });
  }
  showRevisions(revisions, fileId, ts) {
    console.log(revisions);
    if (revisions == null || revisions.length === 0) {
      var newRevision = [];
    } else {
      var newRevision = revisions.slice();
    }
    var json = [];
    json.file_id = fileId;
    json.ts_revised = ts;
    newRevision.push(json);
    console.log(newRevision);
    this.setState({
      showRevisionDialog: true,
      selectedRevisions: newRevision
    });
  }
  closeRevisions() {
    this.setState({ showRevisionDialog: false });
  }
  render() {
    const { classes } = this.props;
    return (
      <div>
        <React.Fragment>
          <CssBaseline />
          <AppBar position="static">
            <Toolbar>
              <IconButton
                edge="start"
                className={classes.menuButton}
                color="inherit"
                aria-label="menu"
              >
                <DescriptionIcon />
              </IconButton>
              <Typography variant="h6" className={classes.title}>
                Document Manager
              </Typography>
              <Button color="inherit" onClick={this.handleLogout.bind(this)}>
                Logout
              </Button>
            </Toolbar>
          </AppBar>
          <main>
            {/* Hero unit */}
            <div className={classes.heroContent}>
              <Container maxWidth="sm">
                <Typography
                  component="h1"
                  variant="h2"
                  align="center"
                  color="textPrimary"
                  gutterBottom
                >
                  Documents
                </Typography>
                <Typography
                  variant="h5"
                  align="center"
                  color="textSecondary"
                  paragraph
                >
                  Add or remove documents here
                </Typography>
                <div className={classes.heroButtons}>
                  <Grid container spacing={2} justify="center">
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.openAddDialog.bind(this)}
                      >
                        Add Document
                      </Button>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} justify="center">
                    <Grid item>
                      <Paper className={classes.serachBar}>
                        <SearchIcon />
                        <InputBase
                          className={classes.inputSearchBar}
                          onChange={e => this.searchTextChanged(e)}
                          placeholder="Search Documents by Name, Description etc"
                          inputProps={{ "aria-label": "search" }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </div>
              </Container>
            </div>
            <Container className={classes.cardGrid} maxWidth="md">
              {/* End hero unit */}
              <Grid container spacing={4}>
                {this.state.filteredFiles.map(file => (
                  <Grid item key={file.id} xs={12} sm={6} md={4}>
                    <Card className={classes.card}>
                      <CardMedia
                        className={classes.cardMedia}
                        image="https://source.unsplash.com/random"
                        title="Document"
                      />
                      <CardContent className={classes.cardContent}>
                        <Typography gutterBottom variant="h5" component="h2">
                          {file.name}
                        </Typography>
                        <Typography>
                          Created On : {file.created_at_readable} <br />
                          Expires On : {file.expiry_readable}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <IconButton
                          edge="start"
                          className={classes.menuButton}
                          color="inherit"
                          aria-label="menu"
                          onClick={this.downloadFile.bind(
                            this,
                            file.current_version_file_id,
                            file.name
                          )}
                        >
                          <GetAppIcon />
                        </IconButton>
                        <IconButton
                          edge="start"
                          className={classes.menuButton}
                          color="inherit"
                          aria-label="menu"
                          onClick={this.showRevisions.bind(
                            this,
                            file.revisions,
                            file.id,
                            file.created_at
                          )}
                        >
                          <HistoryIcon />
                        </IconButton>
                        <IconButton
                          edge="start"
                          className={classes.menuButton}
                          color="inherit"
                          aria-label="menu"
                          onClick={this.editFile.bind(
                            this,
                            file.current_version_file_id
                          )}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="start"
                          className={classes.menuButton}
                          color="inherit"
                          aria-label="menu"
                          onClick={this.deleteFile.bind(this, file.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </main>
          {/* Footer */}
          <footer className={classes.footer}>
            <Typography variant="h6" align="center" gutterBottom>
              Saransh Miglani
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              color="textSecondary"
              component="p"
            >
              saranshmiglani@gmail.com
            </Typography>
          </footer>
          {/* End footer */}
        </React.Fragment>
        <Dialog
          open={this.state.addDialogOpen}
          onClose={this.closeAddDialog.bind(this)}
        >
          <DialogTitle id="responsive-dialog-title">
            {"Add Document"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please upload your file. Enter name and expiration date for file.
              Click on save to store your file
            </DialogContentText>
            <TextField
              id="name-file"
              label="Name*"
              fullWidth
              onChange={e => {
                this.setState({ fileName: e.target.value });
              }}
              className={classes.textField}
              margin="normal"
            />
            <TextField
              id="description-file"
              label="Description"
              fullWidth
              onChange={e => {
                this.setState({ description: e.target.value });
              }}
              className={classes.textField}
              margin="normal"
            />
            <TextField
              id="datetime-local"
              label="Expiry"
              type="datetime-local"
              defaultValue="2019-12-25T10:30"
              onChange={e =>
                this.setState({ expiry: new Date(e.target.value) })
              }
              fullWidth
              className={classes.textField}
              InputLabelProps={{
                shrink: true
              }}
            />
            <div className={classes.dropdown}>
              <InputLabel htmlFor="age-simple">Department</InputLabel>
              <Select
                className={classes.dropdown}
                value={this.state.department}
                fullWidth
                onChange={this.departmentChanged.bind(this)}
                inputProps={{
                  name: "age",
                  id: "age-simple"
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="engineering">Engineering</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
              </Select>
            </div>
            <FilePond
              ref={ref => (this.pond = ref)}
              files={this.state.files}
              allowMultiple={false}
              server={{
                url: "/api/v1/files/upload",
                process: {
                  headers: {
                    "x-api-key": window.localStorage.getItem(this.props.auth)
                  }
                }
              }}
              onupdatefiles={fileItems => {
                console.log(fileItems);
                var files = [];
                for (var i = 0; i < fileItems.length; i++) {
                  files.push(fileItems[i]);
                }
                this.setState({
                  files: files
                });
              }}
            ></FilePond>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeAddDialog.bind(this)} color="primary">
              Cancel
            </Button>
            <Button
              onClick={this.closeAddDialog.bind(this)}
              color="primary"
              autoFocus
              onClick={this.saveFile.bind(this)}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <EditFile
          open={this.state.editFile}
          fileId={this.state.selectedFileId}
          handleClose={this.closeEditFile.bind(this)}
          fileUpdated={this.fileUpdated.bind(this)}
        />
        <FileRevisions
          open={this.state.showRevisionDialog}
          handleClose={this.closeRevisions.bind(this)}
          revisions={this.state.selectedRevisions}
        />
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Home);
