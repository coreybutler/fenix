// Create a new Request Bin
var RequestBrowser = new RequestBin(),
		Growler = require('growler'),
		gui = require('nw.gui');

// Create the UI controller
var UI = {
	status: $('#status'),
	request: $('#request'),
	server: {
		start: function(){
			UI.status.removeClass().addClass('online').empty()[0].innerHTML = "Accepting requests at <a href='javascript:gui.Shell.openExternal(\"http://localhost:"+RequestBrowser.port.toString()+"\");'>http://localhost:"+RequestBrowser.port.toString()+"</a>"
			+(RequestBrowser.connecting 
				? "<div class=\"hint--left hint--rounded\" data-hint=\"Connecting to the internet...\">Connecting</div>"
				: "<div class=\"hint--left hint--rounded\" data-hint=\"Make this available on the internet.\"><a href='#' id='connect'>Share</a></div>");
			$('#connect').click(function(e){
				e.preventDefault();
				RequestBrowser.share();
			});
		},
		stop: function(){
			UI.status.removeClass().addClass('offline').empty()[0].innerHTML = "Offline";
		},
		share: function(){
			UI.status.removeClass().addClass('public').empty()[0].innerHTML = "Accepting requests at <a href='javascript:gui.Shell.openExternal(\""+RequestBrowser.publicUrl+"\");'>"+RequestBrowser.publicUrl+"</a>"
			+ "<div class=\"hint--left hint--rounded\" data-hint=\"Stop internet sharing.\"><a href='#' id='disconnect'>Unshare</a></div>";
			$('#disconnect').click(function(e){
				e.preventDefault();
				RequestBrowser.unshare();
			});
		},
		unshare: function(){
			UI.server.start();
			//UI.status.removeClass().addClass('online').empty()[0].innerHTML = "Accepting requests at <a href=''>http://localhost:"+RequestBrowser.port.toString()+"</a>";
		},
		request: function(req){
			UI.render.requestItem({
				method: req.method,
				source: req.source,
				time: new Date(req.timestamp)
			});
			UI.notify({
				text: req.method.toUpperCase()+' request received from '+req.source,
				title: req.method.toUpperCase()+' Received'
			});
		}
	},
	render: {
		requestItem: function(req){
			var dt = new Date(req.time);
			dt = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString();
			var str = '<div id="'+req.time.toJSON()+'" class="animated bounceIn"><span class="'+req.method.toLowerCase()+'">'+req.method.toUpperCase()+'</span><span>'+req.source+'</span><span>'+dt+'</span>';
			$('#requests').prepend(str);
			$('#requests > div').off('click').click(function(e){
				e.preventDefault();
				$(e.currentTarget.parentNode).find('.selected').removeClass('selected');
				$(e.currentTarget).addClass('selected');
				UI.render.request(e.currentTarget.id);
			});
		},
		request: function(timestamp){
			req = RequestBrowser.getRequestDetails(timestamp);
			UI.request[0].setAttribute('method',req.method);
			UI.request[0].setAttribute('source',req.source);
			var type = req.headers.hasOwnProperty('content-type') ? (req.headers['content-type'].toLowerCase().indexOf('json') >= 0 ? 'javascript' : 'markup') : 'markup';
			UI.request.empty()[0].innerHTML = '<a href="#" id="showheader">Show Headers</a><div id="headers" class="hide animated">'+UI.render.headers(req.headers)+'</div><pre id="code" class="language-'+type+' line-numbers" style="background-color: transparent !important;"><code>'+UI.render.body(req.body)+'</code></pre>';
			Prism.highlightAll();//Prism.highlightElement($('#code')[0]);
			$('a.url-link').forEach(function(el){
				el.setAttribute('href','javascript:gui.Shell.openExternal("'+el.getAttribute('href')+'");');
			});
			$('#showheader').click(function(e){
				e.preventDefault();
				UI.render.toggleHeader();
			});
			$('#requests > div > span').off('click').click(function(e){
				e.preventDefault();
				UI.render.request(e.currentTarget.parentNode.id);
			});
		},
		headers: function(headers){
			var str = '<table width="100%"><tbody><tr><th>Header</th><th>Value</th></tr>';
			Object.keys(headers).forEach(function(type){
				str += '<tr><td>'+type+':</td><td>'+headers[type]+'</td></tr>';
			});
			return str += '</tbody></table>';
		},
		body: function(body){
			try {
				body = JSON.parse(body);
				console.log("Is JSON");
			} catch (e){
				console.log(e);
			}
			return typeof body !== 'string'  ? JSON.stringify(body,null,2) : body;
		},
		showHeaders: function(){
			$('#headers').removeClass('hide');
			$('#showheader')[0].innerHTML = 'Hide Headers';
			$('#headers').addClass('fadeInDown');
			setTimeout(function(){
				$('#headers').removeClass('fadeInDown');
			},700);
		},
		hideHeaders: function(){
			$('#showheader')[0].innerHTML = 'Show Headers';
			$('#headers').addClass('fadeOutUp');
			setTimeout(function(){
				$('#headers').addClass('hide');
				$('#headers').removeClass('fadeOutUp');
			},700);
		},
		toggleHeader: function(){
			if ($('#headers').hasClass('hide')){
				UI.render.showHeaders();
			} else {
				UI.render.hideHeaders();
			}
		}
	},
	_growl:{
		app: new Growler.GrowlApplication('Fenix'),
		init: function(){
			UI._growl.app.setNotifications({
				'Status': {
					displayname: 'Fenix Receiver',
					enabled: true,
					icon: require('fs').readFileSync('./lib/icons/webhooks.png')
				}
			});
			UI._growl.app.register();
			UI._growl.initialized = true;
		},
		initialized: false
	},
	notify: function(msg){
		if (!UI._growl.initialized){
			UI._growl.init();
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
		UI._growl.app.sendNotification(msg.type||'Status',msg);
	}
};
UI._growl.init();

// When the browser is ready, start the server
RequestBrowser.on('ready',function(){
	RequestBrowser.start();
});

// When the server changes state, show the user.
RequestBrowser.on('start',UI.server.start);
RequestBrowser.on('share',function(){
	UI.server.share.apply(this,arguments);
	UI.notify({
		title: 'Fenix Receiver Shared',
		text: 'The Fenix Receiver is now shared publicly.'
	});
});
RequestBrowser.on('unshare',function(){
	UI.server.unshare.apply(this,arguments);
	UI.notify({
		title: 'Fenix Receiver Unshared',
		text: 'The Fenix Receiver is no longer shared publicly.'
	});
});
RequestBrowser.on('stop', function(){
	UI.server.stop.apply(this,arguments);
	UI.notify({
		title: 'Fenix Receiver Stopped',
		text: 'The Fenix Receiver server has stopped.'
	});
});
RequestBrowser.on('request',UI.server.request);
RequestBrowser.on('connecting',UI.server.start);