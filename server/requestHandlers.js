// Add request handlers to routes in here
var helpers = require('./helpers.js');

var search = module.exports.search = function(req, res){
  var moduleName = req.body.data;
  helpers.searchResults(moduleName, function(err, searchResults){
    if(err) { console.log(err) }
    else{
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

var detailedSearch = module.exports.detailedSearch = function(res, res){
  var moduleName = req.body.data;
  helpers.detailedSearch(moduleName, function(err, results){
    res.json(results);
  });
}