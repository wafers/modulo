angular.module('app', ['ui.router', 'angular-loading-bar'])

.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
  cfpLoadingBarProvider.includeSpinner = false;
}])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('app', {
    url: '/',
    templateUrl: './index.html',
    views: {
      'app.nav': {
        abstract: true,
        templateUrl: './app/results/nav.html',
        controller: 'NavController'
      },
      '': {
        abstract: true,
        templateUrl: './app/content.html'
      }
    }
  })
 .state('app.results', {
    templateUrl: './app/results/results.html',
    controller: 'ResultsController'
  })
 .state('details', {
    url : '/details/:moduleName',
    // templateUrl: './app/results/details.html',
    // controller: 'DetailsController',
    views: { 
      'app.nav': {
        templateUrl: './app/results/nav.html',
        controller: 'NavController'
      },
      '': {
        templateUrl: './app/results/details.html',
        controller: 'DetailsController'
      }
    },
    resolve: {
      init: function(versionVis) {
        versionVis.resetGraphCheck()
      }
    }
  })
  $urlRouterProvider.otherwise('/');
});