//http://www.rejoicealways.net/lcu-semesters/fall2010/mat1302/Eigenmath.pdf
//EigenMath Manual
const utils = require("../utils.js");
const Algebrite = require("./Interpreters/Algebrite.js");
//const Algebrite = require("algebrite");
const Jimp = require("jimp");

const Integral = require("./Addons/Integral.js");

const helpMain = "```" + 
`MiniAlpha Help
   Use syntax similar to WolframAlpha.

   evaluate -symbolic parser
   compute  -numerical parser
   qcompute -approximations
   convert  -converter

   integral
   derivative
   sum
   product
   root (use taylor to find root, if can't find, use newton, then use iterative method)
   jacobian gradient
   hessian
   
   is prime (Maximum of 2^1279-1 M1279, bigger primes hang)
   factor
   rationalize
   
   
   simplify
   
   
   taylor
   limit

   base conversion
   truth table
   karnaugh map

Examples:
   integral of x^2
   integral of sin(2x) from 0 to pi/2
   integral of sqrt(x y) + x sin(y)
   derivative of e^x
   derivative of sqrt(34-x+y) with respect to y
   d/dx e^x
   d/dx d/dx sin(x)
   d/dx d/dt t*sin(x+t)

You can also use direct commands from Eigenmath.
http://www.rejoicealways.net/lcu-semesters/fall2010/mat1302/Eigenmath.pdf
https://qedinsight.wordpress.com/2011/04/22/a-practical-use-for-logarithms-part-2-how-we-multiplied-large-numbers-40-years-ago-and-how-integral-transforms-use-the-same-basic-idea/

Keywords:
   last, ans --Last answer obtained

` + "```";

class MathEval { //This is an module that adds some essential commands to the selfbot
    
    constructor(debug) {
        this.name = "MALP";
        this.desc = "MiniAlpha Module";
        this.refname = "MiniAlpha";
        this.id = 770, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "malp1000"; //Unique ID used to save data to file
        this.help = helpMain; //Help that displays when users ask
        this.isDebug = debug||false;
        //modules are run in order, from the smallest id to the largest id.
        
        this.lasteval = {}; //use lasteval[userid] to get last answer
        
    }
    main(eventpacket, infopacket, data) {
        if (eventpacket.type !== "message" || eventpacket.strength < 1 || eventpacket.isSelf) {
            return;
        }
        const symbol = infopacket.command.symbol;
        const command = infopacket.command.verb;
        const args = infopacket.command.args;
        const ev = eventpacket.event;
        const userId = eventpacket.userId;
        const text = infopacket.command.text;
        
        
        if (!command || command === "help") {
            ev.author.sendMessage(helpMain);
            return;
        }
        
        const expression = new Expression(text, command);
        const outputArr = [];
        expression.removeAllInstance("evaluate");
        
        if (expression.contains("integral ")) {
            
            outputArr = Integral.eval(expression);
            
            return;
            
        } else if (expression.contains("derivative ")) {
        
        } else if (expression.contains("d/d")) {
        
        } else if (expression.contains("sum")) {
            
        } else {
            
            evalReply(expression.content, ev, false);
            
            
        }
        
        
        
        
    }
}






const evalReply = function(expression, ev, evaltext, anstextpre, anstextpost, isText) {
    
    if (evaltext) {
        evaltext = evaltext.replace(/ /gi, "%20");
        //evaltext = fixExpLatex(evaltext);
        evaltext = fixFloatLatex(evaltext);
        //console.log(evaltext);
        
        Jimp.read("https://latex.codecogs.com/png.latex?{Evaluate:%20" + evaltext + "}", function(err, image){
            try { 
                
                image.invert();
                image.getBuffer(Jimp.MIME_PNG, function(err, data) {
                    ev.channel.sendFile(data).then(function(message) {

                        evalAnsReply(expression, ev, anstextpre, anstextpost, isText);

                    }).catch(err => {});
                });
            
            } catch (err) {
                //console.log(err);
                evalAnsReply(expression, ev, anstextpre, anstextpost, isText);
            }

        });
        
    } else {
        
        evalAnsReply(expression, ev, anstextpre, anstextpost, isText);
        
    }
};

const eval = function(expression) {
    return Algebrite.run(expression, true);
    
};

const getReplyTeX = function(tex, pre, post) {
    let outTeX = tex;
    //console.log(outstr);
    
    if (outTeX.indexOf("not find") > -1) {
        outTeX = "\\text{Sorry, could not find a solution.}";
        prestr = prestr || " ";
    } else if (outTeX.indexOf("Stop") > -1) {
        prestr = prestr || " ";
    }
    
    prestr = prestr || "Answer:%20{";
    poststr = poststr || "}";
    
    let finalTeX = prestr + outTeX + poststr;
    
    finalTeX = finalTeX.replace(/ /gi, "%20"); //replaces " " with %20 according to web specifications
    finalTeX = finalTeX.replace(/\$\$\$\$\r?\n/gi, ""); //remove empty $$$$, bugs the website
    finalTeX = finalTeX.replace(/\r?\n/gi, "\\\\"); //replace line end with \\
    
    //finalTeX = fixExpLatex(finalTeX);
    finalTeX = fixFloatLatex(finalTeX);
    return finalTeX;
    
    const urlTeX = "https://latex.codecogs.com/png.latex?{" + finalTeX + "}";
};

