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

  var React = require('react');
  var { run } = require('../utils');

  var Screen = React.createClass({
    getInitialState: function() {
      return { version: WebkitUI.App.manifest.version }
    },

    goBack: function() {
      run(screenManager.back());
    },

    render: function() {
      return (
        <div id="about-screen" className="screen regular-screen">
          <div className="screen-heading">
            <div className="heading-buttons">
              <a href="#" className="heading-button icon-back" onClick={ this.goBack } />
            </div>
            <h2 className="screen-title">About Raven</h2>
          </div>

          <div className="centred welcome vertically-centred">
            <div className="app-description">
              <h2 className="app-title">Raven</h2>
              <div className="app-version">Version {this.state.version}</div>
            </div>
          </div>

          <div className="app-copy-info">
            <p>Made with <em>♥</em> by Quildreen Motta</p>
            <p>Raven is open source under the MIT licence</p>
          </div>
        </div>
      )
    }
  });

  return Screen
  
}
