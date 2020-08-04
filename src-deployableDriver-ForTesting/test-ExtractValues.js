/**
 * Used to test the extractIndexedValuesInTable().

 */

var monMIB = "XMS3500-MIB";
var logName = ">>>>>>>>>>>>>THANH_STUFF ";

/**
 * Find and extract the values of a variable, such as "cefexConfigExtenderName" for the RMON.
 * @param mib Mib name.
 * @param varToUse A variable, like 'cefexConfigExtenderName'.
 * @exception will return an exception if varToUse is not found
 */
function extractIndexedValuesInTable(mib, varToUse) {
    var retvalues= [];// values to return
    
    try {
        
        var oidStr = snmp.getOID(mib, varToUse); // eg. '.1.3.6.1.4.1.9.9.691.1.1.2.1.1.0'
        
        if (oidStr.substring(oidStr.lastIndexOf(".") + 1) == "0") {// getOID() usually returns with a '.0' at the end
            oidStr = oidStr.substring(0, oidStr.lastIndexOf(".")); // remove ending '.0' -> '.1.3.6.1.4.1.9.9.691.1.1.2.1.1'
        }

        var myVar = snmp.getNextVB(mib, varToUse, 0);
 
        while (myVar.oid.indexOf(oidStr) != -1) {
            retvalues.push(myVar.value);
            myVar = snmp.getNextVB(myVar.oid);
        }
    } catch (ex) {
        log.error(host + " extractIndexedValuesInTable() - error: " + ex);
        throw ex;
    }

    return retvalues;
 }

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

function extractValues(variableName) {
    var values = extractIndexedValuesInTable(monMIB, variableName);
    
    for (var i = 0; i < values.length; i++) {
        mylog(">>>>>> " + variableName + " ----------------- i = " + values[i]);
    } 
}
function extractValuesWithAsciiConversion(variableName) {
    var values = extractIndexedValuesInTable(monMIB, variableName);
    
    for (var i = 0; i < values.length; i++) {
        mylog("ascii conversion>>>>>> " + variableName + " ----------------- i = " + convertAsciiCodesToString(values[i]));
    } 
}

extractValues( "topoElementName");
extractValuesWithAsciiConversion( "genAlarmOrigin");
extractValues( "genAlarmProbableCause");
extractValues( "genAlarmResourceId");



function mylog(str) {
    log.error(logName + " " + str);
}
