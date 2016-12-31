let roman = function (t) {

    let pos = 0;

    let next = function () {
        if (pos < t.length) {
            return t.charAt(pos);
        } else {
            return " ";
        }
    };

    let number = function (one, five, ten) {

        let val = 0;

        while (true) {

            switch (next()) {
                    
                case one:   if (val <= 2 || (val >= 5 && val <= 7)) {
                               val += 1;
                               pos++;
                           } else {
                               return val;
                           }
                           break;

                case five: if (val <= 1) {
                               val = 5 - val;
                               pos++;
                           } else {
                               return val;
                           }
                           break;

                case ten:  if (val === 1) {
                              val = 9;
                              pos++;
                          } else {
                              return val;
                          }
                          break;

                default:  return val;
            }
        }
    };

    let m = number("M", "",  "" );
    let c = number("C", "D", "M");
    let d = number("X", "L", "C");
    let u = number("I", "V", "X");

    if (pos == t.length && pos > 0) {
        return m*1000 + c*100 + d*10 + u;
    } else {
        return -1;
    }
};


console.log(roman("CCLXX"));