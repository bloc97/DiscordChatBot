const utils = require("../utils.js");
const mathjs = require("mathjs");

const helpMain = "```" + 
`MathREPL Module Help
   /math <command> <args> 

Commands:
   init            - Starts the REPL console.
   
   exit            - Closes the active console.
   kill            - Ends the active console.
   clear           - Clears the current active console.
   refresh         - Refreshes and drags the console to the bottom.

   save            - Starts a saved session.
      <name>
   load            - Saves the current session state.
      <name>`
+ "```";

class MathRepl { //This is an module that adds some essential commands to the selfbot
    
    constructor(debug) {
        this.name = "MREP";
        this.desc = "MathJS REPL Module";
        this.refname = "MathRepl";
        this.id = 620, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "mrep1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
        //modules are run in order, from the smallest id to the largest id.
        
        this.activeConsoles = {};
        this.savedConsoles = {};
        
    }
    main(eventpacket, infopacket, data) {
        if (eventpacket.type !== "message" || eventpacket.isSelf) {
            return;
        }
        const symbol = infopacket.command.symbol;
        const command = infopacket.command.verb;
        const args = infopacket.command.args;
        const ev = eventpacket.event;
        const userId = eventpacket.userId;
        
        
        if (command !=="math") {
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
            userConsole.registerCommand(ev);
            userConsole.endRepl();
            this.activeConsoles[userId] = false;
        } else if (["close","end","exit"].indexOf(args[0]) !== -1 && userConsole) {
            userConsole.registerCommand(ev);
            userConsole.destroy();
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
                ev.reply("Saved MathREPL Sessions: " + nameList.join(", "));
                
                
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
module.exports = MathRepl;

class Console {
    constructor(message, display, scope) {
        this.user = message.author.username;
        this.maxLines = 15;
        this.display = [];
        this.scope = {};
        this.log = [];
        this.display.push("MathJS REPL [Version 0.01]");
        this.display.push("(c) 2016 MIT. All rights reserved.");
        this.display.push("");
        this.display.push(this.user + "> mathjs");
        this.display.push("> ");
        
        if (display && scope) {
            this.display = display.slice();
            this.scope = JSON.parse(JSON.stringify(scope));
        }
        
        const self = this;
        message.channel.sendMessage(this.getString()).then(message => {
            self.message = message;
        }).catch(err => {});
        message.delete().then().catch(err => {});
    }
    
    load(display, scope) {
        this.display = display;
        this.scope = scope;
    }
    
    getString() {
        const size = this.display.length;
        let limitedDisplay = this.display;
        if (size > this.maxLines) {
            limitedDisplay = this.display.slice(size-this.maxLines-1, size);
        }
        return "```js\n" + limitedDisplay.join("\n") + "```";
    }
    
    getEndString() {
        const size = this.display.length;
        let limitedDisplay = this.display;
        if (size > this.maxLines) {
            limitedDisplay = this.display.slice(size-this.maxLines-1, size);
        }
        return "```" + limitedDisplay.join("\n") + "```";
    }
    
    print(str) {
        this.display[this.display.length-1] += str;
    }
    println(str) {
        this.display.push("> " + str);
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
        this.print("exit\n\n");
        this.message.edit(this.getEndString()).then().catch(err => {});
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
        const str = utils.clearWhitespaces(msg.slice(msg.indexOf("math")+4, msg.length));
        this.print(str);
        
        try {
            const evalstr = mathjs.eval(str + "", this.scope);
            this.println(evalstr);
        } catch (err) {
            this.println(err);
        }
        
        this.println("");
        
        this.registerCommand(ev, true);
    }
    
    registerCommand(commandMsg, isChanged) {
        const self = this;
        const oldMsg = this.message;
        commandMsg.delete().then(message => {
            if (oldMsg.channel !== commandMsg.channel) {
                oldMsg.delete().then(message => {
                    self.message = commandMsg.channel.sendMessage(self.getString()).then().catch(err => {});
                }).catch(err => {});
            } else if (isChanged) {
                oldMsg.edit(self.getString()).then().catch(err => {});
            }
            
        }).catch(err => {
            oldMsg.delete().then(message => {
                self.message = commandMsg.channel.sendMessage(self.getString()).then().catch(err => {});
            }).catch(err => {});
        });
    }
}