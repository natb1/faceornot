var http = require('http');
var https = require('https');
var url = require('url');

var cheerio = require('cheerio')
var Faced = require('faced')
var async = require('async')

this.server = http.createServer(function (req, res) {
  qurl = parseURL(req.url)
  if (qurl === undefined) {
    res.writeHead(400, { 'Content-Type': 'application/text' })
    res.end('must provide query url')
    return
  }
  err = requestQurl(qurl, (qres) => { handleQres(qres, qurl.origin, res) })
  if (err !== undefined) {
    res.writeHead(400, { 'Content-Type': 'application/text' })
    res.end('unsupported protocol in query url')
    return
  }
});

parseURL = function (rurl) {
  q = url.parse(rurl, true).query
  if (q.url !== undefined) {
    return new url.URL(q.url)
  }
}
exports.parseURL = parseURL

requestQurl = function (qurl, onResponse) {
  if (qurl.protocol == 'http:') {
    http.get(qurl.href, onResponse)
  } else if (qurl.protocol == 'https:') {
    https.get(qurl.href, onResponse)
  } else {
    return 'unsupported protocol '+qurl.protocol
  }
}
exports.requestQurl = requestQurl

handleQres = function(qres, origin, res) {
  body = ''
  qres.on('data', function(chunk) {
    body += chunk
  })
  qres.on('end', function() {
    imageUrls = parseImages(body, origin)
    async.map(imageUrls, analyzeImage, (err, images) => {
      if (err !== null) {
        res.writeHead(500, { 'Content-Type': 'application/text' })
        res.end('failed to analyze images')
        console.log(err)
        return
      }
      analysis = { images: images.filter((img) => { return img !== null}) }
      body = JSON.stringify(analysis, null, 2)
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(body);
    })
  })
}

analyzeImage = function(imageUrl, done) {
  err = requestQurl(imageUrl, (ires) => {
    data = []
    ires.on('data', function(chunk) {
      data.push(chunk)
    })
    ires.on('end', function() {
      buffer = Buffer.concat(data)
      faced = new Faced();
      faced.detect(buffer, (faces, image, file) => {
        done(null, {url: imageUrl.href, isFace: faces.length > 0})
      })
    })
  })
  if (err !== undefined) {
    // ignore the http error
    done(null, null)
  }
}
exports.analyzeImage = analyzeImage

parseImages = function(body, base) {
  $ = cheerio.load(body)
  images = $('img').map(function() {
    return new url.URL($(this).attr('src'), base)
  }).get()
  return images
}
exports.parseImages = parseImages

exports.listen = function () {
  this.server.listen.apply(this.server, arguments);
};

exports.close = function (callback) {
  this.server.close(callback);
};
