const EventHandler = require("EventHandler.js");
const ModuleHandler = require("ModuleHandler.js");
const utils = require("utils.js");

class AI {
    constructor(id, name, api, nick) {
        this.id = id;
        this.name = name;
        this.nick = nick||this.getNick(name);
        this.api = api;
    }
    getNick(name) {
        let nick = name;
        for (let i=0; i<name.lenght; i++) {
            if (!utils.isLetter(name.charAt(i))) {
                nick = name.substring(0, i);
                break;
            }
        }
        return nick;
    }

}

module.exports = AI;