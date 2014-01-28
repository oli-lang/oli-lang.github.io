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
      $routeProvider.when('/demo', {
        templateUrl: 'views/demo.html'
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
  })

  .controller('ParserDemoCtrl', function ($scope) {
      
    $scope.tab = 'result'

    $scope.exampleCode = [
      '@name: Oli!',
      'type: language',
      'version: 0.1',
      'features:',
      '  string interpolation: yes',
      '  templating: yes',
      'end'
    ].join('\n');

    $scope.output = [
      '!!!',
      'html:',
      '  head:',
      '    @title: Welcome to Oli!',
      '  end',
      '  body:',
      '   # i\'m using a reference that points to \'title\'',
      '   h1: &amp;{title} ',
      '   # this is a in-line comment!',
      '   div(class: container, id: main):',
      '     p(class: main-title another-class): This is a paragraph',
      '     a(href: \'http://h2non.github.io/oli\', title: click here!): Oli Spec',
      '   end',
      ' end',
      'end'
    ].join('\n');

  });