class CommandProc {
    constructor (triggers, symbols, separators) {
        this.name = "COMP";
        this.desc = "Command Processor";
        this.id = 100, //ID used to load modules in order
        this.uid = "comp1000";
        this.symbolTrigger = symbols||["!"]; //Available Triggers: Mention, Nickname, Symbol, Name, Separator
        this.triggers = triggers||["Mention Symbol","Symbol"]; //Which instances to trigger
        this.separators = separators||[","];
    }
    main(eventpacket, infopacket) {
        const msg = eventpacket.msg;
        
    }
    tokenise(msg) {
        
    }
    isCommand(msg) {
        
    }
}
