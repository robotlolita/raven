var slug = require('slug');
var fs = require('fs');
var path = require('path');
var Future = require('data.future');
var $ = jQuery;

exports.slugify = function(text) {
  return slug(text).toLowerCase()
}

exports.run = function(future) {
  future.fork(
    function(error){
      if (error) {
        console.log('Error: ' + error + '\n' + error.stack)
      }
      window.alert(error);
    },
    function(){ }
  )
}

exports.home = function() {
  var env = process.env;
  return process.platform === 'win32'?  env.USERPROFILE || (env.HOMEDRIVE + env.HOMEPATH)
  :      /* otherwise */                env.HOME
}

exports.debounce = function(f, time) {
  var timer;
  return function() {
    var args = arguments
    var _this = this
    if (timer)  clearTimeout(timer);
    timer = setTimeout(function() {
      f.apply(_this, args)
    }, time)
  }
}

exports.selectDirectory = function(initial) {
  return new Future(function(reject, resolve) {
    var i = document.createElement('input');
    i.type = "file";
    i.nwdirectory = 'nwdirectory';
    if (initial)  i.nwworkingdir = initial;
    $(i).hide()
        .on('change', notifySelection)
        .appendTo($('body'))
        .click();

    function notifySelection() {
      resolve(i.value);
      $(i).detach();
    }
  })
}

exports.saveAsDialog = function(initial) {
  return new Future(function(reject, resolve) {
    var i = document.createElement('input');
    $(i).attr({ type: 'file', nwsaveas: initial })
        .hide()
        .on('change', notifySelection)
        .appendTo($('body'))
        .click();

    function notifySelection() {
      resolve(i.value);
      $(i).detach();
    }
  })
}
