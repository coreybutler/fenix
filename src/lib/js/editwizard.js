// Wizard Controller
$('#editwizard > button').on('click',function(e){
  var id = $(e.currentTarget.parentNode).find('input[type="hidden"]').val();
  var s = ROUTER.getServer(id);
  var running = s.running, shared = s.shared, recapture = false;
  s.suppressnotices = true;
  s.stop(function(){
    if (s.path !== $('#epath').val()){
      s.syslog.log('Path changed from '+s.path+' to '+$('#epath').val());
    }
    if (s.name !== $('#ename').val()){
      s.syslog.log('Name changed from '+s.name+' to '+$('#ename').val());
    }
    if (s.port !== parseInt($('#eport').val())){
      s.syslog.log('Path changed from '+s.port.toString()+' to '+$('#eport').val().toString());
    }
    s.path = $('#epath').val();
    s.port = $('#eport').val();
    s.name = $('#ename').val();

    UI.server.update(id);
    
    if (!require('fs').existsSync(s.path)){
      $('#'+id).addClass('unavailable');
      s.suppressnotices = false;
    } else {
      if (running){
        s.once('start',function(){
          if (shared){
            s.share();
          }
          s.suppressnotices = false;
          UI.notify({
            title: 'Server Modified',
            text: s.name+' was modified and restarted. Now running '+s.path+' on port '+s.port.toString()
          });
        });
        s.start();
         ROUTER.save();
      } else {
        s.suppressnotices = true;
      }
    }
    UI.editwizard.hide();
  });
});

$('#editwizard > a').on('click',function(e){
  e.preventDefault();
  UI.editwizard.hide();
});

$('#filebrowser2').on('click',function(e){
  e.preventDefault();
  UI.editwizard.browseFilepath();
});

document.querySelector('#choosefile2').addEventListener('change',function(evt){
  $('#epath').val(this.value);
  UI.editwizard.prepopulate();
},false);

$('#eport').on('keypress',function(evt){
  evt = (evt) ? evt : window.event;
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
  }
  return true;
});

var efn = function(){
  UI.editwizard.prepopulate();
};

var edelay = null;

$('#epath').on('keyup',function(e){
  clearTimeout(edelay);
  edelay = setTimeout(efn,900);
});

$('#editwizard > input').on('keyup',function(e){
  if (UI.editwizard.valid()){
    UI.editwizard.button.enable();
  } else {
    UI.editwizard.button.disable();
  }
});
