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


var fs       = require('fs');
var path     = require('path');
var Future   = require('data.future');
var Maybe    = require('data.maybe');
var extend   = require('xtend');
var FS       = require('io.filesystem')(fs);

var { v4:uuid }               = require('node-uuid');
var { slugify, saveAsDialog } = require('./utils');
var { filterM }               = require('control.monads');
var { parallel }              = require('control.async')(Future);
var { unary }                 = require('core.arity');
var { flip, curry }           = require('core.lambda');
var zipWith                   = require('data.array/zips/zip-with');

module.exports = function(storage) {

  var exports = {
    exporters: require('./exporters')(storage),
    importers: require('./importers')(storage)
  };


  var novelHome        = storage.at('settings.home');
  var authorName       = storage.at('settings.author');
  var joinPath         = λ a b -> path.join(a, b);
  var appendPath       = flip(joinPath);
  var extendWith       = λ a b -> extend(b, a);
  var extendWithPath   = function(data, path){ return extend(data, { path: path }) };
  var toNullable       = λ(a) -> a.cata({ Nothing: λ(_) -> null,
                                        Just:    λ(a) -> a });
  var writeAsText      = FS.writeAsText;
  var readAsText       = FS.readAsText;
  var UTF16            = { encoding: 'utf16le' }
  var isNovelDirectory = λ(dir) -> $do {
                           isDir   <- FS.isDirectory(dir);
                           hasMeta <- FS.exists(path.join(dir, 'novel.json'));
                           return isDir && hasMeta
                         }

  function normaliseNovel(a) {
    if (a.title == null)
      throw new Error('<title> is required. ' + JSON.stringify(a));

    return {
      title      : a.title,
      author     : Maybe.fromNullable(a.author),
      modifiedAt : a.modifiedAt? Maybe.of(new Date(a.modifiedAt)) : Maybe.Nothing(),
      tags       : a.tags || [],
      encoding   : a.encoding || 'utf8'
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

  function parseJson(data) {
    return new Future(function(reject, resolve) {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    })
  }

  var log = λ a b -> (console.log(a), b)

  function readNovelMetadata(file) {
    return FS.readAsText(file).chain(parseJson)
       <|> FS.read(UTF16, file).chain(parseJson).map(extendWith({ encoding: 'utf16le' }));
  }

  exports.list = list;
  function list() {
    return $do {
      dir     <- novelHome;
      folders <- FS.listDirectory(dir);
      dirs    <- filterM(Future, isNovelDirectory, folders.map(joinPath(dir)));
      files   <- parallel(dirs.map(appendPath('novel.json') ->> readNovelMetadata));
      return zipWith(extendWithPath, files.map(normaliseNovel), dirs);
    }
  }

  exports.migrate = migrate;
  function migrate(oldDir, newDir) {
    if (oldDir === newDir)  return Future.of(null);
    
    return $do {
      flag <- FS.exists(newDir);
      flag? Future.of(null) : makeDirectory("775", newDir);
      files <- FS.listDirectory(oldDir);
      folders <- filterM(Future, isNovelDirectory, files.map(joinPath(oldDir)));
      parallel <| folders.map(λ(a) -> FS.rename(a, path.join(newDir, path.basename(a))))
      return null
    }
  }

  exports.doImport = doImport;
  function doImport(data) {
    return $do {
      base <- novelHome;
      defaultAuthor <- authorName.cata({ Rejected: λ(_) -> Maybe.Nothing(), Resolved: Maybe.of });
      author <- return data.author <|> defaultAuthor;
      var dir = path.join(base, slugify(data.title) + '-' + uuid());
      FS.makeDirectory("775", dir);
      save({
        title: data.title,
        author: author,
        modifiedAt: data.modifiedAt,
        tags: data.tags,
        path: dir
      }, data.text);
    }
  }

  exports.load = load;
  function load(novel) {
    var filename = path.join(novel.path, 'contents');
    return $do {
      flag <- FS.exists(filename);
      if (flag) $do{
        FS.read({ encoding: novel.encoding }, filename)
      } else $do {
        Future.of('')
      }
    };
  }

  exports.save = curry(2, save);
  function save(novel, text) {
    return $do {
      writeAsText(path.join(novel.path, 'contents'), text);
      saveMetadata(novel)
    }
  }

  exports.saveMetadata = saveMetadata;
  function saveMetadata(novel) {
    return $do {
      var newNovel = extend(novel, { modifiedAt: Maybe.of(new Date) });
      writeAsText(path.join(novel.path, 'novel.json'), JSON.stringify(novelToJson(newNovel)));
      return newNovel
    }
  }

  exports.make = make;
  function make(title) {
    return $do {
      base <- novelHome;
      author <- authorName.cata({ Rejected: λ(_) -> Maybe.Nothing(), Resolved: Maybe.of });
      var dir = path.join(base, slugify(title) + '-' + uuid());
      FS.makeDirectory("775", dir);
      var meta = {
        title: title,
        author: author,
        modifiedAt: Maybe.Nothing(),
        tags: [],
        path: dir
      };
      writeAsText(path.join(meta.path, 'novel.json'), JSON.stringify(novelToJson(meta)));
      return meta
    }
  }

  return exports;
}
