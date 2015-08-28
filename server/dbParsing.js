var helpers = require(__dirname + '/helpers.js')
var config = (process.env.DATABASE_URL) ? process.env.DATABASE_URL :  require(__dirname + '/config').db;
var fs = require('fs');
var _ = require('underscore');

var dbRemote = require("seraph")({
    user: process.env.DATABASE_USER || config.username,
    pass: process.env.DATABASE_PASS || config.password,
    server: process.env.DATABASE_URL || config.dbURL
});

// DB endpoint setup
var search = module.exports.search = function(moduleName, cb){
    dbRemote.find({name: moduleName},"MODULE", function(err, objs){
        if(err || !objs[0]){
            console.log(err);
            cb(err, null);  
        }
        else {
            cb(null, objs[0]);
        }
    })
}

var keywordSearch = module.exports.keywordSearch = function(keywordArray, cb) {
    var queryString = "MATCH (k:KEYWORD)-[r:KEYWORD_RELATED_WITH]-(m:KEYWORD) WHERE k.name IN {keywordInput} RETURN m, r ORDER BY r.count DESC LIMIT 8"
    dbRemote.query(queryString, {keywordInput: keywordArray}, function(err, keywordResults){
        if (err) { 
            console.log('ERROR IN FINDING RELATED KEYWORDS');
            cb(err, null);
        } else {
            keywordResultArray = keywordResults.map(function(keyword){
                return keyword.m.name;
            })

            keywordArray.forEach(function(key){
                keywordResultArray.push(key);
            })

            var secondQueryString = 'MATCH (k:KEYWORD)-[r:KEYWORD_OF]->(m:MODULE) WHERE k.name IN {keywordArray} AND m.overallRank > 0 WITH m, COUNT(k) AS matches, COLLECT(k) AS k WHERE matches > 1 RETURN m, matches, k ORDER BY m.overallRank DESC LIMIT 200';
            dbRemote.query(secondQueryString, {keywordArray: keywordResultArray}, function(err, modulesFound){
                if (err) {
                    console.log('ERROR IN FINDING MODULES BASED ON KEYWORD ARRAY')
                    cb(err, null)
                } else {
                    cb(null, modulesFound);
                }
            })
        }
    })
}

var relatedKeywordSearch = module.exports.relatedKeywordSearch = function (keywordArray, cb) {
    var queryString = 'MATCH (k:KEYWORD)-[r:KEYWORD_RELATED_WITH]-(m:KEYWORD) WHERE m.name IN {keywords} WITH k, COUNT(m) AS matches, COLLECT(m) AS m, COLLECT(r) AS r WHERE matches > 1 RETURN m , matches, k, r ORDER BY matches DESC'
    console.log(keywordArray)
    dbRemote.query(queryString, {keywords: keywordArray}, function(err, keywordResults){
        if (err) {
            console.log('ERROR IN FINDING RELATED KEYWORDS', err);
            cb(err, null);
        } else {
            keywordResultsArray = keywordResults.map(function(keyword){
               if (keyword.r[0].properties.count+keyword.r[1].properties.count > 20) return {name: keyword.k.name, count: keyword.r[0].properties.count+keyword.r[1].properties.count};
               else return;
            })
            keywordResultsArray = _.compact(keywordResultsArray)
            cb(null, keywordResultsArray)
        }
    });
}

var fetchRelationships = module.exports.fetchRelationships = function(moduleName, cb){
    var queryString = "MATCH (n:MODULE { name: {name} })<-[r:DEPENDS_ON]-(m:MODULE) RETURN m.name, m.monthlyDownloadSum;"
    dbRemote.query(queryString, {name: moduleName}, function(err, result){
      if(err) { console.log(err); cb(err, null); return; }

      // change the data 
      if (!Array.isArray(result)) {
        result = [result];
      }
      var result = result.map(function(obj){
        return { name : obj['m.name'], monthlyDownloadSum : obj['m.monthlyDownloadSum'] };
      });
      cb(null, result);
    })
}

var fetchTopModuleData = module.exports.fetchTopModuleData = function(cb){
    var data = {};
    var dataToFetch = ['overallRank', 'monthlyDownloadSum', 'dependentRank'];

    dataToFetch.forEach(addToDataObject);

    function inDataObject(property){ return data.hasOwnProperty(property); }

    function addToDataObject(property){
        var queryString = "MATCH (n:MODULE) WHERE n." + property + " IS NOT NULL return n.name, n." + property + " order by n." + property + " DESC LIMIT 10;";

        // Send the DB QUERY
        dbRemote.queryRaw(queryString, function(err, result){
            console.log('inside the dbquery for ', property);
            if(err) {console.log(err); cb(err, null); return;}
            data[property] = result;

            // Check if the data object is ready to be sent back
            if(dataToFetch.every(inDataObject)){
                cb(null, data);
            }
        });
    }
}