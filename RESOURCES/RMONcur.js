//By default this plugin will give you an interface list, interface up/down status and 
//interface speed, utilization, discarded packets and error packets.
//It also provides Health Monitoring in the case of Cisco Switch.
//
//IMPORTANT: The information below may not be accurate. The plugin has evolved and
// the RMON probing functionnality has not been retested.
//
//Processing of traps from RMON probing are also available if configured as below.
//This is optional and if used, RMON probing must also be configured in the switch.
//Input parameters example for RMON probing.
//rmonAlarmSize = 2; number of alarms defined.
//rmonAlarmIndex1 = 1; the event number as configured on the monitored switch.
//rmonAlarmDescription1 = "Port 1 IN Traffic"; textual representation for the user
//rmonAlarmIndex2 = 2; the event number as configrued on the monitored switch.
//rmonAlarmDescription2 = "Port 2 IN Traffic"; textual representation

//Used for testing RMON Alarms
//this.parameters = new Array();
//this.parameters['rmonAlarmSize'] = 48;
//for(i = 1; i <= 24; i++ ) {
//this.parameters['rmonAlarmIndex'+i] = i;
//this.parameters['rmonAlarmDescription'+i] = "Port " + i + " IN Traffic";
//}
//for(i = 25; i <= 48; i++ ) {
//this.parameters['rmonAlarmIndex'+i] = (100+i-24);
//this.parameters['rmonAlarmDescription'+i] = "Port " + (i-24) + " Link";
//}

var mib2 = 'RFC1213-MIB';
var ifmib = 'IF-MIB';
var snmpv2mib = 'SNMPv2-MIB';
var rmon = 'RMON-MIB';
var chassismib = 'CISCO-STACK-MIB';
var cpumib = 'CISCO-PROCESS-MIB';
var enmib = 'ENTITY-MIB';
var displayMib = 'CISCO-ENTITY-DISPLAY-MIB';
var brocade_mib = 'FOUNDRY-SN-AGENT-MIB';// this MIB should work for both Brocade MLX and FastIron switches
var fexMib = "CISCO-ETHERNET-FABRIC-EXTENDER-MIB";// 2013-10-3 adding Fabric Extender

// var host = "10.10.40.150";
var samplingPeriod = "120";
var TxRxdiscard = 400;
var TxRxerrors = 400;

var path = "SNMP/RMON/" + host;
var pollInterval = 2;
var deviceURI = "snmp://RMON:" + host;
var uriPrefix = "snmp://RMON:" + host;
var virtualUriPrefix = "snmp:RMON:" + host;
var readCommunity = "public";
var retries = 2;
var timeout = 5;
var resetAlarmsSeverity = alarm.UNKNOWN;

var allThresholdErrors = new Array();
var allThresholdDiscards = new Array();
var myAlarms = new Array();

snmp.writeCommunity = "private";

// Saved configuration persistent file
var errorThresholdPersistency = "/usr/local/iControl/bin/tmp/thresholdError_" + host + ".dat";
var discardThresholdPersistency = "/usr/local/iControl/bin/tmp/thresholdDiscard_" + host + ".dat";

// Parse the generic parameters from the input configuration
if (this.parameters) {

    if (this.parameters['alarmPath']) {
        path = this.parameters['alarmPath'];
    }
    if (this.parameters['pollInterval']) {
        pollInterval = this.parameters['pollInterval'];
    }
    if (this.parameters['retries']) {
        retries = this.parameters['retries'];
    }
    if (this.parameters['timeout']) {
        timeout = this.parameters['timeout'];
    }
    if (this.parameters['samplingPeriod']) {
        samplingPeriod = this.parameters['samplingPeriod'] * 60;
    }
    if (this.parameters['discard']) {
        TxRxdiscard = this.parameters['discard'];
    }
    if (this.parameters['errors']) {
        TxRxerrors = this.parameters['errors'];
    }
    if (this.parameters['uniqueID']) {
        uriPrefix = "snmp://" + this.parameters['uniqueID'] + ":RMON:" + host;
        virtualUriPrefix = "snmp:" + this.parameters['uniqueID'] + ":RMON:" + host;
    }
    if (this.parameters['resetAlarmsSeverity']) {
        if (this.parameters['resetAlarmsSeverity'] == "DISABLED") {
            resetAlarmsSeverity = alarm.DISABLED;
        }
    }
    if (this.parameters['writeCommunity']) {
        snmp.writeCommunity = this.parameters['writeCommunity'];
    }
    if (this.parameters['readCommunity']) {
        snmp.readCommunity = this.parameters['readCommunity'];
        readCommunity = this.parameters['readCommunity'];
    }
}

log.info("RMON " + host + " initialized with current values:");
log.info("RMON " + host + " samplingPeriod = " + samplingPeriod);
log.info("RMON " + host + " TxRxdiscard = " + TxRxdiscard);
log.info("RMON " + host + " TxRxerrors = " + TxRxerrors);
log.info("RMON " + host + " readCommunity = " + readCommunity);
log.info("RMON " + host + " writeCommunity = " + snmp.writeCommunity);
log.info("RMON " + host + " resetAlarmsSeverity = " + resetAlarmsSeverity);

// Determine if gsm API supports "notlogged" for text alarms, version > 3.00
// We don't want to log text statuses.
var alarmType;
if (java.lang.Integer(navigator.appVersion * 100) >= 300) {
    alarmType = 20;
} else {
    alarmType = "text";
}

// Create static GSM alarms.
var sysNameText = createTextAlarm(textAlarmURI("sysName"), "Name", path);
var sysDescrText = createTextAlarm(textAlarmURI("sysDescr"), "Description", path);
var sysContactText = createTextAlarm(textAlarmURI("sysContact"), "Contact", path);
var sysLocationText = createTextAlarm(textAlarmURI("sysLocation"), "Location", path);
var ifNumberText = createTextAlarm(textAlarmURI("ifNumber"), "Number of Interfaces", path);
// var ifCurrentText = createTextAlarm(textAlarmURI("ifCurrent"), "Current Interface", path);

// Initializing the Sampling Period
var sysSamplingPeriod = createTextAlarm(textAlarmURI("sysSamplingPeriod"), "Sampling Period", path);
sysSamplingPeriod.text = samplingPeriod / 60; // report in minutes.

// Health Monitoring Alarm
var alarmPathHM = path + "/Health Monitoring";
var powerCycle = createAlarm(uriPrefix + "/powerCycle", "Device Reboot", alarmPathHM);
var commStatus = createAlarm(uriPrefix + "/commStatus", "Communication Status", alarmPathHM);
var sysUpTime = 0;
var sysUpTimeOID = snmp.getOID(mib2, 'sysUpTime');
// var sysUpTimeText = createTextAlarm(textAlarmURI("sysuptime"),"System Uptime", alarmPathHM);

// Create RMON probes GSM alarms based on input config
var rmonSize = 0;
var rmonIndexes;
var rmonDescriptions;
try {
    if (this.parameters['rmonAlarmSize']) {
        rmonSize = this.parameters['rmonAlarmSize'];
        rmonIndexes = new Array(rmonSize);
        rmonDescriptions = new Array(rmonSize);
        for ( var i = 0; i < rmonSize; i++) {
            rmonIndexes[i] = this.parameters['rmonAlarmIndex' + (i + 1)];
            rmonDescriptions[i] = this.parameters['rmonAlarmDescription' + (i + 1)];
            createAlarm(rmonAlarmURI(rmonIndexes[i]), rmonDescription(rmonDescriptions[i], rmonIndexes[i]), path + "/RMON Alarms");
        }
    }
} catch (exception) {
    // RMON parameters don't exists if not used.
    // or there was an error in the parameters so print an error
    // to let the user know
    log.info(host + ": " + "RMON SNMP Plugin: missing or erroneous RMON parameters");
}

// Init Agent
this.inpoller = false;

poller.timeout = timeout;
/*
 * We will start the polling at the very end of the script, because we kept having errors where the onResult was called
 * before the script was entirely run, resulting in undefined variables.
 */
poller.autoActive = false;
snmp.timeout = timeout;

poller.readCommunity = readCommunity;
snmp.readCommunity = readCommunity;

poller.retries = retries;
snmp.retries = retries;

// Detect if this switch/router is a Nexus7000,
// the Nexus7000 doesn't support CISCO-STACK-MIB
// and it give an erronous ifNumber

var isNexus7000 = false;
var isFEX = false; // Fabric Extender. Part of Nexus7000 
var fexSize;

function checkIfNexus() {
    try {
        isNexus7000 = false;
        var phDescOID = snmp.getOID(enmib, "entPhysicalDescr");
        phDescOID = phDescOID.substring(0, phDescOID.lastIndexOf("."));
        var phDescVB = snmp.getNextVB(enmib, "entPhysicalDescr", 0);

        if (phDescVB != null) {
            while (phDescVB.oid.indexOf(phDescOID) != -1) {
                // log.warn("L115 RMON : " + phDescVB.value);
                if (phDescVB.value.indexOf("Nexus7000") != -1) {
                    isNexus7000 = true;
                    break;
                }
                phDescVB = snmp.getNextVB(phDescVB.oid);
            }
        }
    } catch (ex) {
        log.error(host + " RMON - checkIfNexus() - Error while verifying if the switch is Nexus7000: " + ex);
        isNexus7000 = "Unknown";
    }
}

function checkIfFEX() {
    try {
        // verify by querying existence of a variable.
        var oidStr = snmp.getOID(fexMib, "cefexConfigExtenderName");
        log.info("----> We have a FEX! " + oidStr + " : " + oidStr);
        return true;
    } catch (ex) {
        log.warn("---> We dont have a FEX!");
        return false;
    }
}

checkIfNexus();

// Init polling
poller.pollInterval = pollInterval;
poller.addObjectID(snmp.getOID(mib2, 'sysUpTime'));
poller.addObjectID(snmp.getOID(mib2, 'ifNumber'));
poller.plugin = this;

// Init trap catching
var trapper = new SNMPTrapReceiver();
trapper.plugin = this;
trapper.communityEnabled = false;

alarm.status = alarm.ERROR;

// Done with the init.

function initializeRmonAlarms() {
    // Init rmon alarms
    for ( var i = 0; i < rmonSize; i++) {
        getRmonAlarms(rmonIndexes[i]);
    }
}

function initializeMIB2Alarms() {
    sysNameText.text = snmp.get(mib2, "sysName");
    // sysUpTimeText.text = snmp.get(mib2, "sysUpTime");
    sysDescrText.text = snmp.get(mib2, "sysDescr");
    sysContactText.text = snmp.get(mib2, "sysContact");
    sysLocationText.text = snmp.get(mib2, "sysLocation");
    ifNumberText.text = ifNumber;
}

