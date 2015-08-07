angular.module('app', ['ui.router', 'search', 'details'])
 
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
      }
    }
  })

 .state('app.details', {
    templateUrl: './app/results/details.html',
    controller: 'DetailsController'
  })
});