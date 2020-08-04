/************************************************************************************
 * File: ThomsonXMS.js
 * Thomson XMS device driver.
 * 
 * Concepts:
 *    - a device is an instance of a device type. Devices are 
 *    - key alarms: device types have alarms associated with them (see thomsonAlarms.js) Those are key alarms.
 *    - non key alarms for a device: are any alarm that is not associated with the device type.
 *    - device type ANY-DEVICE: is a device type for unknown types. Any device with unknown types and exttypes will be assigned this type.
 *         The ANY-DEVICE exists because we may encounter unknown devices in the future, and we dont want to loose alarms.
 *         Devices with this type will not have Health and Signal alarms. Only the MiscAlarms (i.e. non-key alarms).
 *    - subdevices: are resources that exist in a device. The EM4008 have 8 subdevices: ENC1->ENC8.
 *        The subdevices are created using the subdeviceCreatorFunc. When an alarm or trap come, their names are
 *        extracted from the resourceId field via the resourceIdParserFunc.
 *
 * Devices are created in a hierarchy. Topology node contains information for us to construct the device hierarchy.
 * The root is always the XMS device
 * 
 *   XMS
 *     +---XMU_1
 *          +---Health
 *          |     +---Hardware Failure
 *          +---Signal
 *          |     +---Broadcast channel Failure
 *          |     +---Connection Establishment failure
 *          +---OtherAlarms (non-key)
 *          |     +---Major
 *          |     +---Warning
 *          |     +---Notice
 *          +---SubDevices
 *                +---NOC_Amethyst_01
 *                |    +---Health
 *                |    |      +---TR 101 First priority error
 *                |    |      +---High temperature
 *                |    +---Signal
 *                |    |      +---Connection Establishment failure
 *                |    |      +---No stream received
 *                |    +---Uncategorized
 *                |    |      +---Major
 *                |    |      +---Warning
 *                |    |      +---Notice
 *                |    +---SubDevices
 *                |           +---IpSwitch1
 *                |           |    +---Health
 *                |           |    +---Signal
 *                |           |         +---Signal Loss
 *                |           |         +---No stream received
 *                |           +---IpSwitch2
 *                |           +---...
 *                |           +---IpSwitch8
 *                |                +---Health
 *                |                +---Signal
 *                +---NOC_EM4000_01
 *                |    +---Health
 *                |    +---Signal
 *                |    +---OtherAlarms (non-key)
 *                |    +---SubDevices
 *                |         +---ENC1
 *                |         +---...
 *                |         +---ENC8
 *                +---NOC_EM4000_02
 *                     +---...
 *
 * 8 Nov 2013.
 */
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

//
//var extractIndexedValuesInTable = JsMockito.mockFunction("extractIndexedValuesInTable");
//JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementIndex').thenReturn([1,2,3,4]);
//JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementName').thenReturn(["XMU_01", "EM187", "NFP248", "MY-ANY-DEVICE"]);
//JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementParentIndex').thenReturn([0, 1, 1, 1]);
//JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementType').thenReturn([4, 16, 12, 13]); // device types
//JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementExtType').thenReturn([5, 9, 19, 888]);// device extTtypes
//
/************************************************************************************
 * File: deviceTypes.js
 * Device and DeviceType objects.
 * Concepts:
 *    - a device is an instance of a device type. Devices are 
 *    - key alarms: device types have alarms associated with them (see thomsonAlarms.js) Those are key alarms.
 *    - non key alarms for a device: are any alarm that is not associated with the device type.
 *    - device type ANY-DEVICE: is a device type for unknown types. Any device with unknown types and exttypes will be assigned this type.
 *         The ANY-DEVICE exists because we may encounter unknown devices in the future, and we dont want to loose alarms.
 *         Devices with this type will not have Health and Signal alarms. Only the MiscAlarms (i.e. non-key alarms).
 *    - subdevices: are resources that exist in a device. The EM4008 have 8 subdevices: ENC1->ENC8.
 *        The subdevices are created using the subdeviceCreatorFunc. When an alarm or trap come, their names are
 *        extracted from the resourceId field via the resourceIdParserFunc.
 *
 * Devices are created in a hierarchy. Topology node contains information for us to construct the device hierarchy.
 * The root is always the XMS device
 * 
 *   XMS
 *     +---XMU_1
 *          +---Health
 *          |     +---Hardware Failure
 *          +---Signal
 *          |     +---Broadcast channel Failure
 *          |     +---Connection Establishment failure
 *          +---OtherAlarms (non-key)
 *          |     +---Major
 *          |     +---Warning
 *          |     +---Notice
 *          +---SubDevices
 *                +---NOC_Amethyst_01
 *                |    +---Health
 *                |    |      +---TR 101 First priority error
 *                |    |      +---High temperature
 *                |    +---Signal
 *                |    |      +---Connection Establishment failure
 *                |    |      +---No stream received
 *                |    +---Uncategorized
 *                |    |      +---Major
 *                |    |      +---Warning
 *                |    |      +---Notice
 *                |    +---SubDevices
 *                |           +---IpSwitch1
 *                |           |    +---Health
 *                |           |    +---Signal
 *                |           |         +---Signal Loss
 *                |           |         +---No stream received
 *                |           +---IpSwitch2
 *                |           +---...
 *                |           +---IpSwitch8
 *                |                +---Health
 *                |                +---Signal
 *                +---NOC_EM4000_01
 *                |    +---Health
 *                |    +---Signal
 *                |    +---OtherAlarms (non-key)
 *                |    +---SubDevices
 *                |         +---ENC1
 *                |         +---...
 *                |         +---ENC8
 *                +---NOC_EM4000_02
 *                     +---...
 *
 * 8 Nov 2013.
 */
function Device(name, type) {
    this.name = name;
    this.parent = undefined;
    this.type = type;// DeviceType object. Not an integer.
    this.keyAlarms = []; // keyed on alarm id. Contains alarm stacks.
    this.nonKeyAlarms = []; // keyed on the alarm 
    
    this.toString = function() {
        return name;
    };
    
    /**
     * Compose the path to device. Basically goes up the hierarchy to the XMS.
     * Example, "XMS/SubDevices/XMU_01/SubDevices/EM187" for the EM187 device.
     */
    this.path = function() {
        var dev = this;
        var path = "";
        
        // Go up the device hierarchy via the parent link
        while (dev) {
            path = dev.name + (path ? "/SubDevices/" : "") + path;
            dev = dev.parent;
        }       
        return path;
    };
};

/**
 * Type, extType corresponds to topoElementType,topoElementExtType in the mib.
 * 
 *   Devices             Type                          Ext type
 *   ---------------     -----------------------       --------
 *   XMU                 4 (mediation unit)            5
 *   EM4008              16 (HD or HD/SD Encoder)      9
 *   Sapphire            22 (Server)                   4
 *   Amethyst châssis    96 (multiple switch)          1    Not entered
 *   Amethyst IP         12 (switch/router)            25
 *   Amethyst ASI        12 (switch/router)            19
 *   NetProcessor 9030   2 (multiplexor)               1
 *   Netprocessor 9040   2 (multiplexor)               3
 *   CP6000 châssis      95 (contribution platform)    1    CP6000 all have the same alarms   
 *   CP6000 Encoder      95 (contribution platform)    4
 *   CP6000 Decoder      95 (contribution platform)    5
 * 
 */
function DeviceType(type, extType, name, alarmDeviceType, subDevicesCreatorFunc, resourceIdParserFunc) {
    this.type = type;
    this.extType = extType;
    this.name = name;
    this.alarmDeviceType = alarmDeviceType;// type containing alarms for this type.(The type itself does not have alarms defined for it.)
    this.subDevicesCreatorFunc = subDevicesCreatorFunc;// function that creates subdevices for devices of this type (ex. EM4008)
    this.resourceIdParserFunc = resourceIdParserFunc;// function that parses the resourceId values to extract the subdevice name, ex. "ENC3".
    this.alarms = []; // list of alarms for device type. Set by AlarmManager.
    this.addAlarm = function(alarm) {
        this.alarms.push(alarm);
    };
    
    this.toString = function() {
        return name;
    };
}

