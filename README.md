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
`rumor.ml` and `linkedin.com`.

## debug (locally)
```
docker run \
    -v $PWD/test:/faceornot/test \
    -v $PWD/src:/faceornot/src \
    -p 8000:8000 \
    -it faceornot
```
```
curl localhost:8000
```
