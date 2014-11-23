// Copyright (c) 2014 Quildreen Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var Maybe   = require('data.maybe');
var updater = require('../updater');
var { Base } = require('adt-simple');

module.exports = function(screenManager, storage) {

  var React = require('react/addons');
  var { run, spawn } = require('../utils');
  var Dialogs = require('./dialogs')(screenManager);
  
  union Mode {
    About,
    Updating
  } deriving (Base);

  var Screen = React.createClass({
    getInitialState: function() {
      return {
        version: WebkitUI.App.manifest.version,
        update: Maybe.Nothing(),
        checkingUpdates: false,
        mode: Mode.About
      }
    },

    goBack: function() {
      run(screenManager.back());
    },

    componentWillMount: function() {
      this.computeUpdateInformation();
    },

    computeUpdateInformation: function() {
      var { version, releases: { url, channel } } = WebkitUI.App.manifest;
      var self = this;

      this.setState({ checkingUpdates: true });
      run($do {
        update <- updater.hasUpdates(url)(version)(updater.channels[channel]);
        return self.setState({ checkingUpdates: false, update: update })
      })
    },

    updateTo: function(version) {
      var self = this;
      return function() {
        self.setState({ mode: Mode.Updating });
        updater.doUpdate(version).fork(
          λ error -> run($do {
            Dialogs.message('Raven updater', 'An error ocurred while trying to update Raven: ' + error.message);
            return console.log(error);
            screenManager.back();
            return self.setState({ mode: Mode.About });
          }),
          λ _ -> run($do {
            Dialogs.message('Raven updater', 'Raven was updated successfully. Please restart the application for the changes to take effect.');
            screenManager.back();
            return self.setState({ update: Maybe.Nothing(), mode: Mode.About });
          })
        )
      }
    },

    renderUpdate: function(update) {
      var self = this;

      return update.cata({
        Nothing: λ(_) -> (
          self.state.checkingUpdates?  <span className="busy">Checking for updates...</span>
          : /* otherwise */            <span />
        ),
        Just:    λ(v) -> (
          <a href="#" className="button submit-button" onClick={ self.updateTo(v) }>Update to { v.tag_name }</a>
        )
      })
    },

    render: function() {
      var classes = React.addons.classSet({
        'screen': true,
        'regular-screen': true,
        'mode-about': this.state.mode.equals(Mode.About),
        'mode-updating': this.state.mode.equals(Mode.Updating)
      });
      
      return (
        <div id="about-screen" className={ classes }>
          <div className="about-section">
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
                <div className="app-updates">
                  { this.renderUpdate(this.state.update) }
                </div>
              </div>
            </div>
  
            <div className="app-copy-info">
              <p>Made with <em>♥</em> by Quildreen Motta</p>
              <p>Raven is open source under the MIT licence</p>
            </div>
          </div>

          <div className="updating-section">
            <div className="centred welcome vertically-centred">
              <div className="section-heading">
                <h2 className="section-info">Raven is updating</h2>
                <h3 className="section-subinfo">Sit back and prepare some coffee, this might take a while</h3>
              </div>
            </div>
          </div>
        </div>
      )
    }
  });

  return Screen
  
}