/**
 * Device Manager.
 */
function DeviceManagerCtor() {
   
    this._map = []; // map of devices keyed on type+":"+extType. Example "12:19" for Amethyst ASI.

    /**
     * Create the device and put it in the device map
     */
    this.create = function(type, extType, name, alarmDeviceType, subdevicesCreatorFunc, resourceIdParserFunc) {
        var device = new DeviceType(type, extType, name, alarmDeviceType, subdevicesCreatorFunc, resourceIdParserFunc);
        this._map[makeKey(type, extType)] = device;
        return device;
    };
    
    this.XMS = this.create(0, 0, "XMS");

    this.NetProcessor9030 = this.create(2, 1, "NetProcessor9030");
    this.NetProcessor9040 = this.create(2, 3, "NetProcessor9040");
    
    this.XMU = this.create(4, 5, "XMU");
    
    this.NVISION_ROUTER = this.create(12, 7, "NVISION_ROUTER");// example NOC_NVision_Router     
    this.AmethystIP = this.create(12, 25, "AmethystIP");
    this.AmethystASI = this.create(12, 19, "AmethystASI");
    this.NEVION_SWITCH = this.create(12, 29, "NEVION_SWITCH");// NEVION_SWITCH: ext32, NVISION_ROUTER
    this.NEVION_SWITCH_RESOURCE = this.create(12, 32, "NEVION_SWITCH_RESOURCE", this.NEVION_SWITCH);// NEVION_SWITCH: ext32, NVISION_ROUTER

    this.IP_SWITCH = this.create(13, 0, "IP_SWITCH");//ex, NOC_IP_SWITCH_MAIN,NOC_FSYNC
    this.IP_SWITCH2 = this.create(13, 1, "IP_SWITCH");// example NOC_RTR_SRC
    
    this.EM4008 = this.create(16, 9, "EM4008", undefined, em4008SubDevicesCreator, em4008ResourceIdParser);
    this.EM4008_ENC = this.create(16, -9, "EM4008-Encoder", this.EM4008);// EM4008 resource ('subdevice').
    
    
    this.Sapphire = this.create(22, 4, "Sapphire");// WJCT_Sapphire   
    
    //this.CP6000Chassis = this.create(95, 1, "CP6000Chassis");
    this.CP6000Chassis = this.create(95, 1, "CP6000Chassis");//ex WJCT_CP6000, NOC_CP6000_01
    this.CP6000Encoder = this.create(95, 4, "CP6000Encoder", this.CP6000);//ex WJCT_CP6000_mpeg_enc_04
    this.CP6000Decoder = this.create(95, 5, "CP6000Decoder", this.CP6000);//NOC_CP6000_01_mpeg_dec_02
    
    this.AmethystChassis = this.create(96, 1, "AmethystChassis");// NOC_Amethyst_01
    
    this.ANY_DEVICE = this.create(undefined, undefined, "ANY-DEVICE");// any unknown type of device

    /**
     * Find the device type.
     * Should be able to find specific (ie. with type&exttype) first,
     * then less specific (ie. exttype not given, like the CP6000, IP_SWITCH).
     * If not found create
     */ 
    this.find = function(type, extType) {
        var obj = this._map[makeKey(type, extType)];
        
        if (!obj) {// if specific search not successful, search by type only.
            obj = this._map[type];
        }
        return obj ? obj : this.ANY_DEVICE;
    };

    // Compose device key using "type:extType". Example "12:19" for Amethyst ASI.
    // For CP6000, the key is simply "95" because for that device, extType is not relevant.
    function makeKey(type, extType) {
        return type + (extType ? ":" + extType : "");
    }
}


/**
 * Function that creates subdevices for the EM4008. The subdevices type is EM4008_ENC.
 * Note: Currently, only the EM4008 behaves this way. The CP6000Chassis has subdevices, but those subdevices are 'regular' devices.
 * @param parentDevice Device for which we wish to create subdevices for
 * @return the list of subdevices created
 */
function em4008SubDevicesCreator(em4008Device) {
    var list = [];
    for (var i = 0; i < 8; i++) {
        var subdevice = new Device("ENC" + (i + 1), DeviceManager.EM4008_ENC);
        subdevice.parent = em4008Device;
        list[i] = subdevice;
    }
    return list;
}

/**
 * The EM4008 resourceId values contains the encoder value, like "ENC6" in "ENC6/VIDEO.IN".
 * We have ENC1->ENC8.
 * Examples:
 *  genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.827:-->ENC6/VIDEO.IN
 *  genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.828:-->ENC5/VBI
 *  
 * @param resourceIdValue Like "ENC6/VIDEO.IN".
 * @return the ENC id, like "ENC6". Returns undefined if the "/" is not found or resourceIdValue does not start with "ENC".
 */
function em4008ResourceIdParser(resourceIdValue) {
    if (!resourceIdValue) {// We expect resourceIdValue to start with "ENC"
        return undefined;
    }
    
    var myRe = /^(ENC[1-8])\/(.*)/;
    var extract = myRe.exec(resourceIdValue);
    return extract ? extract[1] : undefined;
}

/************************************************************************************
 * File: thomsonAlarms.js
 * Alarms associated with the ThomsonXMS device.
 * 8 Nov 2013.
 */


/**
 * Class ThomsonSeverity
 * @param value
 * @param name
 * @param toGsmFct Conversion to GSM severity
 */
function ThomsonSeverityCtor(value, name) {
    this.value = value;
    this.name = name;
    
    this.compareTo = function(anotherSev) { // >1 is more severe, 0 = same, <1 is less severe
        return this.value - anotherSev.value;// based on numeric value
    };
    
    this.convertToGsm = function() {
        switch (this.value) {
        case 1:  return GSM.alarm.NORMAL; // inform(1)
        case 2:  return GSM.alarm.MINOR; // indeterminate(2)
        case 3:  return GSM.alarm.MINOR; // warning(3)
        case 4:  return GSM.alarm.MINOR; // minor(4)
        case 5:  return GSM.alarm.MAJOR; // major(5)
        case 6:  return GSM.alarm.ERROR; // critical(6)
       default: 
            log.error("Unknown severity " + severity);
            return GSM.alarm.UNKNOWN;
        }
    };

    
   // Note: Test code depends on toString(). If you modify, please also modify the tests.
   this.toString = function() {
        return name;
    }; 
 }


/**
 * Manages the severities related to Prostream.
 */

