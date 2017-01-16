class GameMP {
    constructor(gameName, gameId, roomId, maxplayers, hostevent) {
        this.game = gameName||"Game";
        this.gameId = gameId||"0";
        this.roomId = roomId||"0";
        this.maxplayers = maxplayers||1;
        this.hostId = hostevent.author.id||"0";
        this.players = [];
        this.online = [];
        this.data = {};
        
    }
    load(players, data) {
        this.players = players||[];
        this.data = data||{};
    }
    addPlayer(user, nick) {
        if (!this.isPlayer(user)) { //if user is not already a player
            this.players.push(user.id); //add the player
            this.data[user.id] = {}; //create player data
            this.data[user.id].name = nick||user.username;
            this.data[user.id].client = false; //client object of the player
            
            this.updateClients();
        }
    }
    removePlayer(user) {
        const index = this.players.indexOf(user.id);
        if (index > -1) { //if user is in game
            this.players.splice(index, 1);
            this.data[user.id] = false;
            
            this.updateClients();
        }
    }
    connectPlayer(event, nick) {
        const user = event.author;
        
        if (!this.data[user.id]) { //if user is not already a player
            this.players.push(user.id); //add the player
            this.data[user.id] = {}; //create player data
            this.data[user.id].name = nick||user.username;
            this.data[user.id].client = false; //client object of the player
            
        }
        
        if (!this.isOnline(user) && this.isPlayer(user)) { //if user is not already online and is a player
            this.online.push(user.id);
            this.data[user.id].client = new GameClient(event, this); //client object of the player
            
            this.updateClients();
            return this.data[user.id].client; //returns the client
            
        }
        return false;
    }
    disconnectPlayer(user) {
        const index = this.online.indexOf(user.id);
        if (index > -1) { //if user is online
            this.online.splice(index, 1);
            this.data[user.id].client = false;
            
            this.updateClients();
        }
    }
    isPlayer(user) {
        return (this.players.indexOf(user.id) !== -1);
    }
    isOnline(user) {
        return (this.online.indexOf(user.id) !== -1);
    }
    isHost(user) {
        return this.hostId === user.id;
    }
    canJoin() {
        return (this.maxplayers - this.players.length) > 0;
    }
    updateClients() {
        for (let i=0; i<this.online.length; i++) { //for all the online players
            const playerId = this.online[i];
            this.data[playerId].client.refresh(); //update their clients
        }
    }
    updateClient(user) {
        this.data[user.id].client.refresh();
    }
    get offline() {
        const off = [];
        for (let i=0; i<this.players.length; i++) { //for all the players
            const playerId = this.players[i];
            if (this.online.indexOf(playerId) === -1) { //if player is not in online array
                off.push(playerId); //add to offline array
            }
        }
        return off;
    }
    eval() {
        this.updateClients();
    }
}

module.exports = GameMP;

class GameClient {
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