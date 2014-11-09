var slug     = require('slug');
var fs       = require('fs');
var path     = require('path');
var Future   = require('data.future');
var Maybe    = require('data.maybe');
var extend   = require('xtend');
var FS       = require('io.filesystem')(fs);
var utils    = require('./utils');

var { filterM }  = require('control.monads');
var { parallel } = require('control.async')(Future);
var { unary }    = require('core.arity');
var { flip }     = require('core.lambda');
var zipWith      = require('data.array/zips/zip-with');

module.exports = function(homePath) {

  var novelHome      = λ[homePath];
  var joinPath       = λ a b -> path.join(a, b);
  var appendPath     = flip(joinPath);
  var extendWithPath = λ(data, path) -> extend(data, { path: path });

  function normaliseNovel(a) {
    if (a.title == null)
      throw new Error('<title> is required. ' + JSON.stringify(a));

    return {
      title      : a.title,
      author     : Maybe.fromNullable(a.author),
      modifiedAt : a.modifiedAt? Maybe.of(new Date(a.modifiedAt)) : Maybe.Nothing(),
      tags       : a.tags || []
    }
  }

  function novelList(dir) {
    return $do {
      folders <- FS.listDirectory(dir);
      dirs    <- filterM(Future, FS.isDirectory, folders.map(joinPath(dir)));
      files   <- parallel(dirs.map(appendPath('novel.json') ->> FS.readAsText));
      var data = files.map(unary(JSON.parse) ->> normaliseNovel)
      return zipWith(extendWithPath, data, dirs);
    }
  }

  



  return novelList

}
