(function(){
  var homeService = function(db){
    var _scope;
    function setScope(scope){
      _scope = scope;
    }
    function searchUser(term){
      socket.emit('searchUser', term);
    }
    socket.on('searchUser-result', function(users){
      _scope.searchUsersResults = users;
      _scope.$apply();
    })
    function chat(username){
      socket.emit('chat', username);
    }
    socket.on('chat-response', function(response){
      if (response === null){
        console.log('failed to make chat');
      }
      var newKey = nacl.box.keyPair();
      var theirID = naclDecode(response.identity);
      var sig = naclDecode(response.pre_key.signature);
      var theirKey = naclDecode(response.pre_key.publicKey);
      if (nacl.sign.detached.verify(theirKey, sig, theirID)){
        console.log('verified!!!');
      }
      else{
        console.log('fucljadasd')
      }
    })
    return{
      setScope: setScope,
      searchUser: searchUser,
      chat: chat
    }
  }
  module.exports = ['db', homeService]
}());
