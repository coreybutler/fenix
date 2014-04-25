// Wizard Controller
$('#wizard > button').on('click',function(e){
  UI.server.create({
    name: $('#wizard > #name').val(),
    port: parseInt($('#wizard > #port').val()),
    path: $('#wizard > #path').val()
  });
});

$('#wizard > a').on('click',function(e){
  e.preventDefault();
  UI.wizard.hide();
});

ROUTER.getAvailablePort(function(port){
  $('#port').val(port);
});

$('#filebrowser').on('click',function(e){
  e.preventDefault();
  UI.wizard.browseFilepath();
});

document.querySelector('#choosefile').addEventListener('change',function(evt){
  $('#path').val(this.value);
  UI.wizard.prepopulate();
  UI.wizard.valid() && UI.wizard.button.enable();
},false);

$('#port').on('keypress',function(evt){
  evt = (evt) ? evt : window.event;
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
  }
  return true;
});

var fn = function(){
  UI.wizard.prepopulate();
};

var delay = null;

$('#path').on('keyup',function(e){
  clearTimeout(delay);
  delay = setTimeout(fn,900);
});

$('#wizard > input').on('keyup',function(e){
  if (UI.wizard.valid()){
    UI.wizard.button.enable();
  } else {
    UI.wizard.button.disable();
  }
});
