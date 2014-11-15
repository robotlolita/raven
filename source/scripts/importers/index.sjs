module.exports = function(storage) {
  return {
    markdown: require('./markdown')(storage)
  }
}
