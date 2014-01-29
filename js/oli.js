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
        templateUrl: 'views/parser.html'
      });
      $routeProvider.when('/parser', {
        templateUrl: 'views/parser.html'
      });
      $routeProvider.otherwise({
        redirectTo: '/',
        templateUrl: 'views/main.html'
      });
    }
  ])
  
  .factory('PrismHighlight', function () {
    return function (code) {
      return Prism.highlight(code, Prism.languages.ruby);
    };
  })

  .directive('highlight', function(PrismHighlight) {
    return function(scope, element, attrs) {
      element.html(PrismHighlight(element.text()));
    };
  })

  .controller('ParserDemoCtrl', function ($scope, CodeExamples) {
      
    $scope.tab = 'result'
    $scope.examples = CodeExamples

    $scope.setCode = function (code) {
      $scope.exampleCode = code;
    };

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

  })

  .factory('CodeExamples', function () {
    function join(arr) { 
      return arr.join('\n');
    }

    return {
      'package.oli': join([
        'name: my-package',
        'version: 0.1.2',
        'author: John <me@mail.com>'
      ]),
      'manifest': join([
        'output: /var/log/info.log'
      ])
    }
  });
