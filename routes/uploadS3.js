var express = require('express');
var router = express.Router();
var fs = require('fs');
var replaceall = require("replaceall");
var AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: 'YOUR ID',
  secretAccessKey: 'YOUR ACCESS KEY'
});
const AWSUrlPrefix = "https://s3.amazonaws.com/fb-deeplink/";

var s3Bucket = new AWS.S3({
  params: {
    Bucket: 'fb-deeplink'
  }
});

router.post('/', function(req, res) {

  var name = Date.now();
  var imageName = name + ".jpeg";
  var imageKey = "images/" + imageName;

  var buf = new Buffer(req.body.image, 'base64');
  var data = {
    Key: imageKey,
    Body: buf,
    ContentEncoding: 'gzip',
    ACL: "public-read"
  };

  s3Bucket.putObject(data, function(err, data) {
    if (err) {
      console.log(err);
      console.log('Error uploading data: ', data);
    } else {
      var url = AWSUrlPrefix + imageKey;
      console.log('succesfully uploaded the image! ');
      createAndUpload(name, url, res);
    }
  });
});

function createAndUpload(name, imageUrl, res) {

  var pageName = name + ".html";
  var pageKey = "pages/" + pageName

  var templateString = fs.readFileSync('views/uploadFile.ejs', 'utf8');
  templateString = replaceall("<%= url %>", imageUrl, templateString)

  var data = {
    Key: pageKey,
    Body: templateString,
    ContentType: 'text/html',
    ACL: "public-read",
  };

  s3Bucket.upload(data, function(err, data) {
    if (err) {
      console.log(err);
      console.log('Error uploading data: ', data);
    } else {
      var pageUrl = AWSUrlPrefix + pageKey;
      console.log('succesfully uploaded the file! ');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({
        image: imageUrl,
        page: pageUrl
      }));

    }
  });

  // var data = {
  //   Key: pageKey,
  //   Body: templateString,
  //   ContentType: 'binary',
  //   ContentType: 'text/html',
  //   ACL: "public-read",
  // };
  //
  // s3Bucket.putObject(data, function(err, data) {
  //   if (err) {
  //     console.log(err);
  //     console.log('Error uploading data: ', data);
  //   } else {
  //     var pageUrl = AWSUrlPrefix + pageKey;
  //     console.log('succesfully uploaded the file! ');
  //     res.setHeader('Content-Type', 'application/json');
  //     res.send(JSON.stringify({
  //       image: imageUrl,
  //       page: pageUrl
  //     }));
  //
  //   }
  // });

}

module.exports = router;
