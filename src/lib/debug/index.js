module.exports = function(){
  process.on('uncaughtexception',function(e){
    console.dir(e);
    alert(e.message);
    if (e.code ==='EACCES'){
      alert('Insufficient permissions.');
    }
    if (!fenix.controller.isDevToolsOpen() && fenix.config.dev){
      fenix.controller.showDevTools();
    }
  });
};
