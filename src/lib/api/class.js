/**
 * @class Class
 * A base class providing a simple inheritance model for JavaScript classes. All
 * API classes are an extension of this model.<br/><br/>
 * **Example:**
 *            // Superclass
 *     var Vehicle = Class.extend({
 *         constructor: function (type) {
 *             this.type = type;
 *         },
 *         accelerate: function() {
 *             return this.type+' is accelerating';
 *         }
 *     });
 *
 *     // Subclass
 *     var Car = Vehicle.extend({
 *         constructor: function (doorCount) {
 *              Car.super.constructor.call(this, 'car');
 *
 *              Object.defineProperty(this,'doors',{
 *                  value:      doorCount || 4, // Default = 4
 *                  writable:   true,
 *                  enumerable: true
 *              });
 *         },
 *         accelerate: function () {
 *             console.log('The '+this.doors+'-door '+ Car.super.accelerate.call(this));
 *         }
 *     });
 *
 *     var mustang = new Car(2);
 *     mustang.accelerate();
 *
 *     //Outputs: The 2-door car is accelerating.
 *
 * @docauthor Corey Butler
 */
var Class = {

		/**
		 * @method extend
		 * The properties of the object being extended.
		 *           // Subclass
     *     var Car = Vehicle.extend({
     *         constructor: function (doors) {
     *              Car.super.constructor.call(this, 'car');
     *
     *              Object.defineProperty(this,'doors',{
     *                  value:      doors || 4,
     *                  writable:   true,
     *                  enumerable: true
     *              });
     *         },
     *         accelerate: function () {
     *             console.log('The '+this.doors+'-door '+ Car.super.accelerate.call(this));
     *         }
     *     });
		 * @param {Object} obj
		 * The object containing `constructor` and methods of the new object.
		 * @returns {Object}
		 */
    extend: function ( obj ) {
        var parent      = this.prototype || Class,
            prototype   = Object.create(parent);

        Class.merge(obj, prototype);

        var _constructor = prototype.constructor;
        if (!(_constructor instanceof Function)) {
            throw Error("No constructor() method.");
        }

        /**
         * @property {Object} prototype
         * The prototype of all objects.
         * @protected
         */
        _constructor.prototype = prototype;

        /**
         * @property super
         * Refers to the parent class.
         * @protected
         */
        _constructor.super = parent;

        // Inherit class method
        _constructor.extend = this.extend;

        return _constructor;
    },

    /**
     * @method merge
     * Merges the source to target
     * @private
		 * @param {Object} [source]
		 * Original object.
		 * @param {Object} target
		 * New object (this).
		 * @param {Boolean} [force=false]
		 * @returns {Object}
     */
    merge: function(source, target, force) {
			target = target || this;
			force = force || false;
			Object.getOwnPropertyNames(source).forEach(function(attr) {

			// If the attribute already exists,
			// it will not be recreated, unless force is true.
			if (target.hasOwnProperty(attr)){
				if (force)
					delete target[attr];
			}

			if (!target.hasOwnProperty(attr))
				Object.defineProperty(target, attr, Object.getOwnPropertyDescriptor(source, attr));

      });
      return target;
    }
};

try {
  /*
   * EventEmitter v4.0.3 - git.io/ee
   * Oliver Caldwell
   * MIT license
   * https://github.com/Wolfy87/EventEmitter
   */
  (function(e){"use strict";function t(){}function i(e,t){if(r)return t.indexOf(e);var n=t.length;while(n--)if(t[n]===e)return n;return-1}var n=t.prototype,r=Array.prototype.indexOf?!0:!1;n.getListeners=function(e){var t=this._events||(this._events={});return t[e]||(t[e]=[])},n.addListener=function(e,t){var n=this.getListeners(e);return i(t,n)===-1&&n.push(t),this},n.on=n.addListener,n.removeListener=function(e,t){var n=this.getListeners(e),r=i(t,n);return r!==-1&&(n.splice(r,1),n.length===0&&(this._events[e]=null)),this},n.off=n.removeListener,n.addListeners=function(e,t){return this.manipulateListeners(!1,e,t)},n.removeListeners=function(e,t){return this.manipulateListeners(!0,e,t)},n.manipulateListeners=function(e,t,n){var r,i,s=e?this.removeListener:this.addListener,o=e?this.removeListeners:this.addListeners;if(typeof t=="object")for(r in t)t.hasOwnProperty(r)&&(i=t[r])&&(typeof i=="function"?s.call(this,r,i):o.call(this,r,i));else{r=n.length;while(r--)s.call(this,t,n[r])}return this},n.removeEvent=function(e){return e?this._events[e]=null:this._events=null,this},n.emitEvent=function(e,t){var n=this.getListeners(e),r=n.length,i;while(r--)i=t?n[r].apply(null,t):n[r](),i===!0&&this.removeListener(e,n[r]);return this},n.trigger=n.emitEvent,typeof define=="function"&&define.amd?define(function(){return t}):e.EventEmitter=t})(this);
  
  // Add an emit alias
  Object.defineProperty(EventEmitter.prototype,'emit',{
    enumerable: true,
    writable: false,
    configurable: false,
    value: function(eventname,data){
			if (this.suppressedEvents !== undefined){
				if (this.suppressedEvents.indexOf(eventname) >= 0){
					return;
				}
			}
      this.emitEvent(eventname,[data]);
    }
  });
} catch (e) {
  EventEmitter = (require('events')).EventEmitter;
	EventEmitter.prototype.emit = function(){
		if (this.suppressedEvents !== undefined){
			if (this.suppressedEvents.indexOf(arguments[0]) >= 0){
				return;
			}
		}
		EventEmitter.super_.prototype.emit.apply(this);
	};
}

/**
 * @method on
 * Add an event listener. For example:
 * 
 *     Class.on('someEvent',function(){
 *       alert('Heard someEvent');
 *     });
 */
/**
 * @method once
 * Add an event listener that removes itself after
 * the event is fired (i.e. listens once).
 * For example:
 * 
 *     Class.once('someEvent',function(){
 *       alert('Heard someEvent');
 *     });
 */
/**
 * @method off
 * Remove an event listener.
 *  
 *     API.off('someEvent');
 */
/**
 * @method emit
 * Emit an event.
 * 
 *     API.emit('someEvent',{data:value});
 * @protected
 */
Class.merge(EventEmitter.prototype);
