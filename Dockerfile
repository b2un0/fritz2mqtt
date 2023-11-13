FROM node:lts-alpine

ENV NODE_PATH="/usr/local/lib/node_modules" \
    NODE_ENV="production" \
    FRITZ_HOST="" \
    FRITZ_USERNAME="" \
    FRITZ_PASSWORD="" \
    MQTT_HOST="" \
    MQTT_TOPIC=""

ADD . /app

WORKDIR /app

RUN yarn install

CMD ["node", "main.js"]

SHELL ["/bin/ash"]
