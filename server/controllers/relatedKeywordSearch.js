'use strict';

var helpers = require('./helpers'),
    cache = require('../cache.js');

// Fetches 8 most-related keywords for a given keyword. Used in keyword graph.
module.exports = function(req, res) {
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
