angular.module('app')

.controller('NavController', ['Search' , '$scope', '$http', function(Search, $scope, $http) {
  $scope.submit = function() {
    console.log('in nav scope.submit', $scope.searchInput)
    Search.submit($scope.searchInput)
    $scope.searchInput = null;
  }

  $scope.toggle = function(result) {
    result.show = !result.show;
  }
}]);