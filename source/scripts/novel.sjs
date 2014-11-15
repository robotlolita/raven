var fs       = require('fs');
var path     = require('path');
var Future   = require('data.future');
var Maybe    = require('data.maybe');
var extend   = require('xtend');
var FS       = require('io.filesystem')(fs);
var entities = new (require('html-entities').AllHtmlEntities);

var { v4:uuid }               = require('node-uuid');
var { slugify, saveAsDialog } = require('./utils');
var { filterM }               = require('control.monads');
var { parallel }              = require('control.async')(Future);
var { unary }                 = require('core.arity');
var { flip, curry }           = require('core.lambda');
var zipWith                   = require('data.array/zips/zip-with');

module.exports = function(storage) {

  var exports = {};

  var novelHome        = storage.at('settings.home');
  var authorName       = storage.at('settings.author');
  var joinPath         = λ a b -> path.join(a, b);
  var appendPath       = flip(joinPath);
  var extendWithPath   = λ(data, path) -> extend(data, { path: path });
  var toNullable       = λ(a) -> a.cata({ Nothing: λ(_) -> null,
                                        Just:    λ(a) -> a });
  var writeAsText      = FS.write({ encoding: 'utf16le' });
  var readAsText       = FS.read({ encoding: 'utf16le' });
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
      dir     <- novelHome;
      folders <- FS.listDirectory(dir);
      dirs    <- filterM(Future, isNovelDirectory, folders.map(joinPath(dir)));
      files   <- parallel(dirs.map(appendPath('novel.json') ->> readAsText));
      var data = files.map(unary(JSON.parse) ->> normaliseNovel)
      return zipWith(extendWithPath, data, dirs);
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

  exports.load = load;
  function load(novel) {
    return readAsText(path.join(novel.path, 'contents'));
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
      return {
        title: title,
        author: author,
        modifiedAt: Maybe.Nothing(),
        tags: [],
        path: dir
      }
    }
  }

  exports.saveAsMarkdown = curry(2, saveAsMarkdown);
  function saveAsMarkdown(novel, text) {
    return $do {
      var md = htmlToMarkdown('<h1>' + entities.encode(novel.title) + '</h1>' + text);
      file <- saveAsDialog(slugify(novel.title) + '.md');
      FS.writeAsText(file, md);
    }
  }


  return exports;
}
