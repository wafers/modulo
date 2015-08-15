angular.module('app')
.controller('DetailsController', ['DownloadVis', 'Sigma', 'versionVis','ModulePass', '$scope', '$rootScope', '$stateParams', function(DownloadVis, Sigma, versionVis, ModulePass, $scope, $rootScope, $stateParams){
  $scope.module = ModulePass.module;

  $scope.$watch(function(){ return ModulePass.module }, function(){
    $scope.module = ModulePass.module
  });

  if(Object.keys($scope.module).length === 0){
    // If module data for the page is empty, send a get request to the server
    ModulePass.getModule($stateParams.moduleName);
  }

  $scope.circleGraph = function() {
    versionVis.circleGraph($scope.module)
  }

  $scope.lineGraph = function() {
    versionVis.lineGraph($scope.module)
  }

  $scope.barGraph = function() {
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

  // $scope.clearSigma = function() {
  //   Sigma.clearSigma();
  //   $state.go('app.results');
  // }

  $scope.graphGraph = function(){
    Sigma.getResults($scope.module.name);
  }

  $scope.downloadGraph = function(){
    DownloadVis.downloadGraph();
  }
}]);