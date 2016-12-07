'use strict';

(function () {
  require('./services/db/dbLoader').then(function(res){
    var angular = require('angular');
    require('angular-route');
    var _templateBase = './angular/components';
    var app = angular.module('bonsai', [
        'ngRoute'
    ]);
    require('./components');
    require('./services');
    var loginDefault = {
      templateUrl: _templateBase + '/login/login.html',
      controller: 'LoginCtrl'
    }
    var registerDefault = {
      templateUrl: _templateBase + '/register/register.html',
      controller: 'RgstrCtrl',
      isDefault: true
    }
    app.value('_db', res.db);
    app.factory('db', require('./services/db/db'));
    app.config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/', res.any ? loginDefault : registerDefault)
            .when('/register', {
              templateUrl: _templateBase + '/register/register.html',
              controller: 'RgstrCtrl'
            })
            .when('/login', {
              templateUrl: _templateBase + '/login/login.html',
              controller: 'LoginCtrl'
            })
            .otherwise({ redirectTo: '/' });
        }
    ]);
  });
})();
