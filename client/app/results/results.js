angular.module('app')

.controller('ResultsController', ['Search', '$scope', '$http', function(Search, $scope, $http){
  $scope.results = Search.results;

  $scope.toggle = function(result) {
    result.show = !result.show;
  }

  $scope.openTab = function() {
    $scope.url = './app/results/details.html';
  }
}]);