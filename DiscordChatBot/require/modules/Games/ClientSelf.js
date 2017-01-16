class ClientSelf {
    constructor(event, game) {
        this.user = event.author;
        this.userId = event.author.id;
        this.game = game;
        this.canUpdate = false; //prevents refresh from activating before the message initially appears
        
        const self = this;
        event.channel.sendMessage(self.getMessage(), self.getEmbed()).then(consolemsg => {
            self.message = consolemsg;
            self.canUpdate = true;
        }).catch(err => {});
        
    }
    getPlayerList() {
        const online = this.game.online;
        const offline = this.game.offline;
        const strList = [];
        
        for (let i=0; i<online.length; i++) {
            const playerId = online[i];
            if (playerId === this.userId) {
                const playerName = this.game.data[playerId].name;
                strList.push("__**" + playerName + "**__");
                break;
            }
        }
        
        for (let i=0; i<online.length; i++) {
            const playerId = online[i];
            if (playerId !== this.userId) {
                const playerName = this.game.data[playerId].name;
                strList.push("**" + playerName + "**");
            }
        }
        
        for (let i=0; i<offline.length; i++) {
            const playerId = offline[i];
            const playerName = this.game.data[playerId].name;
            strList.push("*" + playerName + "*");
            
        }
        return strList;
        
    }
    getMessage() {
        return this.getPlayerList();
    }
    getEmbed() {
        return;
    }
    eval(user, arg, commandObj) {
        this.game.eval(user, arg, commandObj);
    }
    refresh() {
        if (!this.canUpdate) { //prevents refresh from activating multiple times before the message is updated
            return;
        }
        const self = this;
        
        const oldMessage = this.message;
        
        this.canUpdate = false;
        oldMessage.channel.sendMessage(self.getMessage(), self.getEmbed()).then(newMessage => {
            self.message = newMessage;
            oldMessage.delete().then(oldMessage => {
                self.canUpdate = true;
            }).catch(err => {});
        }).catch(err => {});
        
//        this.canUpdate = false;
//        this.message.delete().then(delMsg => {
//            delMsg.channel.sendMessage(self.getMessage()).then(newMsg => {
//                self.message = newMsg;
//                self.canUpdate = true;
//            }).catch(err => {});
//        }).catch(err => {});
        
    }
    disconnect() {
        this.game.disconnectPlayer(this.user);
        this.message.delete().then().catch(err => {});
    }
}


module.exports = ClientSelf;