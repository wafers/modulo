angular.module('app')
.controller('DetailsController', ['DownloadVis', 'Sigma', 'versionVis','ModulePass', '$scope', '$rootScope', '$stateParams', 'Search', function(DownloadVis, Sigma, versionVis, ModulePass, $scope, $rootScope, $stateParams, Search){
  $scope.module = ModulePass.module;

  $scope.$watch(function(){ return ModulePass.module }, function(){
    $scope.module = ModulePass.module
  });

  if(!$scope.module.name || $scope.module.name !== $stateParams.moduleName){
    ModulePass.getModule($stateParams.moduleName);
  }

  $scope.circleGraph = function() {
    $scope.clearGraph();
    versionVis.circleGraph($scope.module)
  }

  $scope.lineGraph = function() {
    $scope.clearGraph();
    versionVis.lineGraph($scope.module)
  }

  $scope.barGraph = function() {
    $scope.clearGraph();
    versionVis.barGraph($scope.module)
  }

  $scope.$watch(function(){ return Sigma.data }, function(){
    $scope.results = Sigma.data;

    // Sigma.clearSigma();

    s = new sigma({ 
            graph: $scope.results,
            container: 'graph-container',
            settings: {
              defaultNodeColor: '#ec5148',
              defaultEdgeColor: '#d3d3d3'
            }
    });
  })
  
  // $scope.$on('$viewContentLoaded', 
    // function(event){ $scope.clearSigma() })

  $scope.clearGraph = function() {
    Sigma.clearGraph();
    versionVis.resetGraphCheck()
    //   $state.go('app.results');
  }

  $scope.graphGraph = function(){
    $scope.clearGraph();
    Sigma.getResults($scope.module.name);
  }

  $scope.downloadGraph = function(){
    $scope.clearGraph();
    DownloadVis.downloadGraph();
  }

  $scope.hasSearchResults = function(){
    return Search.results.searchResults.length > 0;
  }

}]);