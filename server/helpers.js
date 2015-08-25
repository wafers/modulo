// Imports
var fs = require('fs');
var Registry = require('npm-registry');
var downloadCount = require('npm-download-counts');
var moment = require('moment');
var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');  
var npm = new Registry({
  registry: "http://skimdb.npmjs.com/registry/",
  retries: 3
});
var db = require(__dirname + '/dbParsing.js');


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
      console.log('findMonthlyDownloads ERROR:', module.name, err)
      module.downloads = [{ day: '2015-01-01', count: 0 }];
      module.monthlyDownloadSum = 0;
      cb(err,module);
    }else{
      if(downloadData === undefined){
        module.downloads = [{ day: '2015-01-01', count: 0 }];
        module.monthlyDownloadSum = 0;
        cb(null, module);
      }else{
          module.downloads = downloadData; // Daily download numbers
          module.monthlyDownloadSum = downloadSum(downloadData); // Total downloads for the past month
          function downloadSum(downloadData) {
            if(typeof downloadData !== "Object"){
              console.log(downloadData)
              console.log(module.name)  
            }
            var days = Object.keys(downloadData);
            if (days && days.length > 0) {
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
      }   
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
        if (!$('.package-details')['0']) {
          results = 'No results found';
        } else {
          $('.package-details').each(function () {
              results.push({
                  name: $(this).find('.name').text() || 'No name found',
                  description: $(this).find('.description').text() || 'No description found',
                  version: $(this).find('.version').text().match(/\d+\.\d+\.\d+/)[0] || 'No version found',
                  url: 'https://www.npmjs.com/package/' + $(this).find('.name').text() || 'No url found',
                  stars: $(this).find('.stats').find('.stars').text()-0 || 'No stars found',
              });
          });
        }

        this.results = results;

        cb(null, this.results);
    }.bind(this));
  }


///////////////// MAIN EXPORT FUNCTIONS /////////////////

var keywordSearch = module.exports.keywordSearch = function(keyword, cb) {
  var searchResults = []; // Modules found. To be sent to the client.
  var keywordInput = keyword.split(' '); // Parse multiple keywords.
  var searchTerms = []; // Collection of all variations of user-input if multiple keywords entered
  var resultTracker = {}; // Count how many times a module is a result. Used to prevent duplicate results. 
  for (var i=0; i<keywordInput.length; i++) {
    searchTerms.push(keywordInput[i])
    if (keywordInput[i+1]) searchTerms.push([keywordInput[i], keywordInput[i+1]].join('-'))
  }
  keywordInput.push(keyword);
  // query DB for module with name===keyword. Push found module to beginning of searchResults
  db.search(keyword, function(err, results){
    if (results) {
      resultTracker[results.name] = 1;
      searchResults.push(results);
      console.log(searchResults[0].name)
    }
    db.keywordSearch(searchTerms, function(err, modulesFound){
      // console.log('Found these modules:', modulesFound);
      if (modulesFound) {
        modulesFound.forEach(function(moduleResult){
          resultTracker[moduleResult.m.name] = resultTracker[moduleResult.m.name]+1 || 1;
          if (resultTracker[moduleResult.m.name] === 1) searchResults.push(moduleResult.m);
        })
        // searchResults = searchResults.sort(function(module1, module2){
        //   return module2.overallRank - module1.overallRank;
        // })
        cb(null, searchResults);
      } else {
        cb(null, null);        
      }
    })
  })
}

