// Add request handlers to routes in here
var helpers = require('./helpers.js');

// Old npm search crawling + parsing for search results
var npmSearch = module.exports.npmSearch = function(req, res){
  var moduleName = req.body.data;
  helpers.searchResults(moduleName, function(err, searchResults){
    if(err) { console.log(err) }
    else{
      res.json(searchResults);
    }
  })
}

// New keyword algorithm search results
var search = module.exports.search = function(req, res){
  var moduleName = req.body.data;
  helpers.keywordSearch(moduleName, function(err, searchResults){
    if(err) { console.log('ERROR IN KEYWORD SEARCH')/*console.log(err)*/ }
    else{
      res.json(searchResults);
    }
  })
}

// Fetches module relationships
var relationships = module.exports.relationships = function(req, res){
  var moduleName = req.body.data;
  helpers.findRelationships(moduleName, function(err, relationships){
    res.send(relationships);
  });
}

// Fetches all the data for a specific module
var detailedSearch = module.exports.detailedSearch = function(req, res){
  var moduleName = req.body.data;
  helpers.detailedSearch(moduleName, function(err, results){
    res.json(results);
  });
}

// Fetches the all top 10 modules data 
var topModules = module.exports.topModules = function(req, res){
  helpers.getTopModules(function(err, data){
    res.json(data);
  });
}

// Fetches 8 most-related keywords for a given keyword. Used in keyword graph.
var relatedKeywordSearch = module.exports.relatedKeywordSearch = function(req, res) {
  helpers.relatedKeywordSearch(req.body.data, function(err, data) {
    if (err) {
      res.send('No keywords found')
    } else {
      res.json(data)
    }
  })
}