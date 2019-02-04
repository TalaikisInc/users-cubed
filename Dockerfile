FROM keymetrics/pm2:latest-alpine

RUN npm i -g pm2
RUN apk add --no-cache --virtual .build-deps git python alpine-sdk

WORKDIR /var/www/app
COPY ./ ./
RUN npm i

ENV NODE_ENV production 
ENV PORT 3000

EXPOSE 3000

RUN npm run build
RUN apk del .build-deps

CMD ["pm2-runtime", "start.js", "i", "2"]
