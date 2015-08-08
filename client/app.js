angular.module('app', ['ui.router', 'results', 'details'])
 
.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
  .state('app', {
    url: '/',
    views: {
      'app.nav': {
        templateUrl: './app/results/nav.html'
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

 .state('app.details', {
    templateUrl: './app/results/details.html',
    controller: 'DetailsController'
  })
});