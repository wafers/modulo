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

  this.getResults = function() {
    var context = this;
    return $http.post('/search', {'data': this.navInput}).
      success(function(data, status, headers, config) {
        console.log('search results',data);
        if (data === 'No results found') data = [{name: 'No results found'}];
        for (var i=0; i<data.length; i++) {
          if (data[i].downloads) data[i].downloads = JSON.parse(data[i].downloads);
          if (data[i].time) {
            data[i].time = JSON.parse(data[i].time);
            data[i].lastUpdate = moment(data[i].time.modified).fromNow();
          } else {
            data[i].lastUpdate = moment().fromNow();
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

.service('ModulePass', function(){
  this.module = {};

  this.updateModule = function(module){
    this.module = module;
  }
})

.service('versionVis', function(){
  this.barGraphed = false;
  this.circleGraphed = false;
  this.lineGraphed = false;

  this.resetGraphCheck = function() {
    console.log('Graph checks reset. Ready to draw.')
    this.barGraphed = false;
    this.circleGraphed = false;
    this.lineGraphed = false;
  }

  this.circleGraph = function(module){
    if (!this.circleGraphed){
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
            data.push(versionObj);
            last = versionObj['versionLabel'];
          }      
        }
      }
      data.shift()

      var margin = {top: 50, right: 50, bottom: 50, left: 50},
          width = 1000 - margin.left - margin.right,
          height = 300 - margin.top - margin.bottom;
          buckets = 4;
          colors = ['d3d3d3', 'C68282', 'b83130'];

      var x = d3.time.scale() 
        .range([0, width]);
      var y = d3.scale.linear()
          .range([height, 0]);
      var colorScale = d3.scale.quantile()
       .domain([0, buckets - 1, d3.max(data, function (d) { return d.versionValue; })])
       .range(colors);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");
      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(10)

      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          var date = d.date.toString().substring(3,15);
          var str = "<strong>Version:</strong> <span style='color:#00CCFF'>" + d.versionLabel + "</span>";
          str += "</br><string>Date:</strong><span style='color:#00CCFF'> " + date + "</span>";
          return str;
        })

      x.domain([data[0]['date'], data.slice(-1)[0]['date']]);
      y.domain([0, d3.max(data, function(d) { return d.versionValue+2; })]);
      
      // Create main svg for drawing 
      var svg = d3.select(".versionVis").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      svg.call(tip);
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
            .attr("cy", function(d){return height-(d.versionValue+2)*2.5})
            // Size and color of circle based on update 'importance'
            .attr("r", function(d){return (d.versionValue+1)*2.5 > 0 ? (d.versionValue+1)*2.5 : 1})
            .attr("fill", function(d) {return '#'+colorScale(d.versionValue)})
            .attr("opacity", 0.7)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
    }
    this.circleGraphed = true;
  }

  this.lineGraph = function(module){
    if (!this.lineGraphed){
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
      // data.shift()

      var margin = {top: 50, right: 50, bottom: 50, left: 50},
          width = 1000 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;
          buckets = 4;
          colors = ['d3d3d3', 'CBA2A2', 'C16A69', 'b83130'];

      var x = d3.time.scale() 
        .range([0, width])
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
      var svg = d3.select(".versionVis").append("svg")
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
    this.lineGraphed = true;
  }

  this.barGraph = function(module){
    console.log('Has this graph already been drawn?', this.barGraphed)
    if (!this.barGraphed){

      var dataStore = module.time;
      var dateFormat = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");
      var data = [];
      var dataStoreArray = Object.keys(dataStore);
      var last = '0.0.0'
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
      for (var i=0; i<dataStoreArray.length; i++) {
        if (dataStoreArray[i].split('.')[2]-0>=0){ // remove alpha/beta testing versions
          var key = dataStoreArray[i];
          var prevKey = last;
          var versionObj = {};
          if (key !== 'modified' && key !== 'created') {
            versionObj['versionLabel'] = key;
            versionObj['date'] = dateFormat.parse(dataStore[key]);
            versionObj['versionValue'] = updateCalculator(prevKey, key);
            data.push(versionObj);
            last = versionObj['versionLabel'];
          }      
        }
      }
      data.shift()

      var margin = {top: 50, right: 50, bottom: 50, left: 50},
          width = 1000 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;
          buckets = 4;
          colors = ['d3d3d3', 'CBA2A2', 'C16A69', 'b83130'];

      var x = d3.time.scale() 
        .domain([dateFormat(new Date(2014, 0, 1)), dateFormat(new Date(2015, 7, 7))]) 
        .range([0, width]);

      var y = d3.scale.linear()
        .range([height, 0]);

      var colorScale = d3.scale.quantile()
       .domain([0, buckets - 1, d3.max(data, function (d) { return d.versionValue; })])
       .range(colors);    

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10)

      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          var date = d.date.toString().substring(3,15);
          var str = "<strong>Version:</strong> <span style='color:#b83130'>" + d.versionLabel + "</span>";
          str += "</br><string>Date:</strong><span style='color:#b83130'> " + date + "</span>";
          return str;
        })    


      x.domain([data[0]['date'], dateFormat.parse(dateFormat(new Date(2015, 7, 7)))]);
      y.domain([0, d3.max(data, function(d) { return d.versionValue+2; })]);
      // Create main svg for drawing 
      var svg = d3.select(".versionVis").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      svg.call(tip);
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
      // Create y-axis and label
      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -30)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Version Update");
      // Load in data and create bars for each
      svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          // Position bar at correct x position
          .attr("x", function(d) {return x(d.date)})
          .attr("width", 5)
          // Position top of bar at correct y-position
          .attr("y", function(d) {return y(d.versionValue) || 1})
          // Draw bar down to the bottom
          .attr("height", function(d) { return height - y(d.versionValue); })
          .attr("fill", function(d) {return '#'+colorScale(d.versionValue)})
          .attr('opacity', 0.7)
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
      }
  this.barGraphed = true;
  }

})

