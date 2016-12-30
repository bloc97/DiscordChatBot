const utils = require("../utils.js");

class CommandProc {
    //static isConsoleDebug = false;
    //static isChatDebug = false;
    
    constructor () {
        this.name = "COMP";
        this.desc = "Command Processor";
        this.refname = "CommandProc";
        this.id = 100, //ID used to load modules in order
        this.uid = "comp1000";
        this.triggerSymbol = "!";
//        this.symbolTrigger = symbols||["!"]; //Available Triggers: Mention, Nickname, Symbol, Name, Separator
//        this.triggers = triggers||["Mention Symbol","Symbol"]; //Which instances to trigger
//        this.separators = separators||[","];
//        this.newline = "\n";
    }
    main(eventpacket, infopacket) {
        const msg = eventpacket.rawmsg;
        const mode = eventpacket.mode;
        const botId = eventpacket.botId;
        const botMention = "<@" + botId + ">";
        const botNick = eventpacket.botNick;
        
        const msgWithoutMention = this.removeMention(msg, botMention);
        const msgParsed = this.removeBotNick(msgWithoutMention, botNick);
        
        if (!this.isCommand(msg, msgWithoutMention, msgParsed, botMention, botNick, mode)) {
            return;
        }
        
        const isExplicit = this.isExplicit(msg, msgWithoutMention, msgParsed, botMention, botNick, mode);
        
        const stringTokens = this.removeSymbol(msgParsed);
        
        const tokens = this.tokenise2(stringTokens);
        
        infopacket.command = {};
        infopacket.command.isExplicit = isExplicit;
        infopacket.command.tokens = tokens;
        infopacket.command.command = tokens[0];
        infopacket.command.args = tokens.slice(1, tokens.length);
        
        if (eventpacket.userId !== botId && eventpacket.debug.isDebug) {
            if (tokens.length > 0) {
                eventpacket.event.reply("isExplicit: " + isExplicit + "\nCommand: " + tokens[0] + "\nArgs: " + eventpacket.command.args.join(" | "));             
            }
        }
    }
    removeMention(msg, botMention) { //removes the bot mention from the msg
        let newmsg = msg;
        let index = msg.indexOf(botMention);
        if (index !== -1) {
            newmsg = msg.slice(0, index)+msg.slice(index+botMention.length, msg.length);
        }
        return this.removeWhitespaces(newmsg);
    }
    removeBotNick(msgWithoutMention, botNick) { //removes the bot nickname from the msg
        let msgParsed = msgWithoutMention;
        if (this.isBotNamed(msgWithoutMention, botNick)) {
            msgParsed = msgWithoutMention.slice(botNick.length, msgWithoutMention.length);
        }
        return this.removeWhitespaces(msgParsed);
        
    }
    removeSymbol(msgWithoutNick) { //removes the bot nickname from the msg
        let stringTokens = msgWithoutNick;
        if (stringTokens.charAt(0) === this.triggerSymbol) {
            stringTokens = stringTokens.substring(1, stringTokens.length);
        }
        return this.removeWhitespaces(stringTokens);
        
    }
    removeWhitespaces(msg) { //removes the beginning whitespaces
        let startindex = 0;
        for (let i=0; i<msg.length; i++) {
            if (msg.charAt(i) !== " ") {
                startindex = i;
                break;
            }
        }
        return msg.slice(startindex, msg.length);
    }
    findNext(msg, char, startindex) {
        for (let i=startindex; i<msg.length; i++) {
            if (msg.charAt(i) === char) {
                return i;
            }
        }
        return msg.length;
    }
    tokenise(parsedMsg) {
        
        let token = [];
        
        for (let i=0; i<parsedMsg.length; i++) {
            if (parsedMsg.charAt(i) === '"') {
                let nextindex = this.findNext(parsedMsg, '"', i+1);
                token.push(parsedMsg.slice(i+1, nextindex));
                i = nextindex;
            } else if (parsedMsg.charAt(i) !== " ") {
                let nextspaceindex = this.findNext(parsedMsg, " ", i);
                let nextquoteindex = this.findNext(parsedMsg, '"', i+1);
                if (nextspaceindex <= nextquoteindex) { //if next is a space
                    token.push(parsedMsg.slice(i, nextspaceindex));
                    i = nextspaceindex;
                } else { //if next is a beginning of a quote
                    token.push(parsedMsg.slice(i, nextquoteindex));
                    i = nextquoteindex-1;
                }
            }
        }
        
        return token;
    }
    tokenise2(parsedMsg) {
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
    
    isCommand(msg, msgWithoutMention, msgParsed, botMention, botNick, mode) {
        return this.isBotMentionned(msg, botMention) || this.isBotNamed(msgWithoutMention, botNick) || this.isSymbolUsed(msgParsed) || this.isChatPrivate(mode);
    }
    isExplicit(msg, msgWithoutMention, msgParsed, botMention, botNick, mode) {
        return (this.isBotMentionned(msg, botMention) + this.isBotNamed(msgWithoutMention, botNick) + this.isSymbolUsed(msgParsed) + this.isChatPrivate(mode)) > 1;
    }
    isBotMentionned(msg, botMention) {
        return msg.indexOf(botMention) !== -1;
    }
    isBotNamed(msgWithoutMention, botNick) {
        return msgWithoutMention.toLowerCase().indexOf(botNick) === 0;
    }
    isSymbolUsed(msgParsed) {
        return msgParsed.charAt(0) === this.triggerSymbol;
    }
    isChatPrivate(mode) {
        return mode === 2;
    }
    
}

class Command {
    constructor (verb, args, isExplicit) {
        this.verb = verb;
        this.args = args;
        this.isExplicit = isExplicit||false;
    }
}

module.exports = CommandProc;