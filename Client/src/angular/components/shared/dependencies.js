var nacl = require('tweetnacl');
var socket = require('socket.io-client')('http://localhost:3000');
// Marshals a string to Uint8Array.
var b64 = require('js-base64').Base64;
var fs = require('fs');
var pub_ServerID = new Uint8Array(fs.readFileSync('./angular/components/shared/ServerCertificate.crt'));
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}
