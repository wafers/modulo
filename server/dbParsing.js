var helpers = require(__dirname + '/helpers.js')
var config = (process.env.DATABASE_URL) ? process.env.DATABASE_URL :  require(__dirname + '/config').db;
var fs = require('fs')

var dbRemote = require("seraph")({
    user: process.env.DATABASE_USER || config.username,
    pass: process.env.DATABASE_PASS || config.password,
    server: process.env.DATABASE_URL || config.dbURL
});

var dependencys = {}

var dbInsert = function(collection) {
    var finished = 0;
    for (var y = 0; y < collection.length; y++) {
        helpers.moduleDataBuilder(collection[y], function(err, data) {
            if (err) {
                finished++;
                if (finished === collection.length) {
                    console.log("Done inserting nodes, now working on relationships.")
                    relationshipInsert(dependencys)
                }
                return console.log("Oh, oh error")
            } else {
                var querryString = "MATCH (n{name:{name}}) SET n.description = {description}, n.time = {time}, n.url = {url} , n.starred = {starred}, n.downloads = {downloads}, n.monthlyDownloadSum = {monthlyDownloadSum}, n.dependentsSize = {dependentsSize}, n.readme = {readme}, n.keywords = {keywords}, n.subscribers = {subscribers}, n.forks = {forks}, n.watchers = {watchers}, n.openIssues = {openIssues}"
                console.log("Working on inserting into database. Finish count is", finished, "and y count is:", y)
                dependencys[data.name] = data.dependents
                dbRemote.queryRaw(querryString, {
                        name: data.name,
                        description: data.description,
                        time: JSON.stringify(data.time),
                        url: data.url,
                        starred: data.starred.length,
                        downloads: JSON.stringify(data.downloads),
                        monthlyDownloadSum: data.monthlyDownloadSum,
                        dependentsSize : data.dependents.length,
                        readme : data.readme,
                        keywords: data.keywords,
                        subscribers : data.subscribers,
                        forks : data.forks,
                        watchers: data.watchers,
                        openIssues: data.openIssues
                    },
                    function(err, node) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("INSERTION SUCCESS")
                        }
                    })

                finished++;
                if (finished === collection.length) {
                    console.log("Done inserting nodes, now working on relationships.")
                    relationshipInsert(dependencys)
                }
            }
        })
    }
}

var relationshipInsert = function(collection) {
    console.log("Inside relationshipsInsert")
        // console.log(collection)
    for (var key in collection) {
        console.log("Inserting Relationship for ", key)
        for (var i = 0; i < collection[key].length; i++) {
            console.log("\t |")
            console.log("\t |-> Relationship With", collection[key][i])

            dbRemote.queryRaw("MATCH (n { name : '" + collection[key][i] + "'  }),(m { name: '" + key + "' }) CREATE UNIQUE (n)-[:DEPENDS_ON]->(m)",
                function(err, result) {
                    if (err) console.log(err);
                    console.log(result)
                })
        }
    }
}


var insertBatch = function(collection) {
    var txn = dbRemote.batch();
    var nodeArr = []
    for (var a = 0; a < collection.length; a++) {
        nodeArr.push(txn.save({
            name: collection[a]
        }));
        if (nodeArr.length === 100) {
            console.log((a / collection.length) * 100)
            console.log("About to Insert Modules")
            txn.label(nodeArr, 'Module');
            txn.commit(function(err, results) {
                if (err) console.log("Error", err)
                console.log("Submited 100 Nodes");

            });
            nodeArr = []
            txn = dbRemote.batch();
        }
    }
    txn.label(nodeArr, 'Module');
    txn.commit(function(err, results) {
        if (err) console.log("Error", err)
        console.log("Submited last " + nodeArr.length + "Nodes");
    });

}

// helpers.getAllNames(function(nameArr) {
//     // insertBatch(nameArr);
// })

// DB endpoint setup
var search = module.exports.search = function(moduleName, cb){
    dbRemote.find({name: moduleName},"MODULE", function(err, objs){
        if(err){
            console.log(err);
            cb(err, null);  
        }
        else {
            cb(null, objs[0]);
        }
    })
}

var keywordSearch = module.exports.keywordSearch = function(keyword, cb) {
    var queryString = "MATCH (n:KEYWORD {name: {keywordInput} })-[r:KEYWORD_RELATED_WITH]-m RETURN m, r ORDER BY r.count DESC LIMIT 5"
    dbRemote.query(queryString, {keywordInput: keyword}, function(err, keywordResults){
        if (err) { 
            console.log('ERROR IN FINDING RELATED KEYWORDS');
            cb(err, null);
        } else {
            keywordArray = keywordResults.map(function(keyword){
                return keyword.m.name;
            })

            var secondQueryString = 'MATCH (k:KEYWORD)-[r:KEYWORD_OF]->(m:MODULE) WHERE k.name IN {keywordArray} WITH m, COUNT(k) AS matches, COLLECT(k) AS k WHERE matches > 1 RETURN m , matches, k ORDER BY matches DESC';
            dbRemote.query(secondQueryString, {keywordArray: keywordArray}, function(err, modulesFound){
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

var fetchRelationships = module.exports.fetchRelationships = function(moduleName, cb){
    var queryString = "MATCH (n { name: {name} })<-[r:DEPENDS_ON]-(m) RETURN m.name, m.monthlyDownloadSum;"
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

var updateModules = module.exports.updateModules = function(){
    var databaseNodes = []
    dbRemote.queryRaw('MATCH (n) RETURN n.name LIMIT 1000;',function(err,node){
        if(err) console.log(err)
        node.data.forEach(function(item){
            databaseNodes.push(item[0])
        })
        dbInsert(databaseNodes)
    })
}

var updateMissingDataModules = module.exports.updateMissingDataModules = function(){
    var databaseNodes = []
    dbRemote.queryRaw('MATCH (n) WHERE n.description IS NULL RETURN n.name LIMIT 1000;',function(err,node){
        if(err) console.log(err)
        node.data.forEach(function(item){
            databaseNodes.push(item[0])
        })
        dbInsert(databaseNodes)
    })
}

// dbInsert(['basscss-base-forms']);

var fetchTopModuleData = module.exports.fetchTopModuleData = function(cb){
    var data = {};
    var dataToFetch = ['overallRank, monthlyDownloadSum', 'dateRank', 'versionNumberRank', 'completenessRank', 'dependentRank', 'downloadRank'];

    dataToFetch.forEach(addToDataObject);

    // Data Checking
    while(true){
        if(dataToFetch.every(inDataObject)){
            cb(null, data);
            break;
        }
    }

    function inDataObject(property){
        return data.hasOwnProperty(property);
    }

    function addToDataObject(property){
        var queryString = "MATCH (n:MODULE) WHERE n." + property + " IS NOT NULL return n.name, n." + property + " order by n." + property + " DESC LIMIT 10;"
        dbRemote.queryRaw(queryString, function(err, result){
            if(err) {console.log(err); cb(err, null); return;}
            data[property] = result;
        });
    }
}