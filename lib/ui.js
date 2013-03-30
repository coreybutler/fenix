// Load native UI library
var gui = require('nw.gui'),
    menu = new gui.Menu({type:'menubar'}),
    server = new gui.Menu(),
    win = gui.Window.get();

// Retrieve server data from localStorage
var servers = localStorage.servers || '{}';
servers = JSON.parse(servers);

// Display/hide the "new server" form
var toggleEditor = function(){
  var pane = $('#servers div:first-child');
  var turningOn = pane.position().top < 0;
  if (turningOn){
    pane.animate({
      top: 20
    },function(){
      $('#cancel').show();
    });
  } else {
    $('#cancel').hide(function(){
      pane.animate({
        top: -65
      },150);
    });
  }
  $('#servers').animate({
    'margin-top': 20-pane.position().top
  });
};

var openHelpWindow = function(){
  gui.Window.open('./help.html', {
    title: 'Fenix Help',
    icon: './resources/fenix.png',
    position: 'center',
    width: 500,
    height: 300,
    toolbar: false
  });
};

var openAboutWindow = function(){
  gui.Window.open('./about.html', {
    title: 'About Fenix',
    icon: './resources/fenix.png',
    position: 'center',
    width: 500,
    height: 300,
    toolbar: false
  });
};

/*
var logs = null;
var openLogWindow = function(){
  if (!logs){
    gui.Window.open('./logs.html', {
      title: 'Fenix Server Logs',
      icon: './resources/fenix.png',
      position: 'center',
      width: 500,
      height: 700
    });
    logs = gui.Window.get('./logs.html');
  } else {
    logs.show();
  }
};*/

win.on('close',function(){
  gui.App.quit();
});

// Create the menu bar
menu.append(new gui.MenuItem({
    label: 'New',
    click: toggleEditor
  })
);
//menu.append(new gui.MenuItem({ label: 'Logs', click: openLogWindow }));
menu.append(new gui.MenuItem({ label: 'Help', click: openHelpWindow }));
menu.append(new gui.MenuItem({ label: 'About', click: openAboutWindow }));
win.menu = menu;

// Save position preferences on close.
win.on('close', function() {
  localStorage.x      = win.x;
  localStorage.y      = win.y;
  localStorage.width  = win.width;
  localStorage.height = win.height;
  this.close(true);
});

// Restore position preferences on startup.
onload = function() {
  if (localStorage.width && localStorage.height) {
    win.resizeTo(parseInt(localStorage.width), parseInt(localStorage.height));
  }
  if (localStorage.x >= 0 && localStorage.y >= 0){
    win.moveTo(parseInt(localStorage.x), parseInt(localStorage.y));
  }
  win.show();
};
// Toggle the fields between "running" and "stopped" mode.
var toggleFields = function(dis){
  dis = dis instanceof Boolean ? dis : true;
  console.dir($('.running > input'));
  if (dis){
    $('.running > input').attr('disabled','disabled');
  } else {
    $('.running > input').removeAttr('disabled');
  }
}

var closeServer = function(id){
  $('#'+id).removeClass('running');
  $('#'+id+' div:last-child a:first-child')[0].innerHTML = '&#xe000;';
  toggleFields();
};

// OnReady
$(document).ready(function(){

  // Method for adding new server
  var createServer = function(data){
    var html = "<div id=\""+data.id+"\">"
               +  "<input type=\"text\" data=\"p\" value=\""+data.p+"\"/>"
               +  "<input type=\"text\" data=\"n\" value=\""+data.n+"\"/>"
               +  "<label>&#xe003;<input type=\"file\" nwdirectory name=\"path\" size=\"40\"/></label>"
               +  "<input type=\"text\" data=\"d\" value=\""+data.d+"\"/>"
               +  "<div><a href=\"#\">&#xe000;</a><a href=\"#\">&#xe002;</a></div>"
               +"</div>";
    if ($('#servers').children().length > 1){
      html += "<hr class=\""+data.id+"\"/>";
    }
    $('#servers div:first-child').after(html);
    $('#'+data.id+' input[type=text]').change(selector);
    $('#'+data.id+' input[type=file]').change(filebinder);
    $('#'+data.id+' input[type=text]').change(delta);
    $('#'+data.id+' input[type=text]').keypress(keypress);
    $('#'+data.id+' div:last-child a:first-child').click(startstop);
    $('#'+data.id+' div:last-child a:last-child').click(del);
  }

  var selector = function(evt) {
    $(this).select();
  }

  var filebinder = function(evt){
    var path = $(evt.currentTarget.parentNode.parentNode).find('input:nth-child(4)')[0],
        value = evt.currentTarget.value;
    path.value = value;
  };

  var delta = function(evt){
    var el = $(evt.currentTarget),
        id = el[0].parentNode.id;

    if (id !== 'new') {
      var data = el[0].attributes.data.value;

      servers[id][data] = data == 'p' ? parseInt(el.val()) : el.val();
      save();
    }
  };

  var keypress = function(evt){
    if (evt.which == 13){
      $(evt.currentTarget).blur();
      return;
    }
  };

  var del = function(evt){
    var el = $(evt.currentTarget.parentNode.parentNode)[0],
        id = el.id;
    if (id !== 'new'){
      $(el).remove();
      $('.'+id).remove();
      delete servers[id];
      save();
    }
  };

  var startstop = function(evt){
    var id = $(evt.currentTarget.parentNode.parentNode)[0].id;
    if (running[id] == undefined){
      startServer(id,function(){
        $('#'+id).addClass('running');
        $('#'+id+' div:last-child a:first-child')[0].innerHTML = '&#xe001;';
        toggleFields();
      });
    } else {
      stopServer(id,closeServer);
    }
  };

  // Load the saved servers
  for (var srv in servers){
    var obj = servers[srv];
    obj.id = srv;
    createServer(obj);
  }
  delete obj;

  // Add a server
  $('#add').click(function(evt){
    var f = $(evt.currentTarget.parentNode.parentNode).children();

    // Require a numeric port number.
    if (isNaN(f[0].value) || f[0].value == ''){
      $(evt.currentTarget.parentNode.parentNode).find('input[name=port]').val('');
      alert('The port value must be a number. ');
      return;
    }

    // Require a directory path
    if (f[3].value.trim().length === 0){
      alert('A directory path is required.');
      return;
    }

    // Detect whether the directory exists.
    // Offers to save even if it's invalid. This allows for people to create directories
    // at a later time.
    if (!fs.existsSync(f[3].value)) {
      if (!confirm('The file path could not be found or does not exist. Do you really want to save this?')) {
        return;
      }
    }

    // Create the server data object
    var obj = {
      d:f[3].value,
      n:f[1].value||'Unknown Server',
      p:parseInt(f[0].value),
    };

    // Save details
    save(obj);

    // Hide form
    toggleEditor();

    // Reset form
    $(evt.currentTarget.parentNode.parentNode).find('input').val('');
  });

  // Update servers in realtime
  $('#servers input[type=text]').change(delta);

  // Handle enter/return keypress
  $('#servers input[type=text]').keypress(keypress);

  // Handle Delete request
  $('#servers div div:last-child a:last-child').unbind('click').click(del);

  // Handle start/stop request
  $('#servers div div:last-child a:first-child').unbind('click').click(startstop);
});