const utils = require("./utils.js");
const fs = require("fs");
const NULL = utils.NULL;


class ModuleHandler {
    constructor(debug) {
        this.isDebug = debug||false;
        this.data = new ModuleData();
        this.dataHandler = new DataHandler(debug);
        this.modules = {};
    }
    initData(datafile) {
        this.dataHandler.init(datafile);
    }
    registerAll(path) {
        const moduleFiles = fs.readdirSync(path);
        for (let i=0; i<moduleFiles.length; i++) {
            const Module = require("./modules/"+moduleFiles[i]);
            this.register(new Module(this.isDebug));
        }
    }
    loadAll() {
        for (let i=0; i<this.data.module.length; i++) {
            if (!this.data.module[i].isExample) this.load(this.data.module[i]);
        }
        this.sort();
    }
    register(module) { //registers the module
        this.data.module.push(module); //pushes the module object into the array, so it can be accessed through iteration
        this.modules[module.refname]=module; //pushes the module object into the module object, so it can be accessed manually using AI.ModuleHandler.modules
        
        if (this.isDebug) {
            console.log(utils.getTimeStamp() + "ModuleHandler: Module \"" + module.refname + "\" succesfully registered.");
        }

    }
    load(module) { //makes the module autorun with each evenpacket
        if (this.data.checkReg(module) && !this.data.checkLoad(module)){
            this.data.loaded.push(module);
            this.data.sorted=false;
        }
        
        if (this.isDebug) {
            console.log(utils.getTimeStamp() + "ModuleHandler: Module \"" + module.refname + "\" succesfully loaded.");
        }
    }
    unload(module) {
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
    }
    loadByProp(prop, value) { //loads registered modules using name, id, uid, etc.
        var module = this.data.searchReg(prop, value);
        this.load(module);
    }
    unloadByProp(prop, value) { //unloads loaded modules using name,id, uid, etc.
        var module = this.data.searchLoad(prop, value);
        this.unload(module);
    }
    comparefunc(a,b) { //used in Modules.sort() to sort the modules in the array from lowest to highest ID
        if (a.id < b.id){
            return -1;
        } else if (a.id > b.id){
            return 1;
        } else {
            return 0;
        }
    }
    sort() { //sorts the loaded modules array by ID, increasing order
        if (!this.data.sorted){
            this.data.loaded.sort(this.comparefunc);
            this.data.sorted=true;
        }
    }
    send(eventpacket) { //sends the eventpacket and infopacket to all modules
        this.dataHandler.smartSave();
        let infopacket = new InfoPacket();
        
        for (var i=0, j=this.data.loaded.length; i<j; i++){
            
            if (infopacket.doJump) { //If another module asked for jump
                const index = this.data.searchLoadIndex("uid", infopacket.jumpUid); //find the module index in the loaded array
                if (index !== -1) { //if exists
                    i = index; //jump
                }
                infopacket.doJump = false;
            }
            
            try {
                this.data.loaded[i].main(eventpacket,infopacket, this.dataHandler.getData(this.data.loaded[i].uid));
            } catch (err) {
                //handle corrupted infopacket here
                if (this.isDebug){
                    console.log(utils.getTimeStamp() + "ModuleHandler: ERROR in Module '" + this.data.loaded[i].name + "' " + err);
                }

                continue;
            }
            if (infopacket.doSave) {
                this.dataHandler.save();
                infopacket.doSave = false;
            }
            if (infopacket.doTerminate) {
                infopacket.doTerminate = false;
                process.exit();
            }
            if (infopacket.isHalted) break;
        }
        
    }

}

