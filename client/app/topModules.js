angular.module('app')

.controller('TopModulesController', ['TopModules', 'Graph', '$scope', '$http', function(TopModules, Graph, $scope, $http){
  $scope.data;
  $scope.properties;
  if(_.isEmpty(TopModules.data)) TopModules.fetchTopModules();

  $scope.$watch(function(){ return TopModules.data }, function(){
    if(!_.isEmpty(TopModules.data)){
      // Watches the Graph service's selectedModule and sets it in the $scope if it exists
      $scope.data = TopModules.data;    
      $scope.properties = Object.keys($scope.data).sort();   // alphabetical sorting
      console.log('retrieved top module data', $scope.data);
    }
  });

  $scope.formatProperty = function(string){
    var stringArr = string.replace(/([a-z](?=[A-Z]))/g, '$1 ').split('');
    stringArr[0] = stringArr[0].toUpperCase();
    return stringArr.join('');
  }
}]);