/**
 * initializeFEXAlarms.
 */

/**
 * Get the values of Fabric Extender alarms (these are static alarms).
 */
function getFEXAlarms(idx) {
    myAlarms[fexAlarmURI(idx, "cefexConfigExtenderName")].text = snmp.get(fexMib, "cefexConfigExtenderName", idx);
    myAlarms[fexAlarmURI(idx, "cefexConfigSerialNumCheck")].text = snmp.get(fexMib, "cefexConfigSerialNumCheck", idx);
    myAlarms[fexAlarmURI(idx, "cefexConfigSerialNum")].text = snmp.get(fexMib, "cefexConfigSerialNum", idx);
    myAlarms[fexAlarmURI(idx, "cefexConfigPinningFailOverMode")].text = snmp.get(fexMib, "cefexConfigPinningFailOverMode", idx);
    myAlarms[fexAlarmURI(idx, "cefexConfigPinningMaxLinks")].text = snmp.get(fexMib, "cefexConfigPinningMaxLinks", idx);
    myAlarms[fexAlarmURI(idx, "cefexConfigCreationTime")].text = toHoursMinSecs(snmp.get(fexMib, "cefexConfigCreationTime", idx));  
    myAlarms[fexAlarmURI(idx, "cefexConfigRowStatus")].text = snmp.get(fexMib, "cefexConfigRowStatus", idx);
}

/**
 * Convert a time interval into days, hours, min, secs.
 * Example, given 18158, return '5 hours, 2 minutes, 38 secs'.
 * From http://stackoverflow.com/questions/13903897/javascript-return-number-of-days-hours-minutes-seconds-between-two-dates.
 * @param timeIntervalTimeTicks In Hundreds of seconds.
 * @returns {String} eg. '5 hours, 2 minutes, 38 secs'.
 */
function toHoursMinSecs(timeIntervalTimeTicks) {
    var secs = timeIntervalTimeTicks / 100;
    var days = Math.floor(secs / 86400);
    var hours = Math.floor(secs / 3600) % 24;
    var minutes = Math.floor(secs / 60) % 60;
    var seconds = secs % 60;
    var timestr = (days > 0 ? days + " days, ": "") + hours + " hours, " + minutes + " minutes, " + seconds + " secs";
    return timestr;
}

// poller handler has these states:
// notInitalized(0): connection has never been made with the device
// poll sysUpTime and ifNumber at pollInterval
// initialized(1):
// poll interface data at slower rate
// compute counters at samplingInterval
// State changes
// Init global agent alarms.
var initialized = 0;

// Set to 0 if plugin cannot communicate with device
// Set to 1 if plugin can communicate
var hasCommunication = 0;
var ifIndexes = new Array();
var ifDescriptions = new Array();
var ifCounters = new Array();
var fexIndexes = new Array();

var samplingStatsErrorTx = new Array();
var samplingStatsErrorRx = new Array();
var samplingStatsDiscardTx = new Array();
var samplingStatsDiscardRx = new Array();

var ifNumber = 0;
var currentOID = 0;
var nextVB = 0;
var ifIndexOID = snmp.getOID(mib2, "ifIndex").substring(0, snmp.getOID(mib2, "ifIndex").lastIndexOf(".") - 1);

/*
 * This class is used to provide the index of the next port to be polled. It allows cutting in front of the line when
 * the API is used to enable/disable a port, so we can immedietely see the effect instead of having to wait for the port
 * "natural" position in the list of ports to poll.
 * 
 * We synchronize most of these functions because the enable/disable port function which uses this object is normally
 * called from a different thread
 */
function IndexManager() {
    this.currentIndex = 0;
    this.ifNumber = 0;
    this.lineJumpers = [];

    function resetIndexNoSync() {
        this.currentIndex = 0;
    }
    this.resetIndex = new Packages.org.mozilla.javascript.Synchronizer(resetIndexNoSync);

    this.setIFNumber = function(ifNumber) {
        this.ifNumber = ifNumber;
    };

    function getNextIndexNoSync() {
        /*
         * First see if there is any line jumbers coming from the enable/disablePort functions.
         */
        while (true) {
            var index = this.lineJumpers.shift();
            if (index === undefined) {
                break;
            }
            log.debug("IndexManager.getNextIndex - Checking linejumper index " + index + " ifNumber = " + this.ifNumber);
            if (index <= this.ifNumber) {
                return index;
            }
        }
        var i = this.currentIndex;
        this.currentIndex++;
        if (this.currentIndex >= this.ifNumber) {
            this.currentIndex = 0;
        }
        return i;
    }

    this.getNextIndex = new Packages.org.mozilla.javascript.Synchronizer(getNextIndexNoSync);

    /*
     * the index specified here is the SNMP index. We need to translate that to the row index of the ifTable
     */
    function jumpLineNoSync(snmpIndex) {
        log.debug("IndexManager.jumpLineNoSync - Jumping line for SNMP index " + snmpIndex);
        for ( var i in ifIndexes) {
            if (ifIndexes[i] == snmpIndex) {
                log.debug("IndexManager.jumpLineNoSync - Jumping line for index " + i);
                this.lineJumpers.push(i);
                return;
            }
        }
    }

    this.jumpLine = new Packages.org.mozilla.javascript.Synchronizer(jumpLineNoSync);

}

var indexManager = new IndexManager();

// Fix 28475:
// for the Nexus7000 switch, we parse ifTable in order to calculate ifNumber
poller.getIfNumber = function(event) {
    try {
        var tmpIfNumber = 0;
        // log.warn("L328 RMON : isNexus7000 = " + isNexus7000);
        if (!isNexus7000) {
            tmpIfNumber = event.variables[snmp.getOID(mib2, "ifNumber")];
        } else {
            var ifDescrOID = snmp.getOID(mib2, "ifDescr");
            // log.warn("L333 RMON : " + ifDescrOID.substring(ifDescrOID.lastIndexOf(".")+1));
            if (ifDescrOID.substring(ifDescrOID.lastIndexOf(".") + 1) == "0") {
                ifDescrOID = ifDescrOID.substring(0, ifDescrOID.lastIndexOf("."));
            }

            var nextTestVB = snmp.getNextVB(mib2, "ifDescr", 0);

            while (nextTestVB.oid.indexOf(ifDescrOID) != -1) {
                tmpIfNumber = tmpIfNumber + 1;
                nextTestVB = snmp.getNextVB(nextTestVB.oid);
            }
        }
    } catch (ex) {
        log.error(host + " RMON - poller.getIfNumber() - error while verifying ifNumber, probably there is no communication with the switch: " + ex);
        tmpIfNumber = 0;
    }

    // log.warn("L346 RMON : " + tmpIfNumber);
    return tmpIfNumber;
};

/**
 * onResult function.
 * ==================
 */
