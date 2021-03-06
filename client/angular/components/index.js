'use strict';
var app = require('angular').module('bonsai');

app.component('paperTab', require('./paper/paperTabController'));
app.component('paperTabs', require('./paper/paperTabsController'));
app.component('paperRipple', require('./paper/paperRippleController'));
app.component('paperButton', require('./paper/paperButtonController'));
app.component('paperTextField', require('./paper/paperTextFieldController'));
  app.directive('ptfExpose', require('./paper/paperTextFieldDirective'));

app.controller('HomeCtrl', require('./home/homeController'));
app.controller('RgstrCtrl', require('./register/registerController'));
app.controller('LoginCtrl', require('./login/loginController'));
app.factory('RgstrSrvc', require('./register/registerService'));
