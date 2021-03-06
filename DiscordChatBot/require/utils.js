const NULL = "_NULL_";

const compare = function(string, substr) { //checks if substring is in string
    return (string.search(substr) !== -1);
};
const contains = function(array, string) { //checks if string is in array
    return (array.indexOf(string) !== -1);
};
const isLetter = function(char) {
    return (char.toUpperCase() !== char.toLowerCase());
};
const getNick = function(name) {
    for (let i=0; i<name.length; i++) {
        if (!isLetter(name.charAt(i))) {
            let nick = name.substring(0, i).toLowerCase();
            if (nick.length > 3) {
                return nick;
            } else {
                return name;
            }
        }
    }
    return name;
};


const clearWhitespaces = function(msg) { //removes the beginning whitespaces
    let startindex = 0;
    for (let i=0; i<msg.length; i++) {
        if (msg.charAt(i) !== " ") {
            startindex = i;
            break;
        }
    }
    if (startindex === 0) {
        return msg;
    }
    return msg.slice(startindex, msg.length);
};
const clearEndWhitespaces = function(msg) { //removes the ending whitespaces
    let endindex = msg.length-1;
    for (let i=endindex; i>=0; i--) {
        if (msg.charAt(i) !== " ") {
            endindex = i+1;
            break;
        }
    }
    if (endindex === msg.length) {
        return msg;
    }
    return msg.slice(0, endindex);
};
const findNextChar = function(msg, char, startindex) {
    for (let i=startindex; i<msg.length; i++) {
        if (msg.charAt(i) === char) {
            return i;
        }
    }
    return msg.length;
};

const getTimeStamp = function() {
    const time = new Date();
    const month = getMonthAbb(time.getMonth());
    const day = time.getDate();
    let seconds = time.getSeconds();
    let minutes = time.getMinutes();
    let hours = time.getHours();
    if (seconds < 10) {
        seconds = "0"+seconds;
    }
    if (minutes < 10) {
        minutes = "0"+minutes;
    }
    if (hours < 10) {
        hours = "0"+hours;
    }
    
    return "[" + month + "/" + day + " " + hours + ":" + minutes + ":" + seconds + "] ";
};

const getMonthAbb = function(n) {
    n = Math.floor(+n)+1;
    const arr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (n > 0 && n < 13) {
        return arr[n];
    } else {
        return arr[0];
    }
};

const getSizeStamp = function(bytes) {
    if (bytes > 5000000) {
        return getDecimalPrecision(bytes/1000000, 2) + " MB";
    } else if (bytes > 5000) {
        return getDecimalPrecision(bytes/1000, 2) + " KB";
    } else {
        return getDecimalPrecision(bytes) + " B";
    }
};

const getDecimalPrecision = function(value, prec) {
    let newval = value*(Math.pow(10, prec));
    newval = Math.round(newval);
    newval = newval/(Math.pow(10, prec));
    newstr = newval + "";
    dotIndex = findNextChar(newstr, ".", 0);
    if (prec === 0) {
        return newstr.substring(0, dotIndex);
    } else {
        return newstr.substring(0, dotIndex+prec+1);
    }
};

const getTimeFromMiliseconds = function(ms) {
    const totalSeconds = ms/1000;
    let dayText = "";
    let hourText = "";
    let minuteText = "";
    let secondText = "";
    
    if (totalSeconds > 86400) {
        const days = Math.floor(totalSeconds/86400);
        dayText = (days === 1) ? " Day" : " Days";
        dayText = days + dayText;
    }
    if (totalSeconds > 3600) {
        const hours = Math.floor(totalSeconds%86400/3600);
        hourText = (hours === 1) ? " Hour" : " Hours";
        hourText = hours + hourText;
    }
    if (totalSeconds > 60) {
        const minutes = Math.floor(totalSeconds%3600/60);
        minuteText = (minutes === 1) ? " Minute" : " Minutes";
        minuteText = minutes + minuteText;
    }
    if (totalSeconds > 0) {
        const seconds = Math.floor(totalSeconds%60);
        secondText = (seconds === 1) ? " Second" : " Seconds";
        secondText = seconds + secondText;
    }
    
    if (totalSeconds > 86400) {
        return dayText + " and " + hourText;
    } else if (totalSeconds > 3600) {
        return hourText + " and " + minuteText;
    } else if (totalSeconds > 60) {
        return minuteText + " and " + secondText;
    } else {
        return secondText;
    }
};

const log = function(str) {
    console.log(getTimeStamp() + str);
};
const logErr = function(str) {
    console.log(getTimeStamp() + "\x1b[31m%s\x1b[0m", str);    
};
const logInfo = function(str) {
    console.log(getTimeStamp() + "\x1b[36m%s\x1b[0m", str);
};
const logWarn = function(str) {
    console.log(getTimeStamp() + "\x1b[33m%s\x1b[0m", str);
};
const logDone = function(str) {
    console.log(getTimeStamp() + "\x1b[32m%s\x1b[0m", str);
};
const logNew = function(str) {
    console.log(getTimeStamp() + "\x1b[1m%s\x1b[0m", str);
};

exports.NULL = NULL;
exports.compare = compare;
exports.contains = contains;
exports.isLetter = isLetter;
exports.getNick = getNick;
exports.clearWhitespaces = clearWhitespaces;
exports.clearEndWhitespaces = clearEndWhitespaces;
exports.findNextChar = findNextChar;
exports.getTimeStamp = getTimeStamp;
exports.getSizeStamp = getSizeStamp;
exports.getTimeFromMiliseconds = getTimeFromMiliseconds;
exports.log = log;
exports.logErr = logErr;
exports.logWarn = logWarn;
exports.logNew = logNew;
exports.logInfo = logInfo;
exports.logDone = logDone;