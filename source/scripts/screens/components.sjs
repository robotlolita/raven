var React  = require('react/addons');
var extend = require('xtend');
var { run, selectDirectory } = require('../utils');

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
      'search-field': this.props.isSearchField,
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

function SearchField(props) {
  return TextField(extend(props, { isSearchField: true }))
}

var DirectoryField = React.createClass({
  getInitialState: function() {
    return {
      value: this.props.initialDirectory,
      isOver: false
    }
  },

  getDefaultProps: function() {
    return {
      onChange: function(){}
    }
  },

  selectDirectory: function() {
    var self = this;
    run($do {
      newDir <- selectDirectory(self.state.value);
      return self.setState({ value: newDir })
      return self.props.onChange(newDir)
    })
  },

  mouseOver: function() {
    this.setState({ isOver: true })
  },

  mouseOut: function() {
    this.setState({ isOver: false })
  },

  render: function() {
    var fieldClass = React.addons.classSet({
      'file-field': true,
      'field': true,
      'hovered': this.state.isOver
    })
    
    return (
      <div className={ fieldClass }
           onClick={ this.selectDirectory }
           onMouseEnter={ this.mouseOver }
           onMouseLeave={ this.mouseOut }
      >
        <input type="text" value={ this.state.value } disabled="disabled" />
        <a href="#" className="button input-action-button">Change</a>
      </div>
    )
  }
})

module.exports = {
  TextField: TextField,
  SearchField: SearchField,
  DirectoryField: DirectoryField
}
