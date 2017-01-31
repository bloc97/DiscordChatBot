const utils = require("../utils.js");
const rsapi = require("runescape-api");

class RsApiMod {
    
    constructor(debug) {
        this.name = "RSCA";
        this.desc = "Runescape API Module";
        this.refname = "RsApiMod";
        this.id = 1500, //ID used to load modules in order, use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "rsca1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
        //this.isExample = true; //delete this line to enable the module
        //modules are run in order, from the smallest id to the largest id.
        
    }
    main(eventpacket, infopacket, data) {
        
        if (eventpacket.type !== "message" || eventpacket.strength < 1 || eventpacket.isSelf) {
            return;
        }
        
        const message = eventpacket.event;
        const rawmsg = message.content;
        const channel = eventpacket.event.channel;
        const command = infopacket.command.verb;
        const args = infopacket.command.args;
        const quotes = infopacket.command.quotes;
        
        const self = this;
        
        if (command !== "rs") {
            return;
        }
        if ((args[0] === "hs") && args[1]) {
            let playername = args[1];
            
            if (args[2]) {
                playername = rawmsg.slice(rawmsg.indexOf("hs") + 3, rawmsg.length);
            }
            if (quotes[0]) {
                playername = quotes[0];
            }
            rsapi.rs.hiscores.player(playername).then(function(info){
                
                self.returnInfo(info, message, playername);
                
            }).catch(err => {message.reply("Sorry, could not find \"" + playername + "\" on the Runescape 3 leaderboards.").then().catch(err => {});});
            
        } else if ((args[0] === "ohs") && args[1]) {
            let playername = args[1];
            
            if (args[2]) {
                playername = rawmsg.slice(rawmsg.indexOf("ohs") + 4, rawmsg.length);
            }
            if (quotes[0]) {
                playername = quotes[0];
            }
            rsapi.osrs.hiscores.player(playername).then(function(info){
                
                self.returnOldInfo(info, message, playername);
                
            }).catch(err => {message.reply("Sorry, could not find \"" + playername + "\" on the old Runescape leaderboards.").then().catch(err => {});});
            
        }
        
        
        
    }
    returnOldInfo(info, message, playername) {
        const skills = info.skills;
        const oskills = skills.overall;
        
        const attack = skills.attack.level;
        const strength = skills.strength.level;
        const ranged = skills.ranged.level;
        const magic = skills.magic.level;
        const defence = skills.defence.level;
        const health = skills.hitpoints.level;
        const prayer = skills.prayer.level;
        
        const base = 0.25 * (defence + health + Math.floor(0.5 * prayer));
        const melee = 0.325 * (attack + strength);
        const range = 0.325 * (Math.floor(0.5 * ranged) + ranged);
        const mage = 0.325 * (Math.floor(0.5 * magic) + magic);
        
        const combat = Math.floor(base + Math.max(melee, range, mage));
        
        message.reply("\n**Old Runescape**\nPlayer Name: " + playername + "\nRank: " + oskills.rank + "\nOverall Level: " + oskills.level + "\nCombat Level: " + combat).then().catch(err => {});
    }
    returnInfo(info, message, playername) {
        const skills = info.skills;
        const oskills = skills.overall;
        
        const attack = skills.attack.level;
        const strength = skills.strength.level;
        const ranged = skills.ranged.level;
        const magic = skills.magic.level;
        const defence = skills.defence.level;
        const health = skills.hitpoints.level;
        const prayer = skills.prayer.level;
        const summon = skills.summoning.level;
        
        const combat = Math.floor(((13/10) * Math.max((attack + strength), 2*magic, 2*ranged) + defence + health + Math.floor(0.5 * prayer) + Math.floor(0.5 * summon)) / 4);
        
        message.reply("\n**Runescape 3**\nPlayer Name: " + playername + "\nRank: " + oskills.rank + "\nOverall Level: " + oskills.level + "\nCombat Level: " + combat).then().catch(err => {});
        
    }
    
    
    
}

module.exports = RsApiMod;