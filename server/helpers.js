// Imports
var fs = require('fs');
var Registry = require('npm-registry');
var downloadCount = require('npm-download-counts');
var moment = require('moment');
var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');  
var npm = new Registry({});

module.exports = {};

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
  var start = moment().subtract(1, 'months').toDate();
  var end = new Date();

  // console.log('inside monthly downloads');
  downloadCount(module.name, start, end, function(err, data) {
    if(err){
      console.log('ERRRRRRR', module.name, err)
      module.downloads = 0;
      cb(err,module);
    }else{
      if(data === undefined){
        module.downloads = 0;
        cb(null, module);
      }
      module.downloads = data.map(function(obj){ return obj.count }).reduce(function(total, e){
        if(!e){
          return total;
        }else{
          return total + e;
        }
      },0);
      cb(null, module);
    }
  })
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
// Give me the version # and latest update
var versionTracker = module.exports.versionTracker = function(module, cb) {
  //
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
      //module.versionCount = $('.box')['children']['1']['children'][2]['data'].replace(/\s/g, ',').split(',').splice(-7,1)[0]-0 || 1;
      cb(null, module);
    })
  }

// gives the npm search results
var npmSearchScraper = module.exports.npmSearchScraper = function (searchTerms, cb) {
    // Takes in search terms and returns array of search result objects in npmjs search order
    var url = 'https://www.npmjs.com/search?q='+searchTerms

    request(url, function (err, res, body) {
        if (err) {
            return cb(err);
        }

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



var searchResults = module.exports.searchResults = function(searchInput, cb){  
  var finishedRuns = 0;
  // npmSearchScrapper - results, # of stars, descripiton, etc
    // Versiontracker - 
    // Dependent Count
    // Download Count (set to monthly atm)
  npmSearchScraper(searchInput, function(err, npmSearchResults){
    npmSearchResults.forEach(function(searchResult,i,a){
      versionTracker(searchResult, function(err, searchResultWithVersion){
        findMonthlyDownloads(searchResultWithVersion, function(err, searchWithVersionAndDownloadCount){
          findDependents(searchWithVersionAndDownloadCount, function(err, finalSearchResult){
            finishedRuns++;
            if(finishedRuns === a.length){
              console.log('READY TO SEND TO CLIENT');
              cb(null, npmSearchResults);
            }
          });
        })
      });
    });
  });
}

// searchResults('yahoo finance');













// // DOING THE DATA for UNDERSCORE
// var moduleNameLol = 'underscore';
// var results = [];
// var cbCount = 0;
 
// fs.readFile('underscore_dependents', 'utf-8', function(err, results){
//   console.log('FILE READ DONE!');
//   JSON.parse(results).forEach(function(dependent, i, a){
//     findMonthlyDownloads(dependent, function(err, downloads){
//       results.push({name: dependent, downloads : downloads});
//       // console.log(results.slice(-1)[0]);
//       cbCount++;
//       if(cbCount === a.length-1){
//         var top20 = getTop20Downloads(results);
//         console.log(top20);
//       }
//     });
//   });
// })
// function getTop20Downloads(arr){
//   arr.sort(function(a,b){
//     return b.downloads-a.downloads;
//   })
//   return arr.slice(0,20);
// }

// findDependents(moduleNameLol, function(err, dependentsArr){
//   fs.writeFile('underscore_dependents', JSON.stringify(dependentsArr), function(err){
//     console.log('FILE WRITE DONE!');
//   })
//   // Find all the downloads for each dependent
//   dependentsArr.forEach(function(dependentName,i,a){
//     findMonthlyDownloads(dependentName, function(err, downloads){
//       results.push({name: dependentName, downloads : downloads})
//       console.log(results.slice(-1)[0]);
//       cbCount++;
//       if(cbCount === a.length-1){
//         // Logic to run when the LAST one has run???
//         // console.log(results);
//         // console.log(results.length);
//         var top20 = getTop20Downloads(results);
//         console.log(top20);
//       }
//     });
//   });
// });

// fs.readFile('underscore_dependents', 'utf-8', function(err, results){
//   var data = JSON.parse(results);

//   while(data.length > 0){
//     var sendData = data.splice(0,100);
//     var concatUrl = 'https://api.npmjs.org/downloads/point/last-month/'+sendData.join(',');

//     request.get(concatUrl, function(err, results){
//       if(err){
//         console.log(err)
//         return;
//       } 
//       console.log(results.body);
//       fs.appendFile('lol', JSON.stringify(results.body), function(err){
//         if(err) console.log(err);
//         console.log('file write finished');
//       })
//     });
//   }
// })



// LETS MAKE IT WORK
// request.get('https://api.npmjs.org/downloads/point/last-month/underscore,express', function(err, results){
//   if(err){
//     console.log(err)
//     return;
//   } 
//   fs.appendFile('lol2', results.body, function(err){
//     if(err) console.log(err);
//     console.log('file write finished');
//   })
// });

// fs.readFile('lol2', 'utf-8', function(err, data){
//   var data = JSON.parse(data);
//   console.log(data.express);
//   console.log(data.underscore);
// })