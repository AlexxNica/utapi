FROM scality/nodesvc-base

#
# Install apt packages needed by utapi and buildbot_worker
#
COPY utapi_packages.list buildbot_worker_packages.list /tmp/

RUN apt-get update -q \
    && apt-get install -qy software-properties-common python-software-properties \
    && add-apt-repository ppa:ubuntu-toolchain-r/test \
    && apt-get update -q \
    && cat /tmp/utapi_packages.list | xargs apt-get install -qy \
    && cat /tmp/buildbot_worker_packages.list | xargs apt-get install -qy \
    && pip install pip==9.0.1 \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /tmp/packages.list

ENV CXX=g++-4.9

# eve configuration
#
RUN adduser -u 1042 --home /home/eve --disabled-password --gecos "" eve \
    && adduser eve sudo \
    && sed -ri 's/(%sudo.*)ALL$/\1NOPASSWD:ALL/' /etc/sudoers

#ARG BUILDBOT_VERSION=0.9.7


RUN pip install buildbot-worker==$BUILDBOT_VERSION service_identity

USER eve

#
# Install nodejs packages needed by utapi
#

#RUN mkdir /home/eve/node_reqs
#
#COPY package.json /home/eve/node_reqs/package.json
#RUN cd /home/eve/node_reqs && npm install

WORKDIR /home/eve/workspace

CMD buildbot-worker create-worker . "$BUILDMASTER:$BUILDMASTER_PORT" "$WORKERNAME" "$WORKERPASS" \
    && sudo service redis-server start \
    && twistd -ny buildbot.tac
