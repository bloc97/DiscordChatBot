//http://www.rejoicealways.net/lcu-semesters/fall2010/mat1302/Eigenmath.pdf
//EigenMath Manual
const utils = require("../utils.js");
const Algebrite = require("./Interpreters/Algebrite.js");
const helpMain = "```" + 
`MathCAS Module Help
   /math <command> <args> 

Commands:
   init            - Starts the CAS console.
   
   exit            - Closes the active console.
   kill            - Ends the active console.
   clear           - Clears the current active console.
   refresh         - Refreshes and drags the console to the bottom.

   save            - Starts a saved session.
      <name>
   load            - Saves the current session state.
      <name>`
+ "```";

class MathCas { //This is an module that adds some essential commands to the selfbot
    
    constructor(debug) {
        this.name = "MCAS";
        this.desc = "MathCAS Module";
        this.refname = "MathCas";
        this.id = 721, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "mcas1000"; //Unique ID used to save data to file
        this.command = "cas"; //Command that activates this module
        this.help = helpMain; //Help that displays when users ask
        this.isDebug = debug||false;
        //modules are run in order, from the smallest id to the largest id.
        
        this.activeConsoles = {};
        this.savedConsoles = {};
        
    }
    main(eventpacket, infopacket, data) {
        if (eventpacket.type !== "message" || eventpacket.strength < 1 || eventpacket.isSelf) {
            return;
        }
        const symbol = infopacket.command.symbol;
        const command = infopacket.command.verb;
        const args = infopacket.command.args;
        const ev = eventpacket.event;
        const userId = eventpacket.userId;
        
        
        if (command !=="cas") {
            return;
        }
        if (!args[0] || args[0] === "help") {
            ev.author.sendMessage(helpMain);
            return;
        }
        const userConsole = this.activeConsoles[userId];
        if (["start","init"].indexOf(args[0]) !== -1) {
            if (userConsole) {
                userConsole.destroy();
                this.activeConsoles[userId] = false;
            }
            const console = new Console(ev);
            this.activeConsoles[userId] = console;
            
            return;
        } else if (["terminate","kill","logexit"].indexOf(args[0]) !== -1 && userConsole) {
            userConsole.endRepl();
            ev.delete().then().catch(err => {});
            this.activeConsoles[userId] = false;
            
        } else if (["close","end","exit"].indexOf(args[0]) !== -1 && userConsole) {
            userConsole.destroy();
            ev.delete().then().catch(err => {});
            this.activeConsoles[userId] = false;
            
        } else if (["refresh","reload"].indexOf(args[0]) !== -1 && userConsole) {
            userConsole.registerCommand(ev);
            userConsole.refresh(ev);
        } else if (["clear","cls"].indexOf(args[0]) !== -1 && userConsole) {
            userConsole.registerCommand(ev);
            userConsole.clear(ev);
        } else if (args[0] === "save" && userConsole) { //save command
            userConsole.registerCommand(ev); //deletes message and moves console if necessary
            if (args[1] && args[1] !== "list") { //if there's a name and its not "list"
                let sConsoles = this.savedConsoles[userId];

                if (!sConsoles) {
                    this.savedConsoles[userId] = {};
                    sConsoles = this.savedConsoles[userId];
                }
                sConsoles[args[1]] = {};
                sConsoles[args[1]].display = userConsole.display.slice();
                sConsoles[args[1]].scope = JSON.parse(JSON.stringify(userConsole.scope));
                sConsoles[args[1]].name = args[1];
                
                userConsole.saveRepl(args[1]);
                
            }
            
        } else if (args[0] === "load") {
            
            const sConsoles = this.savedConsoles[userId]||{};
            
            if (!args[1] || args[1] === "list" || !sConsoles[args[1]]) { //if no name, or /load list, or can't find save
                
                const nameList = [];
                for (var key in sConsoles) {
                    if (sConsoles.hasOwnProperty(key) && sConsoles[key]) {
                        nameList.push(sConsoles[key].name);
                    }
                }
                ev.reply("Saved MathCAS Sessions: " + nameList.join(", "));
                
                
            } else if (args[1] && sConsoles[args[1]]) { //if there's a name and can find savefile
                
                if (userConsole) {
                    userConsole.destroy();
                    this.activeConsoles[userId] = false;
                }
                
                const console = new Console(ev, sConsoles[args[1]].display, sConsoles[args[1]].scope);
                this.activeConsoles[userId] = console;
                
            }
            
            
        } else if (args[0]) {
            if (userConsole) {
                userConsole.updateRepl(ev);
            }
        }
        
        
    }
}
module.exports = MathCas;

