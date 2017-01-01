const fs = require('fs');
const utils = require("./require/utils.js");
const AI = require("./require/Core.js");
const EventHandler = require("./require/EventHandler.js");

//Parses the config file
const config = JSON.parse(fs.readFileSync("DiscordJS.config"));
const token = config.token;
const debug = config.debug;
const api = "discord.js";

//Initialises ARIMA Engine
const botAI = new AI(api, debug);
botAI.moduleHandler.registerAll("./require/modules/");

//Initialises Discord.js API Client
const Discord = require('discord.js');
const discordbot = new Discord.Client();

discordbot.on("ready", function() {
    console.log(utils.getTimeStamp() + "Connected.");
    botAI.moduleHandler.loadAll();
    botAI.moduleHandler.initData("./data_" + discordbot.user.id + ".json");
    console.log(utils.getTimeStamp() + "ARIMA Bot started up succesfully!"); //ARtificially-Intelligent Modular Assistant
});

discordbot.on("message", function(ev) {
    const eventPacket = new EventHandler.EventPacket(api, "message", ev, discordbot);
    
    botAI.moduleHandler.send(eventPacket);
    
//	if (ev.content === "christmas") {
//            ev.channel.sendMessage("Merry Christmas! @everyone");
//		//ev.reply("Merry Christmas! @everyone");
//	}
});

discordbot.login(token);
console.log(utils.getTimeStamp() + "Connecting to discord...");