# ensure lightweight LTS version
FROM node:lts-alpine
RUN apk add dumb-init
# optimize for production environments
ENV NODE_ENV production
# avoid running as root
USER node
WORKDIR /usr/src/app
# avoid copying files as root
COPY --chown=node:node . .
RUN npm ci --only=production
# invoke with dumb-init to handle orchestration events and safely terminate app
CMD ["dumb-init", "node", "app.js"]
