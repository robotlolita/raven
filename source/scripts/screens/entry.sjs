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

  var React      = require('react/addons');
  var components = require('./components');
  var utils      = require('../utils');
  var Novel      = require('../novel')(storage);
  var path       = require('path');
  var moment     = require('moment');
  
  var sorted = λ f xs -> xs.slice().sort(f);

  function byModification(a, b) {
    return a.modifiedAt.isNothing?   1
    :      b.modifiedAt.isNothing?  -1
    :      /* otherwise */           b.modifiedAt.get() - a.modifiedAt.get()
  }

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
        screenManager.navigate(screenManager.DONT_STACK, '/editor', { novel: novel })
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
  
  var CreateBook = React.createClass({
    getDefaultProps: function() {
      return {
        isFirstTime: true,
        onCancel: function(){ }
      }
    },

    renderFirstTimeHeading: function() {
      return (
        <div className="section-heading">
          <h2 className="section-info">Hey, looks like you’re new here</h2>
          <h3 className="section-subinfo">
            You may create a new novel, or import an existing one.
          </h3>
        </div>
      )
    },
    
    renderCreateHeading: function() {
      return (
        <div className="section-heading">
          <h2 className="section-info">Create a new book</h2>
          <h3 className="section-subinfo">
            Choose the title of your next big novel to start writing!
          </h3>
        </div>
      )
    },

    render: function() {
      return (
          <div className="create-a-book create-section">
            {
              this.props.isFirstTime?  this.renderFirstTimeHeading()
              : /* otherwise */        this.renderCreateHeading()
            }
  
            <div className="centred half form-feed">
              <NewNovel />
              <a href="#" className="button cancel-button" onClick={this.props.onCancel}>Cancel</a>
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
        screenManager.navigate(screenManager.DONT_STACK, '/editor', { novel: props, initialText: text })
      })
    },

    bookAge: function() {
      return this.props.modifiedAt.cata({
        Nothing: λ(_) -> '',
        Just:    λ(a) -> moment(a).fromNow()
      })
    },

    render: function() {
      return (
        <li className="book icon-book" onClick={this.loadBook} key={ this.props.path }>
          <div className="book-title">{this.props.title}</div>
          <div className="book-update">{this.bookAge()}</div>
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
        <div className="load-a-book load-section">
            <div className="section-heading">
              <h2 className="section-info">No books open</h2>
              <h3 className="section-subinfo">Open a book to begin writing.</h3>
            </div>
  
            <div className="form-feed">
              <ul className="book-list">
                <li className="book icon-new new-item" onClick={this.notifyCreate}>
                  <div className="book-title">New Book</div>
                </li>
                {this.props.books.map(Book)}
              </ul>
            </div>
          </div>
      )
    }
  });

  
  var Screen = React.createClass({
    MODE_NONE: -1,
    MODE_AUTO: 0,
    MODE_LOAD: 1,
    MODE_NEW: 2,
    RELOAD_DELAY: 5000,
    
    getInitialState: function() {
      return { books: [], mode: this.MODE_NONE, reloader: null }
    },

    componentWillMount: function() {
      var self = this;
      utils.run($do {
        self.loader()
        return self.setState({ mode: self.MODE_AUTO })
      });
      this.setState({ reloader: setInterval(this.reload, this.RELOAD_DELAY) });
    },

    componentWillUnmount: function() {
      clearInterval(this.state.reloader);
    },

    loader: function() {
      var self = this;
      return $do {
        books <- Novel.list();
        return self.setState({ books: sorted(byModification)(books) })
      }
    },

    reload: function() {
      utils.run(this.loader());
    },

    createMode: function() {
      this.setState({ mode: this.MODE_NEW })
    },

    resetMode: function() {
      this.setState({ mode: this.MODE_AUTO })
    },

    importNovel: function() {
      utils.run(screenManager.navigate(screenManager.STACK, '/dialog/import', {
        onImported: this.reload
      }))
    },

    render: function() {
      var screenClass = React.addons.classSet({
        'screen': true,
        'mode-new': (this.state.mode === this.MODE_AUTO && this.state.books.length === 0)
                 || this.state.mode === this.MODE_NEW,
        'mode-load': (this.state.mode === this.MODE_AUTO && this.state.books.length > 0)
                  || this.state.mode === this.MODE_LOAD
      });
      
      return (
        <div id="entry-screen" className={ screenClass }>
          <div className="centred welcome vertically-centred">
            <CreateBook isFirstTime={ this.state.mode === this.MODE_AUTO }
                        onCancel={ this.resetMode }  />
            <LoadABook books={ this.state.books } 
                       onNew={ this.createMode } />

            <ul className="action-list">
              <li className="action icon-import" onClick={ this.importNovel }>
                <div className="title">Import a novel</div>
                <div className="info">Imports an existing book to <strong>Raven</strong></div>
              </li>
            </ul>
          </div>
        </div>
      )
    }
  });

  return Screen;
}
