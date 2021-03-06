import React, { Component } from 'react';
import i18next from 'i18next';

import apiManager from '../lib/APIManager';
import messageDispatcher from '../lib/MessageDispatcher';

class SelectAccount extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      config: props.config,
      userList: props.userList||[],
      currentUser: props.currentUser||[]
    };
    
    this.handleBack = this.handleBack.bind(this);
    this.handleToggleGrantScope = this.handleToggleGrantScope.bind(this);
    this.handleNewAccount = this.handleNewAccount.bind(this);
    this.handleLogoutAccount = this.handleLogoutAccount.bind(this);
  }
  
  componentWillReceiveProps(nextProps) {
    this.setState({
      config: nextProps.config,
      userList: nextProps.userList||[],
      currentUser: nextProps.currentUser||[]
    });
  }
  
  handleBack() {
    messageDispatcher.sendMessage('App', {type: 'SelectAccountComplete'});
  }
  
  handleToggleGrantScope(user) {
    this.setState({currentUser: user}, () =>
      apiManager.glewlwydRequest("/auth/", "POST", {username: this.state.currentUser.username})
      .then(() => {
        messageDispatcher.sendMessage('Notification', {type: "success", message: i18next.t("login.select-login",  {username: this.state.currentUser.username})});
      })
      .fail(() => {
        messageDispatcher.sendMessage('Notification', {type: "danger", message: i18next.t("login.error-login")});
      })
    )
  }
  
  handleNewAccount() {
    messageDispatcher.sendMessage('App', {type: 'NewUser'});
  }
  
  handleLogoutAccount(username) {
    apiManager.glewlwydRequest("/auth/?username=" + username, "DELETE")
    .then(() => {
      messageDispatcher.sendMessage('App', {type: 'InitProfile'});
    })
    .fail(() => {
      messageDispatcher.sendMessage('Notification', {type: "danger", message: i18next.t("login.error-login")});
    });
  }
  
  handleLogoutAll() {
    apiManager.glewlwydRequest("/auth/", "DELETE")
    .then(() => {
      messageDispatcher.sendMessage('App', {type: 'SessionClosed'});
    })
    .fail(() => {
      messageDispatcher.sendMessage('Notification', {type: "danger", message: i18next.t("login.error-login")});
    });
  }
  
  render() {
    var userList = [], userPicture, selected = -1;
    this.state.userList.forEach((user, index) => {
      if (user.username===this.state.currentUser.username) {
        selected = index;
      }
    });
    this.state.userList.forEach((user, index) => {
      var inputUser;
      if (user.picture) {
        var picData = user.picture;
        userPicture = <img className="img-thumb glwd-select-user-picture" src={"data:*;base64,"+picData} />
      } else {
        userPicture = <i className="fas fa-user glwd-select-user-picto"></i>;
      }
      inputUser = 
        <div className="input-group" id={"select-user-" + user.username}>
          <label className="glwd-select-user-label">
            <div className="col input-group-prepend glwd-select-user-col">
              {userPicture}
            </div>
            <input type="radio" className="input-hidden" onChange={() => this.handleToggleGrantScope(user)} name="select-user" />
            <div className="col input-group-append glwd-select-user-username">
              <div className="col btn-icon-left glwd-select-user-username v-align-middle">
                {user.name||user.username}
              </div>
              {/* The following invisible button contains a transparent pixel and is a hack for vertical alignment ("middle"). Pure CSS solution not found.*/}
              <button type="button" disabled={true} className="glwd-select-user-hidden-button">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="/>
              </button>
            </div>
          </label>
        </div>
      userList.push(
        <li className={"list-group-item" + (selected === index?" active":"")} key={index}>
          <div className="row">
            <div className="col glwd-no-padding-right">
              {inputUser}
            </div>
            <div className="col-auto text-right glwd-no-padding-left">
              <button type="button" className="btn btn-secondary" onClick={() => this.handleLogoutAccount(user.username)}>{i18next.t("login.logout")}</button>
            </div>
          </div>
        </li>
      );
    });
    return (
    <div>
      <div className="row">
        <div className="col-md-12">
          <h4>{i18next.t("login.select-acount-title")}</h4>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <ul className="list-group">
            {userList}
          </ul>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <hr/>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="btn-group" role="group">
            <button type="button" className="btn btn-primary" onClick={this.handleBack}>{i18next.t("login.back")}</button>
            <button type="button" className="btn btn-primary" onClick={this.handleNewAccount}>{i18next.t("login.login-another-new")}</button>
          </div>
        </div>
        <div className="col-md-6 text-right">
          <button type="button" className="btn btn-danger" onClick={this.handleLogoutAll}>{i18next.t("login.logout-all")}</button>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <hr/>
        </div>
      </div>
    </div>);
  }
}

export default SelectAccount;
