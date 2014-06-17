var gui = require('nw.gui'),
    path = require('path');

// Handle menu clicks
$('nav > li > ul > li').click(function(e){
  e.preventDefault();
  $('nav > li > ul').addClass('hide');
  setTimeout(function(){
    $('nav > li > ul').removeClass('hide');
  },300);
  eval($(e.currentTarget).find('a')[0].href.replace('javascript:',''));
});

$('nav > li > ul > li > a').click(function(e){
  $('nav > li > ul').addClass('hide');
  setTimeout(function(){
    $('nav > li > ul').removeClass('hide');
  },300);
});

if (process.platform === 'darwin'){
  $('nav').css('background-color','#B1B1B1');
  $('nav').css('display','flex');
  $('nav').css('font-weight','bold');
  global.windows.main.on('blur',function(){
    $('nav').css('background-color','#E1E1E1');
  });
  global.windows.main.on('focus',function(){
    $('nav').css('background-color','#B1B1B1');
  });
}

binopened = false;
var openRequestBin = function(){
  global.track.event('Application','webhooks','Opened Webhooks').send();
  global.track.pageview('/app/webhooks/open').send();
  !binopened && global.windows.bin.emit('autoshare');
  global.windows.bin.show();
  global.windows.bin.focus();
  binopened = true;
};

var openAbout = function(){
  global.track.event('Application','help','Opened Help').send();
  global.track.pageview('/app/help/open').send();
  global.windows.about.show();
  global.windows.about.focus();
};

global.windows.main.on('close',function(){
  ROUTER.save();
});

// When the main window is minimized, place the app in the system tray.
var tray;
global.windows.main.on('minimize', function() {
  this.hide();

  var tooltip = global.pkg.window.title;

  tray = new gui.Tray({
    icon: path.resolve(global.pkg.window.icon),
    title: tooltip
  });
  tray.tooltip = tooltip; // On Windows the tooltip needs to be set after the Tray is created.

  tray.on('click', function() {
    global.windows.main.show();
    this.remove();
    tray = null;
  });

  // Create the tray menu with some basic functionality.
  var menu = new gui.Menu();
  menu.append(new gui.MenuItem({
    label: 'View Servers',
    click: function() { tray.emit('click'); }
  }));
  menu.append(new gui.MenuItem({ type: 'separator' }));
  menu.append(new gui.MenuItem({
    label: 'Start All',
    click: function() { ROUTER.startAllWebServers(); }
  }));
  menu.append(new gui.MenuItem({
    label: 'Stop All',
    click: function() { ROUTER.stopAllWebServers(); }
  }));
  menu.append(new gui.MenuItem({ type: 'separator' }));
  menu.append(new gui.MenuItem({
    label: 'Quit',
    click: function() { global.windows.main.emit('close'); }
  }));

  tray.menu = menu;
});

if (process.platform === 'darwin'){
  global.windows.main.setShowInTaskbar(true);
}

$(window).on('keyup',function(e){
  if (e.keyCode === 192 && e.ctrlKey && e.shiftKey){
    global.windows.main.showDevTools();
    global.windows.head.showDevTools();
  }
});

// disable default drag/drop behavior
window.ondragover = function(e) { e.preventDefault(); return false; };
window.ondrop = function(e) { e.preventDefault(); return false; };

var dragTargetArea = $('#servers');
dragTargetArea.on('dragenter', function() {
  $(this).addClass('dragHover');
  return false;
});

dragTargetArea.on('dragleave', function() {
  $(this).removeClass('dragHover');
  return false;
});

dragTargetArea.on('drop', function(e) {
  e.preventDefault();
  $(this).removeClass('dragHover');

  var files = e.dataTransfer.files;
  if (files.length > 0) {
    createServersFromDropped(files);
  }

  return false;
});

/** Takes a FileList and creates a server for each folder in the list **/
function createServersFromDropped(toCreate, index) {
  if (toCreate.length < 1) {
    return;
  }

  var fileIndex = index || 0;
  if (fileIndex >= toCreate.length) {
    return;
  }

  var file = toCreate.item(fileIndex);
  if (file == null) {
    return;
  }

  var droppedPath = file.path;
  var serverName = file.name;

  fs.lstat(droppedPath, function(err, stats) {
    if (err || !stats.isDirectory()) {
      // if the path provided wasn't a directory, skip it
      createServerFromDrops(toCreate, ++fileIndex);
    } else {
      ROUTER.getAvailablePort(function(availablePort) {
        UI.server.create({
          name: serverName,
          path: droppedPath,
          port: availablePort
        }, function() {
          createServerFromDrops(toCreate, ++fileIndex);
        });
      });
    }
  });
}
