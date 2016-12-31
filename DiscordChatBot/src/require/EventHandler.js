const utils = require("./utils.js");
const NULL = utils.NULL;

class EventPacket {
    
    constructor(api, type, event, client) {
        this.api = api;
        this.type = type;
        this.event = event;
        
        if (this.api === "sinusbot") {
            this.rawmsg = event.msg||NULL;
            this.msg = event.msg.toLowerCase()||NULL;
            this.mode = event.mode;
            this.clientId = event.clientId;
            //that.clientUid = event.clientUid;
            this.clientNick = event.clientNick;
            //this.botNick = sinusbot.getNick(); //Nick that appears in teamspeak
            //this.botName = ""; //Name that bot responds to
            //that.isBotCalled = (AI.Core.compare(that.msg,that.botName)||that.mode<=1);
        } else if (this.api === "discord.js") {
            if (this.type === "ready") {
                this.msg = "";
            } else if (this.type === "message") {
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
                this.serverId = (this.mode === 0) ? event.guild.id : NULL;
                this.channelId = event.channel.id;
                this.eventId = event.id;

                this.user = event.author; //discord.js User Class
                this.userId = event.author.id;
                this.userName = event.author.username;

                this.bot = client;
                this.botUser = client.user;
                this.botId = client.user.id;
                this.botName = client.user.username;
                this.botNick = utils.getNick(this.botName);


                this.rawmsg = event.content||NULL;

                const botMention = "<@" + this.botId + ">";
                const msgWithoutMention = removeMention(this.rawmsg, botMention);
                const msgWithoutBotNick = removeBotNick(msgWithoutMention, this.botNick);

                this.isBotMentionned = this.rawmsg.indexOf(botMention) !== -1;
                this.isBotNamed = msgWithoutMention.toLowerCase().indexOf(this.botNick) === 0;
                this.isPrivate = this.mode === 2;

                this.strength = this.isBotMentionned + this.isBotNamed + this.isPrivate;

                this.msg = msgWithoutBotNick.toLowerCase();
            }
            
            
            
        }
    }
}


function removeMention(msg, botMention) { //removes the bot mention from the msg
    let newmsg = msg;
    let index = msg.indexOf(botMention);
    if (index !== -1) {
        newmsg = msg.slice(0, index)+msg.slice(index+botMention.length, msg.length);
    }
    return utils.clearWhitespaces(newmsg);
}
function removeBotNick(msgWithoutMention, botNick) { //removes the bot nickname from the msg
    let msgParsed = msgWithoutMention;
    if (msgWithoutMention.toLowerCase().indexOf(botNick) === 0) {
        msgParsed = msgWithoutMention.slice(botNick.length, msgWithoutMention.length);
    }
    return utils.clearWhitespaces(msgParsed);
}

class InfoPacket {
    constructor() {
        this.output = new OutputData();
        this.isHalted = false;
        this.doJump = false;
        this.doSave = false;
        this.doTerminate = false;
        this.jumpID = 0;
    }
    halt() {
        this.isHalted = true;
    }
    jump(uid) {
        this.doJump = true;
        this.jumpUid = uid;
    }
    save() {
        this.doSave = true;
    }
    exit() {
        this.doTerminate = true;
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