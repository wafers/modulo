angular.module('app')

.controller('ResultsController', ['Search', '$scope', '$http', function(Search, $scope, $http){
  $scope.searchInput = Search.navInput;
  $scope.results = Search.showResults();
  // $scope.results = $scope.results.searchResults
  Search.submit();

  $scope.toggle = function(result) {
    result.show = !result.show;
  }

  $scope.openTab = function() {
    $scope.url = './app/results/details.html';
  }
}]);