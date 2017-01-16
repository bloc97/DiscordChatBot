const GameMP = require("./GameMP.js");
const ClientSelf = require("./ClientSelf.js");


class TicTacToeMp extends GameMP {
    constructor(roomId, hostevent) {
        super("TicTacToeMp", "ttt1", roomId, 2, hostevent);
        this.data.log = [];
        this.data.board = [[0,0,0],[0,0,0],[0,0,0]];
        this.data.lastwinner = false;
    }
    addPlayer(user, nick) {
        if (!this.isPlayer(user)) { //if user is not already a player
            this.players.push(user.id); //add the player
            this.data[user.id] = {}; //create player data
            this.data[user.id].name = nick||user.username;
            this.data[user.id].client = false; //client object of the player
            this.data[user.id].score = 0;
            this.data[user.id].isTurn = false;
            this.data[user.id].unit = 0; //1 for X, -1 for O
            
            this.updateClients();
        }
    }
    connectPlayer(event, nick) {
        if (event.channel.type !== "dm") { //this game only supports self-clients
            return false;
        }
        const user = event.author;
        
        if (!this.data[user.id]) { //if user is not already a player
            this.players.push(user.id); //add the player
            this.data[user.id] = {}; //create player data
            this.data[user.id].name = nick||user.username;
            this.data[user.id].client = false; //client object of the player
            this.data[user.id].score = 0;
            this.data[user.id].isTurn = false;
            this.data[user.id].unit = 0; //1 for X, -1 for O
            
        }
        
        if (!this.isOnline(user) && this.isPlayer(user)) { //if user is not already online and is a player
            this.online.push(user.id);
            this.data[user.id].client = new TicTacToeMpClient(event, this); //client object of the player
            
            this.updateClients();
            return this.data[user.id].client; //returns the client
        }
        
        if (this.online.length === 2) {
            this.newBoard();
        }
        
        return false;
    }
    removePlayer(user) {
        const index = this.players.indexOf(user.id);
        if (index > -1) { //if user is in game
            this.players.splice(index, 1);
            this.data[user.id] = false;
            
            //reset board state here, and reset the player X, Os 
            
            this.updateClients();
        }
    }
    newBoard() {
        
    }
    eval(user, arg, command) {
        
        if (this.isValidCommand(arg) && this.isOnline(user) && this.isTurn(user)) {
            
            
            
            if (this.isNextTurn()) {
                const id0 = this.online[0];
                const id1 = this.online[1];
                const p0 = this.data[id0];
                const p1 = this.data[id1];
                
                const c0 = p0.choice[0];
                const c1 = p1.choice[0];
                
                this.println(p0.name + " played `" + this.getChoiceName(c0) + "`");
                this.println(p1.name + " played `" + this.getChoiceName(c1) + "`");
                
                if (c0 === c1) {
                    //draw
                    this.println("Draw!");
                } else if ((c0 === "r" && c1 === "s") || (c0 === "p" && c1 === "r") || (c0 === "s" && c1 === "p")) {
                    //p0 win
                    this.println("Winner: " + p0.name);
                    p0.score++;
                } else if ((c0 === "r" && c1 === "p") || (c0 === "p" && c1 === "s") || (c0 === "s" && c1 === "r")) {
                    //p1 win
                    this.println("Winner: " + p1.name);
                    p1.score++;
                }
                
                p0.choice = false;
                p1.choice = false;
                
                this.updateClients(); //update all clients
                
            } else {
                this.updateClient(user); //update only the user's client
            }
            
        } else if (arg === "say" && this.isOnline(user)) {
            const nextarg = command.args[1];
            const msg = command.textraw;
            const startindex = msg.toLowerCase().indexOf(nextarg);
            let text = msg.substring(startindex, msg.length);
            
            if (startindex < 5) text = false;
            
            if (text) {
                text = text.replace(/`/g,"");
                const playerName = this.data[user.id].name;
                this.println(playerName + ": " + text);
                this.updateClients();
            }
        }
    }
    print(str) { //adds the string to this.display
        this.data.log[this.display.length-1] += str;
    }
    println(str) { //adds the string to this.display but with a new line
        this.data.log.push(str);
    }
    getChoiceName(char) {
        switch(char) {
            case "r":
                return "rock";
            case "p":
                return "paper";
            case "s":
                return "scissors";
            default:
                break;
        }
    }
    isValidCommand(str) {
        return (["a1","a2","a3","b1","b2","b3","c1","c2","c3","1a","1b","1c","2a","2b","2c","3a","3b","3c"].indexOf(str) !== -1);
    }
    isTurn(user) {
        return this.data[user.id].isTurn;
    }
}



class TicTacToeMpClient extends ClientSelf {
    constructor(event, game) {
        super(event, game);
    }
    getMessage() {
        return "";
    }
    getLogs() { //gets the string to print in js markup
        const logs = this.game.data.log;
        const size = logs.length;
        const maxLines = 15;
        let limitedDisplay = logs;
        if (size > maxLines) {
            limitedDisplay = limitedDisplay.slice(size-maxLines-1, size);
        }
        return limitedDisplay;
    }
    getPlayerList() {
        const online = this.game.online;
        const offline = this.game.offline;
        const strList = [];
        
        for (let i=0; i<online.length; i++) {
            const playerId = online[i];
            if (playerId === this.userId) {
                const playerName = this.game.data[playerId].name;
                const playerScore = this.game.data[playerId].score;
                strList.push("`" + playerScore + "` " + "__**" + playerName + "**__");
                break;
            }
        }
        
        for (let i=0; i<online.length; i++) {
            const playerId = online[i];
            if (playerId !== this.userId) {
                const playerName = this.game.data[playerId].name;
                const playerScore = this.game.data[playerId].score;
                strList.push("`" + playerScore + "` " + "**" + playerName + "**");
            }
        }
        
        for (let i=0; i<offline.length; i++) {
            const playerId = offline[i];
            const playerName = this.game.data[playerId].name;
                const playerScore = this.game.data[playerId].score;
            strList.push("`" + playerScore + "` " + "*" + playerName + "*");
            
        }
        return strList;
        
    }
    getEmbed() {
        const game = this.game;
        const myplayer = this.game.data[this.userId];
        let choice = "";
        if (myplayer.choice) {
            choice = "`"+game.getChoiceName(myplayer.choice.charAt(0))+"`";
        } else {
            choice = "None";
        }
        const logs = this.getLogs();
        
//        console.log(choice);
//        console.log(logs);
//        console.log(this.getPlayerList().join(" "));
        
        return {embed: {
                  title: '',
                  color: 3447003,
                  fields: [
                    {
                      name: 'Rock Paper Scissors \u2003 \u2003 \u2003 \u2003 \u2003 \u2003 \u2003 \u2003 \u2003 \u2003 \u2003 \u200b',
                      value: "```js\nYour choice: "+ choice +"\n```",
                      inline: true
                    },
                    {
                      name: '\u200b',
                      value: this.getPlayerList().join("\n"),
                      inline: true
                    },
                    {
                      name: '\u200b',
                      value: "```js\n" + logs.join("\n") + "\n```",
                      inline: false
                    }
                  ]
                }};
    }
}


module.exports = RockPaperScissorsMp;