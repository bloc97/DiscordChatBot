const Algebrite = require("./Interpreters/Algebrite.js");


const eval = function(expression) {
    expression.removeBefore("sum");
    expression.removeAllInstance("of");

    if (expression.contains("from")) {
        const from = expression.removeAfter("from");
        const valsArr = from.split("to");

        const firstpt = valsArr[0];
        const secondpt = valsArr[1];

        const firstptArr = firstpt.split("=");
        const variable = firstptArr[0];
        const begin = firstptArr[1];
        const end = secondpt;

        //console.log(begin);

        const finalExpressionTeX = getSumStr(expression.content, variable, begin, end);
        //console.log(finalExpressionTeX);
        //evalReply("float(sum(" + variable + "," + begin + "," + end + "," + expression.content + "))", ev, finalExpressionTeX);
        //parse e+21 etc...
        //doing sum of e^x from x=1 to 50 gives wrong TeX

    } else { //"indefinite" sum
        const variable = "i";
        const begin = 0;
        const end = 1;

        const finalExpressionTeX = getSumStr(expression.content, variable, begin, end);

    }
    
    
};


const getSumStr = function(expression, variable, begin, end) {
    const expressionTeX = Algebrite.run(expression, true)[1];
    const sumstr = "\\sum_{" + variable + "=" + begin + "}^{" + end + "}";
    
    return sumstr + expressionTeX;
};