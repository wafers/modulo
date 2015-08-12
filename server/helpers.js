// Imports
var fs = require('fs');
var Registry = require('npm-registry');
var downloadCount = require('npm-download-counts');
var moment = require('moment');
var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');  
var npm = new Registry({});
var db = require('./dbParsing.js');

module.exports = {};

///////////////// HELPER FUNCTIONS /////////////////
// Returns an array of all the dependents
var findDependents = module.exports.findDependents = function(module, cb){
  npm.packages.depended(module.name, function(err, data){
    if(err){
      cb(err, module);
    }else{
      module.dependents = data.map(function(row){
        return row.name;
      });
      cb(null, module);
    }
  })
}
// Returns an integer of the total # of downloads last month
var findMonthlyDownloads = module.exports.findMonthlyDownloads = function(module, cb){
  var start = moment().subtract(5, 'years').toDate();
  var end = new Date();

  downloadCount(module.name, start, end, function(err, downloadData) {
    if(err){
      console.log('ERRRRRRR', module.name, err)
      module.downloads = 0;
      cb(err,module);
    }else{
      if(downloadData === undefined){
        module.downloads = 0;
        cb(null, module);
      }
      module.downloads = downloadData; // Daily download numbers
      module.monthlyDownloadSum = downloadSum(downloadData); // Total downloads for the past month
      function downloadSum(downloadData) {
        var days = Object.keys(downloadData);
        if (days.length > 0) {
          var lastMonth = days.slice(-30);
          var sum = 0;
          for (var i=0; i<lastMonth.length; i++) {
            sum += downloadData[lastMonth[i]]['count'];
          }
          return sum;
        }
      }
      cb(null, module);
    }
  })
}
// Give me the version # and latest update
var versionTracker = module.exports.versionTracker = function(module, cb) {
    var url = 'https://www.npmjs.com/package/'+module.name;
    request(url, function(err, res, body){
      if (err) {
        console.log('ERROR: ',err);
        cb(err, module);
      }
      var $ = cheerio.load(body);
      if ($('.last-publisher')['0']){
        module.lastUpdate = moment($('.last-publisher')['0']['children'][3]['attribs']['data-date'], moment.ISO_8601)['_d'];
      } else {
        module.lastUpdate = 'Not available';
      }
      cb(null, module);
    })
  }
// gives the npm search results
var npmSearchScraper = module.exports.npmSearchScraper = function (searchTerms, cb) {
    // Takes in search terms and returns array of search result objects in npmjs search order
    var url = 'https://www.npmjs.com/search?q='+searchTerms

    request(url, function (err, res, body) {
        if (err) {return cb(err)}

        var $ = cheerio.load(body);
        var results = [];

        $('.package-details').each(function () {
            results.push({
                name: $(this).find('.name').text(),
                description: $(this).find('.description').text(),
                version: $(this).find('.version').text().match(/\d+\.\d+\.\d+/)[0],
                url: 'https://www.npmjs.com/package/' + $(this).find('.name').text(),
                stars: $(this).find('.stats').find('.stars').text()-0,
            });
        });

        this.results = results;

        cb(null, this.results);
    }.bind(this));
  }


///////////////// MAIN EXPORT FUNCTIONS /////////////////
// Used by server for finding npmjs search results. Takes in a search term and sends back an array of modules.
var searchResults = module.exports.searchResults = function(searchInput, cb){  
  var finishedRuns = 0;
  npmSearchScraper(searchInput, function(err, npmSearchResults){
    if(err) { console.log(err); cb(err, null);}
    else{
      var allSearchData = [], cbCount = 0;
      var names = npmSearchResults.map(function(row){ return row.name }); // map to namesArr

      names.forEach(function(moduleName){ // iterates through each moduleName and queries the database
        db.search(moduleName, function(err, fullModuleData){
          if(err) {console.log(err); cb(err, null); }
          else{
            if(fullModuleData) allSearchData.push(fullModuleData);     // ONLY if the data is defined do you push to allSearchData
            cbCount++;
            if(cbCount === names.length){
              // Logic only runs if this is the last async callback from db.search
              var returnArr = names.map(function(name){
                // make the data be sorted once again b/c it comes back in random order
                return allSearchData.filter(function(obj){
                  return obj.name === name;
                })[0]
              })
              cb(null, _.compact(returnArr));
            }
          }
        })
      })
    }
  });
}
// { SIGMA FORMAT------------------------------------------------
//   "edges": [
//     {
//       "source": "473",
//       "target": "313",
//       "id": "6432"
//     },
//     ...
//   ],
//   "nodes": [
//     {
//       "id": "262",
//       "label": "Sciences De La Terre",
//       "x": 1412.2230224609,
//       "y": -2.0559763908386,
//       "size": 8.540210723877
//       "color": "rgb(255,204,102)",
//     },
//     ...
//   ]
// }

