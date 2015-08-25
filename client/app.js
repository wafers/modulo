angular.module('app', ['ui.router', 'angular-loading-bar', 'ng-showdown'])

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
    views: { 
      'app.nav': {
        templateUrl: './app/results/nav.html',
        controller: 'NavController'
      },
      '': {
        templateUrl: './app/results/details.html',
        controller: 'DetailsController'
      }
    }
  })
  .state('top', {
    url: '/top',
    views: {
      'app.nav' : {
        templateUrl: './app/results/nav.html',
        controller: 'NavController'
      },
      '': {
        templateUrl: './app/topModules.html',
        controller: 'TopModulesController'
      }
    }
  })
  $urlRouterProvider.otherwise('/');
});