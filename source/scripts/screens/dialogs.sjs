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
