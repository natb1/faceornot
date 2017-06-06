var assert = require('assert')
var http = require('http')
var url = require('url')

var api = require('../src/api')

describe('parseURL', function () {
  it('should parse example.com', function(done) {
    qurl = api.parseURL('http://localhost:8000/?url=https%3A%2F%2Fexample.com')
    assert.equal(qurl.href, 'https://example.com/')
    done()
  })
  it('should parse example.com/foo?bar', function(done) {
    encoded = 'https%3A%2F%2Fexample.com%2Ffoo%3Fbar'
    qurl = api.parseURL('http://localhost:8000/?url='+encoded)
    assert.equal(qurl.href, 'https://example.com/foo?bar')
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

describe('analyzeImage', function() {
  it('should return a face for Bill Murrays image', function(done) {
    furl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/BillMurraySept10TIFF.jpg/170px-BillMurraySept10TIFF.jpg'
    api.analyzeImage(new url.URL(furl), (err, image) => {
      assert.equal(image.isFace, true)
      done()
    })
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
      qurl = 'xxxx%3A%2F%2Fexample.com'
      http.get('http://localhost:8000/?url='+qurl, function (res) {
        assert.equal(400, res.statusCode)
        done()
      })
    })

    it('should return no images for example.com', function (done) {
      this.timeout(10000);
      qurl = 'https%3A%2F%2Fexample.com'
      http.get('http://localhost:8000/?url='+qurl, function (res) {
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
      qurl = 'http%3A%2F%2Frumor.ml'
      http.get('http://localhost:8000/?url='+qurl, function (res) {
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

    it('should return an image with a face for Bill Murrays wikipedia', function (done) {
      this.timeout(10000);
      qurl = 'https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FBill_Murray'
      http.get('http://localhost:8000/?url='+qurl, function (res) {
        var data = ''
  
        res.on('data', function (chunk) {
          data += chunk
        });
  
        res.on('end', function () {
          assert.equal(200, res.statusCode, data)
          analysis = JSON.parse(data)
          for (let i=0; i < analysis.images.length; i++){
            img = analysis.images[i]
            if (img.isFace) {
              done()
              return
            }
          }
          assert(false, "found no faces: "+JSON.stringify(analysis, null, 2))
          done()
        });
      });
    });

  });
});

