'use strict';

var helpers = require('./helpers'),
    cache = require('../cache.js');

// Fetches the all top 10 modules data
module.exports = function(req, res) {
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
