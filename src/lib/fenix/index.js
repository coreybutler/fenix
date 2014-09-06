var fs = require('fs'),
    path = require('path'),
    postal = require('postal'),
    DataStore = require('nedb');

// The configuration MUST be provided.
module.exports = function(gui,cfg){

  var FClass = cfg;

  // Define Properties
  Object.defineProperties(FClass,{
    // Basic configuration properties
    config: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: require(path.resolve(path.join('./','config.json')))
    },

    db: {
      enumerable: false,
      writable: false,
      configurable: false,
      value: {
        settings: new DataStore({filename:path.join(gui.App.dataPath,'data','settings.db'), autoload:true}),
        servers: new DataStore({filename:path.join(gui.App.dataPath,'data','servers.db'), autoload:true})
      }
    },

    gui: {
      enumerable: false,
      writable: false,
      configurable: false,
      value: gui
    },

    version: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: gui.App.manifest.version
    },

    bus: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: postal.channel()
    }
  });

  // Precollect data
  for (var db in FClass.db){

    Object.defineProperty(FClass,'_'+db,{
      enumerable: false,
      writable: true,
      configurable: false,
      value: []
    });

    Object.defineProperty(FClass,db,{
      enumerable: true,
      get: function(){
        return FClass['_'+db] || [];
      }
    });

    // Retrieve Data
    FClass.db[db].find({},function(err,docs){
      FClass['_'+db] = err === undefined || err === null ? docs : null;
    });
  }

  require('./methods')(FClass);

  return FClass;

};
