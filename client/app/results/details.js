angular.module('app')
.controller('DetailsController', ['Graph','ModulePass', '$showdown', '$scope', '$rootScope', '$stateParams', 'Search', 
function(Graph, ModulePass, $showdown, $scope, $rootScope, $stateParams, Search){  
  // View variable declarations-------------------------------------------------
  $scope.module = ModulePass.module;
  $scope.selectedGraph = 'downloads'
  $scope.dlForm = {
    barWidth: 5,
    maPeriod: 100,
    startDate: moment('01 01 2009').toDate(),
    endDate: moment().toDate(),
    filter: 'all'
  }
  $scope.readmeMarkdown = '';
  $scope.selectedModule = Graph.selectedModule;

  // Module Data watchers-------------------------------------------------
  $scope.$watch(function(){ return Graph.selectedModule }, function(){
    // Watches the Graph service's selectedModule and sets it in the $scope if it exists
    $scope.selectedModule = Graph.selectedModule;    
  });

  $scope.$watch(function(){ return ModulePass.module }, function(){
    // Watches the ModulePass service's module and sets it in the $scope if it exists
    $scope.module = ModulePass.module;
    if($scope.module.downloads) $scope.drawGraph('downloads');
    $scope.readmeMarkdown = $showdown.makeHtml(ModulePass.module.readme)
  });

  // Draw graph function-------------------------------------------------
  $scope.drawGraph = function(type){
    Graph.clearGraph();
    this.selectedGraph = type;
    var width = document.getElementById('graph-container').offsetWidth-25;

    if(type === 'version'){
      // Draw the version graph
      var options = _.pick(this.dlForm, 'startDate', 'endDate');
      options['width'] = width;
      Graph.versionGraph(this.module, options);
    }
    else if(type === 'dependency'){
      // Draw the dependency graph
      Graph.sigmaGraph(this.module.name);
    }
    else if(type === 'downloads'){
      // Draw the downloads graph
      var options = this.dlForm;
      options['width'] = width;
      Graph.downloadGraph(this.module.downloads, options);
    }
    else if(type === 'bullet'){
      // Draw the bulletGraph
      var options = { width: width };
      Graph.bulletGraph(this.module, undefined, options);
    } else if (type === 'keyword') {
      // Draw the keyword cloud
      var options = {width: width};
      Graph.keywordGraph(this.module.keywords, options);
    }
  }

  $scope.hasSearchResults = function(){
    return Search.results.searchResults.length > 0;
  }

  $scope.copy = function(){
    var client = new ZeroClipboard( document.getElementById('install-link') );
  }

  $scope.downloadCount = function(daysBack){
    if(_.isEmpty(this.module)) return "N/A";
    var downloads = this.module.downloads.map(downloadCount);
    return downloads.slice(-daysBack).reduce(sum);

    function downloadCount(row){ return row.count }
    function sum(t,c){ return t + c }
  }

  $scope.downloadPercentageChange = function(period){
    if(_.isEmpty(this.module)) return "N/A";
    var currentPeriodTotal = this.downloadCount(period);
    var lastPeriodTotal = this.downloadCount(period+period) - currentPeriodTotal;
    var percentChange = currentPeriodTotal / lastPeriodTotal;

    if(percentChange > 0) this.isPositive = {color:'green'};
    else this.isPositive = {color:'red'};

    return percentChange.toFixed(2) + "%";
  }

  // Clear the graph when leaving the details page-------------------------------------------------
  $scope.$on("$destroy", function(){ Graph.clearGraph() }); // Only runs on view destroy
  $scope.init = function(){
    // Only runs on initial view creation
    // Send a GET request to the database if there is no module data, or if it has the wrong module data
    if(this.module.name !== $stateParams.moduleName || _.isEmpty(this.module)){
      ModulePass.getModule($stateParams.moduleName);
    }
    
    ZeroClipboard.config( { swfPath: "/scripts/zeroclipboard/dist/ZeroClipboard.swf" } );
    // Need to refactor this sometime to get it to work better
    var client = new ZeroClipboard( document.getElementById('install-link') );
    var client = new ZeroClipboard( document.getElementById('install-link') );
    Graph.clearGraph();
  } 
}]);