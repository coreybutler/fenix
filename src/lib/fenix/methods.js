var path = require('path');

module.exports = function(el){
  var gui = el.gui;

  el.showSplashScreen = function(){
    gui.Window.open(path.join('.','view','splash.html'),{
      frame: false,
      toolbar: el.config.dev ? true : (el.config.hasOwnProperty('toolbar') ? el.config.toolbar : false),
      width: el.config.width || 600,
      height: el.config.height || 400,
      transparent: el.config.hasOwnProperty('transparent') ? el.config.transparent : true,
      show_in_taskbar: el.config.hasOwnProperty('show_in_taskbar') ? el.config.show_in_taskbar : false,
      icon: path.resolve(el.config.icon),
      frame: el.config.dev === true ? true : (el.config.hasOwnProperty('frame') ? el.config.frame : false),
      'new-instance': false
    });
    el.bus.publish('window.splash.show');
  };
};
