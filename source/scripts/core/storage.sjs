// # module: storage
//
// A wrapper over localStorage
module.exports = function(Platform) {
  // -- Dependencies ---------------------------------------------------
  var store          = Platform.window.localStorage;
  var Task           = require('data.future');
  var show           = require('core.inspect');
  var { curry }      = require('core.lambda');
  var { Base, Cata } = require('adt-simple');

  // -- Data structures ------------------------------------------------
  // ### object: StorageError
  //
  // Errors that might occur while storing/retrieving values.
  union StorageError {
    InexistentKey { key: String, error: Error },
    InvalidFormat { key: String, value: *, error: Error }
  } deriving (Base, Cata)

  // #### method: describe
  // Returns a textual description of the error.
  // @type this:StorageError → String
  StorageError::describe = function() {
    return match this {
      InexistentKey(k, _)    => "Key " + show(k) + " doesn't exist in the storage.",
      InvalidFormat(k, v, _) => "Key " + show(k) + " contains an invalid value: " + show(v)
    }
  };

  // #### method: make
  // Constructs a new instance of a StorageError
  InexistentKey::make = λ[InexistentKey(#, new Error())];
  InvalidFormat::make = λ[InvalidFormat(#, #, new Error())];

  // #### method: stack
  // Returns a stack trace for the StorageError
  // @type this:StorageError → String
  StorageError::stack = function() {
    return this.error.stack.split('\n').slice(1).join('\n')
  };
    
  

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
          reject(InvalidFormat.make(key, store[key]))
        }
      } else {
        reject(InexistentKey.make(key))
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