poller.onResult = function onResult(event) {

    try {
        if (this.plugin.inpoller) {
            log.error("Called poller onResult when previous call was not finished");
            return;
        }
        
        this.plugin.inpoller = true;
        
        if (event.success) {
            // log.info("L 314 : " + host + " Poller.onResult event success");
            hasCommunication = 1;
            // Health Monitoring
            commStatus.status = alarm.NORMAL;
            var uptime = sysUpTime;
            
            if (event.variables[sysUpTimeOID] != undefined) {
                sysUpTime = java.lang.Long(event.variables[sysUpTimeOID]);
                //Wait for a minute of delay before declaring a reboot
                //Time ticks are 0.01 of a second not milliseconds
                var bool = (sysUpTime - uptime)<= -(60*100);
                // sysUpTimeText.text = sysUpTime;

                if (bool) {
                    powerCycle.status = alarm.WARNING;
                    // TODO: Reinitialized all the variables (note, on some routers the ifIndex for each
                    // interface
                    // a re-init. Delete all alarms and re-init.
                    for ( var i = 0; i < ifNumber; i++) {
                        try {
                            destroyInterfaceAlarms(ifIndexes[i]);
                            destroyInterfaceAlarms(ifDescriptions[ifIndexes[i]]);
                            destroyInterfaceOverall(ifIndexes[i]);
                            destroyInterfaceOverall(ifDescriptions[ifIndexes[i]]);
                        } catch (exc) {
                            // Some inteface alarms might have not been created yet.
                            // Let's say it was initializing when the device was re-booted
                        }
                    }
                    indexManager.resetIndex();
                    ifIndexes = new Array();
                    ifDescriptions = new Array();
                    ifCounters = new Array();
                    samplingStatsErrorTx = new Array();
                    samplingStatsErrorRx = new Array();
                    samplingStatsDiscardTx = new Array();
                    samplingStatsDiscardRx = new Array();
                    ifNumber = 0;
                    currentOID = 0;
                    nextVB = 0;
                    initialized = 0;
                } else {
                    powerCycle.status = alarm.NORMAL;
                }
            }

            // notInitialized
            if (initialized == 0) {
                log.info(host + " : RMON initializing");

                // Since all of this takes time, suspend polling.
                this.autoActive = false;

                // check if switch is Nexus7000
                checkIfNexus();
                if (isNexus7000 == "Unknown") { // device is not responding, give up and try later.
                    alarm.status = alarm.WARNING;
                    log.error(host + " : RMON error verifying switch type: " + isNexus7000);
                    this.plugin.inpoller = false;
                    this.restartPolling();
                    return;
                }
                
                // -------------------------------------------
                // Check Fabric Extender                
                if (isNexus7000) { // Fabric Extender is part of Nexus 7000
                    isFEX = checkIfFEX();
                    if (isFEX) {
                        fexSize = findFEXTableSize(fexMib, "cefexConfigExtenderName", fexIndexes);                    
                        for (var i = 0; i < fexSize; i++) {
                            createFEXAlarms(fexIndexes[i]);
                            getFEXAlarms(fexIndexes[i]); // read FEX alarms
                        }
                    }
                }


                ifNumber = this.getIfNumber(event); // event.variables[snmp.getOID(mib2,"ifNumber")];
                if (ifNumber == undefined || ifNumber == null || ifNumber == 0) {
                    alarm.status = alarm.WARNING;
                    log.error(host + " : RMON error reading ifNumber " + ifNumber);
                    this.plugin.inpoller = false;
                    this.restartPolling();
                    return; // device is not responding, give up and try later.
                }
                indexManager.setIFNumber(ifNumber);

                // Init static alarms.
                initializeRmonAlarms();
                initializeMIB2Alarms();

                // Init HM Alarms
                initializeHMAlarms();
                

                // populate ifIndexes and get data for all interfaces
                currentOID = snmp.getOID(mib2, "ifNumber");
                for ( var i = 0; i < ifNumber; i++) {
                    nextVB = snmp.getNextVB(currentOID);
                    if (snmp.targetHost != host) {
                        log.error(host + " : RMON target host: " + snmp.targetHost + " and host " + host + " don't match");
                    }

                    // make sure they were no timeouts
                    if (nextVB == undefined || nextVB == null) {
                        alarm.status = alarm.WARNING;
                        log.error(host + " : RMON error reading ifIndex " + i);
                        this.plugin.inpoller = false;
                        this.restartPolling();
                        return; // device is not responding, give up and try later.
                    }
                    // make sure we got something real
                    if (nextVB.value == undefined || nextVB.value == null) {
                        alarm.status = alarm.WARNING;
                        log.error(host + " : RMON error reading nextVB : " + nextVB);
                        this.plugin.inpoller = false;
                        this.restartPolling();
                        return; // device is not responding, give up and try later.
                    }
                    // make sure it's a ifIndex OID
                    if (nextVB.oid.substring(0, nextVB.oid.lastIndexOf(".") - 1) != ifIndexOID) {
                        log.error(host + " : RMON nextVB OID " + nextVB.oid.substring(0, nextVB.oid.lastIndexOf(".") - 1) + " not ifIndex");
                        alarm.status = alarm.WARNING;
                        this.plugin.inpoller = false;
                        this.restartPolling();
                        return; // read the wrong OID, give up and try later
                    }
                    // Insert in table
                    ifIndexes[i] = nextVB.value;
                    
                    currentOID = nextVB.oid;
                }

                getInterfaceDescriptions();

                // Create GSM alarms and counters
                for ( var i = 0; i < ifNumber; i++) {
                    log.debug("Adding interface ifIndexes[" + i + "] = " + ifIndexes[i]);
                    createInterfaceAlarms(ifIndexes[i]);
                    createInterfaceAlarms(ifDescriptions[ifIndexes[i]]); // create alarms with URIs that use
                    // the interface name
                    createInterfaceCounters(ifIndexes[i]);
                    createInterfaceOverall(ifIndexes[i]);
                    createInterfaceOverall(ifDescriptions[ifIndexes[i]]); // create alarms with URIs that use
                    // the interface name
                }
                indexManager.resetIndex();
                loadThreshold();
                initialized = 1;
                alarm.status = alarm.NORMAL;
                this.restartPolling();
                
            } else {
                
                initialized = 1;

                // Run this check if the device is not Nexus7000
                // Parsing the ifTable of the Nexus took ~1s
                // and there is no need to do it every 2s
                // TODO run this check every 10 min for Nexus7000 switches
                if (!isNexus7000) {
                    // Recheck the number of interfaces
                    var temp = this.getIfNumber(event); // event.variables[snmp.getOID(mib2,"ifNumber")];

                    if (ifNumber != temp) {
                        alarm.status = alarm.WARNING;
                        log.error(host + " : RMON error ifNumber " + ifNumber + " does not match: " + temp);
                    } else {
                        // reset alarm condition
                        if (alarm.status != alarm.NORMAL)
                            alarm.status = alarm.NORMAL;
                    }
                }

                // refresh in alarms(ifIndexes[currentIndex]);
                var index = indexManager.getNextIndex();
                getInterfaceAlarms(ifIndexes[index]);
                computeInterfaceCounters(ifIndexes[index], pollInterval * ifNumber);
            }
        } else {

            // Health Monitoring
            commStatus.status = alarm.ERROR;

            if (hasCommunication == 1) {
                //
                // We just lost communication, set alarms to UNKNOWN.
                //
                hasCommunication = 0;
                log.error(host + ": RMON : Poller failed " + event.error);
                alarm.status = alarm.ERROR;
                resetAlarms();
            }
        }
    } catch (exception) {
        log.error(host + ": RMON : Exception in poller thread " + exception.rhinoException);
        if (this.autoActive == false) {
            this.restartPolling();
        }
    }
    
    this.plugin.inpoller = false;
};

function getInterfaceDescriptions() {
    for ( var i = 0; i < ifNumber; i++) {
        ifDescriptions[ifIndexes[i]] = snmp.get(mib2, "ifDescr", ifIndexes[i]), "UTF-8";
    }
}

function getRmonAlarms(index) {
    try {
        var risingThreshold = snmp.get(rmon, "alarmRisingThreshold", index);
        // Not used anywhere. I am removing (JC Pitre)
        // var fallingThreshold = snmp.get(rmon, "alarmFallingThreshold", index);
        var alarmValue = snmp.get(rmon, "alarmValue", index);

        if (alarmValue == null) {
            myAlarms[rmonAlarmURI(index)].status = alarm.UNKNOWN;
            return;
        }

        if (alarmValue > risingThreshold) {
            myAlarms[rmonAlarmURI(index)].status = alarm.ERROR;
        } else {
            myAlarms[rmonAlarmURI(index)].status = alarm.NORMAL;
        }
    } catch (ex) {
        // if rmon is not configured properly on the switch
        myAlarms[rmonAlarmURI(index)].status = alarm.UNKNOWN;
    }
}

// index is an interface index from ifTable
function getInterfaceAlarms(index) {

    try {
        // Description
        myAlarms[ifAlarmURI(index, "ifDescr")].text = snmp.get(mib2, "ifDescr", index);
        myAlarms[ifAlarmURI(ifDescriptions[index], "ifDescr")].text = index;

        // Link UP/Link Down
        // check admin status
        if ((snmp.get(mib2, "ifAdminStatus", index)) != 1) {
            myAlarms[ifAlarmURI(index, "ifOperStatus")].status = alarm.DISABLED;
            myAlarms[ifAlarmURI(ifDescriptions[index], "ifOperStatus")].status = alarm.DISABLED;
        } else {
            myAlarms[ifAlarmURI(index, "ifOperStatus")].status = (snmp.get(mib2, "ifOperStatus", index) == 1 ? alarm.NORMAL : alarm.ERROR);
            myAlarms[ifAlarmURI(ifDescriptions[index], "ifOperStatus")].status = myAlarms[ifAlarmURI(index, "ifOperStatus")].status;
        }
        // Speed
        myAlarms[ifAlarmURI(index, "ifSpeed")].text = snmp.get(mib2, "ifSpeed", index) / 1000000;
        myAlarms[ifAlarmURI(ifDescriptions[index], "ifSpeed")].text = myAlarms[ifAlarmURI(index, "ifSpeed")].text;
    } catch (ex) {
        log.error(host + ": RMON : Exception Unkown interface index " + index + ": " + ex.rhinoException);
        throw ex;

    }

}

// index is an interface index from ifTable
function createInterfaceAlarms(idx) {

    // Description
    createTextAlarm(ifAlarmURI(idx, "ifDescr"), "Description or ifIndex", ifAlarmPath(idx));
    // Link UP/Link Down
    createAlarm(ifAlarmURI(idx, "ifOperStatus"), "Operational Status", ifAlarmPath(idx));
    // Speed
    createTextAlarm(ifAlarmURI(idx, "ifSpeed"), "Speed (Mb/s)", ifAlarmPath(idx));

    // RX Utilization
    createTextAlarm(ifAlarmURI(idx, "rxUtil"), "RX Utilization", ifAlarmPath(idx));

    // TX Utilization
    createTextAlarm(ifAlarmURI(idx, "txUtil"), "TX Utilization", ifAlarmPath(idx));

    // ifInErrors
    createTextAlarm(ifAlarmURI(idx, "ifInErrors"), "RX Errors", ifAlarmPath(idx));
    myAlarms[ifAlarmURI(idx, "ifInErrors")].status = alarm.NORMAL;
    myAlarms[ifAlarmURI(idx, "ifInErrors")].text = 0;

    // ifOutErrors
    createTextAlarm(ifAlarmURI(idx, "ifOutErrors"), "TX Errors", ifAlarmPath(idx));
    myAlarms[ifAlarmURI(idx, "ifOutErrors")].status = alarm.NORMAL;
    myAlarms[ifAlarmURI(idx, "ifOutErrors")].text = 0;

    // ifInDiscards
    createTextAlarm(ifAlarmURI(idx, "ifInDiscards"), "RX Discards", ifAlarmPath(idx));
    myAlarms[ifAlarmURI(idx, "ifInDiscards")].status = alarm.NORMAL;
    myAlarms[ifAlarmURI(idx, "ifInDiscards")].text = 0;

    // ifOutDiscards
    createTextAlarm(ifAlarmURI(idx, "ifOutDiscards"), "TX Discards", ifAlarmPath(idx));
    myAlarms[ifAlarmURI(idx, "ifOutDiscards")].status = alarm.NORMAL;
    myAlarms[ifAlarmURI(idx, "ifOutDiscards")].text = 0;

    // Error Threshold
    allThresholdErrors[idx] = createTextAlarm(ifAlarmURI(idx, "ifErrors_Threshold"), "Errors Threshold", ifAlarmPath(idx));
    myAlarms[ifAlarmURI(idx, "ifErrors_Threshold")].text = TxRxerrors;

    // Discard Threshold
    allThresholdDiscards[idx] = createTextAlarm(ifAlarmURI(idx, "ifDiscards_Threshold"), "Discards Threshold", ifAlarmPath(idx));
    myAlarms[ifAlarmURI(idx, "ifDiscards_Threshold")].text = TxRxdiscard;

}

function destroyInterfaceAlarms(idx) {
    myAlarms[ifAlarmURI(idx, "ifDescr")].live = false;
    myAlarms[ifAlarmURI(idx, "ifOperStatus")].live = false; // TODO set alarm.DISABLED instead of destroying it
    myAlarms[ifAlarmURI(idx, "ifSpeed")].live = false;
    myAlarms[ifAlarmURI(idx, "rxUtil")].live = false;
    myAlarms[ifAlarmURI(idx, "txUtil")].live = false;
    myAlarms[ifAlarmURI(idx, "ifInErrors")].live = false;
    myAlarms[ifAlarmURI(idx, "ifOutErrors")].live = false;
    myAlarms[ifAlarmURI(idx, "ifInDiscards")].live = false;
    myAlarms[ifAlarmURI(idx, "ifOutDiscards")].live = false;
    myAlarms[ifAlarmURI(idx, "ifErrors_Threshold")].live = false;
    myAlarms[ifAlarmURI(idx, "ifDiscards_Threshold")].live = false;
}

