// Add request handlers to routes in here
var db = require('./dbParsing.js');

var search = module.exports.search = function(req, res){
  db.search(req.body.data, function(err, objs){
    // console.log(objs);
    res.json(objs[0]);
  })
}