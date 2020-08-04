/************************************************************************************
 * File: thomsonMain.js
 * Thomson XMS 3500 driver main part.
 * 8 Nov 2013.
 */



/**
 * Walkreader stuff 
 * ===================================
 */
var walkreader = new WalkReader();
//reader.read(basedir + "\\src-walkreader\\testwalk.txt");
walkreader.readSuperBIGString(walkString);

extractIndexedValuesInTable = function(mib, variable) {
    var values =  walkreader.getAll(variable);
    log.warn("extractIndexedValuesInTable[" + variable + "] = " + objToString(values));
    return values;
};


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
   
   //this.snmp = new SNMPAgent();
   
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
        var gsmAlarm = GSM.gsm.addAlarm(uri, desc, plugin.pathPrefix + "/" + path, plugin.deviceClass, plugin.deviceURI, "text");
        gsmAlarm.status = alarm.NORMAL;
        return gsmAlarm;
    }
}

/***************************************************************
 * Initialize my driver and our variables
 ***************************************************************/
var DeviceManager = new DeviceManagerCtor();
var ThomsonSeverityManager = new ThomsonSeverityManagerCtor();
var AlarmManager = new AlarmManagerCtor();

var GSM = {};
//try {
//	GSM.alarm = alarm;// put some order by using  namespace!
//	//GSM.snmp = snmp;
//	GSM.gsm = GSM.alarm;
//} catch(ex) {
	GSM.alarm = MOCK.alarm;// put some order by using  namespace!
	GSM.snmp = MOCK.snmp;
	GSM.gsm = MOCK.gsm;
//}


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
        
        log.warn("---------------In poller");

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

poller.addObjectID(GSM.snmp.getOID(MyPlugin.mib, "genSoftwareVersion"));// add dummy oid to wake up poller
poller.restartPolling();


