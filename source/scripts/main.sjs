var Future = require('data.future');
var Maybe  = require('data.maybe');

module.exports = function(zenpen, window, document, $) {
  var storage = (function() {
    var store = window.localStorage;
    
    return {
      at: function(key) {
        return key in store?    Maybe.of(JSON.parse(store[key]))
        :      /* otherwise */  Maybe.Nothing()
      },

      put: function(key, value) {
        store[key] = JSON.stringify(value)
      }
    }
  }());


  function maybeToFuture(m) {
    return m.cata({
      Nothing: function(){ return Future.rejected(void null) },
      Just:    function(a){ return Future.of(a) }
    })
  }
  
  return $do {
    Future.of(zenpen.init());
  }
}
