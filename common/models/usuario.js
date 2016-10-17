'use strict';
var async = require('async');
var app = require('../../server/server');

function date_sort(a, b) {
    return new Date(a.fechaDeCierre).getTime() - new Date(b.fechaDeCierre).getTime();
}
                    
module.exports = function(Usuario) {

	Usuario.disableRemoteMethod("create", false);
	Usuario.disableRemoteMethod("upsert", true);
	Usuario.disableRemoteMethod("updateAll", true);
	Usuario.disableRemoteMethod("updateAttributes", true);
	Usuario.disableRemoteMethod("createChangeStream", true);
	Usuario.disableRemoteMethod("replaceOrCreate", true);
	Usuario.disableRemoteMethod("upsertWithWhere", true);
	Usuario.disableRemoteMethod("replaceById", true);

	Usuario.disableRemoteMethod("find", true);
	Usuario.disableRemoteMethod("findById", false);
	Usuario.disableRemoteMethod("findOne", true);
	 
	Usuario.disableRemoteMethod("deleteById", true);
	 
	Usuario.disableRemoteMethod("confirm", true);
	Usuario.disableRemoteMethod("count", true);
	Usuario.disableRemoteMethod("exists", true);
	Usuario.disableRemoteMethod("resetPassword", true);
	 
	Usuario.disableRemoteMethod('__count__accessTokens', false);
	Usuario.disableRemoteMethod('__create__accessTokens', false);
	Usuario.disableRemoteMethod('__delete__accessTokens', false);
	Usuario.disableRemoteMethod('__destroyById__accessTokens', false);
	Usuario.disableRemoteMethod('__findById__accessTokens', false);
	Usuario.disableRemoteMethod('__get__accessTokens', false);
	Usuario.disableRemoteMethod('__updateById__accessTokens', false);

    Usuario.regalos = function(id, cb) {

    	var respuesta = [];
    	var regaloItem = {};

    	Usuario.findById(id, function(err, usuarioEncontrado) {
			if (err)
				return cb(err);

			if(usuarioEncontrado.hasOwnProperty('regalosEnLosQueParticipa')){
				return cb(null, respuesta);
			}

			async.each(usuarioEncontrado.regalosEnLosQueParticipa, function(regalo, callback) {
				app.models.Regalo.findById(regalo.id, function(err, regaloEncontrado) {
					if (err)
						return callback(err);		
					
					regaloItem = regaloEncontrado;
					regaloItem.esAdministrador = regalo.esAdministrador;
					regaloItem.pago = regalo.pago;
                    if(regaloItem.activo){
                        respuesta.push(regaloItem);
                        respuesta.sort(date_sort);
                        callback();	
                    }else{
                        callback();	
                    }
				})

			}, function(err){
			    // if any of the file processing produced an error, err would equal that error
			    if( err ) {
			      return cb(err);
			    } else {
			      return cb(null, respuesta);
			    }
			});
		});	
    }
		
		
    Usuario.regaloId = function(id, regaloId, cb) {

    	var regaloItem = {};

    	Usuario.findById(id, function(err, usuarioEncontrado) {
			if (err)
				return cb(err);

			if(usuarioEncontrado.hasOwnProperty('regalosEnLosQueParticipa')){
				return cb(null, respuesta);
			}

			async.each(usuarioEncontrado.regalosEnLosQueParticipa, function(regalo, callback) {
				if(regalo.id == regaloId){
					app.models.Regalo.findById(regalo.id, function(err, regaloEncontrado) {
						if (err)
							return callback(err);		
						
						regaloItem = regaloEncontrado;
						regaloItem.esAdministrador = regalo.esAdministrador;
						regaloItem.pago = regalo.pago;
						callback();			
					})
				}
				else callback();	
			}, function(err){
			    // if any of the file processing produced an error, err would equal that error
			    if( err ) {
			      return cb(err);
			    } else {
			      return cb(null, regaloItem);
			    }
			});
		});	
    }

    Usuario.regalosAlta = function(id, regalo, cb) {

    	regalo.usuarioAdministradorId = id;
    	regalo.participantes = [];

		app.models.Regalo.create(regalo, function(err, regaloCreado) {
			if (err)
				return cb(err);

			Usuario.findById(id, function(err,usuarioEncontrado){
				if (err)
					return cb(err);
				var participa = {
					id: regaloCreado.id,
					esAdministrador: true,
					pago: false						
				}
				var participacionesUpdate = usuarioEncontrado.regalosEnLosQueParticipa || [];
				participacionesUpdate.push(participa);

			    usuarioEncontrado.updateAttributes({regalosEnLosQueParticipa: participacionesUpdate}, function(err, update){
					if (err)
						return cb(err);

					cb(null, regaloCreado);
			    })
			});
		});
    }

    Usuario.regalosUnirse = function(id, regaloCodigo, cb) {
    	function modificoRegalo(regalo) {
			var participantes = regalo.participantes || [];
			participantes.push(id);

		    regalo.updateAttributes({participantes: participantes}, function(err, update){
				if (err)
					return cb(err);

				cb(null, true);
		    })  		
    	}

    	function modificarUsuario(regalo) {
			Usuario.findById(id, function(err, usuarioEncontrado){
				if (err)
					return cb(err);
				var participa = {
					id: regalo.id,
					esAdministrador: false,
					pago: false						
				}
				var participacionesUpdate = usuarioEncontrado.regalosEnLosQueParticipa || [];
				participacionesUpdate.push(participa);

			    usuarioEncontrado.updateAttributes({regalosEnLosQueParticipa: participacionesUpdate}, function(err, update){
					if (err)
						return cb(err);

					modificoRegalo(regalo)
			    })
			});
    	}

 		app.models.Regalo.find({ where: {codigo:regaloCodigo} }, function(err, regaloEncontrado){
			if (err)
				return cb(err);

			if(regaloEncontrado[0] === undefined)
				return cb('Código incorrecto');

			modificarUsuario(regaloEncontrado[0]);
		}); 

    }

    Usuario.regalosVoto = function(id, regaloId, voto, cb) {
 		app.models.Regalo.findById(regaloId, function(err, regaloEncontrado){
			if (err)
				return cb(err);

			var regalosSugeridos = [];
			var encontro = false;
			async.each(regaloEncontrado.regalosSugeridos, function(item, callback) {

			  if(item.descripcion == undefined){
			    regalosSugeridos.push(item);
			    callback();
			  }
			  else{
				if(item.descripcion.toLowerCase() === voto.toLowerCase()) {
					item.votos += 1;
					regalosSugeridos.push(item);
					encontro = true;
					callback();
				} else {
					regalosSugeridos.push(item);
					callback();
				}
			  }
			}, function(err){
			    // if any of the file processing produced an error, err would equal that error
			    if( err ) {
			      return cb(err);
			    } else {
					if(!encontro) {
						var nuevoItem = { descripcion: voto, votos: 1 }
						regalosSugeridos.push(nuevoItem);
					}
					regaloEncontrado.updateAttributes({ regalosSugeridos: regalosSugeridos }, function(err, update){
						if (err)
							return cb(err);

						cb(null, regalosSugeridos);
					})	
			    }
			});
		});   		
    	
    }

    Usuario.regalosEliminarVoto = function(id, regaloId, voto, cb) {
 		app.models.Regalo.findById(regaloId, function(err, regaloEncontrado){
			if (err)
				return cb(err);

			var regalosSugeridos = [];
			async.each(regaloEncontrado.regalosSugeridos, function(item, callback) {

				if(item.descripcion.toLowerCase() === voto.toLowerCase()) {
					callback();
				} else {
					regalosSugeridos.push(item);
					callback();
				}

			}, function(err){
			    // if any of the file processing produced an error, err would equal that error
			    if( err ) {
			      return cb(err);
			    } else {
					regaloEncontrado.updateAttributes({ regalosSugeridos: regalosSugeridos }, function(err, update){
						if (err)
							return cb(err);

						cb(null, regalosSugeridos);
					})	
			    }
			});
		});   		
    	
    }

    Usuario.regalosPago = function(id, regaloId, pago, cb) {

    	function modificoRegalo(pagoCreado) {
	 		app.models.Regalo.findById(regaloId, function(err, regaloEncontrado){
				if (err)
					return cb(err);

				var pagos = regaloEncontrado.pagos || [];
				pagos.push(pagoCreado.id);

				var nuevoSaldo = regaloEncontrado.saldo + pago.importe;

			    regaloEncontrado.updateAttributes({ pagos: pagos, saldo: nuevoSaldo }, function(err, update){
					if (err)
						return cb(err);

					Usuario.findById(id, function(err,usuarioEncontrado){
						if (err)
							return cb(err);
						var participa = {
							id: regaloId,
							esAdministrador: false,
							pago: true						
						}
						var participacionesUpdate = usuarioEncontrado.regalosEnLosQueParticipa || [];
						if(id == regaloEncontrado.administradorId){
							async.each(participacionesUpdate, function(participacion, callback) {
								if(participacion.esAdministrador){
									participacion.pago = true
								}
							}, function(err){
							    // if any of the file processing produced an error, err would equal that error
							    if( err ) {
							      return cb(err);
							    } else {
								    usuarioEncontrado.updateAttributes({regalosEnLosQueParticipa: participacionesUpdate}, function(err, update){
										if (err)
											return cb(err);

										cb(null, pagoCreado);
								    })
							    }
							});							
						}else{
							participacionesUpdate.push(participa);
						    usuarioEncontrado.updateAttributes({regalosEnLosQueParticipa: participacionesUpdate}, function(err, update){
								if (err)
									return cb(err);

								cb(null, pagoCreado);
						    })
						}
					});
			    })
			});   		
    	}

    	pago.regaloId = regaloId;
    	pago.usuarioId = id;

		app.models.Pago.create(pago, function(err, pagoCreado) {
			if (err)
				return cb(err);

			modificoRegalo(pagoCreado)

		});
    }

    Usuario.regalosCerrar = function(id, regaloId, email, cb) {

    	function modificoRegalo(id, regaloId, email, cb) {
	 		app.models.Regalo.findById(regaloId, function(err, regaloEncontrado){
				if (err)
					return cb(err);

			    regaloEncontrado.updateAttributes({ activo: false }, function(err, update){
					if (err)
						return cb(err);

					cb(null, true);
			    })
			});   		
    	}

			if(validateEmail(email)){
					enviarMail(id, regaloId, email, cb);
			}else{
				return cb("La casilla de email no es valida", false);
			}
		
		

    }


	Usuario.regaloUpdate = function(id,regaloId, descripcion, montoObjetivo, montoPorPersona, fechaDeCierre, cb) {
		function ActualizoRegalo() {
			app.models.Regalo.findById(regaloId, function(err, regaloEncontrado){
				if (err)
					return cb(err);

					if (!descripcion && !montoObjetivo && !montoPorPersona && !fechaDeCierre)
						return cb("Descripcion, monto objetivo, monto por persona y fecha de cierre, son datos requeridos", false);
					
						
					var atts ={};
					if(descripcion)
						atts.descripcion = descripcion;
					
					if(montoObjetivo)
						atts.montoObjetivo = montoObjetivo;
					
					if(montoPorPersona)
						atts.montoPorPersona = montoPorPersona;
					
					if(fechaDeCierre)
						atts.fechaDeCierre = fechaDeCierre;

					if(fechaDeCierre)
						atts.fechaDeCierre = fechaDeCierre;

					regaloEncontrado.updateAttributes(atts, function(err, update){
					if (err)
						return cb(err);

					cb(null, true);
					})
			});   		
			
  		}
		ActualizoRegalo();

		}
		Usuario.userUpdate = function(id, nombre, apellido, telefono, FechaNacimiento, cb) {
			 function actualizoUser() {
				Usuario.findById(id, function(err, usuarioEncontrado) {
						if (err)
							return cb(err);
						
						if (!nombre && !apellido && !telefono && !FechaNacimiento)
							return cb("Nombre, apellido, telefono y fecha de nacimiento, son datos requeridos.", false);
						
							
						var att ={};
						if(nombre)
							att.nombre = nombre;
						
						if(apellido)
							att.apellido = apellido;
						
						if(telefono)
							att.telefono = telefono;
						
						if(FechaNacimiento)
							att.FechaNacimiento = FechaNacimiento;
						

						usuarioEncontrado.updateAttributes(att, function(err, update){
							if (err)
								return cb(err);

							cb(null, true);
							})
				}); 
			 }  
			 actualizoUser();

		}

    Usuario.remoteMethod(
        'regalos', 
        {
          accepts: [{arg: 'id', type: 'string', required: true}],
          returns: {arg: 'regalos', type: 'array'},
          http: {path: '/:id/regalos', verb: 'get'},
          description: 'Obtiene regalos en los que participa el usuario'
        }
    );

    Usuario.remoteMethod(
        'regaloId', 
        {
          accepts: [{arg: 'id', type: 'string', required: true}, {arg: 'regaloId', type: 'string', required: true}],
          returns: {arg: 'regalo', type: 'object'},
          http: {path: '/:id/regalos/:regaloId', verb: 'get'},
          description: 'Obtiene un regalo en el que participa el usuario'
        }
    );

    Usuario.remoteMethod(
        'regalosAlta', 
        {
          accepts: [{arg: 'id', type: 'string', required: true}, {arg: 'regalo', type: 'object', required: true}],
          returns: {arg: 'regalo', type: 'object'},
          http: {path: '/:id/regalos', verb: 'post'},
          description: 'Crea un nuevo regalo del que va a ser administrador'
        }
    );

    Usuario.remoteMethod(
        'regalosUnirse', 
        {
          accepts: [{arg: 'id', type: 'string', required: true}, {arg: 'regaloCodigo', type: 'string', required: true}],
          returns: {arg: 'unido', type: 'boolean'},
          http: {path: '/:id/regalos/:regaloCodigo/unirme', verb: 'post'},
          description: 'Se une a un regalo al que fue invitado'
        }
    );

    Usuario.remoteMethod(
        'regalosPago', 
        {
          accepts: [{arg: 'id', type: 'string', required: true}, {arg: 'regaloId', type: 'string', required: true}, {arg: 'pago', type: 'object', required: true}],
          returns: {arg: 'pago', type: 'object'},
          http: {path: '/:id/regalos/:regaloId/pagar', verb: 'post'},
          description: 'Hace un pago y deja un comentario en un regalo'
        }
    );

    Usuario.remoteMethod(
        'regalosVoto', 
        {
          accepts: [{arg: 'id', type: 'string', required: true}, {arg: 'regaloId', type: 'string', required: true}, {arg: 'voto', type: 'String', required: true}],
          returns: {arg: 'regalosSugeridos', type: 'array'},
          http: {path: '/:id/regalos/:regaloId/votar', verb: 'post'},
          description: 'Agrega una nueva sugerencia de regalo o vota por alguna existente'
        }
    );

    Usuario.remoteMethod(
        'regalosEliminarVoto', 
        {
          accepts: [{arg: 'id', type: 'string', required: true}, {arg: 'regaloId', type: 'string', required: true}, {arg: 'voto', type: 'String', required: true}],
          returns: {arg: 'regalosSugeridos', type: 'array'},
          http: {path: '/:id/regalos/:regaloId/eliminarSugerencia', verb: 'post'},
          description: 'Elimina una sugerencia de regalo'
        }
    );

    Usuario.remoteMethod(
        'regalosCerrar', 
        {
          accepts: [{arg: 'id', type: 'string', required: true}, {arg: 'regaloId', type: 'string', required: true}, {arg: 'email', type: 'string', required: true}],
          returns: {arg: 'close', type: 'boolean'},
          http: {path: '/:id/regalos/:regaloId/cerrar', verb: 'post'},
          description: 'Cierra una colecta'
        }
    );
	Usuario.remoteMethod(
        'regaloUpdate', 
        {
          accepts: [{arg: 'id', type: 'string', required: true},{arg: 'regaloId', type: 'string', required: true}, {arg: 'descripcion', type: 'string', required: false}, {arg: 'montoObjetivo', type: 'number', required: false}, {arg: 'montoPorPersona', type: 'number', required: false}, {arg: 'fechaDeCierre', type: 'date', required: false}],
          returns: {arg: 'Updated', type: 'boolean'},
          http: {path: '/:id/regalos/:regaloId/actualizar', verb: 'post'},
          description: 'Actualiza una colecta'
        }
    );

		Usuario.remoteMethod(
        'userUpdate', 
        {
          accepts: [{arg: 'id', type: 'string', required: true},{arg: 'nombre', type: 'string', required: true},{arg: 'apellido', type: 'string', required: true},{arg: 'telefono', type: 'string', required: true},{arg: 'FechaNacimiento', type: 'date', required: true}],
          returns: {arg: 'Updated', type: 'boolean'},
          http: {path: '/:id/update', verb: 'post'},
          description: 'Actualiza Usuario'
        }
    );

		

};

