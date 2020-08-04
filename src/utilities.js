/************************************************************************************
 * File: utilities.js
 * Various utility functions.
 * thnguyen nov 12. 2013. 
 */

/**
 * Compose prefix uri.
 * Example, composePrefixURI("SNMP", "Thomson", "XMS3500", "10.12.170.59", "Buiding3-Rack122") --gives--> "SNMP://Buiding3-Rack122:Thomson/XMS3500:10.12.170.59"
 * @param scheme May be empty. Ex. "SNMP", "IRD".
 * @param type Device type, ex. "FC3000", "Proview_7000_7100", "NetVx", "Miranda_iTX_HP_DL370", "DSR6300", "SmartUPS2200", "MVP200".
 * @param host ex. "10.12.170.59"
 * @param uniqueID ex. "" May be empty.
 */
function composePrefixURI(scheme, manufacturer, type, host, uniqueID) {  
    return encodeURI(prefix = suffixString(scheme, "://") + suffixString(uniqueID, ":") + suffixString(manufacturer, "/") + type + ":" + host);
}

/**
 * Compose base path.
 * Example, composeBaseAlarmPath("SNMP", "Thomson", "XMS3500", "10.12.170.59") -gives-> "SNMP/Thomson/XMS3500(10.12.170.59)".
 * @param scheme May be empty. Ex. "SNMP", "IRD".
 * @param manufacturer May be empty. Ex. "Thomson", "Motorola", "Generic", "QLogic", "Nielsen", "RGB", "Scientific Atlanta", "R&S", "Studer".
  *@param type Device type, ex. "FC3000", "Proview_7000_7100", "NetVx", "Miranda_iTX_HP_DL370", "DSR6300", "SmartUPS2200", "MVP200".
 * @param host
 * @returns {String}
 */
function composeBaseAlarmPath(scheme, manufacturer, type, host) {
   return encodeURI(suffixString(scheme, "/") + suffixString(manufacturer, "/") + type + "(" + host + ")");
}

/**
 * Concat a input string and a suffix, eg "thomson" + "/" --> "thomson/". 
 * Returns empty string if input is empty.
 * 
 * @param inputStr Some string you like to suffix.
 * @param suffix ex. "/", ":"/
 */
function suffixString(inputStr, suffix) {
    var trimmed = trim(inputStr);
    return (trimmed ? trimmed + suffix : "");
}

/**
 * Javascript assertion.
 * @param condition
 * @param message
 */
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}
/**
 * Extract the values of an indexed variable in an array and return it.
 * 
 * @param mib Mib name.
 * @param variable A variable, like 'cefexConfigExtenderName'.
 * @exception will throw an exception if variable is not found
 * @return the list of values found.
 */
function extractIndexedValuesInTable(mib, variable) {
    var retvalues= [];// values to return
    
    try {
        
        var oidStr = GSM.snmp.getOID(mib, variable); // eg. '.1.3.6.1.4.1.9.9.691.1.1.2.1.1.0'
        
        if (oidStr.substring(oidStr.lastIndexOf(".") + 1) == "0") {// getOID() usually returns with a '.0' at the end
            oidStr = oidStr.substring(0, oidStr.lastIndexOf(".")); // remove ending '.0' -> '.1.3.6.1.4.1.9.9.691.1.1.2.1.1'
        }

        var myVar = GSM.snmp.getNextVB(mib, variable, 0);
 
        while (myVar.oid.indexOf(oidStr) != -1) {
            retvalues.push(myVar.value);
            myVar = GSM.snmp.getNextVB(myVar.oid);
        }
    } catch (ex) {
        log.error(host + " extractIndexedValuesInTable() - error: " + ex);
        throw ex;
    }

    return retvalues;
 }


/**
 * Convert a string like "69.77.49.56.55" -to-> "EM187".
 * @param asciiStr String of ascii codes dot separated like "69.77.49.56.55". 
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

/**
 * Trim a string. The one below is one of the fastest.
 * See http://blog.stevenlevithan.com/archives/faster-trim-javascript.
 * @return Example " hello " -> "hello"
 */
function trim(str) {
    if (!str) return str;
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}


/**
 * Udate a single alarm. This function is called from the poller and trap handler.
 * 
 * @param device A Device, kept by the TopologyReader.
 * @param resourceId Resource id to be shown as text on the alarm. May be blank. Eg "LAN/WAN 2"
 * @param probableCause alarm id. Used to locate the gsm alarm on the device, eg. 1067. 
 * @param severity Severity like ThomsonSeverityManager.MAJOR. Needs to be converted to the Gsm severity. 
 * @param specificProblem Additional textual info on the alarm. May be blank. Ex. 'Physical interfaces do not match'. 
 * @param alarmLabel Additional textual info on the alarm. May be blank. Ex. 'No CC in signal: line_index="284"'. 
 */
