/* global AI */

registerPlugin({
	name: 'TS-CHAP (Module: TIME)', //TS-CHAP CHAtbot Project
	version: '0.01',
	description: 'TS-CHAP Latency/Timekeeping Module, allows the bot to realistically mimic "response time".',
	author: 'Bloc97',
	vars: [
	]
	
	},

	function(sinusbot, config){
            
            var latency = {
                name : "TIME",
                desc : "Bot Latency Handler",
                refname : "Latency", //use this name to call AI.Module.<refname>
                id : 1e10, //ID used to load modules in order
                uid : "time1000", //unique ID used by database, do not change after setting one. Can be any string.
                main : function(eventpacket,infopacket){

                    
                }
                
                
            };

            sinusbot.on("connect", function(){
                AI.Module.register(latency);
                AI.Module.load(latency);
            });
	}
);
