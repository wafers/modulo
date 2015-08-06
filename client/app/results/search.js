angular.module('search', [])

.controller('SearchController', function($scope, $http){
  $scope.searchInput = null;
  $scope.results = [];

  $scope.getResults = function(){
  	console.log("getting results")
    console.log($scope.searchInput)
    return $http.post('/search', {'data': $scope.searchInput}).
      success(function(data, status, headers, config) {
        console.log(data);
        for (var key in data) {
          data[key].lastUpdate = moment(data[key].lastUpdate).format('l');
          data[key].length = data[key].dependents.length;
        }
        $scope.results = data;
      }).
      error(function(data, status, headers, config) {
        console.log('error');
        console.log(data);
      });
  }

});