function updateAllAlarm(alarmOriginValues, alarmResourceIdValues, alarmProbableCauseValues, alarmSeverityValues, alarmLabelValues, alarmSpecificProblemValues) {
    for (var i = 0; i < alarmOriginValues.length; i++) {
        
        log.warn("<updateAllAlarm: " + i + "> " + alarmOriginValues[i] + ";"
                + alarmResourceIdValues[i] + "; "
                + alarmProbableCauseValues[i] + "; "
                + alarmSeverityValues[i] + "; "
                + alarmLabelValues[i] + "; "
                + alarmSpecificProblemValues[i]);

               
        //var deviceName = convertAsciiCodesToString(alarmOriginValues[i]); //need to be converted to ascii !!!
        var deviceName = alarmOriginValues[i]; //need to be converted to ascii !!!
    
        // find my device in the device list, ex. "EM187"        
        var device = MyPlugin.topologyReader.getDeviceByName(deviceName); 
        
        log.warn("updateAllAlarms: '" + device.toString() + "'");
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
    genEventRecordId: removeEndingZero(GSM.snmp.getOID(MyPlugin.mib,'genEventRecordId')),
    //genTrapLastNumber: snmp.getOID(MyPlugin.mib,'genTrapLastNumber'),
    genEventOrigin:   removeEndingZero(GSM.snmp.getOID(MyPlugin.mib, 'genEventOrigin')), // ".1.3.6.1.4.1.4947.2.14.1.1.4.1.4.0",
    genEventResourceId: removeEndingZero(GSM.snmp.getOID(MyPlugin.mib, 'genEventResourceId')),
    genEventProbableCause: removeEndingZero(GSM.snmp.getOID(MyPlugin.mib, 'genEventProbableCause')),
    genEventSpecificProblem: removeEndingZero(GSM.snmp.getOID(MyPlugin.mib, 'genEventSpecificProblem')),
    genEventSeverity: removeEndingZero(GSM.snmp.getOID(MyPlugin.mib, 'genEventSeverity')),
    genEventLabel: removeEndingZero(GSM.snmp.getOID(MyPlugin.mib, 'genEventLabel'))
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
    
    log.warn(MyPlugin.mib + " << TRAP CALLED >>");

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
        
        var genEventRecordId = event.variables[TrapOids.genEventRecordId];
        log.warn("genEventRecordId=" + genEventRecordId);

        var curEventRecordId = extractCurEventRecordId(event, TrapOids.genEventRecordId);
        log.warn("curEventRecordId:       " + curEventRecordId);
        //var eventNumberSuffix = "." + genEventRecordId; // eg. ".17" // suffix to fix the oid variable.
        
        var genEventOrigin = event.variables[TrapOids.genEventOrigin + "." + curEventRecordId ];
        var genEventResourceId = event.variables[TrapOids.genEventResourceId + "." + curEventRecordId ];
        var genEventProbableCause = event.variables[TrapOids.genEventProbableCause + "." + curEventRecordId ];
        var genEventSpecificProblem = event.variables[TrapOids.genEventSpecificProblem + "." + curEventRecordId ];
        var genEventSeverity = event.variables[TrapOids.genEventSeverity + "." + curEventRecordId ];
        var genEventLabel = event.variables[TrapOids.genEventLabel + "." + curEventRecordId ];
        
        
        log.warn("genEventRecordId:       " + genEventRecordId);
        //log.warn("genTrapLastNumber:       " + genTrapLastNumber);
        log.warn("genEventOrigin:          " + genEventOrigin);
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
        var thomsonSeverity = ThomsonSeverityManager.get(genEventSeverity);// convert "5" --to--> ThomsonSeverity.MAJOR.
        if (!thomsonSeverity) {
            
            // NOTE: have to do this as i see inconsitent severity form: Integer or String ?
            // try to convert  string form of severity
            thomsonSeverity = ThomsonSeverityManager.convertSeverityValueToThomsonSeverity(genEventSeverity); // convert "severityMajor(5)" --to--> ThomsonSeverity.MAJOR.           
            if (!thomsonSeverity) {
                log.error("Severity " + genEventSeverity + " for device " + device.toString() + " invalid !");
                return;
            }
        }
        
        log.info(">>>TRAP: " + genEventOrigin   + " genEventResourceId: " + genEventResourceId + " lastNumber:" + genTrapLastNumber);
        
         // Update alarm...
        updateAlarm(device, genEventResourceId, genEventProbableCause, thomsonSeverity, genEventLabel, genEventSpecificProblem);
             
    } catch (ex) {
        log.error("Error in setTrapHandler(): " + ex);
    }       
 });  

/**
 *   XMS3500-MIB << TRAP CALLED >>
 *   event.variables[.1.3.6.1.2.1.1.3.0]:       50403684
 *   event.variables[.1.3.6.1.6.3.1.1.4.1.0]:       .1.3.6.1.4.1.4947.2.14.1.1.7.2
 *   event.variables[.1.3.6.1.4.1.4947.2.14.1.1.7.1.1.0]:       1835
 *   event.variables[.1.3.6.1.4.1.4947.2.14.1.1.7.1.2.0]:       1835
 *   event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.1.1744]:       1744
 *   event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.3.1744]:       Ã,[+
 *   event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.4.1744]:       WJCT_Sapphire 
 *   event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.6.1744]:       22
 *   event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.9.1744]:       1
 *   event.variables[.1.3.6.1.4.1.4947.2.14.1.1.4.1.10.1744]:       Connection establishment error
 */
function extractCurEventRecordId(event, recordIdOid) {
 
    for (var oid in event.variables) {
        //log.warn("event.variables["+x+"]:       " + event.variables[x]);
        //log.warn("Verify: recordIdOid=" + recordIdOid + " vs " + oid);
        if (oid.indexOf(recordIdOid) == 0) {
            log.warn("GOT THIS: " + event.variables[oid]);
            return event.variables[oid];// return a value like '1744' which points to the genEventTable entry to use
        }
    }
    
    return undefined;
}

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
   log.warn("Error in generic.js code. No problem if mocking: " + e);
}
