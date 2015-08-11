angular.module('app')

.controller('NavController', ['Search' , '$scope', '$http', function(Search,$scope,$http) {
  $scope.searchInput = null;
  console.log("YO")
  $scope.submit = function(){
    console.log('in here')
    $scope.results = Search.submit($scope.searchInput);
    // Search.submit($scope.searchInput);
  }

  // $scope.getResults = function() {
  // 	console.log("getting results")
  //   console.log($scope.searchInput)
  //   return $http.post('/search', {'data': $scope.searchInput}).
  //     success(function(data, status, headers, config) {
  //       console.log(data);
  //       for (var key in data) {
  //         data[key].lastUpdate = moment(data[key].lastUpdate).format('l');
  //         data[key].length = data[key].dependents.length;
  //       }
  //       $scope.results = data;
  //     }).
  //     error(function(data, status, headers, config) {
  //       console.log('error');
  //       console.log(data);
  //     });
  // }

  $scope.toggle = function(result) {
    result.show = !result.show;
  }

  $scope.openTab = function() {
    $scope.url = './app/results/details.html';
  }

}]);