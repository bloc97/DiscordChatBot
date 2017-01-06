const utils = require("../utils.js");

class NodeRepl { //This is an module that adds some essential commands to the selfbot
    
    constructor(debug) {
        this.name = "REPL";
        this.desc = "Node REPL Module";
        this.refname = "ReplMod";
        this.id = 600, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "repl1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
        this.isExample = true; //delete this line to enable the module
        //modules are run in order, from the smallest id to the largest id.
        
        this.isConsoleActive = false;
        this.consoleBox = {}; //messages that were part of commands for this bot
        this.consoleChannel = {};
        this.consoleStr = "";
        this.consoleDoReturnEval = true;
        
        this.currentBot = {};
        this.currentBotId = "";
        
    }
    main(eventpacket, infopacket, data) {
        if (eventpacket.botId !== eventpacket.userId || eventpacket.type !== "message") {
            return;
        }
        const symbol = infopacket.command.symbol;
        const command = infopacket.command.verb;
        const args = infopacket.command.args;
        const ev = eventpacket.event;
        
        const firstChar = ev.content.charAt(0);
        const lastChar = ev.content.charAt(ev.content.length-1);
        
        if (this.isConsoleActive && this.consoleChannel === eventpacket.event.channel && firstChar !== "/" && firstChar !== "`" && firstChar !== "\u200b") {
            this.consoleStr = this.consoleStr + ev.content + "\n> ";
            let evalStr = "";
            try {
                evalStr = global.eval(ev.content + "");
            } catch (err) {
                evalStr = err;
            }
            if (this.consoleDoReturnEval) this.consoleStr = this.consoleStr + evalStr + "\n> ";
            this.consoleBox.edit("```js\n"+this.consoleStr+"\n```").then().catch(err => {});
            ev.delete();
        } else if (this.isConsoleActive && firstChar === "`") {
            if (lastChar === "`") {
                
            } else {
                ev.delete();
                ev.channel.sendMessage("\u200b" + ev.content.slice(1, ev.content.length)).then().catch(err => {});
            }
            
        }
        
        if (symbol !== "/" || command !=="console") {
            return;
        }
        if (args[0] === "init" && !this.isConsoleActive && (!args[1] || args[1] === "node")) {
            this.consoleStr = "Discord Selfbot Node REPL [Version 0.01]\n(c) 2016 MIT. All rights reserved.\n\n> node\n> ";
            ev.edit("```js\n"+this.consoleStr+"\n```").then().catch(err => {});
            this.isConsoleActive = true;
            this.consoleBox = ev;
            this.consoleChannel = ev.channel;
            
            const me = this;
            global.bot = eventpacket.bot;
            global.channel = eventpacket.event.channel;
            global.print = function(x) {
                me.consoleStr = me.consoleStr + x + "\n> ";
            };
            global.sendMsg = function(x) {
                ev.channel.sendMessage("\u200b" + x);
            };
            
            
        } else if (args[0] === "refresh" && this.isConsoleActive) {
            this.consoleBox.delete().then().catch(err => {});
            ev.edit("```js\n"+this.consoleStr+"\n```").then().catch(err => {});
            this.consoleBox = ev;
            this.consoleChannel = ev.channel;
            
        } else if (args[0] === "clear" && this.isConsoleActive) {
            this.consoleStr = "> ";
            this.consoleBox.edit("```"+this.consoleStr+"```").then().catch(err => {});
            ev.delete().then().catch(err => {});
            
        } else if (args[0] === "toggleeval" && this.isConsoleActive) {
            this.consoleDoReturnEval = !this.consoleDoReturnEval;
            ev.delete().then().catch(err => {});
            
        } else if (args[0] === "exit" && this.isConsoleActive) {
            this.consoleBox.delete().then().catch(err => {});
            this.isConsoleActive = false;
            this.consoleStr = "";
            ev.delete().then().catch(err => {});
        }
        
        
    }
}


module.exports = NodeRepl;