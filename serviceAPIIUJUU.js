   var Service = require('C:/Users/mvarela/AppData/Roaming/npm/node_modules/node-windows').Service;
 
	// Create a new service object
	var svc = new Service({
	  name:'API_IUJUU_Nueva',
	  description: 'API Node IUJUU',
	  script: 'C:\\IUJUU\\upserver.js'
	});

	// Listen for the "install" event, which indicates the
	// process is available as a service.
	svc.on('install',function(){
	  svc.start();
	});

	svc.install();
