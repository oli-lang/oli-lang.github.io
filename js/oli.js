'use strict';

angular.module('oli', ['ngRoute'])
  .config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.when('/sintax', {
        templateUrl: 'views/sintax.html'
      });
      $routeProvider.when('/examples', {
        templateUrl: 'views/examples.html'
      });
      $routeProvider.otherwise({
        redirectTo: '/',
        templateUrl: 'views/main.html'
      });
    }
  ])
  .directive('highlight', function() {
    return function(scope, element, attrs) {
      element.html(Prism.highlight(element.text(), Prism.languages.ruby));
    };
  });
