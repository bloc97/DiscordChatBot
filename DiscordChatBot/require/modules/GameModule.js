const utils = require("../utils.js");
const mathjs = require("mathjs");

const helpMain = "```" + 
`Game Module Help
   /game <command> <args> [-switches] [--options <args>]

Commands:
   
   start           - Starts a game.
      <game#>      - Game #

   join            - Connects to a game
      <roomId>     - Room ID or MMO Game Server ID

   exit            - Closes the client and disconnects from the current active game

   enter           - Signs in a game without connecting
      <roomId>     - Room ID (Usually provided by the host)

   quit            - Quits the current game
                     This opens a slot for someone else to join, and erases your player from the game

   end             - Ends the current game 
                     only available to the games you are hosting

Games:
   1- Rock-Paper-Scissors (SP/MP)
   2- Tic-Tac-Toe         (SP/MP)
` + "```";
   
   
//Options:   
//   
//   
//   exit            - Closes the active console.
//   kill            - Ends the active console.
//   clear           - Clears the current active console.
//   refresh         - Refreshes and drags the console to the bottom.
//
//   save            - Starts a saved session.
//      <name>
//   load            - Saves the current session state.
//      <name>


const helpRPS = "```" + 
`Rock-Paper-Scissors Game Help
   /game 1 [-switches] [--options <args>]
   
Options:   
   
   start           - Starts the REPL console.
   
   exit            - Closes the active console.
   kill            - Ends the active console.
   clear           - Clears the current active console.
   refresh         - Refreshes and drags the console to the bottom.

   save            - Starts a saved session.
      <name>
   load            - Saves the current session state.
      <name>`
+ "```";

//singleplayer games, can save, load
//multiplayer based games, one person hosts, and can save/load
//mmo type game, anyone joins in, logs out at whim, persistent world

//two types of consoles
//one is where each player has its own console
//other is where all players use the same console on one channel

const RockPaperScissorsMp = require("./Games/RockPaperScissorsMp.js");
const RockPaperScissorsSp = require("./Games/RockPaperScissorsSp.js");

class GameMod { //This is an module that adds some essential commands to the selfbot
    
    constructor(debug) {
        this.name = "GAME";
        this.desc = "Game Module";
        this.refname = "GameMod";
        this.id = 950, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "game1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
        //modules are run in order, from the smallest id to the largest id.
        
        this.selfClients = {}; //selfClients[userId] to get client
        this.sharedClients = {}; //sharedClients[channelId] to get instance
        
        this.roomIds = [];
        
        this.spGames = {}; //spGames[roomId] to get game
        this.mpGames = {};
        this.moGames = {};
        
    }
    main(eventpacket, infopacket, data) {
        if (eventpacket.type !== "message" || eventpacket.strength < 1 || eventpacket.isSelf) {
            return;
        }
        const symbol = infopacket.command.symbol;
        const command = infopacket.command.verb;
        const args = infopacket.command.args;
        const ev = eventpacket.event;
        const user = eventpacket.event.author;
        const userId = eventpacket.userId;
        const channelId = eventpacket.channelId;
        
        
        if (command !=="game") {
            return;
        }
        const userClient = this.selfClients[userId];
        const channelClient = this.sharedClients[channelId];
        
        if (!args[0] || args[0] === "help") {
            if (userClient) { //if game is currently running
                //userClient.game.getHelp();
                return;
            }
            ev.author.sendMessage(helpMain);
            return;
        }
        
        
        if (args[0] === "start" && args[1]) {
            const roomId = this.getRoomId();
            
            if (args[1] === "1") {
                this.mpGames[roomId] = new RockPaperScissorsSp(roomId, ev);
            } else {
                this.mpGames[roomId] = new RockPaperScissorsMp(roomId, ev);
            }
            
            user.sendMessage("RoomID: " + roomId);
            
        } else if (args[0] === "enter" && args[1]) {
            
            if (this.mpGames[args[1]]) {
                this.mpGames[args[1]].addPlayer(user);
            }
            
        } else if (args[0] === "join" && args[1]) {
            
            const thisgame = this.mpGames[args[1]];
            
            if (thisgame && !userClient) {
                this.selfClients[userId] = thisgame.connectPlayer(ev);
            }
            
        } else if (args[0] === "exit") {
            if (channelClient) {
                
            } else if (userClient) {
                this.selfClients[userId] = false;
                userClient.disconnect();
            }
            
            
        } else if (userClient) {
            
            userClient.eval(user, args[0], infopacket.command);
        }
        
//        if (["start","init"].indexOf(args[0]) !== -1) {
//            if (userConsole) {
//                userConsole.destroy();
//                this.activeConsoles[userId] = false;
//            }
//            const console = new Console(ev);
//            this.activeConsoles[userId] = console;
//            
//            return;
//        } else if (["close","end","exit"].indexOf(args[0]) !== -1 && userConsole) {
//            userConsole.destroy();
//            ev.delete().then().catch(err => {});
//            this.activeConsoles[userId] = false;
//            
//        } else if (["refresh","reload"].indexOf(args[0]) !== -1 && userConsole) {
//            userConsole.registerCommand(ev);
//            userConsole.refresh(ev);
//        } else if (args[0]) {
//            if (userConsole) {
//                userConsole.updateRepl(ev);
//            }
//        }
        
        
    }
    getRoomId() {
        let randId = "";
        do {
            randId = randomString(1, "a") + randomString(7, "a#");
        }while(this.roomIds.indexOf(randId) > 0);
        
        this.roomIds.push(randId);
        
        return randId;
        
    }
    
}
module.exports = GameMod;

class User {
    constructor(id, name) {
        this.id = id;
        this.username = name;
    }
}


const randomString = function(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
};