var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var searchHelper = require('./helpers.js');

var app = express();

app.use(express.static(__dirname+'../client'));
app.use(bodyParser.json());
app.post('/search', function(req, res){
  //call searchHelper(req, res)
});

app.listen(3000, function(){
  console.log('Server running on port 3000')
});