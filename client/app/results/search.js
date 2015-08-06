angular.module('search', [])

.controller('SearchController', function($scope, $http){
  $scope.searchInput = null;

  var getResults = function(){
  	console.log("RUNNING")
    return $http.post('/search', {'data': $scope.searchInput}).
      success(function(data, status, headers, config) {
        console.log(data);
      }).
      error(function(data, status, headers, config) {
        console.log('error');
        console.log(data);
      });
  }

});