class Console {
    constructor(message, display, scope) {
        this.user = message.author.username;
        this.maxLines = 15;
        this.display = [];
        this.scope = {};
        this.log = [];
        this.display.push("Algebrite REPL [Version 0.01]");
        this.display.push("(c) 2017 MIT. All rights reserved.");
        this.display.push("");
        this.display.push(this.user + "> algebrite");
        this.display.push("> ");
        
        if (display && scope) {
            this.display = display.slice();
            this.scope = JSON.parse(JSON.stringify(scope));
        }
        
        const self = this;
        message.channel.sendMessage(this.getString()).then(consolemsg => {
            self.message = consolemsg;
        }).catch(err => {});
        message.delete().then().catch(err => {});
    }
    
    load(display, scope) {
        this.display = display;
        this.scope = scope;
    }
    
    getString() { //gets the string to print in js markup
        const size = this.display.length;
        let limitedDisplay = this.display;
        if (size > this.maxLines) {
            limitedDisplay = this.display.slice(size-this.maxLines-1, size);
        }
        return "```js\n" + limitedDisplay.join("\n") + "```";
    }
    
    getEndString() { //gets the string to print, but without markup
        const size = this.display.length;
        let limitedDisplay = this.display;
        if (size > this.maxLines) {
            limitedDisplay = this.display.slice(size-this.maxLines-1, size);
        }
        return "```" + limitedDisplay.join("\n") + "```";
    }
    
    print(str) { //adds the string to this.display
        this.display[this.display.length-1] += str;
    }
    println(str) { //adds the string to this.display but with a new line
        this.display.push(str);
    }
    
    refresh(ev) {
        this.message.delete().then().catch(err => {});
        const self = this;
        ev.channel.sendMessage(this.getString()).then(message => {
            self.message = message;
        }).catch(err => {});
    }
    
    clear() {
        this.display = [];
        this.display.push("> ");
        this.message.edit(this.getString()).then().catch(err => {});
    }
    
    endRepl() {
        this.print("exit\n \n");
        this.message.edit(this.getEndString()).then().catch(err => {});
        this.message = false;
    }
    
    saveRepl(name) {
        this.print("save \"" + name + "\"");
        this.println("Saved as \"" + name + "\"");
        this.message.edit(this.getString()).then().catch(err => {});
    }
    
    destroy() {
        this.message.delete().then().catch(err => {});
    }
    
    updateRepl(ev) {
        const msg = ev.content;
        const str = utils.clearWhitespaces(msg.slice(msg.indexOf("cas")+3, msg.length));
        this.print(str);
        
        try {
            const evalarr = Algebrite.run(str + "", true);
            const evalstr = evalarr[0];
            const evaltex = evalarr[1];
            if (evalstr.length > 0) {
                this.println(evalstr);
            }
            Algebrite.clearall();
        } catch (err) {
            this.println(err);
        }
        
        this.println("> ");
        
        this.registerCommand(ev, true);
    }
    
    registerCommand(commandMsg, isChanged) {
        const self = this;
        const oldMsg = this.message;
        commandMsg.delete().then(message => {
            if (oldMsg.channel !== commandMsg.channel) {
                oldMsg.delete().then(message => {
                    commandMsg.channel.sendMessage(self.getString()).then(consolemsg => {
                        self.message = consolemsg;
                    }).catch(err => {});
                }).catch(err => {});
            } else if (isChanged) {
                oldMsg.edit(self.getString()).then().catch(err => {});
            }
            
        }).catch(err => {
            oldMsg.delete().then(message => {
                commandMsg.channel.sendMessage(self.getString()).then(consolemsg => {
                    self.message = consolemsg;
                }).catch(err => {});
            }).catch(err => {});
        });
    }
}