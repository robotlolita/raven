module.exports = function(screenManager, storage) {
  
  var React = require('react');
  var Future = require('data.future');
  var path  = require('path');
  var { home, run } = require('../utils');
  var { makeDirectory, exists } = require('io.filesystem')(require('fs'));
  var { DirectoryField } = require('./components');

  var Screen = React.createClass({
    getInitialState: function() {
      return {
        novelHome: this.props.novelHome
                || path.join(home(), '.Raven')
      }
    },

    changeHome: function(value) {
      this.setState({ novelHome: value })
    },

    selectHome: function() {
      var self = this;
      run($do {
        flag <- exists(self.state.novelHome);
        flag? Future.of(null) : makeDirectory("775", self.state.novelHome);
        storage.put('settings.home', self.state.novelHome);
        screenManager.navigate('/');
      })
    },

    render: function() {
      return (
        <div id="novel-home-selection" className="screen">
          <div className="centred welcome vertically-centred">
            <div className="section-heading">
              <h2 className="section-info">Howdy, writer!</h2>
              <h3 className="section-subinfo">Select the folder you want to store your books in</h3>
            </div>

            <div className="home-selection form-feed">
              <div className="current-home">
                <DirectoryField initialDirectory={ this.state.novelHome }
                                onChange={ this.changeHome } />
              </div>
              <a href="#" className="button submit-button" onClick={this.selectHome}>Use this folder</a>
            </div>

            <div className="footer-notes">
              <p>You can choose a folder that is synced by Dropbox/Drive/OneDrive/etc to have everything backed up safely in the cloud!</p>
            </div>
          </div>
        </div>
      )
    }
  });

  return Screen;

}
