window.onload = function() {
  require('./scripts/main')(window, document, jQuery, md).fork(
    function(error) {
      console.error(error);
      alert('An error prevented Raven from being started.');
    },
    function() { }
  );
}

