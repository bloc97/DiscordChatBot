const utils = require("../utils.js");
const NULL = utils.NULL;
const chrono = require('chrono-node');

const helpMain = "```" + 
`Toolbox Module Help
   /toolbox <command> [--options <args>] 

Commands:
   prune           - Mass delete chat messages.
   
   help            - Opens this help page.
   
Options:
   --help          - Opens the help page for that command.
      <page>       - [optional] page (default: 1)
                     --help all displays all the pages`
+ "```";

const helpPrune = "```" + 
`Toolbox Prune Command Help
   /toolbox prune <amount> [-switches] [--options <args>] 

Switches:
   -s              - Prunes your own messages. (default behaviour)
   -b              - Prunes the bot's messages.
   -a              - Prunes all messages.

Options:
   --id            - Specifies the IDs of users to prune, overrides switches.
      <ids>        - IDs of users to prune, separated by spaces

   --name          - Specifies the names of users to prune, overrides switches.
      <names>      - partial name of the users, separated by spaces

Page 1 of 3` + "```";

const helpPrune2 = "```" + 
`   --amount        - Specifies the amount of last messages to prune, overrides --time
      <amount>     - integer amount
      <skip>       - [optional] numbers of messages to skip
                     eg. --amount 10   will prune the last 10 messages
                         --amount 4 10 will prune the last 14 to 10 messages
                         --amount 10 4 will prune the last 14 to 4 messages

   --interval      - Specifies the interval of last messages to prune, overrides --time and --amount
      <start>      - start of interval
      <end>        - [optional] end of interval
                     eg. --interval 10 will prune the last 10 messages
                         --interval 14 10 will prune the last 14 to 10 messages
                         --interval 10 14 will prune the last 14 to 10 messages

Page 2 of 3` + "```";

const helpPrune3 = "```" + `
   --time          - Starts pruning from the specified number of hours/minutes
      <hours>      - hours ago
      <minutes>    - [optional] minutes ago (default: 0)

   --endtime       - [optional] Specifies a end time for the --time command
                     this will prune all messages from --time to --endtime
      <hours>      - [optional] hours ago (default: 0)
      <minutes>    - [optional] minutes ago (default: 0)

   --endamount     - [optional] Specifies a end amount for the --time command
                     this will prune x number of messages from --time
      <amount>     - integer amounttoolbo

Examples:
   /toolbox prune 10 -s
   /toolbox prune 26 --id 3246281234 736245326
   /toolbox prune --name theGuy theOtherGuy --amount 30
   /toolbox prune --id 3246281234 --time 1 40 --endtime 0 10

Page 3 of 3` + "```";

class Toolbox { //This is an module that adds some essential commands to the selfbot
    
