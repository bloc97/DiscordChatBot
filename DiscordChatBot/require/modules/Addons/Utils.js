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


exports.fixExpInput = fixExpInput;
exports.fixExpLatex = fixExpLatex;
exports.fixFloatLatex = fixFloatLatex;