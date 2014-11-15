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
