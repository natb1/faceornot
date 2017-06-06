var http = require('http');

this.server = http.createServer(function (req, res) {
  analysis = {
    images: []
  }
  body = JSON.stringify(analysis)
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(body);
});

exports.listen = function () {
  this.server.listen.apply(this.server, arguments);
};

exports.close = function (callback) {
  this.server.close(callback);
};
