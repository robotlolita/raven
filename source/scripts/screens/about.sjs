module.exports = function(screenManager, storage) {

  var React = require('react');
  var { run } = require('../utils');

  var Screen = React.createClass({
    getInitialState: function() {
      return { version: WebkitUI.App.manifest.version }
    },

    goBack: function() {
      run(screenManager.back());
    },

    render: function() {
      return (
        <div id="about-screen" className="screen regular-screen">
          <div className="screen-heading">
            <div className="heading-buttons">
              <a href="#" className="heading-button icon-back" onClick={ this.goBack } />
            </div>
            <h2 className="screen-title">About Raven</h2>
          </div>

          <div className="centred welcome vertically-centred">
            <div className="app-description">
              <h2 className="app-title">Raven</h2>
              <div className="app-version">Version {this.state.version}</div>
            </div>
          </div>

          <div className="app-copy-info">
            <p>Made with <em>♥</em> by Quildreen Motta</p>
            <p>Raven is open source under the MIT licence</p>
          </div>
        </div>
      )
    }
  });

  return Screen
  
}
