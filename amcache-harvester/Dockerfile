# ensure lightweight LTS version
FROM node:lts-alpine
RUN apk add --no-cache dumb-init
# optimize node for production environments
ENV NODE_ENV production
# avoid running as root
USER node
WORKDIR /usr/src/app
# avoid copying files as root
COPY --chown=node:node . .
# clean install node dependencies
RUN npm ci --only=production
# configure and invoke cron daemon as root user
USER root
ARG AMCACHE_HARVESTER_CRON_SCHEDULE "00 00 * * *"
# add cronjob
RUN echo "${AMCACHE_HARVESTER_CRON_SCHEDULE:-} node /usr/src/app/app.js" > /etc/crontabs/node
RUN echo "${AMCACHE_HARVESTER_CRON_SCHEDULE:-} echo 'hello from node on $(date)'" >> /etc/crontabs/node
# use dumb-init to handle orchestration events and safely terminate app
CMD ["dumb-init", "crond", "-f"]

