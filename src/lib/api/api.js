var express = require('express'),
    api = express(),
    fs = require('fs');

api.use(express.json());
api.use(express.urlencoded());
api.use(require('connect-multiparty'));

api.use(function(req,res,next){
  res.set({
    'x-powered-by': 'Fenix'
  });
  next();
});

// Get a list of available servers
// Returns an array of available servers.
api.get('/server/list',function(req,res){
  res.json(Object.keys(ROUTER.servers).map(function(id){
    var server = ROUTER.getServer(id), tmp = server.json;
    tmp.running = server.running;
    tmp.shared = server.shared;
    if (tmp.shared){
      tmp.publicUrl = server.publicUrl;
    }
    delete tmp.screenshot;
    delete tmp.cfg_paths;
    delete tmp.suppressnotices;
    return tmp;
  }));
});

// Stop a server
api.put('/server/:server/stop',function(req,res){
  var server = ROUTER.getServer(req.params.server);
  if (!server) {
    server = ROUTER.getServer(Object.keys(ROUTER.servers).filter(function(id){
      var s = ROUTER.getServer(id);
      if (s.name.trim().toLowerCase() === req.params.server.trim().toLowerCase()){
        return true;
      } else if (s.path.trim().toLowerCase() === req.params.server.trim().toLowerCase()) {
        return true;
      } else if (s.port === parseInt(req.params.server)){
        return true;
      }
      return false;
    })[0]);
  }
  if (!server) {
    res.send(404);
    return;
  }
  if (!server.running){
    res.send(200);
    return;
  }
  server.stop(function(){
    res.send(200);
  });
});

// Start a server
api.put('/server/:server/start',function(req,res){
  var server = ROUTER.getServer(req.params.server);
  if (!server) {
    server = ROUTER.getServer(Object.keys(ROUTER.servers).filter(function(id){
      var s = ROUTER.getServer(id);
      if (s.name.trim().toLowerCase() === req.params.server.trim().toLowerCase()){
        return true;
      } else if (s.path.trim().toLowerCase() === req.params.server.trim().toLowerCase()) {
        return true;
      } else if (s.port === parseInt(req.params.server)){
        return true;
      }
      return false;
    })[0]);
  }
  if (!server) {
    res.send(404);
    return;
  }
  if (server.running){
    var x = server.json;
    delete x.screenshot;
    delete x.cfg_paths;
    delete x.suppressnotices;
    x.shared = server.shared;
    x.publicUrl = server.publicUrl || null;
    res.json(x);
    return;
  }
  // Make sure the directory exists
  if (!require('fs').existsSync(server.path)){
    res.send(410);
  }
  // Make sure there won't be port conflicts
  ROUTER.portscanner.checkPortStatus(server.port,'127.0.0.1',function(err,status){
    if (status === 'open'){
      res.send(409);
      return;
    }
    server.start(function(){
      var x = server.json;
      delete x.screenshot;
      delete x.cfg_paths;
      delete x.suppressnotices;
      x.shared = server.shared;
      x.publicUrl = server.publicUrl || null;
      res.json(x);
    });
  });
});

api.put('/server/:server/share',function(req,res){
  var server = ROUTER.getServer(req.params.server);
  if (!server) {
    server = ROUTER.getServer(Object.keys(ROUTER.servers).filter(function(id){
      var s = ROUTER.getServer(id);
      if (s.name.trim().toLowerCase() === req.params.server.trim().toLowerCase()){
        return true;
      } else if (s.path.trim().toLowerCase() === req.params.server.trim().toLowerCase()) {
        return true;
      } else if (s.port === parseInt(req.params.server)){
        return true;
      }
      return false;
    })[0]);
  }
  if (!server) {
    res.send(404);
    return;
  }
  var data = server.json;
  delete data.screenshot;
  delete data.cfg_paths;
  delete data.suppressnotices;
  if (server.shared) {
    data.publicUrl = server.publicUrl;
    res.json(data);
    return;
  }
  // If the server isn't running, start it first.
  if (!server.running){
    ROUTER.portscanner.checkPortStatus(server.port,'127.0.0.1',function(err,status){
      if (status === 'open'){
        res.send(409);
        return;
      }
      server.start(function(){
        server.once('share',function(){
          data.publicUrl = server.publicUrl;
          res.json(data);
        });
        setTimeout(function(){
          server.share();
        },500);
      });
    });
  } else {
    server.on('share',function(){
      data.publicUrl = server.publicUrl;
      res.json(data);
    });
    server.share();
  }
});

