(function(){
  'use strict';
  var HomeCtrl = function($scope, $location, $rootScope, HomeSrvc, defaultAccount){
    HomeSrvc.setScope($scope);
    if (defaultAccount !== null){
      $rootScope.activeUser = {
        username: defaultAccount.username,
        identity: defaultAccount.encryptedIdentity // identity will be decrypted if user has autologin on
      }
    }
    $scope.changeView = function(){
      $location.path('/register'); // path not hash
    };
    $scope.Search = function(searchterm){
      HomeSrvc.searchUser(searchterm, $scope);
    }
    $scope.Chat = function(username){
      HomeSrvc.chat(username);
    }
  };

  module.exports = ["$scope", "$location", "$rootScope", "HomeSrvc", "defaultAccount", HomeCtrl];
}());