// Used by server for finding npmjs search results. Takes in a search term and sends back an array of modules.
var searchResults = module.exports.searchResults = function(searchInput, cb){  
  var finishedRuns = 0;

  npmSearchScraper(searchInput, function(err, npmSearchResults){
    if(err) { console.log('npmSearchScraper ERROR:',err); cb(err, null);}
    else{
      if (npmSearchResults === 'No results found') {
        cb(null, npmSearchResults);
      } else {
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
    }
  });
}

var detailedSearch = module.exports.detailedSearch = db.search;

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
  var largestDependent = 0;

  db.fetchRelationships(moduleName, function(err, relationships){
    if(err) { console.log(err); cb(err, null); return; }
    // format for SIGMA ---- ADD A UNIT CIRCLE FOR POSITIONING!
    var edges = [], nodes = [];
    var nodeId = 2, edgeId = 1; 

    // Calculating the largest dependent -- to scale all the others
    largestDependent = relationships.reduce(function(sum, row){
      row.monthlyDownloadSum = row.monthlyDownloadSum || 0;
      return sum > row.monthlyDownloadSum ? sum : row.monthlyDownloadSum
    }, 0)

    // nodes.push(makeNode('1', moduleName, 0, 0, 15, "#4c1313", 0)); // make initial
    nodes.push(makeNode('1', moduleName, 0, 0, 15, randomColorGenerator(), 0)); // make initial
    var totalNodeNum = relationships.length;
    relationships = _.shuffle(relationships)

    // Looping through all the relationships and building the node and edges
    relationships.forEach(function(row){
      // Node Creation
      var newNode = makeNode(""+nodeId, row.name, 0, 0, scaleNode(row.monthlyDownloadSum), randomColorGenerator(), relationships.indexOf(row)+1, totalNodeNum, row.monthlyDownloadSum)
      nodes.push(newNode);

      // Edge creation
      if (newNode.size > 6) { // Only make an edge if the node is significant (size > 6)
        var newEdge = makeEdge(""+nodeId, '1', ""+edgeId);
        edges.push(newEdge);
      }
      nodeId++; edgeId++;
    });

    cb(null, {edges: edges, nodes: nodes});
  });
  

  function makeNode(idStr, labelStr, x, y, size, colorStr, nodeNum, totalNodeNum, monthlyDownloadSum){
    var radius = scaleNode(monthlyDownloadSum) > 6 ? 100 : 200;
    var cosine = Math.cos(Math.PI*2*nodeNum/(totalNodeNum));
    var sine = Math.sin(Math.PI*2*nodeNum/totalNodeNum);
    var xPos = (radius+Math.random()*100)*cosine;
    var yPos = sine < 0 ? (radius+Math.random()*100)*sine : (radius+Math.random()*100)*sine;

    return {
      id: idStr, 
      label: labelStr, 
      x: xPos, 
      y: yPos, 
      size: size, 
      color: colorStr
    };
  }

  function makeEdge(sourceIdStr, targetIdStr, idStr){
    return {
      id: idStr, 
      source: sourceIdStr, 
      target: targetIdStr, 
      size: Math.random(),
      color: '#bbb',
      type: 'curve',
      hover_color: "#000"
    }
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function randomColorGenerator(){
    var calc = rgbToHex(Math.random()*255, Math.random()*255, Math.random()*255);
    return calc.slice(0,7);
  }

  function scaleNode(monthlyDownloadSum) {
    var size = monthlyDownloadSum > 0 ? 2 + 8 * (monthlyDownloadSum/largestDependent) : 1.5;
    return size;
  }
}

// Used by the database for gathering detailed stats. Takes in a module name and sends back a stats object.
var moduleDataBuilder = module.exports.moduleDataBuilder = function(moduleName, cb){
  var module = {name: moduleName};
  console.log('Getting',moduleName);
  npm.packages.get(moduleName, function(err, results){

    if(err){
      console.log('moduleDataBuilder : npm.packages.get ERROR', err);
      cb(err, module);
      // write module to errorQueue
    } else if (results[0] && (results[0].description !== '' || results[0].starred || results[0].time)) {
      // Inside here i have access to the result[0].github = {user:'username', repo: 'repo-name'} object
      var githubConfig = results[0].github || undefined;
      module['description'] = results[0].description || 'None Provided';
      module['readme'] = results[0].readme || 'None Provided';
      module['time'] = results[0].time || 'None Provided';
      module['repository'] = results[0].repository || 'None Provided';
      module['url'] = results[0]['homepage'].url || 'None Provided'
      module['keywords'] = results[0].keywords || 'None Provided';
      module['starred'] = results[0].starred || 'None Provided';

      findMonthlyDownloads(module, function(err, moduleWithDownloads){
        findDependents(module, function(err, finalData){
          if (finalData.dependents && finalData.downloads){ // Check to make sure the data is good before sending to GitHub API
            if(githubConfig) github.repos.get(githubConfig, function(err, result){
              if(err){
                console.log('github-api grab error', err); 
                cb(err, null);
                return;
              } 
              console.log('Success!', moduleName, 'going back to DB now.')

              finalData['subscribers'] = result['subscribers_count'];
              finalData['forks'] = result['forks_count'];
              finalData['watchers'] = result['watchers_count'];
              finalData['openIssues'] = result['open_issues_count'];

              cb(null, finalData);
            });
          } else {
            console.log('Something went wrong in findDependents. Will try',moduleName,'again later.')
            console.log('dependents', finalData.dependents, 'downloads', finalData.downloads)
            // write module to errorQueue
          }
        })
      })      
    } else {
      console.log('Something went wrong in moduleDataBuilder. Will try',moduleName,'again later.')
      console.log('results[0] check:', results[0])
      console.log('results[0].description check:', results[0].description)
      console.log('results[0].starred check:', results[0].starred)
      // write module to errorQueue
    }
  });
}

// Can be used to read in the names of all NPM modules. Sends back an array of all module names.
var getAllNames = module.exports.getAllNames = function (cb){
  request({
    url:'https://skimdb.npmjs.com/registry/_all_docs',
    json:true 
  }, function(err,res){
    if(err)console.log(err)
    // var jsonResponse = res.body
    var names = []
    var idNames = res.body["rows"]
    idNames.forEach(function(item){
      names.push(item["id"])
    })
    console.log(names.length, 'modules found'); 
    cb(names);
  })
}

var updateMissingData = module.exports.updateMissingData = function(){
  db.updateModules();
}

// TOP MODULES GET ENDPOINT helper-----------------------------------------------------------------
var getTopModules = module.exports.getTopModules = db.fetchTopModuleData;