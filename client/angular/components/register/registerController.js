(function(){
  'use strict';
  var RgstrCtrl = function($scope, db, RgstrSrvc, $location){
    $scope.isDefault = !db.anyAccounts;
    $scope.usernameValid = null;
    $scope.checkUser = function(username){
      console.log($scope.username)
      RgstrSrvc.check(username, $scope);
    }

    $scope.Create = function(){
      if ($scope.username === null || $scope.username !== $scope.usernameValid){
        console.log('nope')
        return;
      }
      RgstrSrvc.register($scope.username, $scope.password, $scope.privacy);
    };
    $scope.changeView = function(){
      $location.path('/home');
      $scope.$apply();
    }
  };

  module.exports = ["$scope", 'db', 'RgstrSrvc', '$location', RgstrCtrl];
}());
