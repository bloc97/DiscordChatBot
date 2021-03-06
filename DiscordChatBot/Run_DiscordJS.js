const fs = require('fs');
const utils = require("./require/utils.js");
const AI = require("./require/Core.js");
const EventHandler = require("./require/EventHandler.js");

//Parses the config file
let configFile;
try {
    configFile = fs.readFileSync("DiscordJS.config");
} catch (err) {
    utils.logErr("Error, could not find DiscordJS.config.");
    process.exit();
}
const config = JSON.parse(configFile);
const token = config.token;
const debug = config.debug;
const api = "discord.js";

//Initialises the Logic
const botAI = new AI(api, debug);
botAI.moduleHandler.registerAll("./require/modules/");

//Initialises Discord.js API Client
const Discord = require('discord.js');
const discordbot = new Discord.Client();

discordbot.on("ready", function() {
    utils.logDone("Connected.");
    botAI.moduleHandler.loadAll();
    botAI.moduleHandler.initData("./data_" + discordbot.user.id + ".json");
    utils.logDone("ARIMA Bot started up succesfully!"); //HAL 9001
    utils.logInfo("Attched to user " + discordbot.user.id + " with the name " + discordbot.user.username + ".");
});

discordbot.on("message", function(ev) {
    const eventPacket = new EventHandler.EventPacket(api, "message", ev, discordbot);
    
    botAI.moduleHandler.send(eventPacket);
    
});

discordbot.login(token).then().catch(err => console.error(err));
utils.log("Connecting to discord...");