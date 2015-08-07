var helpers = require('./helpers.js')
var config = require('./config').db

var dbLocal = require("seraph")({
    user: config.username,
    pass: config.password
});

var dependencys = {}

var dbInsert = function(collection) {
    var finished = 0;
    for (var y = 0; y < collection.length; y++) {
        helpers.moduleDataBuilder(collection[y], function(err, data) {
            if (err) {
                return console.log("Oh, oh error")
            } else {
                dependencys[data.name] = data.dependents
                dbLocal.save({
                    "name": data.name,
                    "description": data.description,
                    "time": JSON.stringify(data.time),
                    "url": data.url,
                    "starred": data.starred.length,
                    "downloads": JSON.stringify(data.downloads)
                }, 'Module')
                if (finished === collection.length) {
                    relationshipInsert(dependencys)
                }
            }
        })
    }
}

var relationshipInsert = function(collection) {
    for (var key in collection) {
        for (var i; i < collection[key].length; i++) {
            db.relate({
                "name": collection[key][i]
            }, 'DEPENDS_ON', {
                "name": key
            }, function(err, relationships) {
                // relationships = all outgoing `knows` relationships from node 452
            })
        }
    }
}

var readInFile = function(path) {
    fs.readFile(path, 'utf-8', function(err, results) {
        var names = JSON.parse(results);
        names = names.slice(0, 1000);
        names.forEach(function(name) {
            moduleDataBuilder(name, function(data) {

            })
        })
    })
}
