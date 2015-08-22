angular.module('app')

.controller('ResultsController', ['Search', 'ModulePass', 'Graph', '$scope', '$http', '$rootScope', '$stateParams', function(Search, ModulePass, Graph, $scope, $http, $rootScope, $stateParams) {
  $scope.searchInput = Search.navInput;
  $scope.setOrder = function (order) {
      $scope.order = order;
  }
  
  $scope.$watch(function() {
      return Search.results.searchResults;
    }, function() {
      $scope.results = Search.showResults().searchResults
  })
      // function() { return Search.showResults() };
      // $scope.results();
  $scope.toggle = function(result, $index) {
    ModulePass.updateModule(this.result);
    result.show = !result.show;
    if (result.show) {
      $scope.bulletGraph(result, $index)
      $scope.tooltip($index);
    }
  }

  $rootScope.$on('$stateChangeSuccess', function() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  });

  $scope.tooltip = function (index){
    $('.masterTooltip').hover(function(){
      var tipData = $(this).attr('val')
      $(this).data('tipText', tipData);
        $('<p class="tooltip"></p>')
          .text(tipData)
          .appendTo('body')
          .fadeIn('fast');
    }, function() {
        // Hover out code
        $('.tooltip').remove();
    })
    .mousemove(function(e) {
        var mousex = e.pageX + 20; //Get X coordinates
        var mousey = e.pageY + 10; //Get Y coordinates
        $('.tooltip')
        .css({ top: mousey, left: mousex })
    })
  }

}]);
