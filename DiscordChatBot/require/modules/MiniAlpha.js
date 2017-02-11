//http://www.rejoicealways.net/lcu-semesters/fall2010/mat1302/Eigenmath.pdf
//EigenMath Manual
const utils = require("./Addons/Utils.js");
const Jimp = require("jimp");
const Algebrite = require("./Interpreters/Algebrite.js");
//const Algebrite = require("algebrite");

const Integral = require("./Addons/Integral.js");
const Derivative = require("./Addons/Derivative.js");
const Sum = require("./Addons/Sum.js");
const Product = require("./Addons/Product.js");

const helpMain = "```" + 
`MiniAlpha Help
   Use syntax similar to WolframAlpha.

Examples:
   integral of x^2
   integral of x^2 dx dx dx
   integral of sin(2x) dx from 0 to pi/2
   integral of sqrt(x y) + x sin(y) dx dy
   derivative of e^x
   derivative of sqrt(34-x+y) with respect to y
   derivative of sqrt(34-x+y) with respect to y,y
   d/dx e^x
   d/dx d/dx sin(x)
   d/dx d/dt t*sin(x+t)


` + "```";


class MiniAlpha { //This is an module that adds some essential commands to the selfbot
    
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
        let outputArr = ["",""];
        expression.removeAllInstance("evaluate");
        
        if (expression.contains("integral ")) {
            outputArr = Integral.eval(expression);
            
        } else if (expression.contains("derivative ")) {
            outputArr = Derivative.eval(expression);
            
        } else if (expression.contains("d/d")) {
            outputArr = Derivative.evalalt(expression);
            
        } else if (expression.contains("sum ")) {
            outputArr = Sum.eval(expression);
            
        } else if (expression.contains("product ")) {
            outputArr = Product.eval(expression);
            
        } else {
            
            //evalReply(expression.content, ev, false);
            
            
        }
        
        replyTeX(ev, outputArr);
        Algebrite.clearall();
        
        
        
    }
}





const parseOutputTeX = function(tex) {
    let outTeX = tex;
    //console.log(outstr);
    
    if (outTeX.indexOf("not find") > -1) {
        outTeX = "\\text{Sorry, could not find a solution.}";
    } else if (outTeX.indexOf("Stop") > -1) {
        
    }
    
    let finalTeX = outTeX;
    
    finalTeX = finalTeX.replace(/ /gi, "%20"); //replaces " " with %20 according to web specifications
    finalTeX = finalTeX.replace(/\$\$\$\$\r?\n/gi, ""); //remove empty $$$$, bugs the website
    finalTeX = finalTeX.replace(/\r?\n/gi, "\\\\"); //replace line end with \\
    
    //finalTeX = fixExpLatex(finalTeX);
    finalTeX = utils.fixFloatLatex(finalTeX);
    finalTeX = utils.fixPiLatex(finalTeX);
    finalTeX = utils.fixLogLatex(finalTeX);
    return finalTeX;
};

const parseOutputStr = function(str) {
    str = utils.fixLogStr(str);
    return str;
};


const replyTeX = function(ev, outputArr) {
    let str = outputArr[0];
    let tex = outputArr[1];
    if (str.length === 0 && tex.length === 0) {
        return;
    }
    
    tex = parseOutputTeX(tex);
    str = parseOutputStr(str);
    
    urlTeX = "https://latex.codecogs.com/png.latex?\\\\" + tex + "";
    console.log(tex);
    Jimp.read(urlTeX, function(err, image){
        try {
            image.invert();
            image.getBuffer(Jimp.MIME_PNG, function(err, data) {
                ev.channel.sendFile(data).then(function(message) {
                    
                }).catch(err => {});
            });
        } catch (err) {
            ev.reply(str).then().catch(err =>{});
            console.log(err);
        }

    });
};

const replyMsg = function(ev, outputArr) {
    let str = outputArr[0];
    
    ev.reply(str).then().catch(err =>{});
};

class Expression {
    
    constructor(msg, command) {
        this.content = msg;
        this.removeAllInstance("minialpha");
        this.fixInput();
    }
    fixInput() {
        this.content = utils.fixExpInput(this.content);
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


module.exports = MiniAlpha;


const helpOld = "```" + 
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
   
   
   taylor (invert the additions by counting parenthesis)
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