.service('Sigma', ['$http', function($http){
  this.data = {};

  this.clearSigma = function() {
    // Clear out Sigma graph
    var myNode = document.getElementById("graph-container");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
  }

  this.getResults = function(moduleName){
    var that = this;
    $http.post('/relationships', {"data": moduleName})
    .success(function(data){
      that.data = data;
    })
    .error(function(data){
      console.log(data);
    })
  }
}])

.service('DownloadVis', function(){
  this.downloadGraph = function(moduleName){
    var dateFormat = d3.time.format("%Y-%m-%d");
    var margin = {top: 50, right: 50, bottom: 50, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

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

    var chart = d3.select(".downloadVis")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // load this tsv file from like a website
    d3.tsv("./app/results/underscore.tsv", type, function(error, data) {
      data = data.filter(onlyWeekdays);
      addMovingAverage(data, 100);
      // var movingAverages = addMovingAverage(data.map(function(e){return e.downloads}), 20);

      function addMovingAverage(dataArr, period){ // passed in array of downloads
        for(var i = 0; i < dataArr.length; i++){
          var currentPeriodMovingAverage;
          if(i === 0) currentPeriodMovingAverage = dataArr[i].downloads;
          else if(i < period - 1){ // if its below the period, special calculation until we have enough data points
            currentPeriodMovingAverage = (dataArr[i-1].movingAverage * i + dataArr[i].downloads) / (i+1);
          }else{
            currentPeriodMovingAverage = dataArr.slice(i-(period-1), i+1)
                .map(function(e){ return e.downloads })
                .reduce(function(total, current){ return total + current }, 0) / period;
          }
          dataArr[i].movingAverage = currentPeriodMovingAverage;
        }
      }

      function onlyWeekend(row){
        var date = moment(row.day);
        return date.day() === 6 || date.day() === 7 ? true : false;
      }

      function onlyWeekdays(row){
        var weekday = [1,2,3,4,5];
        var date = moment(row.day);
        return weekday.indexOf(date.day()) >= 0 ? true : false;
      }

      x.domain([dateFormat.parse(data[0].day), dateFormat.parse(data[data.length-1].day)])
      y.domain([0, d3.max(data, function(d) { return d.downloads; })]);

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
          .attr("y", function(d) { return y(d.downloads); })
          .attr("height", function(d) { return height - y(d.downloads); })
          .attr("width", 10)
          .attr('fill', 'steelblue')

      chart.append('path')
          .attr('d', line(data))
          .attr('fill-opacity', 0)
          .attr('stroke', 'black')
    });

    function type(d) {
      d.downloads = +d.downloads; // coerce to number
      return d;
    }
  }
})
