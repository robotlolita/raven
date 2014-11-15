var ui = require('nw.gui');
var Signal = require('./scripts/signal');

window.Intent = {
  quit: new Signal()
};

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
  Intent.quit.trigger(null).fork(
    function error(){ },
    function success(){
      ui.App.quit()
    }
  )
});

if (process.platform === 'darwin') {
  Mousetrap.bind("command+a", function() {
    document.execCommand("selectAll");
  });

  Mousetrap.bind("command+x", function() {
    document.execCommand("cut");
  });

  Mousetrap.bind("command+c", function() {
    document.execCommand("copy");
  });

  Mousetrap.bind("command+v", function() {
    document.execCommand("paste");
  });
}

Mousetrap.bind("ctrl+shift+i", function() {
  ui.Window.get().showDevTools('raven', false);
});
