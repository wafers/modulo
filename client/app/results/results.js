angular.module('app')

.controller('ResultsController', ['Search', 'ModulePass', '$scope', '$http', '$rootScope', '$stateParams', function(Search, ModulePass, $scope, $http, $rootScope, $stateParams) {
  $scope.searchInput = Search.navInput;
  $scope.setOrder = function (order) {
      $scope.order = order;
  }

  $scope.bulletGraph = function(module, index) {
    // var elementID = element.attr('id');
    console.log(index)
    var ranks = [['Overall Rank',module.overallRank], ['Last Update Rank', module.dateRank], ['Number of Versions Rank', module.versionNumberRank], ['Module Data Completeness', module.completenessRank], ['Monthly Download Rank', module.downloadRank], ['Dependents Rank', module.dependentRank], ['Number of Stars Rank', module.starRank]];
    var margin = {top: 5, bottom: 5, left: 200};
    var width = document.getElementsByClassName('page-header')[0].offsetWidth - margin.left;
    console.log('width', document.getElementsByClassName('page-header')[0].offsetWidth)
    var height = 200 - margin.top - margin.bottom;
    var buckets = 3;
    var colors = ['rgb(245,75,26)', 'rgb(229,195,158)', 'rgb(1,171,233)'];

    var xscale = d3.scale.linear()
      .domain([0,101])
      .range([0,width-200]);

    var yscale = d3.scale.linear()
      .domain([0,ranks.length])
      .range([0,height]);

    var colorScale = d3.scale.quantize()
      .domain([0, buckets-1, 100])
      .range(colors);

    var canvas = d3.select('#dropdown-div-'+index)
      .append('svg')
      .attr({'width':width,'height':height});

    var chart = canvas.append('g')
      .attr("transform", "translate(200,0)")
      .attr('id','bars')
      .selectAll('rect')
      .data(ranks)
      .enter()
        .append('rect')
        .attr('height',15)
        .attr({'x':0,'y':function(d){ return yscale(ranks.indexOf(d)); }})
        .style('fill',function(d){ return colorScale(d[1]); })
        .attr('width',function(d){ return 0; });

    var transit = d3.select('#dropdown-div-'+index).select('svg').selectAll("rect")
      .data(ranks)
      .transition()
      .duration(1000) 
      .attr("width", function(d) {return xscale(d[1]); });

    var transitext = d3.select('#dropdown-div-'+index).select('svg').select('#bars')
      .selectAll('text')
      .data(ranks)
      .enter()
      .append('text')
      .attr({'x':function(d) {return xscale(d[1])-50; },'y':function(d){ return yscale(ranks.indexOf(d))+13; }})
      .text(function(d){ return d[1]; }).style({'fill':'#000','font-size':'14px'})    
      
    var labelText = d3.select('#dropdown-div-'+index).select('svg')
      .selectAll('labels')
      .data(ranks)
      .enter()
      .append('text')
      .attr({'x':'0','y':function(d){ return yscale(ranks.indexOf(d))+13; }})
      .text(function(d){ return d[0]; }).style({'fill':'#000','font-size':'14px'});    
    
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
    }
  }



  $rootScope.$on('$stateChangeSuccess', function() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  });
}]);
