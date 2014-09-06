// Configure the Express server
var express = require('express'),
    localtunnel = require('localtunnel'),
    request = require('request'),
    app = express();

//app.use(express.json());
app.use(express.urlencoded());
app.use(function(req, res, next) {
  req.setEncoding('utf8');
  var data='';
  req.setEncoding('utf8');
  req.on('data', function(chunk) {
     data += chunk;
  });

  req.on('end', function() {
      req.body = data;
      next();
  });
});

/**
 * @class RequestBin
 * The primary router.
 * @singleton
 * @extends Utility
 * @uses Server
 */
var RequestBin = Utility.extend({

  constructor: function(config){
    config = config || {};

    RequestBin.super.constructor.call(this,config);

    Object.defineProperties(this,{

      /**
       * @property {Boolean} running
       * Indicates whether the proxy server is running.
       * @readonly
       */
      running: {
        enumerable: true,
        writable: true,
        configurable: false,
        value: false
      },

      /**
       * @property {String} MAC
       * The MAC address of the computer running the request bin.
       * @readonly
       */
      MAC: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: null
      },

      /**
       * @cfg {Number} [port=56789]
       * The port on which the request bin should be listening.
       * @private
       */
      port: {
        enumerable: false,
        writable: false,
        configurable: false,
        value: config.port || 56789
      },

      /**
       * @property {Object} app
       * The Express app used for receiving requests.
       * @private
       * @readonly
       */
      app: {
        enumerable: false,
        writable: false,
        configurable: false,
        value: app
      },

      /**
       * @property {String} subdomain
       * The requested subdomain on all localtunnel calls.
       * @private
       */
      _subdomain: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: config.subdomain || null
      },

      subdomain: {
        enumerable: false,
        get: function(){
          if (this._subdomain === null) {
            this._subdomain = require('crypto')
              .createHash('sha1', this.MAC)
              .update(this.MAC)
              .digest('hex').substr(0,8);
          }
          return this._subdomain;
        }
      },

      /**
       * @property {String} publicUrl
       * The public URL assigned by localtunnel.
       * @private
       * @readonly
       */
      publicUrl: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: null
      },

      /**
       * @property {Object} tunnel
       * The localtunnel object.
       * @private
       * @readonly
       */
      tunnel: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: null
      },

      /**
       * @property {Object} tunnelmonitor
       * An interval that monitors the public tunnel.
       * @private
       * @readonly
       */
      tunnelmonitor:{
        enumerable: false,
        writable: true,
        configurable: false,
        value: {
          monitoring: false
        }
      },

      /**
       * @property {Boolean} autoRestartTunnel
       * Automatically restarts the sharing if the public connection is lost.
       * @readonly
       * @private
       */
      autoRestartTunnel: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: true
      },

      /**
       * @property {Object} requests
       * The last 100 requests (by timestamp) that have been logged.
       * @readonly
       */
      requests: {
        enumerable: true,
        writable: true,
        configurable: true,
        value: {}
      },

      /**
       * @property {Boolean} connecting
       * Indicates the request bin is attempting to establish a #tunnel.
       * @readonly
       */
      connecting: {
        enumerable: true,
        writable: true,
        configurable: false,
        value: false
      },

      /**
       * @property {Boolean} shared
       * Indicates whether the bin is shared publicly or not.
       * @private
       */
      shared: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: false
      }

    });

    var me = this;

    // Get the computer's MAC address
    require('getmac').getMac(function(err,addr){
      if (err) throw err;
      me.MAC = addr;
      me.computer = addr;

      // Handle all requests
      me.app.head('/ping_fenix',function(req,res){
        res.send(200);
        return;
      });
      me.app.all('/*',function(req,res){
        if(req.url !== '/fenix_ping'){
          me.addRequest({
            method: req.method,
            headers: req.headers,
            body: req.body.replace(/\</gi,'&lt;').replace(/\>/gi,'&gt;'),
            query: req.query,
            url: req.url,
            source: req.ip
          });
        }
        res.send(200);
      });

      /**
       * @event ready
       * Fired when the RequestBrowser is initialized.
       */
      me.emit('ready');
    });
  },

  /**
   * @method start
   * Start the routing service on the specified port (defaults to 80).
   * @param {Function} [callback]
   * Fired when the server is started.
   * @fires start
   * @fires share
   */
  start: function(cb){
    var me = this;

    // Start the server
    app.listen(this.port,function(){
      me.running = true;

      /**
       * @event start
       * Fired when the server is started locally.
       */
      me.emit('start',me.port);

      // Start listening on localtunnel
      cb && cb();
    });

  },

  /**
   * @method stop
   * Stop the proxy server.
   * @param {Function} [callback]
   * Fired when the server is stopped.
   * @fires stop
   * @fires unshare
   */
  stop: function(cb){
    var me = this;

    this.app.once('close',function(){
      cb && cb();
    });

    if (this.shared){
      this.unshare(function(){
        me.app.close();
      });
    } else {
      this.app.close();
    }
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
   * @method pingtunnel
   * Ping the tunnel service.
   * @private
   */
  pingtunnel: function(){
    if (!this.shared){
      clearInterval(me.tunnelmonitor.interval);
      return;
    }
    console.log('Checking '+this.publicUrl+' at '+(new Date()).toLocaleTimeString());
    var me = this;
    request.head(me.publicUrl+'/ping_fenix',{
      headers:{
        'user-agent':'fenix'
      }
    },function(err,res,body){
      if (err){
        me.tunnel.emit('error',err);
        return;
      }
      switch (parseInt(res.statusCode)){
        case 504:
          me.tunnel.emit('error',new Error('The localtunnel service timed out.'));
          return;
        case 200:
          return;
        default:
          me.tunnel.emit('error',new Error('Unknown error with localtunnel. Status code: '+res.statusCode.toString()));
          return;
      }
    });
  },

  /**
   * @method share
   * Start the localtunnel connection. This makes the request bin publicly accessible.
   * @param {Function} callback
   * Executed when the restart is complete.
   * @fires connecting
   */
  share: function(cb){
    var me = this;

    this.connecting = true;
    setTimeout(function(){
      if (me.shared || lt !== undefined){
        return;
      }
      me.autoRestartTunnel = false;
      me.connecting = false;
      if (me.tunnel !== null){
        me.tunnel = null;
      }
      /**
       * @event timeout
       * Fired when sharing cannot be established in a reasonable amount of time.
       */
      me.emit('timeout');
    },5000);
    /**
     * @event connecting
     * Fired when a localtunnel connection is initiated.
     */
    this.emit('connecting');
    var lt = localtunnel(me.port,{subdomain:me.subdomain},function(err, tunnel){

      if (err) {
        me.emit('error',err);
        console.log(err);
        cb && cb(err);
        return;
      }

      // Autorestart on close
      tunnel.on('close', function(){
        clearInterval(me.tunnelmonitor.interval);
        me.publicUrl = null;
        me.shared = false;
        /**
         * @event unshare
         * Fired when the server stops sharing publicly.
         */
        me.emit('unshare');
        if (me.autoRestartTunnel){
          me.start();
        }
      });

      tunnel.on('error',function(e){
        clearInterval(me.tunnelmonitor.interval);
        me.emit('error',e);
      });

      me.publicUrl = tunnel.url;
      me.shared = true;
      me.tunnel = tunnel;
      me.connecting = false;

      // Monitor the connection with public requests every 2 minutes
      me.tunnelmonitor.interval = setInterval(function(){
        me.pingtunnel();
      },60*1000);
      me.pingtunnel();

      /**
       * @event share
       * Fired when the server is started and available publicly.
       */
      me.emit('share',tunnel.url);
      cb && cb();
    });
  },

  /**
   * @method unshare
   * Stop the localtunnel connection. This does not stop the web server, so
   * requests can still be captured on localhost.
   * @param {Function} callback
   * Executed when the restart is complete.
   */
  unshare: function(cb){
    var me = this, ars = this.autoRestartTunnel;
    this.autoRestartTunnel = false;

    this.tunnel.once('close',function(){
      me.autoRestartTunnel = ars;
      setTimeout(function(){
        cb && cb();
      },500);
    });

    this.tunnel.close();
  },

  /**
   * @method getRequestDetails
   * Return an object containing the details of the request.
   */
  getRequestDetails: function(dt){
    return this.requests[dt] || null;
  },

  /**
   * @method addRequest
   * Add a request to the queue
   */
  addRequest: function(req){
    var timestamp = (new Date()).toJSON();

    this.requests[timestamp] = req;

    req.timestamp = timestamp;

    /**
     * @event request
     * Fires when a request is received. Sends the request as an argument to the event handler.
     */
    this.emit('request',req);
  }

});
