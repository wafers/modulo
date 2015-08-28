angular.module('app')

// Search service is used by Details Controller, Nav Controller, Results Controller
.service('Search',['$http', function($http) {
  this.navInput = '';
  this.results = {
    searchResults: []
  }
  
  // Return search results array to Results Controller for a watch function.
  this.showResults = function() {
    return this.results;
  }

  
  this.submit = function(val) {
    this.navInput = val;
    this.results = this.getResults(this.navInput);
    return this.results;
  }

  // Calculate quality ranking for given module and attach relevent metrics to module.
  this.calculateRank = function(module) {
    // Rank by time since last module update. Longer time => lower score.
    if (module.lastUpdate === 'Unknown') {
      module.dateRank = 0;
    } else {
      var now = moment();
      var recent = moment().subtract(1,'day');
      var year = moment().subtract(1,'year');
      var moduleDate = moment(module.time.modified); // dateRank criteria: score of 100 if updated in last day, score of 0 if updated >= 1 year ago. Linear scale between.
      module.dateRank = Math.floor((100/(recent-year))*(moduleDate - now) + 100 - (100/(recent-year))*(recent-now))
      if (module.dateRank < 0 ) module.dateRank = 0;
    };

    // Rank by total number of published module updates.
    module.versionNumberRank = Object.keys(module.time).length < 35 ? 3 * (Object.keys(module.time).length-2) : 100; // versionNumberRank gives 3pts per published update, max 100 pts.

    // Rank by number of downloads in past 30 days.
    if (!module.monthlyDownloadSum) {
      module.downloadRank = 0;
    } else { // If there are downloads, min score is 10. Score moves up from there on log10 scale. Max score of 100 reached at 1million monthly downloads.
      module.downloadRank = Math.log10(module.monthlyDownloadSum)*15+10 > 100 ? 100 : Math.floor(Math.log10(module.monthlyDownloadSum)*15+10);
    }

    // Rank by number of NPM stars and Github stars. 
    // Comment out versions with GitHub data. May re-implement later. 
    // if (!module.starred || !module.watchers) {
    if (!module.starred) {
      module.starRank = 0;
    } else { // NPM stars added to GitHub stars, then scaled on log10. Max score of 100 reached at 10,000 combined stars.
      // Comment out versions with GitHub data. May re-implement later. 
      // module.starRank = Math.floor(Math.log10(module.starred+module.watchers)*25) > 100 ? 100 : Math.floor(Math.log10(module.starred+module.watchers)*25);
      module.starRank = module.starred*2 > 100 ? 100 : module.starred*2;
    }

    // Rank by number of modules listing this module as a dependency
    if (!module.dependentsSize) {
      module.dependentRank = 0;
    } else {
      module.dependentRank = Math.log10(module.dependentsSize)*25 > 100 ? 100 : Math.floor(Math.log10(module.dependentsSize)*25) ;
    }

    // Rank by NPM module submission completeness (quality module must have Readme, Keywords, and URL)
    // Store lacking pieces for rank explanations
    module.completenessRank = 0;
    if (module.readme !== 'No readme provided') {
      module.completenessRank += 34;
    } else {
      module.completenessFailures = ['Readme'];
    }
    if (module.url && module.url.length > 0) {
      module.completenessRank += 33;
    } else {
      if (module.completenessFailures) module.completenessFailures.push('URL')
      else module.completenessFailures = ['URL']; 
    }
    if (module.keywords && module.keywords.length > 0) {
      module.completenessRank += 33;
    } else {
      if (module.completenessFailures) module.completenessFailures.push('Keywords')
      else module.completenessFailures = ['Keywords']; 
    }

    // Comment out versions with GitHub data. May re-implement later. 
    // Rank by GitHub followers, forks, and open issues/pulls
    // if (!module.subscribers || !module.forks || !module.openIssues) {
    //   module.githubRank = 0;
    // } else {
    //   // Count users watching repo for 33 of 100 points. Scaled on log10 with max score of 33 reached at 1500 users watching. 
    //   var watchersPortion = Math.floor(Math.log10(module.subscribers)*31.5/100*33) > 33 ? 33 : Math.floor(Math.log10(module.subscribers)*31.5/100*33);
    //   // Count forked repos for 34 of 100 points. Scaled on log10 with max score of 34 reached at 1000 forks. 
    //   var forkPortion = Math.floor(Math.log10(module.forks)*33/100*34) > 34 ? 34 : Math.floor(Math.log10(module.forks)*33/100*34);
    //   // Count issues+pulls for 33 of 100 points. Scaled on log10 with max score of 33 reached at 150 open issues/pulls.
    //   var issuesPortion = Math.floor(Math.log10(module.openIssues)*46/100*33) > 33 ? 33 : Math.floor(Math.log10(module.openIssues)*46/100*33);
    //   module.githubRank = watchersPortion + forkPortion + issuesPortion;
    // }

    // Comment out versions with GitHub data. May re-implement later. 
    // Calculate overall rank as average of individual rankings
    // var rankSum = (module.dateRank + module.versionNumberRank + module.downloadRank + module.starRank + module.dependentRank + module.completenessRank + module.githubRank)
    // module.overallRank = Math.floor(rankSum/7)
    var rankSum = (module.dateRank + module.versionNumberRank + module.downloadRank + module.starRank + module.dependentRank + module.completenessRank)
    module.overallRank = Math.floor(rankSum/6)
  }

  this.getResults = function() {
    var context = this;
    return $http.post('/search', {'data': this.navInput}).
      success(function(data, status, headers, config) {
        console.log('search results',data);
        if (data === 'No results found' || data.length===0) data = [{name: 'No results found for '+context.navInput}];

        for (var i=0; i<data.length; i++) {
          if (data[i]){
            if (data[i].downloads) data[i].downloads = JSON.parse(data[i].downloads);
            if (data[i].time) {
              data[i].time = JSON.parse(data[i].time);
              data[i].lastUpdate = moment(data[i].time.modified).fromNow();
              data[i].latestVersion = Object.keys(data[i].time).slice(-3)[0];
              data[i].lastUpdate = moment(data[i].time.modified).format('MM DD YYYY');
            } else {
              data[i].lastUpdate = 'Unknown';
              data[i].time = {}
            }

            if(!data[i].readme) data[i].readme = "No readme provided";
            if (!data[i].overallRank) {
              context.calculateRank(data[i]);
            }
          }
        }

        context.results.searchResults =  data;
      }).
      error(function(data, status, headers, config) {
        console.log('error');
        console.log(data);
        data = [{name: 'No results found for '+context.navInput}]
      });
  }
}])