angular.module('app')

.service('ModulePass', ['$http', function($http){
  this.module = {};

  this.updateModule = function(module){
    this.module = module;
  }

  var that = this;
  this.getModule = function(moduleName){
    var data = { data : moduleName };
    return $http.post('/detailedSearch', data)
      .success(function(data){
        if (data === 'No results found') data = {name: 'No results found'};
        if (data.downloads) data.downloads = JSON.parse(data.downloads);
        if (data.time) {
          data.time = JSON.parse(data.time);
          data.lastUpdate = moment(data.time.modified).fromNow();
          data.latestVersion = Object.keys(data.time).slice(-3)[0];
        } else {
          data.lastUpdate = moment().fromNow();
          data.time = {}
        }
        if(!data.readme) data.readme = "No readme provided";
       that.module = data;
       console.log(data);
      })
      .error(function(data){ console.log('error', data) })
  }
}])
