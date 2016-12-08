'use strict';
var app = require('angular').module('bonsai');

app.controller('HomeCtrl', require('./home/homeController'));
app.controller('RgstrCtrl', require('./register/registerController'));
app.controller('LoginCtrl', require('./login/loginController'));
app.factory('RgstrSrvc', require('./register/registerService'));
