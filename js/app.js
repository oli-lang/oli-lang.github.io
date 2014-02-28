'use strict';

var exampleCode = "\
url = 'https://github.com/oli-lang'\n\
# information\n\
name: Oli!\n\
type: language\n\
version: 0.1.0\n\
open spec: yes\n\
license: MIT\n\
homepage: 'http://oli-lang.org'\n\
repository: url: '*url/oli'\n\
categories: - minimalist, markup-like\n\
description:-\n\
  Oli is an elegant, expressive,\n\
  unobstructive and featured\n\
  minimal language for humans \n\
end\n\
features:\n\
  pretty\n\
  higienic\n\
  string interpolation\n\
  templating\n\
  linked data\n\
  nested structures\n\
end"

angular.module('oli', ['ngRoute', 'ngSanitize'])
  
  .config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.when('/syntax', {
        templateUrl: 'views/syntax.html'
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

  .factory('Oli', function () {
    return window.oli
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
        lineNumbers: true,
        indentWithTabs: false,
        electricChars: false
      })
  
      codeMirror.on('change', function () {
        try {
          if (scope[attrs.repl].repl) {
            scope.$apply(function () {
              scope[attrs.source] = codeMirror.getValue()
            })
          } else {
            scope[attrs.source] = codeMirror.getValue()
          }
        } catch (e) {}
      })

      scope.$watch(attrs.update, function (source) {
        if (source) {
          codeMirror.setValue(source)
        }
      })
      scope.$watch(attrs.source, function (source) {
        if (!scope[attrs.repl].repl) {
          codeMirror.setValue(source)
        }
      })
    }
  })

  .controller('ParserDemoCtrl', function ($scope, $log, $location, $sce, Oli) {
    
    $scope.error = null
    $scope.codeFile = null
    $scope.tab = 'result'
    $scope.examples = [
      'HTML markup', 
      'Package manifest', 
      'Product list', 
      'Test DSL', 
      'Data types',
      'Indentation'
    ]

    $scope.options = {
      loc: false,
      comments: false,
      meta: false,
      repl: false
    }

    $scope.code = $location.search().code || exampleCode

    $scope.setCode = function (index) {
      $scope.ast = null
      $scope.error = null
      $scope.codeFile = Oli.scripts[index].source
    }

    $scope.url = function () {
      $location.search('code', $scope.code)
      $location.search('parse', true)
    }

    $scope.parse = function () {
      if (!$scope.code.length) return

      try {
        $scope.ast = doOli('ast')
        $scope.output = doOli('parse')
        $scope.tokens = doOli('tokens')
        $scope.error = null
      } catch (e) {
        $scope.error = e
        if (e.errorLines) {
          $scope.errorLines = formatErrorLines(e.errorLines)
        } else {
          $scope.errorLines = null
        }
        $log.error(e)
      }

      function doOli(action) {
        return JSON.stringify(Oli[action]($scope.code, $scope.options), null, 2)
      } 

      function formatErrorLines(errorLines) {
        return $sce.trustAsHtml(formatWhiteSpaces(errorLines.join('<br />')))
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

    var unwatch
    $scope.$watch('options', function (options) {
      if (options.repl) {
        unwatch = $scope.$watch('code', function () {
          $scope.parse()
        }, true)
      } else if (unwatch) {
        unwatch()
      }
    }, true)

    // automatically parse on page load
    if ($location.search().parse) {
      $scope.parse()
    }
  })
