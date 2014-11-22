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
      onChange: function(){},
      label: ''
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
        <label>{ this.props.label }</label>
        <div className="base-field-group">
          <input type="text" value={ this.state.value } disabled="disabled" />
          <a href="#" className="button input-action-button">Change</a>
        </div>
      </div>
    )
  }
})

module.exports = {
  TextField: TextField,
  SearchField: SearchField,
  DirectoryField: DirectoryField
}
