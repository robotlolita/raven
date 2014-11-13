window.onload = function() {
  require('./scripts/main')(window, document, jQuery, md, require('nw.gui')).fork(
    function(error) {
      console.error(error);
      alert('An error prevented Raven from being started.');
    },
    function() { }
  );
}

