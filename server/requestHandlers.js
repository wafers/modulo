// Add request handlers to routes in here
var helpers = require('./helpers.js');
var cache = require('./cache.js');

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
    cache.get("SEARCH_" + moduleName, function(err, value) {
        if (err) {
            console.log(err)
        } else if (value === null) {
            helpers.keywordSearch(moduleName, function(err, searchResults) {
                if (err) {
                    console.log('ERROR IN KEYWORD SEARCH') /*console.log(err)*/
                } else {
                    cache.set("SEARCH_" + moduleName, searchResults, function() {
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
