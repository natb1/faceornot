from node

RUN apt-get update
RUN apt-get install -y libopencv-dev

ADD . /faceornot
WORKDIR /faceornot

RUN npm install
CMD npm start
