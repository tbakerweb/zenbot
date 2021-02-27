FROM node:10 as builder
ADD . /app
WORKDIR /app
RUN npm install -g node-gyp
RUN npm install --unsafe

FROM node:10-alpine

ADD . /app
WORKDIR /app

COPY --chown=node . /app
COPY --chown=node --from=builder /usr/local/lib/node_modules/ /usr/local/lib/node_modules/
COPY --chown=node --from=builder /app/node_modules /app/node_modules/

ENV NODE_ENV production

ENTRYPOINT ["/app/zenbot.sh"]
CMD [ "trade", "--paper" ]
