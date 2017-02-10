const Algebrite = require("../Interpreters/Algebrite.js");


const eval = function(expression) {
    expression.removeBefore("integral");
    expression.removeAllInstance("of");

    let respectToArr = expression.findDx();

    if (respectToArr.length < 1) {
        respectToArr = ["x"];
    }
    expression.removeDx();
    
    let expressionStr = "";
    let expressionTeX = "";
    
    if (expression.contains("from")) { //Definite Integral
        const from = expression.removeAfter("from");
        const valsArr = from.split("to");
        const vals = valsArr.join(",");

        const inputExpressionArr = Algebrite.run(expression.content, true);
        
        const inputExpressionStr = "Definite Integral from " + valsArr[0] + " to " + valsArr[1] + " of: " + inputExpressionArr[0];
        const inputExpressionTeX = ("\\int_{" + valsArr[0] + "}^{" + valsArr[1] + "}{" + inputExpressionArr[1] + "} \\,d" + respectToArr[0]);
        
        const outputExpressionArr = Algebrite.run("defint(" + expression.content + "," + respectToArr[0] + "," + vals + ")", true);
        
        expressionStr = inputExpressionStr + " = " + outputExpressionArr[0];
        expressionTeX = inputExpressionTeX + "=" + outputExpressionArr[1];
        
    } else { //Indefinite Integral
        let respectTo = respectToArr.join(",");

        let intIs = "";
        let intDs = "";
        
        if (respectToArr.length <= 4) {
            for (let i=0; i<respectToArr.length; i++) {
                intIs = intIs + "i";
                intDs = intDs + "\\,d" + respectToArr[i];
            }
            intIs = "\\" + intIs + "nt";
        } else {
            for (let i=0; i<respectToArr.length; i++) {
                intDs = intDs + "\\,d" + respectToArr[i];
            }
            intIs = "\\underbrace{\\idotsint}_{" + respectToArr.length + "}";
        }
        
        const inputExpressionArr = Algebrite.run(expression.content, true);

        const inputExpressionStr = "Indefinite Integral (Order " + respectToArr.length + ") of: " + inputExpressionArr[0];
        const inputExpressionTeX = (intIs + "{" + inputExpressionArr[1] + "}" + intDs);
        
        const outputExpressionArr = Algebrite.run("integral(" + expression.content + "," + respectTo + ")", true);
        
        
        expressionStr = inputExpressionStr + " = " + outputExpressionArr[0] + "+ constant";
        expressionTeX = inputExpressionTeX + "=" + outputExpressionArr[1] + "+\\text{constant}";

    }
    
    return [expressionStr, expressionTeX];
    
};

exports.eval = eval;