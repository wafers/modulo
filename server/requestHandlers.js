// Add request handlers to routes in here
var helpers = require('./helpers.js');
var cache = require('./cache.js');
var MongoClient = require('mongodb').MongoClient;

var mongoUrl = process.env.MONGOLAB_URI;
var mongoCollections = {
  searches: true,
  details: true,
  topModules: true
};

// Old npm search crawling + parsing for search results
var npmSearch = module.exports.npmSearch = function(req, res) {
  var moduleName = req.body.data;
  helpers.searchResults(moduleName, function(err, searchResults) {
    if (err) {
      console.log(err)
    } else {
      res.json(searchResults);
    }
  })
}


// New keyword algorithm search results
var search = module.exports.search = function(req, res) {
  var moduleName = req.body.data;
  key = "SEARCH_"+moduleName

  // Log search to Mongo
  MongoClient.connect(mongoUrl, function(err, db) {
    if(err) console.log('MONGO ERR', err);

    var searches = db.collection('searches');

    searches.insert({search: key}, function(err, result) {
      if(err) console.log('MONGO ERR', err);
      db.close();
    });
  });

  console.log("Memcached key is : " + key)
  cache.get(key, function(err, value) {
    if (err) {
      console.log("Error with the search")
      console.log(err)
    } else if (value === null) {
      console.log("No data for key : " + key)
      helpers.keywordSearch(moduleName, function(err, searchResults) {
        if (err) {
          console.log('ERROR IN KEYWORD SEARCH') /*console.log(err)*/
        } else {
          cache.set("SEARCH_" + moduleName, searchResults, function(err,results) {
            if(err)console.log(err)
              console.log(results)
            res.json(searchResults);
          })
        }
      })
    } else {
      res.json(value)
    }
  })
}

// Fetches module relationships
var relationships = module.exports.relationships = function(req, res) {
  var moduleName = req.body.data;
  cache.get("RELATIONSHIPS_" + moduleName, function(err, value) {
    if (err) {
      console.log(err)
    } else if (value === null) {
      helpers.findRelationships(moduleName, function(err, relationships) {
        if (err) {
          console.log('ERROR IN RELATIONSHIP FETCHING')
          console.log(err)
        } else {
          cache.set("RELATIONSHIPS_" + moduleName, relationships, function() {
            res.json(relationships);
          })
        }
      })
    } else {
      res.json(value)
    }
  })
}

// Fetches all the data for a specific module
var detailedSearch = module.exports.detailedSearch = function(req, res) {
  var moduleName = req.body.data;
  cache.get("DETAILEDSEARCH_" + moduleName, function(err, value) {
    if (err) { 
      console.log(err)
    } else if (value === null) {
      helpers.detailedSearch(moduleName, function(err, results) {
        if (err) {
          console.log('ERROR IN detailedSearch FETCHING') /*console.log(err)*/
        } else {
          cache.set("DETAILEDSEARCH_" + moduleName, results, function() {
            res.json(results);
          })
        }
      })
    } else {
      res.json(value)
    }
  })
}

// Fetches the all top 10 modules data 
var topModules = module.exports.topModules = function(req, res) {

  cache.get("TOPMODULES", function(err, value) {
    if (err) {
      console.log(err)
    } else if (value === null) {
      helpers.getTopModules(function(err, results) {
        if (err) {
          console.log('ERROR IN TOPMODULES FETCHING') /*console.log(err)*/
        } else {
          cache.set("TOPMODULES", results, function() {
            res.json(results);
          })
        }
      })
    } else {
      res.json(value)
    }
  })
}

// Fetches 8 most-related keywords for a given keyword. Used in keyword graph.
var relatedKeywordSearch = module.exports.relatedKeywordSearch = function(req, res) {
  var keywordArray = req.body.data
  cache.get("KEYWORDGRAPH_"+keywordArray, function(err, value) {
    if (err) {
      console.log(err)
    } else if (value === null) {
      helpers.relatedKeywordSearch(keywordArray, function(err, data) {
        if (err) {
          res.send('No keywords found')
        } else {
          cache.set("KEYWORDGRAPH_"+keywordArray, data, function() {
            res.json(data);
          })
        }
      })
    } else {
      res.json(value)
    }
  })
}