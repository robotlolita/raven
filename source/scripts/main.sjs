var Future  = require('data.future');
var Maybe   = require('data.maybe');
var path    = require('path');

module.exports = function(window, document, $, md) {
  global.window         = window;
  global.document       = document;
  global.navigator      = window.navigator;
  global.jQuery         = window.$;
  global.htmlToMarkdown = window.md;

  var utils   = require('./utils');

  var storage = (function() {
    var store = window.localStorage;
    
    return {
      at: function(key) {
        return new Future(function(reject, resolve) {
            key in store?    resolve(JSON.parse(store[key]))
          : /* otherwise */  reject(new Error('Key not in the storage'))
        })
      },

      put: function(key, value) {
        return new Future(function(reject, resolve) {
          store[key] = JSON.stringify(value);
          resolve(store[key])
        })
      }
    }
  }());

  var screenManager = (function() {
    var screenMap = {};

    function changeToScreen(screen, data) {
      return new Future(function(reject, resolve) {
        if ($('#app > .screen').length === 0)  return doChange();
        
        $('#app > .screen').addClass('fading');
        setTimeout(doChange, 300);
        
        function doChange() {
          if (data) screen.setState(data);
          React.render(screen, $('#app').get(0));
          resolve(screen);
        }
      });
    }

    function navigate(url, props, data) {
      console.log('>>> Navigating to ' + url);
      if (!(url in screenMap))
        throw new Error('No screen for ' + url);

      return changeToScreen(screenMap[url](props), data);
    }

    function register(url, screen) {
      if (url in screenMap)
        throw new Error(url + ' is already registered.');
      
      screenMap[url] = screen;
    }

    return {
      changeTo: changeToScreen,
      navigate: navigate,
      register: register
    }

  }());


  var React   = require('react/addons');
  var Screens = require('./screens')(screenManager, storage);

  screenManager.register('/', Screens.Entry);
  screenManager.register('/editor', Screens.Editor);
  
  
  return storage.at('settings.home').cata({
    Rejected: λ(_) -> screenManager.changeTo(Screens.SetupFolder()),
    Resolved: λ(_) -> screenManager.changeTo(Screens.Entry())
  }).chain(λ(a) -> a);

}