function ThomsonSeverityManagerCtor() {
        
    this.CLEAR_ALARM = new ThomsonSeverityCtor(-1, "CLEAR_ALARM");
    this.INFORM = new ThomsonSeverityCtor(1, "INFORM");
    this.INDETERMINATE = new ThomsonSeverityCtor(2, "INDETERMINATE");
    this.WARNING = new ThomsonSeverityCtor(3, "WARNING");
    this.MINOR = new ThomsonSeverityCtor(4, "MINOR");
    this.MAJOR = new ThomsonSeverityCtor(5, "MAJOR");
    this.CRITICAL = new ThomsonSeverityCtor(6, "CRITICAL");

    /**
     * Return the Thomson severity given its value.
     */
    this.get = function(value) {
        switch (value) {
        case -1:  return this.CLEAR_ALARM; // We arbitrarily put value -1. In fact it is 1!!!
        case 1:  return this.INFORM; // inform(1)
        case 2:  return this.INDETERMINATE; // (2)
        case 3:  return this.WARNING; // warning(3)
        case 4:  return this.MINOR; // minor(4)
        case 5:  return this.MAJOR; // major(5)
        case 6:  return this.CRITICAL; // critical(6)
        default: return undefined;
        };
    };
        
    /**
     * Converts a string severity like "severityMajor(5)" --to--> ThomsonSeverityManager.MAJOR.
     * See 'genAlarmSeverity' in the Mib.
     *  
     *     genAlarmSeverity OBJECT-TYPE
     *          SYNTAX       INTEGER {
     *                                 severityIndeterminate(2),
     *                                 severityWarning(3),
     *                                 severityMinor(4),
     *                                 severityMajor(5),
     *                                 severityCritical(6)
     *                               }
     *                               
     *  Note: We add the genEventSeverity "severityCleared(1)" for convenience!!
     */
    this.convertSeverityValueToThomsonSeverity = function(genAlarmSeverity) {
        switch(genAlarmSeverity) {
        case "severityCleared(1)": return this.CLEAR_ALARM; // used in traps to clear alarms
        case "severityIndeterminate(2)": return this.INDETERMINATE;
        case "severityWarning(3)": return this.WARNING;
        case "severityMinor(4)": return this.MINOR;
        case "severityMajor(5)": return this.MAJOR;
        case "severityCritical(6)": return this.CRITICAL;
        default: return undefined;
        }
    };
};

/**
 * Alarm categories.
 */
function AlarmCategoryCtor(name, value) {
    this.name = name;
    this.value = value;
}

var AlarmCategory = {
        
        COMMUNICATIONS: new AlarmCategoryCtor("Communications", 1),
        QOS: new AlarmCategoryCtor("Quality Of Service", 2),
        PROCESSING_ERROR: new AlarmCategoryCtor("Processing Error", 3),
        EQUIPMENT: new AlarmCategoryCtor("Equipment", 4),
        ENVIRONMENTAL: new AlarmCategoryCtor("Environmental", 5),
        
        /**
         * Return the Thomson severity given its value.
         */
        get: function(value) {
            switch (value) {
            case 1:  return this.COMMUNICATIONS;
            case 2:  return this.QOS;
            case 3:  return this.PROCESSING_ERROR;
            case 4:  return this.EQUIPMENT;
            case 5:  return this.ENVIRONMENTAL;
            default: return null;
            };
        }
};



/**
 * Thomson gave us a list of 'key' alarms in document "WJCT Project Thomson XMS Key Alarms list" (V1.0).
 * Those alarms have their own alarm slot in the Alarm Browser (next to their devices).
 * The non-key alarms will be shown in a stacked list of alarms 
 * 
 *   XMS
 *    +---AmethystASI
 *    |    +----Health
 *    |    |       +----No stream received
 *    |    +----Signal
 *    |            +----TR 101 First priority error
 *    +---XMU
 *         +----EM4008
 *         |      +----Health
 *         |      |       +----lossOfSynch  ASI in 1 (MAJOR
 *         |      |       +----powerSupplyFail
 *         |      +----Signal                     +----------------+
 *         |              +----No stream received |ASI in 1 (Major)|
 *         |              +----FramingError       +----------------+
 *         |
 *         +----Sapphire
 *         |      +----Health                 +-----------------+
 *         |      |       +----Resource error |LAN/WAN 1 (Minor)|
 *         |      |                           +-----------------+
 *         |      +----Signal
 *         |              +----No stream received
 *         |              +----FramingError
 *         |
 *         +-----Non-key alarms                     <--------- stack of non-key alarms
 *                 +------Critical
 *                 +------Major
 *                 +------Minor
 *
 */
function ThomsonAlarmCtor(id, name, category, defaultSev) {
    this.id = id;// is the 'probableCause'.
    this.name = name;
    this.category = category;
    this.defaultSev = defaultSev;
};

