module.exports = function(screenManager, storage) {
  
  var React      = require('react');
  var components = require('./components');
  var zenpen     = require('../zenpen');

  var Editor = React.createClass({
    getInitialState: function() {
      return { words: 0 }
    },

    componentDidMount: function() {
      zenpen.init()
    },

    render: function() {
      return (
        <div className="editor-container">
          <div className="statusbar">
            <div id="wordcount"><strong>{this.state.words}</strong> words</div>
          </div>

          <section className="editor">
            <div className="text-options">
              <div className="options">
                <span className="no-overflow">
                  <span className="lengthen ui-inputs">
                    <button className="url entypo">📎</button>
                    <input className="url-input" type="text" placeholder="Type or Paste URL here" />
                    <button className="bold">b</button>
                    <button className="italic">i</button>
                    <button className="quote entypo">❞</button>
                  </span>
                </span>
              </div>
            </div>
  
            <header contentEditable={true} className="header">
              Title
            </header>
            <article contentEditable={true} className="content">
              Write things here
            </article>
          </section>
        </div>
      )
    }
  });

  var Screen = React.createClass({
    render: function() {
      return (
        <div id="editor-screen" className="screen">
          <Editor />
        </div>
      )
    }
  });


  return Screen

}
