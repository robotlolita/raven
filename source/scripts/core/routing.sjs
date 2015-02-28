// # module: routing
//
// Lightweight routing.

// -- Dependencies -----------------------------------------------------
var show = require('core.inspect');

// -- Implementation ---------------------------------------------------
function Router() {
  this.routes = {}
}

Router::register = function(route, value) {
  if (!(route in this.routes)) {
    this.routes[route] = value;
  } else {
    throw new Error("Route " + show(route) + " already registered for: " + show(this.routes[route]));
  }
}

Router::get = function(route) {
  if (route in this.routes) {
    return this.routes[route];
  } else {
    throw new Error("No route registered for " + show(route));
  }
}

module.exports = Router;
