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

exports.NULL = NULL;
exports.compare = compare;
exports.contains = contains;
exports.isLetter = isLetter;