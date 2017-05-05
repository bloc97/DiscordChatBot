/* global Infinity */

const Algebrite = require("../Interpreters/Algebrite.js");
const Mathjs = require("../Interpreters/Math.js");
const utils = require("./Utils.js");
//Non-symbolc sum addon

const eval = function(expression) {
    expression.removeBefore("sum");
    expression.removeAllInstance("of");
    
    let expressionStr = "";
    let expressionTeX = "";
    
    let outputExpressionArr = [[],[]];
    
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
        
        
        let warn = ["", ""];
        
        if (variablesArr.length !== 1 || variablesArr[0] !== variable) {
            outputExpressionArr = ["Invalid variables.", "\\text{Invalid variables.}"];
        } else if (Math.abs(end-begin) > 1e6) {
            outputExpressionArr = ["Range too big, must be smaller than 10^6.", "\\text{Range too big, must be smaller than } 10^6."];
        } else {
            
            let result = 0;
            const code = Mathjs.compile(mathjsInputPreparse(expression.content));
            const scope = {};

            for (let i=begin; i<=end; i++) {
                scope[variable] = i;
                const value = +code.eval(scope);
                if (value === Infinity || value === -Infinity) {
                    warn = ["Warning, infinity at " + variable + " = " + i, "\\text{Warning, infinity at }" + variable + " = " + i];
                } else if (!utils.isNumber(value)) {
                    warn = ["Warning, NaN at " + variable + " = " + i, "\\text{Warning, NaN at }" + variable + " = " + i];
                } else {
                    result += value;
                    //console.log(value);
                }


            }
            //resultArr = [result,result];
            resultArr = utils.findE(result);
            resultArr[0] = Mathjs.format(resultArr[0], {precision: 14})
            resultArr[1] = Mathjs.format(resultArr[1], {precision: 14})
            outputExpressionArr = [resultArr[0] + "", resultArr[1] + ""];
        }
        
        expressionStr = inputExpressionArr[0] + " = " + outputExpressionArr[0] + warn[0];
        expressionTeX = inputExpressionArr[1] + "=" + outputExpressionArr[1] + "\\\\ \\\\" + warn[1];
        //console.log(finalExpressionTeX);
        //evalReply("float(sum(" + variable + "," + begin + "," + end + "," + expression.content + "))", ev, finalExpressionTeX);
        //parse e+21 etc...
        //doing sum of e^x from x=1 to 50 gives wrong TeX

    } else { //"indefinite" sum
        
        const variable = utils.findVariable(expression.content); //find free variables
        
        const variablesArr = utils.getVariables(expression.content);
        
        
        
        const topvariable = (variable==="n") ? "k" : "n";
        let start = 0;
        const depth = start+4;
        
        
        if (variablesArr.length !== 1 || variablesArr[0] !== variable) {
            const inputExpressionArr = getSumArr(expression.content, variable, start, topvariable);
            expressionStr = inputExpressionArr[0] + " = Invalid variables.";
            expressionTeX = inputExpressionArr[1] + "=\\text{Invalid variables.}";
            return [expressionStr, expressionTeX];
        }
        
        const code = Mathjs.compile(mathjsInputPreparse(expression.content));
        
        
        
        
        for (let i=start; i<depth; i++) {
            const value = code.eval({[variable]:i});
            
            
            if (i === start && (value === 0 || value === Infinity || value === -Infinity)) {
                start++;
                continue;
            } else if (value === 0) {
                outputExpressionArr[0][i] = " + 0";
                outputExpressionArr[1][i] = "+0";
                start++;
                continue;
            } else if (value === Infinity) {
                outputExpressionArr[0][i] = " + Infinity";
                outputExpressionArr[1][i] = "+Infinity";
                start++;
                continue;
            } else if (value === -Infinity) {
                outputExpressionArr[0][i] = " - Infinity";
                outputExpressionArr[1][i] = "-Infinity";
                start++;
                continue;
            } else {
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
                
                if ((fraction.d + "").length < 6 && Math.abs(value) > 1e-6 && +fraction !== fraction.n) {
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
                    outputExpressionArr[0][i] = " " + signnoneg + " " + limitFloat(value, 6);
                    outputExpressionArr[1][i] = signnoneg + limitFloat(value, 6);
                }
            }
            //console.log(outputExpressionArr[1][i]);
        }
        
        const lastsign = (code.eval({[variable]:depth}) > 0) ? "+" : "-";
        
        const inputExpressionArr = getSumArr(expression.content, variable, start, topvariable);
        
        expressionStr = inputExpressionArr[0] + " = " + outputExpressionArr[0].join("") + " " + lastsign + " ...";
        expressionTeX = inputExpressionArr[1] + "=" + outputExpressionArr[1].join("") + lastsign + "\\ldots";
    }
    
    return [expressionStr, expressionTeX];
    
};

const replaceSpaceMult = function(str) {
    return str.replace(/([a-z0-9]) ([a-z0-9])/gi, "$1*$2"); //find x x
};

const limitFloatDecimal = function(str, num) {
    str = str + ""; //convert to string just in case
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

const limitFloat = function(number, prec) { //truncates a float/double/bignumber_string into a string with specified precision, does not round values
    number = +number;
    prec += 1; //add one precision to account for the "."
    const magnitude = Math.abs(number);
    
    
    let str = number + "";
    
    const sign = (str[0]==="-") ? "-" : ""; //separate the sign from the mantissa
    if (sign === "-") {
        str = str.slice(1, str.length);
    }
    
    if (magnitude < 5e-16) { //value too small, zero it
        return sign + 0;
    }
    
    const eindex = str.indexOf("e"); //separates the exponent from the mantissa
    let exponent = 0;
    if (eindex > -1) {
        exponent = +str.slice(eindex+1, str.length);
        str = str.slice(0, eindex);
    }
    
    if (str.length < prec) { //if the mantissa is already smaller than the precision, return the unchanged number
        return number + "";
    }
    const dotindex = str.indexOf(".");
    
    if (dotindex === -1 && str.length > prec) { //if there is no dot and the length surpasses the precision
        str = str[0] + "." + str[0].slice(1, str.length); //move the dot
        exponent += (str.length - 1); //change the exponent
        str = str.slice(0, prec); //cut the string
        
    } else if (dotindex < prec) { //if the dot falls before the precision
        str = str.slice(0, prec); //just cut the string
        
    } else if (dotindex > prec) { //if the dot falls after the precision
        strarr = str.split(".");
        str = strarr[0][0] + "." + strarr[0].slice(1, strarr[0].length) + strarr[1]; //move the dot
        str = str.slice(0, prec); //change the exponent
        exponent += (dotindex - 1); //cut the string
    }
    
    if (str[str.length] === ".") { //if the string ends with "."
        str = str.slice(0, str.length-1);
    }
    
    console.log(concatenateFloatString(sign, str, exponent));
    return concatenateFloatString(sign, str, exponent);
};

const concatenateFloatString = function(sign, num, exp) {
    if (sign === "+") {
        sign = "";
    }
    
    if (exp === 0) {
        exp = "";
    } else {
        let expsign = "+";
        if (exp < 0) {
            expsign = "";
        }
        
        exp = "e" + expsign + exp;
    }
    return sign + num + exp;
};

const getSumArr = function(expression, variable, begin, end) {
    const expressionArr = Algebrite.run(algebriteInputPreparse(expression), true);
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

const algebriteInputPreparse = function(str) {
    str = utils.fixLogAlgebrite(str);
    return str;
};

const mathjsInputPreparse = function(str) {
    str = utils.fixLnMathjs(str);
    return str;
};


exports.eval = eval;