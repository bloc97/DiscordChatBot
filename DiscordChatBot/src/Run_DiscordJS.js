const Discord = require('discord.js');
const fs = require('fs');

const AI = require("./require/Core.js");
const EventHandler = require("./require/EventHandler.js");
const utils = require("./require/utils.js");

const discordbot = new Discord.Client();
const config = JSON.parse(fs.readFileSync("DiscordJS.config"))
const token = config.token;
const debug = config.debug;
const api = "discord.js";
let nick;

const botAI = new AI(api, debug);

discordbot.on("ready", function() {
    const id = discordbot.user.id;
    const name = discordbot.user.username;
    botAI.updateData(id, name, nick);
    console.log("NLP Bot started up succesfully!");
});

discordbot.on("message", function(ev) {
	if (ev.content === "ping") {
		ev.reply("pong");
		ev.author.sendFile("https://i.ytimg.com/vi/7rVGyi5_LIU/maxresdefault.jpg");
	}
});

discordbot.login(token);