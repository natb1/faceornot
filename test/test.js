var assert = require('assert')
var http = require('http')

var api = require('../src/api')

describe('parseURL', function () {
  it('should parse example.com', function(done) {
    url = api.parseURL('http://localhost:8000/?url=https%3A%2F%2Fexample.com')
    assert.equal(url.href, 'https://example.com/')
    done()
  })
  it('should parse example.com/foo?bar', function(done) {
    encoded = 'https%3A%2F%2Fexample.com%2Ffoo%3Fbar'
    url = api.parseURL('http://localhost:8000/?url='+encoded)
    assert.equal(url.href, 'https://example.com/foo?bar')
    done()
  })
})

describe('parseImages', function() {
  it('should parse an image from rumor.ml', function(done) {
    body = `<!DOCTYPE html>
      <html>
        <head>
         <meta name="google-site-verification" content="qDVbskOC4V2M8zPs_RX2XJ682c_ntPy_mSuggGkWeBA" />
          <link rel="stylesheet" href="client/landing.css">
        </head>
        <body>
          <div class="banner">
            <img src="public/rumorml.png" alt="rumor.ml logo" class="logo">
          </div>
          <div class="contact">
            <p>nathan@rumor.ml</p>
          </div>
        </body>
      </html>`
    images = parseImages(body, 'http://rumor.ml')
    assert.equal(images.length, 1)
    assert.equal(images[0], 'http://rumor.ml/public/rumorml.png')
    done()
  })
})

describe('requestQurl', function() {
  it('should get example.com', function() {
    // test not implemented
  })
})

describe('api', function () {
  before(function () {
    api.listen(8000);
  });

  after(function () {
    api.close();
  });

  describe('/', function () {
    it('should return 400 if missing query url', function (done) {
      http.get('http://localhost:8000', function (res) {
        assert.equal(400, res.statusCode)
        done()
      })
    })
  
    it('it should return 400 for unsupported protocol', function (done) {
      url = 'xxxx%3A%2F%2Fexample.com'
      http.get('http://localhost:8000/?url='+url, function (res) {
        assert.equal(400, res.statusCode)
        done()
      })
    })

    it('should return no images for example.com', function (done) {
      this.timeout(10000);
      url = 'https%3A%2F%2Fexample.com'
      http.get('http://localhost:8000/?url='+url, function (res) {
        var data = ''
  
        res.on('data', function (chunk) {
          data += chunk
        });
  
        res.on('end', function () {
          assert.equal(200, res.statusCode, data)
          analysis = JSON.parse(data)
          assert.equal(analysis.images.length, 0)
          done()
        });
      });
    });

    it('should return an image w/o a face for rumor.ml', function (done) {
      this.timeout(10000);
      url = 'http%3A%2F%2Frumor.ml'
      http.get('http://localhost:8000/?url='+url, function (res) {
        var data = ''
  
        res.on('data', function (chunk) {
          data += chunk
        });
  
        res.on('end', function () {
          assert.equal(200, res.statusCode, data)
          analysis = JSON.parse(data)
          assert.equal(analysis.images.length, 1)
          assert.equal(analysis.images[0].url, "http://rumor.ml/public/rumorml.png", analysis)
          assert.equal(analysis.images[0].isFace, false)
          done()
        });
      });
    });

  });
});

