var helpers = require('./helpers.js')
var config = require('./config').db
var fs = require('fs')

var dbRemote = require("seraph")({
    user: config.username,
    pass: config.password,
    server: config.dbURL
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
                var querryString = "MATCH (n{name:{name}}) SET n.description = {description}, n.time = {time}, n.url = {url} , n.starred = {starred}, n.downloads = {downloads}, n.monthlyDownloadSum = {monthlyDownloadSum}"
                console.log("Working on inserting into database. Finish count is", finished, "and y count is:", y)
                dependencys[data.name] = data.dependents
                dbRemote.queryRaw(querryString, {
                        name: data.name,
                        description: data.description,
                        time: JSON.stringify(data.time),
                        url: data.url,
                        starred: data.starred.length,
                        downloads: JSON.stringify(data.downloads),
                        monthlyDownloadSum: data.monthlyDownloadSum
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

            dbRemote.queryRaw("MATCH (n { name : '" + collection[key][i] + "'  }),(m { name: '" + key + "' }) CREATE (n)-[:DEPENDS_ON]->(m)",
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

helpers.getAllNames(function(nameArr) {
    // insertBatch(nameArr);
    // dbInsert(nameArr.slice(150000, 160000))
})

// DB endpoint setup
var search = module.exports = function(moduleName, cb){
    dbRemote.find({name: moduleName}, function(err, objs){
        if(err){
            console.log(err);
            cb(err, null);  
        } 
        else cb(null, objs);
    })
}