function createInterfaceCounters(idx) {

    ifCounters[idx] = new Object();
    ifCounters[idx].ifSpeed = snmp.get(mib2, "ifSpeed", idx);
    ifCounters[idx].ifInOctets = snmp.get(mib2, "ifInOctets", idx);
    ifCounters[idx].ifOutOctets = snmp.get(mib2, "ifOutOctets", idx);
    ifCounters[idx].ifInErrors = snmp.get(mib2, "ifInErrors", idx);
    ifCounters[idx].ifOutErrors = snmp.get(mib2, "ifOutErrors", idx);
    ifCounters[idx].ifInDiscards = snmp.get(mib2, "ifInDiscards", idx);
    ifCounters[idx].ifOutDiscards = snmp.get(mib2, "ifOutDiscards", idx);

    var now = new Date();

    samplingStatsErrorRx[idx] = new Object();
    samplingStatsErrorRx[idx].started = now;
    samplingStatsErrorRx[idx].ifInErrorsStart = ifCounters[idx].ifInErrors;

    samplingStatsErrorTx[idx] = new Object();
    samplingStatsErrorTx[idx].started = now;
    samplingStatsErrorTx[idx].ifOutErrorsStart = ifCounters[idx].ifOutErrors;

    samplingStatsDiscardTx[idx] = new Object();
    samplingStatsDiscardTx[idx].started = now;
    samplingStatsDiscardTx[idx].ifInDiscards = ifCounters[idx].ifInDiscards;

    samplingStatsDiscardRx[idx] = new Object();
    samplingStatsDiscardRx[idx].started = now;
    samplingStatsDiscardRx[idx].ifOutDiscards = ifCounters[idx].ifOutDiscards;

    return;
}

function computeInterfaceCounters(idx, interval) {

    var currentValue = 0;
    // ifCurrentText.text = idx;

    // ifInOctets for RX Utilization
    currentValue = snmp.get(mib2, "ifInOctets", idx);
    if (currentValue >= ifCounters[idx].ifInOctets) {
        var result = Math.round((currentValue - ifCounters[idx].ifInOctets) * 8 * 100 / (interval * ifCounters[idx].ifSpeed)) + " %";
        myAlarms[ifAlarmURI(idx, "rxUtil")].text = result;
        myAlarms[ifAlarmURI(ifDescriptions[idx], "rxUtil")].text = result;
    }
    ifCounters[idx].ifInOctets = currentValue;

    // ifOutOctets for TX Utilization
    currentValue = snmp.get(mib2, "ifOutOctets", idx);
    if (currentValue >= ifCounters[idx].ifOutOctets) {
        var result = Math.round((currentValue - ifCounters[idx].ifOutOctets) * 8 * 100 / (interval * ifCounters[idx].ifSpeed)) + " %";
        myAlarms[ifAlarmURI(idx, "txUtil")].text = result;
        myAlarms[ifAlarmURI(ifDescriptions[idx], "txUtil")].text = result;
    }
    ifCounters[idx].ifOutOctets = currentValue;

    // start of threshold computations
    // ifInErrors alarms Thresholding calculation
    var now = new Date();
    // Calculate Threshold for sampling period OR reset sampling if exceeded
    if (myAlarms[ifAlarmURI(idx, "ifOperStatus")].status == alarm.DISABLED || myAlarms[ifAlarmURI(idx, "ifOperStatus")].status == alarm.ERROR) {
        myAlarms[ifAlarmURI(idx, "ifInErrors")].status = alarm.DISABLED;
        myAlarms[ifAlarmURI(idx, "ifInErrors")].text = 0;
        myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInErrors")].status = alarm.DISABLED;
        myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInErrors")].text = 0;
    } else {

        if ((now - samplingStatsErrorRx[idx].started) > samplingPeriod * 1000) {
            // The Sampling period is finished - All counters reseted
            myAlarms[ifAlarmURI(idx, "ifInErrors")].text = 0;
            myAlarms[ifAlarmURI(idx, "ifInErrors")].status = alarm.NORMAL;
            myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInErrors")].text = 0;
            myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInErrors")].status = alarm.NORMAL;
            samplingStatsErrorRx[idx].started = now;
            samplingStatsErrorRx[idx].ifInErrorsStart = snmp.get(mib2, "ifInErrors", idx);
        } else {
            currentValue = snmp.get(mib2, "ifInErrors", idx);
            var samplingErrors = currentValue - samplingStatsErrorRx[idx].ifInErrorsStart;
            myAlarms[ifAlarmURI(idx, "ifInErrors")].text = samplingErrors;
            myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInErrors")].text = samplingErrors;
            if (samplingErrors >= allThresholdErrors[idx].text) {
                // Threshold hit. Setting myAlarms to warning
                myAlarms[ifAlarmURI(idx, "ifInErrors")].status = alarm.WARNING;
                myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInErrors")].status = alarm.WARNING;
            } else {
                myAlarms[ifAlarmURI(idx, "ifInErrors")].status = alarm.NORMAL;
                myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInErrors")].status = alarm.NORMAL;
            }
        }
    }

    // ifOutErrors
    // Calculate Threshold for sampling period OR reset sampling if exceeded
    if (myAlarms[ifAlarmURI(idx, "ifOperStatus")].status == alarm.DISABLED || myAlarms[ifAlarmURI(idx, "ifOperStatus")].status == alarm.ERROR) {
        myAlarms[ifAlarmURI(idx, "ifOutErrors")].status = alarm.DISABLED;
        myAlarms[ifAlarmURI(idx, "ifOutErrors")].text = 0;
        myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutErrors")].status = alarm.DISABLED;
        myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutErrors")].text = 0;
    } else {
        if ((now - samplingStatsErrorTx[idx].started) > samplingPeriod * 1000) {
            // The Sampling period is finished - All counters reseted
            myAlarms[ifAlarmURI(idx, "ifOutErrors")].text = 0;
            myAlarms[ifAlarmURI(idx, "ifOutErrors")].status = alarm.NORMAL;
            myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutErrors")].text = 0;
            myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutErrors")].status = alarm.NORMAL;
            samplingStatsErrorTx[idx].started = now;
            samplingStatsErrorTx[idx].ifOutErrorsStart = snmp.get(mib2, "ifOutErrors", idx);
        } else {
            currentValue = snmp.get(mib2, "ifOutErrors", idx);
            var samplingErrors = currentValue - samplingStatsErrorTx[idx].ifOutErrorsStart;
            myAlarms[ifAlarmURI(idx, "ifOutErrors")].text = samplingErrors;
            myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutErrors")].text = samplingErrors;
            if (samplingErrors >= allThresholdErrors[idx].text) {
                // Threshold hit. Setting alarms to warning
                myAlarms[ifAlarmURI(idx, "ifOutErrors")].status = alarm.WARNING;
                myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutErrors")].status = alarm.WARNING;
            } else {
                myAlarms[ifAlarmURI(idx, "ifOutErrors")].status = alarm.NORMAL;
                myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutErrors")].status = alarm.NORMAL;
            }
        }
    }

    // ifInDiscards
    // Calculate Threshold for sampling period OR reset sampling if exceeded
    if (myAlarms[ifAlarmURI(idx, "ifOperStatus")].status == alarm.DISABLED || myAlarms[ifAlarmURI(idx, "ifOperStatus")].status == alarm.ERROR) {
        myAlarms[ifAlarmURI(idx, "ifInDiscards")].status = alarm.DISABLED;
        myAlarms[ifAlarmURI(idx, "ifInDiscards")].text = 0;
        myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInDiscards")].status = alarm.DISABLED;
        myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInDiscards")].text = 0;
    } else {
        if ((now - samplingStatsDiscardTx[idx].started) > samplingPeriod * 1000) {
            // The Sampling period is finished - All counters reseted
            myAlarms[ifAlarmURI(idx, "ifInDiscards")].text = 0;
            myAlarms[ifAlarmURI(idx, "ifInDiscards")].status = alarm.NORMAL;
            myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInDiscards")].text = 0;
            myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInDiscards")].status = alarm.NORMAL;
            samplingStatsDiscardTx[idx].started = now;
            samplingStatsDiscardTx[idx].ifInDiscards = snmp.get(mib2, "ifInDiscards", idx);
        } else {
            currentValue = snmp.get(mib2, "ifInDiscards", idx);
            var samplingErrors = currentValue - samplingStatsDiscardTx[idx].ifInDiscards;
            myAlarms[ifAlarmURI(idx, "ifInDiscards")].text = samplingErrors;
            myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInDiscards")].text = samplingErrors;
            if (samplingErrors >= allThresholdDiscards[idx].text) {
                // Threshold hit. Setting alarms to warning
                myAlarms[ifAlarmURI(idx, "ifInDiscards")].status = alarm.WARNING;
                myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInDiscards")].status = alarm.WARNING;
            } else {
                myAlarms[ifAlarmURI(idx, "ifInDiscards")].status = alarm.NORMAL;
                myAlarms[ifAlarmURI(ifDescriptions[idx], "ifInDiscards")].status = alarm.NORMAL;
            }
        }
    }

    // ifOutDiscards
    // Calculate Threshold for sampling period OR reset sampling if exceeded
    if (myAlarms[ifAlarmURI(idx, "ifOperStatus")].status == alarm.DISABLED || myAlarms[ifAlarmURI(idx, "ifOperStatus")].status == alarm.ERROR) {
        myAlarms[ifAlarmURI(idx, "ifOutDiscards")].status = alarm.DISABLED;
        myAlarms[ifAlarmURI(idx, "ifOutDiscards")].text = 0;
        myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutDiscards")].status = alarm.DISABLED;
        myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutDiscards")].text = 0;
    } else {
        if ((now - samplingStatsDiscardRx[idx].started) > samplingPeriod * 1000) {
            // The Sampling period is finished - All counters reseted
            myAlarms[ifAlarmURI(idx, "ifOutDiscards")].text = 0;
            myAlarms[ifAlarmURI(idx, "ifOutDiscards")].status = alarm.NORMAL;
            myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutDiscards")].text = 0;
            myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutDiscards")].status = alarm.NORMAL;
            samplingStatsDiscardRx[idx].started = now;
            samplingStatsDiscardRx[idx].ifOutDiscards = snmp.get(mib2, "ifOutDiscards", idx);
        } else {
            currentValue = snmp.get(mib2, "ifOutDiscards", idx);
            var samplingErrors = currentValue - samplingStatsDiscardRx[idx].ifOutDiscards;
            myAlarms[ifAlarmURI(idx, "ifOutDiscards")].text = samplingErrors;
            myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutDiscards")].text = samplingErrors;
            if (samplingErrors >= allThresholdDiscards[idx].text) {
                // Threshold hit. Setting alarms to warning
                myAlarms[ifAlarmURI(idx, "ifOutDiscards")].status = alarm.WARNING;
                myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutDiscards")].status = alarm.WARNING;
            } else {
                myAlarms[ifAlarmURI(idx, "ifOutDiscards")].status = alarm.NORMAL;
                myAlarms[ifAlarmURI(ifDescriptions[idx], "ifOutDiscards")].status = alarm.NORMAL;
            }
        }
    }
    // end of threshold computations

}

