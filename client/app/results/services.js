angular.module('app')

.service('Search',['$http',function($http) {
  var searchInput = null;
  this.results = {
    searchResults: []
  }
  this.navInput = '';

  this.showResults = function(){
    return this.results
  }

  this.setSearch = function(val) {
    this.navInput = val;
  }

  this.submit = function(){
    searchInput = this.navInput;
    console.log(searchInput)
    // this.results.searchResults = this.getResults(searchInput);
    this.getResults(searchInput);
    console.log(this.results)
  }

  this.getResults = function() {
    console.log("test getResults")
    var context = this;
    return $http.post('/search', {'data': searchInput}).
      success(function(data, status, headers, config) {
        console.log(data);
        for (var key in data) {
          data[key].lastUpdate = moment(data[key].lastUpdate).format('l');
          data[key].length = data[key].dependents.length;
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