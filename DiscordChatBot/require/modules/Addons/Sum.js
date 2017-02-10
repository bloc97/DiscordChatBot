const Algebrite = require("../Interpreters/Algebrite.js");
const Mathjs = require("../Interpreters/Math.js");
const utils = require("./Utils.js");
//Non-symbolc sum addon


const eval = function(expression) {
    expression.removeBefore("sum");
    expression.removeAllInstance("of");
    
    let expressionStr = "";
    let expressionTeX = "";
    
    if (expression.contains("from")) {
        const from = expression.removeAfter("from");
        const valsArr = from.split("to");

        const firstpt = valsArr[0];
        const secondpt = valsArr[1];
        
        let variable = "i";
        let begin = 0;
        let end = 9;
        
        if (firstpt.indexOf("=") > -1) { //If user specified an variable
            const firstptArr = firstpt.split("=");
            variable = firstptArr[0];
            begin = Math.min(+firstptArr[1], +secondpt);
            end = Math.max(+firstptArr[1], +secondpt);
        } else {
            variable = utils.findVariable(expression.content); //find free variable
            begin = Math.min(+firstpt, +secondpt);
            end = Math.max(+firstpt, +secondpt);
        }
        
        const variablesArr = utils.getVariables(expression.content);
        
        
        const inputExpressionArr = getSumArr(expression.content, variable, begin, end);
        
        let outputExpressionArr = "";
        let warn = ["", ""];
        if (variablesArr.length !== 1 || variablesArr[0] !== variable) {
            outputExpressionArr = ["Invalid variables.", "\\text{Invalid variables.}"];
        } else if (Math.abs(end-begin) > 1e6) {
            outputExpressionArr = ["Range too big, must be smaller than 10^6.", "\\text{Range too big, must be smaller than } 10^6."];
        } else {
            let result = 0;
            const code = Mathjs.compile(expression.content);
            const scope = {};
            
            for (let i=begin; i<=end; i++) {
                scope[variable] = i;
                const value = code.eval(scope);
                if (value === Infinity || value === -Infinity) {
                    warn = ["Warning, infinity at " + variable + " = " + i, "\\text{Warning, infinity at }" + variable + " = " + i];
                }
                
                result += value;
                
            }
            
            outputExpressionArr = [result + "", result + ""];
        }
        
        
        expressionStr = inputExpressionArr[0] + " = " + outputExpressionArr[0] + warn[0];
        expressionTeX = inputExpressionArr[1] + "=" + outputExpressionArr[1] + "\\\\ \\\\" + warn[1];
        console.log(expressionTeX);
        //console.log(finalExpressionTeX);
        //evalReply("float(sum(" + variable + "," + begin + "," + end + "," + expression.content + "))", ev, finalExpressionTeX);
        //parse e+21 etc...
        //doing sum of e^x from x=1 to 50 gives wrong TeX

    } else { //"indefinite" sum
        const variable = utils.findVariable(expression.content); //find free variables
        
        const topvariable = (variable==="n") ? "k" : "n";
        let start = 0;
        const depth = start+5;
        
        const code = Mathjs.compile(expression.content);
        
        const outputExpressionArr = [[],[]];
        
        for (let i=start; i<depth; i++) {
            const value = code.eval({[variable]:i});
            if (i === start && value === 0) {
                start++;
                continue;
            } else if (value < Infinity && value > -Infinity) {
                const fraction = Mathjs.fraction(value);
                let sign = "";
                let signnoneg = "";
                
                if (i === start) {
                    sign = (fraction.s < 0) ? "-" : "";
                    signnoneg = (fraction.s < 0) ? "" : "";
                } else {
                    sign = (fraction.s < 0) ? "-" : "+";
                    signnoneg = (fraction.s < 0) ? "" : "+";
                }
                
                
                if ((fraction.d + "").length < 6 && Math.abs(value) > 1e-6) {
                    if (fraction.n === 0 || fraction.d === 1) {
                        outputExpressionArr[0][i] = " " + sign + " " + fraction.n;
                        outputExpressionArr[1][i] = sign + fraction.n;
                    } else if (fraction.n === fraction.d) {
                        outputExpressionArr[0][i] = " " + sign + " 1";
                        outputExpressionArr[1][i] = sign + "1";
                    } else {
                        outputExpressionArr[0][i] = " " + sign + " " + fraction.n + "/" + fraction.d;
                        outputExpressionArr[1][i] = sign + "\\frac{" + fraction.n + "}{" + fraction.d + "}";
                    }
                } else {
                    outputExpressionArr[0][i] = signnoneg + limitFloatDecimal(value + "", 6);
                    outputExpressionArr[1][i] = " " + signnoneg + " " + limitFloatDecimal(value + "", 6);
                }
            } else if (i === start) {
                start++;
                continue;
            } else {
                outputExpressionArr[0][i] = value;
                outputExpressionArr[1][i] = value;
            }
        }
        
        const inputExpressionArr = getSumArr(expression.content, variable, start, topvariable);
        
        expressionStr = inputExpressionArr[0] + "=" + outputExpressionArr[0].join("") + " + ...";
        expressionTeX = inputExpressionArr[1] + "=" + outputExpressionArr[1].join("") + "+\\ldots";
    }
    
    return [expressionStr, expressionTeX];
    
};

const replaceSpaceMult = function(str) {
    return str.replace(/([a-z0-9]) ([a-z0-9])/gi, "$1*$2"); //find x x
};

const limitFloatDecimal = function(str, num) {
    const dotindex = str.indexOf(".");
    num = num+1;
    
    if (dotindex > -1) {
        const eindex = str.indexOf("e");
        
        if (eindex > -1) {
            const cutoffindex = Math.min((dotindex + num), str.length, eindex);
            return str.slice(0, cutoffindex) + str.slice(eindex, str.length);
        } else {
            const cutoffindex = Math.min((dotindex + num), str.length);
            return str.slice(0, cutoffindex);
        }
        
        
    } else {
        return str;
    }
    
};

const getSumArr = function(expression, variable, begin, end) {
    const expressionArr = Algebrite.run(expression, true);
    if (+begin === +begin) {
        const sumStr = "Sum from " + variable + "=" + +begin + " to " + +end + " of: " + expressionArr[0];
        const sumTeX = "\\sum_{" + variable + "=" + begin + "}^{" + end + "}" + expressionArr[1];
        return [sumStr, sumTeX];
        
    } else {
        const sumStr = "Sum of " + variable + " of: " + expressionArr[0];
        const sumTeX = "\\sum_{" + variable + "}" + expressionArr[1];
        return [sumStr, sumTeX];
    }
    
};


exports.eval = eval;