function AlarmManagerCtor() {
    
    /**
     * Alarm list.
     * These are the "key" alarms as defined by the "Key Alarms List" from Thomson.
     * We don't need to enter the non-key alarms.
     */
    this.alarmList = [
        create(8, "lossOfSignal", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040, DeviceManager.CP6000Chassis]),
        create(17, "receiveFailure", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040]),
        create(22, "connectionEstablishmentError", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU, DeviceManager.AmethystIP, DeviceManager.AmethystASI, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040, DeviceManager.CP6000Chassis]),
        create(26, "routineFailure", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.CRITICAL, [DeviceManager.CP6000Chassis]),
        create(56, "multiplexorProblem", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040]),
        create(58, "powerProblem", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008]),
        create(62, "replaceableUnitMissing", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.CRITICAL, [DeviceManager.EM4008, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040, DeviceManager.CP6000Chassis]),
        create(63, "replaceableUnitTypeMismatch", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.CRITICAL, [DeviceManager.XMU, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040, DeviceManager.CP6000Chassis]),
        create(64, "synchronizationSourceMismatch", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.CP6000Chassis]),
        create(73, "diskFailure", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.XMS, DeviceManager.XMU, DeviceManager.Sapphire]),
        create(76, "lossOfSynchronisation", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.XMS, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040]),
        create(78, "powerSupplyFailure", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.CRITICAL, [DeviceManager.XMS, DeviceManager.XMU, DeviceManager.AmethystASI, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040, DeviceManager.CP6000Chassis]),
        create(107, "coolingFanFailure", AlarmCategory.ENVIRONMENTAL, ThomsonSeverityManager.MAJOR, [DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040]),
        create(123, "highTemperature", AlarmCategory.ENVIRONMENTAL, ThomsonSeverityManager.CRITICAL, [DeviceManager.EM4008, DeviceManager.AmethystASI, DeviceManager.CP6000Chassis]),
        create(154, "outOfCPUCycles", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.CRITICAL, [DeviceManager.EM4008,DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040]),
        create(160, "configurationOrCustomisationError", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.CRITICAL, [DeviceManager.EM4008, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040, DeviceManager.CP6000Chassis]),
        create(164, "softwareError", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.CRITICAL, [DeviceManager.XMU, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040, DeviceManager.CP6000Chassis]),
        create(514, "equipmentMalfunction", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.CRITICAL, [DeviceManager.AmethystASI]),
        create(532, "performanceDegraded", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.CRITICAL, [DeviceManager.XMU]),
        create(548, "temperatureUnacceptable", AlarmCategory.ENVIRONMENTAL, ThomsonSeverityManager.MAJOR, [DeviceManager.XMS, DeviceManager.XMU]),
        create(1030, "streamError", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008, DeviceManager.CP6000Chassis]),
        create(1031, "streamOverflow", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008, DeviceManager.AmethystIP, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040]),
        create(1045, "unlockedPLL", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040]),
        create(1064, "videoStandardMismatch", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008, DeviceManager.CP6000Chassis]),
        create(1067, "linkDown", AlarmCategory.ENVIRONMENTAL, ThomsonSeverityManager.MAJOR, [DeviceManager.XMS, DeviceManager.EM4008, DeviceManager.CP6000Chassis]),
        create(1072, "lossOfTSSynchro", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040, DeviceManager.CP6000Chassis]),
        create(1073, "unrecoverableErrors", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.CP6000Chassis]),
        create(1075, "hardwareFailure", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.CRITICAL, [DeviceManager.XMU, DeviceManager.EM4008, DeviceManager.AmethystASI, DeviceManager.CP6000Chassis]),
        create(1076, "ventilationFailure", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.CRITICAL, [DeviceManager.XMS, DeviceManager.XMU, DeviceManager.EM4008, DeviceManager.AmethystASI, DeviceManager.CP6000Chassis]),
        create(1078, "ridCorrupted", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.CRITICAL, [DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040]),
        create(1083, "storageUnitMissing", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU]),
        create(1098, "rebooting", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008, DeviceManager.CP6000Chassis]),
        create(1099, "diskControllerFailure", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.Sapphire]),
        create(1108, "functionNotOperating", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008, DeviceManager.AmethystIP]),
        create(1175, "configurationInconsistency", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.CRITICAL, [DeviceManager.XMU, DeviceManager.EM4008, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040]),
        create(1183, "unvalidSavedConfiguration", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.CRITICAL, [DeviceManager.XMU, DeviceManager.EM4008, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040]),
        create(1199, "unvalidOption", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU, DeviceManager.AmethystASI, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040]),
        create(1209, "rejectedConfiguration", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MAJOR, [DeviceManager.XMS, DeviceManager.XMU, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040]),
        create(1222, "resourceError", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.CRITICAL, [DeviceManager.Sapphire]),
        create(1238, "tr_101_290_FirstPriorityError", AlarmCategory.QOS, ThomsonSeverityManager.CRITICAL, [DeviceManager.AmethystIP, DeviceManager.AmethystASI, DeviceManager.CP6000Chassis]),
        create(1239, "tr_101_290_SecondPriorityError", AlarmCategory.QOS, ThomsonSeverityManager.CRITICAL, [DeviceManager.AmethystIP, DeviceManager.AmethystASI]),
        create(1242, "errorCorrectionGenerationFailure", AlarmCategory.QOS, ThomsonSeverityManager.MAJOR, [DeviceManager.AmethystIP]),
        create(1287, "noStreamReceived", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.AmethystIP, DeviceManager.AmethystASI, DeviceManager.NetProcessor9030, DeviceManager.NetProcessor9040, DeviceManager.CP6000Chassis]),
        create(1352, "errorCorrectionFailure", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.AmethystIP]),
        create(1577, "configurationMismatch", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MAJOR, [DeviceManager.XMS]),
    
    /**
     * ==============================================================
     * "Cool" alarms.
     * Non-yellow alarms.
     */
    /*
    this.degradedSignal = create(3, "degradedSignal", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MINOR, [DeviceManager.XMU], null),
    this.broadcastChannelFailure = create(21, "broadcastChannelFailure", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    this.backplaneFailure = create(51, "degradedSignal", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    this.ioDeviceError = create(75, "ioDeviceError", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    
    this.lowBatteryThreshold = create(112, "lowBatteryThreshold", AlarmCategory.ENVIRONMENTAL, ThomsonSeverityManager.MINOR, [DeviceManager.XMU], null),
    this.storageCapacityProblem = create(151, "storageCapacityProblem", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    this.corruptData = create(153, "corruptData", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008], null),
    this.sfwrDownloadFailure = create(156, "sfwrDownloadFailure", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008], null),
    this.lossOfRealTime = create(157, "lossOfRealTime", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008], null),
    this.fileError = create(162, "fileError", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    this.underlyingResourceUnavailable = create(166, "underlyingResourceUnavailable", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.CRITICAL, [DeviceManager.XMS], null),
    
    this.excessiveResponseTime = create(204, "underlyingResourceUnavailable", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.WARNING, [DeviceManager.XMS], null),
    
    this.communicationsProtocolError = create(504, "communicationsProtocolError", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    
    this.duplicateInformation = create(605, "duplicateInformation", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008], null),
    this.unauthorizedAccessAttempt = create(614, "unauthorizedAccessAttempt", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    
    this.lossOfStream = create(1029, "lossOfStream", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.WARNING, [DeviceManager.EM4008], null),
    this.noPCMInSignal = create(1044, "NoPCMInSignal", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MINOR, [DeviceManager.EM4008], null),
    this.noTeletextInSignal = create(1046, "noTeletextInSignal", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.WARNING, [DeviceManager.EM4008], null),
    this.noTCInSignal = create(1051, "noTCInSignal", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.WARNING, [DeviceManager.EM4008], null),
    this.noAFDInSignal = create(1052, "noAFDInSignal", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.WARNING, [DeviceManager.EM4008], null),
    this.noEDInSignal = create(1053, "noEDInSignal", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.WARNING, [DeviceManager.EM4008], null),
    this.noEmbeddedSignal = create(1062, "noEmbeddedSignal", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MINOR, [DeviceManager.EM4008], null),
    this.badEmbeddedSignal = create(1063, "badEmbeddedSignal", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MINOR, [DeviceManager.EM4008], null),
    this.halfDuplexMode = create(1068, "halfDuplexMode", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MINOR, [DeviceManager.EM4008], null),
    this.rtcBatteryFailure = create(1077, "rtcBatteryFailure", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MINOR, [DeviceManager.EM4008], null),

    this.writeProtectedStorageUnit = create(1084, "writeProtectedStorageUnit", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MINOR, [DeviceManager.XMU], null),
    this.unstableConfig = create(1085, "unstableConfig", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MINOR, [DeviceManager.XMU], null),
    this.channelError = create(1095, "unstableConfig", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    this.diskControllerFailure = create(1099, "diskControllerFailure", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    
    this.caDataRejected = create(1100, "caDataRejected", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    this.offLineMode = create(1106, "offLineMode", AlarmCategory.EQUIPMENT, ThomsonSeverityManager.MINOR, [DeviceManager.XMU], null),
    this.logOverflow = create(1184, "logOverflow", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MINOR, [DeviceManager.XMS, DeviceManager.XMU], null),
    this.optionMismatch = create(1197, "optionMismatch", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MINOR, [DeviceManager.XMS], null),
    this.optionMissing = create(1198, "optionMissing", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MINOR, [DeviceManager.XMS, DeviceManager.EM4008], null),
    
    this.socketError = create(1208, "socketError", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    this.snmpError = create(1210, "snmpError", AlarmCategory.PROCESSING_ERROR, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    this.badBitrate = create(1231, "badBitrate", AlarmCategory.QOS, ThomsonSeverityManager.WARNING, [DeviceManager.EM4008], null),
    this.unreachableDestination = create(1278, "unreachableDestination", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU, DeviceManager.EM4008], null),
    this.deviceTypeMismatch = create(1295, "deviceTypeMismatch", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    
    this.controlCommandConflict = create(1309, "controlCommandConflict", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.XMU], null),
    this.noValidBitRateAllocationReceived = create(1329, "noValidBitRateAllocationReceived", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008], null),
    this.detectedSilence = create(1330, "detectedSilence", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008], null),
    this.saturatedSignal = create(1331, "saturatedSignal", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008], null),
    this.noExpectedStandardInSignal = create(1336, "noExpectedStandardInSignal", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008], null),
    this.unsuitableLinkSpeed = create(1339, "unsuitableLinkSpeed", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MINOR, [DeviceManager.EM4008], null),
    this.noADControlTrackInSignal = create(1348, "noADControlTrackInSignal", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.MAJOR, [DeviceManager.EM4008], null),
    this.systemSwitch = create(1350, "systemSwitch", AlarmCategory.COMMUNICATIONS, ThomsonSeverityManager.WARNING, [DeviceManager.XMS], null)
    */
    
    ];
    
    /**
     * Create the alarm and associate it to the device types given.
     */
    function create(id, name, category, defaultSev, deviceTypeList) {
        var alarm = new ThomsonAlarmCtor(id, name, category, defaultSev);
        
        for (var i = 0; i < deviceTypeList.length; i++) {
            deviceTypeList[i].addAlarm(alarm);
        }

        return alarm;
    }
    

};
/************************************************************************************
 * File: alarmStack.js
 * Implements the stacking of alarms.
 * 8 Nov 2013.
 */

/**
 * Alarm objects that are kept in alarm stacks.
 * @param resourceId resource id (like "LANWAN 1"). May be undefined.
 * @param alarmId alarm id like 73. Is never undefined.
 * @param severity. Severity object, must implement the compareTo() function. 
 *              Set to device severity (ex. ThomsonSeverityManager.MAJOR), not gsm severity (like alarm.MAJOR).
 * @param specificProb From Mib: "Significant for alarm : Additional information that provide furthers explanations for the probable cause"
 * @param alarmLabel From Mib: "Clear description of the event"
 */
