const GameSP = require("./GameSP.js");
const ClientSelf = require("./ClientSelf.js");


class RockPaperScissorsSp extends GameSP {
    constructor(roomId, hostevent, nick) {
        super("RockPaperScissorsSp", "rps1", roomId, hostevent, nick);
        this.data.score = 0;
        this.data.cscore = 0;
        this.data.log = [];
    }
    connectPlayer(event) {
        if (event.channel.type !== "dm") { //this game only supports self-clients
            return false;
        }
        const user = event.author;
        
        if (!this.isOnline && user.id === this.hostId) { //if user is not already online and is the host
            this.isOnline = true;
            this.data.client = new RockPaperScissorsSpClient(event, this); //client object of the player
            
            return this.data.client; //returns the client
            
        }
        
        return false;
    }
    eval(user, arg) {
        if (this.isValidCommand(arg) && this.isOnline) {
            const choice = arg;
            
            let p = this.data;

            const c0 = arg[0];
            let c1 = "";
            
            const rand = Math.random();
            
            if (rand < 1/3) {
                c1 = "r";
            } else if (rand < 2/3) {
                c1 = "p";
            } else {
                c1 = "s";
            }

            this.println(p.name + " played `" + this.getChoiceName(c0) + "`");
            this.println("Computer played `" + this.getChoiceName(c1) + "`");

            if (c0 === c1) {
                this.println("Draw!");
                
            } else if ((c0 === "r" && c1 === "s") || (c0 === "p" && c1 === "r") || (c0 === "s" && c1 === "p")) {
                this.println("Winner: " + p.name);
                p.score++;
                
            } else if ((c0 === "r" && c1 === "p") || (c0 === "p" && c1 === "s") || (c0 === "s" && c1 === "r")) {
                this.println("Winner: Computer");
                this.data.cscore++;
            }


            this.updateClient(); //update all clients
                
            
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
        return (["rock","paper","scissors"].indexOf(str) !== -1) || (["r","p","s"].indexOf(str) !== -1);
    }
}



class RockPaperScissorsSpClient extends ClientSelf {
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
        const playerName = this.game.data.name;
        const playerScore = this.game.data.score;
        const aiScore = this.game.data.cscore;
        
        const strList = [];
        strList.push("`" + playerScore + "` " + "__**" + playerName + "**__");
        strList.push("`" + aiScore + "` " + "**Computer**");
        
        return strList;
        
    }
    getEmbed() {
        const logs = this.getLogs();
        
        return {embed: {
                  title: '',
                  color: 3447003,
                  fields: [
                    {
                      name: 'Rock Paper Scissors \u2003 \u2003 \u2003 \u2003 \u2003 \u2003 \u2003 \u2003 \u2003 \u2003 \u2003 \u200b',
                      value: "```js\nAI Type: `Random`\n```",
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


module.exports = RockPaperScissorsSp;