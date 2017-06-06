# faceornot

## spec
- takes a GET request to `/` with a query parameter `url` (which must be url
  encoded)
- returns a json body that looks like:
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
