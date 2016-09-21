'use strict';

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

};
