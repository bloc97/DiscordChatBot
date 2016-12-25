class ModuleHandler {
    constructor() {
        this.isDebug = false;
        this.data = new ModuleData();
    }
    register(module) { //registers the module
        this.data.module.push(module); //pushes the module object into the array, so it can be accessed through iteration
        this[module.refname]=module; //pushes the module object into the AI object, so it can be accessed manually using AI.Module.obj

    }
    load(module) { //makes the module autorun with each evenpacket
        if (this.data.checkReg(module) && !this.data.checkLoad(module)){
            this.data.loaded.push(module);
            this.data.sorted=false;
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
    send(eventpacket,infopacket) { //sends the eventpacket and infopacket to all modules
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
}


module.exports = ModuleHandler;