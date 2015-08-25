angular.module('app')

.service('Search',['$http', function($http) {
  this.navInput = '';
  this.results = {
    searchResults: []
  }
  
  this.showResults = function() {
    return this.results;
  }

  this.submit = function(val) {
    this.navInput = val;
    this.results = this.getResults(this.navInput);
    return this.results;
  }

  // Calculate quality ranking for given module and attach relevent metrics to module.
  this.calculateRank = function(module) {
    // Rank by time since last module update. Longer time => lower score.
    if (module.lastUpdate === 'Unknown') {
      module.dateRank = 0;
    } else {
      var now = moment();
      var recent = moment().subtract(1,'day');
      var year = moment().subtract(1,'year');
      var moduleDate = moment(module.time.modified); // dateRank criteria: score of 100 if updated in last day, score of 0 if updated >= 1 year ago. Linear scale between.
      module.dateRank = Math.floor((100/(recent-year))*(moduleDate - now) + 100 - (100/(recent-year))*(recent-now))
      if (module.dateRank < 0 ) module.dateRank = 0;
    };

    // Rank by total number of published module updates.
    module.versionNumberRank = Object.keys(module.time).length < 35 ? 3 * (Object.keys(module.time).length-2) : 100; // versionNumberRank gives 3pts per published update, max 100 pts.

    // Rank by number of downloads in past 30 days.
    if (!module.monthlyDownloadSum) {
      module.downloadRank = 0;
    } else { // If there are downloads, min score is 10. Score moves up from there on log10 scale. Max score of 100 reached at 1million monthly downloads.
      module.downloadRank = Math.log10(module.monthlyDownloadSum)*15+10 > 100 ? 100 : Math.floor(Math.log10(module.monthlyDownloadSum)*15+10);
    }

    // Rank by number of NPM stars and Github stars. 
    // Comment out versions with GitHub data. May re-implement later. 
    // if (!module.starred || !module.watchers) {
    if (!module.starred) {
      module.starRank = 0;
    } else { // NPM stars added to GitHub stars, then scaled on log10. Max score of 100 reached at 10,000 combined stars.
      // Comment out versions with GitHub data. May re-implement later. 
      // module.starRank = Math.floor(Math.log10(module.starred+module.watchers)*25) > 100 ? 100 : Math.floor(Math.log10(module.starred+module.watchers)*25);
      module.starRank = module.starred*2 > 100 ? 100 : module.starred*2;
    }

    // Rank by number of modules listing this module as a dependency
    if (!module.dependentsSize) {
      module.dependentRank = 0;
    } else {
      module.dependentRank = Math.log10(module.dependentsSize)*25 > 100 ? 100 : Math.floor(Math.log10(module.dependentsSize)*25) ;
    }

    // Rank by NPM module submission completeness (quality module must have Readme, Keywords, and URL)
    // Store lacking pieces for rank explanations
    module.completenessRank = 0;
    if (module.readme !== 'No readme provided') {
      module.completenessRank += 34;
    } else {
      module.completenessFailures = ['Readme'];
    }
    if (module.url && module.url.length > 0) {
      module.completenessRank += 33;
    } else {
      if (module.completenessFailures) module.completenessFailures.push('URL')
      else module.completenessFailures = ['URL']; 
    }
    if (module.keywords && module.keywords.length > 0) {
      module.completenessRank += 33;
    } else {
      if (module.completenessFailures) module.completenessFailures.push('Keywords')
      else module.completenessFailures = ['Keywords']; 
    }

    // Comment out versions with GitHub data. May re-implement later. 
    // Rank by GitHub followers, forks, and open issues/pulls
    // if (!module.subscribers || !module.forks || !module.openIssues) {
    //   module.githubRank = 0;
    // } else {
    //   // Count users watching repo for 33 of 100 points. Scaled on log10 with max score of 33 reached at 1500 users watching. 
    //   var watchersPortion = Math.floor(Math.log10(module.subscribers)*31.5/100*33) > 33 ? 33 : Math.floor(Math.log10(module.subscribers)*31.5/100*33);
    //   // Count forked repos for 34 of 100 points. Scaled on log10 with max score of 34 reached at 1000 forks. 
    //   var forkPortion = Math.floor(Math.log10(module.forks)*33/100*34) > 34 ? 34 : Math.floor(Math.log10(module.forks)*33/100*34);
    //   // Count issues+pulls for 33 of 100 points. Scaled on log10 with max score of 33 reached at 150 open issues/pulls.
    //   var issuesPortion = Math.floor(Math.log10(module.openIssues)*46/100*33) > 33 ? 33 : Math.floor(Math.log10(module.openIssues)*46/100*33);
    //   module.githubRank = watchersPortion + forkPortion + issuesPortion;
    // }

    // Comment out versions with GitHub data. May re-implement later. 
    // Calculate overall rank as average of individual rankings
    // var rankSum = (module.dateRank + module.versionNumberRank + module.downloadRank + module.starRank + module.dependentRank + module.completenessRank + module.githubRank)
    // module.overallRank = Math.floor(rankSum/7)
    var rankSum = (module.dateRank + module.versionNumberRank + module.downloadRank + module.starRank + module.dependentRank + module.completenessRank)
    module.overallRank = Math.floor(rankSum/6)
  }

  this.getResults = function() {
    var context = this;
    return $http.post('/search', {'data': this.navInput}).
      success(function(data, status, headers, config) {
        console.log('search results',data);
        if (data === 'No results found') data = [{name: 'No results found for '+context.navInput}];

        for (var i=0; i<data.length; i++) {
          if (data[i]){
            if (data[i].downloads) data[i].downloads = JSON.parse(data[i].downloads);
            if (data[i].time) {
              data[i].time = JSON.parse(data[i].time);
              data[i].lastUpdate = moment(data[i].time.modified).fromNow();
              data[i].latestVersion = Object.keys(data[i].time).slice(-3)[0];
              data[i].lastUpdate = moment(data[i].time.modified).format('MM DD YYYY');
            } else {
              data[i].lastUpdate = 'Unknown';
              data[i].time = {}
            }

            if(!data[i].readme) data[i].readme = "No readme provided";
            if (!data[i].overallRank) {
              context.calculateRank(data[i]);
            }
          }
        }

        context.results.searchResults =  data;
      }).
      error(function(data, status, headers, config) {
        console.log('error');
        console.log(data);
      });
  }
}])

