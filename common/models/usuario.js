'use strict';
var async = require('async');
var app = require('../../server/server');

module.exports = function(Usuario) {

	Usuario.disableRemoteMethod("create", false);
	Usuario.disableRemoteMethod("upsert", true);
	Usuario.disableRemoteMethod("updateAll", true);
	Usuario.disableRemoteMethod("updateAttributes", false);
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
					respuesta.push(regaloItem);
					callback();			
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
    	regalo.participantes.push(id);

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

					cb(null, pagoCreado);
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

    	function modificoRegalo() {
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

		modificoRegalo();

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
        'regalosCerrar', 
        {
          accepts: [{arg: 'id', type: 'string', required: true}, {arg: 'regaloId', type: 'string', required: true}, {arg: 'email', type: 'string', required: true}],
          returns: {arg: 'close', type: 'boolean'},
          http: {path: '/:id/regalos/:regaloId/cerrar', verb: 'post'},
          description: 'Cierra una colecta'
        }
    );

};