/**
 * Find the nb items in a table, and populate the indices table.
 * 
 * @param varToUse A variable, like 'cefexConfigExtenderName'.
 * @param indices tables of indices to populate
 */
function findFEXTableSize(mib, varToUse, indices) {
    try {
        
        var tablesize = 0;
        var oidStr = snmp.getOID(mib, varToUse); // eg. '.1.3.6.1.4.1.9.9.691.1.1.2.1.1.0'
        
        if (oidStr.substring(oidStr.lastIndexOf(".") + 1) == "0") {
            oidStr = oidStr.substring(0, oidStr.lastIndexOf(".")); // remove ending '.0' -> '.1.3.6.1.4.1.9.9.691.1.1.2.1.1'
        }

        var myVar = snmp.getNextVB(mib, varToUse, 0);

        while (myVar.oid.indexOf(oidStr) != -1) {

            indices.push(myVar.oid.replace(oidStr + '.', ''));
            tablesize++;
            myVar = snmp.getNextVB(myVar.oid);
        }
    } catch (ex) {
        log.error(host + " findFEXTableSize: - error: " + ex + " - Setting table size to 0.");
        return 0;
    }

    return tablesize;
 }


/**
 * createFEXAlarms.
 * 
 * From Snmp walk:
 *  - cefexConfigExtenderName.129:-->FEX0129
 *  - cefexConfigSerialNumCheck.129:-->false(2)
 *  - efexConfigSerialNum.129:-->
 *  - cefexConfigPinningFailOverMode.129:-->1
 *  - cefexConfigPinningMaxLinks.129:-->1
 *  - cefexConfigCreationTime.129:-->0 hours, 0 minutes, 0 seconds.
 *  - cefexConfigRowStatus.129:-->active(1)
 */
function createFEXAlarms(idx) {   
    createTextAlarm(fexAlarmURI(idx, "cefexConfigExtenderName"), "cefexConfigExtenderName", fexAlarmPath(idx));
    createTextAlarm(fexAlarmURI(idx, "cefexConfigSerialNumCheck"), "cefexConfigSerialNumCheck", fexAlarmPath(idx));
    createTextAlarm(fexAlarmURI(idx, "cefexConfigSerialNum"), "cefexConfigSerialNum", fexAlarmPath(idx));
    createTextAlarm(fexAlarmURI(idx, "cefexConfigExtenderName"), "cefexConfigExtenderName", fexAlarmPath(idx));
    createTextAlarm(fexAlarmURI(idx, "cefexConfigPinningFailOverMode"), "cefexConfigPinningFailOverMode", fexAlarmPath(idx));
    createTextAlarm(fexAlarmURI(idx, "cefexConfigPinningMaxLinks"), "cefexConfigPinningMaxLinks", fexAlarmPath(idx));
    createTextAlarm(fexAlarmURI(idx, "cefexConfigCreationTime"), "cefexConfigCreationTime", fexAlarmPath(idx));
    createTextAlarm(fexAlarmURI(idx, "cefexConfigRowStatus"), "cefexConfigRowStatus", fexAlarmPath(idx));
}


/**
 * Get value of Fabric Extender alarm.
 *
 * @param index
 */

/*
function getFEXAlarm(index) {

 try {
     // Description
     myAlarms[ifAlarmURI(index, "ifDescr")].text = snmp.get(mib2, "ifDescr", index);
     myAlarms[ifAlarmURI(ifDescriptions[index], "ifDescr")].text = index;

     // Link UP/Link Down
     // check admin status
     if ((snmp.get(mib2, "ifAdminStatus", index)) != 1) {
         myAlarms[ifAlarmURI(index, "ifOperStatus")].status = alarm.DISABLED;
         myAlarms[ifAlarmURI(ifDescriptions[index], "ifOperStatus")].status = alarm.DISABLED;
     } else {
         myAlarms[ifAlarmURI(index, "ifOperStatus")].status = (snmp.get(mib2, "ifOperStatus", index) == 1 ? alarm.NORMAL : alarm.ERROR);
         myAlarms[ifAlarmURI(ifDescriptions[index], "ifOperStatus")].status = myAlarms[ifAlarmURI(index, "ifOperStatus")].status;
     }
     // Speed
     myAlarms[ifAlarmURI(index, "ifSpeed")].text = snmp.get(mib2, "ifSpeed", index) / 1000000;
     myAlarms[ifAlarmURI(ifDescriptions[index], "ifSpeed")].text = myAlarms[ifAlarmURI(index, "ifSpeed")].text;
 } catch (ex) {
     log.error(host + ": RMON : Exception Unkown interface index " + index + ": " + ex.rhinoException);
     throw ex;

 }

}

*/

function saveThreshold() {
    log.debug("START:: saveThreshold");
    var hashMapError = new java.util.HashMap();
    var hashMapDiscard = new java.util.HashMap();
    for ( var idx in allThresholdErrors) {
        var errorThreshold = allThresholdErrors[idx].text;
        if (errorThreshold != undefined) {
            hashMapError.put(idx, new java.lang.String(allThresholdErrors[idx].text));
        }
    }
    for ( var idx in allThresholdDiscards) {
        var discardThreshold = allThresholdDiscards[idx].text;
        if (discardThreshold != undefined) {
            hashMapDiscard.put(idx, new java.lang.String(allThresholdDiscards[idx].text));
        }
    }

    try {
        var fos = new java.io.FileOutputStream(errorThresholdPersistency);
        var oos = new java.io.ObjectOutputStream(fos);
        oos.writeObject(hashMapError);
        oos.flush();
    } catch (ex) {
        log.error("Error while trying to save on the file :: saveThreshold - " + ex);
    }

    try {
        var fos = new java.io.FileOutputStream(discardThresholdPersistency);
        var oos = new java.io.ObjectOutputStream(fos);
        oos.writeObject(hashMapDiscard);
        oos.flush();
    } catch (ex) {
        log.error("Error while trying to save on the file :: saveThreshold - " + ex);
    }
    log.debug("END:: saveThreshold");
}

function loadThreshold() {
    log.debug("START:: loadThreshold");
    try {
        var fis = new java.io.FileInputStream(errorThresholdPersistency);
        var ois = new java.io.ObjectInputStream(fis);
        var hashMap = ois.readObject();
        var iterator = hashMap.keySet().iterator();
        while (iterator.hasNext()) {
            var idx = iterator.next();
            var errorThreshold = hashMap.get(idx);
            try {
                allThresholdErrors[idx].text = errorThreshold;
            } catch (e) {
                log.error("Unknown port number: " + idx);
            }
        }
    } catch (e) {
        log.warn("loadThreshold:: There is no error threshold to load into memory. Root Cause: " + e);
        return;
    }

    try {
        var fis = new java.io.FileInputStream(discardThresholdPersistency);
        var ois = new java.io.ObjectInputStream(fis);
        var hashMap = ois.readObject();
        var iterator = hashMap.keySet().iterator();
        while (iterator.hasNext()) {
            var idx = iterator.next();
            var discardThreshold = hashMap.get(idx);
            try {
                allThresholdDiscards[idx].text = discardThreshold;
            } catch (e) {
                log.error("Unknown port number: " + idx);
            }
        }
    } catch (e) {
        log.warn("loadThreshold:: There is no discard threshold to load into memory. Root Cause: " + e);
        return;
    }
    log.debug("END:: loadThreshold");
}

var alarmOverall = new Object();
var subs = new Array();

function createInterfaceOverall(idx) {
    // Virtual Overall Alarm Creation
    if (myAlarms[ifAlarmURI(idx, "Overall")] == undefined) {
        log.info(host + " : creating Interface Overall: " + idx);
        alarmOverall.path = ifAlarmPath(idx);
        alarmOverall.name = ifAlarmURI(idx, "Overall", "virtual");
        alarmOverall.mode = "OR";

        subs[0] = ifAlarmURI(idx, "ifOperStatus");
        subs[1] = ifAlarmURI(idx, "ifInDiscards");
        subs[2] = ifAlarmURI(idx, "ifOutDiscards");
        subs[3] = ifAlarmURI(idx, "ifInErrors");
        subs[4] = ifAlarmURI(idx, "ifOutErrors");

        gsm.addVirtualAlarm(alarmOverall, subs);
    }
}

function destroyInterfaceOverall(idx) {
    myAlarms[ifAlarmURI(idx, "Overall")].live = false;
}

function resetAlarms() {

    // myAlarms[textAlarmURI("sysName")].text = "~";
    // alarms[textAlarmURI("sysUpTime")].text = null;
    // myAlarms[textAlarmURI("sysDescr")].text = "~";
    // myAlarms[textAlarmURI("sysContact")].text = "~";
    // myAlarms[textAlarmURI("sysLocation")].text = "~";

    for ( var i = 0; i < ifNumber; i++) {
        // myAlarms[ifAlarmURI(ifIndexes[i],"ifDescr")].text = "~";
        myAlarms[ifAlarmURI(ifIndexes[i], "ifOperStatus")].status = resetAlarmsSeverity;
        myAlarms[ifAlarmURI(ifDescriptions[ifIndexes[i]], "ifOperStatus")].status = resetAlarmsSeverity;
        // myAlarms[ifAlarmURI(ifIndexes[i],"ifSpeed")].text = "~";
        // myAlarms[ifAlarmURI(ifIndexes[i],"ifInDiscards")].status = alarm.UNKNOWN;
        // myAlarms[ifAlarmURI(ifIndexes[i],"ifOutDiscards")].status = alarm.UNKNOWN;
        // myAlarms[ifAlarmURI(ifIndexes[i],"ifInErrors")].status = alarm.UNKNOWN;
        // myAlarms[ifAlarmURI(ifIndexes[i],"ifOutErrors")].status = alarm.UNKNOWN;
        // myAlarms[ifAlarmURI(ifIndexes[i],"ifInDiscards")].text = "~";
        // myAlarms[ifAlarmURI(ifIndexes[i],"ifOutDiscards")].text = "~";
        // myAlarms[ifAlarmURI(ifIndexes[i],"ifInErrors")].text = "~";
        // myAlarms[ifAlarmURI(ifIndexes[i],"ifOutErrors")].text = "~";
        // myAlarms[ifAlarmURI(ifIndexes[i],"rxUtil")].text = "~";
        // myAlarms[ifAlarmURI(ifIndexes[i],"txUtil")].text = "~";
    }
    for ( var i = 0; i < rmonSize; i++) {
        myAlarms[rmonAlarmURI(rmonIndexes[i])].status = alarm.UNKNOWN;
    }

    // Make all Nexus7000 health alarms UNKNOWN
    try {
        for ( var indN in Nexus7000LEDIndexes) {
            myAlarms[uriPrefix + "/chassisLEDs/" + Nexus7000LEDIndexes[indN]].status = alarm.UNKNOWN;
        }
    } catch (ex) {
    }

}

