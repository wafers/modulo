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
      module.downloads = downloadData;

      function intoDlCount(module){
        return obj.count;
      }

      function sum(total, num){
        return !e ? total : total + e;
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
// Used by the database for gathering detailed stats. Takes in a module name and sends back a stats object.
var moduleDataBuilder = module.exports.moduleDataBuilder = function(moduleName, cb){
  var module = {name: moduleName};
  console.log('Getting',moduleName);
  npm.packages.get(moduleName, function(err, results){
    console.log('inside npm-registry get');
    if(err){
      console.log('ERRRRR', err);
      return;
    } 
    module['description'] = results[0].description;
    module['time'] = results[0].time;
    module['repository'] = results[0].repository;
    module['url'] = results[0]['homepage'].url;
    module['keywords'] = results[0].keywords;
    module['starred'] = results[0].starred;
    findMonthlyDownloads(module, function(err, moduleWithDownloads){
      console.log('inside find monthly downloads')
      findDependents(module, function(err, finalData){
        console.log('inside findDependents')
        cb(finalData);
      })
    })
  });
}

// fs.readFile('npm_module_names.txt', 'utf-8', function(err, results){
//   var names = JSON.parse(results);
//   names.forEach(function(name){
//     moduleDataBuilder(name, function(data){
//       fs.appendFile('datadump.txt', JSON.stringify(data), function(err){
//         if(err) console.log(err);
//         else{
//           // console.log(data);
//           console.log(data.name)
//         }
//       });
//     })
//   })
// })


