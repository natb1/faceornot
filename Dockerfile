from node

ADD . /faceornot
WORKDIR /faceornot

RUN npm install
CMD npm start
