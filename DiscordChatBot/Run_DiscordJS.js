const fs = require('fs');
const utils = require("./require/utils.js");
const AI = require("./require/Core.js");
const EventHandler = require("./require/EventHandler.js");

//Parses the config file
let configFile;
try {
    configFile = fs.readFileSync("self_DiscordJS.config");
} catch (err) {
    console.log("Error, could not find self_DiscordJS.config.");
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
    console.log(utils.getTimeStamp() + "Connected.");
    botAI.moduleHandler.loadAll();
    botAI.moduleHandler.initData("./data_" + discordbot.user.id + ".json");
    console.log(utils.getTimeStamp() + "Self-Bot started up succesfully!");
    console.log(utils.getTimeStamp() + "Attched to user " + discordbot.user.id + " with the name " + discordbot.user.username + ".");
});

discordbot.on("message", function(ev) {
    const eventPacket = new EventHandler.EventPacket(api, "message", ev, discordbot);
    
    botAI.moduleHandler.send(eventPacket);
    
});

discordbot.login(token).then().catch(err => console.error(err));
console.log(utils.getTimeStamp() + "Connecting to discord...");