'use strict';

var helpers = require('./helpers');

// Old npm search crawling + parsing for search results

module.exports = function(req, res) {
  var moduleName = req.body.data;
  helpers.searchResults(moduleName, function(err, searchResults) {
    if (err) {
      console.log(err);
    } else {
      res.json(searchResults);
    }
  });
};
