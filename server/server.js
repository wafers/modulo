var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var searchHelpers = require('./helpers.js');
var routes = require('./routes.js');

var app = express();

app.use('/scripts', express.static(__dirname+'/../bower_components'));
app.use(express.static(__dirname+'/../client'));
app.use(bodyParser.json());
routes(app);

app.listen(process.env.PORT || 3000, function(){
  console.log('Server running on port 3000')
});