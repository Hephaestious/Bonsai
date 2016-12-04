(function(){
  'use strict';
  var RgstrCtrl = function($scope){

    $scope.username = "fuck the nsa";
    $scope.password = "motherfucker";
    $scope.showCreate = true;


    $scope.Create = function(){
      if ($scope.username === null){
        alert("fucking retard, you didn't give a username (and I put one in for you)");
      }
      var Identity = nacl.sign.keyPair(); // Long term identity keypair
      var session = nacl.box.keyPair(); // Ephemeral keypair to hide metadata (used for this request only)
      var username = new Buffer($scope.username, 'utf8'); // Convert username to buffer
      var usernameSignature = nacl.sign.detached(username, Identity.secretKey); // Sign username with identity key
      var identity_key = new Buffer(Identity.publicKey);
      var signature = new Buffer(usernameSignature);
      var data = Buffer.concat([identity_key, signature, username]); // I do this instead of json so I don't have to convert back to byte arrays
      var nonce = nacl.randomBytes(nacl.box.nonceLength); // Generate random nonce
      var encryptedData = nacl.box(data, nonce, pub_ServerID, session.secretKey); // Encrypt public key for identity with ephemeral key.
      var request = {
        // Probably should obfuscate this in production
        cipher: new Buffer(encryptedData),
        session_key: new Buffer(session.publicKey),
        nonce: new Buffer(nonce)
      };
      socket.emit('register', request, callback);
      console.log("Sent Registration");
    };

    function callback(response){
      if (response.status === 'success'){
        console.log('success! user id: '+response.id);
      }
      console.log(response);
    }

  };

  module.exports = ["$scope", RgstrCtrl];
}());
