'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }); 

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
 
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// Require mongoose and set up the URLShortener schema
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }); 

const Schema = mongoose.Schema;

const SavedURLSchema = new Schema ({
  original_url: String,
  code: Number
})

const SavedURLModel = mongoose.model('SavedURL', SavedURLSchema);

app.post('/api/shorturl/new', (req, res) => {
  dns.lookup(req.body.url.replace(/^https?:\/\//i, ''), {}, (error, address, family) => {
    if (error) {
      return res.json({
        error: 'invalid URL'
      })
    }
    let newURLInstance = new SavedURLModel({
      original_url: req.body.url,
      code: Math.floor(Math.random()*10000)
    })
    newURLInstance.save((error, data) => {
      if (error) {
        return console.log(error);
      }
      res.json({
        original_url: data.original_url,
        short_url: data.code
      })
    })
  })
})

app.get('/api/shorturl/:code', (req, res) => {
  SavedURLModel.findOne({
    code: req.params.code
  }, (error, data) => {
    if (error) {
      return console.log(error);
    }
    // dns.lookup(data.original_url.replace(/^https?:\/\//i, ''), {}, (error, address, family) => {
    //   if (error) {
    //     return console.log('error', error);
    //   }
    //   console.log(address);
    //   console.log(family);
      res.redirect(data.original_url);
    // })
  })
})

app.listen(port, function () {
  console.log('Node.js listening on port ' + port + '.');
});