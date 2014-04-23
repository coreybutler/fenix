/**
 * @class Server
 * Represents a managed static server.
 * @extends Utility
 * @uses Syslog
 */
var Server = Utility.extend({

  constructor: function(config){
    config = config || {};

    Server.super.constructor.call(this,config);

    Object.defineProperties(this,{

      /**
       * @property {String} id
       * The ID of the Server.
       * @readonly
       */
      id: {
        enumerable: true,
        writable: true,
        configurable: false,
        value: config.id || null
      },

      /**
       * @cfg {String} name (required)
       * Descriptive name of the server.
       */
      name: {
        enumerable: true,
        writable: true,
        configurable: false,
        value: config.name
      },

      /**
       * @cfg {String} domain
       * The local domain name. Ex: `project.local`.
       */
      domain: {
        enumerable: true,
        writable: true,
        configurable: false,
        value: config.domain || null
      },

      /**
       * @cfg {Number} port
       * The port on which the server runs. If no port is defined,
       * an open port will be automatically selected.
       */
      port: {
        enumerable: true,
        writable: true,
        configurable: false,
        value: config.port
      },

      _url:{
        enumerable: false,
        writable: true,
        configurable: false,
        value: null
      },

      /**
       * @property {Tunnel} tunnel
       * The local tunnel connection.
       * @private
       */
      tunnel: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: null
      },

      /**
       * @property {String} [publicUrl=null]
       * When the server is shared over a local tunnel, this property is populated with the
       * public URLwhere the server can be accessed by other people. Returns `null` if
       * sharing is not enabled.
       * @readonly
       */
      publicUrl: {
        enumerable: false,
        get: function(){
          return this._url;
        }
      },

      /**
       * @property {Boolean} [shared=false]
       * Indicates the server is publicly shared via localtunnel.
       * @readonly
       */
      shared: {
        enumerable: false,
        get: function(){
          return this._url !== null;
        }
      },

      /**
       * @property {String} [screenshot=null]
       * The base64 version of the last image taken of the website.
       */
      _screenshot: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: null
      },
      screenshot: {
        enumerable: true,
        get: function(){
          return this._screenshot;
        },
        set: function(value){
          this._screenshot = value == null ? null : ((value||'').toString().trim().length > 0 ? value : null);
          if (value !== null && (value||'').toString().trim().length > 0){
            this.syslog.log('Screenshot captured.');
            this.emit('screencapture',this);
          }
        }
      },

      /**
       * @computer {String} computer
       * The MAC address of the computer in use.
       */
      computer: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: null
      },

      cfg_paths: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: config.path || {}
      },

      /**
       * @proeprty {Syslog} syslog
       * The system log.
       */
      syslog: {
        enumerable: false,
        configurable: false,
        writable: true,
        value: new Syslog()
      },

      /**
       * @cfg {Object} path (required)
       * The path or object representing a path to the directory containing the
       * static server assets.
       *
       * For example:
       *
       *     /path/to/website
       *
       * OR
       *
       *     {
       *       path: '/path/to/website',
       *       mac: 'e4:ce:8f:5b:a7:fc' // MAC address of the computer this path is relevant to.
       *     }
       */
      paths: {
        enumerable: false,
        writable: true,
        configurable:true,
        value: {}
      },

      /**
       * @property {String} path
       * The path used on the current computer.
       * @fires pathchange
       */
      path: {
        enumerable: true,
        get: function() {
          return this.paths[this.MAC] || '';
        },
        set: function(value){
          var ov = this.path, me = this;
          this.paths[this.MAC] = value;
          if (ov !== value){
            this.stop(function(){
              me.updateServer();
            });
          }
          /**
           * @event pathchange
           * Fired when the server directory changes.
           * hareends an argument like:
           *
           *     {
           *       "mac": "macaddress",
           *       "oldValue": "Old Path",
           *       "newValue": "New Path"
           *     }
           */
          this.emit('pathchange',{
            mac: this.MAC,
            oldValue: ov,
            newValue: value
          });
        }
      },

      /**
       * @property {Array} portConflicts
       * A list of other servers assigned to run on the same port as this one.
       */
      portConflicts: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: []
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
       * @property {Boolean} running
       * Indicates the server is running.
       */
      running:{
        enumerable: true,
        writable: true,
        configurable: false,
        value: false
      },

      /**
       * @property {Boolean} starting
       * Indicates the server is starting.
       */
      starting:{
        enumerable: true,
        writable: true,
        configurable: false,
        value: false
      },

      /**
       * @property {Boolean} stopping
       * Indicates the server is stopping.
       */
      stopping:{
        enumerable: true,
        writable: true,
        configurable: false,
        value: false
      },

      initialized:{
        enumerable: false,
        writable: true,
        configurable: false,
        value: false
      },

      _http: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: null
      },

      http: {
        enumerable: false,
        get: function(){
          if (this._http == null){
            this.updateServer();
          }
          return this._http;
        }
      },

      assistingstart: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: false
      },

      sockets: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: []
      },

      updateServer: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: function(){
          var me = this,
            send = require('send'),
            http = require('http'),
            marked = require('marked');

          marked.setOptions({
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            smartypants: false
          });

          var html = require('fs').readFileSync(require('path').join('lib','public','directory.html'));

          this._http = http.createServer(function(req,res){

            // Custom directory handling logic:
            function redirect() {
              me.syslog.log('Redirect to '+req.url+'/');
              res.statusCode = 301;
              res.setHeader('Location', req.url + '/');
              res.end('Redirecting to ' + req.url + '/');
            }

            function getXtn($extn){
              $extn = $extn.substr(0,1) === '.' ? $extn.substr(1,$extn.length-1) : $extn;
              switch ($extn.toLowerCase()){
                case "png": $extn="PNG Image"; break;
                case "jpg": $extn="JPEG Image"; break;
                case "svg": $extn="SVG Image"; break;
                case "gif": $extn="GIF Image"; break;
                case "ico": $extn="Windows Icon"; break;

                case "txt": $extn="Text File"; break;
                case "log": $extn="Log File"; break;
                case "htm": $extn="HTML File"; break;
                case "php": $extn="PHP Script"; break;
                case "js": $extn="Javascript"; break;
                case "css": $extn="Stylesheet"; break;
                case "pdf": $extn="PDF Document"; break;

                case "zip": $extn="ZIP Archive"; break;
                case "bak": $extn="Backup File"; break;

                default: $extn=$extn.toUpperCase()+" File"; break;
              }
              return $extn;
            };

            function procError(err){
              var p = require('path').dirname(err.message.match(/'(.*?)'/)[1]) || '',
                  bn = require('path').basename(err.message.match(/'(.*?)'/)[1]) || '';
              if (err.message.indexOf('ENOENT') >= 0 && bn === 'index.html'){
                var _d = "",_f = "";
                fs.readdir(p,function(_err,_files){
                  _d = _files.filter(function(el){return require('fs').statSync(require('path').join(p,el)).isDirectory();}).map(function(el){
                    var href = el+(require('fs').existsSync(require('path').join(p,'index.html'))?'/index.html':''),
                        stat = require('fs').statSync(require('path').join(p,el));
                    return  "<tr class='dir'>"
                          + "<td><a href='./"+href+"'>"+el+"</a></td>"
                          + "<td><a href='./"+href+"'>&lt;Directory&gt;</a></td>"
                          + "<td><a href='./"+href+"'>&lt;Directory&gt;</a></td>"
                          + "<td sorttable_customkey='"+stat.mtime.getTime()+"'><a href='./"+href+"'>"+stat.mtime+"</a></td>"
                          + "</tr>";
                  });
                  _f = _files.filter(function(el){return !require('fs').statSync(require('path').join(p,el)).isDirectory();}).map(function(el){
                    var href = './'+el,
                        $extn = require('path').extname(el),
                        stat = require('fs').statSync(require('path').join(p,el));
                    return  "<tr class='file'>"
                          + "<td><a href='./"+href+"'>"+el+"</a></td>"
                          + "<td><a href='./"+href+"'>"+getXtn($extn)+"</a></td>"
                          + "<td><a href='./"+href+"'>"+(stat.size/1024).toFixed(2)+" KB</a></td>"
                          + "<td sorttable_customkey='"+stat.mtime.getTime()+"'><a href='./"+href+"'>"+stat.mtime+"</a></td>"
                          + "</tr>";
                  });
                  res.statusCode = 200;
                  res.end(html.toString().replace('<!-- BODY -->',_d.join('')+_f.join('')));
                  return;
                });
              } else {
                if (req.url.indexOf('/fenixassets/') >= 0){
                  var pfile = require('path').resolve(require('path').join('lib',req.url.substr(req.url.indexOf('/fenixassets'),req.url.length).replace('fenixassets','public')));
                  var ext = require('path').extname(req.url).substr(1,require('path').extname(req.url).length-1);
                  if (ext === 'ico'){
                    try {
                      require('fs').readFile(require('path').resolve(require('path').join('lib',req.url.replace('fenixassets','icons'))),function(err,data){
                        res.statusCode = 200;
                        res.end(data);
                      });
                    } catch (e){
                      me.syslog.error('500 '+e.message);
                      res.statusCode = 500;
                      res.end(e.message);
                    }
                  } else if (require('path').basename(req.url).toLowerCase() === 'fenix.png') {
                    try {
                      require('fs').readFile(require('path').resolve(
                        require('path').join('lib',req.url.substr(req.url.indexOf('/fenixassets'),req.url.length).replace('fenixassets','icons'))),function(err,data){
                        res.setHeader('Content-Type','image/png');
                        res.statusCode = 200;
                        res.end(data);
                      });
                    } catch (e) {
                      me.syslog.error('500 '+e.message);
                      res.statusCode = 500;
                      res.end(e.message);
                    }
                  } else if (require('fs').existsSync(pfile)){
                    try {
                      require('fs').readFile(pfile,function(err,data){
                        if (['css','html','js','htm'].indexOf(ext) >= 0){
                          res.setHeader('Content-Type',(['css','html'].indexOf(ext) >= 0 ? 'text' : 'application')+'/'+(ext==='js'?'javascript':ext));
                        }
                        res.statusCode = 200;
                        res.end(data);
                      });
                    } catch(e) {
                      me.syslog.error('500 '+e.message);
                      res.statusCode = 500;
                      res.end(e.message);
                    }
                  } else {
                    me.syslog.error('404 '+req.url);
                    res.statusCode = 404;
                    res.end();
                  }
                  return;
                }
                me.syslog.error('('+(err.status||500).toString()+') '+err.message);
                res.statusCode = err.status || 500;
                res.end(err.message);
              }
            }

            // Special file handling
            function sendFile(path){
              if (!require('fs').existsSync(path)){
                alert(path+' DNE');
              }
              var type = require('path').extname(path).toLowerCase().replace('.','');
              me.syslog.log('Requested '+path);
              if (['json','xml'].indexOf(type)>=0){
                res.setHeader('Content-Type','application/'+type);
                res.setHeader('Transfer-Encoding','chunked');
                res.setHeader('Access-Control-Allow-Headers','Content-Type');
              } else if (['md','markdown'].indexOf(type)>=0){
                res.setHeader('Content-Type','text/html; charset=UTF-8');
                res.setHeader('Transfer-Encoding','chunked');
                res.setHeader('Access-Control-Allow-Headers','Content-Type');

                var cd = '<style>BODY{font-family:Arial,sans-serif;}</style>'+marked(require('fs').readFileSync(path).toString());

                res.setHeader('Content-Length',cd.length);
                me.syslog.log('Converted Markdown >> HTML');
                res.end(cd);
              }
            }

            var s = send(req, require('url').parse(req.url).pathname)
              .from(me.path)
              .on('error', procError)
              .on('directory', redirect)
              .on('file', sendFile)
              .pipe(res);
          });

          // Track all connections
          this.http.on('connection',function(socket){
            me.sockets.push(socket);
            socket.setTimeout(4000);
            socket.on('close',function(){
              me.sockets.splice(me.sockets.indexOf(socket), 1);
            });
          });

          // Capture problems
          this.http.on('error',function(e){
            me.starting = !me.running ? false : me.starting;
            if (e.code === 'EACCES'){
              /**
               * @event startfailure
               * Fired when the server fails to start.
               */
              me.emit('startfailure',e.code);
            } else {
              throw e;
            }
          });
        }
      },

      /**
       * @property {Boolean} [suppressnotices=false]
       * Suppress notices (i.e. growl).
       */
      suppressed:{
        enumerable: false,
        writable: true,
        configurable: false,
        value: false
      },

      suppressnotices:{
        enumerable: true,
        get: function(){
          return this.suppressed;
        },
        set: function(val){
          this.suppressed = typeof val === 'boolean' ? val : (val === 'true' ? true : false);
        }
      }
    });

    var me = this;

    // Get the computer's MAC address
    require('getmac').getMac(function(err,addr){
      if (err)  throw err;
      me.MAC = addr;
      me.computer = addr;
      me.monitor();

      if (me.cfg_paths){
        me.paths[me.MAC] = me.cfg_paths;
      }

      me.initialized = true;
      me.emit('initialized');
    });

    this.on('error',function(e){
      me.syslog.error(e.message||'Unknown Error');
    });

  },

  /**
   * @method share
   * Share the server publicly. Does nothing if the server is already shared.
   * When the server is shared, #shared and #publicUrl are populated.
   * @fires share
   */
  share: function(){
    if (this.shared || this.sharing){
      return;
    }

    var me = this;
    this.sharing = true;

    setTimeout(function(){
      if (me.shared || lt !== undefined){
        return;
      }
      me.autoRestartTunnel = false;
      me.sharing = false;
      me.shared = false;
      if (me.tunnel !== null){
        me.tunnel = null;
      }
      /**
       * @event timeout
       * Fired when sharing cannot be established in a reasonable amount of time.
       */
      me.emit('timeout');
    },5000);

    var localtunnel = require('localtunnel');
    var lt = localtunnel(this.port,function(err,tunnel){
      me.tunnel = tunnel;
      me._url = tunnel.url;
      me.shared = true;
      me.sharing = false;

      /**
       * @event share
       * Fired when the localtunnel is established or re-established. Provides the
       * server instance as a handler argument.
       */
      me.emit('share',me);

      tunnel.once('close',function(){
        setTimeout(function(){
          me._url = null;
          me.shared = false;
          me.sharing = false;

          /**
           * @event unshare
           * Fired when the localtunnel is dropped. Provides the server instance
           * as a handler argument.
           */
          me.emit('unshare',me);

          me.syslog.warn('Stopped sharing server publicly.');
        },500);
      });

      tunnel.on('error',function(err,tunnel){
        me.emit('error',err);
      });
    });

  },

  /**
   * @method unshare
   * Stop sharing the server publicly.
   */
  unshare: function(cb){
    if (!this.shared){
      cb && cb();
      return;
    }

    if (cb){
      this.tunnel.once('close',function(){
        setTimeout(function(){
          cb && cb();
        },500);
      });
    }
    this.tunnel.close();
  },

  /**
   * @method captureScreen
   * Takes a a screenshot of the running web server (localhost:port).
   * Populates the #screenshot property.
   * @param {Number} [width=600]
   * Width of the screen.
   * @param {Number} [height=600]
   * Height of the screen. Defaults to the width if no value is supplied.
   * @param {Function} callback
   * Callback fired when the screen capture is complete.
   * @fires screencapture
   */
  captureScreen: function(w,h,cb){
    var gui = require('nw.gui'), me = this;

    if (typeof w === 'function'){
      cb = w;
      w = 1024;
      h = w;
    } else if (typeof h == 'function'){
      cb = h;
      h = w;
    }

    if (!this.running){
      cb()
      return;
    }

    var screenie = gui.Window.open('http://127.0.0.1:'+this.port.toString(),{
      width: w,
      height: h,
      show: false,
      toolbar: false
    });

    setTimeout(function(){
      screenie.capturePage(function(b64){
        me.screenshot = b64;
        screenie.close();
        cb && cb();
      },{format:'png',datatype:'raw'});
    },4500);

  },

  /**
   * @method monitor
   * Watch for directory changes.
   */
  monitor: function(){
    var watch = require('watch'), me = this;
    watch.createMonitor(require('path').resolve(this.path),function(monitor){
      monitor.on("created", function (filename, stat) {
        if (!me.running)
          return; // Ignore if the server isn't running
        /**
         * @event filecreated
         * Fired when a new file is created in the server directory (recursive)
         */
        me.emit('filecreated',{filename:filename,server:me});
        me.syslog.log((filename+' created.'));
      });
      monitor.on("changed", function (filename, curr, prev) {
        if (!me.running)
          return; // Ignore if the server isn't running
        /**
         * @event fileupdated
         * Fired when a file is modified somewhere in the server directory (recursive)
         */
        me.emit('filechanged',{filename:filename,server:me});
        me.syslog.warn((filename+' modified.'));
      });
      monitor.on("removed", function (filename, stat) {
        if (!me.running)
          return; // Ignore if the server isn't running
        /**
         * @event fileremoved
         * Fired when a file is removed from the server directory (recursive)
         */
        me.emit('fileremoved',{filename:filename,server:me});
        me.syslog.log((filename+' removed.'));
      });
    });
  },

  /**
   * @method start
   * Start the server.
   * @param {Function} [callback]
   * A callback function to execute when the server is started.
   * @fires start
   * @fires startfailure
   */
  start: function(cb){
    var me = this;
    if (this.starting){
      return;
    }
    if (this.running){
      cb && cb();
      return;
    }
    this.starting = true;
    this.http.listen(this.port,function(){
      me.running = true;
      me.starting = false;
      /**
       * @event start
       * Fired when the server is started. Sends the Server objects as a handler argument.
       */
      me.emit('start',me);
      me.syslog.log('Server started on port '+me.port.toString()+'.');
      cb && cb();
    });
  },

  /**
   * @method closeAllSockets
   * Forcibly clears all of the open connections the server may have.
   * @private
   */
  closeAllSockets: function(){
    this.sockets.forEach(function(socket){
      socket.destroy();
    });
  },

  /**
   * @method stop
   * @param {Function} [callback]
   * A callback function to execute when the server has stopped.
   * @fires stop
   */
  stop: function(cb){
    var me = this;
    this.starting = false;
    if (!this.running){
      me.emit('stop',me);
      cb && cb();
      return;
    }
    this.stopping = true;
    if (this.shared){
      var to = setTimeout(function(){
        throw new Error('Server timed out while unsharing.');
      },3000);
      this.once('unshare',function(){
        clearTimeout(to);
        me.http.once('close',function(){
          me.running = false;
          me.stopping = false;
          /**
           * @event stop
           * Fired when the server is stopped. Sends the Server objects as a handler argument.
           */
          me.emit('stop',me);
          me.syslog.log('Server stopped on port '+me.port.toString()+'.');
          cb && cb();
        });
        me.http.close();
        me.closeAllSockets(); // Force sockets to close.
      });
      this.unshare();
    } else if (this.running){
      try {
        this.http.once('close',function(){
          me.running = false;
          me.stopping = false;
          me.emit('stop',me);
          me.syslog.log('Server stopped on port '+me.port.toString()+'.');
          cb && cb();
        });
        this.http.close();
        this.closeAllSockets();
      } catch(e) {
        console.dir(e);
        if (e.message.toLowerCase().indexOf('not running') >= 0){
          cb && cb();
        } else {
          throw e;
        }
      }
    } else {
      this.emit('stop',this);
      cb && cb();
    }
  }
});
