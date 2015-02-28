// # module: storage
//
// A wrapper over localStorage
module.exports = function(Platform) {
  // -- Dependencies ---------------------------------------------------
  var store     = Platform.window.localStorage;
  var Task      = require('data.future');
  var { curry } = require('core.lambda');

  // -- Data structures ------------------------------------------------
  // ### object: StorageError
  //
  // Errors that might occur while storing/retrieving values.
  union StorageError {
    NonExistentKey { key: String },
    InvalidFormat { key: String, value: * }
  }

  // -- Implementation -------------------------------------------------
  // ### function: at
  //
  // Returns the value associated with the key.
  //
  // @type String → Task(StorageError, Any)
  function at(key) {
    return new Task(function(reject, resolve) {
      if (key in store) {
        try {
          resolve(JSON.parse(store[key]))
        } catch (e) {
          reject(InvalidFormat(key, store[key]))
        }
      } else {
        reject(NonExistentKey(key))
      }
    })
  }

  // ### function: put
  //
  // Stores some value in the storage.
  //
  // @type String → α → Task(StorageError, Unit)
  function put(key, value) {
    return new Task(function(reject, resolve) {
      store[key] = JSON.stringify(value)
      resolve(store[key])
    })
  }
  
  // -- Exports --------------------------------------------------------
  return {
    StorageError: StorageError,
    at: at,
    put: curry(2, put)
  }
}