    constructor(debug) {
        this.name = "TOOL";
        this.desc = "Toolbox Module";
        this.refname = "Toolbox";
        this.id = 700, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "tool1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
        //modules are run in order, from the smallest id to the largest id.
        
    }
    main(eventpacket, infopacket, data) {
        if (eventpacket.type !== "message" || eventpacket.isSelf || eventpacket.strength < 1) {
            return;
        }
        const symbol = infopacket.command.symbol;
        const command = infopacket.command.verb;
        const args = infopacket.command.args;
        const tokens = infopacket.command.tokens;
        const switches = infopacket.command.switches;
        const options = infopacket.command.options;
        
        const ev = eventpacket.event;
        const channel = eventpacket.event.channel;
        
        if (command !=="toolbox") {
            return;
        }
        if (args[0] === "help" || (!args[0] && options.help) || !args[0]) {
            ev.author.sendMessage(helpMain);
            return;
        }
        if (args[0] === "prune") {
            if ((!options.amount && !options.interval && !options.time && !args[1]) || options.help || args[1] === "help") {
                switch (options.help) {
                    case "2":
                        ev.author.sendMessage(helpPrune2);
                        break;
                    case "3":
                        ev.author.sendMessage(helpPrune3);
                        break;
                    case "all":
                        ev.author.sendMessage(helpPrune);
                        ev.author.sendMessage(helpPrune2);
                        ev.author.sendMessage(helpPrune3);
                        break;
                    default:
                        ev.author.sendMessage(helpPrune);
                        break;
                }
                return;
            }
            
            const selfId = eventpacket.userId;
            const botId = eventpacket.botId;
            let ids = [];
            
            if (!options.id && !options.name) {
                if (switches.indexOf("-s") !== -1 || switches.length === 0) {
                    ids.push(selfId);
                }
                if (switches.indexOf("-b") !== -1) {
                    ids.push(botId);
                }
                ids = ids.join(" ");
                if (switches.indexOf("-a") !== -1) {
                    ids = "";
                }
            } else {
                ids = options.id||"";
            }
            let names = options.name||"";
            this.smartPrune(eventpacket.event, ids, names, args[1], options.amount, options.interval, options.time, options.endtime, options.endamount);
            return;
        }
        
    }
    smartPrune(message, ids, names, num, amount, interval, stime, etime, eamount) {
        message.delete().then(delMessage => {
            delMessage.channel.fetchMessages({limit:100}).then(messages => {
                

                let rawArray = messages.array();
                let idArray = ids.split(" ");
                let nameArray = names.split(" ");
                let filterArray = [];
                filterArray = rawArray.filter(m => userFilter(m, idArray, nameArray));
                
                if (interval) {
                    let min, max;
                    let intervalArray = interval.split(" ");
                    if (intervalArray.length > 1) {
                        min = Math.min(...intervalArray)||0;
                        max = Math.max(...intervalArray)||0;
                    } else {
                        min = 0;
                        max = Math.max(...intervalArray)||0;
                    }
                    filterArray.length = Math.min(max, filterArray.length);
                    filterArray = filterArray.reverse();
                    let skip = max-min;
                    filterArray.length = Math.min(skip, filterArray.length);
                    
                } else if (amount) {
                    let min, max;
                    let amountArray = amount.split(" ");
                    if (amountArray.length > 1) {
                        min = Math.min(...amountArray)||0;
                        max = Math.max(...amountArray)||0;
                    } else {
                        min = 0;
                        max = Math.max(...amountArray)||0;
                    }
                    filterArray.length = Math.min(max+min, filterArray.length);
                    filterArray = filterArray.reverse();
                    filterArray.length = Math.min(min, filterArray.length);
                    
                } else if (stime) {
                    
                    let stimeArray = stime.split(" ");
                    
                    const minstoms = 60*1000;
                    const hourstoms = 60*60*1000;
                    
                    let startms = (+stimeArray[0]||0) * hourstoms + (+stimeArray[1]||0) * minstoms;
                    let endms = 0;
                    
                    if (etime) {
                        let etimeArray = etime.split(" ");
                        endms =  (+etimeArray[0]||0) * hourstoms + (+etimeArray[1]||0) * minstoms;
                        
                    }
                    filterArray = filterArray.filter(m => timeFilter(m, startms, endms));
                    if (eamount) {
                        filterArray = filterArray.reverse();
                        filterArray.length = filterArray.length - (+eamount||0);
                    }
                } else {
                    filterArray.length = Math.min(num, filterArray.length);
                    prune(filterArray);
                    return;
                }
                
                filterArray = filterArray.reverse(); //reverse for deleting in order

                prune(filterArray);
                
//              let array = messages.array();
//              let filterArray = array.reverse();
//              filterArray = array.filter(m => m.author.id === id);
//              let count = Math.min(num||999, filterArray.length);
//              filterArray.length = count;
//              self.prune(filterArray);
            }).catch(err => {});
                
                
        }).catch(err => {});
        
        

    }
}


const prune = function(messageArray) {
    if (messageArray.length < 1) return;
    
    for (let i=0; i<messageArray.length; i++) {
        messageArray[i].delete().then().catch(err => {});
    }
};

const userFilter = function(message, idArray, nameArray) {
    if (idArray[0] === "" && nameArray[0] === "") {
        return true;
    }
    if (idArray.length > 0) {
        if (idArray.indexOf(message.author.id) !== -1) return true;
    }
    if (nameArray.length > 0) {
        if (arrayPartialSearch(nameArray, message.author.username)) return true;
    }
    return false;
};

const timeFilter = function(message, startms, endms) {
    const timeDiff = (new Date().value) - message.createdAt.value;
    if (timeDiff < startms && timeDiff > endms) {
        return true;
    }
    return false;
};

const arrayPartialSearch = function(array, partialstr) {
    for (let i=0; i<array.length; i++) {
        if (array[i].toLowerCase().indexOf(partialstr.toLowerCase()) !== -1) {
            return true;
        }
    }
    return false;
};

module.exports = Toolbox;

//
//
//        if (!arg1 || arg1 === "bot") {
//            self.currentChannel.fetchMessages({limit:100})
//                .then(messages => {
//                    let array = messages.array();
//                    const myarray = array.filter(m => m.author.id === self.currentBotId);
//                    let count = Math.min(number+1, myarray.length);
//                    myarray.length = count;
//                    self.prune(myarray);
//                    
//            }).then().catch(err => {console.log(err);});
//        } else if (arg1 === "all") {
//            self.currentChannel.fetchMessages({limit:100})
//                .then(messages => {
//                    let array = messages.array();
//                    const myarray = array;
//                    let count = Math.min(number+1, myarray.length);
//                    myarray.length = count;
//                    self.prune(myarray);
//                    
//            }).then().catch(err => {console.log(err);});
//        }