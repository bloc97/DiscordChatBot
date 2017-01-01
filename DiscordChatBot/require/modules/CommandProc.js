const utils = require("../utils.js");

class CommandProc {
    //static isConsoleDebug = false;
    //static isChatDebug = false;
    
    constructor(debug) {
        this.name = "COMP";
        this.desc = "Command Processor";
        this.refname = "CommandProc";
        this.id = 100, //ID used to load modules in order
        this.uid = "comp1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
    }
    main(eventpacket, infopacket, data) {
        if (eventpacket.type !== "message") {
            return;
        }
        
        const msg = eventpacket.msg;
        const hasSymbol = !utils.isLetter(msg.charAt(0));
        const symbol = (hasSymbol) ? msg.charAt(0) : "";
        const msgParsed = (hasSymbol) ? msg.slice(1, msg.length) : msg;
        
        const tokens = this.tokenise(msgParsed);
        
        infopacket.command = {};
        infopacket.command.strength = eventpacket.strength + hasSymbol;
        infopacket.command.text = msg;
        infopacket.command.symbol = symbol;
        infopacket.command.verb = tokens[0];
        infopacket.command.args = tokens.slice(1, tokens.length);
        
//        if (this.isDebug) {
//            process.stdout.write("COMP: ");
//            console.log(infopacket.command);
//        }
//        if (!data.logs) {
//            data.logs = [];
//        }
//        data.logs.push(infopacket.command);
//        if (eventpacket.userId !== botId && eventpacket.debug.isDebug) {
//            if (tokens.length > 0) {
//                eventpacket.event.reply("isExplicit: " + isExplicit + "\nCommand: " + tokens[0] + "\nArgs: " + eventpacket.command.args.join(" | "));             
//            }
//        }
    }
//    tokenise(parsedMsg) {
//        
//        let token = [];
//        
//        for (let i=0; i<parsedMsg.length; i++) {
//            if (parsedMsg.charAt(i) === '"') {
//                let nextindex = this.findNext(parsedMsg, '"', i+1);
//                token.push(parsedMsg.slice(i+1, nextindex));
//                i = nextindex;
//            } else if (parsedMsg.charAt(i) !== " ") {
//                let nextspaceindex = this.findNext(parsedMsg, " ", i);
//                let nextquoteindex = this.findNext(parsedMsg, '"', i+1);
//                if (nextspaceindex <= nextquoteindex) { //if next is a space
//                    token.push(parsedMsg.slice(i, nextspaceindex));
//                    i = nextspaceindex;
//                } else { //if next is a beginning of a quote
//                    token.push(parsedMsg.slice(i, nextquoteindex));
//                    i = nextquoteindex-1;
//                }
//            }
//        }
//        
//        return token;
//    }
    tokenise(parsedMsg) {
        let token = [];
        
        let lasti = 0;
        let isWithinToken = false;
        let isWithinQuote = false;
        
        for (let i=0; i<parsedMsg.length; i++) {
            let currentChar = parsedMsg.charAt(i);
            
            if (currentChar === '"' && isWithinQuote) {
                token.push(parsedMsg.slice(lasti, i));
                isWithinToken = false;
                isWithinQuote = false;
                continue;
            } else if (currentChar === '"' && isWithinToken) {
                token.push(parsedMsg.slice(lasti, i));
                lasti = i+1;
                isWithinToken = true;
                isWithinQuote = true;
                continue;
            } else if (currentChar === '"' && !isWithinToken) {
                lasti = i+1;
                isWithinToken = true;
                isWithinQuote = true;
                continue;
            }
            
            if (currentChar === " " && isWithinToken && !isWithinQuote) {
                token.push(parsedMsg.slice(lasti, i));
                isWithinToken = false;
            } else if (currentChar !== " " && !isWithinToken && !isWithinQuote) {
                lasti = i;
                isWithinToken = true;
            }
        }
        if (isWithinToken) {
            token.push(parsedMsg.slice(lasti, parsedMsg.length));
        }
        return token;
        
    }
}

class Command {
    constructor (symbol, verb, args) {
        this.symbol = symbol;
        this.verb = verb;
        this.args = args;
    }
}

module.exports = CommandProc;