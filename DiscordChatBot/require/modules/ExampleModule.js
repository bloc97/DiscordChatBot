const utils = require("../utils.js");

class ExampMod { //This is an example module
    
    constructor(debug) {
        this.name = "EXMP";
        this.desc = "Example Module";
        this.refname = "ExampMod";
        this.id = 2000, //ID used to load modules in order, use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "exmp1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
        this.isExample = true; //delete this line to enable the module
        //modules are run in order, from the smallest id to the largest id.
        
    }
    main(eventpacket, infopacket, data) { //this function runs for each event the eventhander and modulehandler accepts
        //Eventpacket is a packet that is given by EventHandler
        //infopacket is an object that is passed through all modules, useful for transfering data between them
        //data is an data object that is passed only to this current module, its contents are saved in the database, then to a file, so you can save data permanently.
        //each module have a different data object
        
        //infopacket.halt() stops all next modules from executing for this event
        //infopacket.jump(uid) instead of going to the next module by ID, it jumps to the module with uid, then continues from there
        //infopacket.save() forces the database to be saved to the file immediately, after this module has finished running
        //infopacket.exit() does the same thing as process.exit(), but saves the database first, then exits.
        
        return; //this module is an example, it shouldn't do anything
        
        if (eventpacket.type !== "message") { //If it wasn't a message
            return; //Stop processing and pass to next module
        }
        if (!eventpacket.isSelf) { //If the command wasn't called by yourself
            return;
        }
        
        const message = eventpacket.event;
        const commandSymbol = infopacket.command.symbol; //the symbol used for command
        const command = infopacket.command.verb; //command itself
        const commandArgs = infopacket.command.args; //arguments after the command verb
        
        
        /* lets say we use the command 
        
        /example test1 you "this is a test"
        
        const commandSymbol === "/"
        const command === "example"
        const commandArgs === ["test1", "you", "this is a test"]
         
         */
        
        if (!commandSymbol === "/") {
            return;
        }
        if (command === "example") {
            if (commandArgs[0] === "ping") {
                message.reply("pong");
            } else if (commandArgs[0] === "troll") {
                if (commandArgs[1] === "me") {
                    message.reply("!!!!!!!!!!!"); //this will run if you say /example troll me
                }
            } else if (commandArgs[0] === "troll me") {
                message.reply("010101001"); //this will run if you say /example "troll me"
            }
            infopacket.halt(); //stops all next modules from triggering, use if you don't want next modules to process this event
        }
        
        if (!data.saveme) { //if the object doesn't exist
            data.saveme = {}; //this will be saved to file
            data.saveme.counter = 0;
            data.savemetoo = {}; //this will also be saved to file
            data.blah = {};
            data.dontsaveme = {}; //nope, still saved
        }
        data.saveme.counter += 1; //this counter will increase each time

        console.log(data.saveme.counter); //even after bot restart, the counter will display the correct value
        
        
    }
    blah(x) {
        //create custom functions and run them in main() for tidier code
    }
    ping(x) {
        
    }
}

module.exports = ExampMod;