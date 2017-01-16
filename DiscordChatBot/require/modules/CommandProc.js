const utils = require("../utils.js");
const NULL = utils.NULL;

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
        if (eventpacket.type !== "message" || eventpacket.isSelf) {
            return;
        }
        
        const msg = eventpacket.msgL;
        const hasSymbol = !utils.isLetter(msg.charAt(0));
        const symbol = (hasSymbol) ? msg.charAt(0) : "";
        const msgParsed = (hasSymbol) ? msg.slice(1, msg.length) : msg;
        
        const terms = this.getTerms(msgParsed);
        const quotes = this.getQuotes(msgParsed);
        const tokens = this.tokenise(msgParsed);
        const options = this.getOptions(msgParsed);
        
        infopacket.command = {};
        infopacket.command.strength = eventpacket.strength + hasSymbol;
        infopacket.command.textraw = eventpacket.rawmsg; //raw msg
        infopacket.command.textnom = eventpacket.msg; //msg without mention
        infopacket.command.text = msg; //msg lowercase without mention
        infopacket.command.symbol = symbol;
        infopacket.command.verb = terms[0];
        infopacket.command.args = terms.slice(1, tokens.length);
        infopacket.command.terms = terms;
        infopacket.command.quotes = quotes;
        infopacket.command.tokens = tokens;
        infopacket.command.options = options;
        infopacket.command.switches = tokens.filter(function(x) {return (x.charAt(0) === "-") && (x.charAt(1) !== "-");});
        
//        utils.logInfo(terms);
//        utils.logInfo(quotes);
//        utils.logInfo(tokens);
//        console.log(options);
//        utils.logInfo(infopacket.command.switches);
        
    }
    getOptions(parsedMsg) {
        let options = {};
        if (parsedMsg.indexOf("--") === -1) {
            return options;
        }
        let lasti = 0;
        let i = 0;
        while(i < parsedMsg.length && i > -1) {
            lasti = parsedMsg.indexOf("--", i);
            let startWordi = lasti + 2;
            let endWordi = parsedMsg.indexOf(" ", startWordi);
            endWordi = (endWordi > -1) ? endWordi :  parsedMsg.length; //if next space doesn't exist
            let word = parsedMsg.substring(startWordi, endWordi);
            i = parsedMsg.indexOf("--", endWordi);
            if (i > -1) { //if next "--" doesn't exist
                let statement = parsedMsg.substring(endWordi, i);
                statement = statement.replace(/-[a-z] |-[a-z]$/gi,"");
                statement = utils.clearWhitespaces(statement);
                statement = utils.clearEndWhitespaces(statement);
                options[word] = statement||NULL;
            } else {
                let statement = parsedMsg.substring(endWordi, parsedMsg.length);
                statement = statement.replace(/-[a-z] |-[a-z]$/gi,"");
                statement = utils.clearWhitespaces(statement);
                statement = utils.clearEndWhitespaces(statement);
                options[word] = statement||NULL;
            }
            
        }
        //console.log(options);
        return options;
    }
    getTerms(parsedMsg) {
        let terms = [];
        
        let lasti = 0;
        let isWithinTerm = false;
        let optionsi = parsedMsg.indexOf("--");
        let endi = (optionsi > -1) ? optionsi : parsedMsg.length;
        
        for (let i=0; i<endi; i++) {
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
        if (isWithinTerm) { //if not within term and loop ended, slice up to "--"
            terms.push(parsedMsg.slice(lasti, endi));
        }
        return terms;
        
    }
    getQuotes(parsedMsg) {
        let quotes = [];
        
        let firstQuote = parsedMsg.indexOf('"');
        
        if (firstQuote === -1) {
            return quotes;
        }
        let optionsi = parsedMsg.indexOf("--");
        let endi = (optionsi > -1) ? optionsi : parsedMsg.length;
        
        for (let i=firstQuote; i<endi; i++) {
            let currentChar = parsedMsg.charAt(i);
            
            if (currentChar === '"') {
                let endQuote = utils.findNextChar(parsedMsg, '"', i+1);
                if (endQuote < 0 || endQuote > endi) endQuote = endi; //if quote end is beyond "--" or doesn't exist, slice up to "--"
                quotes.push(parsedMsg.slice(i+1, endQuote));
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