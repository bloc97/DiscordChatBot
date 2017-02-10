
const Mathjs = require("../Interpreters/Math.js");

const isLetter = function(char) {
    return char.toLowerCase() !== char.toUpperCase();
};

const isNumber = function(char) {
    return +char === +char;
};

const isInfinite = function(num) {
    return (num === Infinity || num === -Infinity);
};

const findVariable = function(str) {
    const index = str.search(/(^|[^a-z])[a-df-z]([^a-z]|$)/i); //find free variables
    const variable = str[index+1];
    return variable;
};

const getVariables = function(expression) {
    const variables = [];
    for (let i=0; i<expression.length-2; i++) {
        if (!isLetter(expression[i]) && (isLetter(expression[i+1]) && expression[i+1] !== "e") && !isLetter(expression[i+2])) {
            if (variables.indexOf(expression[i+1]) === -1) {
                variables.push(expression[i+1]);
            }
        }
    }
    return variables;
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

const fixFloatLatex = function(str) {
    
    let textPart = [];
        let lastindex = 0;
    
    for (let i=0; i<str.length-1; i++) {
        if (str[i] === "e" && (str[i+1] === "+" || str[i+1] === "-")) {
            const nextindex = findNextDifferentChar(str, i+1); //find next character that isn't similar to the one after the "^"
            if (nextindex === -1) {
                continue;
            }
            
            textPart.push(str.slice(lastindex, i) + "\\times10^"); //push the unchanged part
            textPart.push(("{" + str.slice(i+1, nextindex) + "}").replace("+", "")); //push the exponent part in brackets
            lastindex = nextindex;
            i = nextindex-1; //skip the part already saved
        }
    }
    textPart.push(str.slice(lastindex, str.length)); //push in the last part that was not detected
    return textPart.join("");
    
};

const fixPiLatex = function(str) {
    str = str.replace(/\\pi/gi, "\\pi\\,");
    return str;
};

const fixLogLatex = function(str) {
    str = str.replace(/log10[(]/gi, "log_{10}(");
    str = str.replace(/log[(]/gi, "ln(");
    return str;
};

const fixLogStr = function(str) {
    str = str.replace(/log[(]/gi, "ln(");
    return str;
};

const fixLogAlgebrite = function(str) {
    str = str.replace(/log[(]/gi, "log10(");
    return str;
};

const fixLnMathjs = function(str) {
    str = str.replace(/log[(]/gi, "log10(");
    str = str.replace(/ln[(]/gi, "log(");
    return str;
};

const findE = function(num) {
    if (!isNumber(num) || isInfinite(num) || num < 1e-4) {
        return [num, num];
    }
    
    const value = num/Math.E;
    let integer = Math.abs(Math.floor(value));
    integer = (integer > 1) ? integer : "";
    const fractional = value%1;
    const fraction = Mathjs.fraction(fractional);
    
    let output = [];
    if (fractional < 1e-6) {
        output[0] = integer + "e";
        output[1] = integer + "e";
    } else if ((fraction.d + "").length < 4) {
        const sign = (fraction.s < 0) ? "-" : "";
        output[0] = " " + sign + integer + fraction.n + "/" + fraction.d + "e";
        output[1] = sign + integer + "\\frac{" + fraction.n + "}{" + fraction.d + "}e";
    } else {
        return [num, num];
    }
    
    return output;
};

exports.isLetter = isLetter;
exports.isNumber = isNumber;
exports.isInfinite = isInfinite;

exports.findVariable = findVariable;
exports.getVariables = getVariables;
exports.fixExpInput = fixExpInput;
exports.fixFloatLatex = fixFloatLatex;
exports.fixPiLatex = fixPiLatex;
exports.fixLogLatex = fixLogLatex;
exports.fixLogStr = fixLogStr;
exports.fixLogAlgebrite = fixLogAlgebrite;
exports.fixLnMathjs = fixLnMathjs;


exports.findE = findE;