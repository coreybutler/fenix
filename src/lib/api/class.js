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
  (function(){"use strict";function t(){}function r(t,n){for(var e=t.length;e--;)if(t[e].listener===n)return e;return-1}function n(e){return function(){return this[e].apply(this,arguments)}}var e=t.prototype,i=this,s=i.EventEmitter;e.getListeners=function(n){var r,e,t=this._getEvents();if(n instanceof RegExp){r={};for(e in t)t.hasOwnProperty(e)&&n.test(e)&&(r[e]=t[e])}else r=t[n]||(t[n]=[]);return r},e.flattenListeners=function(t){var e,n=[];for(e=0;e<t.length;e+=1)n.push(t[e].listener);return n},e.getListenersAsObject=function(n){var e,t=this.getListeners(n);return t instanceof Array&&(e={},e[n]=t),e||t},e.addListener=function(i,e){var t,n=this.getListenersAsObject(i),s="object"==typeof e;for(t in n)n.hasOwnProperty(t)&&-1===r(n[t],e)&&n[t].push(s?e:{listener:e,once:!1});return this},e.on=n("addListener"),e.addOnceListener=function(e,t){return this.addListener(e,{listener:t,once:!0})},e.once=n("addOnceListener"),e.defineEvent=function(e){return this.getListeners(e),this},e.defineEvents=function(t){for(var e=0;e<t.length;e+=1)this.defineEvent(t[e]);return this},e.removeListener=function(i,s){var n,e,t=this.getListenersAsObject(i);for(e in t)t.hasOwnProperty(e)&&(n=r(t[e],s),-1!==n&&t[e].splice(n,1));return this},e.off=n("removeListener"),e.addListeners=function(e,t){return this.manipulateListeners(!1,e,t)},e.removeListeners=function(e,t){return this.manipulateListeners(!0,e,t)},e.manipulateListeners=function(r,t,i){var e,n,s=r?this.removeListener:this.addListener,o=r?this.removeListeners:this.addListeners;if("object"!=typeof t||t instanceof RegExp)for(e=i.length;e--;)s.call(this,t,i[e]);else for(e in t)t.hasOwnProperty(e)&&(n=t[e])&&("function"==typeof n?s.call(this,e,n):o.call(this,e,n));return this},e.removeEvent=function(e){var t,r=typeof e,n=this._getEvents();if("string"===r)delete n[e];else if(e instanceof RegExp)for(t in n)n.hasOwnProperty(t)&&e.test(t)&&delete n[t];else delete this._events;return this},e.removeAllListeners=n("removeEvent"),e.emitEvent=function(r,o){var e,i,t,s,n=this.getListenersAsObject(r);for(t in n)if(n.hasOwnProperty(t))for(i=n[t].length;i--;)e=n[t][i],e.once===!0&&this.removeListener(r,e.listener),s=e.listener.apply(this,o||[]),s===this._getOnceReturnValue()&&this.removeListener(r,e.listener);return this},e.trigger=n("emitEvent"),e.emit=function(e){var t=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,t)},e.setOnceReturnValue=function(e){return this._onceReturnValue=e,this},e._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},e._getEvents=function(){return this._events||(this._events={})},t.noConflict=function(){return i.EventEmitter=s,t},"function"==typeof define&&define.amd?define(function(){return t}):"object"==typeof module&&module.exports?module.exports=t:this.EventEmitter=t}).call(this);

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
  EventEmitter.setMaxListeners(150);
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
