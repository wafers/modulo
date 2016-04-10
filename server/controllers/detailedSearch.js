'use strict';

var helpers = require('./helpers/'),
    cache = require('../cache.js');

// Fetches all the data for a specific module
module.exports = function(req, res) {
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
            helpers.mongoLogger('details', moduleName);
            res.json(results);
          })
        }
      })
    } else {
      helpers.mongoLogger('details', moduleName);
      res.json(value)
    }
  })
}
