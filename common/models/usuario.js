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
	Usuario.disableRemoteMethod("findById", true);
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

    Usuario.regalosUnirse = function(id, regaloId, cb) {

    	function modificoRegalo() {
	 		app.models.Regalo.findById(regaloId, function(err, regaloEncontrado){
				if (err)
					return cb(err);

				var participantes = regaloEncontrado.participantes || [];
				participantes.push(id);

			    regaloEncontrado.updateAttributes({participantes: participantes}, function(err, update){
					if (err)
						return cb(err);

					cb(null, true);
			    })
			});   		
    	}

		Usuario.findById(id, function(err,usuarioEncontrado){
			if (err)
				return cb(err);
			var participa = {
				id: regaloId,
				esAdministrador: false,
				pago: false						
			}
			var participacionesUpdate = usuarioEncontrado.regalosEnLosQueParticipa || [];
			participacionesUpdate.push(participa);

		    usuarioEncontrado.updateAttributes({regalosEnLosQueParticipa: participacionesUpdate}, function(err, update){
				if (err)
					return cb(err);

				modificoRegalo()
		    })
		});
    }

    Usuario.regalosPago = function(id, regaloId, pago, cb) {

    	function modificoRegalo(pagoCreado) {
	 		app.models.Regalo.findById(regaloId, function(err, regaloEncontrado){
				if (err)
					return cb(err);

				var pagos = regaloEncontrado.pagos || [];
				pagos.push(pagoCreado.id);

			    regaloEncontrado.updateAttributes({pagos: pagos}, function(err, update){
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

    Usuario.cuentasDePago = function(id, cb) {

    	var respuesta = [];

    	Usuario.findById(id, function(err, usuarioEncontrado) {
			if (err)
				return cb(err);

			async.each(usuarioEncontrado.cuentasDePagoAsociadas, function(cuentaDePago, callback) {
				app.models.CuentaDePago.findById(cuentaDePago, function(err, cuentaDePagoEncontrada) {
					if (err)
						return callback(err);		

					respuesta.push(cuentaDePagoEncontrada);
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
          accepts: [{arg: 'id', type: 'string', required: true}, {arg: 'regaloId', type: 'string', required: true}],
          returns: {arg: 'unido', type: 'boolean'},
          http: {path: '/:id/regalos/:regaloId/unirme', verb: 'post'},
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
        'cuentasDePago', 
        {
          accepts: [{arg: 'id', type: 'string', required: true}],
          returns: {arg: 'cuentas', type: 'array'},
          http: {path: '/:id/cuentasDePago', verb: 'get'},
          description: 'Obtiene las cuentas de pago asociadas al usuario'
        }
    );

};
