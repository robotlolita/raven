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

var Maybe = require('data.maybe');
var Future = require('data.future');
var fs = require('fs');
var os = require('os');
var path = require('path');
var temp = require('temp');
var { exists, remove } = require('io.filesystem')(fs);
var semver = require('semver');
var http = require('net.http-client');
var request = require('request');
var { move } = require('./utils');

function pipe(a, b) {
  return new Future(function(reject, resolve) {
    var resolved = false;
    var p = a.pipe(b);
    p.on('finish', transition(resolve));
    p.on('error', transition(reject));

    function transition(f){ return function(v) {
      if (!resolved) {
        resolved = true;
        f(v);
      }
    }}
  })
}

var normalise = λ x -> {
  var download = Maybe.fromNullable(x.assets.filter(isPackage)[0]);
  return {
    tag_name: x.tag_name,
    draft: x.draft,
    prerelease: x.prerelease,
    download: download.map(λ x -> ({ url: x.browser_download_url, size: x.size })),
    body: x.body
  }
}

var isPackage = λ x -> x.name === 'package.nw';
var isRelease = λ x -> x.download.isJust;

var releases = exports.releases = λ url -> $do {
  response <- http.get({headers: { 'User-Agent': 'robotlolita/raven' }}, url);
  return JSON.parse(response.body).map(normalise).filter(isRelease);
}

var byMostRecentRelease = λ(a, b) -> semver.compare(b.tag_name, a.tag_name);

var sort = λ f xs -> xs.slice().sort(f);

var first = λ xs -> Maybe.fromNullable(xs[0]);

var filter = λ f xs -> xs.filter(f)

var mostRecent = exports.mostRecent = sort(byMostRecentRelease) ->> first;

var moreRecentThan = λ(x, release) -> semver.gt(release.tag_name, x);

var channels = exports.channels = {
  stable : λ x -> !x.prerelease,
  beta   : λ x -> true
}

var hasUpdates = exports.hasUpdates = λ url current channel ->
  releases(url) <$> filter(λ x -> channel(x) && moreRecentThan(current, x)) <$> mostRecent;

var tempFile = λ name -> temp.path({ prefix: name, dir: os.tmpDir() });

var execPath      = λ[path.dirname(process.execPath)];
var workingDir    = λ[process.cwd()];
var findPackageIn = λ x -> $do {
  var filename = path.join(x, 'package.nw');
  flag <- exists(filename);
  if (flag) $do {
    Future.of(filename)
  } else $do {
    Future.rejected(new Error('No package.nw in ' + x));
  }
}

var packagePath = λ(_) -> findPackageIn(execPath())
                      <|> findPackageIn(workingDir())
                      <|> Future.rejected(new Error("Couldn't find package.nw"));


var doUpdate = exports.doUpdate = λ release -> $do {
  var file = tempFile('package');
  download <- release.download.cata({ Nothing: Future.rejected, Just: Future.of });
  return console.log('Downloading package ' + download.url + ' -> ' + file);
  pipe(request(download.url), fs.createWriteStream(file));
  return console.log('Getting package path');
  target <- packagePath();
  return console.log('Moving ' + file + ' -> ' + target);
  move(file, target);
  return console.log('Update all done');
}
