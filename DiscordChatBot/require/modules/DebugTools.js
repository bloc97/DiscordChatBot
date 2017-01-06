const utils = require("../utils.js");

class DebugTools { //Debug tools module
    
    constructor(debug) {
        this.name = "DEBG";
        this.desc = "Debug Tools Module";
        this.refname = "DebugTools";
        this.id = 650, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "debg1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
        //modules are run in order, from the smallest id to the largest id.
        
    }
    main(eventpacket, infopacket, data) {
        if (eventpacket.type !== "message" || eventpacket.isSelf) {
            return;
        }
        const symbol = infopacket.command.symbol;
        const command = infopacket.command.verb;
        const args = infopacket.command.args;
        
        if (symbol !== "/" || command !== "debug") {
            return;
        }
        if (args[0] === "stats") {
            eventpacket.event.delete();
            let memory = process.memoryUsage();
            let rssusage = utils.getSizeStamp(memory.rss);
            let heapTotal = utils.getSizeStamp(memory.heapTotal);
            let heapUsed = utils.getSizeStamp(memory.heapUsed);
            let external = (memory.external) ? utils.getSizeStamp(memory.external) : "0 B";
            let proc = process.cpuUsage();

            eventpacket.event.channel.sendMessage("", {embed: {
              color: 3447003,
              author: {
                name: eventpacket.userName + "'s Selfbot"
                //icon_url: eventpacket.bot.user.avatarURL
              },
              title: 'Current Statistics',
              fields: [
                {
                  name: '\u2022 Total RSS',
                  value: rssusage,
                  inline: true
                },
                {
                  name: '\u2022 Heap Used',
                  value: heapUsed,
                  inline: true
                },
                {
                  name: '\u2022 Heap Total',
                  value: heapTotal,
                  inline: true
                },
                {
                  name: '\u2022 External',
                  value: external,
                  inline: true
                },
                {
                  name: '\u2022 Processor Time Used (User)',
                  value: proc.user/1000 + " ms",
                  inline: true
                },
                {
                  name: '\u2022 Processor Time Used (System)',
                  value: proc.system/1000 + " ms",
                  inline: true
                }
              ],
              timestamp: new Date(),
              footer: {
                text: "This message will self-delete in 10 seconds."
              }
            }}).then(message => {message.delete(10000);}).catch(err => {});
        }
    }
}

module.exports = DebugTools;