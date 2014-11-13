var NwBuilder = require('node-webkit-builder');
var nw = new NwBuilder({
  files: './dist/app/**',
  platforms: ['win', 'linux32', 'linux64', 'osx'],
  version: '0.11.0',
  buildDir: 'dist'
});

nw.on('log', console.log.bind(console));

nw.build().then(function() {
  console.log('All platforms built successfully.');
}).catch(function (error) {
  throw error
})