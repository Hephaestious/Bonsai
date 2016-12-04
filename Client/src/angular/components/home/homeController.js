(function(){
  'use strict';
  var HomeCtrl = function($scope, $http){

    $scope.username = "fuck the nsa";
    $scope.password = "motherfucker";
    $scope.showCreate = true;


    $scope.Create = function(){
      var Username = $scope.username;
      if (Username === null){
        alert("fucking retard, you didn't give a username (and I put one in for you)");
      }
      // Generate keys
      var Identity = nacl.sign.keyPair(); // Long term
      var pvt_Identity = Identity.secretKey;
      var pub_Identity = Identity.publicKey;
      var Session = nacl.box.keyPair(); // Ephemeral (this request only)
      var pvt_Session = Session.secretKey;
      var pub_Session = Session.publicKey;
      var ui8_Username = new Uint8Array($scope.username); // Encode username to Uint8Array
      var sig_Username = nacl.sign(ui8_Username, pvt_Identity); // Sign username with identity key
      // Encrypt metadata
      var Registration = {
        username: $scope.username,
        identity_key: b64.encode(pub_Identity),
        signature: b64.encode(sig_Username)
      }
      var json_Registration = JSON.stringify(Registration); // Convert reg object to json
      var b64_Registration = b64.encode(json_Registration);
      var buf_Registration = new Buffer(b64_Registration);
      var ui8_Registration = new Uint8Array(buf_Registration); // Encode json to Uint8Array
      var nonce = nacl.randomBytes(nacl.box.nonceLength);
      var enc_Registration = nacl.box(ui8_Registration, nonce, pub_ServerID, pvt_Session); // Encrypt public key for identity with ephemeral key.
      var data = {
        // Probably should obfuscate this in production
        cipher: b64.encode(enc_Registration),
        session_key: b64.encode(pub_Session),
        nonce: b64.encode(nonce)
      };
      console.log("Box: ", {
        cipher: enc_Registration,
        session_key: pub_Session,
        nonce: nonce
      });
      var url = 'http://localhost:8080/api/register';
      $http.post(url, data)
      .success(function() {
        console.log('success');
      })
      .error(function() {
        console.log('error');
      });
    };
  };

  module.exports = ["$scope", "$http", HomeCtrl];
}());
