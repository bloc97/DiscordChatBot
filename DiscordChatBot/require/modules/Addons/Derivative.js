const Algebrite = require("./Interpreters/Algebrite.js");
const utils = require("./Addons/Utils.js");


const eval = function(expression) {
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
    //evalReply("d(" + expression.content + "," + vals + ")", ev, finalExpressionTeX);
    
};

const evalalt = function(expression) {
    expression.removeAllInstance("of");

    let valsArr = expression.findDd();
    expression.removeDd();
    if (valsArr.length < 1) {
        valsArr = ["x"];
    }
    let vals = valsArr.join(",");
    const finalExpressionTeX = getDerivStr(expression.content, valsArr);

    //evalReply("d(" + expression.content + "," + vals + ")", ev, finalExpressionTeX);
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