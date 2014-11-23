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


var slug = require('to-slug');
var fs = require('fs');
var path = require('path');
var Future = require('data.future');
var mv = require('mv');
var $ = jQuery;

exports.slugify = slug;

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
};

exports.spawn = function(future) {
  exports.run(future);
  return Future.of();
}

exports.home = function() {
  var env = process.env;
  return process.platform === 'win32'?  env.USERPROFILE || (env.HOMEDRIVE + env.HOMEPATH)
  :      /* otherwise */                env.HOME
};

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
};

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
};

exports.saveAsDialog = function(initial) {
  return new Future(function(reject, resolve) {
    var i = document.createElement('input');
    $(i).attr({ type: 'file', nwsaveas: initial });
    i.files.append(new window.File('', ''));

    $(i).hide()
        .on('change', notifySelection)
        .appendTo($('body'))
        .click();

    function notifySelection() {
      if (i.value)  resolve(i.value);
      else          reject(new Error(''));
      $(i).detach();
    }
  })
};

exports.chooseFileDialog = function(accept, multiple, initialDir) {
  return new Future(function(reject, resolve) {
    var i = document.createElement('input');
    $(i).attr({
      type: 'file',
      multiple: multiple,
      accept: accept.join(','),
      nwworkingdir: initialDir
    });
    i.files.append(new window.File('', ''));

    $(i).hide()
        .on('change', notifySelection)
        .appendTo($('body'))
        .click();

    function notifySelection() {
      if (i.value)  resolve(i.value);
      else          reject(new Error(''));
      $(i).detach();
    }
  })
};

exports.values = function(object) {
  return Object.keys(object).map(λ(k) -> object[k])
};

exports.resource = path.join.bind(path, path.join(__dirname, '../../resources'));

exports.showMessage = function(a) {

};

exports.move = function(a, b) {
  return new Future(function(reject, resolve) {
    mv(a, b, function(error) {
      if (error)  reject(error)
      else        resolve()
    })
  })
}
