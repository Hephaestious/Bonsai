(function(){
  var LoginCtrl = function($scope, db, $location, $rootScope){
    var defaul = db.getDefault();
    if (defaul !== null){
      $rootScope.activeUser = {
        username: defaul.username,
        identity: defaul.encryptedIdentity // won't actually be encrypted
      }
      $location.path('/home');
    }
    $scope.account = db.primaryAccount;
    $scope.localAccounts = db.accounts;

    $scope.setAccount = function(account){
      $scope.account = account;
    }
    $scope.isActive = function(username){
      return username === $scope.account.username;
    }
    $scope.Login = function(){
      console.log($scope.password)
      var _password = new Buffer($scope.password); // copy the password
      decipher = crypto.createDecipher('aes192', _password); // Create decipher
      var decrypted = new Buffer(decipher.update(new Buffer($scope.account.encryptedIdentity.data)));
      decrypted = Buffer.concat([decrypted, new Buffer(decipher.final())]);
      console.log("Decrypted secret key");
      console.log(decrypted);
      if (decrypted !== null && decrypted.length === nacl.sign.secretKeyLength){
        var identity = nacl.sign.keyPair.fromSecretKey(new Buffer(decrypted));
        if (identity !== null){
          $rootScope.activeUser = {
            username: $scope.account.username,
            identity: identity
          }
          if ($scope.remember){
            db.setDefault($scope.account, identity);
          }
          $location.path('/home');
        }
        else {console.log(decrypted);console.log("failed to decrypt identity key")}
      }
      else {
        console.log("bad key");
        console.log(decrypted);
        console.log(decrypted.length);
      }
    }
  }
  module.exports = ["$scope", "db", "$location", "$rootScope", LoginCtrl];
}());
