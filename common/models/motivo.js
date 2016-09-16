'use strict';

module.exports = function(Motivo) {
	Motivo.disableRemoteMethod("create", true);
	Motivo.disableRemoteMethod("upsert", true);
	Motivo.disableRemoteMethod("updateAll", true);
	Motivo.disableRemoteMethod("updateAttributes", false);
	Motivo.disableRemoteMethod("createChangeStream", true);
	Motivo.disableRemoteMethod("replaceOrCreate", true);
	Motivo.disableRemoteMethod("upsertWithWhere", true);
	Motivo.disableRemoteMethod("replaceById", true);

	Motivo.disableRemoteMethod("deleteById", true);
	 
	Motivo.disableRemoteMethod("confirm", true);
	Motivo.disableRemoteMethod("count", true);
	Motivo.disableRemoteMethod("exists", true);
};
