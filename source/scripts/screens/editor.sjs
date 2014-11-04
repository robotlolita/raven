module.exports = function(screenManager, storage) {
  
  var React      = require('react/addons');
  var components = require('./components');
  var zenpen     = require('../zenpen');
  var utils      = require('../utils');

  var SAVE_DELAY = 1000;

  function countWords(text) {
    return text.trim().split(/\s+/).length
  }

  var Editor = React.createClass({
    getInitialState: function() {
      return {
        words: 0,
        modified: false,
        text: this.props.initialText,
        plainText: ''
      }
    },

    componentDidMount: function() {
      var article = this.refs.article.getDOMNode();
      article.innerHTML = this.props.initialText;
      var text = article.innerText;
      this.setState({
        words: countWords(text),
        text: article.innerHTML,
        plainText: text,
        modified: false
      });
      zenpen.init();
      zenpen.onChange.add(this.handleStateUpdate);
    },

    onSaved: function() {
      this.setState({ modified: false });
    },

    handleStateUpdate: function(data) {
      this.setState({ 
        words: countWords(data.contentText),
        text: data.content.innerHTML,
        plainText: data.content.innerText,
        modified: true
      });

      if (this.props.onChange) this.props.onChange(data)
    },

    render: function() {
      var modified = this.state.modified? 'Modified' : 'Saved'
      var wrapperClasses = React.addons.classSet({
        'article-wrapper': true,
        'has-text': this.state.plainText.trim().length
      });
      
      return (
        <div className="editor-container">
          <div className="statusbar">
            <div className="statusbar-panel" id="wordcount"><strong>{this.state.words}</strong> words</div>
            <div className="statusbar-panel" id="docstate">{ modified }</div>
          </div>

          <section className="editor">
            <div className="text-options">
              <div className="options">
                <span className="no-overflow">
                  <span className="lengthen ui-inputs">
                    <button className="url entypo">📎</button>
                    <input className="url-input" type="text" placeholder="Type or Paste URL here" />
                    <button className="add-header">H</button>
                    <button className="bold">b</button>
                    <button className="italic">i</button>
                    <button className="quote entypo">❞</button>
                  </span>
                </span>
              </div>
            </div>
  
            <header className="header">{this.props.novel}</header>
            <div className={ wrapperClasses } >
              <div className="article-placeholder">
                Type your novel here...
              </div>
              <article contentEditable={true} className="content" ref="article"></article>
            </div>
          </section>
        </div>
      )
    }
  });

  var Sidebar = React.createClass({
    notifyCancel: function() {
      if (this.props.onCancel) this.props.onCancel()
    },

    closeProject: function() {

    },

    render: function() {
      return (
        <div className="sidebar-overlay">
          <div className="overlay-area" onClick={this.notifyCancel}></div>
          <div className="sidebar">
            <components.SearchField placeholder="Search anything..." />
            
            <ul className="tooling-list">
              <li className="tooling-section">
                <h3 className="tooling-section-title">Project</h3>
                <ul className="tooling-links">
                  <li className="item icon-close"><a href="#" onClick={this.closeProject}>Close</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      )
    }
  });

  var Heading = React.createClass({
    notifyMenuClick: function() {
      if (this.props.onMenu) this.props.onMenu()
    },
    
    render: function() {
      return (
        <div className="editor-heading">
          <a href="#" onClick={this.notifyMenuClick} className="menu-button icon-menu"></a>
        </div>
      )
    }
  })

  var Screen = React.createClass({
    getInitialState: function() {
      return { isSidebarActive: false }
    },

    getDefaultProps: function() {
      return { initialText: '<p><br></p>' }
    },

    deactivateSidebar: function() {
      this.setState({ isSidebarActive: false })
    },

    activateSidebar: function() {
      this.setState({ isSidebarActive: true })
    },

    handleChanges: function(data) {
      var novel = this.props.novel;
      var editor = this.refs.editor;
      utils.run($do {
        utils.write(utils.novelPath(novel), data.headerText + '\n' + data.content.innerHTML);
        return editor.onSaved();
      })
    },
    
    render: function() {
      var screenClasses = React.addons.classSet({
        'screen': true,
        'sidebar-active': this.state.isSidebarActive
      })
      
      return (
        <div id="editor-screen" className={screenClasses}>
          <Heading onMenu={this.activateSidebar} />
          <Editor onChange={utils.debounce(this.handleChanges, SAVE_DELAY)} initialText={this.props.initialText} novel={this.props.novel} ref="editor" />
          <Sidebar onCancel={this.deactivateSidebar} ref="sidebar" />
        </div>
      )
    }
  });


  return Screen

}
