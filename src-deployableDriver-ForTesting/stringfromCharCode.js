/**
 * 
 */

var mystr = "69.77.49.56.55";

/**
 * Convert a string like "69.77.49.56.55" -to-> "EM187".
 * @param asciiStr String of ascii codes. 
 * @returns {String}
 */
function convertAsciiCodesToString(asciiStr) {
    var asciiCodes = asciiStr.split(".");
    var retstring = "";
    for (var i = 0; i < asciiCodes.length; i++) {
        retstring += String.fromCharCode(parseInt(asciiCodes[i]));
    }
    
    return retstring;
}

print("<" + convertAsciiCodesToString(mystr) + ">");
    