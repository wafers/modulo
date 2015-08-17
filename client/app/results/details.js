angular.module('app')
.controller('DetailsController', ['Graph','ModulePass', '$scope', '$rootScope', '$stateParams', 'Search', function(, Graph, ModulePass, $scope, $rootScope, $stateParams, Search){
  var width = document.getElementById('graph-container').offsetWidth;
  $scope.module = ModulePass.module;

  $scope.$watch(function(){ return ModulePass.module }, function(){
    $scope.module = ModulePass.module
  });

  if(!$scope.module.name || $scope.module.name !== $stateParams.moduleName){
    ModulePass.getModule($stateParams.moduleName);
  }

  // $scope.$watch(function(){ return Sigma.data }, function(){
  //   $scope.results = Sigma.data;

  //   // Sigma.clearSigma();

  //   s = new sigma({ 
  //           graph: $scope.results,
  //           container: 'graph-container',
  //           settings: {
  //             defaultNodeColor: '#ec5148',
  //             defaultEdgeColor: '#d3d3d3'
  //           }
  //   });
  // })
  
  // $scope.$on('$viewContentLoaded', 
    // function(event){ $scope.clearSigma() })

  $scope.lineGraph = function() {
    $scope.clearGraph();
    Graph.lineGraph($scope.module, width)
  }

  $scope.clearGraph = function() {
    Sigma.clearGraph();
    Graph.resetGraphCheck()
  }

  $scope.graphGraph = function(){
    $scope.clearGraph();
    Sigma.getResults($scope.module.name);
  }

  $scope.downloadGraph = function(){
    $scope.clearGraph();
    Graph.downloadGraph('moduleName', width);
  }

  $scope.hasSearchResults = function(){
    return Search.results.searchResults.length > 0;
  }

}]);