/**
 * @class Utility
 * A utility class to be subclassed.
 */
var Utility = Class.extend({
	
	constructor: function(config){
	
		Object.defineProperties(this,{
			/**
			 * @property {Object} json
			 * The JSON representation of all enumerable properties.
			 * @private
			 */
			json: {
				enumerable: false,
				get: function(){
					return this.serialize(this);					
				}
			}
		});
		
	},
		
	/**
	 * @method serialize
	 * Serialize an Object as JSON.
	 * @params {Object} obj
	 * The object to serialize.
	 */
	serialize: function(obj){
		var out = Array.isArray(obj) == true ? [] : {};
		for (var attr in obj){
			if (typeof obj[attr] !== 'function' && attr !== '_events' && obj[attr] !== undefined && obj.hasOwnProperty(attr)){
				if (Array.isArray(obj[attr])) {
					// Handles Arrays
					out[attr] = [];
					for (var child=0; child<obj[attr].length; child++){
						out[attr][child] = obj[attr][child];
					}
				} else {
					if (obj[attr] instanceof Object){
						// Handles subobjects
						var subobj = {};
						for (var el in obj[attr]){
							switch (typeof obj[attr][el]){
								case 'object':
									subobj[el] = this.serialize(obj[attr][el]);
								case 'function':
								case '_events':
									break;
								default:
									subobj[el] = obj[attr][el];
							}
						}
						out[attr] = subobj;
					} else {
						out[attr] = obj[attr];
					}
				}
			}
		}
		return out;
	},
	
	/**
	 * @method generateUUID
	 * Generate a unique identifier (format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx).
	 * @returns {String}
	 */
	generateUUID: function(){
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x7|0x8)).toString(16);
			});
			return uuid;
	}

});