module.exports = function(screenManager, storage) {

  return {
    Entry: require('./entry')(screenManager, storage),
    Editor: require('./editor')(screenManager, storage),

    SetupFolder: require('./folder-config')(screenManager, storage),

    Settings: require('./raven-config')(screenManager, storage)
  }

}