const getReplyMsg = function(str, pre, post) {
    
};

const replyTeX = function(ev, tex, str) {
    const urlTeX = "https://latex.codecogs.com/png.latex?{" + tex + "}";
    
    Jimp.read(urlTeX, function(err, image){
        try {
            image.invert();
            image.getBuffer(Jimp.MIME_PNG, function(err, data) {
                        ev.channel.sendFile(data);
            });
        } catch (err) {
            ev.reply(str).then().catch(err =>{});
            console.log(err);
        }

    });
};

const replyMsg = function(ev, str) {
    ev.reply(str).then().catch(err =>{});
};

const evalAnsReply = function(expression, ev, prestr, poststr, useText) {
    
    //isText = true;
    //console.log(expression);
    const outeval = Algebrite.run(expression, true);
    let outstr = outeval[0];
    let outTeX = outeval[1];
    Algebrite.clearall();
    //console.log(outstr);
    
    if (outstr.indexOf("not find") > -1) {
        outstr = "Sorry, could not find a solution.";
        outTeX = "\\text{Sorry, could not find a solution.}";
        prestr = prestr || " ";
    } else if (outstr.indexOf("Stop") > -1) {
        prestr = prestr || " ";
    }
    
    prestr = prestr || "Answer:%20{";
    poststr = poststr || "}";
    
    let finalTeX = prestr + outTeX + poststr;
    
    finalTeX = finalTeX.replace(/ /gi, "%20"); //replaces " " with %20 according to web specifications
    finalTeX = finalTeX.replace(/\$\$\$\$\r?\n/gi, ""); //remove empty $$$$, bugs the website
    finalTeX = finalTeX.replace(/\r?\n/gi, "\\\\"); //replace line end with \\
    
    //finalTeX = fixExpLatex(finalTeX);
    finalTeX = fixFloatLatex(finalTeX);
    
    const urlTeX = "https://latex.codecogs.com/png.latex?{" + finalTeX + "}";
    
    console.log(finalTeX);
    
    if (useText) {
        ev.reply(outstr).then().catch(err =>{});
    } else {

        Jimp.read(urlTeX, function(err, image){
            try {
                image.invert();
                image.getBuffer(Jimp.MIME_PNG, function(err, data) {
                            ev.channel.sendFile(data);
                });
            } catch (err) {
                ev.reply(outstr).then().catch(err =>{});
                console.log(err);
            }

        });
    }
    
};

class Expression {
    
    constructor(msg, command) {
        this.content = fixExpInput(msg);
        this.removeAllInstance("minialpha");
    }
    contains(str) {
        return this.content.indexOf(str) > -1;
    }
    removeFirstInstance(str) {
        this.content = this.content.replace(str, "");
    }
    removeAllInstance(str) {
        this.content = this.content.replace(new RegExp(str, 'gi'), "");
    }
    removeBefore(str) {
        const index = this.content.indexOf(str);
        if (index > -1) {
            const before = this.content.slice(0, index);
            this.content = this.content.slice(index + str.length, this.content.length);
            return before;
        } else {
            return "";
        }
        
    }
    removeAfter(str) {
        const index = this.content.indexOf(str);
        if (index > -1) {
            const after = this.content.slice(index + str.length, this.content.length);
            this.content = this.content.slice(0, index);
            return after;
        } else {
            return "";
        }
        
    }
    findDx() {
        const d = [];
        const str = this.content;
        for (let i=0; i<str.length-1; i++) {
            if (str[i] === "d" && str[i+1].toUpperCase() !== str[i+1].toLowerCase()) { //if we found dx, dy, dA etc...
                d.push(str[i+1]);
            }
        }
        return d;
    }
    removeDx() {
        this.content = this.content.replace(/d[a-zA-Z]/gi, "");
    }
    findDd() {
        const d = [];
        const str = this.content;
        for (let i=0; i<str.length-1; i++) {
            if (str[i] === "d" && str[i+1] === "/" && str[i+2] === "d" && str[i+3].toUpperCase() !== str[i+3].toLowerCase()) { //if we found d/dx, d/dy, d/dA etc...
                d.push(str[i+3]);
            }
        }
        return d;
    }
    removeDd() {
        this.content = this.content.replace(/d\/d[a-zA-Z]/gi, "");
    }
    
    
}


module.exports = MathEval;
