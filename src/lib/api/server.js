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
			 * 		/path/to/website
			 * 
			 * OR
			 * 
			 * 		{
			 * 			path: '/path/to/website',
			 * 			mac: 'e4:ce:8f:5b:a7:fc' // MAC address of the computer this path is relevant to.
			 * 		}
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
					 * 		{
					 * 			"mac": "macaddress",
					 * 			"oldValue": "Old Path",
					 * 			"newValue": "New Path"
					 * 		}
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
					
					this._http = http.createServer(function(req,res){
						
						// Custom directory handling logic:
						function redirect() {
							me.syslog.info('Redirect to '+req.url);
							res.statusCode = 301;
							res.setHeader('Location', req.url + '/');
							res.end('Redirecting to ' + req.url + '/');
						}
			
						function procError(err){
							me.syslog.error('('+(err.status||500).toString()+') '+err.message);
							res.statusCode = err.status || 500;
							res.end(err.message);
						}
			
						// Special file handling
						function sendFile(path){
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
		if (this.shared){
			return;
		}
		var f = require('child_process').fork, localtunnel = require('localtunnel'), me = this;
		
		localtunnel(this.port,function(err,tunnel){
			me.tunnel = tunnel;
			me._url = tunnel.url;
			me.shared = true;
			
			/**
			 * @event share
			 * Fired when the localtunnel is established or re-established. Provides the
			 * server instance as a handler argument.
			 */
			me.emit('share',me);
			
			tunnel.on('close',function(){
				me._url = null;
				me.shared = false;
				
				/**
			 * @event unshare
			 * Fired when the localtunnel is dropped. Provides the server instance
			 * as a handler argument.
			 */
				me.emit('unshare',me);
				
				me.syslog.warn('Stopped sharing server publicly.');
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
			this.tunnel.once('close',cb);
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
		var webshot = require('url-to-screenshot'), binary = null, me = this, url = '127.0.0.1:'+this.port.toString();
		
		if (typeof w === 'function'){
			cb = w;
			w = 600;
			h = w;
		} else if (typeof h == 'function'){
			cb = h;
			h = w;
		}
		
		url='http://localhost:'+this.port.toString();
		webshot(url).width(w).height(h).capture(function(err,img){
			if (err) throw err;
			me.screenshot = 'data:image\/png;base64,'+img.toString('base64');
		});
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
	 */
	start: function(cb){
		var me = this;
		if (this.running){
			cb && cb();
			return;
		}
		this.http.listen(this.port,function(){
			me.running = true;
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
	 * @method stop
	 * @param {Function} [callback]
	 * A callback function to execute when the server has stopped.
	 * @fires stop
	 */
	stop: function(cb){
		var me = this;
		if (!this.running){
			cb && cb();
			return;
		}
		if (this.shared){
			this.unshare(function(){
				me.http.close(function(){
					me.running = false;
					/**
					 * @event stop
					 * Fired when the server is stopped. Sends the Server objects as a handler argument.
					 */
					me.emit('stop',me);
					me.syslog.log('Server stopped on port '+me.port.toString()+'.');
					cb && cb();
				});
			});
		} else if (this.running){
			this.http.close(function(){
				me.running = false;
				me.emit('stop',me);
				me.syslog.log('Server stopped on port '+me.port.toString()+'.');
				cb && cb();
			});
		} else {
			cb && cb();
		}
	}
});