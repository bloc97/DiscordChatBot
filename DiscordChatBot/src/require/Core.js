const ModuleHandler = require("./ModuleHandler.js");
const utils = require("./utils.js");

class AI {
    constructor(api, debug) {
        this.api = api;
        this.isDebug = debug||false;
        this.moduleHandler = new ModuleHandler();
        if (this.isDebug) {
            console.log(this.api);
            console.log(this.moduleHandler);
        }
    }
    updateData(id, name, nick) {
        this.id = id;
        this.name = name;
        this.nick = nick||this.getNick(name);
        if (this.isDebug) {
            console.log("ID: " + this.id);
            console.log("Name: " + this.name);
            console.log("Nick: " + this.nick);
        }
    }
    getNick(name) {
        let nick = name;
        for (let i=0; i<name.length; i++) {
            if (!utils.isLetter(name.charAt(i))) {
                nick = name.substring(0, i).toLowerCase();
                break;
            }
        }
        return nick;
    }

}

module.exports = AI;