# faceornot

## spec
- takes a GET request to `/` with a query parameter `url` (which must be url
  encoded)
- makes a GET request to the provided `url`
- parses images and returns a json body that looks like:
```
{
  "images": [
    {
      "url": ...,
      "isFace": ...
    }, ...
  ]
}
```

## limitations
- We are only parsing the static body of an HTTP request. A headless browser
  such as phantomjs could be used to render and parse dynamic content.
- Node doesn't give us a lot of options for running the analyses in parallel
  (though, opencv may be doing this for us behind the scenes).
- We aren't handling failed http requests, though it would probably make sense
  to aggregate all of these potential errors and return them in the json
  response.
- We respond to requests synchronously which is not ideal from a systems
  perspective. Alternatively, we could drop the request on a queue and
  analyze the content asynchronously.

## build
```
docker build -t faceornot .
```

## test
```
docker run \
    -v $PWD/test:/faceornot/test \
    -v $PWD/src:/faceornot/src \
    -it faceornot npm test
```
Test url's are not mocked - they make real requests to `example.com`,
`rumor.ml` and Bill Murray's wikipedia page (and so may be just a little
flaky).

## debug (locally)
```
docker run \
    -v $PWD/test:/faceornot/test \
    -v $PWD/src:/faceornot/src \
    -p 8000:8000 \
    -it faceornot
```
```
curl localhost:8000/?url=https%3A%2F%2Fexample.com

{
  "images":[]
}
```
```
curl localhost:8000/?url=http%3A%2F%2Frumor.ml

{
  "images": [
    {
      "url": "http://rumor.ml/public/rumorml.png",
      "isFace": false
    }
  ]
}
```
```
curl localhost:8000/?url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FBill_Murray

{
  "images": [
    {
      "url": "https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Padlock-silver-light.svg/20px-Padlock-silver-light.svg.png",
      "isFace": false
    },
    ...
    {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/BillMurraySept10TIFF.jpg/170px-BillMurraySept10TIFF.jpg",
      "isFace": true
    },
    ...
  ]
}
```