class ModuleData {
    constructor() {
        this.module = [];
        this.loaded = [];
        this.sorted = false;
    }
    check(arrayname, entry) {
        return (this[arrayname].indexOf(entry) !== -1);
    }
    checkReg(module) {
        return this.check("module", module);
    }
    checkLoad(module) {
        return this.check("loaded", module);
    }
    search(arrayname, prop, value) { //searches for module in array using property and value
        var array = this[arrayname];
        for (var i=0, j=array.length; i<j; i++){
            if (array[i][prop]===value){
                return array[i]; //if found, returns the module object, otherwise return false
            } else {
                return false;
            }
        }
    }
    searchReg(prop, value) { //searches registered modules by property and value
        return this.search("module", prop, value);
    }
    searchLoad(prop, value) { //searches loaded modules by property and value
        return this.search("loaded", prop, value);
    }
    searchLoadIndex(prop, value) {
        const arrayname = "loaded";
        var array = this[arrayname];
        for (var i=0, j=array.length; i<j; i++){
            if (array[i][prop]===value){
                return i; //if found, returns the module index, otherwise return -1
            } else {
                return -1;
            }
        }
    }
}


class InfoPacket {
    constructor() {
        this.output = new OutputData();
        this.isHalted = false;
        this.doJump = false;
        this.doSave = false;
        this.doTerminate = false;
        this.jumpID = 0;
    }
    halt() {
        this.isHalted = true;
    }
    jump(uid) {
        this.doJump = true;
        this.jumpUid = uid;
    }
    save() {
        this.doSave = true;
    }
    exit() {
        this.doTerminate = true;
    }
}

class OutputData {
    constructor() {
        this.message = [[],[],[],[]]; //[message, delay (ms), mode of speech, user]
        this.action = [[],[],[],[]];
    }
    addMessage(msg, delay, mode, user) {
        this.message[0].push(msg||"...");
        this.message[1].push(+delay||0);
        this.message[2].push(mode||2);
        this.message[3].push(user||NULL);
    }
    addAction(action, delay, info, user) {
        this.action[0].push(action||false);
        this.action[1].push(+delay||0);
        this.action[2].push(info||NULL);
        this.action[3].push(user||NULL);
    }
}

class DataHandler {
    constructor(debug) {
        this.isDebug = debug||false;
        this.internalData = {};
        this.eventCounter = 0;
        this.dataFile = "./DEFAULT.json";
    }
    init(dataFile) {
        this.dataFile = dataFile;
        this.load();
        const me = this;
        //this.interval = setInterval(function(){const jsonData = JSON.stringify(me.internalData); fs.writeFileSync(me.dataFile, jsonData);}, 30000);
    }
    initReadOnly(dataFile) {
        this.dataFile = dataFile;
        this.load();
    }
    smartSave() {
        const me = this;
        if (me.eventCounter < 0) {
            me.eventCounter = 0;
        }
        me.eventCounter++;
        //console.log(me.eventCounter);
        this.saveTimer = setTimeout(
                function() {
                    me.eventCounter--;
                    if (me.eventCounter === 0) {
                        me.save();
                        //console.log("Saved.");
                    }
                    //console.log(me.eventCounter);
                }, 30000);
    }
    load() {
        try {
            const jsonData = fs.readFileSync(this.dataFile);
            this.internalData = JSON.parse(jsonData);
            if(this.isDebug) console.log(utils.getTimeStamp() + "DataHandler: Loaded database from file.");
        } catch (err) {
            if(this.isDebug) console.log(utils.getTimeStamp() + "DataHandler: Database not present, creating new database...");
            fs.writeFileSync(this.dataFile, "{}");
            if(this.isDebug) console.log(utils.getTimeStamp() + "DataHandler: Done.");
        }

    }
    save() {
        const jsonData = JSON.stringify(this.internalData);
        fs.writeFileSync(this.dataFile, jsonData);
        if(this.isDebug) console.log(utils.getTimeStamp() + "DataHandler: Saved database to file.");
    }
    getData(uid) {
        if (this.internalData[uid]) {
            return this.internalData[uid];
        } else {
            this.internalData[uid] = {};
            return this.internalData[uid];
        }
    }
}


module.exports = ModuleHandler;