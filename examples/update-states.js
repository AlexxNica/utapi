const async = require('async');
const Redis = require('ioredis');

/*
This script updates the state of Utapi `numberOfObjects` and `storageUtilized`
starting from the current timestamp (i.e., the latest 15 minute interval).

To use:
* Set REDIS_ENDPOINT to the host and port where the Redis server is running
* Set the various metric resource states (STATES) to your desired values. This
  can be an array of n length of objects. Each value `storageUtilized` and
  `numberOfObjects` of the state objects is optional, and you should only
  include those that you want to change.
*/

const REDIS_ENDPOINT = {
    host: '127.0.0.1',
    port: 6379,
};

const STATES = [
    {
        resource: 'buckets', // required
        bucket: 'test-bucket', // required
        storageUtilized: '0',
        numberOfObjects: '0',
    },
    {
        resource: 'accounts', // required
        accountId: '<account-canonical-id>', // required
        storageUtilized: '0',
        numberOfObjects: '0',
    },
    {
        resource: 'users', // required
        userId: '<user-id>', // required
        storageUtilized: '0',
        numberOfObjects: '0',
    },
    {
        resource: 'service', // required
        service: '<service-name>', // required
        storageUtilized: '0',
        numberOfObjects: '0',
    },
];

function generateStateKey(params, metric) {
    const { bucket, accountId, userId, service, resource } = params;
    const id = bucket || accountId || userId || service;
    return `s3:${resource}:${id}:${metric}`;
}

function getCurrentTimestamp() {
    const time = new Date();
    const minutes = time.getMinutes();
    return time.setMinutes((minutes - minutes % 15), 0, 0);
}

const redis = new Redis(Object.assign({
    enableOfflineQueue: true,
    keepAlive: 3000,
}, REDIS_ENDPOINT));

async.each(STATES, (params, cb) => {
    const { storageUtilized, numberOfObjects } = params;
    const timestamp = getCurrentTimestamp();
    const cmds = [];
    if (storageUtilized !== undefined) {
        const storageUtilizedKey = generateStateKey(params, 'storageUtilized');
        cmds.push(
            ['zremrangebyscore', storageUtilizedKey, timestamp, timestamp],
            ['zadd', storageUtilizedKey, timestamp, storageUtilized]);
    }
    if (numberOfObjects !== undefined) {
        const numberOfObjectsKey = generateStateKey(params, 'numberOfObjects');
        cmds.push(
            ['zremrangebyscore', numberOfObjectsKey, timestamp, timestamp],
            ['zadd', numberOfObjectsKey, timestamp, numberOfObjects]);
    }
    return redis.multi(cmds).exec(cb);
}, err => {
    if (err) {
        process.stdout.write(`An error occurred: ${err}\n`);
        process.exit(1);
    }
    process.stdout.write('Successfully updated all states.\n');
    process.exit();
});
