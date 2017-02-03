//http://www.rejoicealways.net/lcu-semesters/fall2010/mat1302/Eigenmath.pdf
//EigenMath Manual
const utils = require("../utils.js");
const Algebrite = require("./Interpreters/Algebrite.js");
const Jimp = require("jimp");
const helpMain = "```" + 
`MiniAlpha Module Help
   /minialpha <expression>

Examples:
   integral of x^2
   integral of sin(2x) from 0 to pi/2
   derivative of e^x
   derivative of sqrt(34-x+y) with respect to y
   d/dx e^x
   d/dx d/dx sin(x)
   d/dx d/dt t*sin(x+t)

You can also use direct commands from Eigenmath.
http://www.rejoicealways.net/lcu-semesters/fall2010/mat1302/Eigenmath.pdf

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
        this.command = "minialpha"; //Command that activates this module
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
        const rawmsg = eventpacket.rawmsg;
        
        
        if (command !==this.command) {
            return;
        }
        const expression = new Expression(rawmsg, command);
        if (!args[0] || args[0] === "help") {
            ev.author.sendMessage(helpMain);
            return;
        }
        
        if (expression.contains("integral ")) {
            expression.removeBefore("integral");
            expression.removeAllInstance("of");
            
            let respectToArr = expression.findDx();
            //console.log(respectToArr);
            if (respectToArr.length < 1) {
                respectToArr = ["x"];
            }
            expression.removeDx();
            
            if (expression.contains("from")) { //Definite Integral
                const from = expression.removeAfter("from");
                const valsArr = from.split("to");
                const vals = valsArr.join(",");
                
                const expressionTeX = Algebrite.run(expression.content, true)[1];
                
                const finalExpressionTeX = ("\\int_" + valsArr[0] + "^" + valsArr[1] + " " + expressionTeX + " \\,d" + respectToArr[0]);
                //console.log(finalExpressionTeX);
                
                evalReply("defint(" + expression.content + "," + respectToArr[0] + "," + vals + ")", ev, finalExpressionTeX);
                
            } else { //Indefinite Integral
                let respectTo = respectToArr.join(",");
                
                let intIs = "";
                let intDs = "";
                
                for (let i=0; i<respectToArr.length; i++) {
                    intIs = intIs + "i";
                    intDs = intDs + "\\,d" + respectToArr[i];
                }
                
                const expressionTeX = Algebrite.run(expression.content, true)[1];
                const finalExpressionTeX = ("\\" + intIs + "nt{" + expressionTeX + "}" + intDs);
                
                
                evalReply("integral(" + expression.content + "," + respectTo + ")", ev, finalExpressionTeX, false, "+C");
                
            }
            
        } else if (expression.contains("derivative ")) {
            expression.removeBefore("derivative");
            expression.removeAllInstance("of");
            
            let vals = "x";
            
            if (expression.contains("respect")) { //Partial derivative
                expression.removeAllInstance("with");
                expression.removeAllInstance("to");
                vals = expression.removeAfter("respect");
            }
            const valsArr = vals.split(",");
            
            const expressionTeX = Algebrite.run(expression.content, true)[1];
            const derivstr = getDerivStr(expression.content, valsArr);
            
            const finalExpressionTeX = (derivstr + "{" + expressionTeX + "}");
            //console.log(finalExpressionTeX);
            //console.log(expression.content);
            evalReply("d(" + expression.content + "," + vals + ")", ev, finalExpressionTeX);
            
        
        } else if (expression.contains("d/d")) {
            
            expression.removeAllInstance("of");
            
            let vals = expression.findDd();
            expression.removeDd();
            if (vals.length < 1) {
                vals = ["x"];
            }
            
            evalReply("d(" + expression.content + "," + vals.join(",") + ")", ev);
            
        
        } else {
            
            evalReply(expression.content, ev, false);
            
            
        }
        
        
        
        
    }
}
const isLetter = function(char) {
    return char.toLowerCase() !== char.toUpperCase();
};

const getDerivStr = function(expression, valsArr) {
    expression = " " + expression + " "; //Pad the input
    
    const variables = [];
    for (let i=0; i<expression.length-2; i++) {
        if (!isLetter(expression[i]) && isLetter(expression[i+1]) && !isLetter(expression[i+2])) {
            if (variables.indexOf(expression[i+1]) === -1) {
                variables.push(expression[i+1]);
            }
        }
    }
    const varnum = variables.length;
    const dsymbol = (varnum > 1) ? "\\partial " : "d"; 
    
    const dvariables = [];
    const dvariablespow = [];
    let dorder = 0;
    
    for (let i=0; i<valsArr.length; i++) {
        const index = dvariables.indexOf(valsArr[i]);
        dorder++;
        if (index > -1) {
            dvariablespow[index] += 1;
        } else {
            dvariables.push(valsArr[i]);
            dvariablespow.push(1);
        }
    }
    
    let derivstr = "";
    
    for (let i=0; i<dvariables.length; i++) {
        
        if (dvariablespow[i] === 1) {
            derivstr = derivstr + dsymbol + dvariables[i] + "\\,";
        } else {
            derivstr = derivstr + dsymbol + "^" + dvariablespow[i] + dvariables[i] + "\\,";
        }
        
    }
    
    if (dorder < 2) {
        derivstr = "\\frac{d}{" + derivstr + "}";
    } else {
        derivstr = "\\frac{d^" + dorder + "}{" + derivstr + "}";
    }
    
    return derivstr;
};



const evalReply = function(expression, ev, evaltext, anstextpre, anstextpost, isText) {
    
    if (evaltext) {
        
        evaltext = evaltext.replace(/ /gi, "%20");
        
        Jimp.read("https://latex.codecogs.com/png.latex?{Evaluate:%20" + evaltext + "}", function(err, image){
            image.invert();
            image.getBuffer(Jimp.MIME_PNG, function(err, data) {
                ev.channel.sendFile(data).then(function(message) {
                
                    evalAnsReply(expression, ev, anstextpre, anstextpost, isText);
                
                }).catch(err => {});
            });

        });
        
    } else {
        
        evalAnsReply(expression, ev, anstextpre, anstextpost, isText);
        
    }
};

const evalAnsReply = function(expression, ev, anstextpre, anstextpost, isText) {
    
    anstextpre = anstextpre || "%20";
    anstextpost = anstextpost || "%20";
    
    //console.log(expression);
    const outeval = Algebrite.run(expression, true);
    const outstr = outeval[0];
    const outTeX = outeval[1];
    Algebrite.clearall();
    //console.log(outstr);
    if (isText) {
        ev.reply(outstr).then().catch(err =>{});
    } else {

        Jimp.read("https://latex.codecogs.com/png.latex?{Answer:%20" + anstextpre + outTeX + anstextpost + "}", function(err, image){
            image.invert();
            image.getBuffer(Jimp.MIME_PNG, function(err, data) {
                        ev.channel.sendFile(data);
            });

        });
    }
    
};

class Expression {
    
    constructor(msg, command) {
        this.content = msg.slice(msg.indexOf(command)+command.length, msg.length);
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
            if (str[i] === "d" && str[i+1] === "/" && str[i+2] === "d" && str[i+3].toUpperCase() !== str[i+3].toLowerCase()) { //if we found dx, dy, dA etc...
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
