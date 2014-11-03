module.exports = function(screenManager, storage) {

  var React      = require('react');
  var components = require('./components');
  var Editor     = require('./editor')(screenManager, storage);
  
  var NewNovel = React.createClass({
    getInitialState: function() {
      return { name: '' }
    },
  
    handleStateUpdate: function(value) {
      this.setState({ name: value });
    },
  
    createNovel: function() {
      screenManager.changeTo(Editor({ novel: this.state.name })).fork(
        λ(_) -> window.alert('An error occurred while trying to open the editor.'),
        λ(_) -> null
      )
    },
  
    render: function() {
      return (
        <form className="pretty-form new-novel-form">
          <components.TextField onChange={this.handleStateUpdate}
                                label="Name your novel"
                                placeholder="A Really Amazing Story" />
          <a href="#" className="button submit-button" onClick={this.createNovel}>Start writing</a>
        </form>
      )
    }
  })
  
  var FirstTime = React.createClass({
    render: function() {
      return (
        <div id="entry-screen" className="screen">
          <div className="centred welcome vertically-centred">
            <div className="section-heading">
              <h2 className="section-info">Hey, looks like you’re new here</h2>
              <h3 className="section-subinfo">You may create a new novel, or import
              an existing one.</h3>
            </div>
  
            <div className="centred half form-feed">
              <NewNovel />
            </div>
  
          </div>
        </div>
      )
    }
  });
  
  var Screen = React.createClass({
    render: function() {
      return (
        <FirstTime />
      )
    }
  });
  
  return Screen;
}
