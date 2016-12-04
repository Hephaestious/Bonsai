'use strict';

(function () {

  var angular = require('angular');
  require('angular-route');

  var _templateBase = './angular/components';
  var app = angular.module('backroom', [
      'ngRoute'
  ]);
  require('./components');
  app.config(['$routeProvider', function ($routeProvider) {
          $routeProvider.when('/', {
              templateUrl: _templateBase + '/home/home.html' ,
              controller: 'HomeCtrl'
          });
          $routeProvider.otherwise({ redirectTo: '/' });
      }
  ]);

})();
