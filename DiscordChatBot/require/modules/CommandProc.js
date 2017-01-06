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
        
        const terms = this.getTerms(msgParsed);
        const quotes = this.getQuotes(msgParsed);
        const tokens = this.tokenise(msgParsed);
        
        infopacket.command = {};
        infopacket.command.strength = eventpacket.strength + hasSymbol;
        infopacket.command.text = msg;
        infopacket.command.symbol = symbol;
        infopacket.command.verb = terms[0];
        infopacket.command.args = terms.slice(1, tokens.length);
        infopacket.command.terms = terms;
        infopacket.command.quotes = quotes;
        infopacket.command.tokens = tokens;
        
//        utils.logInfo(terms);
//        utils.logInfo(quotes);
//        utils.logInfo(tokens);
        
    }
    getTerms(parsedMsg) {
        let terms = [];
        
        let lasti = 0;
        let isWithinTerm = false;
        
        for (let i=0; i<parsedMsg.length; i++) {
            let currentChar = parsedMsg.charAt(i);
            
            if (currentChar === '"' && !isWithinTerm) {
                i = utils.findNextChar(parsedMsg, '"', i+1);
                continue;
            } else if (currentChar === '"' && isWithinTerm) {
                terms.push(parsedMsg.slice(lasti, i));
                isWithinTerm = false;
                i = utils.findNextChar(parsedMsg, '"', i+1);
                continue;
            }
            
            if (currentChar !== " " && !isWithinTerm) {
                lasti = i;
                isWithinTerm = true;
            } else if (currentChar === " " && isWithinTerm) {
                terms.push(parsedMsg.slice(lasti, i));
                isWithinTerm = false;
            }
        }
        if (isWithinTerm) {
            terms.push(parsedMsg.slice(lasti, parsedMsg.length));
        }
        return terms;
        
    }
    getQuotes(parsedMsg) {
        let quotes = [];
        
        let firstQuote = parsedMsg.indexOf('"');
        
        if (firstQuote === -1) {
            return quotes;
        }
        
        for (let i=firstQuote; i<parsedMsg.length; i++) {
            let currentChar = parsedMsg.charAt(i);
            
            if (currentChar === '"') {
                const endQuote = utils.findNextChar(parsedMsg, '"', i+1);
                quotes.push(parsedMsg.substring(i+1, endQuote));
                i = endQuote;
            }
        }
        return quotes;
    }
    
    tokenise(parsedMsg) {
        //takes a string, separates all the spaces, and the quotes
        
        let tokens = [];
        
        let lasti = 0;
        let isWithinToken = false;
        let isWithinQuote = false;
        
        for (let i=0; i<parsedMsg.length; i++) {
            let currentChar = parsedMsg.charAt(i);
            
            if (currentChar === '"' && isWithinQuote) {
                tokens.push(parsedMsg.slice(lasti, i));
                isWithinToken = false;
                isWithinQuote = false;
                continue;
            } else if (currentChar === '"' && isWithinToken) {
                tokens.push(parsedMsg.slice(lasti, i));
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
                tokens.push(parsedMsg.slice(lasti, i));
                isWithinToken = false;
            } else if (currentChar !== " " && !isWithinToken && !isWithinQuote) {
                lasti = i;
                isWithinToken = true;
            }
        }
        if (isWithinToken) {
            tokens.push(parsedMsg.slice(lasti, parsedMsg.length));
        }
        return tokens;
        
    }
}

module.exports = CommandProc;