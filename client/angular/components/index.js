'use strict';
var app = require('angular').module('bonsai');

console.log(require('./paper/paperTabController'));
app.component('paperTab', require('./paper/paperTabController'));
app.component('paperTabs', require('./paper/paperTabsController'));

app.controller('HomeCtrl', require('./home/homeController'));
app.controller('LoginCtrl', require('./login/loginController'));
app.controller('RgstrCtrl', require('./register/registerController'));
app.factory('RgstrSrvc', require('./register/registerService'));
