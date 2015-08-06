angular.module('app', ['ui.router'])
 
.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
  .state('app', {
    url: '/',
    views: {
      'app.search': {
        templateUrl: './app/search.html',
        controller:'searchController'
      },
      '': {
        templateUrl: './app/content.html'
      }
    }
  })

  .state('app.allgraphs', {
    templateUrl: './app/graphs/allgraphs.html',
    controller: 'AllGraphsController'
  })
});