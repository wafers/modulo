angular.module('app')

.controller('TopModulesController', ['TopModules', 'Graph', '$scope', '$http', function(TopModules, Graph, $scope, $http){
  $scope.data;
  $scope.properties;

  // Only fetch if the data is empty in the service
  if(_.isEmpty(TopModules.data)) TopModules.fetchTopModules();

  // Watcher for return of Top 10 modules data
  $scope.$watch(function(){ return TopModules.data }, function(){
    if(!_.isEmpty(TopModules.data)){
      // Watches the Graph service's selectedModule and sets it in the $scope if it exists
      $scope.data = TopModules.data;    
      $scope.properties = Object.keys($scope.data).sort();   // alphabetical sorting
      console.log('retrieved top module data', $scope.data);

      // Fetch all the data for the top modules -- probably done in the TopModules service
      var modulesObj = $scope.data.monthlyDownloadSum.data.map(function(element){
        return element[0];
      });

      // Uses service function to call server endpoints
      TopModules.fetchTopModulesDownloadData(modulesObj); 
    }
  });

  // Watcher for return of top 10 downloads data from server endpoint
  $scope.$watch(function(){ return TopModules.topDownloadsData }, function(){
    // Send all the data packaged to Graph.topDownloadsGraph
    if(!_.isEmpty(TopModules.topDownloadsData)){
      var width = document.getElementById('top-modules-graph').offsetWidth;
      Graph.topDownloadsGraph(TopModules.topDownloadsData, width);
    }
  });

  $scope.formatProperty = function(string){
    var stringArr = string.replace(/([a-z](?=[A-Z]))/g, '$1 ').split('');
    stringArr[0] = stringArr[0].toUpperCase();
    return stringArr.join('');
  }
}]);