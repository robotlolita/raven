module.exports = function(screenManager, storage) {

  var React      = require('react');
  var components = require('./components');
  var Editor     = require('./editor')(screenManager, storage);
  var utils      = require('../utils');
  var Novel      = require('../novel')(utils.novelHome());
  var path       = require('path');
  
  var NewNovel = React.createClass({
    getInitialState: function() {
      return { name: '' }
    },
  
    handleStateUpdate: function(value) {
      this.setState({ name: value });
    },
  
    createNovel: function() {
      var name = this.state.name;
      utils.run($do {
        novel <- Novel.make(name);
        screenManager.changeTo(Editor({ novel: novel }))
      })
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
    notifyCancel: function() {
      if (this.props.onCancel)  this.props.onCancel()
    },

    render: function() {
      return (
          <div className="create-a-book">
            <div className="section-heading">
              <h2 className="section-info">Hey, looks like you’re new here</h2>
              <h3 className="section-subinfo">You may create a new novel, or import
              an existing one.</h3>
            </div>
  
            <div className="centred half form-feed">
              <NewNovel />
              <a href="#" className="button cancel-button" onClick={this.notifyCancel}>Cancel</a>
            </div>
  
          </div>
      )
    }
  });

  var Book = React.createClass({
    loadBook: function() {
      var props = this.props;
      utils.run($do {
        text <- Novel.load(props);
        screenManager.changeTo(Editor({ novel: props, initialText: text }))
      })
    },

    render: function() {
      return (
        <li className="book icon-book" onClick={this.loadBook}>
          <strong>{this.props.title}</strong>
        </li>
      )
    }
  });

  var LoadABook = React.createClass({
    notifyCreate: function() {
      if (this.props.onNew)  this.props.onNew()
    },

    render: function() {
      return (
        <div className="load-a-book">
            <div className="section-heading">
              <h2 className="section-info">No books open</h2>
              <h3 className="section-subinfo">Open a book to begin writing.</h3>
            </div>
  
            <div className="form-feed">
              <ul className="book-list">
                {this.props.books.map(Book)}
                <li className="book icon-new" onClick={this.notifyCreate}>
                  <strong>New Book</strong>
                </li>
              </ul>
            </div>
  
        </div>
      )
    }
  });

  
  var Screen = React.createClass({
    getInitialState: function() {
      return { books: [], loaded: false, mode: '' }
    },

    componentWillMount: function() {
      var self = this;
      utils.run($do {
        books <- Novel.list(utils.novelHome());
        return self.setState({ loaded: true, books: books })
      })
    },

    createMode: function() {
      this.setState({ mode: 'new' })
    },

    resetMode: function() {
      this.setState({ mode: '' })
    },

    render: function() {
      return (
        <div id="entry-screen" className="screen">
          <div className="centred welcome vertically-centred">
            { !this.state.loaded?             
                <div />
            : this.state.books.length === 0 || this.state.mode == 'new'?
                <FirstTime onCancel={this.resetMode} />
            : /* otherwise */                 
                <LoadABook books={this.state.books} onNew={this.createMode} />
            }
          </div>
        </div>
      )
    }
  });

  return Screen;
}