function AlarmObj(resourceId, alarmId, severity, alarmLabel, specificProb) {
    this.resourceId = resourceId;
    this.alarmId = alarmId;
    this.severity = severity;
    this.text = alarmLabel + (specificProb ? ". " + specificProb : "");
    
    /**
     * compare to another obj. See if they both represent the same resourceId (and alarmId)
     * For example, before adding a new alarm, check if another alarm exists for the same resourceId.
     */
    this.sameResourceAs = function(other) {
        
        // verify resourceId equality
        if (this.resourceId) {
            if (!other.resourceId) {
                return false;
            }
            
            if (this.resourceId != other.resourceId) {
                return false;
            }
        } else if (other.resourceId) {
            return false;
        }
       
        // check alarm id
        return this.alarmId == other.alarmId;
    };
    
    
    // toString, example "['LANWAN 1', 73]".
    this.toString = function() {
        return "[" + this.resourceId + ", " + this.alarmId + ", " + this.severity.toString() + "]";
    };
}

/**
 * Alarm holder keeps a stack (==arrays) of alarms (for an alarm type.
 * 
 * 
 * Function getStack(category) returns an array of alarms per category ordered by severity:
 * Example:
 *   1. Empty
 *   2. Add alarm (A, Hi)    [A]           
 *   3. Add alarm (B, Hi)    [B, A]
 *   4. Add alarm (C, Med)   [B, A, C]
 *   5. Remove alarm A       [B, C]
 *   5. Add alarm (D, low)   [B, C, D]
 * 
 *  @param stackName The stackName is just for debugging purpose. Is usually the device name.
 *  @param ownerAlarm Alarm for which this stack exist. It is blank for a non-key alarm stack.
 *  @param timeToLiveSecs ttl for the lower severity alarms like INFORM, NOTICE. Set by severityCutoffLevel.
 *  @param dropOldAlarms Keep stack and gsm list length equal (drop alarm when it is pushed out of gsm stack.
 *  @params gsmAlarms gsm alarms table
 */
var MAX_STACK_LENGTH = 20;// default length. Modified by dropOldAlarms.

var synchronize = synchronize || function(func) {
    return new Packages.org.mozilla.javascript.Synchronizer(func);
};

function AlarmStack(stackName, gsmAlarms) {
    this.stackName = stackName;
    this.stack = []; // list of alarms, ordered by severity and chronology. Top of stack is at index 0. 
    this.gsmAlarms = gsmAlarms;
    this.timeToLiveMsecs = 600 * 1000;// Defaults to 10 minutes
    this.dropOldAlarms = false; // if false, we keep a long stack. If true, stack length = gsmAlarm length.
    this.severityCutoffLevel = ThomsonSeverityManager.INDETERMINATE; // level at which we clean by age
    
    /**
     * Remove this alarm.
     */
    var scope = this;

    function removeEventNoSynch(alarmObj) {
        var index = findElem(scope, alarmObj);
        if (index == -1) {
            log.info("Cannot find alarm " + alarmObj.toString() + "! (may have been removed)"); // a new alarm may have pushed it out
        } else {
            scope.stack.splice(index, 1); // remove element
        }
    }


    /**
     *  New alarm to add.
     */
    function addEventNoSynch(alarmObj) {    
        
        // first remove alarm for same resource and alarmId if it exists
        var elemIndex = findElem(scope, alarmObj);
        if (elemIndex != -1) {
            scope.stack.splice(elemIndex, 1); // remove element
        }
        
        // add new alarm
        //var newElem = new AlarmEvent(alarmType, sev, text);
        var insertAt = findInsertionPoint(scope, alarmObj);
        scope.stack.splice(insertAt, 0, alarmObj);
        
        // after inserting, remove tail elements if needed
        if (scope.dropOldAlarms) {
            cleanupByLength(scope);
        }
    };
    
    /**
     * Remove old entries.
     * Invoked here when events too old need to be removed, or stack longer than max.
     * @param timeToLive how long we keep the alarms (NOTICE and INFORM only)
     * @param severityLevel severity level at which we cleanup. 
     */
    
    function cleanupNoSynch() {
        cleanupByAge(scope);
        cleanupByLength(scope);
    };

    this.cleanup = synchronize(cleanupNoSynch);
    this.addEvent = synchronize(addEventNoSynch);
    this.removeEvent = synchronize(removeEventNoSynch);

    /**
     * Remove old items.
     */
    function cleanupByAge(that) {
        
        // remove old entries
        var now = new Date();
        for (var i = 0; i < that.stack.length; i++) {
            var alarmEvent = that.stack[i];
            
            // we only cleanup NOTICE and INFO events
            if (alarmEvent.severity.compareTo(that.severityCutoffLevel) > 0) {
                continue;
            }
            
            var elapsed = now.getTime() - alarmEvent.lastUpdate.getTime(); // in millisecs
            if (elapsed > scope.timeToLiveMsecs) {
                that.stack.splice(i, 1); // remove event
            }
        }
    }
     
    /**
     * Keep the stack short.
     */
    function cleanupByLength(that) {        
        var maxlen = that.dropOldAlarms ? that.gsmAlarms.length: MAX_STACK_LENGTH;
        
        if (that.stack.length > maxlen) {
            that.stack.splice(maxlen, that.stack.length - maxlen); // remove tail items
        }
    };
     
    /**
     * find the alarm with the category id and alarm id.
     * Return the index of elem found
     */
    function findElem(that, alarmObj) {
        for (var i = 0; i < that.stack.length; i++) {
            if (that.stack[i].sameResourceAs(alarmObj)) {
                return i;
            } 
        }
        return -1;// did not find alarm
    }
    
    /**
     * Find the place to insert alarm given the severity.
     * (more severe items are at top of stack)
     */
    function findInsertionPoint(that, alarmObj) {
        for (var i = 0; i < that.stack.length; i++) {
            if (alarmObj.severity.compareTo(that.stack[i].severity) >= 0) {
                return i;
            } else {
                continue;
            }
        }
        return that.stack.length; // insert at end
    }

    /**
     * Prints the list of alarms.
     * Example "MystackName[Alarm1-HI, Alarm2-Med]".
     * Note: Test code depends on toString(). If you modify, please also modify the tests.
     */
    this.toString = function() {
        var buf = this.stackName + "[";
        for (var i = 0; i < this.stack.length; i++) {
            buf += this.stack[i].toString() + (i < this.stack.length -1 ? ", ":"");
        }
        buf += "]";
        return buf;
    };
}


/************************************************************************************
 * File: topoReader.js
 * Reads the topology element of the miband builds the device hierarchy.
 * 
 *      XMS
 *       +---XMU_01
 *            +----EM187
 *            +----NFP248
 *            
 * 8 Nov 2013.
 */

/**
 *    TopoElementEntry ::=  SEQUENCE {
 *       topoElementIndex                      Unsigned32,
 *           topoElementName                   DisplayString,
 *           topoElementType                   Unsigned32,
 *           topoElementExtType                Unsigned32,
 *           topoElementParentIndex            Unsigned32,
 *           topoElementMaintenanceStatus      INTEGER,
 *           topoElementIdleStatus             INTEGER,
 *           topoElementOfflineStatus          INTEGER,
 *           topoElementRid                    DisplayString
 *         }
 *
 */
