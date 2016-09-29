'use strict';

var async = require('async');

module.exports = function(app, cb) {

	async.series([

		// ------- ALTA DE USUARIOS ------- //
	    function(callback) {	
			var usuarios = [
				{ 
					nombre: 'Martin', 
					apellido: 'Varela',
					avatar: 'adasdasdadwrg',
					email: 'mvarela@iujuu.com', 
					password: '1234',
					regalosEnLosQueParticipa: [
					{
				      id: '1',
				      esAdministrador: true,
				      pago: true						
					},
					{
				      id: '2',
				      esAdministrador: false,
				      pago: false						
					}]
				},
				{ 
					nombre: 'Santiago', 
					apellido: 'Ravera',
					avatar: 'dsfdsfsdf',
					email: 'sravera@iujuu.com', 
					password: '1234',
					regalosEnLosQueParticipa: [
					{
				      id: '2',
				      esAdministrador: true,
				      pago: true						
					},
					{
				      id: '3',
				      esAdministrador: false,
				      pago: true						
					}]
				},
				{ 
					nombre: 'Marcos', 
					apellido: 'Begerez', 
					documento: '12345678',
					email: 'mbegerez@iujuu.com', 
					password: '1234',
					regalosEnLosQueParticipa: [
					{
				      id: '3',
				      esAdministrador: true,
				      pago: false						
					},
					{
				      id: '1',
				      esAdministrador: false,
				      pago: true						
					}]
				}
			];

			app.models.Usuario.create(usuarios, function(err, usuariosRespuesta) {
				if (err)
					return cb(err);

				console.log('Agrega `usuarios` desde boot script:', usuariosRespuesta);

				callback(null, 'usuario');
			});
	    },

	    // ------- ALTA DE REGALOS ------- //
	    function(callback) {
			var regalos = [
				{ 
					usuarioAdministradorId: '1', 
					descripcion: 'Cumpleaños de Valentina', 
					motivo: 'Cumpleaños', 
					fechaDeCierre: new Date("September 30, 2016"), 
					montoObjetivo: 2500, 
					montoPorPersona: 100, 
					saldo: 200, 
					regalosSugeridos: [
						{ 
							decsripcion: 'Jean', 
						  	votos: 1
						}, 
						{ 
							decsripcion: 'Cartera', 
						  	votos: 1
						}
					], 
					imagen: 'fdfsfsdfsdf',
					participantes: ['1', '3'],
					pagos: ['1','2'],
					activo: true,
					cuentaId: 1 
				},
				{ 
					usuarioAdministradorId: '2', 
					descripcion: 'Despedida de Vidal', 
					motivo: 'Despedida', 
					fechaDeCierre: new Date("December 10, 2016"), 
					montoObjetivo: 3000, 
					montoPorPersona: 200, 
					saldo: 200, 
					regalosSugeridos: [
						{ 
							decsripcion: 'Guitarra', 
						  	votos: 2
						}
					], 
					imagen: 'fdfsfsdfsdf',
					participantes: ['2', '1'],
					pagos: ['3'],
					activo: true,
					cuentaId: 2
				},
				{ 
					usuarioAdministradorId: '3', 
					descripcion: 'Casamiento de Gustavo', 
					motivo: 'Casamiento', 
					fechaDeCierre: new Date("December 15, 2016"), 
					montoObjetivo: 15000, 
					montoPorPersona: 500, 
					saldo: 500, 
					regalosSugeridos: [
						{ 
							decsripcion: 'Viaje', 
						  	votos: 1
						}
					], 
					imagen: 'fdfsfsdfsdf',
					participantes: ['3', '2'],
					pagos: ['4'],
					activo: true,
					cuentaId: 3  
				}
			];


			app.models.Regalo.create(regalos, function(err, regalosRespuesta) {
				if (err)
					return cb(err);

				console.log('Agrega `regalos` desde boot script:', regalosRespuesta);

				callback(null, 'regalo');
			});
	    },

	    // ------- ALTA DE PAGOS ------- //
	    function(callback) {
			var pagos = [
				{ 
					regaloId: '1',
					usuarioId: '1', 
					importe: 100, 
					comentario: 'Feliz cumple Vale :)', 
					foto: 'dfdsjfhsdkhf'
				},
				{ 
					regaloId: '1',
					usuarioId: '2', 
					importe: 100, 
					comentario: 'Feliz cumpleeee !!', 
					foto: 'dfdsjfhsdkhf'
				},
				{ 
					regaloId: '2',
					usuarioId: '3', 
					importe: 200, 
					comentario: 'Te queremos, buen viaje!', 
					foto: 'dfdsjfhsdkhf'
				},
				{ 
					regaloId: '3',
					usuarioId: '2', 
					importe: 500, 
					comentario: 'Felicidades Amigo, mucha suerte', 
					foto: 'dfdsjfhsdkhf'
				}
			];


			app.models.Pago.create(pagos, function(err, pagosRespuesta) {
				if (err)
					return cb(err);

				console.log('Agrega `pagos` desde boot script:', pagosRespuesta);

				callback(null, 'pago');
			});
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
