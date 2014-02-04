'use strict';

angular.module('oli', ['ngRoute', 'ngSanitize'])
  .config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.when('/sintax', {
        templateUrl: 'views/sintax.html'
      })
      $routeProvider.when('/examples', {
        templateUrl: 'views/examples.html'
      })
      $routeProvider.when('/try', {
        templateUrl: 'views/parser.html'
      })
      $routeProvider.when('/parser', {
        templateUrl: 'views/parser.html'
      })
      $routeProvider.otherwise({
        redirectTo: '/',
        templateUrl: 'views/main.html'
      })
    }
  ])
  
  .factory('PrismHighlight', function () {
    return function (code) {
      return Prism.highlight(code, Prism.languages.ruby)
    }
  })

  .directive('highlight', function(PrismHighlight) {
    return function(scope, element, attrs) {
      element.html(PrismHighlight(element.text()))
    }
  })

  .directive('precode', function() {
    return function(scope, element, attrs) {
      bindNode()
      
      scope.$watch(attrs.precode, function () {
        bindNode()
      })

      function bindNode(text) {
        element.html(scope[attrs.precode])
      }
    }
  })

  .directive('codeEditor', function() {
    return function(scope, element, attrs) {
      var codeMirror = CodeMirror(element[0], {
        value: scope[attrs.source],
        mode:  "ruby",
        tabSize: 2,
        lineNumbers: true
      })
  
      codeMirror.on('change', function () {
        scope[attrs.source] = codeMirror.getValue()
      })

      scope.$watch(attrs.source, function (source) {
        codeMirror.setValue(source)
      })
    }
  })

  .controller('ParserDemoCtrl', function ($scope, $log, $location, $sce, Oli) {
    
    $scope.error = null
    $scope.tab = 'result'
    $scope.examples = [ 
      'HTML markup', 
      'Package manifest', 
      'Product list', 
      'Test DSL', 
      'Data types' 
    ]

    $scope.options = {
      loc: false,
      comments: false
    }

    $scope.code = $location.search().code || [
      'name: Oli!',
      'type: language',
      'category: ',
      ' | - minimalist, markup-like',
      'version: 0.1.0',
      'open spec: yes',
      'license: MIT',
      'homepage: "http://oli-lang.org"',
      'features:',
      '  string interpolation: yes',
      '  templating: yes',
      '  data references: yes',
      '  data clone: yes',
      '  elegant: yes',
      'end'
    ].join('\n')

    $scope.setCode = function (index) {
      $scope.code = Oli.scripts[index].source
    }

    $scope.url = function () {
      $location.search('code', $scope.code)
      $location.search('parse', true)
    }

    $scope.parse = function () {
      if (!$scope.code.length) return

      try {
        $scope.ast = JSON.stringify(Oli.ast($scope.code, $scope.options), null, 2)
        $scope.output = JSON.stringify(Oli.parse($scope.code, $scope.options), null, 2)
        $scope.tokens = $scope.output
        $scope.error = null
      } catch (e) {
        $scope.error = e
        $scope.errorLines = $sce.trustAsHtml(formatWhiteSpaces(e.errorLines.join('<br />')))
        $log.error(e)
      }

      function formatWhiteSpaces(str) {
        return str.replace(/\<\/span\>(\s+)\S/g, function (match) {
          return match.replace(/\s/g, '&nbsp;&nbsp;')
        })
      }
    };

    $scope.clean = function () {
      $scope.ast = ''
      $scope.tokens = ''
      $scope.output = ''
      $scope.code = ''
      $scope.error = null
    }

    // automatically parse on page load
    if ($location.search().parse) {
      $scope.parse()
    }
  })

  .factory('Oli', function () {
    return window.oli
  })
