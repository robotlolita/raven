module.exports = function(storage) {

  var { writeAsText } = require('io.filesystem')(require('fs'));
  var { slugify, saveAsDialog } = require('../utils');

  var NEW_LINE = process.platform === 'win32'? '\r\n' : '\n'

  function fixNewLines(text) {
    return text.split(/\n/g).join(NEW_LINE)
  }

  function saveAsMarkdown(novel, text) {
    return $do {
      var md = htmlToMarkdown(text);
      file <- saveAsDialog(slugify(novel.title) + '.md');
      writeAsText(file, fixNewLines('# ' + novel.title + ' #\n\n' + md));
    }
  }
  
  return {
    save: saveAsMarkdown,
    icon: 'icon-markdown',
    title: 'Markdown',
    description: 'Exports to plain text formatted as Markdown.'
  }

}