function enviarMail(id, regaloId, email, cb) {

      var Pago = app.models.Pago;
			Pago.find({where: {regaloId: regaloId}}, function(err, modelInstance) {

						var usercomment = "";
						var fullcomments= "";

						for(var k in modelInstance){
									usercomment = '<div><p>'+ modelInstance[k].comentario +'</p> <img src="'+ modelInstance[k].foto +'"></div><br>'
									fullcomments = fullcomments + usercomment
						}
						var nodemailer = require('nodemailer');
						var inlineBase64 = require('nodemailer-plugin-inline-base64');

						// create reusable transporter object using the default SMTP transport
						var transporter = nodemailer.createTransport('smtps://iujuu.regalo%40gmail.com:ABCD1234%40@smtp.gmail.com');

						// setup e-mail data with unicode symbols
						var mailOptions = {
								from: '"IUJUU" <iujuu.regalo@gmail.com>', // sender address
								to: email, // list of receivers
								subject: 'IUJUU tu regalo llego', // Subject line
								html: '<b>Regalar nunca fue tan simple</b><br>' + fullcomments // html body
						};
						transporter.use('compile', inlineBase64);
						// send mail with defined transport object
						transporter.sendMail(mailOptions, function(error, info){
									if(error){
												return cb("Error enviando email", false);
									}else{
												console.log('Message sent: ' + info.response);
												modificoRegalo(id, regaloId, email, cb);
									}
									
						});
			 });

}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}