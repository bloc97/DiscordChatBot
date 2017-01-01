const ModuleHandler = require("./ModuleHandler.js");
const utils = require("./utils.js");

class AI {
    constructor(api, debug) {
        this.api = api;
        this.isDebug = debug||false;
        this.moduleHandler = new ModuleHandler(this.isDebug);
        if (this.isDebug) {
            console.log(utils.getTimeStamp() + "New AI Created, API: " + this.api);
        }
    }
//    updateData(id, name, nick) {
//        this.id = id;
//        this.name = name;
//        this.nick = nick;
//        if (this.isDebug) {
//            console.log("ID: " + this.id);
//            console.log("Name: " + this.name);
//            console.log("Nick: " + this.nick);
//        }
//    }

}

module.exports = AI;