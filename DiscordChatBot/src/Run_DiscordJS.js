const Discord = require('discord.js');
const fs = require('fs');

const AI = require("./require/Core.js");
const EventHandler = require("./require/EventHandler.js");
const utils = require("./require/utils.js");

const discordbot = new Discord.Client();
const config = JSON.parse(fs.readFileSync("DiscordJS.config"));
const token = config.token;
const debug = config.debug;
const api = "discord.js";

const botAI = new AI(api, debug);

const Module_CommandProc = require("./require/modules/CommandProc.js");
//const Module_AddonManager = 
//const Module_NLP = 
//const Module_DataHandler =
//const Module_Latency =
//const Module_Output =

const commandProc = new Module_CommandProc;
//const addonManager = new Module_AddonManager();
//const nlp = new Module_NLP();
//const dataHandler = new Module_DataHandler();
//const latency = new Module_Latency();
//const output = new Module_Output();

botAI.moduleHandler.register(commandProc);
//botAI.moduleHandler.register(addonManager);
//botAI.moduleHandler.register(nlp);
//botAI.moduleHandler.register(dataHandler);
//botAI.moduleHandler.register(latency);
//botAI.moduleHandler.register(output);

discordbot.on("ready", function() {
    
    botAI.moduleHandler.load(commandProc);
    console.log("NLP Bot started up succesfully!");
});

discordbot.on("message", function(ev) {
    const id = discordbot.user.id;
    const name = discordbot.user.username||utils.NULL;
    const nick = utils.getNick(name)||name;
    
    const eventPacket = new EventHandler.EventPacket(ev, api, id, name, nick);
    const infoPacket = new EventHandler.InfoPacket();
    
    botAI.moduleHandler.send(eventPacket, infoPacket);
    
//	if (ev.content === "christmas") {
//            ev.channel.sendMessage("Merry Christmas! @everyone");
//		//ev.reply("Merry Christmas! @everyone");
//	}
});

discordbot.login(token);