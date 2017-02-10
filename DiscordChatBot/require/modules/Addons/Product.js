const Algebrite = require("../Interpreters/Algebrite.js");


const eval = function(expression) {
    expression.removeBefore("product");
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
        
        const outputExpressionArr = Algebrite.run("float(product(" + variable + "," + begin + "," + end + "," + expression.content + "))", true);
        
        expressionStr = inputExpressionArr[0] + " = " + outputExpressionArr[0];
        expressionTeX = inputExpressionArr[1] + "=" + outputExpressionArr[1];
        //console.log(finalExpressionTeX);
        //evalReply("float(sum(" + variable + "," + begin + "," + end + "," + expression.content + "))", ev, finalExpressionTeX);
        //parse e+21 etc...
        //doing sum of e^x from x=1 to 50 gives wrong TeX

    } else { //"indefinite" sum
        const variable = findVariable(expression.content); //find free variables
        
        const inputExpressionArr = getSumArr(expression.content, variable);
        
        const outputExpressionArr0 = Algebrite.run("product(" + variable + ",0,0," + expression.content + ")", true);
        const outputExpressionArr1 = Algebrite.run("product(" + variable + ",1,1," + expression.content + ")", true);
        const outputExpressionArr2 = Algebrite.run("product(" + variable + ",2,2," + expression.content + ")", true);
        const outputExpressionArr3 = Algebrite.run("product(" + variable + ",3,3," + expression.content + ")", true);
        
        expressionStr = inputExpressionArr[0] + " = " + outputExpressionArr0[0] + " * " + outputExpressionArr1[0] + " * " + outputExpressionArr2[0] + " * " + outputExpressionArr3[0] + " ...";
        expressionTeX = inputExpressionArr[1] + "=" + outputExpressionArr0[1] + " \\times{} " + outputExpressionArr1[1] + " \\times{} " + outputExpressionArr2[1] + " \\times{} " + outputExpressionArr3[1] + "+\\ldots";
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
        const sumStr = "Product from " + variable + "=" + +begin + " to " + +end + " of: " + expressionArr[0];
        const sumTeX = "\\prod_{" + variable + "=" + begin + "}^{" + end + "}" + expressionArr[1];
        return [sumStr, sumTeX];
        
    } else {
        const sumStr = "Product of " + variable + " of: " + expressionArr[0];
        const sumTeX = "\\prod_{" + variable + "}" + expressionArr[1];
        return [sumStr, sumTeX];
    }
    
};


exports.eval = eval;