  // Load native UI library
var gui = require('nw.gui'),
    menu = new gui.Menu({type:'menubar'}),
    server = new gui.Menu(),
    win = gui.Window.get(),
    bin = null,
    abt = null,
    splash = null,
    request = require('request'),
    uuid = require('node-uuid'),
    ua = require('universal-analytics'),
    winloaded = false;

// Get ID
if(localStorage.getItem('fid') === undefined){
  localStorage.setItem('fid',uuid.v4());
}
var stats = ua('UA-49695003-4',localStorage.getItem('fid'));

win.on('show',function(){
  winloaded = true;
});

splash = gui.Window.open('./splash.html',{
  frame: false,
  toolbar: false,
  width: 600,
  height: 400,
  transparent: true,
  show_in_taskbar: false,
  icon: './lib/icons/fenix.png'
});
splash.show();

// Open the request handler
var openRequestBin = function(){

  if (bin === null){

    bin = gui.Window.open('./bin.html', {
      position: 'center',
      width: 990,
      height: 700,
      title: 'Fenix Request Browser',
      toolbar: true,
      icon: './lib/icons/webhooks.png'
    });

    bin.on('close',function(){
      this.hide();
    });

    stats.event('Application','webhooks','Opened Webhooks').send();
    stats.pageview('/app/webhooks/open').send();

  } else {
    stats.event('Application','webhooks','Opened Webhooks').send();
    stats.pageview('/app/webhooks/open').send();
    bin.show();
    bin.focus();
  }

};

// Open About Page
var openAbout = function(){

  if (abt === null){

    abt = gui.Window.open('./about.html', {
      position: 'center',
      width: 600,
      height: 400,
      title: 'Fenix Request Browser',
      toolbar: false,
      frame: false,
      icon: './lib/icons/fenix.png'
    });

    abt.on('close',function(){
      this.hide();
    });

    stats.event('Application','help','Opened Help').send();
    stats.pageview('/app/help/open').send();

  } else {
    stats.event('Application','help','Opened Help').send();
    stats.pageview('/app/help/open').send();
    abt.show();
    abt.focus();
  }

};

server.append(new gui.MenuItem({ label: 'New', click: UI.wizard.show }));
server.append(new gui.MenuItem({ label: 'Start All', click: function(){ROUTER.startAllWebServers();}}));
server.append(new gui.MenuItem({ label: 'Stop All', click: function(){ROUTER.stopAllWebServers();}}));

var s = new gui.MenuItem({ label: 'Web Servers' });
s.submenu = server;

menu.append(s);
menu.append(new gui.MenuItem({ label: 'Request Browser', menu: server, click: openRequestBin }));
menu.append(new gui.MenuItem({ label: 'Help', menu: server, click: openAbout }));

win.menu = menu;

win.setPosition('center');

win.on('close',function(){
  gui.App.closeAllWindows();
  ROUTER.save();
  gui.App.quit();
});

/*var tray = new gui.Tray({title:'Fenix',icon:'../lib/icons/fenix.png'});
var tmenu = new gui.Menu();
tmenu.append(new gui.MenuItem({ label: 'Server A' }));
tray.menu = tmenu;*/

process.title = 'Fenix Web Servers';

process.updateavailable = false;
//if (gui.App.argv.length > 0){
//  process.stdout.write('testing');
//  gui.App.quit();
//} else {

//}

// Collect statistics
stats.event('Application','launch','Opened Desktop Application').send();
stats.pageview('/app/webservers').send();
