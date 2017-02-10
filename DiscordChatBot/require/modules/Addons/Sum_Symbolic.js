const Algebrite = require("../Interpreters/Algebrite.js");

//Symbolic sum addon, can sum variables that have no definite values

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
            begin = firstptArr[1];
            end = secondpt;
        } else {
            variable = findVariable(expression.content); //find free variables
            begin = firstpt;
            end = secondpt;
        }
        
        
        //console.log(begin);

        
        const inputExpressionArr = getSumArr(expression.content, variable, begin, end);
        
        let outputExpressionArr = "";
        if (Math.abs(+end - begin) > 1000) {
            outputExpressionArr = ["Sum range too big, must be below 1000.", "\\text{Sum range too big, must be below 1000.}"];
        } else if (+end > 1e10) {
            outputExpressionArr = ["End value too big, must be below 10^10.", "\\text{End value too big, must be below }10^{10}."];
        } else {
            outputExpressionArr = Algebrite.run("float(sum(" + variable + "," + begin + "," + end + "," + expression.content + "))", true);
        }
        
        
        expressionStr = inputExpressionArr[0] + " = " + outputExpressionArr[0];
        expressionTeX = inputExpressionArr[1] + "=" + outputExpressionArr[1];
        //console.log(finalExpressionTeX);
        //evalReply("float(sum(" + variable + "," + begin + "," + end + "," + expression.content + "))", ev, finalExpressionTeX);
        //parse e+21 etc...
        //doing sum of e^x from x=1 to 50 gives wrong TeX

    } else { //"indefinite" sum
        const variable = findVariable(expression.content); //find free variables
        
        const inputExpressionArr = getSumArr(expression.content, variable);
        
        const outputExpressionArr0 = Algebrite.run("sum(" + variable + ",0,0," + expression.content + ")", true);
        const outputExpressionArr1 = Algebrite.run("sum(" + variable + ",1,1," + expression.content + ")", true);
        const outputExpressionArr2 = Algebrite.run("sum(" + variable + ",2,2," + expression.content + ")", true);
        const outputExpressionArr3 = Algebrite.run("sum(" + variable + ",3,3," + expression.content + ")", true);
        
        expressionStr = inputExpressionArr[0] + " = " + outputExpressionArr0[0] + " + " + outputExpressionArr1[0] + " + " + outputExpressionArr2[0] + " + " + outputExpressionArr3[0] + " ...";
        expressionTeX = inputExpressionArr[1] + "=" + outputExpressionArr0[1] + "+" + outputExpressionArr1[1] + "+" + outputExpressionArr2[1] + "+" + outputExpressionArr3[1] + "+\\ldots";
    }
    
    return [expressionStr, expressionTeX];
    
};

const findVariable = function(str) {
    const index = str.search(/(^|[^a-z])[a-df-z]([^a-z]|$)/i); //find free variables
    const variable = str[index+1];
    return variable;
};

const replaceSpaceMult = function(str) {
    return str.replace(/([a-z0-9]) ([a-z0-9])/gi, "$1*$2"); //find x x
};

const getSumArr = function(expression, variable, begin, end) {
    const expressionArr = Algebrite.run(expression, true);
    if (begin) {
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