var api = require('./api')

var PORT = 8000

console.log('listening on port', PORT)

api.listen(8000)

process.on('SIGINT', function() {
  console.log('SIGINT')
  process.exit()
});

