var Future = require('data.future');
var { parallel } = require('control.async')(Future);

var is = λ a b -> a === b;
var isnt = λ a b -> a !== b;

function Signal() {
  this.listeners = []
}

Signal::listen = function(f) {
  if (this.listeners.some(is(f)))  return this;

  this.listeners.push(f);
  return this;
}

Signal::deafen = function(f) {
  this.listeners = this.listeners.filter(isnt(f));
  return this;
}

Signal::deafenAll = function() {
  this.listeners.length = 0;
  return this;
}

Signal::trigger = function(data) {
  var listeners = this.listeners;
  return parallel <| listeners.map(λ(f) -> f(data))
}

module.exports = Signal;
