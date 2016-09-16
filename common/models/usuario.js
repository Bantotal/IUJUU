'use strict';

module.exports = function(Usuario) {
	Usuario.disableRemoteMethod("create", false);
	Usuario.disableRemoteMethod("upsert", true);
	Usuario.disableRemoteMethod("updateAll", true);
	Usuario.disableRemoteMethod("updateAttributes", false);
	Usuario.disableRemoteMethod("createChangeStream", true);
	Usuario.disableRemoteMethod("replaceOrCreate", true);
	Usuario.disableRemoteMethod("upsertWithWhere", true);
	Usuario.disableRemoteMethod("replaceById", true);

	Usuario.disableRemoteMethod("find", false);
	Usuario.disableRemoteMethod("findById", true);
	Usuario.disableRemoteMethod("findOne", true);
	 
	Usuario.disableRemoteMethod("deleteById", true);
	 
	Usuario.disableRemoteMethod("confirm", true);
	Usuario.disableRemoteMethod("count", true);
	Usuario.disableRemoteMethod("exists", true);

};
