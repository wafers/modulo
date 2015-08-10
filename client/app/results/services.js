angular.module('service', [])

.service('Search', function($scope, $http, $location, $stateParams, $rootScope) {
  var searchInput = null;
  var results = [];

  this.submit = function(val){
    searchInput = val;
    console.log(searchInput)
    results = getResults(searchInput);
    console.log(results)
  }

  this.getResults = function() {
    return $http.post('/search', {'data': searchInput}).
      success(function(data, status, headers, config) {
        console.log(data);
        for (var key in data) {
          data[key].lastUpdate = moment(data[key].lastUpdate).format('l');
          data[key].length = data[key].dependents.length;
        }
        results = data;
      }).
      error(function(data, status, headers, config) {
        console.log('error');
        console.log(data);
      });
  }
})