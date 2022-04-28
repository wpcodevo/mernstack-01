FROM node:17 as base
WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN rm -rf node_moduels && yarn install
COPY . .

FROM base as prod
RUN rm -rf build && yarn build

