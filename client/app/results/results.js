angular.module('app')

.controller('ResultsController', ['Search', 'ModulePass', 'Graph', '$scope', '$http', '$rootScope', '$stateParams', function(Search, ModulePass, Graph, $scope, $http, $rootScope, $stateParams) {
  $scope.searchInput = Search.navInput;
  $scope.setOrder = function (order) { $scope.order = order };

  // Watch function on the search results, change when return from async GET request
  $scope.$watch(function() { return Search.results.searchResults}, function(){
      $scope.results = Search.showResults().searchResults
  });

  // Toggle a search results dropdown
  $scope.toggle = function(result, $index) {
    ModulePass.updateModule(this.result);
    result.show = !result.show;
    if(result.show) Graph.bulletGraph(result, $index);
  }

  $rootScope.$on('$stateChangeSuccess', function() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  });
}]);
