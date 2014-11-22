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

  var exports = {};

  var OkButton = exports.OkButton = React.createClass({
    getDefaultProps: function() {
      return {
        label: 'Ok',
        onAction: function(){}
      }
    },

    notifyAction: function() {
      this.props.onAction({ type: 'ok' })
    },

    render: function() {
      return (
        <a href="#" className="button button-ok" onClick={ this.notifyAction }>
          { this.props.label }
        </a>
      )
    }
  });

  var Dialog = exports.Dialog = React.createClass({
    getDefaultProps: function() {
      return {
        title: '',
        kind: 'dialog',
        buttons: [ ],
        onDismissed: function(){ },
        onActioned: function(){ }
      }
    },

    renderButton: function(Button) {
      var self = this;
      return Button({
        dialog: this,
        onAction: this.action
      })
    },

    dismiss: function() {
      this.props.onDismissed()
    },

    action: function(data) {
      this.props.onActioned(data)
    },

    render: function() {
      return (
        <div className="dialog-container">
          <div className="dialog-overlay"></div>
          <div className={ "dialog " + this.props.kind }>
            <div className="heading">
              <h4 className="title">{ this.props.title }</h4>
              <a href="#" className="heading-button icon-close" onClick={ this.dismiss } />
            </div>

            <div className="contents">
              { this.props.children }
            </div>

            <div className="button-group">
              { this.props.buttons.map(this.renderButton) }
            </div>
          </div>
        </div>
      )
    }
  });
    
  var message = exports.message = function(title, message) {
    return new Future(function(reject, resolve) {
      screenManager.showDialog(
          <Dialog title={ title }
                  kind="alert-dialog dialog"
                  buttons={ [ OkButton ] }
                  onActioned={ resolve }
                  onDismissed={ resolve }>{ message }</Dialog>
      ).fork(λ(e) -> console.log(e), λ(_) -> null);
    })             
  };

  
  return exports

}
