const utils = require("../utils.js");

class CommandProc { //This module parses raw text into commands. It tokenises the text, and supports quote parsing
    
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
        
    }
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

module.exports = CommandProc;