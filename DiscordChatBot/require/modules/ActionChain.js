const utils = require("../utils.js");
const Jimp = require("jimp");

class ActChain { //This module allows for chaining commands
    
    constructor(debug) {
        this.name = "ACCH";
        this.desc = "Action Chaining Module";
        this.refname = "ActChMod";
        this.id = 500, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "acch1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
        //modules are run in order, from the smallest id to the largest id.
        
    }
    main(eventpacket, infopacket, data) {
        if (eventpacket.type !== "message" || eventpacket.isSelf) {
            return;
        }
        const symbol = infopacket.command.symbol;
        const command = infopacket.command.verb;
        const args = infopacket.command.args;
        const ev = eventpacket.event;
        const channel = eventpacket.event.channel;
        
        const rawmsg = eventpacket.rawmsg;
        const firstSpaceIndex = rawmsg.indexOf(" ");
        const statement = rawmsg.substring(firstSpaceIndex+1, rawmsg.length);
        
        if (symbol !== "/"){// || command !== "plot") {
            return;
        }
        if (args[0] && command === "chain") {
            const chain = new Chain(eventpacket.bot, eventpacket.event.channel, eventpacket.event);
            chain.evaluate(statement);
            ev.edit(ev.content.replace(/[<>]/gi, ' $& ')).then().catch(err => {});
        }
    }
}

class Chain {
    constructor(client, channel, event) {
        this.client = client;
        this.channel = channel;
        this.event = event;
        this.file = false;
        this.message = false;
    }
    evaluate(str) {
        const statement = "this." + str;
        let parsedstatement = statement;
        //let parsedstatement = statement.replace(/[(]\b/gi, "$&this.");
        parsedstatement = parsedstatement.replace(/<@/gi, '\"$&');
        parsedstatement = parsedstatement.replace(/[0-9]>/gi, '$&\"');
        
        if (parsedstatement.indexOf("fetchImage") !== -1) {
            const funcStartIndex = utils.findNextChar(parsedstatement, ")", parsedstatement.indexOf("fetchImage"))+1; //find next ) index
            const funcStopIndex = parsedstatement.indexOf(".out()", funcStartIndex);
            if (funcStopIndex < 0) {
                parsedstatement = parsedstatement.replace(/[(]\b/gi, "$&this.");
                parsedstatement = parsedstatement.substring(0, parsedstatement.indexOf(".fetchImage"));
            } else {
                let closedFunction = parsedstatement.substring(funcStartIndex, funcStopIndex);
                let beforeFunction = parsedstatement.substring(0, funcStartIndex-1);
                let afterFunction = parsedstatement.substring(funcStopIndex+6, parsedstatement.length);
                beforeFunction = beforeFunction.replace(/[(]\b/gi, "$&this.");
                afterFunction = afterFunction.replace(/[(]\b/gi, "$&this.");
                parsedstatement = beforeFunction + ", \"" + closedFunction + "\" )" + afterFunction;
                console.log(beforeFunction, afterFunction);
            }
            
            
        }
        
        console.log(parsedstatement);
        eval(parsedstatement);
    }
    console(x) {
        this.i = x;
        console.log(this.i);
        return this;
    }
    fetchUserAvatarUrl(x) {
        const id = this.fetchUserId(x);
        const user = this.channel.members.get(id).user;
        return user.displayAvatarURL;
    }
    fetchImageAvatar(x, fx) {
        const avatarUrl = this.fetchUserAvatarUrl(x);
        const me = this;
        Jimp.read(avatarUrl, function(err, image) {eval(
            `image ${fx} .getBuffer(Jimp.MIME_PNG, function(err, buffer) {
                me.file = buffer;
                me.out();
            });`);
//            image.greyscale().getBuffer(Jimp.MIME_PNG, function(err, buffer) {
//                me.file = buffer;
//                me.out();
//            });
        });
        return this;
    }
    fetchImageUrl(x, fx) {
        const me = this;
        Jimp.read(x, function(err, image) {eval(
            `image ${fx} .getBuffer(Jimp.MIME_PNG, function(err, buffer) {
                me.file = buffer;
                me.out();
            });`);
//            image.greyscale().getBuffer(Jimp.MIME_PNG, function(err, buffer) {
//                me.file = buffer;
//                me.out();
//            });
        });
        return this;
    }
    
    fetchUserId(x) {
        const id = x.replace(/[^0-9]/gi, "");
        console.log(id);
        return id;
    }
    print(str) {
        this.channel.sendMessage(str);
        return this;
    }
    send(file) {
        this.channel.sendFile(file);
        return this;
    }
    out() {
        if (this.message) {
            this.channel.sendMessage(this.message);
        }
        if (this.file) {
            this.channel.sendFile(this.file);
        }
        return this;
    }
}


module.exports = ActChain;