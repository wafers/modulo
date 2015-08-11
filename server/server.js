var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var searchHelpers = require('./helpers.js');
var routes = require('./routes.js');
// var dbParse = require('./dbParsing.js');

var app = express();

app.use(express.static(__dirname+'/../client'));
app.use(bodyParser.json());
routes(app);

app.listen(process.env.PORT || 3000, function(){
  console.log('Server running on port 3000')
});