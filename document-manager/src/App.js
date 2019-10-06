import React from "react";
import { Route, HashRouter } from "react-router-dom";
import Login from "./login/Login";
import Home from "./home/Home";

const API_KEY = "vXBk4iN9JPNjjpNKWnBmlgjqjScoX3GQ";
const AUTH_KEY = "auth";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: this.getLoginStatus()
    };
  }
  getLoginStatus() {
    var apiToken = window.localStorage.getItem(AUTH_KEY);
    if (apiToken !== null && apiToken !== "") {
      //logged in
      return true;
    } else {
      //logged out
      return false;
    }
  }
  loginHandler(response) {
    window.localStorage.setItem(AUTH_KEY, response.token);
    this.setState({ loggedIn: true });
  }
  logoutHandler() {
    window.localStorage.removeItem(AUTH_KEY);
    this.setState({ loggedIn: false });
  }
  render() {
    return (
      <HashRouter>
        <div className="content">
          {this.state.loggedIn ? (
            <Route
              path="/"
              render={props => (
                <Home onLogout={this.logoutHandler.bind(this)} auth={AUTH_KEY} {...props} />
              )}
            />
          ) : (
            <Route
              path="/"
              render={props => (
                <Login
                  api={API_KEY}
                  onLogin={this.loginHandler.bind(this)}
                  {...props}
                />
              )}
            />
          )}
        </div>
      </HashRouter>
    );
  }
}

export default App;

/*
<div className="App">
        <header className="App-header">
        </header>
      </div>
*/
