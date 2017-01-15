const utils = require("../utils.js");
const mathjs = require("mathjs");

const helpMain = "```" + 
`Game Module Help
   /game <game> [-switches] [--options <args>]

Games:
   Tic-Tac-Toe (SP/MP)
   
   
   
Options:   
   
   start           - Starts the REPL console.
   
   exit            - Closes the active console.
   kill            - Ends the active console.
   clear           - Clears the current active console.
   refresh         - Refreshes and drags the console to the bottom.

   save            - Starts a saved session.
      <name>
   load            - Saves the current session state.
      <name>`
+ "```";

//singleplayer games, can save, load
//multiplayer based games, one person hosts, and can save/load
//mmo type game, anyone joins in, logs out at whim, persistent world

//two types of consoles
//one is where each player has its own console
//other is where all players use the same console on one channel


class GameMod { //This is an module that adds some essential commands to the selfbot
    
    constructor(debug) {
        this.name = "GAME";
        this.desc = "Game Module";
        this.refname = "GameMod";
        this.id = 950, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "game1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
        this.isExample = true; //delete this line to enable the module
        //modules are run in order, from the smallest id to the largest id.
        
        this.selfClients = {}; //selfClients[userId] to get client
        this.sharedClients = {}; //sharedClients[channelId] to get client
        
        this.roomIds = [];
        
        this.spGames = {}; //spGames[roomId] to get game
        this.mpGames = {};
        this.moGames = {};
        
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
        } else if (["close","end","exit"].indexOf(args[0]) !== -1 && userConsole) {
            userConsole.destroy();
            ev.delete().then().catch(err => {});
            this.activeConsoles[userId] = false;
            
        } else if (["refresh","reload"].indexOf(args[0]) !== -1 && userConsole) {
            userConsole.registerCommand(ev);
            userConsole.refresh(ev);
        } else if (args[0]) {
            if (userConsole) {
                userConsole.updateRepl(ev);
            }
        }
        
        
    }
}
module.exports = GameMod;

class Game {
    constructor(game, id, maxplayers, hostevent) {
        this.game = game||"Game";
        this.roomId = id||"0";
        this.maxplayers = maxplayers||1;
        this.hostId = hostevent.author.id||"0";
        this.players = [];
        this.online = [];
        this.data = {};
        
    }
    load(players, data) {
        this.players = players||[];
        this.data = data||{};
    }
    addPlayer(user) {
        if (!this.isPlayer(user)) { //if user is not already a player
            this.players.push(user.id); //add the player
            this.data[user.id] = {}; //create player data
        }
    }
    connectPlayer(user) {
        if (!this.isOnline(user) && this.isPlayer(user)) { //if user is not already online and is a player
            this.online.push(user.id);
        }
    }
    disconnectPlayer(user) {
        const index = this.online.indexOf(user.id);
        if (index > -1) { //if user is online
            this.online.splice(index, 1);
        }
    }
    isPlayer(user) {
        return (this.players.indexOf(user.id) !== -1);
    }
    isOnline(user) {
        return (this.online.indexOf(user.id) !== -1);
    }
    isHost(user) {
        return this.hostId === user.id;
    }
    canJoin() {
        return (this.maxplayers - this.players.length) > 0;
    }
}

class RockPaperScissorsMp extends Game {
    constructor(id, hostevent) {
        super("RockPaperScissorsGameMp", id, 1, hostevent);
    }
    
    
    
}

class MiniTestClient {
    constructor(event, game) {
        this.userId = event.author.id;
        this.game = game;
        
        const self = this;
        event.channel.sendMessage(getMessage()).then(consolemsg => {
            self.message = consolemsg;
        }).catch(err => {});
        
    }
    getMessage() {
        return "";
    }
    refresh() {
        const self = this;
        
        this.message.delete().then(delMsg => {
            delMsg.channel.sendMessage(self.getMessage()).then(newMsg => {
                self.message = newMsg;
            }).catch(err => {});
        }).catch(err => {});
        
    }
    destroy() {
        this.message.delete().then().catch(err => {});
    }
    
    
    
}


const randomString = function(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
};
//
//console.log(randomString(16, 'aA'));
//console.log(randomString(32, '#aA'));
//console.log(randomString(64, '#A!'));








/*
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
*/