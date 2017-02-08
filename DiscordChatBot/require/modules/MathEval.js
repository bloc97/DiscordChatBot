//http://www.rejoicealways.net/lcu-semesters/fall2010/mat1302/Eigenmath.pdf
//EigenMath Manual
const utils = require("../utils.js");
const Algebrite = require("./Interpreters/Algebrite.js");
//const Algebrite = require("algebrite");
const Jimp = require("jimp");
const helpMain = "```" + 
`MiniAlpha Help
   Use syntax similar to WolframAlpha.

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
        
        
        const expression = new Expression(text, command);
        if (!command || command === "help") {
            ev.author.sendMessage(helpMain);
            return;
        }
        expression.removeAllInstance("evaluate");
        
        if (expression.contains("integral ")) {
            expression.removeBefore("integral");
            expression.removeAllInstance("of");
            
            let respectToArr = expression.findDx();
            
            if (respectToArr.length < 1) {
                respectToArr = ["x"];
            }
            expression.removeDx();
            
            if (expression.contains("from")) { //Definite Integral
                const from = expression.removeAfter("from");
                const valsArr = from.split("to");
                const vals = valsArr.join(",");
                
                const expressionTeX = Algebrite.run(expression.content, true)[1];
                
                const finalExpressionTeX = ("\\int_{" + valsArr[0] + "}^{" + valsArr[1] + "}{" + expressionTeX + "} \\,d" + respectToArr[0]);
                
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
            
            const finalExpressionTeX = getDerivStr(expression.content, valsArr);
            //console.log(finalExpressionTeX);
            //console.log(expression.content);
            evalReply("d(" + expression.content + "," + vals + ")", ev, finalExpressionTeX);
            
        
        } else if (expression.contains("d/d")) {
            expression.removeAllInstance("of");
            
            let valsArr = expression.findDd();
            expression.removeDd();
            if (valsArr.length < 1) {
                valsArr = ["x"];
            }
            let vals = valsArr.join(",");
            const finalExpressionTeX = getDerivStr(expression.content, valsArr);
            
            evalReply("d(" + expression.content + "," + vals + ")", ev, finalExpressionTeX);
            
        
        } else if (expression.contains("sum")) {
            expression.removeBefore("sum");
            expression.removeAllInstance("of");
            
            if (expression.contains("from")) {
                const from = expression.removeAfter("from");
                const valsArr = from.split("to");
                
                const firstpt = valsArr[0];
                const secondpt = valsArr[1];
                
                const firstptArr = firstpt.split("=");
                const variable = firstptArr[0];
                const begin = firstptArr[1];
                const end = secondpt;
                
                //console.log(begin);
                
                const finalExpressionTeX = getSumStr(expression.content, variable, begin, end);
                //console.log(finalExpressionTeX);
                evalReply("float(sum(" + variable + "," + begin + "," + end + "," + expression.content + "))", ev, finalExpressionTeX);
                //parse e+21 etc...
                //doing sum of e^x from x=1 to 50 gives wrong TeX
                
            } else {
                
                
                
            }
            
        } else {
            
            evalReply(expression.content, ev, false);
            
            
        }
        
        
        
        
    }
}
const isLetter = function(char) {
    return char.toLowerCase() !== char.toUpperCase();
};

const isNumber = function(char) {
    return +char === +char;
};

const findNextDifferentChar = function(str, index) { //find the next dissimilar character
    if (isNumber(str[index])) { //if character is a number, return next character that isn't a number
        for (let i=index; i<str.length; i++) {
            if (!isNumber(str[i])) {
                return i;
            }
        }
        return str.length;
    } else if (isLetter(str[index])) { //if character is a letter, return next character that isn't a letter
        for (let i=index; i<str.length; i++) {
            if (!isLetter(str[i])) {
                return i;
            }
        }
        return str.length;
        
    } else if (str[index] === "{" || str[index] === "(") { //if character is a bracket, return -1, so as to not modify existing expressions
        return -1;
        
    } else if (str[index] === "-" || str[index] === "+") { //if character is a + or -, check next character
        
        return findNextDifferentChar(str, index+1);
        
    } else { //if character is a parenthesis or a symbol, return -1
        return -1;
    }
};

const fixExpInput = function(str) {
    let textPart = [];
    let lastindex = 0;
    
    for (let i=0; i<str.length-1; i++) {
        if (str[i] === "^") {
            const nextindex = findNextDifferentChar(str, i+1); //find next character that isn't similar to the one after the "^"
            if (nextindex === -1) {
                continue;
            }
            
            textPart.push(str.slice(lastindex, i+1)); //push the unchanged part
            textPart.push("(" + str.slice(i+1, nextindex) + ")"); //push the exponent part in brackets
            lastindex = nextindex;
            i = nextindex-1; //skip the part already saved
        }
    }
    textPart.push(str.slice(lastindex, str.length)); //push in the last part that was not detected
    return textPart.join("");
};


const fixExpLatex = function(str) {
    
    let textPart = [];
    let lastindex = 0;
    
    for (let i=0; i<str.length-1; i++) {
        if (str[i] === "^") {
            const nextindex = findNextDifferentChar(str, i+1); //find next character that isn't similar to the one after the "^"
            if (nextindex === -1) {
                continue;
            }
            
            textPart.push(str.slice(lastindex, i+1)); //push the unchanged part
            textPart.push("{" + str.slice(i+1, nextindex) + "}"); //push the exponent part in brackets
            lastindex = nextindex;
            i = nextindex-1; //skip the part already saved
        }
    }
    textPart.push(str.slice(lastindex, str.length)); //push in the last part that was not detected
    return textPart.join("");
};

const fixFloatLatex = function(str) {
    
    let textPart = [];
        let lastindex = 0;
    
    for (let i=0; i<str.length-1; i++) {
        if (str[i] === "e" && (str[i+1] === "+" || str[i+1] === "-")) {
            const nextindex = findNextDifferentChar(str, i+1); //find next character that isn't similar to the one after the "^"
            if (nextindex === -1) {
                continue;
            }
            
            textPart.push(str.slice(lastindex, i) + "\\times{}10^"); //push the unchanged part
            textPart.push("{" + str.slice(i+1, nextindex) + "}"); //push the exponent part in brackets
            lastindex = nextindex;
            i = nextindex-1; //skip the part already saved
        }
    }
    textPart.push(str.slice(lastindex, str.length)); //push in the last part that was not detected
    return textPart.join("");
    
};


const getSumStr = function(expression, variable, begin, end) {
    const expressionTeX = Algebrite.run(expression, true)[1];
    const sumstr = "\\sum_{" + variable + "=" + begin + "}^{" + end + "}";
    
    return sumstr + expressionTeX;
    
};

const getDerivStr = function(expression, valsArr) {
    const expressionTeX = Algebrite.run(expression, true)[1];
    expression = " " + expression + " "; //Pad the input
    
    //Find out the number of variables (derivative or partial derivative)
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
    
    //Find out the order of the derivative
    const dvariables = [];
    const dvariablespow = [];
    let dorder = 0;
    
    for (let i=0; i<valsArr.length; i++) {
        const currentVal = valsArr[i].replace(/ /g, "");
        const index = dvariables.indexOf(currentVal);
        dorder++;
        if (index > -1) {
            dvariablespow[index] += 1;
        } else {
            dvariables.push(currentVal);
            dvariablespow.push(1);
        }
    }
    
    //Create the LaTeX string
    let derivstr = "";
    for (let i=0; i<dvariables.length; i++) {
        
        if (dvariablespow[i] === 1) {
            derivstr = derivstr + dsymbol + dvariables[i] + "\\,";
        } else {
            derivstr = derivstr + dsymbol + dvariables[i] + "^{" + dvariablespow[i] + "}\\,";
        }
        
    }
    
    if (dorder < 2) {
        derivstr = "\\frac{" + dsymbol + "}{" + derivstr + "}";
    } else {
        derivstr = "\\frac{" + dsymbol + "^{" + dorder + "}}{" + derivstr + "}";
    }
    
    return derivstr + "\\bigg({" + expressionTeX + "}\\bigg)";
};



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

const evalAnsReply = function(expression, ev, anstextpre, anstextpost, isText) {
    
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
        anstextpre = anstextpre || " ";
    } else if (outstr.indexOf("Stop") > -1) {
        anstextpre = anstextpre || " ";
    }
    
    anstextpre = anstextpre || "Answer:%20{";
    anstextpost = anstextpost || "}";
    
    const oTeX = anstextpre + outTeX + anstextpost;
    let finalTeX = oTeX.replace(/ /gi, "%20");
    finalTeX = finalTeX.replace(/\$\$\$\$\r?\n/gi, "");
    finalTeX = finalTeX.replace(/\r?\n/gi, "\\\\");
    //finalTeX = fixExpLatex(finalTeX);
    finalTeX = fixFloatLatex(finalTeX);
    console.log(finalTeX);
    
    if (isText) {
        ev.reply(outstr).then().catch(err =>{});
    } else {

        Jimp.read("https://latex.codecogs.com/png.latex?{" + finalTeX + "}", function(err, image){
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
