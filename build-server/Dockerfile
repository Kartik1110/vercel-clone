FROM ubuntu:focal

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs

RUN apt-get install git -y

WORKDIR /home/app

COPY clone.sh clone.sh
COPY script.js script.js
COPY package*.json .

RUN npm install

RUN chmod +x clone.sh
RUN chmod +x script.js

ENTRYPOINT [ "/home/app/clone.sh" ]