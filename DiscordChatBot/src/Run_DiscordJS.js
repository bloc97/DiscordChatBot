const Discord = require('discord.js');
const utils = require("utils.js");

const discordbot = new Discord.client();

const token = "MjYyMjY2MjA3MjEyNzk3OTcy.C0BTQg.5adsgp-eKZH537Y9iSBS4iezpQc";

discordbot.on("ready", function() {
	console.log("I am ready!");
	discordbot.user.setGame("World Domination");
});

discordbot.on("message", function(ev) {
	if (ev.content === "ping") {
		ev.reply("pong");
		ev.author.sendFile("https://i.ytimg.com/vi/7rVGyi5_LIU/maxresdefault.jpg");
	}
});

discordbot.login(token);