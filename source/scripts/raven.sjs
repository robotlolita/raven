var zenpen = require('./scripts/zenpen.js')(window, document);
window.onload = function() {
  require('./scripts/main')(zenpen, window, document, jQuery).fork(
    function(error) {
      console.error(error);
      alert('An error prevented Raven from being started.');
    },
    function() { }
  );
}

