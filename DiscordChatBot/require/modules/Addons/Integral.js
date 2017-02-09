const Algebrite = require("./Interpreters/Algebrite.js");


const eval = function(expression) {
    expression.removeBefore("integral");
    expression.removeAllInstance("of");

    let respectToArr = expression.findDx();

    if (respectToArr.length < 1) {
        respectToArr = ["x"];
    }
    expression.removeDx();
    
    let inputExpressionStr = "";
    let inputExpressionTeX = "";
    
    let outputExpressionStr = "";
    let outputExpressionTeX = "";
    
    if (expression.contains("from")) { //Definite Integral
        const from = expression.removeAfter("from");
        const valsArr = from.split("to");
        const vals = valsArr.join(",");

        const inputExpressionArr = Algebrite.run(expression.content, true);
        
        inputExpressionStr = "Definite Integral from " + valsArr[0] + " to " + valsArr[1] + " of: " + inputExpressionArr[0];
        inputExpressionTeX = ("\\int_{" + valsArr[0] + "}^{" + valsArr[1] + "}{" + inputExpressionArr[1] + "} \\,d" + respectToArr[0]);
        
        const outputExpressionArr = Algebrite.run("defint(" + expression.content + "," + respectToArr[0] + "," + vals + ")");
        
        outputExpressionStr = outputExpressionArr[0];
        outputExpressionTeX = outputExpressionArr[1];
    
        //evalReply("defint(" + expression.content + "," + respectToArr[0] + "," + vals + ")", ev, finalExpressionTeX);

    } else { //Indefinite Integral
        let respectTo = respectToArr.join(",");

        let intIs = "";
        let intDs = "";

        for (let i=0; i<respectToArr.length; i++) {
            intIs = intIs + "i";
            intDs = intDs + "\\,d" + respectToArr[i];
        }
        const inputExpressionArr = Algebrite.run(expression.content, true);

        inputExpressionStr = "Indefinite Integral (Order " + respectToArr.length + ") of: " + inputExpressionArr[0];
        inputExpressionTeX = ("\\" + intIs + "nt{" + inputExpressionArr[1] + "}" + intDs);
        
        const outputExpressionArr = Algebrite.run("integral(" + expression.content + "," + respectTo + ")");
        
        outputExpressionStr = outputExpressionArr[0] + "+ constant";
        outputExpressionTeX = outputExpressionArr[1] + "+\\text{constant}";

        //evalReply("integral(" + expression.content + "," + respectTo + ")", ev, finalExpressionTeX, false, "+C");
    }
    
    Algebrite.clearall();
    return [[inputExpressionStr, outputExpressionStr], [inputExpressionTeX, outputExpressionTeX]];
    
};

exports.eval = eval;