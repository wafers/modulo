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

// var detailedSearch = module.exports.detailedSearch = function(req, res){
//   var moduleNames = req.body.data; // should be an array
//   helpers.detailedSearch(moduleNames, function(err, result){
//     if(err) { console.log(err) }
//     else{
//       console.log(result);
//       console.log(result.length);
//       res.json(result);
//     }
//   })
// }