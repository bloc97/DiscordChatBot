
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


exports.fixExpLatex = fixExpLatex;