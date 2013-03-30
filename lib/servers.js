process.on('uncaughtException',function(e){
  if (e.message.indexOf('EADDRINUSE') >= 0){
    alert('The server could not be started. Another process is already running on the same port.');
  } else {
    alert(e.message);
  }
});

var send = require('send'),
    http = require('http'),
    uuid = require('node-uuid'),
    url = require('url'),
    fs = require('fs'),
    running = {};

var save = function(data){
  if (!data){
    localStorage.servers = JSON.stringify(servers);
    return;
  }
  if (!data.id){
    data.id = uuid.v1().replace('-','');
  }
  servers[data.id] = data;
  createServer(data);
  delete servers[data.id].id;
  localStorage.servers = JSON.stringify(servers);
}

var startServer = function(id,callback) {
  if (running[id] == undefined){
    if (servers[id] !== undefined){
      if (!fs.existsSync(servers[id].d)){
        alert('The server could not be started because the directory does not exist:\n'+servers[id].d);
        return;
      }
      running[id] = {
        //log: [],
        server: http.createServer(function(req,res){
          // Custom directory handling logic:
          function redirect() {
            //running[id].log.push(new Date().toLocaleString()+': [REQ] '+url.parse(req.url).pathname);
            res.statusCode = 301;
            res.setHeader('Location', req.url + '/');
            res.end('Redirecting to ' + req.url + '/');
          }

          function procError(err){
            //running[id].log.push(new Date().toLocaleString()+': [ERROR] '+err.message);
            res.statusCode = err.status || 500;
            res.end(err.message);
          }

          send(req, url.parse(req.url).pathname)
            .from(servers[id].d)
            .on('error', procError)
            .on('directory', redirect)
            .pipe(res);
        })
      };

      /*running[id].server.on('request',function(req,res){
        running[id].log.push(new Date().toLocaleString()+': [REQ] '+req.url);
      });*/

      running[id].server.once('close',function(){
        closeServer(id);
      });

      try {
        running[id].server.listen(servers[id].p,function(){
          //running[id].log.push(new Date().toLocaleString()+': Server #'+id+' started on port '+servers[id].p+' from '+servers[id].d);
          callback && callback();
        });
      } catch(e) {
        alert('EXCEPTION: '+e.message);
      }
    } else {
      alert('Cannot find server (or it does not exist).');
    }
  }
};

var stopServer = function(id,callback) {
  try{
    running[id].server.close();
    delete running[id];
    callback && callback();
  } catch(e) {};
}