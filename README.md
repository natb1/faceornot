# faceornot

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

## debug (locally)
```
docker run \
    -v $PWD/test:/faceornot/test \
    -v $PWD/src:/faceornot/src \
    -p 8000:8000 \
    -it faceornot
```
