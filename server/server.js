var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
// var routes = require('./routes.js');
var cache = require('./cache.js');

var app = express();

app.use('/scripts', express.static(__dirname+'/../bower_components'));
app.use(express.static(__dirname+'/../client'));
app.use(bodyParser.json());
app.use(require('./routes.js'));
// routes(app);

app.listen(process.env.PORT || 3000, function(){
  console.log('Server running on port 3000')
});
cache.connect();
