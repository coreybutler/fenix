var ROUTER = new Router();

var initServer = function(server){
  if (!server.initialized){
    server.on('initialized',function(){
      if (!document.getElementById(server.id)){
        UI.server.display(server,function(){
          UI.loader.hide();
        });
      }
    });
    server.on('error',function(e){
      console.dir(e);
      UI.notify({
        title: server.name,
        msg: (e.message|| 'Unknown Error')+' (Code: '+e.code.toString()+')'
      });
    });
    server.off('startfailure').on('startfailure',function(code){
      if (server.assistingstart){
        return;
      }
      if (ROUTER.loading){
        alert('Could not start '+server.name+'. The user account has insufficient privileges to run a server on port '+server.port.toString());
        return;
      }
      server.assistingstart = confirm('Insufficient user privileges.\nCannot run the server on port '+server.port.toString()+'.\n\nSome systems require elevated permissions (sudo/admin) to run servers on certain ports. Would you like Fenix to automatically find and use a supported port to start the server on?');
      if (server.assistingstart){
        server.once('start',function(){
          server.assistingstart = false;
        });
        ROUTER.getAvailablePort(function(port){
          server.port = port;
          UI.server.update(server.id);
          UI.server.unmask();
          server.start();
        },1025);
      } else {
        UI.server.unmask();
      }
    });
    server.on('screencapture',function(server){
      UI.server.setThumbnail(server.id,server.screenshot);
    });
    server.on('share',function(){
      UI.server.share(server);
      !server.supressnotices && UI.notify({
        title: server.name,
        text: 'Publicy sharing server at '+server.publicUrl
      });
      global.track.event('Web Server','share','Shared Web Server').send();
    });
    server.on('unshare',function(){
      UI.server.unshare(server);
      !server.supressnotices && UI.notify({
        title: server.name,
        text: 'Stopped sharing server publicly'
      });
    });
    server.on('start',function(){
      if (server.running){
        UI.server.start(server.id);
        // Capture the initial screenshot.
        server.captureScreen();
        UI.server.unmask(server.id);
        !server.supressnotices && UI.notify({
          title: server.name,
          text: 'Started on port '+server.port.toString()
        });
      }
    });
    server.on('stop',function(){
      if (!server.running){
        UI.server.stop(server.id);
        UI.server.unmask(server.id);
        !server.supressnotices && UI.notify({
          title: server.name,
          text: 'Stopped'
        });
      }
    });
    server.on('filecreated',function(obj){
      if (!obj.server.running){
        return;
      }
      // The main index page was created, so recreate the screenshot
      if (obj.filename.replace(obj.server.path,'').replace('/','') === 'index.html'){
        setTimeout(function(){
          obj.server.captureScreen();
        },1000);
      }
    });
    server.on('filechanged',function(obj){
      if (!obj.server.running){
        return;
      }
      // The main index page was modified, so recreate the screenshot
      if (obj.filename.replace(obj.server.path,'').replace('/','') === 'index.html'){
        setTimeout(function(){
          obj.server.captureScreen();
        },1000);
      }
    });
    server.on('fileremoved',function(obj){
      if (!obj.server.running){
        return;
      }
      // The main index page was removed, so recreate the screenshot (it will show an error)
      if (obj.filename.replace(obj.server.path,'').replace('/','') === 'index.html'){
        setTimeout(function(){
          obj.server.captureScreen();
        },1000);
      }
    });
    global.track.event('Web Server','create','Created Web Server').send();
  } else {
    UI.server.display(server,function(){
      UI.loader.hide();
    });
  }
};

ROUTER.on('createserver',function(server){
  UI.loader.show('Configuring the new server.');
  initServer(server);
});

ROUTER.on('deleteserver',function(server){
  $('#'+server.id).addClass('bounceOut');
  setTimeout(function(){
    $('#'+server.id).remove();
    UI.notify({
      title: server.name,
      text: 'Server Deleted'
    });
    if (Object.keys(ROUTER.servers).length === 0){
      $('body').removeClass('hasservers');
    }
  },1000);
  global.track.event('Web Server','delete','Deleted Web Server').send();
});

ROUTER.on('loadserver',function(server){
  initServer(server);
});

ROUTER.on('loadcomplete',function(){
  require('request').get('https://api.github.com/repos/coreybutler/fenix/releases',{
    headers: {
      'user-agent':'Fenix'
    }
  },function(error,response,body){
    try {
      if (body){
        data = JSON.parse(body);
        data = (data || [])[0];

        if(data !== undefined){
          var semver = require('semver');
          var pkg = require('./package.json').version;
          localStorage.setItem('updateavailable',semver.lt(pkg,data.tag_name));
        } else {
          localStorage.setItem('updateavailable',false);
        }

        setTimeout(function(){
          if (localStorage.getItem('updateavailable')==='true'){
            UI.updateAvailable();
            UI.notify({
              title: 'Update Available',
              text: 'Version '+data.tag_name+' is available.'
            });
          }
          global.windows.main.emit('ready');
        },2500+(localStorage.getItem('updateavailable')==='true'?3000:0));

      } else {
        setTimeout(function(){
          global.windows.splash && global.windows.splash.hide();
          global.windows.main.show();
        },1500);
      }
    } catch (e){
      alert('ERROR: '+e.message);
      global.windows.main.emit('ready');
      winloaded = true;
    }
  });

});

ROUTER.load();
