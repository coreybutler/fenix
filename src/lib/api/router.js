/**
 * @class Router
 * The primary router.
 * @singleton
 * @extends Utility
 * @uses Server
 */
var Router = Utility.extend({

  constructor: function(config){
    config = config || {};

    Router.super.constructor.call(this,config);

    Object.defineProperties(this,{

      /**
       * @property {Object} proxy
       * The proxy server object.
       * @private
       * @readonly
       */
      proxy: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: null
      },

      /**
       * @property {Boolean} running
       * Indicates whether the proxy server is running.
       */
      running: {
        enumerable: true,
        writable: true,
        configurable: false,
        value: false
      },

      /**
       * @property {Boolean} loading
       * Indicates the router is loading servers.
       */
      loading: {
        enumerable: true,
        writable: true,
        configurable: false,
        value: false
      },

      /**
       * @property {Object} domainmap
       * A mappping of the domain names to ports.
       *
       *     {
       *       'mydomain.com': '127.0.0.1:8080',
       *       'otherdomain.com': '127.0.0.1:8181'
       *     }
       * @readonly
       * @private
       */
      domainmap: {
        enumerable: false,
        get: function(){
          var rt = {}, me=this;
          Object.keys(this.servers||{}).forEach(function(serverid){
            if ((me.servers[serverid].domain||'').trim().length > 0){
              rt[me.servers[serverid].domain] = '127.0.0.1:'+me.servers[serverid].port.toString();
            }
          });
          return rt;
        }
      },

      /**
       * @property {Object} servers
       * Contains the servers managed by this instance of Fenix.
       * @private
       */
      servers: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: {}
      },

      /**
       * @property {Object} paths
       * An object containing all of the paths used by the managed servers.
       * @private
       */
      paths: {
        enumerable: false,
        get: function(){
          var paths = {}, me = this;
          Object.keys(this.servers||{}).forEach(function(serverid){
            Object.defineProperty(paths,me.servers[serverid].path,{
              enumerable: false,
              get: function(){
                return me.servers[serverid];
              }
            });
          });
          return paths;
        }
      },

      /**
       * @property {Object} ports
       * The object consists of keys made up of the ports in use. The value of each key
       * is the server it is associated with.
       */
      ports: {
        enumerable: false,
        get: function(){
          var ports = {}, me = this;
          Object.keys(this.servers||{}).forEach(function(serverid){
            Object.defineProperty(ports,me.servers[serverid].port,{
              enumerable: false,
              get: function(){
                return me.servers[serverid];
              }
            });
          });
          return ports;
        }
      },

      /**
       * @property serverstore
       * The absolute path of the location/file where servers are persisted.
       * @private
       */
      serverstore: {
        enumerable: false,
        get: function(){
          var p = require('path');
          switch (process.platform.toLowerCase()) {
            case 'win32': return p.join(process.env.APPDATA,'Fenix','servers.fnx');
            case 'darwin': return '/Users/Shared/Fenix.localized/servers.fnx';
            default: return p.resolve(p.join('./','servers.fnx'));
          }
        }
      },

      /**
       * @property {String} MAC
       * The MAC address of the computer running the router.
       */
      MAC: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: null
      },

      /**
       * @property {Object} portscanner
       * A port scanner used for introspective assesment of the servers.
       * @protected
       */
      portscanner: {
        enumerable: false,
        get: function(){
          return require('portscanner');
        }
      },

      _socket:{
        enumerable: false,
        writable: true,
        configurable: false,
        value: null
      },

      /**
       * @property {net.Socket} socket
       * The socket server that enables CLI & other remote tools.
       * @protected
       */
      socket: {
        enumerable: false,
        get: function(){
          if (this._socket == null){
            var net = require('net'), me = this;
            this._socket = net.createServer(function(conn){
            conn.on('connection',function(socket){
              socket.on('connect',function(){
                console.log(socket.address());
                me.emit('socketconnect');
              });
            });
            conn.on('close',function(){
              me.emit('socketclose');
            });
          });
          }
          return this._socket;
        }
      }

    });

    var me = this;

    // Get the computer's MAC address
    require('getmac').getMac(function(err,addr){
      if (err) throw err;
      me.MAC = addr;
      me.computer = addr;
    });

    // Boot up the socket server
    this.socket.listen(336490,function(){
      me.emit('socketready');
    });
  },

  /**
   * @method getServer
   * Return the Server instance for the provided Server#id. Returns `null` if no server is found
   * for the specified ID.
   * @param {String} serverid
   * The ID of the Server to return.
   * @returns {Server}
   */
  getServer: function(serverid){
    return this.servers[serverid] || null;
  },

  /**
   * @method createServer
   * Create a new server
   * @param {Object} serverConfiguration
   * Provide a server configuration.
   * @fires createserver
   */
  createServer: function(config){
    config = config || {};
    config.id = require('crypto').createHash('md5').update(config.path+(config.port||80).toString()).digest('hex');//this.generateUUID();
    this.servers[config.id] = new Server(config);
    this.save();
    /**
     * @event createserver
     * Fired when a new server is created.
     * @param {Server} server
     * The Server that was added to the router.
     */
    this.emit('createserver',this.servers[config.id]);
    return this.servers[config.id];
  },

  /**
   * @method deleteServer
   * Remove a specific server.
   * @fires deleteserver
   */
  deleteServer: function(id){
    var me = this;
    if(!this.servers.hasOwnProperty(id)){
      throw new Error('Server '+id+' does not exist or could not be found.');
      return;
    }
    this.servers[id].on('stop',function(){
      var s = me.servers[id];
      delete me.servers[id];
      me.save();
      /**
       * @event deleteserver
       * Fired when a server is removed from the router.
       * @param {Server} server
       * The server object that was removed.
       */
      me.emit('deleteserver', s);
    });
    this.servers[id].stop();
  },

  /**
   * @method startAllWebServers
   * Start all of the servers.
   */
  startAllWebServers: function(){
    var me = this;
    Object.keys(this.servers||{}).forEach(function(id){
      !me.servers[id].running && me.servers[id].start();
    });
  },

  /**
   * @method stopAllWebServers
   * Stop all of the servers.
   */
  stopAllWebServers: function(){
    var me = this;
    Object.keys(this.servers||{}).forEach(function(id){
      me.servers[id].running && me.servers[id].stop();
    });
  },

  /**
   * @method getAvailablePort
   * Returns the first available unused port. If no port range is specified, a port between 80-10000 will be returned.
   * This method will not return a port that is registered for use by one of the servers this router manage, regardless
   * of whether the server is running or not (it just needs to be registered with the router).
   * @param {Function} callback (required)
   * The callback to execute when a port is found.
   * @param {Number} callback.port
   * The first available port returned from this operation. This will be `-1` of no available port is available.
   * @param {Number} [minPort=80]
   * The lower bound of the port range to find an available port in.
   * @param {Number} [maxPort=10000]
   * The upper bound of the port range to find an available port in.
   */
  getAvailablePort: function(callback,min,max){
    if (typeof callback !== 'function'){
      throw new Error('getAvailablePort must be given a callback method.');
    }
    var me = this;
    min = min || 80;
    max = max || 10000;
    this.portscanner.basePort = min;
    this.portscanner.findAPortNotInUse(min,max,'localhost',function(err,p){
      if (err){
        callback(-1);
        console.error(err.message);
        return;
      }
      if (me.ports.hasOwnProperty(p)){
        me.getAvailablePort(callback,(p+1),max);
      } else {
        callback(p);
      }
    });
  },

  /**
   * @method start
   * Start the routing service on the specified port (defaults to 80).
   * @param {Number} [port=80]
   * The port to run the proxy server on.
   * @param {Function} [callback]
   * Run this after the router is started.
   * @fires startproxy
   */
  start: function(port,cb){

    port = port || 80;

    if (typeof port === 'function'){
      cb = port;
      port = 80;
    }

    var httpProxy = require('http-proxy');

    this.proxy = httpProxy.createServer({
      hostnameOnly: true,
      router: this.domainmap
    });

    this.proxy.listen(port,function(){
      me.emit('startproxy',this.proxy);
      cb && cb();
    });
  },

  /**
   * @method stop
   * Stop the proxy server.
   * @param {Function} [callback]
   * Fired when the proxy server is stopped.
   * @fires stopproxy
   */
  stop: function(cb){
    this.proxy.close();
    this.emit('stopproxy');
    cb && cb();
  },

  /**
   * @method restart
   * Restart the proxy server.
   * @param {Function} callback
   * Executed when the restart is complete.
   */
  restart: function(cb){
    var me = this;
    this.stop(function(){
      me.start(function(){
        cb && cb();
      });
    });
  },

  /**
   * @method save
   * Save the servers to the `servers.json` file.
   */
  save: function() {
    var me = this;
    var data = [];
    Object.keys(this.servers).forEach(function(server){
      var d = me.servers[server].json;
      d.path = me.servers[server].path;
      d.running = me.servers[server].running;
      delete d.cfg_paths;
      delete d.screenshot;
      delete d.suppressnotices;
      d.port = parseInt(d.port);
      data.push(d);
    });
    var _p = require('path').dirname(this.serverstore), fs = require('fs'), pth = require('path');
    if (!fs.existsSync(pth.resolve(_p))){
      fs.mkdirSync(pth.resolve(_p));
    }
    fs.writeFileSync(pth.join(_p,'servers.fnx'),JSON.stringify(data,null,2));
  },

  /**
   * @method load
   * Load the saved state of servers.
   */
  load: function(){
    var me = this;
    this.loading = true;
    try {
      if (require('fs').existsSync(this.serverstore)){
        var svrs = JSON.parse(require('fs').readFileSync(this.serverstore));
        svrs.forEach(function(server){
          me.servers[server.id] = new Server({
            name: server.name,
            domain: server.domain,
            port: server.port,
            path: server.path,
            id: server.id
          });
          if (server.running){
            me.servers[server.id].start();
          }
          /**
           * @event loadserver
           * Fired when a server is loaded from disk.
           */
          me.emit('loadserver',me.servers[server.id]);
        });
      }
    } catch (e) {
      alert(e.message);
    }
    this.loading = false;
    /**
     * @event loadcomplete
     * Fired when the load process is complete.
     */
    this.emit('loadcomplete');
  }

});