function TopologyReaderCtor(plugin) {
    this._rootXMSDevice = new Device(DeviceManager.XMS.name, DeviceManager.XMS); // create the root device which is the XMS itself.
    this._devicesByName = []; // list of devices indexed by device name
    this._devicesByIndex = [];// list of devices indexed by device index (device index are sequential. No holes)
    this.deviceList = this._devicesByIndex; // return list of devices.
    this.plugin = plugin;

    /**
     * Reads the topology element, and create the device hierarchy, like below:
     * 
     *      XMS
     *       +---XMU_01
     *            +----EM187
     *            +----NFP248
     * 
     * Here's a sample walk of the topologyElementTable to create the above hierarchy:
     *   topoElementIndex.1:-->1
     *   topoElementIndex.2:-->2
     *   topoElementIndex.3:-->3
     *   topoElementName.1:-->XMU_01
     *   topoElementName.2:-->EM187
     *   topoElementName.3:-->NFP248
     *   topoElementParentIndex.1:-->0
     *   topoElementParentIndex.2:-->1
     *   topoElementParentIndex.3:-->1
     */
    this.readTopology = function () {
        var mibIndices = extractIndexedValuesInTable(this.plugin.mib, 'topoElementIndex');
        var mibNames =  extractIndexedValuesInTable(this.plugin.mib, 'topoElementName');
        var mibParents =  extractIndexedValuesInTable(this.plugin.mib, 'topoElementParentIndex');
        var mibTypes =  extractIndexedValuesInTable(this.plugin.mib, 'topoElementType');
        var mibExtTypes =  extractIndexedValuesInTable(this.plugin.mib, 'topoElementExtType');
        
        /**
         * Now loop over the values read, and create devices and hierarchy.
         */
        this._devicesByName[this._rootXMSDevice.name] = this._rootXMSDevice; // Put the XMS as the root
        this._devicesByIndex[0] = this._rootXMSDevice;// NOTE: We assume that [0] is not used!!! Indices in the mib start at 1!
        
        // Loop over the mib values to create the devices
        for (var i = 0; i < mibIndices.length; i++) {
            var name = mibNames[i];
            var type = DeviceManager.find(mibTypes[i], mibExtTypes[i]);
            if (!type) {               
                throw "Type not found for device " + name + " type=" + mibTypes[i] + " extType=" + mibExtTypes[i];
            }
            
            var device = new Device(name, type);
            this._devicesByName[name] = device;
            this._devicesByIndex[mibIndices[i]] = device;
        }
        
        // Now create parent link to build the device hierarchy
        for (var i = 0; i < mibIndices.length; i++) {
            
            var device = this._devicesByName[mibNames[i]];            
            device.parent = this._devicesByIndex[mibParents[i]];
        }   
        
        
        // For each device that have subdevice creator function, invoke it to create subdevices
        for (var i = 1; i < this._devicesByIndex.length; i++) {    // start from 1 because we can skip the XMS    
           
            var device = this._devicesByIndex[i];   
            log.warn("Check subDevicesCreatorFunc for " + device);
            try {
                log.warn("                                " + device);
            }catch (ex) {
                log.warn("ERROROROROR: " + ex)
            }
            
            if (device.type && device.type.subDevicesCreatorFunc) {
                var subdevices = device.type.subDevicesCreatorFunc(device);
                for (var j = 0; j < subdevices.length; j++) {
                    var subdevice = subdevices[j];
                    // the children device
                    this._devicesByName[device.name + ":" + subdevice.name] = subdevice; // eg. Compose an unique name for the subdevice, like "NOC_EM4008_01:ENC1"
                    this.deviceList.push(subdevice);
                    log.warn("Adding subdevice " + subdevice.toString());
                }
            }
            
        }   
        
        return this._rootXMSDevice;
    };
    
    this.getDeviceByName = function(name) {
        return this._devicesByName[name];
    };
    
    /**
     * Create the alarms under for devices
     */
    this.createGsmAlarms = function(alarmCreatorFunc, nonKeyAlarmDefinition, nonkeyStackSize) {
        
        for (var i = 0; i < this.deviceList.length; i++) {
            
            var device = this.deviceList[i];
            log.info("+ createing alarms for device " + device.toString());
            
            // if alarmDeviceType is defined, create alarms for that device
            var alarmDeviceType = device.alarmDeviceType ? device.alarmDeviceType : device.type;
            
            /**
             * Create the key alarms for device
             */
            for (var j = 0; j < alarmDeviceType.alarms.length; j++) {
                
                var alarm = alarmDeviceType.alarms[j]; // read the alarm configuration
                
                /**
                 * Path: "/XMS/XMU_01/EM187/Health"
                 * Uri: "10.12.170.65/EM4008/EM187"
                 */
                var isSignal = (alarm.category.value === AlarmCategory.COMMUNICATIONS.value);
                var path = device.path() + "/" + (isSignal ? "Signal":"Health"); // ex. "SNMP/THOMSON-XMS/10.12.170.59/XMS/XMU_01/EM187/Signal" 
                var uri = device.type.name + "/" + device.name + "/" + alarm.name; // ex. "EM4008/EM187/hardwareFailure"
                var gsmAlarm = alarmCreatorFunc(plugin, uri, alarm.name, path);
                device.keyAlarms[alarm.id] = gsmAlarm;
            }
            
            /**
             * Create the alarm stack (for storing non-key alarms)
             */
            for (var j = 0; j < nonKeyAlarmDefinition.length; j++) {// stack contains stuff like "CRITICAL, MAJOR, MINOR, WARNING, INFORM" etc
                var path = device.path() + "/" + "MiscAlarms" + "/" + nonKeyAlarmDefinition[j].name; // ex. "SNMP/THOMSON-XMS/10.12.170.59/XMS/XMU_01/EM187/Non-key alarms" 
                var parentDeviceName = device.parent ? device.parent.name + "/" : "";// if devce have a parent, add the parent name
                var uri = device.type.name + "/" + parentDeviceName + device.name + "/" + nonKeyAlarmDefinition[j].name; // ex. "EM4008/EM187/Major Alarms"
                
                var gsmAlarms = []; // gsm alarms for alarm
                for (var k = 0; k < nonkeyStackSize; k++) {
                    gsmAlarms[k] = alarmCreatorFunc(plugin, uri + "/" + k, "alarm " + k, path);
                }
                var alarmStack = new AlarmStack(device.name, gsmAlarms);
                device.nonKeyAlarms[nonKeyAlarmDefinition[j].value] = alarmStack;
            }           
        }
    };
}

/************************************************************************************
 * File: thomsonMain.js
 * Thomson XMS 3500 driver main part.
 * 8 Nov 2013.
 */

