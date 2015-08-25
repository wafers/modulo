// Add request handlers to routes in here
var helpers = require('./helpers.js');

var npmSearch = module.exports.npmSearch = function(req, res){
  var moduleName = req.body.data;
  helpers.searchResults(moduleName, function(err, searchResults){
    if(err) { console.log(err) }
    else{
      res.json(searchResults);
    }
  })
}

var search = module.exports.search = function(req, res){
  var moduleName = req.body.data;
  console.log('Trying to do a keyword search.')
  helpers.keywordSearch(moduleName, function(err, searchResults){
    if(err) { console.log('ERROR IN KEYWORD SEARCH')/*console.log(err)*/ }
    else{
      console.log('Got the DB results. Sending response now')
      res.json(searchResults);
    }
  })
}

var relationships = module.exports.relationships = function(req, res){
  var moduleName = req.body.data;
  helpers.findRelationships(moduleName, function(err, relationships){
    res.send(relationships);
  });
}

var detailedSearch = module.exports.detailedSearch = function(req, res){
  var moduleName = req.body.data;
  helpers.detailedSearch(moduleName, function(err, results){
    res.json(results);
  });
}

var topModules = module.exports.topModules = function(req, res){
  helpers.getTopModules(function(err, data){
    res.json(data);
  });
}