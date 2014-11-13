module.exports = function(screenManager, storage) {

  return {
    Entry: require('./entry')(screenManager, storage),
    SetupFolder: require('./folder-config')(screenManager, storage),
    Editor: require('./editor')(screenManager, storage)
  }

}
