angular.module('app')

.controller('ResultsController', ['Search', 'ModulePass', '$scope', '$http', function(Search, ModulePass, $scope, $http) {
    $scope.searchInput = Search.navInput;
    
    $scope.$watch(function() {
            return Search.results.searchResults;
        }, function() {
            $scope.results = Search.showResults().searchResults
        })
        // function() { return Search.showResults() };
        // $scope.results();
    $scope.toggle = function(result) {
        // console.log('clicked module:', this.result)
        ModulePass.updateModule(this.result);
        result.show = !result.show;
    }
}]);
