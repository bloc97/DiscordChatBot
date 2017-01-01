const utils = require("../utils.js");

class Toolbox { //This is an example module
    
    constructor(debug) {
        this.name = "TOOL";
        this.desc = "Toolbox Module";
        this.refname = "ToolMod";
        this.id = 500, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "tool1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
        //modules are run in order, from the smallest id to the largest id.
        
        
        this.capturedMsgs = {}; //messages that were part of commands for this bot
        
        this.currentEv = {}; //current event
        this.currentChannel = {};
        this.currentBot = {};
        this.currentBotId = "";
        
        this.isPrune = false; //is the prune command pending?
        this.pruneMsgs = []; //messages that should be pruned
        
    }
    main(eventpacket, infopacket, data) {
        if (eventpacket.botId !== eventpacket.userId || eventpacket.type !== "message") {
            return;
        }
        const symbol = infopacket.command.symbol;
        const command = infopacket.command.verb;
        const args = infopacket.command.args;
        
        this.currentEv = eventpacket.event;
        this.currentChannel = eventpacket.event.channel;
        this.currentBot = eventpacket.bot;
        this.currentBotId = eventpacket.bot.id;
        
        if (this.isCommandPending()) {
            if (command === "yes") {
                this.capture("choice");
                runPrune();
                
                this.clear("choice");
            } else if (command === "no") {
                this.capture("choice");
                cancelPrune();
                
                this.clear("choice");
            }
            this.capture("all");
        }
        
        if (symbol !== "/" && command !=="toolbox") {
            return;
        }
        this.capture("all");
        if (args[0] === "prune") {
            this.capture("prune");
            commandPrune(args[1], args[2]);
        }
        
    }
    commandPrune(arg1, arg2) {
        let number = 0;
        const isArg1Number = +arg1 === +arg1;
        const isArg2Number = +arg2 === +arg2;
        
        if (isArg1Number) { //if arg1 is a number
            number = +arg1;
        } else if (isArg2Number) { //if arg2 is a number
            number = +arg2;
        } else {
            number = 1;
        }           
        if (!arg1 || arg1 === "self" || isArg1Number) {
            this.currentChannel.fetchMessages({limit:100})
                .then(collection => {
                    let array = collection.array();
                    let myarray = array.filter(m => m.author.id === this.currentBotId);
                    let count = Math.min(number+1, myarray.length);
                    
                    myarray.length = count;
                    let lastindex = myarray.length-1;
                    
                    this.pruneMsgs = myarray;
                    
                    const lastdate = myarray[lastindex].createdAt.valueOf();
                    const currentdate = new Date().valueOf();
                    const diff = currentdate-lastdate;
                    
                    const timeStamp = utils.getTimeFromMiliseconds(diff);
                    
                    this.currentEv.edit("", {embed: newSelfPruneEmbed(count, myarray, timeStamp, this.currentBot, this.currentEv)}).then().catch(err => {});
                    
                    
            }).catch(err => {});
        }
    }
    runPrune() {
        if (!this.isPrune) return;
        this.isPrune = false;
        this.clear("prune");
        this.prune(this.pruneMsgs);
        
    }
    cancelPrune() {
        if (!this.isPrune) return;
        this.isPrune = false;
        this.clear("prune");
        this.pruneMsgs = [];
    }
    prune(messageArray) {
        for (let i=0; i<messageArray.length; i++) {
            messageArray[i].delete().then().catch(err => {});
        }
    }
    capture(type) {
        if (!this.capturedMsgs[type]) {
            this.capturedMsgs[type] = [];
        }
        this.capturedMsgs[type].unshift(this.currentEv);
    }
    clear(type) {
        if (this.capturedMsgs[type]) {
            this.prune(this.capturedMsgs[type]);
        }
    }
    isCommandPending() {
        return this.isPrune;
    }
}

const newSelfPruneEmbed = function(count, myarray, timeStamp, currentBot, currentEv) {
    const lastindex = myarray.length - 1;
    const embed = {embed: {
                      color: 3447003,
                      author: {
                        name: currentBot.user.username + "'s Selfbot"
                      },
                      title: "*" + currentEv.content + "*",//client.user.username + "'s Selfbot",//"Selfprune last " + (count-1) + " messages?",
                      description: "Selfprune last " + (count-1) + " messages?",
                      fields: [
                        {
                          name: 'Last message was: ',
                          value: "```"+myarray[lastindex].content+"```",
                          inline: false
                        }
                      ],
                      timestamp: myarray[lastindex].createdAt,
                      footer: {
                        //icon_url: client.user.avatarURL,
                        text: "Last message was sent " + timeStamp + " ago"
                      }
                    }};
    return embed;
};

module.exports = Toolbox;