angular.module('app')

.service('TopModules',['$http', function($http) {
  this.data = {};
  this.topDownloadsData = {};

  var topModulesService = this;

  this.fetchTopModules = function(){
    $http.get('/topModules').then(function(res){
      topModulesService.data = res.data;
    });
  } 

  this.fetchTopModulesDownloadData = function(moduleNames){
    var data = {};
    moduleNames.forEach(function(e){
      $http.post('/detailedSearch', { data : e }).then(function(res){
        // data[e] = _.pick(res.data, 'downloads');
        // data[e] = JSON.parse(data[e].downloads);
        data[e] = JSON.parse(res.data.downloads);

        if(moduleNames.every(inDataObject)){
          topModulesService.topDownloadsData = data;
          console.log('data download', data);
        }
      });
    });

    function inDataObject(property){ return data.hasOwnProperty(property); }
  }
}]);