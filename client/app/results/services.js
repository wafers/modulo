angular.module('app')

.service('Search',['$http', '$window', function($http, $window) {
  this.navInput = '';
  this.results = {
    searchResults: []
  }

  this.showResults = function() {
    return this.results;
  }

  this.submit = function(val) {
    console.log(val)
    this.navInput = val;
    console.log(this.navInput, 'this.submit in services')
    this.results = this.getResults(this.navInput);
    return this.results;
  }

  this.getResults = function() {
    console.log("test getResults")
    var context = this;
    return $http.post('/search', {'data': this.navInput}).
      success(function(data, status, headers, config) {
        console.log(data);
        for (var key in data) {
          data[key].lastUpdate = moment(data[key].lastUpdate).format('l');
          data[key].length = 2//data[key].dependents.length;
        }
        // this.results.searchResults = data;
        context.results.searchResults =  data;
      }).
      error(function(data, status, headers, config) {
        console.log('error');
        console.log(data);
      });
  }
}])

.service('versionVis', function(){
  this.circleGraph = function(module){
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
        colors = ['315B7E', '1699C5', '00CCFF'];

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

  this.barGraph = function(module){
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
        console.log(last, '->', dataStoreArray[i])
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
        colors = ['315B7E', '1699C5', '00CCFF'];

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
        var str = "<strong>Version:</strong> <span style='color:#00CCFF'>" + d.versionLabel + "</span>";
        str += "</br><string>Date:</strong><span style='color:#00CCFF'> " + date + "</span>";
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
})
.service('Sigma', ['$http', function($http){
  this.data = {};

  this.getResults = function(){
    var that = this;
    $http.post('/relationships', {"data": "d3"})
    .success(function(data){
      console.log('sigma results', data)
      that.data = data;
    })
    .error(function(data){
      console.log(data);
    })
  }


}])
