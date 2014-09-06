var Converter = require('ansi-to-html'),
    Growler = require('growler');

var UI = {
  server: {
    create: function(cfg,cb){
      // Add the server to the router
      ROUTER.createServer(cfg);
    },
    display: function(server,cb){
      if (!document.getElementById(server.id)){
        $('body').addClass('hasservers');
        var fs = require('fs');

        // Add the server to the list of managed servers.
        $('#servers > div:first-child').before('<div id="'+server.id+'"'+(fs.existsSync(server.path)==false?' class="animated '+(server.running?'running':'unavailable')+'"':'class="animated'+(server.running?' running':'')+'"')+'>'
          +'<img src="data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" class="hint--rounded hint--bottom hint--bounce" data-hint="Latest screenshot. Click to view fullsize image."/>'
          +'<div>'
          +  '<div class="hint--bottom hint--bounce hint--rounded" data-hint="Open http://127.0.0.1:'+server.port.toString()+'">'+server.name+'</div>'
          +  '<div>'+server.port.toString()+'</div>'
          +  '<div>'+server.path+'</div>'
          +'</div>'
          +'<div>'
          +  '<div class="hint--left hint--rounded" data-hint="View Server Logs"><div class="icon-menu"></div></div>'
          +  '<div class="hint--left hint--rounded" data-hint="Enable Public View"><div class="icon-share"></div></div>'
          +  '<div class="hint--left hint--rounded" data-hint="'+(server.running?'Stop':'Start')+' Server"><div class="icon-play"></div></div>'
          +  '<div class="hint--left hint--rounded" data-hint="Edit"><div class="icon-pencil"></div></div>'
          +  '<div class="hint--left hint--rounded" data-hint="Remove Server"><div class="icon-trash"></div></div>'
          +'</div>'
          +'</div>'
        );
        UI.server.listen();
        UI.wizard.hide(cb);

        if (!server.running){
          setTimeout(function(){
            $('#servers > div:first-child').addClass('animated swing');
            UI.wizard.reset();
          },300);
        } else {
          server.captureScreen();
        }
      }
    },
    update: function(id){
      var s = ROUTER.getServer(id),
          x = $('#'+id).find('div:nth-child(2) > div');

      x[0].innerHTML = s.name;
      x[0].setAttribute('data-hint','Open http://127.0.0.1:'+s.port.toString());
      x[1].innerHTML = s.port.toString();
      x[2].innerHTML = s.path;
    },
    start: function(id){
      var s = ROUTER.getServer(id);
      svr = $('#'+id);
      if (svr.length === 0){
        return;
      }
      if (!s.running) {
        s.start(function(){
          svr.addClass('running');
          svr.find('div:last-child > div:nth-child(3)')[0].setAttribute('data-hint','Stop Server');
        });
      } else {
        svr.addClass('running');
        svr.find('div:last-child > div:nth-child(3)')[0].setAttribute('data-hint','Stop Server');
      }
    },
    stop: function(id){
      var s = ROUTER.getServer(id);
      if (s.running) {
        s.once('stop',function(){
          $( '#'+id).removeClass('running');
          $('#'+id).find('div:last-child > div:nth-child(3)')[0].setAttribute('data-hint','Start Server');
        });
        s.stop();
      } else {
        $('#'+id).removeClass('running');
        $('#'+id).find('div:last-child > div:nth-child(3)')[0].setAttribute('data-hint','Start Server');
      }
    },
    listen: function(cb){
      $('#servers > div > img').off('click').on('click',function(e){
        window.open($(e.currentTarget)[0].getAttribute('src'),'_blank','width=600,height=600,menubar=no,titlebar=no,location=no');
      });
      $('#servers > div > div:nth-child(2) > div:first-child').off('click').on('click',function(e){
        if (ROUTER.getServer(e.currentTarget.parentNode.parentNode.id).running){
          gui.Shell.openExternal(e.currentTarget.getAttribute('data-hint').replace('Open ',''));
        }
      });
      $('#servers > div > div:last-child > div:first-child').off('click').on('click',function(e){
        UI.logview.show(e.currentTarget.parentNode.parentNode.id);
      });
      $('#servers > div > div:last-child > div:nth-child(2)').off('click').on('click',function(e){
        var s = ROUTER.getServer(e.currentTarget.parentNode.parentNode.id);
        s[(s.shared===false?'share':'unshare')]();
      });
      $('#servers > div > div:last-child > div:nth-child(3)').off('click').on('click',function(e){
        var s = ROUTER.getServer(e.currentTarget.parentNode.parentNode.id);
        UI.server[s.running===true?'stop':'start'](s.id);
        UI.server.mask(s.id,s.running?'Stopping...':'Starting...');
      });
      $('#servers > div > div:last-child > div:nth-child(4)').off('click').on('click',function(e){
        var s = ROUTER.getServer(e.currentTarget.parentNode.parentNode.id);
        UI.editwizard.show(s);
      });
      $('#servers > div > div:last-child > div:last-child').off('click').on('click',function(e){
        ROUTER.deleteServer(e.currentTarget.parentNode.parentNode.id);
      });
      $('#servers > div').on('click',function(e){
        if ($(e.currentTarget).hasClass('shared') && (e.currentTarget.offsetTop+e.currentTarget.clientHeight+8) < e.y){
          var target = e.currentTarget, url = ROUTER.getServer(target.id).publicUrl;
          if ((target.clientWidth-67) < e.x){
            gui.Clipboard.get().set(url);
            $(target).addClass('highlight');

            setTimeout(function(){
              $(target).removeClass('highlight');
            },200);
          } else {
            gui.Shell.openExternal(url);
          }
        }
      });
      cb && cb();
    },
    mask: function(id,msg){
      $('#mask')[0].innerHTML = msg||'...';
      $('#mask')[0].setAttribute('for',id);
      var d = $('#'+id)[0];
      UI.server.cover(d.offsetTop,d.offsetLeft,d.clientWidth,d.clientHeight);
    },
    unmask: function(){
      UI.server.uncover();
    },
    cover: function(top,left,width,height){
      $('#mask').css({
        top: top+24,
        left: left+4,
        width: width+10,
        height: height+4,
        'line-height': (height+4).toString()+'px'
      });
      $('#mask').addClass('show');
    },
    uncover: function(){
      $('#mask').removeClass('show');
    },
    resizeMask: function(){
      if ($('#mask').hasClass('show')){
        UI.server.mask($('#mask')[0].getAttribute('for'),$('#mask')[0].innerHTML);
      }
    },
    setThumbnail: function(id,img){
      try {
        $('#'+id).find('img:first-child')[0].setAttribute('src',img);
      } catch (e) {
        console.log('Image not displayed because DOM could not be found.');
      }
    },
    share: function(server){
      $('#'+server.id).addClass('shared');
      $('#'+server.id)[0].setAttribute('shared-url',server.publicUrl);
      $($('#'+server.id)[0]).find('div.icon-share').parent()[0].setAttribute('data-hint','Disable Public View');
    },
    unshare: function(server){
      $('#'+server.id).removeClass('shared');
      $($('#'+server.id)[0]).find('div.icon-share').parent()[0].setAttribute('data-hint','Enable Public View');
    }
  },
  wizard: {
    hide: function(cb){
      $('#wizard').addClass('bounceOutUp');
      setTimeout(function(){
        $('#wizard').removeClass('bounceInDown show');
      },800);
      cb && cb();
    },
    show: function(){
      if (!$('#wizard').hasClass('show')){
        if ($('#log').hasClass('show')){
          UI.logview.hide();
          setTimeout(function(){
            $('#wizard').addClass('bounceInDown show');
            $('#wizard').removeClass('bounceOutUp');
          },500);
        } else {
          $('#wizard').addClass('bounceInDown show');
          $('#wizard').removeClass('bounceOutUp');
        }
        $('#name').focus();
      }
    },
    browseFilepath: function(){
      $('#choosefile').click();
    },
    reset: function(){
      $('#wizard > input').val(null);
      ROUTER.getAvailablePort(function(port){
        $('#port').val(port);
      });
      UI.wizard.button.disable();
    },
    valid: function(){
      return $('#name').val().trim().length > 0
        && $('#path').val().trim().length > 1
        && $('#port').val().toString().trim().length > 0;
    },
    prepopulate: function(){
      var file = require('path').join($('#path').val(),'.fenix.json');
      if (require('fs').existsSync(file)){
        var f = require(file);
        $('#name').val(f.name);
        $('#port').val(parseInt(f.port));
        if(UI.wizard.valid()){
          UI.wizard.button.enable();
        }
      }
    },
    button: {
      enable: function(){
        $('#wizard > button')[0].removeAttribute('disabled');
      },
      disable: function(){
        $('#wizard > button')[0].setAttribute('disabled',true);
      }
    }
  },
  editwizard: {
    hide: function(cb){
      $('#editwizard').addClass('bounceOutUp');
      setTimeout(function(){
        $('#editwizard').removeClass('bounceInDown show');
      },800);
      cb && cb();
    },
    show: function(server){
      if (!$('#editwizard').hasClass('show')){
        $('#epath').val(server.path);
        $('#eport').val(server.port);
        $('#ename').val(server.name);
        $('#eserver').val(server.id);
        UI.editwizard.button.enable();
        if ($('#log').hasClass('show')){
          UI.logview.hide();
          setTimeout(function(){
            $('#editwizard').addClass('bounceInDown show');
            $('#editwizard').removeClass('bounceOutUp');
          },500);
        } else {
          $('#editwizard').addClass('bounceInDown show');
          $('#editwizard').removeClass('bounceOutUp');
        }
        $('#ename').focus();
      }
    },
    browseFilepath: function(){
      $('#choosefile2').click();
    },
    reset: function(){
      $('#editwizard > input').val(null);
      ROUTER.getAvailablePort(function(port){
        $('#eport').val(port);
      });
      UI.editwizard.button.disable();
    },
    valid: function(){
      return $('#ename').val().trim().length > 0
        && $('#epath').val().trim().length > 1
        && $('#eport').val().toString().trim().length > 0;
    },
    prepopulate: function(){
      var file = require('path').join($('#epath').val(),'.fenix.json');
      if (require('fs').existsSync(file)){
        var f = require(file);
        $('#ename').val(f.name);
        $('#eport').val(parseInt(f.port));
        if(UI.wizard.valid()){
          UI.wizard.button.enable();
        }
      }
    },
    button: {
      enable: function(){
        $('#editwizard > button')[0].removeAttribute('disabled');
      },
      disable: function(){
        $('#editwizard > button')[0].setAttribute('disabled',true);
      }
    }
  },
  logview: {
    converter: new Converter({newline:true}),
    currentlog: null,
    scrollToBottom: function(){
      var el = $('#log > div')[0];
      el.scrollTop = el.scrollHeight - $(el).height();
    },
    hide: function(){
      var s = ROUTER.getServer(UI.logview.currentlog);
      $('#log').addClass('bounceOut');

      s.syslog.removeEvent('log');
      s.syslog.removeEvent('errormsg');
      s.syslog.removeEvent('warn');

      setTimeout(function(){
        $('#log').removeClass('bounceIn show');
      },800);
    },
    show: function(serverid){
      if (!$('#log').hasClass('show')){
        var s = ROUTER.getServer(serverid);

        UI.logview.currentlog = serverid;

        s.syslog.on('log',function(msg){
          $('#log > div').append('<p class="animated bounceIn">'+UI.logview.clean(msg)+'</p>');
          UI.logview.scrollToBottom();
        });
        s.syslog.on('errormsg',function(msg){
          $('#log > div').append('<p class="animated bounceIn error">'+UI.logview.clean(msg)+'</p>');
          UI.logview.scrollToBottom();
        });
        s.syslog.on('warn',function(msg){
          $('#log > div').append('<p class="animated bounceIn warn">'+UI.logview.clean(msg)+'</p>');
          UI.logview.scrollToBottom();
        });

        $('#log > h3 > span')[0].innerHTML = s.name;
        $('#log > div').empty();
        for(var rec in s.syslog.syslog){
          $('#log > div').append('<p class="animated'+(s.syslog.syslog[rec].indexOf('WARNING: ') >= 0?' warn':'')+(s.syslog.syslog[rec].indexOf('ERROR: ') >= 0?' error':'')+' "timestamp="'+rec+'">'+s.syslog.syslog[rec]+'</p>');
        }
        $('#log').addClass('bounceIn show');
        $('#log').removeClass('bounceOut');

        global.track.event('Web Server','log','Viewed Log',1).send();
      }
    },
    clean: function(msg){
      return msg.replace('\n','<br/>').trim();
    }
  },
  loader: {
    show: function(msg){
      if (!$('#loader').hasClass('show')){
        if (msg){
          $('#loader')[0].innerHTML = msg;
        }
        $('#loader').removeClass('bounceOut');
        $('#loader').addClass('show');
      }
    },
    hide: function(msg){
      if ($('#loader').hasClass('show')){
        $('#loader').addClass('bounceOut');
        $('#loader').removeClass('show');
        $('#loader')[0].innerHTML = 'Loading...';
      }
    }
  },
  _growl:{
    app: new Growler.GrowlApplication('Fenix'),
    init: function(){
      UI._growl.app.setNotifications({
        'Status': {
          displayname: 'Fenix Server Status',
          enabled: true,
          icon: require('fs').readFileSync('./lib/icons/fenix.png')
        }
      });
      UI._growl.app.register();
      UI._growl.initialized = true;
    },
    initialized: false,
    lastmessage: null
  },
  lastgrowl: null,
  notify: function(msg){
    if (!UI._growl.initialized){
      UI._growl.init();
    }
    if (ROUTER.loading || typeof global.windows.main === 'string'){
      return;
    }
    msg = msg || {};
    if (typeof msg === 'string'){
      msg = {
        text: msg,
        title: 'Fenix Alert'
        //sticky,
        //priority (1,2,3,4,5.... 2 = critical),
        //icon
      };
    }
    // Prevent duplication
    var checksum = (msg.type||'Status')+JSON.stringify(msg);
    if (checksum !== UI._growl.lastmessage){
      UI._growl.lastmessage = checksum;
      setTimeout(function(){
        UI._growl.lastmessage = null;
      },300);
      UI._growl.app.sendNotification(msg.type||'Status',msg);
    } else {
      console.log('Duplicate notification error:',(msg.type||'Status'),msg);
    }
  },
  updateAvailable: function(){
    $('BODY').addClass('updateavailable');
  }
};
UI._growl.init();

window.onresize = function(){
  UI.server.resizeMask();
};
