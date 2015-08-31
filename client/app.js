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
        templateUrl: './app/nav/nav.html',
        controller: 'NavController'
      },
      '': {
        abstract: true,
        templateUrl: './app/content/content.html'
      }
    }
  })
 .state('app.results', {
    templateUrl: './app/results/results.html',
    controller: 'ResultsController'
  })
  .state('top', {
    url: '/top',
    views: {
      'app.nav' : {
        templateUrl: './app/nav/nav.html',
        controller: 'NavController'
      },
      '': {
        templateUrl: './app/topModules/topModules.html',
        controller: 'TopModulesController'
      }
    }
  })
 .state('details', {
    url : '/:moduleName',
    views: { 
      'app.nav': {
        templateUrl: './app/nav/nav.html',
        controller: 'NavController'
      },
      '': {
        templateUrl: './app/details/details.html',
        controller: 'DetailsController'
      }
    }
  })
  $urlRouterProvider.otherwise('/');
});