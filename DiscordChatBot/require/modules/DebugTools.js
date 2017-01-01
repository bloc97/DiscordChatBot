const utils = require("../utils.js");
const os = require("os");

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
                case "prune":
                    const number = +infopacket.command.args[1]+1||2;
                    console.log(number);
                    var array = [];
                    const messagearr = eventpacket.event.channel.fetchMessages({limit:number})
                            .then(messages => {
                                let array = messages.array();
                                for (let i=0; i<array.length; i++) {
                                    if (eventpacket.mode === 2) {
                                        if (eventpacket.botId === array[i].author.id) {
                                            array[i].delete().then().catch(err => {});
                                        }
                                        continue;
                                    } else {
                                        array[i].delete().then().catch(err => {});
                                    }
                                }
                            })
                            .catch(err => {});
                    break;
                case "stats":
                    let memory = process.memoryUsage();
                    let rssusage = utils.getSizeStamp(memory.rss);
                    let heapTotal = utils.getSizeStamp(memory.heapTotal);
                    let heapUsed = utils.getSizeStamp(memory.heapUsed);
                    let external = (memory.external) ? utils.getSizeStamp(memory.external) : "0 B";
                    let proc = process.cpuUsage();
                    
                    eventpacket.event.reply("", {embed: {
                      color: 3447003,
                      author: {
                        name: eventpacket.botName,
                        icon_url: eventpacket.bot.user.avatarURL
                      },
                      title: 'Current Statistics\n',
                      fields: [
                        {
                          name: '• Total RSS',
                          value: rssusage,
                          inline: true
                        },
                        {
                          name: '• Heap Used',
                          value: heapUsed + "\n\n\n",
                          inline: true
                        },
                        {
                          name: '• Heap Total',
                          value: heapTotal,
                          inline: true
                        },
                        {
                          name: '• External',
                          value: external,
                          inline: true
                        },
                        {
                          name: '• Processor',
                          value: proc.user + " " + proc.system,
                          inline: true
                        }
                      ],
                      timestamp: new Date()
                    }});
                    
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
                          value: 'They can have different fields with small headlines.',
                          inline: true
                        },
                        {
                          name: 'Masked links',
                          value: 'You can put [masked links](http://google.com) inside of rich embeds.',
                          inline: true
                        },
                        {
                          name: 'Markdown',
                          value: 'You can put all the *usual* **__Markdown__** inside of them.',
                          inline: false
                        }
                      ],
                      timestamp: new Date(),
                      footer: {
                        icon_url: eventpacket.bot.user.avatarURL,
                        text: '© Example'
                      }
                    }});
                    eventpacket.event.delete().then().catch(err => {});
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