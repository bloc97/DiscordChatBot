AI = {
    NULL : "_NULL_",
    Core : {
        compare : function(string, substr){ //checks if substring is in string
            return (string.search(substr) !== -1);
        },
        contains : function(array, string){ //checks if string is in array
            return (array.indexOf(string) !== -1);
        }
    },
    Event : {
        packetise : function(event){ //transforms the event into a packet for modules
            var that = {};
            that.rawmsg = event.msg||AI.NULL;
            that.msg = event.msg.toLowerCase()||AI.NULL;
            that.mode = event.mode;
            that.clientId = event.clientId;
            //that.clientUid = event.clientUid;
            that.clientNick = event.clientNick;
            that.botNick = sinusbot.getNick(); //Nick that appears in teamspeak
            that.botName = ""; //Name that bot responds to
            //that.isBotCalled = (AI.Core.compare(that.msg,that.botName)||that.mode<=1);
            return that;
        },
        Infopacket : function(){ //information packet reserved for modules
            this.output={};
            this.output.message = [[],[],[],[]]; //[message, delay (ms), mode of speech, user]
            this.output.action = [[],[],[],[]];
            this.isHalted = false;

            this.output.addMessage = function(msg, delay, mode, user){ //adds message to object
                this.message[0].push(msg||"...");
                this.message[1].push(delay||0);
                this.message[2].push(mode||2);
                this.message[3].push(user||AI.NULL);
            };
            this.output.addAction = function(action, delay, info, user){
                this.action[0].push(action||false);
                this.action[1].push(delay||0);
                this.action[2].push(info||AI.NULL);
                this.action[3].push(user||AI.NULL);
            };

        }
    },
    Module : {
        isDebug : false,
        data : { //object used to track all modules
            module : [], //registered modules go here
            loaded : [], //loaded modules go here (modules that autorun)
            sorted : false,
            check : function(arrayname, entry){ //checks if module is in array
                return (this[arrayname].indexOf(entry) !== -1);
            },
            checkReg : function(module){
                return this.check("module", module);
            },
            checkLoad : function(module){
                return this.check("loaded", module);
            },
            search : function(arrayname, prop, value){ //searches for module in array using property and value
                                            var array = this[arrayname];
                for (var i=0, j=array.length; i<j; i++){
                    if (array[i][prop]===value){
                        return array[i]; //if found, returns the module object, otherwise return false
                    } else {
                        return false;
                    }
                }
            },
            searchReg : function(prop, value){ //searches registered modules by property and value
                return this.search("module", prop, value);
            },
            searchLoad : function(prop, value){ //searches loaded modules by property and value
                return this.search("loaded", prop, value);
            }
        },
        register : function(module){ //registers the module
            this.data.module.push(module); //pushes the module object into the array, so it can be accessed through iteration
            AI.Module[module.refname]=module; //pushes the module object into the AI object, so it can be accessed manually using AI.Module.obj

        },
        load : function(module){ //makes the module autorun with each evenpacket
            if (this.data.checkReg(module) && !this.data.checkLoad(module)){
                this.data.loaded.push(module);
                this.data.sorted=false;
            }
        },
        unload : function(module){
            if (this.data.checkLoad(module)){
                var oldarr = this.data.loaded;
                var newarr = [];
                for (var i=0, j=oldarr.length; i<j; i++){
                    if (oldarr[i]!==module){
                        newarr.push(oldarr[i]);
                    }
                }
                oldarr = newarr;
            }
        },
        loadByProp : function(prop, value){ //loads registered modules using name, id, uid, etc.
            var module = this.data.searchReg(prop, value);
            this.load(module);
        },
        unloadByProp : function(prop, value){ //unloads loaded modules using name,id, uid, etc.
            var module = this.data.searchLoad(prop, value);
            this.unload(module);
        },
        comparefunc : function(a,b){ //used in Modules.sort() to sort the modules in the array from lowest to highest ID
            if (a.id < b.id){
                return -1;
            } else if (a.id > b.id){
                return 1;
            } else {
                return 0;
            }
        },
        sort : function(){ //sorts the loaded modules array by ID, increasing order
            if (!this.data.sorted){
                this.data.loaded.sort(this.comparefunc);
                this.data.sorted=true;
            }
        },
        send : function(eventpacket,infopacket){ //sends the eventpacket and infopacket to all modules
            for (var i=0, j=this.data.loaded.length; i<j; i++){
                //infopacket = this.data.loaded[i].main(eventpacket,infopacket); //overwrites infopacket for next module to read
                //*oops* does not need since infopacket is already an object
                try {
                    this.data.loaded[i].main(eventpacket,infopacket);
                } catch (err) {
                    //handle corrupted infopacket here
                    if (this.isDebug){
                        infopacket.output.addMessage("Debug: ERROR in Module '" + this.data.loaded[i].name + "' " + err);
                    }

                    continue;
                }
                if (infopacket.isHalted) break;
            }
//                        if (!this.data.checkLoad("Latency")){
//                            AI.Output.message(eventpacket,infopacket);
//                            AI.Output.action(eventpacket,infopacket);
//                        }
        }
    }//,
//                Output : {
//                    message : function(eventpacket,infopacket){ //reads packet and sends them back to the sinusbot event handler
//                        for (var i=0, j=infopacket.output.message[0].length; i<j; i++){
//                            sinusbot.chatChannel(infopacket.output.message[0][i]);
//                        }
//                    },
//                    action : function(eventpacket,infopacket){
//                        
//                    }
//                }
};

module.exports = AI;

sinusbot.on("chat", function(e){
    AI.Module.sort();
    var event = e;

    var eventpacket = AI.Event.packetise(event); //packet that contains the event information
    var infopacket = new AI.Event.Infopacket(); //packet that contains information passed on by modules
    //var metadata = {}; //packet that contains misc info, such as which modules to ignore, or used to send the same event twice across modules.

    //if (eventpacket.clientNick===eventpacket.botNick){
    //    return;
    //}
    //instead check at end, if bot said samething than input, don't output
    //to prevent infinite loops

    AI.Module.send(eventpacket,infopacket);

});

sinusbot.on("poke", function(e){
    AI.Module.sort();
    var event = e;
    event.mode = 0;

    var eventpacket = AI.Event.packetise(event);
    var infopacket = new AI.Event.Infopacket();
    //var metadata = {};

    AI.Module.send(eventpacket,infopacket);

});


