(function(){
  console.log('importing db provider');

  function dbProvider(){
    var accounts, _db;
    function loadHandler(){
      accounts = _db.getCollection('accounts') || _db.addCollection('accounts',{autoupdate: true});
        console.log(accounts.count());
    };
    var load = new Promise( // returns 1 if there are any accounts, 0 if not  accounts.count() > 0
      function(resolve, reject){
        function loadHandler(){
          accounts = _db.getCollection('accounts') || _db.addCollection('accounts',{autoupdate: true});
          resolve(accounts.count() > 0);
        }
        try{
          _db = new loki(path.resolve('bonsai-client.db'), {autosave: true, autosaveInterval: 1500, autoload: true, autoloadCallback: loadHandler});
        }
        catch(err) {
          reject();
        }
      }
    );
    var dbService = require('./db');
    this.$get = function dbFactory(){
      return new dbService(_db, accounts);
    };
    return {
      load: load,
      $get: this.$get
    }
  }
  module.exports = [dbProvider];
}());
