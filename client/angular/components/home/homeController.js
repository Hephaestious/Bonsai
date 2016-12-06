(function(){
  'use strict';
  var HomeCtrl = function($scope, $location){
    $scope.test1 = 5;
    $scope.changeView = function(){
      $location.path('/register'); // path not hash
    };
  };

  module.exports = ["$scope", "$location", HomeCtrl];
}());
