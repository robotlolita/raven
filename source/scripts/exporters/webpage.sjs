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


module.exports = function(storage) {

  var React = require('react');
  var path = require('path');
  var Maybe = require('data.maybe');
  var { readAsText, writeAsText } = require('io.filesystem')(require('fs'));
  var { saveAsDialog, resource, slugify } = require('../utils');


  var Page = React.createClass({
    getInitialProps: function() {
      return {
        title: '',
        text: '',
        style: '',
        author: Maybe.Nothing()
      }
    },
    
    render: function() {
      return (
        <html>
          <head>
            <meta charSet="utf-8" />
            <title>{ this.props.title }</title>
            <style type="text/css" dangerouslySetInnerHTML={{ __html: this.props.style }} />
          </head>
          <body>
            <div className="novel">
              <h1>{ this.props.title }</h1>
              {
                this.props.author.isNothing?  null
                : /* otherwise */             <div className="meta-author">by <span>{ this.props.author.get() }</span></div>
              }
              <div className="novel-contents" dangerouslySetInnerHTML={{ __html: this.props.text }} />
            </div>
          </body>
        </html>
      )
    }
  });

  function saveAsHtml(novel, text) {
    return $do {
      style <- readAsText(resource('webpage/stylesheet.css'));
      var page = Page({
        title: novel.title,
        author: novel.author,
        text: text,
        style: style
      });
      var html = React.renderToStaticMarkup(page);
      file <- saveAsDialog(slugify(novel.title) + '.html');
      writeAsText(file, html);
    }
  }

  return {
    save: saveAsHtml,
    icon: 'icon-html',
    title: 'WebPage',
    description: 'Exports to a web-page optimised for reading.'
  }

}
