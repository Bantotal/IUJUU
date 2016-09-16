'use strict';

module.exports = function(Metododepago) {
	Metododepago.disableRemoteMethod("create", true);
	Metododepago.disableRemoteMethod("upsert", true);
	Metododepago.disableRemoteMethod("updateAll", true);
	Metododepago.disableRemoteMethod("updateAttributes", false);
	Metododepago.disableRemoteMethod("createChangeStream", true);
	Metododepago.disableRemoteMethod("replaceOrCreate", true);
	Metododepago.disableRemoteMethod("upsertWithWhere", true);
	Metododepago.disableRemoteMethod("replaceById", true);

	Metododepago.disableRemoteMethod("deleteById", true);
	 
	Metododepago.disableRemoteMethod("confirm", true);
	Metododepago.disableRemoteMethod("count", true);
	Metododepago.disableRemoteMethod("exists", true);
};
