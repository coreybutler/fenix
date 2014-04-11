  // Load native UI library
var gui = require('nw.gui'),
    menu = new gui.Menu({type:'menubar'}),
    server = new gui.Menu(),
    win = gui.Window.get(),
    bin = null,
    abt = null,
    splash = null,
    request = require('request'),
    //uuid = require('node-uuid'),
    //ua = require('universal-analytics'),
    winloaded = false;

// Get ID
//if(localStorage.getItem('fid') === undefined){
//  localStorage.setItem('fid',uuid.v4());
//}
//var stats = ua('UA-49695003-4',localStorage.getItem('fid'));

win.on('show',function(){
  winloaded = true;
});

splash = gui.Window.open('./splash.html',{
  //frame: false,
  toolbar: true,
  width: 600,
  height: 400,
  transparent: true,
  //show_in_taskbar: false,
  icon: './lib/icons/fenix.png'
});
splash.show();
