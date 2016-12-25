const NULL = require("utils.js").NULL;

class EventPacket {
    constructor(event, api) {
        if (api === "sinusbot") {
            this.rawmsg = event.msg||NULL;
            this.msg = event.msg.toLowerCase()||NULL;
            this.mode = event.mode;
            this.clientId = event.clientId;
            //that.clientUid = event.clientUid;
            this.clientNick = event.clientNick;
            //this.botNick = sinusbot.getNick(); //Nick that appears in teamspeak
            //this.botName = ""; //Name that bot responds to
            //that.isBotCalled = (AI.Core.compare(that.msg,that.botName)||that.mode<=1);
        } else if (api === "discord.js") {
            
        }
    }
}

class InfoPacket {
    constructor() {
        this.output = new OutputData();
        this.isHalted = false;
    }
}

class OutputData {
    constructor() {
        this.message = [[],[],[],[]]; //[message, delay (ms), mode of speech, user]
        this.action = [[],[],[],[]];
    }
    addMessage(msg, delay, mode, user) {
        this.message[0].push(msg||"...");
        this.message[1].push(delay||0);
        this.message[2].push(mode||2);
        this.message[3].push(user||NULL);
    }
    addAction(action, delay, info, user) {
        this.action[0].push(action||false);
        this.action[1].push(delay||0);
        this.action[2].push(info||NULL);
        this.action[3].push(user||NULL);
    }
}


exports.EventPacket = EventPacket;
exports.InfoPacket = InfoPacket;