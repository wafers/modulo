angular.module('results', [])

.controller('ResultsController', function($scope, $http, $location, $stateParams, $rootScope){
  $scope.searchInput = null;
  $scope.results = [];

  $scope.toggle = function(result) {
    result.show = !result.show;
  }

  $scope.openTab = function() {
    $scope.url = './app/results/details.html';
  }
});