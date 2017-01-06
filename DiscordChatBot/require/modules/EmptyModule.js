const utils = require("../utils.js");

class EmptyMod { //This is an example module
    
    constructor(debug) {
        this.name = "EMPT";
        this.desc = "Empty Module";
        this.refname = "EmptyMod";
        this.id = 500, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "empt1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
        this.isExample = true; //delete this line to enable the module
        //modules are run in order, from the smallest id to the largest id.
        
    }
    main(eventpacket, infopacket, data) {
        
    }
}

module.exports = EmptyMod;