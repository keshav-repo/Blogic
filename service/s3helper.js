var AWS = require('aws-sdk'),
  fs = require('fs'),
  path = require('path'),
  _ = require('underscore'),
  Q = require('q'),
  L = null;

function s3helper(opts) {
  L = opts.L || require('pino');
  let self = this;
  self.configureAWS();
  self.configureS3();
}

s3helper.prototype.configureAWS = function () {
  AWS.config.update({
    accessKeyId: "test",
    secretAccessKey: "test"
  });
}

s3helper.prototype.configureS3 = function () {
  let self = this;
  self.s3 = new AWS.S3({
    endpoint: 'http://localhost:4566',
    s3ForcePathStyle: true,
    accessKeyId: 'test',
    secretAccessKey: 'test',
    region: 'us-east-1',
  });
}

s3helper.prototype.uploadfile = function (filePath) {
  let params = {
    Bucket: 'sample-bucket',
    Body: fs.createReadStream(filePath),
    Key: "image4.jpg"
  },
    defer = Q.defer;

  s3.putObject(params, function (err, data) {
    //handle error
    if (err) {
      console.log("Error", err);
      defer.reject(err);
    }
    else {
      console.log("Uploaded in:", data.Location);
      defer.resolve();
    }
  });
  return defer.promise;
}

module.exports = s3helper;
