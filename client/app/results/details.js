angular.module('app')
.controller('DetailsController', ['Graph','ModulePass', '$scope', '$rootScope', '$stateParams', 'Search', 
function(Graph, ModulePass, $scope, $rootScope, $stateParams, Search){  
  $scope.module = ModulePass.module;
  $scope.selectedGraph = 'downloads'
  $scope.form = {
    barWidth: 5,
    maPeriod: 100,
    startDate: null,
    endDate: null
  }

  $scope.$watch(function(){ return ModulePass.module }, function(){
    $scope.module = ModulePass.module;
    if($scope.module.downloads) $scope.drawGraph('downloads');
  });

  // Send a GET request to the database if there is no module data
  if(!$scope.module.name || $scope.module.name !== $stateParams.moduleName){
    ModulePass.getModule($stateParams.moduleName);
  }

  $scope.drawGraph = function(type, filter){
    Graph.clearGraph();
    this.selectedGraph = type;
    console.log('Selected the',this.selectedGraph,'graph')
    var width = document.getElementById('graph-container').offsetWidth-25;
    if(type === 'version') Graph.lineGraph(this.module, width);
    else if(type === 'dependency') Graph.sigmaGraph(this.module.name);
    else if(type === 'downloads') Graph.downloadGraph(this.module.downloads, width, filter);
  }

  $scope.hasSearchResults = function(){
    return Search.results.searchResults.length > 0;
  }

  $scope.copy = function(){
    var client = new ZeroClipboard( document.getElementById('install-link') );
  }

  // Clear the graph when leaving the details page
  $scope.$on("$destroy", function(){ Graph.clearGraph() });
  $scope.init = function(){
    ZeroClipboard.config( { swfPath: "/scripts/zeroclipboard/dist/ZeroClipboard.swf" } );
    // Need to refactor this sometime to get it to work better
    var client = new ZeroClipboard( document.getElementById('install-link') );
    var client = new ZeroClipboard( document.getElementById('install-link') );
    Graph.clearGraph();
  } 
}]);