api.put('/server/:server/unshare',function(req,res){
  var server = ROUTER.getServer(req.params.server);
  if (!server) {
    server = ROUTER.getServer(Object.keys(ROUTER.servers).filter(function(id){
      var s = ROUTER.getServer(id);
      if (s.name.trim().toLowerCase() === req.params.server.trim().toLowerCase()){
        return true;
      } else if (s.path.trim().toLowerCase() === req.params.server.trim().toLowerCase()) {
        return true;
      } else if (s.port === parseInt(req.params.server)){
        return true;
      }
      return false;
    })[0]);
  }
  if (!server) {
    res.send(404);
    return;
  }
  if (!server.shared){
    res.send(200);
    return;
  }
  server.unshare(function(){
    res.send(200);
  });
});

api.put('/server/:server/status',function(req,res){
  var server = ROUTER.getServer(req.params.server);
  if (!server) {
    server = ROUTER.getServer(Object.keys(ROUTER.servers).filter(function(id){
      var s = ROUTER.getServer(id);
      if (s.name.trim().toLowerCase() === req.params.server.trim().toLowerCase()){
        return true;
      } else if (s.path.trim().toLowerCase() === req.params.server.trim().toLowerCase()) {
        return true;
      } else if (s.port === parseInt(req.params.server)){
        return true;
      }
      return false;
    })[0]);
  }
  if (!server) {
    res.send(404);
    return;
  }
  var x = server.json;
  delete x.screenshot;
  delete x.cfg_paths;
  delete x.suppressnotices;
  x.shared = server.shared;
  x.publicUrl = server.publicUrl || null;
  res.json(x);
});

// Returns the details of a specific server.
api.get('/server/:server/list',function(req,res){
  var s = Object.keys(ROUTER.servers).filter(function(id){
    var server = ROUTER.getServer(id);
    // Handle ports
    if (!isNaN(parseInt(req.params.server))){
      return parseInt(req.params.server) === server.port;
    }
    return server.name.trim().toLowerCase() === req.params.server.trim().toLowerCase();
  }).map(function(id){
    var server = ROUTER.getServer(id), tmp = server.json;
    tmp.running = server.running;
    tmp.shared = server.shared;
    if (tmp.shared){
      tmp.publicUrl = server.publicUrl;
    }
    delete tmp.screenshot;
    delete tmp.cfg_paths;
    delete tmp.suppressnotices;
    return tmp;
  })[0];
  if (s === undefined){
    res.send(404);
  } else {
    res.json(s);
  }
});

api.post('/server',function(req,res){
  if (!req.body.hasOwnProperty('path') || !req.body.hasOwnProperty('name')){
    res.send(400);
    return;
  }
  // Create the new server
  ROUTER.getAvailablePort(function(aport){
    var server = ROUTER.createServer({
      name: req.body.name,
      path: req.body.path,
      port: aport
    });
    if (!fs.existsSync(req.body.path)){
      // If the server path doesn't exist but the server wasa created, notify with a 201
      res.send(201);
      return;
    } else {
      // Start a valid server
      server.on('start',function(){
        setTimeout(function(){
          var tmp = server.json;
          tmp.running = server.running;
          tmp.shared = server.shared;
          if (tmp.shared){
            tmp.publicUrl = server.publicUrl;
          }
          delete tmp.screenshot;
          delete tmp.cfg_paths;
          delete tmp.suppressnotices;
          res.send(tmp);
        },1500);
      });
      server.start();
    }
  },parseInt(req.body.port)||80);
});

// Delete a server
api.del('/server/:server',function(req,res){
  var s = Object.keys(ROUTER.servers).filter(function(id){
    var server = ROUTER.getServer(id);
    // Handle ports
    if (!isNaN(parseInt(req.params.server))){
      return parseInt(req.params.server) === server.port;
    } else if (req.params.server === server.path){
      return true;
    }
    return server.name.trim().toLowerCase() === req.params.server.trim().toLowerCase();
  }).map(function(id){
    var server = ROUTER.getServer(id), tmp = server.json;
    tmp.running = server.running;
    tmp.shared = server.shared;
    if (tmp.shared){
      tmp.publicUrl = server.publicUrl;
    }
    delete tmp.screenshot;
    delete tmp.cfg_paths;
    delete tmp.suppressnotices;
    return tmp;
  })[0];
  if (s === undefined){
    res.send(404);
  } else {
    ROUTER.on('deleteserver',function(svr){
      if (svr.id = s.id){
        res.send(200);
      }
      return;
    });
    ROUTER.deleteServer(s.id)
  }
});

// Close the desktop app
api.put('/close',function(req,res){
  setTimeout(function(){
    var gui = require('nw.gui');
    gui.Window.get(this).close();
  },500);
   res.send(200);
});

// Get the current worknig version
api.get('/version',function(req,res){
  res.send(require('../../package.json').version);
});


//api.get('/server/list',function(req,res){});
//api.get('/server/list',function(req,res){});

api.listen(33649);
