const utils = require("../utils.js");
const JSCPP = require("./Interpreters/Cpp.js");

const helpMain = "```" + 
`C++ REPL Module Help
   /cpp <command> <args> 

Commands:
   init            - Starts the REPL console.
   
   exit            - Closes the active console.
   kill            - Ends the active console.
   clear           - Clears the current active console.
   refresh         - Refreshes and drags the console to the bottom.

   save            - Starts a saved session.
      <name>
   load            - Saves the current session state.
      <name>`
+ "```";

class CppParse {
    
    constructor(debug) {
        this.name = "CPPP";
        this.desc = "C++ Parse Module";
        this.refname = "CppParse";
        this.id = 715, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "cppp1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
        //modules are run in order, from the smallest id to the largest id.
        
        
    }
    main(eventpacket, infopacket, data) {
        
        if (eventpacket.type !== "message" || eventpacket.strength < 1 || eventpacket.isSelf) {
            return;
        }
        
        const command = infopacket.command.verb;
        const args = infopacket.command.args;
        const ev = eventpacket.event;
        const userId = eventpacket.userId;
        const rawmsg = eventpacket.rawmsg;
        
        
        if (command !=="cpp") {
            
            if (rawmsg.indexOf("```cpp") > -1) {
                
                parseCpp(ev);
                
            }
            
        return;
            
        }
        
        
        if (!args[0] || args[0] === "help") {
            ev.author.sendMessage(helpMain);
            return;
        } else if (args[0]) {
            parseCpp(ev);
            
        }
        
        
    }
}

const parseCpp = function(ev) {
    const username = ev.author.username;
    const rawmsg = ev.content;
    
    ev.delete().then().catch(err => {});
    
    let str = utils.clearWhitespaces(rawmsg.slice(rawmsg.indexOf("cpp")+3, rawmsg.length)).replace("```", "");
    
    if (str.indexOf("\n") === 0) {
        str = str.slice(1, str.length);
        
    }
    
    const code = str;//.replace(/\n/gi, "");

    let codearr = str.split("\n")
    .map(function(x, i){
        let n = i+1;

        if (n<10) {
            n = "0"+n;
        }

        return n+" "+x;

    });

    const codewithlines = codearr.join("\n");

    console.log(codewithlines);

    let output = "";

    let input = "";

    try {
        output = JSCPP.run(code, input);
    } catch(err) {
        output = err.slice(0, err.indexOf("^")+1);
    }

    const startdisplay = "```cpp\n" + username + "> cpp\n" + "C++ JIT Compiler [Version 0.01]\n(c) 2017 MIT. All rights reserved.\n\n";
    const display = startdisplay + codewithlines + "\n```";
    const out = "```cpp\n" + output + "\n```";

    ev.channel.sendMessage(display).then().catch(err => {}); 
    ev.channel.sendMessage(out).then().catch(err => {});     
    
};

module.exports = CppParse;
