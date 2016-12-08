(function(){
  var LoginCtrl = function($scope, db){
    $scope.account = db.primaryAccount;
    $scope.localAccounts = db.accounts;
    $scope.setAccount = function(account){
      $scope.account = account;
    }
    $scope.isActive = function(username){
      return username === $scope.account.username;
    }
  }
  module.exports = ["$scope", "db", LoginCtrl];
}());