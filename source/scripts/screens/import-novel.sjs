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
  var { run, values, chooseFileDialog } = require('../utils');
  var { TextField } = require('./components');
  var Novel = require('../novel')(storage);

  var Screen = React.createClass({
    MODE_SELECT: 0,
    MODE_RENAME: 1,
    MODE_PROGRESS: 2,
    MODE_ERROR: 3,

    getInitialState: function() {
      return {
        mode: this.MODE_SELECT,
        importer: { title: '' },
        errorMessage: '',
        novelTitle: ''
      }
    },

    getDefaultProps: function() {
      return {
        onImported: function(){ }
      }
    },

    showError: function(error) {
      this.setState({ mode: this.MODE_ERROR, errorMessage: error.message });
      return Future.rejected();
    },

    importFrom: function(format) {
      var self = this;
      return function() {
        self.setState({ importer: format, mode: self.MODE_RENAME })
      }
    },

    changeNovelName: function(name) {
      this.setState({ novelTitle: name })
    },

    importNovel: function() {
      var self = this;
      var importer = self.state.importer;
      run($do {
        origin <- chooseFileDialog(importer.filter, false);
        return self.setState({ mode: self.MODE_PROGRESS });
        data <- importer.doImport(self.state.novelTitle, origin);
        Novel.doImport(data);
        screenManager.back();
        return self.props.onImported()
      })
    },

    goBack: function() {
      run(screenManager.back());
    },
    
    reset: function() {
      this.setState(this.getInitialState());
    },

    retry: function() {
      this.importFrom(this.state.format)();
    },

    renderFormat: function(format) {
      return (
        <li className={ "action " + format.icon } onClick={ this.importFrom(format) }>
          <div className="title">{ format.title }</div>
          <div className="info">{ format.description }</div>
        </li>
      )
    },

    render: function() {
      var screenClass = React.addons.classSet({
        'screen': true,
        'mode-selecting': this.state.mode === this.MODE_SELECT,
        'mode-importing': this.state.mode === this.MODE_PROGRESS,
        'mode-renaming': this.state.mode === this.MODE_RENAME,
        'mode-error': this.state.mode === this.MODE_ERROR
      });

      return (
        <div id="import-story-screen" className={ screenClass }>
          <div className="centred welcome vertically-centred">
            <div className="selecting-section">
              <div className="section-heading">
                <h2 className="section-info">Import a novel</h2>
                <h3 className="section-subinfo">Select the format of the novel you want to import.</h3>
              </div>

              <div className="import-formats form-feed">
                <ul className="action-list">
                  { values(Novel.importers).map(this.renderFormat) }
                </ul>
              </div>

              <a href="#" className="button cancel-button" onClick={ this.goBack }>Cancel</a>
            </div>

            <div className="rename-section">
              <div className="section-heading">
                <h2 className="section-info">Name your novel</h2>
                <h3 className="section-subinfo">Almost there. Just give your novel a name to begin importing.</h3>
                <div className="pretty-form import-novel-form">
                  <TextField onChange={ this.changeNovelName }
                             value={ this.state.novelTitle }
                             label="Name your novel"
                             placeholder="A Really Amazing Story" />
                  <a href="#" className="button submit-button" onClick={this.importNovel}>Import the novel</a>
                  <a href="#" className="button cancel-button" onClick={this.reset}>Choose another format</a>

                </div>
              </div>
            </div>

            <div className="progress-section">
              <div className="section-heading">
                <h2 className="section-info">Importing from { this.state.importer.title }</h2>
                <h3 className="section-subinfo">Hang on a little. We’re importing your novel.</h3>
              </div>
            </div>

            <div className="error-section">
              <div className="section-heading">
                <h2 className="section-info">Your novel was not imported</h2>
                <h3 className="section-subinfo">
                  { this.state.errorMessage ? this.state.errorMessage + '.' : ''}
                  You may choose one of the following actions to proceed.
                </h3>
              </div>

              <div className="frameless-buttons">
                <a href="#" className="button submit-button" onClick={ this.reset }>Choose a different format</a>
                <a href="#" className="button submit-button" onClick={ this.retry }>Retry importing from { this.state.importer.title }</a>
                <a href="#" className="button cancel-button" onClick={ this.goBack }>Cancel importing</a>
              </div>
            </div>

          </div>
        </div>
      )
    }
  });

  return Screen  

}
