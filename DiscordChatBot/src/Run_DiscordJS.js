const Discord = require('discord.js');
const fs = require('fs');

const AI = require("Core.js");
const EventHandler = require("EventHandler.js");
const utils = require("utils.js");

const discordbot = new Discord.client();
const token = JSON.parse(fs.readFileSync("DiscordJS.config")).token;
const api = "discord.js";
let nick;

const botAI = new AI(api);

discordbot.on("ready", function() {
    const id = discordbot.user.id;
    const name = discordbot.user.username;
    botAI.updateData(id, name, nick);
    console.log("I am ready!");
});

discordbot.on("message", function(ev) {
	if (ev.content === "ping") {
		ev.reply("pong");
		ev.author.sendFile("https://i.ytimg.com/vi/7rVGyi5_LIU/maxresdefault.jpg");
	}
});

discordbot.login(token);