angular.module('app')

.service('Search',['$http', function($http) {
  this.navInput = '';
  this.results = {
    searchResults: []
  }
  this.highestValues = {
    downloads: 0,
    stars: 0,
    dependents: 0,
    update: moment('Jan 1 2000'),
    updateNumber: 0
  }
  
  this.showResults = function() {
    return this.results;
  }

  this.submit = function(val) {
    this.navInput = val;
    this.results = this.getResults(this.navInput);
    return this.results;
  }

  this.calculateRank = function(module) {
    if (module.lastUpdate === 'Unknown') {
      module.updateRank = 0;
    } else if (moment(module.time.modified) === this.highestValues.update) {
      module.updateRank = 50;
    } else {
      var now = moment();
      var recent = moment(this.highestValues.update);
      var year = moment().subtract(1,'year');
      var moduleDate = moment(module.time.modified);
      var dateRank = (50/(recent-year))*(moduleDate - now) + 50 - (50/(recent-year))*(recent-now)
      if (dateRank < 0 ) dateRank = 0;
      var numberRank = (50/this.highestValues.updateNumber) * Object.keys(module.time).length
      module.updateRank = Math.floor(dateRank + numberRank);
    };

    if (module.monthlyDownloadSum === 0) {
      module.downloadRank = 0;
    } else {
      module.downloadRank = Math.floor(100/this.highestValues.downloads*module.monthlyDownloadSum);
    }

    if (module.dependentsSize === 0) {
      module.dependentRank = 0;
    } else {
      module.dependentRank = Math.floor(100/this.highestValues.dependents*module.dependentsSize);
    }

    if (module.starred === 0) {
      module.starRank = 0;
    } else {
      module.starRank = Math.floor(100/this.highestValues.stars*module.starred);
    }
  }

  this.getResults = function() {
    var context = this;
    return $http.post('/search', {'data': this.navInput}).
      success(function(data, status, headers, config) {
        console.log('search results',data);
        if (data === 'No results found') data = [{name: 'No results found'}];
        this.highestValues = {
          downloads: 0,
          stars: 0,
          dependents: 0,
          update: moment('Jan 1 2000'),
          updateNumber: 0
        }

        for (var i=0; i<data.length; i++) {
          if (data[i].downloads) data[i].downloads = JSON.parse(data[i].downloads);
          if (data[i].time) {
            data[i].time = JSON.parse(data[i].time);
            data[i].lastUpdate = moment(data[i].time.modified).fromNow();
            data[i].latestVersion = Object.keys(data[i].time).slice(-3)[0];
            data[i].lastUpdate = moment(data[i].time.modified).format('MM DD YYYY');
            if(moment(data[i].time.modified) > context.highestValues.update) context.highestValues.update = moment(data[i].time.modified);
            if(data[i].monthlyDownloadSum > context.highestValues.downloads) context.highestValues.downloads = data[i].monthlyDownloadSum;
            if(data[i].dependentsSize > context.highestValues.dependents) context.highestValues.dependents = data[i].dependentsSize;
            if(data[i].starred > context.highestValues.stars) context.highestValues.stars = data[i].starred;
            if(Object.keys(data[i].time).length > context.highestValues.updateNumber) context.highestValues.updateNumber = Object.keys(data[i].time).length;
          } else {
            data[i].lastUpdate = 'Unknown';
          }

          if(!data[i].readme) data[i].readme = "No readme provided";
        }

        for (var j=0; j<data.length; j++) {
          context.calculateRank(data[j]);
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
        }
        if(!data.readme) data.readme = "No readme provided";
       that.module = data;
       console.log(data);
      })
      .error(function(data){ console.log('error', data) })
  }


}])

.service('Graph', ['$http', function($http){
  var margin = {top: 50, right: 10, bottom: 50, left: 80};
  var height = 500 - margin.top - margin.bottom;

  // Clears out the entire graph container
  this.clearGraph = function() {
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
      // populate sigma here
      s = new sigma({ 
              graph: data,
              container: 'graph-container',
              settings: {
                defaultNodeColor: '#4c1313',
                defaultEdgeColor: '#d3d3d3',
                borderSize: 1
              }
      });
    })
    .error(function(data){
      console.log(data);
    })
  }

  this.lineGraph = function(module, width){
    width = width - margin.left - margin.right;

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
          .attr("r", function(d){return (d.majorVersion+1) > 0 ? (d.majorVersion+5) : 5})
          .attr("fill", function(d) {return '#'+colorScale(d.majorVersion)})
          .attr("opacity", 0.7)
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
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
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); })
        .attr("width", options.barWidth)

    chart.append('path')
        .attr("class", "moving-average")
        .attr('d', line(data))
        .attr('fill-opacity', 0)
    // });

    function type(d) {
      d.count = +d.count; // coerce to number
      return d;
    }
  }
}])