function rmonAlarmURI(alarmIndex) {// eg. "snmp://RMON:10.12.170.88/Alarm@3"
    return uriPrefix + "/Alarm@" + alarmIndex;
}

function rmonDescription(description, index) {
    return description + " (" + index + ")";
}

function textAlarmURI(name) { // 
    return uriPrefix + "/" + name;
}

function ifAlarmURI(index, name, virtual) {
    if (virtual == "virtual") {
        return virtualUriPrefix + "/" + name + index;
    } else {
        return uriPrefix + "/" + name + java.net.URLEncoder.encode(index, "UTF-8");
    }
}

function ifAlarmPath(index) {
    return path + "/Interface/" + index;
}

// Example 'snmp://RMON:10.12.170.99/cefexConfigExtenderName12'
function fexAlarmURI(index, name) {
    return uriPrefix + "/" + name + java.net.URLEncoder.encode(index, "UTF-8");
}

// Example, SNMP/RMON/10.12.170.99/FEX/12
function fexAlarmPath(index) {
    return path + "/FEX/" + index;
}

// Function to create GSM Alarm
function createAlarm(uri, description, path) {
    /*
     * We sometimes create alarms with URIs using data coming from the device, and there is no garantee that what is
     * returned is different for different ports, so make sure the alarm is created only once
     */
    if (myAlarms[uri]) {
        myAlarms[uri].live = true; // republish alarms properly after restart or communication loss
        log.error("Error: Trying to create status alarm " + uri + " but it already exists");
        return myAlarms[uri];
    }
    log.info(host + " : creating Alarm: " + uri);
    myAlarms[uri] = gsm.addAlarm(uri, description, path, "RMON", deviceURI);
    return myAlarms[uri];
}

// Function to create GSM Text Alarm
function createTextAlarm(uri, description, path) {
    /*
     * We sometimes create alarms with URIs using data coming from the device, and there is no garantee that what is
     * returned is different for different ports, so make sure the alarm is created only once
     */
    if (myAlarms[uri]) {
        myAlarms[uri].live = true; // republish alarms properly after restart or communication loss
        log.error("Error: Trying to create text alarm " + uri + " but it already exists");
        return myAlarms[uri];
    }
    log.info(host + " : creating TextAlarm: " + uri);
    myAlarms[uri] = gsm.addAlarm(uri, description, path, "RMON", deviceURI, alarmType); // text or
    // textnotlogged
    return myAlarms[uri];
}

function stripOID(oid) {
    return oid.substring(0, oid.lastIndexOf("."));
}
// Function to find the content of an object inside a trap. This function is necessary
// when dealing with traps returning information from a table: The last number of the OID
// is not ".0" and there's no easy way to guess it, so we ignore this last number
// eventvar_array: the event.variables array sent by the trap
// oid: The oid of the object we're expecting (with a trailing ".0")
function getVariable(eventvar_array, oid) {
    var prefixOID = stripOID(oid);
    for ( var i in eventvar_array) {
        if (i.indexOf(prefixOID) != -1) {
            return eventvar_array[i];
            break;
        }
    }

}

var trapOIDOID = stripOID(snmp.getOID(snmpv2mib, "snmpTrapOID"));
var coldStartOID = stripOID(snmp.getOID(snmpv2mib, "coldStart"));
var warmStartOID = stripOID(snmp.getOID(snmpv2mib, "warmStart"));
var ifIndexOID2 = stripOID(snmp.getOID(mib2, "ifIndex"));
var linkDownOID = stripOID(snmp.getOID(ifmib, "linkDown"));
var linkUpOID = stripOID(snmp.getOID(ifmib, "linkUp"));

trapper.onTrap = function onTrap(event) {
    // We got a Trap, we need to filter
    if (event.agentAddress != host) {
        return;
    }

    log.debug(host + ": " + "TRAP! agent: " + event.agentAddress + "  community: " + event.community + "  enterprise: " + event.enterprise
            + "  uptime: " + event.upTime + "  remote host: " + event.remoteHost + ":" + event.remotePort + "  trap type: " + event.trapType + " ("
            + event.specificType + ")" + "  version: " + event.version);
    for ( var i in event.variables) {
        log.debug(host + ": " + "      " + i + " = " + event.variables[i]);
    }

    //var index;

    if (event.version == 1) { // Version 2c
        var trapOID = getVariable(event.variables, trapOIDOID);
        if (trapOID == linkDownOID) {
            var index = getVariable(event.variables, ifIndexOID2);
            // this will update all status info, in particular the interface speed which may have changed.
            getInterfaceAlarms(index);
            // This will ensure that the operational status is updated even if the switch did not update its
            // ifTable (i.e. Cisco)
            myAlarms[ifAlarmURI(index, "ifOperStatus")].status = alarm.ERROR;
            myAlarms[ifAlarmURI(ifDescriptions[index], "ifOperStatus")].status = alarm.ERROR;
        }
        if (trapOID == linkUpOID) {
            var index = getVariable(event.variables, ifIndexOID2);
            // this will update all status info, in particular the interface speed which may have changed.
            getInterfaceAlarms(index);
            // This will ensure that the operational status is updated even if the switch did not update its
            // ifTable (i.e. Cisco)
            myAlarms[ifAlarmURI(index, "ifOperStatus")].status = alarm.NORMAL;
            myAlarms[ifAlarmURI(ifDescriptions[index], "ifOperStatus")].status = alarm.NORMAL;
        }
        if (trapOID == coldStartOID || trapOID == warmStartOID) {
            resetAlarms();
        }
    } else if (event.version == 0) { // Version 1
        if (event.trapType == event.coldStart || event.trapType == event.warmStart) {
            resetAlarms();
        } else if (event.trapType == event.linkUp) {
            index = findIndex(event.variables);
            // this will update all status info, in particular the interface speed which may have changed.
            getInterfaceAlarms(index);
            // This will ensure that the operational status is updated even if the switch did not update its
            // ifTable (i.e. Cisco)
            myAlarms[ifAlarmURI(index, "ifOperStatus")].status = alarm.NORMAL;
            myAlarms[ifAlarmURI(ifDescriptions[index], "ifOperStatus")].status = alarm.NORMAL;
        } else if (event.trapType == event.linkDown) {
            index = findIndex(event.variables);
            // this will update all status info, in particular the interface speed which may have changed.
            getInterfaceAlarms(index);
            // This will ensure that the operational status is updated even if the switch did not update its
            // ifTable (i.e. Cisco)
            myAlarms[ifAlarmURI(index, "ifOperStatus")].status = alarm.ERROR;
            myAlarms[ifAlarmURI(ifDescriptions[index], "ifOperStatus")].status = alarm.ERROR;
        } else if (event.trapType == event.enterpriseSpecific && rmonSize != 0) {
            index = findIndex(event.variables);
            // java.lang.System.out.println("alarm index " + index);
            if (event.specificType == '1') {
                // It's a rising alarm.
                myAlarms[rmonAlarmURI(index)].status = alarm.ERROR;
            } else if (event.specificType == '2') {
                // It's a falling alarm.
                myAlarms[rmonAlarmURI(index)].status = alarm.NORMAL;
            }

        }
    }
};

