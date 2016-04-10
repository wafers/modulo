'use strict';

var helpers = require('./helpers/'),
    cache = require('../cache.js');

// Fetches module relationships
module.exports = function(req, res) {
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
