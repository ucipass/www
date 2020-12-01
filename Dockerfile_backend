FROM node:12.16.0-alpine as frontend-stage
WORKDIR /source/rp
COPY ./frontend/package.json  .
RUN npm install
COPY ./frontend/public  public
COPY ./frontend/src  src
COPY ./frontend/vue.config.js  .
COPY ./frontend/babel.config.js  .
RUN npm run build


FROM node:12.16.0-alpine
WORKDIR /source/rp
COPY ./backend/package.json  package.json
RUN npm install  --only=production
COPY ./backend/lib  lib
# COPY ./backend/dist  dist
COPY ./backend/index.js  index.js
COPY --from=frontend-stage /source/rp/dist dist

CMD ["node", "index.js"]