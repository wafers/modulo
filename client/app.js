angular.module('app', ['ui.router'])
 
.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
  .state('app', {
    url: '/',
    views: {
      'app.search': {
        templateUrl: './app/results/search.html',
        controller:'searchController'
      },
      '': {
        templateUrl: './app/content.html'
      }
    }
  })

  .state('app.results', {
    templateUrl: './app/results/results.html',
    controller: 'ResultsController'
  })

  .state('app.allgraphs', {
    templateUrl: './app/results/allgraphs.html',
    controller: 'AllGraphsController'
  })
});