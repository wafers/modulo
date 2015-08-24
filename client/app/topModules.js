angular.module('app')

.controller('TopModulesController', ['TopModules', '$scope', '$http', function(TopModules, $scope, $http){
  $scope.data;
  TopModules.fetchTopModules();

  $scope.$watch(function(){ return TopModules.data }, function(){
    if(!_.isEmpty(TopModules.data)){
      // Watches the Graph service's selectedModule and sets it in the $scope if it exists
      $scope.data = TopModules.data;    
      console.log('retrieved top module data', $scope.data);
    }
  });


}]);