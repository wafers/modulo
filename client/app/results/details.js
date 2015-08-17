angular.module('app')
.controller('DetailsController', ['Graph','ModulePass', '$scope', '$rootScope', '$stateParams', 'Search', function(Graph, ModulePass, $scope, $rootScope, $stateParams, Search){
  
  $scope.module = ModulePass.module;

  $scope.$watch(function(){ return ModulePass.module }, function(){
    $scope.module = ModulePass.module
  });

  if(!$scope.module.name || $scope.module.name !== $stateParams.moduleName){
    ModulePass.getModule($stateParams.moduleName);
  }

  $scope.clearGraph = function() {
    Graph.clearGraph();
    Graph.resetGraphCheck()
  }

  $scope.drawGraph = function(type){
    this.clearGraph();
    var width = document.getElementById('graph-container').offsetWidth;
    if(type === 'version') Graph.lineGraph(this.module, width);
    else if(type === 'dependency') Graph.sigmaGraph(this.module.name);
    else if(type === 'downloads') Graph.downloadGraph('moduleName', width);
  }

  $scope.hasSearchResults = function(){
    return Search.results.searchResults.length > 0;
  }

  $scope.$on("$destroy", function(){
    Graph.clearGraph();
  });
}]);