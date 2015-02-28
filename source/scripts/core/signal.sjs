// # module: signal
//
// Custom events.

// -- Dependencies -----------------------------------------------------
var Task = require('data.future');
var { parallel } = require('control.async')(Task);

// -- Helpers ----------------------------------------------------------
// ### function: is
// Tests for equality.
// @type α → α → Boolean
var is = λ a b -> a === b;

// ### function: isnt
// Tests for inequality.
// @type α → α → Boolean
var isnt = λ a b -> a !== b;


// -- Implementation ---------------------------------------------------
// ### class: Signal
// An object that represents an event.
// @type { listeners: [Any → Task(α, β)] }
function Signal() {
  this.listeners = []
}

// #### method: listen
// Adds a listener to the event.
// @type this:Signal, (Any → Task(α, β)) → Signal
Signal::listen = function(f) {
  if (this.listeners.some(is(f)))  return this;

  this.listeners.push(f);
  return this;
}

// #### method: deafen
// Removes a listener from the event.
// @type this:Signal, (Any → Task(α, β)) → Signal
Signal::deafen = function(f) {
  this.listeners = this.listeners.filter(isnt(f));
  return this;
}

// #### method: deafenAll
// Removes all listeners from the event.
// @type this:Signal → Signal
Signal::deafenAll = function() {
  this.listeners.length = 0;
  return this;
}

// #### method: trigger
// Invokes all listeners.
// @type this:Signal, Any → Task(α, [β])
Signal::trigger = function(data) {
  var listeners = this.listeners;
  return parallel <| listeners.map(λ(f) -> f(data))
}

// -- Exports ----------------------------------------------------------
module.exports = Signal;
