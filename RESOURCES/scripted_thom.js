/**
 * 

 */

var monMIB = "XMS3500-MIB";
var logName = ">>>>>>>>>>>>>THANH_THOOME ";

/**
 * Extract the values of a variable.
 * @param mib Mib name.
 * @param varToUse A variable, like 'cefexConfigExtenderName'.
 * @exception will throw an exception if varToUse is not found
 * @return the list of values found.
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

var values = extractIndexedValuesInTable(monMIB, "topoElementName");
mylog(logName + " nb vars = " + values.length);

for (var i = 0; i < values.length; i++) {
    mylog(" i = " + values[i]);
}

function mylog(str) {
    log.error(logName + " " + str);
}
