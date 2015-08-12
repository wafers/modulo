var dateFormat = d3.time.format("%Y-%m-%d");
var margin = {top: 20, right: 30, bottom: 30, left: 80},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// var x = d3.scale.ordinal()
//     .rangeRoundBands([0, width], .1);
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

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load this tsv file from like a website
d3.tsv("underscore.tsv", type, function(error, data) {
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
      .attr("width", 10);

  chart.append('path')
      ,attr({
        
      })
      .attr('d', line(data))
      .attr('fill-opacity', 0)
      .attr('stroke', 'black')
});

function type(d) {
  d.downloads = +d.downloads; // coerce to number
  return d;
}