function updateAlarm(device, resourceId, probableCause, thomsonSeverity, alarmLabel, specificProblem) {
     
    log.debug("updateAlarm: " + device.name + " resId:" + resourceId + " probCause:" + probableCause 
            + " sev:" + thomsonSeverity + " specificProb:" + specificProblem);

    var alarmObj = new AlarmObj(resourceId, probableCause, thomsonSeverity, alarmLabel, specificProblem);
    
    // find alarm associated with device. genAlarmProbableCauseValues[i] may be, say 1075. From that, find the associated stack.
    var alarm = device.keyAlarms[parseInt(probableCause)];
    
    // If this is not a key alarm, put it in the non-key stack.
    if (alarm) { 
        
        // We have a key alarm because 
        if (thomsonSeverity === ThomsonSeverityManager.CLEAR_ALARM) {
            alarm.status = alarm.NORMAL;
            alarm.text = ""; 
        } else {
            alarm.text = alarmObj.text;
            alarm.status = alarmObj.severity.convertToGsm();
        }
    } else {
        /**
         * We are dealing with a Non-Key alarm
         */
        var alarmStack = undefined;
        if (thomsonSeverity === ThomsonSeverityManager.CLEAR_ALARM) {
            
            /**
             * We are clearing an alarm here
             */
        	var found = false;
        	
        	for (key in device.nonKeyAlarms) {
				alarmStack = device.nonKeyAlarms[key];
        		for (var i = 0; i < alarmStack.stack.length; i++) {
        			if (alarmObj.sameResourceAs(alarmStack.stack[i])) {
        				alarmStack.removeEvent(alarmObj);
        				found = true;
        				break;
        			}
        		}
        		
        		if (found) { // we have found alarmStack (and removed alarm). Exit loop now.
        			break;
        		}
        	}
            
        	if (!found) {
        	    log.warn("Not found alarm " + alarmObj.toString() + " for device " + device.toString());
        	    return;
        	}
            
        } else {
            
            /**
             * We are adding an alarm here
             */           
            // find the associated stack
            alarmStack = device.nonKeyAlarms[thomsonSeverity.convertToGsm()];
            if (alarmStack) {// may not exist. For example, we may not store the Notice type alarms
                alarmStack.addEvent(alarmObj);
            }
        }

        /**
         * We have updated the alarm stack.
         * Now we update the stack's gsmAlarms
         */
        if (!alarmStack) { // alarm stack not found
            return;
        }
        
        for (var j = 0; j < alarmStack.gsmAlarms.length; j++) {
            var thisAlarmObj = alarmStack.stack[j];
            var gsmAlarm = alarmStack.gsmAlarms[j];
            if (thisAlarmObj) {
                gsmAlarm.text = thisAlarmObj.text;
                gsmAlarm.status = thisAlarmObj.severity.convertToGsm();
            } else {
                gsmAlarm.status = GSM.alarm.NORMAL;
                gsmAlarm.text = "";
            }
        }
    } 
}

/**
 * Return easy to read contents of an array or an object. Example '[tom:111, b:[a:22, b:44], 2:[0:65, 1:57, 2:111]]'.
 * NOTE: This function does not work well with associative array:
 * NOTE: Need to understand why this function does not work with this form:
 *    var myvar = []; // note [] instead of {}
 *    myvar['.1'] = 22;
 *    myvar['.2.22'] = 44;
 *    print(arrayToString(myvar);
 * @param arr
 * @returns {String}
 */
function objToString(arr) {
    var retstr = "";
    for (key in arr) {
        if (arr.hasOwnProperty(key)) {
            var mykey = key; // assign to another variable. Looks like a bug in Rhino
            var myval = arr[mykey];
            var valuestr = (myval instanceof Array ? "[" + myval+ "]" : (myval instanceof Object ? arrayToString(myval) : myval));
            retstr += (retstr ? ", ":"") + mykey + ":" + valuestr;
        }
    }
    return "[" + retstr + "]";
}

/**
 * Filter a list by applying a filter function.
 * Example of use:
 *   var staticAlarms = filterList(alarmConfigManager.entries, function(item) {return item.type == 'static';});
 * @param list Any list
 * @param filterFunct Return item in list satisfies filterFunction
 * @param keyFunc Function that returns the key to the item in the returned array.
 * @return an array containing items that pass the filterFunct.
 */
function filterList(list, filterFunct, keyFunc) {
    var ret = [];    
    for (key in list) {
        var item = list[key];
        var takeItem = filterFunct(item);
        log.warn("+++++++++++++++++++++++++++++>>>" + key + " take item ? " + (takeItem?"Y":'N') + " --- " + item.toString());
        if (takeItem) {
            if (keyFunc) {
                log.warn("+++++++++++++++++++++++++++++>>> key used = " + keyFunc(item) + " -for-> " + item.toString());
                ret[keyFunc(item)] = item;
            } else {
                ret.push(item);
            }
        }
    }
    
    return ret;
}

//
//var extractIndexedValuesInTable = JsMockito.mockFunction("extractIndexedValuesInTable");
//JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementIndex').thenReturn([1,2,3,4]);
//JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementName').thenReturn(["XMU_01", "EM187", "NFP248", "MY-ANY-DEVICE"]);
//JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementParentIndex').thenReturn([0, 1, 1, 1]);
//JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementType').thenReturn([4, 16, 12, 13]); // device types
//JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementExtType').thenReturn([5, 9, 19, 888]);// device extTtypes
//
