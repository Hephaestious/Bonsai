(function(){
  'use strict';
  var HomeCtrl = function($scope, $location, $rootScope, defaultAccount){
    if (defaultAccount !== null){
      $rootScope.activeUser = {
        username: defaultAccount.username,
        identity: defaultAccount.encryptedIdentity // identity will be decrypted if user has autologin on
      }
    }
    $scope.changeView = function(){
      $location.path('/register'); // path not hash
    };
  };

  module.exports = ["$scope", "$location", "$rootScope", "defaultAccount", HomeCtrl];
}());
