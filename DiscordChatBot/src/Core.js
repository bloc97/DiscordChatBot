const ModuleHandler = require("ModuleHandler.js");
const utils = require("utils.js");

class AI {
    constructor(api) {
        this.api = api;
        this.moduleHandler = new ModuleHandler();
    }
    updateData(id, name, nick) {
        this.id = id;
        this.name = name;
        this.nick = nick||this.getNick(name);
    }
    getNick(name) {
        let nick = name;
        for (let i=0; i<name.length; i++) {
            if (!utils.isLetter(name.charAt(i))) {
                nick = name.substring(0, i);
                break;
            }
        }
        return nick;
    }

}

module.exports = AI;