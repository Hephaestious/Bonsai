(function(){
  'use strict';
  var RgstrCtrl = function($scope, RgstrSrvc){

    $scope.username = "fuck the nsa";
    $scope.password = "motherfucker";
    $scope.showCreate = true;
    $scope.usernameValid = false;
    
    var updateValid = function(valid){
      $scope.usernameValid = valid;
    }

    $scope.checkUser = function(username){
      RgstrSrvc.check(username, $scope);
    }

    $scope.Create = function(){
      if ($scope.username === null){
        alert("fucking retard, you didn't give a username (and I put one in for you)");
      }
      RgstrSrvc.check($scope.username);
    };

  };

  module.exports = ["$scope", 'RgstrSrvc', RgstrCtrl];
}());
