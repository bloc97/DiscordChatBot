/* global AI */

registerPlugin({
	name: 'TS-CHAP (Module: COMP)', //TS-CHAP CHAtbot Project
	version: '0.01',
	description: 'TS-CHAP Command Processor Module, enables the use of commands.',
	author: 'Bloc97',
	vars: [
	]
	
	},

	function(sinusbot, config){
            
            var command = {
                name : "COMP",
                desc : "Command Processor",
                refname : "Command", //use this name to call AI.Module.<refname>
                id : 100, //ID used to load modules in order
                uid : "comp1000", //unique ID used by database, do not change after setting one. Can be any string.
                checkIsCommand : function(msg){ //checks for first character symbols (commands)
                    var firstchar = msg.charAt(0);
                    var secondchar = msg.charAt(1);
                    if ((firstchar.toLowerCase() === firstchar.toUpperCase()) && (+firstchar !== +firstchar) && (secondchar !== " ")){//Not a character, nor a number, nor a whitespace
                        return true;
                    } else {
                        return false;
                    }
                },
                checkIsBB : function(msg){ //checks for BB code
                    var firstchar = msg.charAt(0);
                    var lastchar = msg.charAt(msg.length-1);
                    if (firstchar === "[" && lastchar === "]"){
                        return true;
                    } else {
                        return false;
                    }
                },
                main : function(eventpacket,infopacket){
                    if (this.checkIsBB(eventpacket.msg)){
                        //infopacket.output.addMessage("Debug: Contains BB Code.");
                        return false;
                    };
                    if (!this.checkIsCommand(eventpacket.msg)){ //If it's not a command, break
                        //infopacket.output.addMessage("Debug: Not a command.");
                        return false;
                    };
                    var msg = eventpacket.msg;
                    infopacket.command = {};
                    infopacket.command.symbol = msg.charAt(0);
                    if (msg.indexOf(" ") !== -1){
                        //infopacket.output.addMessage("Debug: Multiple Arguments.");
                        infopacket.command.verb = msg.substring(1, msg.indexOf(" "));
                        infopacket.command.args = msg.substring(msg.indexOf(" ")+1, msg.length);
                    } else {
                        //infopacket.output.addMessage("Debug: One Argument.");
                        infopacket.command.verb = msg.substring(1, msg.length);
                        infopacket.command.args = AI.NULL;
                    }

                    
                    //infopacket.output.addMessage("Debug: Command Detected.");
                    infopacket.output.addMessage("The command was: "+infopacket.command.symbol+" "+infopacket.command.verb+" "+infopacket.command.args);
                    
                }
                
                
            };

            sinusbot.on("connect", function(){
                AI.Module.register(command);
                AI.Module.load(command);
            });
	}
);
