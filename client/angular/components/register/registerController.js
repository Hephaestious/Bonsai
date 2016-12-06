(function(){
  'use strict';
  var RgstrCtrl = function($scope, RgstrSrvc){
    console.log(socket);
    $scope.showCreate = true;
    $scope.usernameValid = false;

    $scope.checkUser = function(username){
      RgstrSrvc.check(username, $scope);
    }

    $scope.Create = function(){
      if ($scope.username === null){
        alert("fucking retard, you didn't give a username (and I put one in for you)");
      }
      RgstrSrvc.register($scope.username);
    };

  };

  module.exports = ["$scope", 'RgstrSrvc', RgstrCtrl];
}());
