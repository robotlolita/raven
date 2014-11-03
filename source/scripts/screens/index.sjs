module.exports = function(screenManager, storage) {

  return {
    Entry: require('./entry')(screenManager, storage),
    Editor: require('./editor')(screenManager, storage)
  }

}
