const ModuleHandler = require("./ModuleHandler.js");
const utils = require("./utils.js");

class AI {
    constructor(api, debug) {
        this.api = api;
        this.isDebug = debug||false;
        this.moduleHandler = new ModuleHandler(this.isDebug);
        if (this.isDebug) {
            utils.logNew("New AI Created, API: " + this.api);
        }
    }

}

module.exports = AI;