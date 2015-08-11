angular.module('app')

.controller('ResultsController', ['Search', '$scope', '$http', function(Search, $scope, $http){
  $scope.searchInput = Search.navInput;
  $scope.results = function() { return Search.showResults() };
  $scope.results();
  $scope.toggle = function(result) {
    result.show = !result.show;
  }
}]);