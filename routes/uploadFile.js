var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var replaceall = require("replaceall");
var base64 = require('base-64');

var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    var dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    callback(null, dir);
  },
  filename: function(req, file, callback) {
    callback(null, file.originalname);
  }
});

var upload = multer({
  storage: storage
}).single('file');

router.post('/', function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      res.end('Error to upload file');
    }

    var basePath = req.protocol + '://' + req.get('host');
    var imageUrl = basePath + '/' + req.file.path;
    console.log(imageUrl);

    var templateString = fs.readFileSync('views/uploadFile.ejs', 'utf8');
    templateString = replaceall("<%= url %>", imageUrl, templateString)
    //console.log(templateString);
    var pagePath = Date.now() + ".html";
    var dir = path.resolve('pages') + "/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFile(dir + pagePath, templateString, function(err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
      var pageUrl = basePath + "/pages/" + pagePath
      console.log(pageUrl);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({
        // image: imageUrl,
        page: pageUrl
      }));
      res.end()
    });
  })
});

router.post('/base64', function(req, res) {
  //req.body.image
  //var decodedData = base64.decode(req.body.image);
  var bitmap = new Buffer(req.body.image, 'base64');
  var name = Date.now();
  var imageName = name + ".png";
  fs.writeFileSync(path.resolve('uploads') + "/" + imageName, bitmap);
  var basePath = req.protocol + '://' + req.get('host');

  var pagePath = name + ".html";
  var pageUrl = basePath + "/pages/" + pagePath
  var imageUrl = basePath + '/uploads/' + imageName;
  console.log(imageUrl);

  var templateString = fs.readFileSync('views/uploadFile.ejs', 'utf8');
  templateString = replaceall("<%= url %>", imageUrl, templateString)
  //console.log(templateString);

  fs.writeFile(path.resolve('pages') + "/" + pagePath, templateString, function(err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
    var pageUrl = basePath + "/pages/" + pagePath
    console.log(pageUrl);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      // image: imageUrl,
      page: pageUrl
    }));
    res.end()
  });
});

module.exports = router;
