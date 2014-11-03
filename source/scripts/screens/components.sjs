var React = require('react/addons');

var TextField = React.createClass({
  getInitialState: function() {
    return { isFocused: false }
  },

  handleFocus: function(e) {
    this.setState({ isFocused: true });
  },

  handleBlur: function(e) {
    this.setState({ isFocused: false });
  },

  handleStateUpdate: function(e) {
    if (this.props.onChange)  this.props.onChange(e.target.value);
  },

  render: function() {
    var fieldClasses = React.addons.classSet({
      'field': true,
      'text-field': true,
      'focused-field': this.state.isFocused
    });
    
    return (
      <div className={fieldClasses}>
        <label>{this.props.label}</label>
        <input type="text"
               placeholder={this.props.placeholder}
               value={this.props.value}
               onFocus={this.handleFocus}
               onBlur={this.handleBlur}
               onChange={this.handleStateUpdate} />
      </div>
    )
  }
});


module.exports = {
  TextField: TextField
}
