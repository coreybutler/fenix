var gui = require('nw.gui');

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

if (process.platform === 'darwin'){
  global.windows.main.setShowInTaskbar(true);
}