angular.module('app', ['ui.router', 'search', 'allgraphs'])
 
.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
  .state('app', {
    url: '/',
    views: {
      'app.search': {
        templateUrl: './app/results/search.html',
        controller:'SearchController'
      },
      '': {
        templateUrl: './app/content.html'
      },
      'app.allgraphs': {
        templateUrl: './app/results/allgraphs.html',
        controller:'AllGraphsController'
      }
    }
  })

 // .state('app.allgraphs', {
 //    templateUrl: './app/results/allgraphs.html',
 //    controller:'AllGraphsController'
 //  })
});