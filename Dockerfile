FROM node:18.12.1-alpine
WORKDIR /opt/app
ADD package.json package.json
RUN yarn install
ADD . .
RUN yarn build
RUN yarn install --production
CMD ["node", "./dist/main.js"]