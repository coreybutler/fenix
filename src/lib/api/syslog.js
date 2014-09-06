/**
 * @Class Syslog
 * Represents a system log.
 * @extends Utility
 */
var Syslog = Utility.extend({
	constructor: function(config){
		config = config || {};
		
		Syslog.super.constructor.call(this,config);
		
		Object.defineProperties(this,{
		
			/**
			 * @property {Object} log
			 * The contents of the log. This is a key/value object with timestamps for keys and messages for values.
			 * @private
			 */
			syslog: {
				enumerable: false,
				writable: true,
				configurable: false,
				value: {}
			},
			
			/**
			 * @method prelog
			 * Preprocessing for log messages.
			 * @private
			 */
			prelog: {
				enumerable: false,
				writable: false,
				configurable: false,
				value: function(msg){
					var m = null;
					switch(typeof msg){
						case 'function':
							m = '[Function]';
							break;
						case 'object':
							m = JSON.stringify(msg,null,2);
							break;
						default:
							m = msg.toString();
							break;
					}
					return m;
				}
			},
			
			timestamp: {
				enumerable: false,
				get: function() {
					var now = new Date(),
						date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ],
						time = [ now.getHours(), now.getMinutes(), now.getSeconds() ],
						suffix = ( time[0] < 12 ) ? "AM" : "PM";

					time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
					time[0] = time[0] || 12;

					for ( var i = 1; i < 3; i++ ) {
						if ( time[i] < 10 ) {
							time[i] = "0" + time[i];
						}
					}
					return date.join("/") + " " + time.join(":") + " " + suffix;
				}
			}
			
		});
	},
	
	/**
	 * @method log
	 * Add an entry to the log.
	 * @param {Any} message
	 * The message or data to log.
	 * @fires log
	 */
	log: function(msg) {
		msg = this.prelog('['+this.timestamp+'] '+msg);
		this.syslog[+new Date] = msg;
		this.emit('log',msg);
	},
	
	/**
	 * @method error
	 * Add an error entry to the log.
	 * @param {Any} message
	 * The message or data to log.
	 * @fires errormsg
	 */
	error: function(msg) {
		msg = this.prelog('['+this.timestamp+'] '+'ERROR: '+msg);
		this.syslog[+new Date] = msg;
		this.emit('errormsg',msg);
	},
	
	/**
	 * @method warn
	 * Add a warning entry to the log.
	 * @param {Any} message
	 * The message or data to log.
	 * @fires warn
	 */
	warn: function(msg) {
		msg = this.prelog('['+this.timestamp+'] '+'WARNING: '+msg);
		this.syslog[+new Date] = msg;
		this.emit('warn',msg);
	}
});