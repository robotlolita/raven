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

  return saveAsHtml

}
