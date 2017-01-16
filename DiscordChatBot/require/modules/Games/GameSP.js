class GameSP {
    constructor(gameName, gameId, roomId, hostevent, nick) {
        this.game = gameName||"Game";
        this.gameId = gameId||"0";
        this.roomId = roomId||"0";
        this.hostId = hostevent.author.id||"0";
        this.isOnline = false;
        this.data = {};
        this.data.client = false;
        this.data.name = nick||hostevent.author.username;
        
    }
    load(players, data) {
        this.players = players||[];
        this.data = data||{};
    }
    import(strData) {
        //import data as JSON
    }
    export() {
        //export data as JSON
    }
    connectPlayer(event) {
        const user = event.author;
        
        if (!this.isOnline && user.id === this.hostId) { //if user is not already online and is the host
            this.isOnline = true;
            this.data.client = new GameSPClient(event, this); //client object of the player
            
            return this.data.client; //returns the client
            
        }
        return false;
    }
    disconnectPlayer(user) {
        if (this.isOnline) {
            this.isOnline = false;
            this.data.client = false;
        }
    }
    isPlayer(user) {
        return (user.id === this.hostId);
    }
    isOnline(user) {
        return (this.isPlayer(user) && this.isOnline);
    }
    isHost(user) {
        return this.isPlayer(user);
    }
    updateClient() {
        this.data.client.refresh();
    }
    eval() {
        this.updateClient();
    }
}

module.exports = GameSP;

class GameSPClient {
    constructor(event, game) {
        this.user = event.author;
        this.userId = event.author.id;
        this.game = game;
    }
    getPlayerList() {
        return [];
        
    }
    getMessage() {
        return;
    }
    getEmbed() {
        return;
    }
    eval(user, arg, commandObj) {
        this.game.eval(user, arg, commandObj);
    }
    refresh() {
        
    }
    disconnect() {
        this.game.disconnectPlayer(this.user);
        this.message.delete().then().catch(err => {});
    }
}