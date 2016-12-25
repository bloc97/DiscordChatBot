/* global AI */

registerPlugin({
	name: 'TS-CHAP (Module: SNLP)', //TS-CHAP CHAtbot Project
	version: '0.01',
	description: 'TS-CHAP Language Processing Module, enables simple language processing.',
	author: 'Bloc97',
	vars: [
	]
	
	},

	function(sinusbot, config){
            
            var snlp = {
                name : "SNLP",
                desc : "Simple Natural Language Processor",
                refname : "Snlp", //use this name to call AI.Module.<refname>
                id : 110, //ID used to load modules in order
                uid : "snlp1000", //unique ID used by database, do not change after setting one. Can be any string.
                checkIsCommand : function(msg){
                    var firstchar = msg.charAt(0);
                    if ((firstchar.toLowerCase() === firstchar.toUpperCase()) && (+firstchar !== +firstchar)){//Not a character, nor a number, nor a whitespace
                        return true;
                    } else {
                        return false;
                    }
                },
                main : function(eventpacket,infopacket){
                    if (this.checkIsCommand(eventpacket.msg)){ //If it's a command, break
                        return false;
                    }
                    
                    
                    infopacket.output.addMessage("Debug: Natural Language Detected.");
                    
                }
                
                
            };

            sinusbot.on("connect", function(){
                AI.Module.register(snlp);
                AI.Module.load(snlp);
            });
	}
);
