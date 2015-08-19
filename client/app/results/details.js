angular.module('app')
.controller('DetailsController', ['Graph','ModulePass', '$showdown', '$scope', '$rootScope', '$stateParams', 'Search', 
function(Graph, ModulePass, $showdown, $scope, $rootScope, $stateParams, Search){  
  $scope.module = ModulePass.module;
  $scope.selectedGraph = 'downloads'
  $scope.dlForm = {
    barWidth: 5,
    maPeriod: 100,
    startDate: moment().subtract(3, 'years').toDate(),
    endDate: moment().toDate(),
    filter: 'all'
  }
  $scope.readmeMarkdown = '';

  $scope.$watch(function(){ return ModulePass.module }, function(){
    $scope.module = ModulePass.module;
    if($scope.module.downloads) $scope.drawGraph('downloads');
    $scope.readmeMarkdown = $showdown.makeHtml(ModulePass.module.readme)
  });

  // Send a GET request to the database if there is no module data
  if(!$scope.module.name || $scope.module.name !== $stateParams.moduleName){
    ModulePass.getModule($stateParams.moduleName);
  }

  $scope.drawGraph = function(type){
    Graph.clearGraph();
    this.selectedGraph = type;
    // console.log('Selected the',this.selectedGraph,'graph')
    var width = document.getElementById('graph-container').offsetWidth-25;

    if(type === 'version'){
      var options = _.pick(this.dlForm, 'startDate', 'endDate');
      options['width'] = width;
      Graph.lineGraph(this.module, options);
    }
    else if(type === 'dependency'){
      Graph.sigmaGraph(this.module.name);
    }
    else if(type === 'downloads'){
      var options = this.dlForm;
      options['width'] = width;
      Graph.downloadGraph(this.module.downloads, options);
    }
  }

  $scope.hasSearchResults = function(){
    return Search.results.searchResults.length > 0;
  }

  $scope.copy = function(){
    var client = new ZeroClipboard( document.getElementById('install-link') );
  }

  $scope.resetFilterForm = function(){};

  $scope.downloadCount = function(daysBack){
    var downloads = this.module.downloads.map(downloadCount);
    return downloads.slice(-daysBack).reduce(sum);

    function downloadCount(row){ return row.count }
    function sum(t,c){ return t + c }
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