const utils = require("../utils.js");

class PermsMod { //This is an example module
    
    constructor(debug) {
        this.name = "PERM";
        this.desc = "Permissions Module";
        this.refname = "PermsMod";
        this.id = 150, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "perm1000"; //Unique ID used to save data to file
        this.command = "perm"; //Command that activates this module
        this.help = ""; //Help that displays when users ask
        this.isDebug = debug||false;
        //modules are run in order, from the smallest id to the largest id.
        
    }
    main(eventpacket, infopacket, data) {
//        if ([""].indexOf(eventpacket.userId) !== -1) {
//            return;
//        }
//        infopacket.halt();
        
        
    }
}

module.exports = PermsMod;