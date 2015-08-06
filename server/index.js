var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var searchHelpers = require('./helpers.js');

var app = express();

app.use(express.static(__dirname+'/../client'));
app.use(bodyParser.json());
app.post('/search', function(req, res){
  console.log(req.body.data)
  searchHelpers.searchResults(req.body.data, function(err, results){
    res.send(results)
  })
});

app.listen(process.env.PORT || 3000, function(){
  console.log('Server running on port 3000')
});