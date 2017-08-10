const async = require('async');

const { UtapiClient } = require('./src/lib/UtapiClient');

// Values must be Number.MAX_SAFE_INTEGER or less.
const desiredStates = [
    {
        bucketName: 'demo-bucket-0',
        storageUtilized: 1024,
        incomingBytes: 1024,
        outgoingBytes: 0,
        numberOfObjects: 10,
        operations: {
            's3:DeleteBucket': 0,
            's3:DeleteBucketCors': 0,
            's3:DeleteBucketWebsite': 0,
            's3:ListBucket': 0,
            's3:GetBucketAcl': 0,
            's3:GetBucketCors': 0,
            's3:GetBucketWebsite': 0,
            's3:CreateBucket': 0,
            's3:PutBucketAcl': 0,
            's3:PutBucketCors': 0,
            's3:PutBucketWebsite': 0,
            's3:PutObject': 10,
            's3:CopyObject': 0,
            's3:UploadPart': 0,
            's3:ListBucketMultipartUploads': 0,
            's3:ListMultipartUploadParts': 0,
            's3:InitiateMultipartUpload': 0,
            's3:CompleteMultipartUpload': 0,
            's3:AbortMultipartUpload': 0,
            's3:DeleteObject': 0,
            's3:MultiObjectDelete': 0,
            's3:GetObject': 0,
            's3:GetObjectAcl': 0,
            's3:PutObjectAcl': 0,
            's3:HeadBucket': 0,
            's3:HeadObject': 0,
        },
    },
    {
        bucketName: 'demo-bucket-1',
        storageUtilized: 1024,
        incomingBytes: 1024,
        outgoingBytes: 0,
        numberOfObjects: 10,
        operations: {
            's3:DeleteBucket': 0,
            's3:DeleteBucketCors': 0,
            's3:DeleteBucketWebsite': 0,
            's3:ListBucket': 0,
            's3:GetBucketAcl': 0,
            's3:GetBucketCors': 0,
            's3:GetBucketWebsite': 0,
            's3:CreateBucket': 0,
            's3:PutBucketAcl': 0,
            's3:PutBucketCors': 0,
            's3:PutBucketWebsite': 0,
            's3:PutObject': 10,
            's3:CopyObject': 0,
            's3:UploadPart': 0,
            's3:ListBucketMultipartUploads': 0,
            's3:ListMultipartUploadParts': 0,
            's3:InitiateMultipartUpload': 0,
            's3:CompleteMultipartUpload': 0,
            's3:AbortMultipartUpload': 0,
            's3:DeleteObject': 0,
            's3:MultiObjectDelete': 0,
            's3:GetObject': 0,
            's3:GetObjectAcl': 0,
            's3:PutObjectAcl': 0,
            's3:HeadBucket': 0,
            's3:HeadObject': 0,
        },
    },
];

// Update UtapiClient configuration object to values from S3's root config.json.
const c = new UtapiClient({
    localCache: {
        host: '127.0.0.1',
        port: 6379,
    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
    },
});

async.each(desiredStates, (state, cb) =>
    async.times(state.numberOfObjects, (n, next) =>
        c.pushMetric('putObject', '', {
            bucket: state.bucketName,
            newByteLength: n === 0 ? state.storageUtilized : 0,
            oldByteLength: null,
        }, next),
    err => {
        if (err) {
            return cb(err);
        }
        process.stdout.write(`Updated state for bucket: ${state.bucketName}\n`);
        return cb();
    }),
err => {
    if (err) {
        process.stdout.write(`${err}`);
    }
    return process.exit();
});
