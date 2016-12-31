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
    return msg.slice(startindex, msg.length);
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
    
    return "[" + hours + ":" + minutes + ":" + seconds + "] ";
};

exports.NULL = NULL;
exports.compare = compare;
exports.contains = contains;
exports.isLetter = isLetter;
exports.getNick = getNick;
exports.clearWhitespaces = clearWhitespaces;
exports.findNextChar = findNextChar;
exports.getTimeStamp = getTimeStamp;