// **************************************************************************************************************
// ************************************* START:: RMONAPI(val) **************************************
// **************************************************************************************************************
// @Description : Expose public methods to the UI context
function RMONAPI(val) {

    // FUNCTION - setThresholdError(port,value) set the number of allowed Error packets that a switch/port is
    // allowed.
    // It sets both the TX and RX threshold for Error packets
    this.setThresholdError = function setThresholdError(port, value) {
        try {
            log.debug("function call:: setThresholdError(" + port + "," + value + ")");
            allThresholdErrors[port].text = value;
            saveThreshold();
            log.debug("END :: setThresholdError:: allThresholdErrors[port].text = " + allThresholdErrors[port].text);
        } catch (e) {
            log.error("FATAL::: " + e);
        }
    };

    // FUNCTION - setThresholdDiscard(port,value) set the number of allowed Discarded packets that a
    // switch/port is allowed.
    // It sets both the TX and RX threshold for Discard packets
    this.setThresholdDiscard = function setThresholdDiscard(port, value) {
        try {
            log.debug("function call:: setThresholdDiscard(" + port + "," + value + ")");
            allThresholdDiscards[port].text = value;
            saveThreshold();
            log.debug("END :: setThresholdDiscard:: allThresholdDiscards[port].text = " + allThresholdDiscards[port].text);
        } catch (e) {
            log.error("FATAL::: " + e);
        }
    };

    // FUNCTION - incrementThresholdError(port) increments the number of allowed Error packets that a
    // switch/port is allowed.
    // It sets both the TX and RX threshold for Error packets
    this.incrementThresholdError = function incrementThresholdError(port) {
        try {
            log.debug("function call:: incrementThresholdError(" + port + ")");
            var currentValue = parseInt(allThresholdErrors[port].text);
            var newThreshold = currentValue + 50;
            log.debug("newThreshold = " + newThreshold);
            allThresholdErrors[port].text = newThreshold;
            saveThreshold();
            log.debug("END :: incrementThresholdError:: allThresholdErrors[port].text = " + allThresholdErrors[port].text);
        } catch (e) {
            log.error("FATAL::: " + e);
        }
    };

    // FUNCTION - incrementThresholdDiscard(port) increments the number of allowed Discard packets that a
    // switch/port is allowed.
    // It sets both the TX and RX threshold for Discard packets
    this.incrementThresholdDiscard = function incrementThresholdDiscard(port) {
        try {
            log.debug("function call:: incrementThresholdDiscard(" + port + ")");
            var currentValue = parseInt(allThresholdDiscards[port].text);
            var newThreshold = currentValue + 50;
            log.debug("newThreshold = " + newThreshold);
            allThresholdDiscards[port].text = newThreshold;
            saveThreshold();
            log.debug("END :: incrementThresholdDiscard:: allThresholdDiscards[port].text = " + allThresholdDiscards[port].text);
        } catch (e) {
            log.error("FATAL::: " + e);
        }
    };

    // FUNCTION - decrementThresholdError(port) decrements the number of allowed Error packets that a
    // switch/port is allowed.
    // It sets both the TX and RX threshold for Error packets
    this.decrementThresholdError = function decrementThresholdError(port) {
        try {
            log.debug("function call:: decrementThresholdError(" + port + ")");
            var currentValue = parseInt(allThresholdErrors[port].text);
            if (allThresholdErrors[port].text <= 50) {
                allThresholdErrors[port].text = 0;
            } else {
                var newThreshold = currentValue - 50;
                log.debug("newThreshold = " + newThreshold);
                allThresholdErrors[port].text = newThreshold;
            }
            saveThreshold();
            log.debug("END :: decrementThresholdError:: allThresholdErrors[port].text = " + allThresholdErrors[port].text);
        } catch (e) {
            log.error("FATAL::: " + e);
        }
    };

    // FUNCTION - decrementThresholdDiscard(port) decrements the number of allowed Discard packets that a
    // switch/port is allowed.
    // It sets both the TX and RX threshold for Discard packets
    this.decrementThresholdDiscard = function decrementThresholdDiscard(port) {
        try {
            log.debug("function call:: decrementThresholdDiscard(" + port + ")");
            var currentValue = parseInt(allThresholdDiscards[port].text);
            if (allThresholdDiscards[port].text <= 50) {
                allThresholdDiscards[port].text = 0;
            } else {
                var newThreshold = currentValue - 50;
                log.debug("newThreshold = " + newThreshold);
                allThresholdDiscards[port].text = newThreshold;
            }
            saveThreshold();
            log.debug("END :: decrementThresholdDiscard:: allThresholdDiscards[port].text = " + allThresholdDiscards[port].text);
        } catch (e) {
            log.error("FATAL::: " + e);
        }
    };

    // FUNCTION - setSamplingPeriod() sets the sampling period time the threshold are compared with.
    // It sets the sampling period at the Switch level and not at the port level
    this.setSamplingPeriod = function setSamplingPeriod(value) {
        log.debug("setSamplingPeriod(value) = NOT IMPLEMENTED");
    };

    // FUNCTION - incrementSamplingPeriod() increments the sampling period time the threshold are compared
    // with.
    // It sets the sampling period at the Switch level and not at the port level
    this.incrementSamplingPeriod = function incrementSamplingPeriod() {
        log.debug("incrementSamplingPeriod(port) = NOT IMPLEMENTED");
    };

    // FUNCTION - decrementSamplingPeriod() decrements the sampling period time the threshold are compared
    // with.
    // It sets the sampling period at the Switch level and not at the port level
    this.decrementSamplingPeriod = function decrementSamplingPeriod() {
        log.error("decrementSamplingPeriod(port) = NOT IMPLEMENTED");
    };
}

/*
 * These functions should be available to other javascript on the GSM. I did not use the RMONAPI because I did not see
 * the necessity. TODO: We should not be doing sets in a separate thread without a coordination with the plugin onResult
 * thread.
 */
this.enablePort = function(portNum) {
    log.debug("RMON.enablePort - enabling port " + portNum + " on device " + host);
    var ret = snmp.set(mib2, "ifAdminStatus", portNum, "1");

    log.debug("RMON.enablePort Return value from snmp.set for device " + host + " port " + portNum + ": " + ret);
    /*
     * Return value will be null if write community is incorrect.
     */
    if (ret == null) {
        return null;
    }
    /*
     * Read the port status from the switch ASAP, by jumping the line of the next port that will be checked. If not if
     * could take a long time to know the effective state of the port. TODO: MAybe we should just set the ifOperStatus
     * alarm directly.
     */
    if (indexManager) {
        indexManager.jumpLine(portNum);
    }
    return ret;
};

this.disablePort = function(portNum) {
    log.debug("RMON.disablePort - disabling port " + portNum + " on device " + host);
    var ret = snmp.set(mib2, "ifAdminStatus", portNum, "2");
    log.debug("RMON.disablePort Return value from snmp.set for device " + host + " port " + portNum + ": " + ret);

    if (ret == null) {
        return null;
    }

    if (indexManager) {
        indexManager.jumpLine(portNum);
    }
    return ret;
};

this.getPortStatus = function(portNum) {
    var res = snmp.get(mib2, "ifOperStatus", portNum);
    log.debug("RMON.getPortStatus - for port " + portNum + " on device " + host + " values = " + res);
    return res;
};

this.isPortEnabled = function(portNum) {
    if (this.getPortStatus(portNum) == "1") {
        return true;
    }
    return false;
};

// --- Create the iPlexAPI at the navigator level to make it public
var obj = new RMONAPI("rmon");

// With multiple switch to monitor, if one of the plugin re-create the array,
// it will remove previously created Navigator API instances.
// So we check if the object as already been initialize before creating it
if (navigator.RMONAPI == undefined) {
    navigator.RMONAPI = new Array();
}
navigator.RMONAPI[host] = obj;


// ***********************************************************************************************************
// ************************************* END:: RMONAPI(val) **************************************
// ************************************************************************************************************

// Assumes that the oids are all for the same index
// which is the case for linkUp/linkDown traps and rmon traps.
function findIndex(variables) {
    for ( var oid in variables) {
        return variables[oid].substring(variables[oid].lastIndexOf("."), variables[oid].length);
    }
}

// ***********************************************************************************************************
// ************************************* CISCO HEALTH MONITORING **********************************
// ************************************************************************************************************

// Create and init poller
var hmPoller = new SNMPPoller();
hmPoller.autoActive = false;
hmPoller.targetHost = host;
hmPoller.pollInterval = 10;
hmPoller.readCommunity = readCommunity;
hmPoller.retries = retries;
hmPoller.timeout = timeout;
hmPoller.plugin = this;
var cpuIndexes = new Array();
var Nexus7000LEDIndexes = new Object();

this.inHMpoller = false;

