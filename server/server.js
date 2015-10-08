var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var searchHelpers = require('./helpers.js');
var routes = require('./routes.js');
var cache = require('./cache.js');
var logger = require('morgan');
var fs = require('fs');

var app = express();

var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});
logger.token('data', function(req, res){ return req.body ? 'Search Term: ' + JSON.stringify(req.body.data) : 'Other'; });

app.use(logger(':method :url :data :response-time', {stream: accessLogStream}));
app.use('/scripts', express.static(__dirname+'/../bower_components'));
app.use(express.static(__dirname+'/../client'));
app.use(bodyParser.json());
routes(app);

app.listen(process.env.PORT || 3000, function(){
  console.log('Server running on port 3000')
});
cache.connect();
