	// Load native UI library
var gui = require('nw.gui'),
    menu = new gui.Menu({type:'menubar'}),
    server = new gui.Menu(),
    win = gui.Window.get(),
		bin = null,
		abt = null;

// Open the request handler
var openRequestBin = function(){
	
	if (bin === null){
	
		bin = gui.Window.open('./bin.html', {
			position: 'center',
			width: 990,
			height: 700,
			title: 'Fenix Request Browser'
		});

		bin.on('close',function(){
			this.hide();
		});
		
	} else {
		bin.show();
		bin.focus();
	}
	
};

// Open About Page
var openAbout = function(){
	
	if (abt === null){
	
		abt = gui.Window.open('./about.html', {
			position: 'center',
			width: 990,
			height: 700,
			title: 'Fenix Request Browser'
		});

		abt.on('close',function(){
			this.hide();
		});
		
	} else {
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
menu.append(new gui.MenuItem({ label: 'About', menu: server, click: openAbout }));

win.menu = menu;

win.setPosition('center');

win.on('close',function(){
	gui.App.closeAllWindows();
	ROUTER.save();
	gui.App.quit();
});

/*var tray = new gui.Tray({title:'Fenix',icon:'../resources/fenix.png'});
var tmenu = new gui.Menu();
tmenu.append(new gui.MenuItem({ label: 'Server A' }));
tray.menu = tmenu;*/

process.title = 'Fenix Web Servers';

//if (gui.App.argv.length > 0){
//	process.stdout.write('testing');
//	gui.App.quit();
//} else {
	win.show();
//}