function initializeHMAlarms() {
    // log.info("L 1318 : " + host + " InitializeHMAlarms");
    // In case, poller had already been created
    hmPoller.autoActive = false;
    hmPoller.objectIDs = new Array();

    // reset Nexus7000 led alarms
    Nexus7000LEDIndexes = new Object();

    var hmSubs = new Array();
    //var subIdx = 0;
    var alarmOverallHM = new Object();

    // brocade switch health monitoring

    if (snmp.get(brocade_mib, "snChasProductType") != undefined) {
        createTextAlarm(uriPrefix + "/chassisModel", "Model", alarmPathHM).text = snmp.get(brocade_mib, "snChasProductType");

        BrocadePsuOID = snmp.getOID(brocade_mib, "snChasPwrSupplyOperStatus");
        var i = 1;
        // loop through table and get status for each available power supply, number of ps varies with model of
        // switch
        while (snmp.get(brocade_mib, 'snChasPwrSupplyOperStatus', i) != undefined) {
            createAlarm(uriPrefix + "/chassisPs" + i + "Status", "Power Supply " + i, alarmPathHM);
            hmSubs.push(uriPrefix + "/chassisPs" + i + "Status");
            i++;
        }
        // createAlarm(uriPrefix+"/chassisPs1Status","Power Supply 1", alarmPathHM);
        // createAlarm(uriPrefix+"/chassisPs2Status","Power Supply 2", alarmPathHM);
        // createAlarm(uriPrefix+"/chassisPs3Status","Power Supply 3", alarmPathHM);
        // hmSubs.push(uriPrefix+"/chassisPs1Status");
        // hmSubs.push(uriPrefix+"/chassisPs2Status");
        // hmSubs.push(uriPrefix+"/chassisPs3Status");

        // hmPoller.addObjectID(snmp.getOID(brocade_mib, "snChasPwrSupplyOperStatus"));
        hmPoller.addObjectID(snmp.getOID(brocade_mib, "snChasProductType"));
    }

    // If this switch/router supports the CISCO-STACK-MIB
    try {
        var chassisModelValue = snmp.get(chassismib, "chassisModel");
    } catch (ex) {
        chassisModelValue = null;
    }

    try {
        if (chassisModelValue && (chassisModelValue != undefined)) {

            createTextAlarm(uriPrefix + "/chassisModel", "Model or Product Type", alarmPathHM).text = snmp.get(chassismib, "chassisModel");
            createTextAlarm(uriPrefix + "/chassisSerialNumber", "Serial Number", alarmPathHM).text = snmp
                    .get(chassismib, "chassisSerialNumberString");
            createAlarm(uriPrefix + "/chassisPs1Status", "Power Supply 1", alarmPathHM);
            hmSubs.push(uriPrefix + "/chassisPs1Status");
            createAlarm(uriPrefix + "/chassisPs2Status", "Power Supply 2", alarmPathHM);
            hmSubs.push(uriPrefix + "/chassisPs2Status");
            createAlarm(uriPrefix + "/chassisFanStatus", "Fan", alarmPathHM);
            hmSubs.push(uriPrefix + "/chassisFanStatus");
            createAlarm(uriPrefix + "/chassisAlarm", "Chassis Alarm", alarmPathHM);
            hmSubs.push(uriPrefix + "/chassisAlarm");
            createAlarm(uriPrefix + "/chassisTemp", "Temperature", alarmPathHM);
            hmSubs.push(uriPrefix + "/chassisTemp");

            // add above to poller.

            hmPoller.addObjectID(snmp.getOID(chassismib, "chassisPs1Status"));
            hmPoller.addObjectID(snmp.getOID(chassismib, "chassisPs2Status"));
            hmPoller.addObjectID(snmp.getOID(chassismib, "chassisFanStatus"));
            hmPoller.addObjectID(snmp.getOID(chassismib, "chassisMinorAlarm"));
            hmPoller.addObjectID(snmp.getOID(chassismib, "chassisMajorAlarm"));
            hmPoller.addObjectID(snmp.getOID(chassismib, "chassisTempAlarm"));

        }
    } catch (ex) {

    }

    // Detect if this switch/router is a Nexus7000,
    // the Nexus7000 doesn't support CISCO-STACK-MIB
    /*
     * var isNexus7000 = false; var phDescOID = snmp.getOID(enmib,"entPhysicalDescr"); phDescOID =
     * phDescOID.substring(0,phDescOID.lastIndexOf(".")); var phDescVB = snmp.getNextVB(enmib,"entPhysicalDescr",0);
     * 
     * if(phDescVB != null){ while(phDescVB.oid.indexOf(phDescOID) != -1){ if (phDescVB.value.indexOf("Nexus7000") !=
     * -1){ isNexus7000 = true; break; } phDescVB = snmp.getNextVB(phDescVB.oid); } }
     */
    // to map Nexus7000 chassis LED labels
    /*
     * var LEDLabels = { "PSU" : "Power Supply Units", "FAN" : "Fan Tray Modules", "SUP" : "Supervisor Modules", "FAB" :
     * "Fabric Modules", "IOM" : "I/O Modules"};
     */

    // if the device is a Nexus7000, we create Alarms that correspond to
    // the Nexus7000 Chassis LEDs
    try {
        if (isNexus7000) {

            // Detect the Chassis physical Index
            var chassisIndex = null;
            var phDescOID = snmp.getOID(enmib, "entPhysicalDescr");
            phDescOID = phDescOID.substring(0, phDescOID.lastIndexOf("."));
            var phDescVB = snmp.getNextVB(enmib, "entPhysicalDescr", 0);

            while (phDescVB.oid.indexOf(phDescOID) != -1) {
                var iEntPhIndex = Number(phDescVB.oid.substring(phDescVB.oid.lastIndexOf(".") + 1));
                var phName = snmp.get(enmib, "entPhysicalName", iEntPhIndex);

                if (phName.indexOf("Chassis") != -1 && phDescVB.value.indexOf("Nexus7000") != -1) {
                    chassisIndex = iEntPhIndex;
                    break;
                }

                phDescVB = snmp.getNextVB(phDescVB.oid);
            }

            if (chassisIndex != null) {
                // walk the display table and create appropriate LED alarms
                // and add to poller, add to overall
                var displayNameOID = snmp.getOID(displayMib, "ceDisplayName");
                displayNameOID = displayNameOID.substring(0, displayNameOID.lastIndexOf("."));
                var displayNameVB = snmp.getNextVB(displayMib, "ceDisplayName", 0);

                if (displayNameVB != null) {
                    while (displayNameVB.oid.indexOf(displayNameOID) != -1) {
                        var displayIndex = Number(displayNameVB.oid.substring(displayNameVB.oid.lastIndexOf(".") + 1));
                        var tempOID = displayNameVB.oid.substring(0, displayNameVB.oid.lastIndexOf("."));
                        var entPhIndex = Number(tempOID.substring(tempOID.lastIndexOf(".") + 1));
                        if (entPhIndex == chassisIndex) {
                            // this display, is it a LED?
                            var entIndex = chassisIndex + "." + displayIndex;
                            var displayTypeOID = snmp.getOID(displayMib, "ceDisplayType");
                            displayTypeOID = displayTypeOID.substring(0, displayTypeOID.lastIndexOf("."));
                            var displayType = snmp.get(displayTypeOID + "." + entIndex);

                            if (displayType == 1 && displayNameVB.value != null) {
                                Nexus7000LEDIndexes[entIndex] = displayNameVB.value;
                                // createAlarm(uriPrefix+"/chassisLEDs/"+displayNameVB.value,LEDLabels[displayNameVB.value],
                                // alarmPathHM);
                                createAlarm(uriPrefix + "/chassisLEDs/" + displayNameVB.value, displayNameVB.value, alarmPathHM);
                                hmSubs.push(uriPrefix + "/chassisLEDs/" + displayNameVB.value);

                                var displayStateOID = snmp.getOID(displayMib, "ceDisplayState");
                                displayStateOID = displayStateOID.substring(0, displayStateOID.lastIndexOf("."));
                                var displayColorOID = snmp.getOID(displayMib, "ceDisplayColor");
                                displayColorOID = displayColorOID.substring(0, displayColorOID.lastIndexOf("."));

                                hmPoller.addObjectID(displayStateOID + "." + entIndex);
                                hmPoller.addObjectID(displayColorOID + "." + entIndex);
                            }
                        }
                        displayNameVB = snmp.getNextVB(displayNameVB.oid);
                    }
                }
            } else {
                log.error("RMON - Cannot find the Nexus7000 Chassis Physical Index for " + host);
            }
        }
    } catch (ex) {
        // just in case
    }

    // walk the CPU table and create approriate alarms
    // and add to poller, add to overall
    try {
        var findOID = snmp.getOID(cpumib, "cpmCPUTotal5minRev");
        if (findOID != undefined) {
            findOID = findOID.substring(0, findOID.length - 2);
            cpuIndexes = new Array();
            var cpuVB = snmp.getNextVB(cpumib, "cpmCPUTotal5minRev", 0);
            if (cpuVB != null) {
                while (cpuVB.oid.indexOf(findOID) != -1) {
                    //var isOk = cpuVB.oid.indexOf(findOID);
                    var thisIndex = Number(cpuVB.oid.substring(findOID.length + 1, cpuVB.length));
                    cpuIndexes.push(thisIndex);
                    var enIndex = snmp.get(cpumib, "cpmCPUTotalPhysicalIndex", thisIndex);
                    if (enIndex != null) {
                        var cpuName = snmp.get(enmib, "entPhysicalDescr", enIndex);
                        if (cpuName == null)
                            cpuName = "CPU " + thisIndex;
                        createAlarm(uriPrefix + "/cpu" + thisIndex, cpuName, alarmPathHM);
                        hmSubs.push(uriPrefix + "/cpu" + thisIndex);
                        hmPoller.addObjectID(snmp.getOID(cpumib, "cpmCPUTotal5minRev", thisIndex));
                    }
                    cpuVB = snmp.getNextVB(cpuVB.oid);
                }
            }
        }
    } catch (ex) {
        // if no CPU entries or any other exceptions
    }

    // HM Overall alarm
    alarmOverallHM.path = alarmPathHM;
    alarmOverallHM.name = uriPrefix + "/OverallHM";
    alarmOverallHM.mode = "OR";

    hmSubs.push(uriPrefix + "/powerCycle");
    hmSubs.push(uriPrefix + "/commStatus");

    gsm.addVirtualAlarm(alarmOverallHM, hmSubs);
    hmPoller.restartPolling();

}

hmPoller.onResult = function onResult(event) {
    try {
        if (this.plugin.inHMpoller) {
            log.error("Called hmPoller onResult when previous call was not finished");
            return;
        }
        this.plugin.inHMpoller = true;

        if (event.success) {
            var j, k, temp, stateOID, colorOID;
            log.warn("polling hmPoller --> event success!");

            if ((j = event.variables[snmp.getOID(chassismib, 'chassisPs1Status')]) != undefined) {
                myAlarms[uriPrefix + "/chassisPs1Status"].status = convertToStatus(j);
            }

            if ((j = event.variables[snmp.getOID(chassismib, 'chassisPs2Status')]) != undefined) {
                myAlarms[uriPrefix + "/chassisPs2Status"].status = convertToStatus(j);
            }

            if ((j = event.variables[snmp.getOID(chassismib, 'chassisFanStatus')]) != undefined) {
                myAlarms[uriPrefix + "/chassisFanStatus"].status = convertToStatus(j);
            }

            if ((j = event.variables[snmp.getOID(chassismib, 'chassisTempAlarm')]) != undefined) {
                temp = alarm.NORMAL;
                if (Number(j) == 2)
                    temp = alarm.WARNING;
                else if (Number(j) == 3)
                    temp = alarm.ERROR;
                myAlarms[uriPrefix + "/chassisTemp"].status = temp;
            }

            // brocade alarm polling
            var i = 1;
            while ((j = snmp.get(brocade_mib, 'snChasPwrSupplyOperStatus', i)) != undefined) {
                myAlarms[uriPrefix + "/chassisPs" + i + "Status"].status = convertToStatus(j);
                i++;
            }

            temp = alarm.NORMAL;
            if (Number(event.variables[snmp.getOID(chassismib, 'chassisMinorAlarm')]) == 2) {
                temp = alarm.WARNING;
            }
            if (Number(event.variables[snmp.getOID(chassismib, 'chassisMajorAlarm')]) == 2) {
                temp = alarm.ERROR;
            }
            if (myAlarms[uriPrefix + "/chassisAlarm"] != undefined) {
                myAlarms[uriPrefix + "/chassisAlarm"].status = temp;
            }

            for ( var ii in cpuIndexes) {
                if ((j = event.variables[snmp.getOID(cpumib, "cpmCPUTotal5minRev", cpuIndexes[ii])]) != undefined) {
                    if (Number(j) > 90)
                        temp = alarm.ERROR;
                    else
                        temp = alarm.NORMAL;
                    myAlarms[uriPrefix + "/cpu" + cpuIndexes[ii]].status = temp;
                }
            }

            for ( var indN in Nexus7000LEDIndexes) {

                var displayStateOID = snmp.getOID(displayMib, "ceDisplayState");
                displayStateOID = displayStateOID.substring(0, displayStateOID.lastIndexOf("."));
                var displayColorOID = snmp.getOID(displayMib, "ceDisplayColor");
                displayColorOID = displayColorOID.substring(0, displayColorOID.lastIndexOf("."));

                stateOID = displayStateOID + "." + indN;
                colorOID = displayColorOID + "." + indN;

                if ((j = event.variables[stateOID]) != undefined && (k = event.variables[colorOID]) != undefined) {
                    if (j == 3 && k == 4) { // LED is ON(3) and Green(4)
                        temp = alarm.NORMAL;
                    } else {
                        temp = alarm.ERROR;
                    }
                    myAlarms[uriPrefix + "/chassisLEDs/" + Nexus7000LEDIndexes[indN]].status = temp;
                }
            }

        } else {
            log.error("hmPoller.onResult() failed: " + event.error);
        }
    } catch (ex) {
        log.error("hmPoller.onResult() Exception: " + ex);
    }
    this.plugin.inHMpoller = false;
};

function convertToStatus(value) {

    var temp = alarm.UNKNOWN;
    switch (Number(value)) {
    case 1:
        temp = alarm.DISABLED;
        break;
    case 2:
        temp = alarm.NORMAL;
        break;
    case 3:
        temp = alarm.WARNING;
        break;
    case 4:
        temp = alarm.ERROR;
        break;
    }
    return temp;
}

poller.restartPolling();
