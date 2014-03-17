var express = require('express'),
		api = express();

api.use(express.json());
api.use(express.urlencoded());

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
				server.share();
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
	x.shared = server.shared;
	x.publicUrl = server.publicUrl || null;
	res.json(x);
});

// Get the current worknig version
api.get('/version',function(req,res){
	res.send(require('../../package.json').version);
});


//api.get('/server/list',function(req,res){});
//api.get('/server/list',function(req,res){});

api.listen(33649);