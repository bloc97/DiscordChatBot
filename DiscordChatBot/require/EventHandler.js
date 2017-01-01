const utils = require("./utils.js");
const NULL = utils.NULL;

class EventPacket {
    
    constructor(api, type, event, botClient) {
        this.api = api;
        this.type = type;
        this.event = event;
        this.bot = botClient;

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
                this.strength = -1;
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
                
                this.botUser = botClient.user;
                this.botId = botClient.user.id;
                this.botName = botClient.user.username;
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
function removeBotNick(msgWithoutMention, botNick) { //removes the bot nickname from the msg, and ",;" too.
    let msgParsed = msgWithoutMention;
    if (msgWithoutMention.toLowerCase().indexOf(botNick) === 0) {
        msgParsed = msgWithoutMention.slice(botNick.length, msgWithoutMention.length);
    }
    msgParsed = utils.clearWhitespaces(msgParsed);
    
    const char0 = msgParsed.charAt(0);
    if (char0 === "," || char0 === ";") {
        msgParsed = msgParsed.slice(1, msgParsed.length); //If there's a comma or semicolon, remove it.
    }
    return utils.clearWhitespaces(msgParsed);
}



exports.EventPacket = EventPacket;