function ThomsonXMSPlugin(parameters) {
    
   this.mib = 'XMS3500-MIB';
   this.manufacturer = "Thomson";
   this.scheme = "SNMP";
   this.type = "XMS3500";// device type
   this.deviceClass = "NMS";
   
   //this.readCommunity = 'public';
   this.retries = 3;
   this.timeout = 10; // 
   this.pollInterval = 20;
   this.uniqueID = "";
   
   this.snmp = new SNMPAgent();
   
   //this.nbKeyAlarmsStackLen = 3;// stack size of key alarms for each device and per resourceId
   this.nbNonKeyAlarmsStackLen = 2;// stack size of non-key alarms for each device.
   
   /*
    * Read input parameters
    */
   if (parameters) {
       if (parameters['cleanupInterval']) {
           this.cleanupInterval = parameters['cleanupInterval'];
       }
//       if (parameters['retries']) {
//           this.retries = parameters['retries'];
//       }
//       if (parameters['timeout']) {
//           this.timeout = parameters['timeout'];
//       }
       if (parameters['pollInterval']) {
           this.pollInterval = this.parameters['pollInterval'];
       }

       if (parameters['uniqueID']) {
           this.uniqueID = parameters['uniqueID'];
       }       
    }
   
   
    this.pathPrefix = composeBaseAlarmPath(this.scheme, this.manufacturer, this.type, host); // "SNMP/Thomson/XMS3500(10.12.170.59)". this.path + this.type + "/" + host;
    this.devicePath = this.pathPrefix;
    this.deviceURI = composePrefixURI(this.scheme, this.manufacturer, this.type, host, this.uniqueID);// "snmp://" + this.type + ":" + host;

    /**
     * Create our managers.
     */
    var nonKeyAlarmsDefinition = [
                                {value: alarm.CRITICAL, name:"Critical"},
                                {value: alarm.MAJOR, name:"Major"},
                                {value: alarm.MINOR, name:"Minor"},
        ];
    
    log.warn("================uniqueID=[" + this.uniqueID + "]");
    log.warn("================pathPrefix=[" + this.pathPrefix + "]");
    log.warn("================devicePath=[" + this.devicePath + "]");
    log.warn("================deviceURI=[" + this.deviceURI + "]");

    /**
     * Read  topology
     */
    this.topologyReader = new TopologyReaderCtor(this);
    this.rootXms = this.topologyReader.readTopology();
    this.topologyReader.createGsmAlarms(createGsmAlarm, nonKeyAlarmsDefinition, this.nbNonKeyAlarmsStackLen);// create tree of alarms for each device
    
    /**
     * Create an alarm given the alarm config entry.
     * @param uri example "snmp://PROSTREAM:10.12.250.55/hPlatform/hPlatform1"
     * @param desc example "Platform alarm 1"
     * @param path example "SNMP/PROSTREAM/10.12.250.55/hPlatform"
     * @return the gsm alarm created.
     */   
    function createGsmAlarm(plugin, uri, desc, path) {
        
        log.debug("createAlarm: " + uri + "  |  " + desc + "  |  " + path + " mib=" + plugin.mib );
        var gsmAlarm = gsm.addAlarm(uri, desc, plugin.pathPrefix + "/" + path, plugin.deviceClass, plugin.deviceURI, "text");
        gsmAlarm.status = alarm.NORMAL;
        return gsmAlarm;
    }
}



/***************************************************************
 * Initialize my driver and our variables
 ***************************************************************/
var GSM = {};//namespace
GSM.alarm = alarm;// put some order by using  namespace!
GSM.snmp = snmp;

var DeviceManager = new DeviceManagerCtor();
var ThomsonSeverityManager = new ThomsonSeverityManagerCtor();
var AlarmManager = new AlarmManagerCtor();

var MyPlugin = new ThomsonXMSPlugin(this.parameters);// passing empty parameters


/***************************************************************
 * Creation of a new SNMP driver (using generic.js)
 ***************************************************************/

function synchronize(func) {
    return new Packages.org.mozilla.javascript.Synchronizer(func);
}

var SNMP;

var StartGeneric = synchronize(function() {
    try {

        SNMP = new navigator.SNMPdriver(MyPlugin.type, MyPlugin.myhost, MyPlugin.deviceClass, MyPlugin.uniqueID);
    } catch(e) {
           log.warn("Unable to create a instance of the Generic Driver, we will load this Generic Driver plugin");
           var plugin = new GSMPlugin('com.miranda.icontrol.snmp.plugin.generic');
           var parameters = new Array();
           parameters['host'] = 'Generic';
           parameters['name'] = 'Generic';
           parameters['path'] = 'Generic';
           plugin.parameters = parameters;
           SNMP = new navigator.SNMPdriver(MyPlugin.type, MyPlugin.myhost, MyPlugin.deviceClass, MyPlugin.uniqueID);
    }
});

StartGeneric();

/**
 * Read incoming parameters.
 */

SNMP.setDevicePathPrefix( MyPlugin.path );
SNMP.setSNMPretries( MyPlugin.retries );
SNMP.setSNMPtimeout( MyPlugin.timeout );
SNMP.setSNMPinterval( MyPlugin.pollInterval );
SNMP.setSNMPReadCommunity( MyPlugin.readCommunity );
SNMP.enableGet(false);// device supports polling and traps



/**
 *  --------------------------------------------
 *  Polling
 */
poller.onResult = function onResult(event) {
    
    log.warn(MyPlugin.mib + ": onResult invoked");

    try{

        if (event.success) {  //The device is connected!
            /**
             * Get all the active alarms and update 
             */
            var genAlarmOriginValues = extractIndexedValuesInTable(MyPlugin.mib, "genAlarmOrigin");// to locate the device
            var genAlarmResourceIdValues = extractIndexedValuesInTable(MyPlugin.mib, "genAlarmResourceId"); // resource id to be shown as text on the alarm
            var genAlarmProbableCauseValues = extractIndexedValuesInTable(MyPlugin.mib, "genAlarmProbableCause"); // alarm id. Used to locate the gsm alarm.
            var genAlarmSeverityValues = extractIndexedValuesInTable(MyPlugin.mib, "genAlarmSeverity");// text to be shown on the alarm text
            var genAlarmSpecificProblemValues = extractIndexedValuesInTable(MyPlugin.mib, "genAlarmSpecificProblem");// text to be shown on the alarm text
            var genAlarmLabelValues = extractIndexedValuesInTable(MyPlugin.mib, "genAlarmLabel");// text to be shown on the alarm text
            updateAllAlarm(genAlarmOriginValues, genAlarmResourceIdValues, genAlarmProbableCauseValues, 
                    genAlarmSeverityValues, genAlarmLabelValues, genAlarmSpecificProblemValues);

        } else {  //Error communicating with device...

            log.error(host + " communication error! - " + event.error);

        }
    } catch(ex){
        log.error(host + "Exception in poller thread - " + ex);
    }

};

/**
 * Setup my poller
 */
poller.pollInterval = MyPlugin.pollInterval*2;
poller.retries = MyPlugin.retries;
poller.timeout = MyPlugin.timeout;
poller.readCommunity = "public";
poller.plugin = this;

poller.addObjectID(snmp.getOID(MyPlugin.mib, "genSoftwareVersion"));// add dummy oid to wake up poller
poller.restartPolling();


function updateAllAlarm(alarmOriginValues, alarmResourceIdValues, alarmProbableCauseValues, alarmSeverityValues, alarmLabelValues, alarmSpecificProblemValues) {
    for (var i = 0; i < alarmOriginValues.length; i++) {
        
        log.warn("<updateAllAlarm: " + i + "> " + alarmOriginValues[i] + ";"
                + alarmResourceIdValues[i] + ";"
                + alarmProbableCauseValues[i] + ";"
                + alarmSeverityValues[i] + ";"
                + alarmLabelValues[i] + ";"
                + alarmSpecificProblemValues[i]);

               
        //var deviceName = convertAsciiCodesToString(alarmOriginValues[i]); //need to be converted to ascii !!!
        var deviceName = alarmOriginValues[i]; //need to be converted to ascii !!!
    
        // find my device in the device list, ex. "EM187"        
        var device = MyPlugin.topologyReader.getDeviceByName(deviceName);       
        if (!device) {
            log.error("Device " + deviceName + " raw[" + alarmOriginValues[i] + "] not found!!!");
            return;
        }
        
        // For EM4008 or similar, we need to convert to a subdevice, like "EM187:ENC3"
        device = inferDevice(device, alarmResourceIdValues[i]);
               
        // Convert string like "severityMajor(5)" =to=> ThomsonSeverity.MAJOR
        var thomsonSeverity = ThomsonSeverityManager.convertSeverityValueToThomsonSeverity(alarmSeverityValues[i]);
        if (!thomsonSeverity) {
            log.error("Severity " + alarmSeverityValues[i] + " for device " + deviceName + " invalid !");
            return;
        }
        
        updateAlarm(device, alarmResourceIdValues[i], alarmProbableCauseValues[i], thomsonSeverity, alarmLabelValues[i], alarmSpecificProblemValues[i]);
    }   
}

