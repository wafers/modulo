angular.module('app')

.controller('ResultsController', ['Search', 'ModulePass', '$scope', '$http', '$rootScope', '$stateParams', function(Search, ModulePass, $scope, $http, $rootScope, $stateParams) {
  $scope.searchInput = Search.navInput;
  $scope.setOrder = function (order) {
      $scope.order = order;
  }

  $scope.bulletGraph = function(module, index) {
    var ranks = [['Overall Rank',module.overallRank, 'overallRank'], ['Last Update Rank', module.dateRank, 'lastUpdate'], ['Number of Versions Rank', module.versionNumberRank, 'time'], ['Module Data Completeness', module.completenessRank, 'completenessRank'], ['Monthly Download Rank', module.downloadRank, 'monthlyDownloadSum'], ['Dependents Rank', module.dependentRank, 'dependentsSize'], ['Number of Stars Rank', module.starRank, 'starred'], ['GitHub Repo Rank', module.githubRank, 'github']];
    var margin = {top: 5, bottom: 5, left: 200};
    var width = document.getElementsByClassName('page-header')[0].offsetWidth - margin.left;
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
    
    d3.select('#dropdown-div-'+index).select("svg").remove();

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
        .attr('height',19)
        .attr({'x':0,'y':function(d){ return yscale(ranks.indexOf(d)); }})
        .style('fill',function(d){ return colorScale(d[1]); })
        .attr('width',function(d){ return 0; })
        .attr('class', 'masterTooltip')
        .attr('val', function(d){return rankDetails(d)});

    var text = d3.select('#dropdown-div-'+index).select('svg').select('#bars')
      .selectAll('text')
      .data(ranks)
      .enter()
        .append('text')
        .attr({'x': 2,'y':function(d){ return yscale(ranks.indexOf(d))+13; }})
        .text(function(d){ return d[1]; }).style({'fill':'#fff','font-size':'14px'})    
        .attr('class', 'masterTooltip')
        .attr('val', function(d){return rankDetails(d)});
      
    var transit = d3.select('#dropdown-div-'+index).select('svg')
      .selectAll('rect')
        .data(ranks)
        .transition()
        .duration(1000) 
        .attr("width", function(d) {return xscale(d[1]) === 0 ? 15 : xscale(d[1]); });

    var transit = d3.select('#dropdown-div-'+index).select('svg')
      .selectAll('text')
        .data(ranks)
        .transition()
        .duration(1000) 
        .attr("x", function(d) {
          return xscale(d[1])-50 < 0 ? 1 : xscale(d[1]) - 50;
        });

    var labelText = d3.select('#dropdown-div-'+index).select('svg')
      .selectAll('labels')
      .data(ranks)
      .enter()
        .append('text')
        .attr({'x':'0','y':function(d){ return yscale(ranks.indexOf(d))+13; }})
        .text(function(d){ return d[0]; }).style({'fill':'#000','font-size':'14px'});

    function rankDetails(rank) {
      var key = rank[2];
      console.log('rank', key)
      console.log('module', module[key])

      var displayData = ''

      if (key === 'time') {
        displayData = Object.keys(module[key]).length-2 + ' versions published';
      } else if (key === 'lastUpdate') {
        displayData = 'Last update on ' + module[key];
      } else if (key === 'monthlyDownloadSum') {
        displayData = module[key].toLocaleString() + ' downloads in past 30 days';
      } else if (key === 'dependentsSize') {
        displayData = module[key].toLocaleString() + ' modules depending on ' + module.name;
      } else if (key === 'starred') {
        displayData = module[key].toLocaleString() + ' stars on NPM';
      } else if (key === 'overallRank') {
        displayData = module[key] + ' overall module score';
      } else if (key === 'completenessRank') {
        displayData = module[key] + '% module information complete'
        if (module[key] < 100) displayData += '. Missing info: ' + module.completenessFailures
      } else if (key === 'github' && module.subscribers) {
        displayData = 'Watched by ' + module.subscribers.toLocaleString() + ' GitHub users. \n' + module.forks.toLocaleString() + ' forked repos. \n' + module.openIssues.toLocaleString() + ' open issues and pull requests.'
      }

      return displayData
    }

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
