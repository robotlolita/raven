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


module.exports = function(screenManager, storage) {
  var React = require('react/addons');
  var Future = require('data.future');
  var path = require('path');
  var Novel = require('../novel')(storage);
  var { run } = require('../utils');
  var { DirectoryField, TextField } = require('./components');

  var Screen = React.createClass({
    getInitialState: function() {
      return {
        home: this.props.initialHome,
        author: this.props.initialAuthor,
        isSaving: false
      }
    },

    updateAuthor: function(value) {
      this.setState({ author: value })
    },

    updateHome: function(value) {
      this.setState({ home: value })
    },

    goBack: function() {
      run(screenManager.back())
    },

    saveSettings: function() {
      var self = this;
      run($do {
        storage.put('settings.author', self.state.author);
        Novel.migrate(self.props.initialHome, self.state.home);
        storage.put('settings.home', self.state.home);
        screenManager.back()
      })
    },

    render: function() {
      return (
        <div id="raven-configuration" className="screen regular-screen">
          <div className="screen-heading">
            <div className="heading-buttons">
              <a href="#" className="heading-button icon-back" onClick={ this.goBack } />
            </div>
            <h2 className="screen-title">Raven settings</h2>
          </div>

          {
            this.state.isSaving?  this.saveMessage()
            : /* otherwise */     this.formContents()
          }

        </div>
      )
    },

    saveMessage: function() {
      return (
        <div className="centred welcome vertically-centred">
          <div className="section-heading">
            <h2 className="section-info">Migrating novels...</h2>
            <h3 className="section-subinfo">
              Please sit back for a while while we migrate your novels to the new folder.
            </h3>
          </div>
        </div>
      )
    },

    formContents: function() {
      return (
          <div className="pretty-form">
            <TextField label="Your pen name"
                       placeholder="Writer R. Me"
                       value={ this.state.author }
                       onChange={ this.updateAuthor } />

            <DirectoryField label="Store novels in the following directory"
                            initialDirectory={ this.state.home }
                            onChange={ this.updateHome } />

            <div className="button-group">
              <a href="#" className="button cancel-button" onClick={ this.goBack } >
                Cancel
              </a>
              <a href="#" className="button submit-button" onClick={ this.saveSettings } >
                Save settings
              </a>
            </div>
          </div>
      )
    }
  });

  return Screen;
}