.service('ModulePass', ['$http', function($http){
  this.module = {};

  this.updateModule = function(module){
    this.module = module;
  }

  var that = this;
  this.getModule = function(moduleName){
    var data = { data : moduleName };
    return $http.post('/detailedSearch', data)
      .success(function(data){
        if (data === 'No results found') data = {name: 'No results found'};
        if (data.downloads) data.downloads = JSON.parse(data.downloads);
        if (data.time) {
          data.time = JSON.parse(data.time);
          data.lastUpdate = moment(data.time.modified).fromNow();
          data.latestVersion = Object.keys(data.time).slice(-3)[0];
        } else {
          data.lastUpdate = moment().fromNow();
          data.time = {}
        }
        if(!data.readme) data.readme = "No readme provided";
       that.module = data;
       console.log(data);
      })
      .error(function(data){ console.log('error', data) })
  }
}])

// Graph service responsible for drawing the sigma, download, and version graphs
.service('Graph', ['Search', '$http', '$location', function(Search, $http, $location){
  var margin = {top: 50, right: 10, bottom: 50, left: 80};
  var height = 500 - margin.top - margin.bottom;

  this.selectedModule = {};
  var graphService = this;

  // Clears out the entire graph container
  this.clearGraph = function() {
    this.selectedModule = {};
    var myNode = document.getElementById("graph-container");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    console.log('Graph checks reset. Ready to draw');
  }

  // Sigma graph drawing
  this.sigmaGraph = function(moduleName){
    $http.post('/relationships', {"data": moduleName})
    .success(function(data){
      var currentGraph = $('#graph-container').attr('data');
      if(currentGraph === 'dependency'){  // Check to make sure only to render sigma if the dependency graph is still selected
        s = new sigma({ 
                graph: data,
                renderer: {
                  container: document.getElementById('graph-container'),
                  type: 'canvas'
                },
                settings: {
                  doubleClickEnabled: false,
                  borderSize: 1,
                  autoRescale: false,
                  labelThreshold: 6.1,

                  //Edge options
                  minEdgeSize: 0.5,
                  maxEdgeSize: 4,
                  enableEdgeHovering: true,
                  edgeHoverColor: 'edge',
                  defaultEdgeColor: "#eee",
                  defaultEdgeHoverColor: "#000",
                  edgeHoverSizeRatio: 1,
                  edgeHoverExtremities: true,
                }
        });

        s.bind('clickNode', function(e) {
          // Click sigma node event handler
          var data = { data : e.data.node.label };
          $http.post('/detailedSearch', data)
            .success(function(data){
              if (data === 'No results found') data = {name: 'No results found'};
              if (data.downloads) data.downloads = JSON.parse(data.downloads);
              if (data.time) {
                data.time = JSON.parse(data.time);
                data.lastUpdate = moment(data.time.modified).fromNow();
                data.latestVersion = Object.keys(data.time).slice(-3)[0];
              } else {
                data.lastUpdate = moment().fromNow();
                data.time = {}
              }
              graphService.selectedModule = data;
            })
            .error(function(data){ console.log('error', data) })
        });

        s.bind('doubleClickNode', function(e) {
          // Double click sigma event handler. Should re-route to the target node's analytics page
          var node = e.data.node;
          window.location = "/#/details/"+node.label; // Redirect to the node double clicked
        });
      }
    })
    .error(function(data){
      console.log(data);
    })
  }

  this.bulletGraph = function(module, index, options) {
    Search.calculateRank(module);
    // Comment out ranks including GitHub data. May re-implement later. 
    // var ranks = [['Overall Rank',module.overallRank, 'overallRank'], ['Last Update Rank', module.dateRank, 'lastUpdate'], ['Number of Versions Rank', module.versionNumberRank, 'time'], ['Module Data Completeness', module.completenessRank, 'completenessRank'], ['Monthly Download Rank', module.downloadRank, 'monthlyDownloadSum'], ['Dependents Rank', module.dependentRank, 'dependentsSize'], ['Number of Stars Rank', module.starRank, 'starred'], ['GitHub Repo Rank', module.githubRank, 'github']];
    var ranks = [['Overall Rank',module.overallRank, 'overallRank'], ['Last Update Rank', module.dateRank, 'lastUpdate'], ['Number of Versions Rank', module.versionNumberRank, 'time'], ['Module Data Completeness', module.completenessRank, 'completenessRank'], ['Monthly Download Rank', module.downloadRank, 'monthlyDownloadSum'], ['Dependents Rank', module.dependentRank, 'dependentsSize'], ['Number of Stars Rank', module.starRank, 'starred']];
    var margin = index === undefined ? {top: 50, bottom: 5, left: 250} : {top: 15, bottom: 5, left: 200};
    var width = index === undefined ? options.width : document.getElementsByClassName('page-header')[0].offsetWidth - margin.left;
    var height = index === undefined ? 500 - margin.top - margin.bottom : 200 - margin.top - margin.bottom;
    var buckets = 3;
    var colors = ['rgb(231,76,60)', 'rgb(52,152,219)', 'rgb(44,62,80)'];
    var container = index === undefined ? '#graph-container' : '#dropdown-div-'+index;

    var xscale = d3.scale.linear()
      .domain([0,101])
      .range([0,width - margin.left]);

    var yscale = d3.scale.linear()
      .domain([0,ranks.length])
      .range([20,height]);

    var colorScale = d3.scale.quantize()
      .domain([0, buckets-1, 100])
      .range(colors);
    
    d3.select(container).select("svg").remove();

    var canvas = d3.select(container)
      .append('svg')
      .attr({'width':width,'height':height});

    var chart = canvas.append('g')
      .attr("transform", "translate("+margin.left+",0)")
      .attr('id','bars')
      .selectAll('rect')
      .data(ranks)
      .enter()
        .append('rect')
        .attr('height', index === undefined ? 50 : 19 )
        .attr({'x':0,'y':function(d){ return yscale(ranks.indexOf(d)); }})
        .style('fill',function(d){ return colorScale(d[1]); })
        .attr('width',function(d){ return 0; })
        .attr('class', 'masterTooltip')
        .attr('val', function(d){return rankDetails(d)});

    var text = d3.select(container).select('svg').select('#bars')
      .selectAll('text')
      .data(ranks)
      .enter()
        .append('text')
        .attr({'x': 2,'y':function(d){ return yscale(ranks.indexOf(d))+(index === undefined ? 30 : 13); }})
        .text(function(d){ return d[1]; }).style({'fill':'#fff','font-size':'14px'})    
        .attr('class', 'masterTooltip')
        .attr('val', function(d){return rankDetails(d)});
      
    var transit = d3.select(container).select('svg')
      .selectAll('rect')
        .data(ranks)
        .transition()
        .duration(1000) 
        .attr("width", function(d) {return xscale(d[1]) === 0 ? 15 : xscale(d[1]); });

    var transit = d3.select(container).select('svg')
      .selectAll('text')
        .data(ranks)
        .transition()
        .duration(1000) 
        .attr("x", function(d) {
          return xscale(d[1])-50 < 0 ? 1 : xscale(d[1]) - 50;
        });

    var labelText = d3.select(container).select('svg')
      .selectAll('labels')
      .data(ranks)
      .enter()
        .append('text')
        .attr({'x': index===undefined ? '50' : '0','y':function(d){ return yscale(ranks.indexOf(d))+(index === undefined ? 30 : 13); }})
        .text(function(d){ return d[0]; }).style({'fill':'#000','font-size':'14px'});

    function rankDetails(rank) {
      var key = rank[2];

      var displayData = '';

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
      } 
      // Comment out bar for GitHub data. May re-implement later. 
      //else if (key === 'github' && module.subscribers) {
      //  displayData = 'Watched by ' + module.subscribers.toLocaleString() + ' GitHub users. \n' + module.forks.toLocaleString() + ' forked repos. \n' + module.openIssues.toLocaleString() + ' open issues and pull requests.'
      //}

      return displayData;
    }

    // Generate the tool tip -- IFFE
    (function tooltip(index){
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
    })(index);
  }

  this.versionGraph = function(module, options){
    var width = options.width - margin.left - margin.right;

    var dataStore = module.time;
    var dateFormat = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");
    var updateCalculator = function(oldVersion, newVersion) {
      newVersion = newVersion.split('.');
      oldVersion = oldVersion.split('.');
      var thisVersion = [(newVersion[0]-0)*50,(newVersion[1]-0)*5,(newVersion[2]*1-0)*0.5];
      var lastVersion = [(oldVersion[0]-0)*50,(oldVersion[1]-0)*5,(oldVersion[2]*1-0)*0.5];
      var thisTotal = thisVersion[0]+thisVersion[1]+thisVersion[2];
      var lastTotal = lastVersion[0]+lastVersion[1]+lastVersion[2];
      var versionDiff = thisTotal - lastTotal;

      return versionDiff > 0 ? versionDiff : 1;
    }
    var data = [];
    var dataStoreArray = Object.keys(dataStore);
    var last = '0.0.0'
    for (var i=0; i<dataStoreArray.length; i++) {
      if (dataStoreArray[i].split('.')[2]-0>=0){ // remove alpha/beta testing versions
        var key = dataStoreArray[i];
        var prevKey = last;
        var versionObj = {};
        if (key !== 'modified' && key !== 'created') {
          versionObj['versionLabel'] = key;
          versionObj['date'] = dateFormat.parse(dataStore[key]);
          versionObj['versionValue'] = updateCalculator(prevKey, key);
          versionObj['majorVersion'] = key.split('.')[0]
          data.push(versionObj);
          last = versionObj['versionLabel'];
        }
      }
    }

    // Date filtering
    data = data.filter(withinDateRange);
    if(data.length === 0) return; // edge to return if there is no data

    function withinDateRange(row){
      var momentDate = moment(row.date);
      return !(momentDate.isBefore(options.startDate) || momentDate.isAfter(options.endDate));
    }

    var buckets = 4;
    var colors = ['d3d3d3', 'CBA2A2', 'C16A69', 'b83130'];

    var x = d3.time.scale() 
      .range([0, width-50])
      .domain([data[0]['date'], data.slice(-1)[0]['date']]);
    var y = d3.scale.linear()
      .range([height, 0])
      .domain([0, d3.max(data, function(d) { return height/100 })]);
    var colorScale = d3.scale.quantile()
     .domain([0, buckets - 1, d3.max(data, function (d) { return d.majorVersion; })])
     .range(colors);


    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        var date = d.date.toString().substring(3,15);
        var str = "<strong>Version:</strong> <span class='tip-values'>" + d.versionLabel + "</span>";
        str += "</br><string>Date:</strong><span class='tip-values'> " + date + "</span>";
        return str;
      })

    // Create main svg for drawing 
    var svg = d3.select("#graph-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.call(tip);
    // Create y-axis and label
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -30)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Production Version");
    // Create x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        // Rotate text labels
        .selectAll('text')
          .attr('x', 0)
          .attr('dx', 15)
          .attr('transform', 'rotate(30)')

    // Load in data and create circles for each
    svg.selectAll(".circle")
        .data(data)
        .enter().append("circle")
          .attr("class", "circle")
          // Position circle at correct x position
          .attr("cx", function(d) {return x(d.date)})
          // Position circle at correct y-position
          .attr("cy", function(d){return height - d.majorVersion*100})
          // Size and color of circle based on update 'importance'
          .attr("r", function(d){return 0})
          .attr("fill", function(d) {return '#'+colorScale(d.majorVersion)})
          .attr("opacity", 0.7)
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
      
    var transit = d3.select('#graph-container').select('svg')
      .selectAll('circle')
        .data(data)
          .transition()
          .duration(1000) 
          .attr("r", function(d){return (d.majorVersion+1) > 0 ? (d.majorVersion+5) : 5})

  }

  // Render the download graph
  this.downloadGraph = function(data, options){
    var width = options.width - margin.left - margin.right;
    var dateFormat = d3.time.format("%Y-%m-%d");

    var x = d3.time.scale()
      .range([0, width]);
    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var chart = d3.select("#graph-container").append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // DATA FILTERING 
    // - Weekend/Weekday
    // - Date-range
    if(options.filter === 'weekdays') data = data.filter(onlyWeekdays);
    else if(options.filter === 'weekends') data = data.filter(onlyWeekends);
    data = data.filter(withinDateRange);
    if(data.length === 0) return;
    addMovingAverage(data, options.maPeriod); // Defaults to a 100-daily moving average

    // Data filtering helper functions

    function withinDateRange(row){
      if(moment(row.day).isBefore(options.startDate)) return false;
      if(moment(row.day).isAfter(options.endDate)) return false;
      return true;
    }

    function addMovingAverage(dataArr, period){ // passed in array of downloads
      for(var i = 0; i < dataArr.length; i++){
        var currentPeriodMovingAverage;
        if(i === 0) currentPeriodMovingAverage = dataArr[i].count;
        else if(i < period - 1){ // if its below the period, special calculation until we have enough data points
          currentPeriodMovingAverage = (dataArr[i-1].movingAverage * i + dataArr[i].count) / (i+1);
        }else{
          currentPeriodMovingAverage = dataArr.slice(i-(period-1), i+1)
              .map(function(e){ return e.count })
              .reduce(function(total, current){ return total + current }, 0) / period;
        }
        dataArr[i].movingAverage = currentPeriodMovingAverage;
      }
    }

    function onlyWeekends(row){
      var date = moment(row.day);
      return date.day() === 6 || date.day() === 7 ? true : false;
    }

    function onlyWeekdays(row){
      var weekday = [1,2,3,4,5];
      var date = moment(row.day);
      return weekday.indexOf(date.day()) >= 0 ? true : false;
    }

    // D3 Chart drawing

    x.domain([dateFormat.parse(data[0].day), dateFormat.parse(data[data.length-1].day)])
    y.domain([0, d3.max(data, function(d) { return d.count; })]);

    var line = d3.svg.line()
      .x(function(d){ return x(dateFormat.parse(d.day)) })
      .y(function(d){ return y(d.movingAverage) })
      .interpolate('basis')

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -70)
          .attr("x", -150)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .style("font-size", "18px")
          .text("# of Total Daily Downloads");

    chart.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(dateFormat.parse(d.day)); })
        .attr("y", function(d) { return height; })
        .attr("height", function(d) { return 0 })
        .attr("width", options.barWidth)
      
    var transit = d3.select('#graph-container').select('svg')
      .selectAll('rect')
        .data(data)
          .transition()
          .duration(1000) 
          .attr("y", function(d) { return y(d.count); })
          .attr("height", function(d) { return height - y(d.count); })

    setTimeout(function(){
      var path = chart.append('path')
          .attr("class", "moving-average")
          .attr('d', line(data))
          .attr('fill', 'none')
      
      var totalLength = path.node().getTotalLength();
      
      path.attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1000)
      .ease('linear')
      .attr('stroke-dashoffset', 0);}, 500)

    function type(d) {
      d.count = +d.count; // coerce to number
      return d;
    }
  }
}])

.service('TopModules',['$http', function($http) {
  this.data = {};

  var topModulesService = this;

  this.fetchTopModules = function(){
    $http.get('/topModules').then(function(res){
      topModulesService.data = res.data;
    });
  } 
}]);