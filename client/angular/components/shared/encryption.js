(function(){
  var nacl = require('tweetnacl');

  function naclEncode(arr){
    return Buffer.from(arr);
  }

  function naclEncode(obj){
    return Buffer.from(JSON.stringify(obj));
  }

  function naclDecode(s){
    return JSON.parse(s);
  }

}())
