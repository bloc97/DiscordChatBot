const utils = require("./utils.js");
const NULL = utils.NULL;

class EventPacket {
    
    constructor(event, api, botId, botName, botNick) {
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
            this.api = api;
            this.event = event; //discord.js Message (or else) Class
            
            this.serverId = event.guild.id;
            this.channelId = event.channel.id;
            this.eventId = event.id;
            
            this.user = event.author; //discord.js User Class
            this.userId = event.author.id;
            this.userName = event.author.username;
            
            this.botId = botId;
            this.botName = botName;
            this.botNick = botNick;
            
            switch (event.channel.type) {
                case "dm":
                    this.mode = 2;
                    break;
                case "group":
                    this.mode = 1;
                    break;
                case "text":
                    this.mode = 0;
                    break;
                default :
                    this.mode = 0;
            }
            
            this.rawmsg = event.content||NULL;
            
            const botMention = "<@" + botId + ">";
            const msgWithoutMention = removeMention(this.rawmsg, botMention);
            const msgWithoutBotNick = removeBotNick(msgWithoutMention, botNick);
            
            this.isBotMentionned = this.rawmsg.indexOf(botMention) !== -1;
            this.isBotNamed = msgWithoutMention.toLowerCase().indexOf(botNick) === 0;
            this.isMsgPrivate = this.mode === 2;
            
            this.strength = this.isBotMentionned + this.isBotNamed + this.isMsgPrivate;
            
            this.msg = msgWithoutBotNick.toLowerCase();
            
        }
    }
}


function removeMention(msg, botMention) { //removes the bot mention from the msg
    let newmsg = msg;
    let index = msg.indexOf(botMention);
    if (index !== -1) {
        newmsg = msg.slice(0, index)+msg.slice(index+botMention.length, msg.length);
    }
    return utils.removeWhitespaces(newmsg);
}
function removeBotNick(msgWithoutMention, botNick) { //removes the bot nickname from the msg
    let msgParsed = msgWithoutMention;
    if (msgWithoutMention.toLowerCase().indexOf(botNick) === 0) {
        msgParsed = msgWithoutMention.slice(botNick.length, msgWithoutMention.length);
    }
    return utils.removeWhitespaces(msgParsed);
}

class InfoPacket {
    constructor() {
        this.output = new OutputData();
        this.isHalted = false;
        this.doJump = false;
        this.jumpID = 0;
    }
    halt() {
        this.isHalted = true;
    }
    jump(uid) {
        this.doJump = true;
        this.jumpUid = uid;
    }
}

class OutputData {
    constructor() {
        this.message = [[],[],[],[]]; //[message, delay (ms), mode of speech, user]
        this.action = [[],[],[],[]];
    }
    addMessage(msg, delay, mode, user) {
        this.message[0].push(msg||"...");
        this.message[1].push(+delay||0);
        this.message[2].push(mode||2);
        this.message[3].push(user||NULL);
    }
    addAction(action, delay, info, user) {
        this.action[0].push(action||false);
        this.action[1].push(+delay||0);
        this.action[2].push(info||NULL);
        this.action[3].push(user||NULL);
    }
}


exports.EventPacket = EventPacket;
exports.InfoPacket = InfoPacket;