var TrapOids = {
        // .1.3.6.1.4.1.4947.2.14.1.1.4.1.1
    genEventRecordId: snmp.getOID(MyPlugin.mib,'genEventRecordId'),
    genTrapLastNumber: snmp.getOID(MyPlugin.mib,'genTrapLastNumber'),
    genEventOrigin:   removeEndingZero(snmp.getOID(MyPlugin.mib, 'genEventOrigin')), // ".1.3.6.1.4.1.4947.2.14.1.1.4.1.4.0",
    genEventResourceId: removeEndingZero(snmp.getOID(MyPlugin.mib, 'genEventResourceId')),
    genEventProbableCause: removeEndingZero(snmp.getOID(MyPlugin.mib, 'genEventProbableCause')),
    genEventSpecificProblem: removeEndingZero(snmp.getOID(MyPlugin.mib, 'genEventSpecificProblem')),
    genEventSeverity: removeEndingZero(snmp.getOID(MyPlugin.mib, 'genEventSeverity')),
    genEventLabel: removeEndingZero(snmp.getOID(MyPlugin.mib, 'genEventLabel'))
};


function removeEndingZero(oidStr) {
    if (oidStr.substring(oidStr.lastIndexOf(".") + 1) == "0") {// getOID() usually returns with a '.0' at the end
        oidStr = oidStr.substring(0, oidStr.lastIndexOf(".")); // remove ending '.0' -> '.1.3.6.1.4.1.9.9.691.1.1.2.1.1'
    }
    
    return oidStr;
}


/**
 * Trap handling!
 *      genTrapAlarm NOTIFICATION-TYPE
 *          OBJECTS      {
 *                         genTrapLastNumber,
 *                         genTrapPreviousNumber,
 *                         genEventRecordId,
 *                         genEventTime,
 *                         genEventOrigin,
 *                         genEventResourceId,
 *                         genEventProbableCause,
 *                         genEventSpecificProblem,
 *                         genEventSeverity,
 *                         genEventCategory,
 *                         genEventLabel
 *
 * genEventOrigin:          .1.3.6.1.4.1.4947.2.14.1.1.4.1.4.1
 * genEventResourceId:      .1.3.6.1.4.1.4947.2.14.1.1.4.1.5.1
 * genEventProbableCause:   .1.3.6.1.4.1.4947.2.14.1.1.4.1.6.1
 * genEventSpecificProblem: .1.3.6.1.4.1.4947.2.14.1.1.4.1.7.1
 * genEventSeverity:        .1.3.6.1.4.1.4947.2.14.1.1.4.1.8.1
 * event.variables[.1.3.6.1.2.1.1.3.0]:       585300
 * event.variables[.1.3.6.1.6.3.1.1.4.1.0]:       .1.3.6.1.4.1.4947.2.14.1.1.7.2
 * event.variables[.1.3.6.1.4.1.4947.2.14.1.1.7.1.1.0]:       1000 ............genTrapLastNumber
 * event.variables[.1.3.6.1.4.1.4947.2.14.1.1.7.1.2.0]:       1000
 * event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.1.1]:       0
 * event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.3.1]:       abc
 * event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.4.1]:       EM187
 * event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.5.1]:       sortie rca
 * event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.6.1]:       154
 * event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.7.1]:       the world is square
 * event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.8.1]:       0
 * event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.9.1]:       1
 * event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.10.1]:       my event label
 * 
 */
SNMP.setTrapHandler(function(event) {
    
    log.debug(MyPlugin.mib + " << TRAP CALLED >>");

    try {    
    
        //We got a Trap. Make sure it comes from the host we are watching
        if (event.agentAddress != host) {
           log.info(MyPlugin.mib + "- Trap agentAddress " + event.agentAddress + " vs " + host);
           return;
        }

//
//        log.warn("genTrapLastNumber:       " + TrapOids.genTrapLastNumber);
//        log.warn("genEventOrigin:          " + TrapOids.genEventOrigin);
//        log.warn("genEventResourceId:      " + TrapOids.genEventResourceId);
//        log.warn("genEventProbableCause:   " + TrapOids.genEventProbableCause);
//        log.warn("genEventSpecificProblem: " + TrapOids.genEventSpecificProblem);
//        log.warn("genEventSeverity:        " + TrapOids.genEventSeverity);

        for ( var x in event.variables ) {
            log.warn("event.variables["+x+"]:       " + event.variables[x]);
        }

       // var genTrapLastNumber = event.variables[TrapOids.genTrapLastNumber];
        var genEventRecordId = event.variables[TrapOids.genEventRecordId];
        var eventNumberSuffix = "." + genEventRecordId; // eg. ".17" // suffix to fix the oid variable.
        
        var genEventOrigin = event.variables[TrapOids.genEventOrigin + eventNumberSuffix ];
        var genEventResourceId = event.variables[TrapOids.genEventResourceId + eventNumberSuffix ];
        var genEventProbableCause = event.variables[TrapOids.genEventProbableCause + eventNumberSuffix ];
        var genEventSpecificProblem = event.variables[TrapOids.genEventSpecificProblem + eventNumberSuffix ];
        var genEventSeverity = event.variables[TrapOids.genEventSeverity + eventNumberSuffix ];
        var genEventLabel = event.variables[TrapOids.genEventLabel + eventNumberSuffix ];
        
        
        log.warn("genEventRecordId:       " + genEventRecordId);
        //log.warn("genTrapLastNumber:       " + genTrapLastNumber);
        log.warn("genEventOrigin:          " + genEventOrigin + "  ....oid=" + TrapOids.genEventOrigin + eventNumberSuffix );
        log.warn("genEventResourceId:      " + genEventResourceId);
        log.warn("genEventProbableCause:   " + genEventProbableCause);
        log.warn("genEventSpecificProblem: " + genEventSpecificProblem);
        log.warn("genEventSeverity:        " + genEventSeverity);
        log.warn("genEventLabel:           " + genEventLabel);
        

       // find my device in the device list, ex. "EM187"        
        var device = MyPlugin.topologyReader.getDeviceByName(genEventOrigin);       
        if (!device) {
            log.error("Device " + genEventOrigin + " not found!!!");
            return;
        }
        
        device = inferDevice(device, genEventResourceId);

        // convert integer severity in ThomsonSeverity
        var thomsonSeverity = ThomsonSeverityManager.convertSeverityValueToThomsonSeverity(genEventSeverity);// convert "severityMajor(5)" --to--> ThomsonSeverity.MAJOR.
        if (!thomsonSeverity) {
            log.error("Severity " + genEventSeverity + " for device " + device.toString() + " invalid !");
            return;
        }
        
        if (!thomsonSeverity) {
            log.error("TRAP: severity invalid: " + genEventSeverity);
        }

         log.info(">>>TRAP: " + genEventOrigin   + " genEventResourceId: " + genEventResourceId + " lastNumber:" + genTrapLastNumber);
        
         // Update alarm...
        updateAlarm(device, genEventResourceId, genEventProbableCause, thomsonSeverity, genEventLabel, genEventSpecificProblem);
             
    } catch (ex) {
        log.error("Error in setTrapHandler(): " + ex);
    }       
 });  


/**
 * @param device A device instance, ex EM187. Found from the alarmOrigin value.
 * @param resourceIdValue String like "ENC6/VIDEO.IN". Used to extract the subdevice name.
 * @return the subdevice, like "EM187:ENC6".
 */
function inferDevice(device, resourceIdValue) {
    
    // no parser function?
    if (!device.type.resourceIdParserFunc) {
        return device;
    }
    var subDeviceName = device.type.resourceIdParserFunc(resourceIdValue); // like "ENC3/VIDEO2"
    
    // no subdevice, return the original device
    if (!subDeviceName) {
        return device;
    }
    
    return MyPlugin.topologyReader.getDeviceByName(device.name + ":" + subDeviceName);
}

/**
 * Start rolling !
 */
try {
    SNMP.start();
} catch (e) {
   // do nothing
}
