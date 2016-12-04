'use strict';
var app = require('angular').module('backroom');

app.controller('HomeCtrl', require('./home/homeController'));
app.controller('RgstrCtrl', require('./register/registerController'));