// [{
//    "name" : moduleName,
//    "monthlyDownloadSum" : number
// },
// ]


var findRelationships = module.exports.findRelationships = function (moduleName, cb){
  db.fetchRelationships(moduleName, function(err, relationships){
    if(err) { console.log(err); cb(err, null); return; }
    // format for SIGMA ---- ADD A UNIT CIRCLE FOR POSITIONING!
    var edges = [], nodes = [];
    var nodeId = 2, edgeId = 1; 
    var x = 1, y = 1;
    nodes.push(makeNode('1', moduleName, 0, 0, 10, "rgb(255,0,0)")); // make initial
    relationships.forEach(function(row){
      var newNode = makeNode(""+nodeId, row.name, x, y, 5, "rgb(255,123,102)")
      var newEdge = makeEdge(""+nodeId, '1', ""+edgeId);
      nodeId++; edgeId++; x++; y++;
      nodes.push(newNode);
      edges.push(newEdge);
    });
    cb(null, {edges: edges, nodes: nodes});
  });

  function makeNode(idStr, labelStr, x, y, size, colorStr){
    return {id: idStr, label: labelStr, x: Math.random(), y: Math.random(), size: size, color: colorStr};
  }

  function makeEdge(sourceIdStr, targetIdStr, idStr){
    return {source: sourceIdStr, target: targetIdStr, id: idStr}
  }
}

// Used by the database for gathering detailed stats. Takes in a module name and sends back a stats object.
var moduleDataBuilder = module.exports.moduleDataBuilder = function(moduleName, cb){
  var module = {name: moduleName};
  console.log('Getting',moduleName);
  npm.packages.get(moduleName, function(err, results){

    if(err){
      console.log('Something went wrong. Will try',moduleName,'again later.')
      console.log('ERRRRR', err);
      cb(err, module);
      // write module to errorQueue
    } else if (results[0] && results[0].description !== '' && results[0].starred) {
      module['description'] = results[0].description;
      module['readme'] = results[0].readme;
      module['time'] = results[0].time;
      module['repository'] = results[0].repository;
      module['url'] = results[0]['homepage'].url;
      module['keywords'] = results[0].keywords;
      module['starred'] = results[0].starred;
      findMonthlyDownloads(module, function(err, moduleWithDownloads){
        findDependents(module, function(err, finalData){
          if (finalData.dependents && finalData.downloads){
            console.log('Success!', moduleName, 'going back to DB now.')
            cb(null, finalData);
          } else {
            console.log('Something went wrong. Will try',moduleName,'again later.')
            // write module to errorQueue
          }
        })
      })      
    } else {
      console.log('Something went wrong. Will try',moduleName,'again later.')
      // write module to errorQueue
    }
  });
}

// Can be used to read in the names of all NPM modules. Sends back an array of all module names.
var getAllNames = module.exports.getAllNames = function (cb){
  fs.readFile('./server/npm_module_names.txt', 'utf-8', function(err, results){
  var names = JSON.parse(results);
  console.log(names.length, 'modules found'); 
  cb(names); 
  })
}

// moduleDataBuilder('lodash', function(err, module){
//   var filePath = "./client/dlviz/" + module.name + ".tsv";
//   console.log(module.downloads);
//   fs.appendFileSync(filePath, "day" + "\t" + "downloads" + "\n");
//   module.downloads.forEach(function(row){
//     fs.appendFileSync(filePath, "" + row.day + "\t" + row.count + "\n");    
//   });
// });

//EXAMPLE USE OF getAllNames and moduleDataBuilder:
/*
var helpers = require('./helpers.js');

var names = [];

helpers.getAllNames(function(nameArray){
  names = nameArray; // 'names' contains ALL npm module names
  console.log(names.length) // => ~170k
  namesubset = names.slice(0,1000) // To run only the first 1000 names
  putIntoDB(namesubset);
});

function putIntoDB(nameArray) {
  var finished = 0;
  for (var i=0; i<nameArray.length; i++){
    helpers.moduleDataBuilder(nameArray[i], function(err, res){
      if (err) ...
      else {
        finished++;
        save deps.
        insert. 
        if (finished === names.length)
          insert relationships
      }
    })
  }
}


*/

