'use strict';

angular.module('oli', ['ngRoute', 'ngSanitize'])
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

  .directive('precode', function() {
    return function(scope, element, attrs) {
      
      function bindNode(text) {
        element.html(scope[attrs.precode]);
      }

      bindNode();
      
      scope.$watch(attrs.precode, function () {
        bindNode()
      })
    }
  })

  .controller('ParserDemoCtrl', function ($scope, $log, $location, $sce, Oli) {
    
    $scope.error = null;
    $scope.tab = 'result'
    $scope.examples = [ 'manifest.oli' ]

    $scope.code = $location.search().code || [
      'name: Oli!',
      'type: language',
      'version: 0.1',
      'features:',
      '  string interpolation: yes',
      '  templating: yes',
      'end'
    ].join('\n');

    $scope.setCode = function (index) {
      $scope.code = Oli.scripts[index].source;
    };

    $scope.url = function () {
      $location.search('code', $scope.code)
      $location.search('parse', true)
    };

    $scope.parse = function () {
      if (!$scope.code.length) return;

      try {
        $scope.ast = JSON.stringify(Oli.ast($scope.code), null, 2);
        $scope.output = $scope.ast;
        $scope.tokens = JSON.stringify(Oli.tokens($scope.code), null, 2);
        $scope.error = null;
      } catch (e) {
        $scope.error = e;
        $scope.errorLines = $sce.trustAsHtml(formatWhiteSpaces(e.errorLines))
        $log.error(e);
      }

      function formatWhiteSpaces(str) {
        return str.replace(/\<\/span\>(\s+)\S/g, function (match) {
          return match.replace(/\s/g, '&nbsp;'); 
        });
      }
    };

    $scope.clean = function () {
      $scope.ast = ''
      $scope.tokens = ''
      $scope.output = ''
      $scope.code = ''
      $scope.error = null
    };

    // automatically parse on page load
    if ($location.search().parse) {
      $scope.parse();
    }
  })

  .factory('Oli', function () {
    return window.oli;
  })
