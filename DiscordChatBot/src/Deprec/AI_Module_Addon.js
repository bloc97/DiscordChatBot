/* global AI */

registerPlugin({
	name: 'TS-CHAP (Module: ADDM)', //TS-CHAP CHAtbot Project
	version: '0.01',
	description: 'TS-CHAP Add-on Manager Module, allows the use of Add-ons.',
	author: 'Bloc97',
	vars: [
	]
	
	},

	function(sinusbot, config){
            
            var addonmanager = {
                name : "ADDM",
                desc : "Add-on Manager",
                refname : "Addon", //use this name to call AI.Module.<refname>
                id : 500, //ID used to load modules in order
                uid : "addm1000", //unique ID used by database, do not change after setting one. Can be any string.
                isDebug : false,
                main : function(eventpacket,infopacket){
                    var addonpacket = new this.Addonpacket();
                    this.send(eventpacket,infopacket,addonpacket);
                    
                },
                Addonpacket : function(){
                    this.isHalted=false;
                },
                data : { //object used to track all addons
                    addon : [], //registered addons go here
                    loaded : [], //loaded addons go here (addons that autorun)
                    sorted : false,
                    check : function(array, entry){ //checks if addon is in array
                        return (this[array].indexOf(entry) !== -1);
                    },
                    checkReg : function(addon){
                        return this.check("addon", addon);
                    },
                    checkLoad : function(addon){
                        return this.check("loaded", addon);
                    },
                    search : function(array, prop, value){ //searches for addon in array using property and value
                        for (var i=0, j=array.length; i<j; i++){
                            if (array[i][prop]===value){
                                return array[i]; //if found, returns the addon object, otherwise return false
                            } else {
                                return false;
                            }
                        }
                    },
                    searchReg : function(prop, value){ //searches registered addons by property and value
                        return this.search("addon", prop, value);
                    },
                    searchLoad : function(prop, value){ //searches loaded addons by property and value
                        return this.search("loaded", prop, value);
                    }
                },
                register : function(addon){ //registers the addon
                    this.data.addon.push(addon); //pushes the addon object into the array, so it can be accessed through iteration
                    AI.Module.Addon[addon.refname]=addon; //pushes the addon object into the AI object, so it can be accessed manually using AI.Module.Addon.obj

                },
                load : function(addon){ //makes the addons autorun with each evenpacket
                    if (this.data.checkReg(addon) && !this.data.checkLoad(addon)){
                        this.data.loaded.push(addon);
                        this.data.sorted=false;
                    }
                },
                unload : function(addon){
                    if (this.data.checkLoad(addon)){
                        var oldarr = this.data.loaded;
                        var newarr = [];
                        for (var i=0, j=oldarr.length; i<j; i++){
                            if (oldarr[i]!==addon){
                                newarr.push(oldarr[i]);
                            }
                        }
                        oldarr = newarr;
                    }
                },
                loadByProp : function(prop, value){ //loads registered addons using name, id, uid, etc.
                    var addon = this.data.searchReg(prop, value);
                    this.load(addon);
                },
                unloadByProp : function(prop, value){ //unloads loaded addons using name,id, uid, etc.
                    var addon = this.data.searchLoad(prop, value);
                    this.unload(addon);
                },
                comparefunc : function(a,b){ //used in Addon.sort() to sort the addons in the array from lowest to highest ID
                    if (a.id < b.id){
                        return -1;
                    } else if (a.id > b.id){
                        return 1;
                    } else {
                        return 0;
                    }
                },
                sort : function(){ //sorts the loaded addons array by ID, increasing order
                    if (!this.data.sorted){
                        this.data.loaded.sort(this.comparefunc);
                        this.data.sorted=true;
                    }
                },
                send : function(eventpacket,infopacket,addonpacket){ //sends the eventpacket, infopacket and addonpacket to all addons
                    for (var i=0, j=this.data.loaded.length; i<j; i++){
                        try {
                            this.data.loaded[i].main(eventpacket,infopacket,addonpacket);
                        } catch (err) {
                            if (this.isDebug){
                                infopacket.output.addMessage("Debug: ERROR in Adddon '" + this.data.loaded[i].name + "' " + err);
                            }
                            //handle corrupted packets here
                            continue;
                        }
                        if (infopacket.isHalted || addonpacket.isHalted) break;
                    }
                }
                
                
            };

            sinusbot.on("connect", function(){
                AI.Module.register(addonmanager); //registers module
                AI.Module.load(addonmanager); //loads addon manager
            });
	}
);
