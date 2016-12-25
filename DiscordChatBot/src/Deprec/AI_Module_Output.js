/* global AI */

registerPlugin({
	name: 'TS-CHAP (Module: OUTP)', //TS-CHAP CHAtbot Project
	version: '0.01',
	description: 'TS-CHAP Output Module, allows the bot to speak and perform actions synchronously.',
	author: 'Bloc97',
	vars: [
	]
	
	},

	function(sinusbot, config){
            
            var output = {
                name : "OUTP",
                desc : "Output Handler",
                refname : "Output", //use this name to call AI.Module.<refname>
                id : 1e11, //ID used to load modules in order
                uid : "outp1000", //unique ID used by database, do not change after setting one. Can be any string.
                main : function(eventpacket,infopacket){
                    if (eventpacket.clientNick === eventpacket.botNick){
                        return false;
                    }
                    this.message(infopacket);
                    this.action(infopacket);
                    
                },
                message : function(infopacket){ //reads packet and sends them back to the sinusbot event handler
                    for (var i=0, j=infopacket.output.message[0].length; i<j; i++){
                        sinusbot.chatChannel(infopacket.output.message[0][i]);
                    }
                },
                action : function(eventpacket,infopacket){

                }
                
            };

            sinusbot.on("connect", function(){
                AI.Module.register(output);
                AI.Module.load(output);
            });
	}
);
