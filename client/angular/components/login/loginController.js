(function(){
  var LoginCtrl = function($scope, db, $location, $rootScope){

    $scope.account = db.primaryAccount;
    $scope.localAccounts = db.accounts;

    $scope.setAccount = function(account){
      $scope.account = account;
    }
    $scope.isActive = function(username){
      return username === $scope.account.username;
    }
    $scope.Login = function(password){
      var _password = password; // copy the password just in case
      decipher = crypto.createDecipher('aes192', _password);
      console.log("Encrypted identity");
      console.log($scope.account.encryptedIdentity.data);
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
