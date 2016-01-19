FROM node:5.4.1
MAINTAINER Alex Buchanan (buchanae@gmail.com)

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY ./build /usr/src/app/client
COPY ./data.db /usr/src/app/
COPY ./js/server /usr/src/app/server

EXPOSE 8080
CMD ["node", "/usr/src/app/server", "8080", "/usr/src/app/data.db", "/usr/src/app/client"]
