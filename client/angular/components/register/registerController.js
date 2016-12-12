(function(){
  'use strict';
  var RgstrCtrl = function($scope, db, RgstrSrvc, $location){
    $scope.isDefault = !db.anyAccounts;
    $scope.usernameValid = null;
    $scope.checkUser = function(username){
      RgstrSrvc.check(username, $scope);
    }

    $scope.Create = function(){
      if ($scope.username === null){
        alert("fucking retard, you didn't give a username (and I put one in for you)");
      }
      RgstrSrvc.register($scope.username, $scope.password, $scope);
    };
    $scope.changeView = function(){
      $location.path('/home');
      $scope.$apply();
    }
  };

  module.exports = ["$scope", 'db', 'RgstrSrvc', '$location', RgstrCtrl];
}());
