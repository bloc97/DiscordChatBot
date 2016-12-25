/* global AI */

registerPlugin({
	name: 'TS-CHAP (Module: DATH)', //TS-CHAP CHAtbot Project
	version: '0.01',
	description: 'TS-CHAP Database Handler Module, allows globally structured data access.',
	author: 'Bloc97',
	vars: [
	]
	
	},

	function(sinusbot, config){
            
            var datahandler = {
                name : "DATH",
                desc : "Database Handler",
                refname : "Database", //use this name to call AI.Module.<refname>
                id : -1, //Do not load datahandler!
                uid : "dath1000", //unique ID used by database, do not change after setting one. Can be any string.
                instid : "default_CHAP", //id used to store database in a sinusbot file
                main : function(eventpacket,infopacket){ //if this module somehow got loaded (don't load it though) at least won't throw error
                },
                database : {},
                createEntry : function(uid){
                    if (!database[uid]){ //if entry does not exist
                        this.database[uid] = {};
                    }
                },
                getEntry : function(uid){
                    return this.database[uid]||false; //if entry does not exist, return false
                },
                save : function(){
                    sinusbot.setVarGlobal(this.instid, this.database);
                },
                load : function(){
                    this.database = sinusbot.getVarGlobal(this.instid);
                },
                reset : function(){
                    this.database = {};
                },
                delete : function(){
                    sinusbot.unsetVarGlobal(this.instid);
                }
                
                
            };

            sinusbot.on("connect", function(){
                AI.Module.register(datahandler); 
                //Do not load datahandler! Only register.
            });
	}
);
