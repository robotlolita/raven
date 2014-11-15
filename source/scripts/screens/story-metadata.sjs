module.exports = function(screenManager, storage) {

  var React = require('react');
  var Maybe = require('data.maybe');
  var Future = require('data.future');
  var { run } = require('../utils');
  var { TextField } = require('./components');

  var Screen = React.createClass({
    getInitialState: function() {
      return {
        author: this.props.initialAuthor,
        tags: this.props.initialTags
      }
    },

    getDefaultProps: function() {
      return {
        path: '',
        title: '',
        initialAuthor: Maybe.Nothing(),
        initialTags: [],
        onSave: function(){ return Future.of(null) }
      }
    },

    goBack: function() {
      run(screenManager.back())
    },

    save: function() {
      var self = this;
      run($do {
        self.props.onSave(self.state);
        screenManager.back()
      })
    },

    updateAuthor: function(value) {
      this.setState({ author: Maybe.of(value) })
    },

    render: function() {
      return (
        <div id="story-metadata" className="screen regular-screen">
          <div className="screen-heading">
            <div className="heading-buttons">
              <a href="#" className="heading-button icon-back" onClick={ this.goBack } />
            </div>
            <h2 className="screen-title">{ this.props.title } — Metadata</h2>
          </div>

          <div className="pretty-form">
            <div className="field">
              <label>Novel directory</label>
              <p className="help-text">This novel will be saved in <code>{ this.props.path }</code></p>
            </div>

            <TextField label="Your pen name"
                       placeholder="Writer R. Me"
                       value={ this.state.author.getOrElse('') }
                       onChange={ this.updateAuthor } />

            <div className="button-group">
              <a href="#" className="button cancel-button" onClick={ this.goBack } >
                Cancel
              </a>
              <a href="#" className="button submit-button" onClick={ this.save } >
                Save settings
              </a>
            </div>
          </div>
        </div>
      )
    }
  });

  return Screen

}
