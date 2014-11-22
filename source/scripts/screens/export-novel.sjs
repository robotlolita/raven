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
  var { run, values } = require('../utils');
  var Novel = require('../novel')(storage);
  
  var Screen = React.createClass({
    MODE_SELECT: 0,
    MODE_PROGRESS: 1,
    MODE_ERROR: 2,
    
    getInitialState: function() {
      return {
        mode: this.MODE_SELECT,
        format: { title: '' },
        errorMessage: ''
      }
    },

    showError: function(error) {
      this.setState({ mode: this.MODE_ERROR, errorMessage: error.message });
      return Future.rejected();
    },

    exportAs: function(format) {
      var self = this;
      return function() {
        self.setState({ mode: self.MODE_PROGRESS, format: format });

        return run($do {
          format.save(self.props.novel, self.props.text).orElse(self.showError);
          screenManager.back()
        })
      }
    },

    reset: function() {
      this.setState(this.getInitialState());
    },

    retry: function() {
      this.exportAs(this.state.format)();
    },

    goBack: function() {
      run(screenManager.back())
    },

    renderFormat: function(format) {
      return (
        <li className={ "action " + format.icon } onClick={ this.exportAs(format) }>
          <div className="title">{ format.title }</div>
          <div className="info">{ format.description }</div>
        </li>
      )
    },

    render: function() {
      var screenClass = React.addons.classSet({
        'screen': true,
        'mode-selecting': this.state.mode === this.MODE_SELECT,
        'mode-saving': this.state.mode === this.MODE_PROGRESS,
        'mode-error': this.state.mode === this.MODE_ERROR
      });

      return (
        <div id="export-story-screen" className={ screenClass }>
          <div className="centred welcome vertically-centred">
            <div className="selecting-section">
              <div className="section-heading">
                <h2 className="section-info">Export your novel</h2>
                <h3 className="section-subinfo">Select a format to export your novel to.</h3>
              </div>

              <div className="export-formats form-feed">
                <ul className="action-list">
                  { values(Novel.exporters).map(this.renderFormat) }
                </ul>
              </div>

              <a href="#" className="button cancel-button" onClick={ this.goBack }>Cancel</a>
            </div>

            <div className="progress-section">
              <div className="section-heading">
                <h2 className="section-info">Saving as { this.state.format.title }</h2>
                <h3 className="section-subinfo">Hang on a little. We’re saving your novel.</h3>
              </div>
            </div>

            <div className="error-section">
              <div className="section-heading">
                <h2 className="section-info">Your novel was not saved</h2>
                <h3 className="section-subinfo">
                  { this.state.errorMessage ? this.state.errorMessage + '.' : ''}
                  You may choose one of the following actions to proceed.
                </h3>
              </div>

              <div className="frameless-buttons">
                <a href="#" className="button submit-button" onClick={ this.reset }>Choose a different format</a>
                <a href="#" className="button submit-button" onClick={ this.retry }>Retry exporting as { this.state.format.title }</a>
                <a href="#" className="button cancel-button" onClick={ this.goBack }>Cancel exporting</a>
              </div>
            </div>

          </div>
        </div>
      )
    }
  });

  return Screen

}
