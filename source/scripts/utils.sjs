var slug = require('slug');
var fs = require('fs');
var path = require('path');
var Future = require('data.future');

exports.slugify = function(text) {
  return slug(text).toLowerCase()
}

exports.run = function(future) {
  future.fork(
    function(error){
      if (error) {
        console.log('Error: ' + error + '\n' + error.stack)
      }
      alert(error);
    },
    function(){ }
  )
}

exports.home = function() {
  var env = process.env;
  return process.platform === 'win32'?  env.USERPROFILE || (env.HOMEDRIVE + env.HOMEPATH)
  :      /* otherwise */                env.HOME
}

exports.makeDir = function(path) {
  return new Future(function(reject, resolve) {
    fs.mkdir(path, function(error) {
      if (error)  reject(error)
      else        resolve()
    })
  })
}

exports.write = function(path, data) {
  return new Future(function(reject, resolve) {
    fs.writeFile(path, data, { encoding: 'utf-8' }, function(error) {
      if (error)  reject(error)
      else        resolve()
    })
  })
}

exports.read = function(path) {
  return new Future(function(reject, resolve) {
    fs.readFile(path, { encoding: 'utf-8' }, function(error, data) {
      if (error)  reject(error)
      else        resolve(data)
    })
  })
}

exports.listDir = function(path) {
  return new Future(function(reject, resolve) {
    fs.readdir(path, function(error, data) {
      if (error)  reject(error)
      else        resolve(data)
    })
  })
}

exports.novelHome = function() {
  return path.join(exports.home(), 'Dropbox', '.Raven')
}

exports.novelPath = function(name) {
  return path.join(exports.novelHome(), exports.slugify(name) + '.md')
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
