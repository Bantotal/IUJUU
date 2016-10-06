'use strict';

var randomstring = require("randomstring");

module.exports = function(Regalo) {

	Regalo.disableRemoteMethod("create", true);
	Regalo.disableRemoteMethod("upsert", true);
	Regalo.disableRemoteMethod("updateAll", true);
	Regalo.disableRemoteMethod("updateAttributes", false);
	Regalo.disableRemoteMethod("createChangeStream", true);
	Regalo.disableRemoteMethod("replaceOrCreate", true);
	Regalo.disableRemoteMethod("upsertWithWhere", true);
	Regalo.disableRemoteMethod("replaceById", true);
	Regalo.disableRemoteMethod("patchOrCreate", true);

	Regalo.disableRemoteMethod("find", true);
	Regalo.disableRemoteMethod("findById", false);
	Regalo.disableRemoteMethod("findOne", true);
	 
	Regalo.disableRemoteMethod("deleteById", true);
	 
	Regalo.disableRemoteMethod("confirm", true);
	Regalo.disableRemoteMethod("count", true);
	Regalo.disableRemoteMethod("exists", true);

	Regalo.beforeCreate = function(next, modelInstance) {
		  
		var codigo = randomstring.generate({
		  length: 5,
		  charset: 'alphanumeric',
		  capitalization: 'uppercase'
		});

		modelInstance.codigo = codigo.toUpperCase();
		next();
	};

	Regalo.VerifyRegalo = function(codigo, cb) {
		codigo = codigo.toUpperCase()
		Regalo.find({ where: {codigo:codigo} }, function(err, regaloEncontrado){
			if (err)
				return cb(err);

			if(regaloEncontrado[0] == undefined) 
				return cb(null, {})
			else
				return cb(null, regaloEncontrado[0])
		});
	}

	Regalo.remoteMethod(
        'VerifyRegalo', 
        {
          accepts: [{arg: 'codigo', type: 'string', required: true}],
          returns: {arg: 'regalo', type: 'object'},
          http: {path: '/regalos/:codigo', verb: 'get'},
          description: 'Obtiene un regalo por codigo'
        }
    );

};
