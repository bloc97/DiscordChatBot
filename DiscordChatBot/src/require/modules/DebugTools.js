const utils = require("../utils.js");

class DebugTools {
    
    constructor(debug) {
        this.name = "DBGT";
        this.desc = "Debug Tools";
        this.refname = "DebugTools";
        this.id = 150, //ID used to load modules in order
        this.uid = "dbgt1000";
        this.isDebug = debug||false;
    }
    main(eventpacket, infopacket, data) {
        if (eventpacket.strength < 1) {
            return;
        }
        if (infopacket.command.verb === "debug") {
            switch(infopacket.command.args[0]) {
                case "save":
                    infopacket.save();
                    break;
                case "exit":
                    infopacket.save();
                    infopacket.exit();
                    break;
                case "embed":
                    eventpacket.event.reply("", {embed: {
                      color: 3447003,
                      author: {
                        name: eventpacket.botName,
                        icon_url: eventpacket.bot.user.avatarURL
                      },
                      title: 'This is an embed',
                      url: 'http://google.com',
                      description: 'This is a test embed to showcase what they look like and what they can do.',
                      fields: [
                        {
                          name: 'Fields',
                          value: 'They can have different fields with small headlines.'
                        },
                        {
                          name: 'Masked links',
                          value: 'You can put [masked links](http://google.com) inside of rich embeds.'
                        },
                        {
                          name: 'Markdown',
                          value: 'You can put all the *usual* **__Markdown__** inside of them.'
                        }
                      ],
                      timestamp: new Date(),
                      footer: {
                        icon_url: eventpacket.bot.user.avatarURL,
                        text: '© Example'
                      }
                    }});
                    break;
                default :
                    eventpacket.event.reply("****DEBUG COMMANDS****\nsave: Saves the current database to file.\nexit: Shuts down " + eventpacket.botName);
                    break;
            }
            
        }
        
        if (!data.logs) {
            data.logs = [];
        }
        
    }
}


module.exports = DebugTools;