module.exports = function(storage) {
  
  var { readAsText } = require('io.filesystem')(require('fs'));
  var Maybe = require('data.maybe');
  var Future = require('data.future');
  var marked = require('marked');

  function doImport(title, filename) {
    return $do {
      text <- readAsText(filename);
      return {
        title: title,
        author: Maybe.Nothing(),
        tags: [],
        modifiedAt: Maybe.Nothing(),
        text: marked(text)
      }
    }
  }

  return {
    doImport: doImport,
    filter: ['.md', '.markdown', 'text/plain'],
    icon: 'icon-markdown',
    title: 'Markdown',
    description: 'Import novels stored as Markdown-formatted plain text.'
  }

}
