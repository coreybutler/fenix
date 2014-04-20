var fs = require('fs'),
    path = require('path'),
    gui = require('nw.gui'),
    head = gui.Window.get(this),
    pkg = require(path.resolve('./','package.json')),
    configuration = require(path.resolve(path.join('./','lib','config.json'))),
    config = configuration,
    win = {
      splash: path.join('.','lib','view','splash.html'),
      main: path.join('.','lib','view','main.html')
    },
    uuid = require('node-uuid')
    ua = require('universal-analytics'),
    active = null;

process.on('uncaughtexception',function(e){
  console.dir(e);
    alert(e.message);
  if (e.code ==='EACCES'){
    alert('Insufficient permissions.');
  }
  if (!head.isDevToolsOpen() && config.dev){
    head.showDevTools();
  }
});
if (config.dev){
  head.showDevTools();
}

var ganoop = function(){
  return {send:function(){}};
}

// Generate global references
Object.defineProperties(global,{
  windows: {
    enumerable: true,
    get: function(){
      return win;
    }
  },
  OS: {
    enumerable: true,
    get: function(){
      return require('os').platform();
    }
  },
  trigger: {
    enumerable: true,
    writable: false,
    configurable: false,
    value: function(controller,evt){
      win[controller].emit(evt);
    }
  },
  track: {
    enumerable: true,
    get: function(){
      // Get ID
      if(localStorage.getItem('fid') === undefined){
        localStorage.setItem('fid',uuid.v4());
      }
      if (configuration.googleanalytics){
        return {
          event: ganoop,
          pageview: ganoop
        };
      }
      return ua(configuration.googleanalytics,localStorage.getItem('fid'));
    }
  }
});

// Default values
var autoshow = config.main.hasOwnProperty('show') ? config.main.show : true;
config.main.hasOwnProperty('show') && delete config.main.show;
config.dev = config.hasOwnProperty('dev') ? config.dev : false;

// If a splash screen exists, use it
fs.exists(win.splash,function(splashexists){
  if (splashexists){
    // Create the splash page
    var cfg = config.splash;
    win.splash = gui.Window.open(win.splash,{
      frame: cfg.hasOwnProperty('frame') ? cfg.frame : false,
      toolbar: config.dev ? true : (cfg.hasOwnProperty('toolbar') ? cfg.toolbar : false),
      width: cfg.width || 600,
      height: cfg.height || 400,
      transparent: cfg.hasOwnProperty('transparent') ? cfg.transparent : true,
      show_in_taskbar: cfg.hasOwnProperty('show_in_taskbar') ? cfg.show_in_taskbar : false,
      icon: path.resolve(config.icon),
      frame: config.dev === true ? true : (cfg.hasOwnProperty('frame') ? cfg.frame : false),
      'new-instance': false
    });
  }

  // Load any additional windows required by the app
  Object.keys(config.windows||{}).forEach(function(w){
    var cfg = config.windows[w];
    cfg.show = cfg.hasOwnProperty('show') ? cfg.show : true;
    cfg.show_in_taskbar = cfg.hasOwnProperty('show_in_taskbar') ? cfg.show_in_taskbar : false;
    cfg.icon = cfg.icon || path.resolve(config.icon);
    cfg.toolbar = config.dev ? true : (cfg.hasOwnProperty('toolbar') ? cfg.toolbar : false);
    cfg.frame = config.dev ? true : (cfg.hasOwnProperty('frame') ? cfg.frame : true);
    cfg['new-instance'] = false;
    win[w] = new gui.Window.open(path.join('.','lib','view',w+'.html'),cfg);
    if (cfg.close){
      win[w].on('close',function(){
        this.hide();
      });
    }
  });

  // Load the main window
  var cfg = config.main;
  win.main = new gui.Window.open(win.main,{
    show: autoshow,
    frame: config.dev ? true : (cfg.hasOwnProperty('frame') ? cfg.frame : true),
    toolbar: config.dev ? true : (cfg.hasOwnProperty('toolbar') ? cfg.toolbar : false),
    width: cfg.width || pkg.window.width,
    height: cfg.height || pkg.window.height,
    transparent: cfg.hasOwnProperty('transparent') ? cfg.transparent : true,
    show_in_taskbar: cfg.hasOwnProperty('show_in_taskbar') ? cfg.show_in_taskbar : true,
    icon: path.resolve(config.icon),
    'new-instance': false
  });

  // When the main window is closed, the app should close
  win.main.on('close',function(){
    head.close();
  });

  // When the custom "ready" event is fired from the main window, close the splash page if it
  // exists and unhide the main window.
  win.main.once('ready',function(){
    win.main.show();
    if (!(win.splash instanceof String)){
      win.splash.close();
    }
    win.main.focus();
    global.track.event('Application','launch','Opened Desktop Application').send();
    global.track.pageview('/app/webservers').send();
  });

  // If autoshow is not turned on (on by default), fire the main window ready event.
  win.main.on('loaded',function(){
    if (autoshow){
      win.main.emit('ready');
    }
  });

});

// When this controller closes, the whole app should close.
head.on('close',function(){
  gui.App.closeAllWindows();
  gui.App.quit();
});
