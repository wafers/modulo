'use strict';

var helpers = require('./helpers/'),
    cache = require('../cache.js');

// New keyword algorithm search results
module.exports = function(req, res) {
    var moduleName = req.body.data,
        key = 'SEARCH_' + moduleName;

    // Log search to Mongo
    helpers.mongoLogger('searches', moduleName);
    helpers.mongoLogger('searchTally', moduleName);

    console.log('Memcached key is : ' + key);
    cache.get(key, function(err, value) {
        if (err) {
            console.log('Error with the search');
            console.log(err);
        } else if (value === null) {
            console.log('No data for key : ' + key);
            helpers.keywordSearch(moduleName, function(err, searchResults) {
                if (err) {
                    console.log('ERROR IN KEYWORD SEARCH'); /*console.log(err)*/
                } else {
                    cache.set('SEARCH_' + moduleName, searchResults, function(err, results) {
                        if (err) {
                            console.log(err);
                        }
                        console.log(results);
                        res.json(searchResults);
                    });
                }
            });
        } else {
            res.json(value);
        }
    });
};
