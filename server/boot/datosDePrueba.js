'use strict';

var async = require('async');

module.exports = function(app, cb) {
	//acá me voy guardando los usuarios creados
	var usuariosCreados = [];
	//acá me voy guardando los REGALOS creados
	var regalosCreados = [];

	function agregaRegaloEnUsuario(usuarioId, regaloId, cb){
		if(usuariosCreados[usuarioId].regalosEnLosQueParticipa === undefined) 
			usuariosCreados[usuarioId].regalosEnLosQueParticipa = [];

		usuariosCreados[usuarioId].regalosEnLosQueParticipa.push(regalosCreados[regaloId].id)

		app.models.Usuario.upsert(usuariosCreados[usuarioId], function(err, respuesta) {
			if (err)
				return cb(err);
			console.log('Agrega `regalosEnLosQueParticipa` al usuario: ' + respuesta.nombre);
			usuariosCreados[usuarioId] = respuesta;
		});
	}

	function agregaParticipantesAlRegalo(regaloId, participantes, cb){
		app.models.Regalo.updateAll({ id: regalosCreados[regaloId].id }, { participantes: participantes }, function(err, respuesta) {
			if (err)
				return cb(err);

			console.log('Agrega `participantes` al regalo: ' + regalosCreados[regaloId].descripcion);

		});
	}

	async.series([

		// ------- ALTA DE USUARIOS ------- //
	    function(callback) {	
			var usuarios = [
				{ nombre: 'Martin', apellido: 'Varela', email: 'mvarela@iujuu.com', password: '1234' },    //0
				{ nombre: 'Marcos', apellido: 'Begerez', email: 'mbegerez@iujuu.com', password: '1234' },  //1
				{ nombre: 'Santiago', apellido: 'Ravera', email: 'sravera@iujuu.com', password: '1234' },  //2
				{ nombre: 'Fernando', apellido: 'Panizza', email: 'fpanizza@iujuu.com', password: '1234' } //3
			];
			app.models.Usuario.create(usuarios, function(err, usuariosRespuesta) {
				if (err)
					return cb(err);

				console.log('Agrega `usuarios` desde boot script:', usuariosRespuesta);

				usuariosCreados = usuariosRespuesta;

				callback(null, 'usuario');
			});
	    },

	    // ------- ALTA DE REGALOS ------- //
	    function(callback) {
			var regalos = [
				{ usuarioAdministradorId: usuariosCreados[0].id, descripcion: 'Cumpleaños de Valentina', 
				motivo: 'Cumpleaños', fechaDeCierre: new Date("September 30, 2016"), montoObjetivo: 2500, montoPorPersona: 100, 
				saldo: 2200, regalosSugeridos: [{ decsripcion: 'Jean', votos: 5 }, { decsripcion: 'Cartera', votos: 3 }], activo: true },
				{ usuarioAdministradorId: usuariosCreados[3].id, descripcion: 'Despedida de Noelia', 
				motivo: 'Despedida', fechaDeCierre: new Date("October 17, 2016"), montoObjetivo: 4500, montoPorPersona: 200, 
				saldo: 200, regalosSugeridos: [], activo: true }
			];
			app.models.Regalo.create(regalos, function(err, regalosRespuesta) {
				if (err)
					return cb(err);

				console.log('Agrega `regalos` desde boot script:', regalosRespuesta);

				regalosCreados = regalosRespuesta;

				callback(null, 'regalo');
			});
	    },

	    // ------- ALTA DE PARTICIPACIONES ------- //
	    function(callback) {
	    	//regalo 1
	    	var participantes = [usuariosCreados[0].nombre + ' ' + usuariosCreados[0].apellido, usuariosCreados[1].nombre + ' ' + usuariosCreados[1].apellido];
	    	//regalo, participantes, cb
	    	agregaParticipantesAlRegalo(0, participantes, cb);
			//usuario, regalo, cb
			agregaRegaloEnUsuario(0, 0, cb);
			agregaRegaloEnUsuario(1, 0, cb);

			//regalo 2
	    	var participantes = [usuariosCreados[0].nombre + ' ' + usuariosCreados[0].apellido, usuariosCreados[3].nombre + ' ' + usuariosCreados[3].apellido];
	    	agregaParticipantesAlRegalo(1, participantes, cb);
	    	agregaRegaloEnUsuario(0, 1, cb);
	    	agregaRegaloEnUsuario(3, 1, cb);

			callback(null, 'regalo');
	        
	    },

	    // ------- FIN ------- //
	    function(callback) {
			cb();
	        callback(null, 'fin');
	    }
	],
	// error callback
	function(err, results) {
	    // results is now equal to ['usuario', 'regalo']
	});


	
};
