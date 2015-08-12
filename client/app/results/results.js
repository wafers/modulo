angular.module('app')

.controller('ResultsController', ['Search', '$scope', '$http', function(Search, $scope, $http) {
    $scope.searchInput = Search.navInput;
    
    $scope.$watch(function() {
            return Search.results.searchResults;
        }, function() {
            $scope.results = Search.showResults().searchResults
        })
        // function() { return Search.showResults() };
        // $scope.results();
    $scope.toggle = function(result) {
        result.show = !result.show;
    }
}]);
