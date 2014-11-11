var fs       = require('fs');
var path     = require('path');
var Future   = require('data.future');
var Maybe    = require('data.maybe');
var extend   = require('xtend');
var FS       = require('io.filesystem')(fs);

var { slugify }     = require('./utils');
var { filterM }     = require('control.monads');
var { parallel }    = require('control.async')(Future);
var { unary }       = require('core.arity');
var { flip, curry } = require('core.lambda');
var zipWith         = require('data.array/zips/zip-with');

module.exports = function(homePath) {

  var exports = {};

  var novelHome      = λ[homePath];
  var joinPath       = λ a b -> path.join(a, b);
  var appendPath     = flip(joinPath);
  var extendWithPath = λ(data, path) -> extend(data, { path: path });
  var toNullable     = λ(a) -> a.cata({ Nothing: λ(_) -> null,
                                        Just:    λ(a) -> a });
  var writeAsText    = FS.write({ encoding: 'utf16le' });
  var readAsText     = FS.read({ encoding: 'utf16le' });

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

  function novelToJson(a) {
    return {
      title: a.title,
      author: toNullable(a.author),
      modifiedAt: toNullable(a.modifiedAt),
      tags: a.tags
    }
  }

  exports.list = list;
  function list() {
    return $do {
      folders <- FS.listDirectory(homePath);
      dirs    <- filterM(Future, FS.isDirectory, folders.map(joinPath(homePath)));
      files   <- parallel(dirs.map(appendPath('novel.json') ->> readAsText));
      var data = files.map(unary(JSON.parse) ->> normaliseNovel)
      return zipWith(extendWithPath, data, dirs);
    }
  }

  exports.load = load;
  function load(novel) {
    return readAsText(path.join(novel.path, 'contents'));
  }

  exports.save = curry(2, save);
  function save(novel, text) {
    return $do {
      writeAsText(path.join(novel.path, 'contents'), text);
      var newNovel = extend(novel, { modifiedAt: Maybe.of(new Date) });
      writeAsText(path.join(novel.path, 'novel.json'), JSON.stringify(novelToJson(newNovel)));
      return newNovel
    }
  }

  exports.make = make;
  function make(title) {
    return $do {
      var dir = path.join(homePath, slugify(title));
      FS.makeDirectory("775", dir);
      return {
        title: title,
        author: Maybe.Nothing(),
        modifiedAt: Maybe.Nothing(),
        tags: [],
        path: dir
      }
    }
  }


  return exports;
}
