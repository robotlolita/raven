var ui = require('nw.gui');

window.onload = function() {
  require('./scripts/main')(window, document, jQuery, md, ui).fork(
    function(error) {
      console.error(error);
      alert('An error prevented Raven from being started.');
    },
    function() { }
  );
};


$('#app-close-button').on('click', function() {
  ui.Window.get().close()
});

if (process.platform === 'darwin') {
  Mousetrap.bindGlobal("command+a", function() {
    document.execCommand("selectAll");
  });

  Mousetrap.bindGlobal("command+x", function() {
    document.execCommand("cut");
  });

  Mousetrap.bindGlobal("command+c", function() {
    document.execCommand("copy");
  });

  Mousetrap.bindGlobal("command+v", function() {
    document.execCommand("paste");
  });
}
