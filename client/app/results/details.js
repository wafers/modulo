angular.module('app')
.controller('DetailsController', ['Graph','ModulePass', '$scope', '$rootScope', '$stateParams', 'Search', 
function(Graph, ModulePass, $scope, $rootScope, $stateParams, Search){  
  $scope.module = ModulePass.module;

  $scope.$watch(function(){ return ModulePass.module }, function(){
    $scope.module = ModulePass.module;
    $scope.drawGraph('downloads');
  });

  // Send a GET request to the database if there is no module data
  if(!$scope.module.name || $scope.module.name !== $stateParams.moduleName){
    ModulePass.getModule($stateParams.moduleName);
  }

  $scope.drawGraph = function(type){
    Graph.clearGraph();
    var width = document.getElementById('graph-container').offsetWidth;
    if(type === 'version') Graph.lineGraph(this.module, width);
    else if(type === 'dependency') Graph.sigmaGraph(this.module.name);
    else if(type === 'downloads') Graph.downloadGraph(this.module.downloads, width);
  }

  $scope.hasSearchResults = function(){
    return Search.results.searchResults.length > 0;
  }

  // Clear the graph when leaving the details page
  $scope.$on("$destroy", function(){ Graph.clearGraph() });
}]);