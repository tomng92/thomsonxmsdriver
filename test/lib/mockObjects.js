/**
 * 
 */



var host = host || Packages.java.net.InetAddress.getLocalHost().getHostName();

print("...... STARTING .... In genericProstream ! host=" + host);
var MOCK = {};// our namespace

/**
 * A Mock alarm, mocking the gsm.createAlarm().
 * See GSMAlarm.java
 */
function MockGSMAlarmClass(shortname, description, devicePath, deviceclass, deviceURI, gsmtype) {
    this.shortname = shortname;
    this.description = description;
    this.devicePath = devicePath;
    this.deviceClass = deviceclass;
    this.deviceURI = deviceURI;
    this.gsmType = gsmtype;
    this.gsmAlarm = {};
    this.gsmAlarm.status = undefined;

    this.CRITICAL = 30; // ", new Integer(Alarm.LEVEL_CRITICAL), 
    this.DISABLED = -1; //", new Integer(Alarm.LEVEL_DISABLED), 
    this.ERROR = 30; //", new Integer(Alarm.LEVEL_CRITICAL), att
    this.MAJOR = 25; //", new Integer(Alarm.LEVEL_MAJOR), attr);
    this.MINOR = 20; //", new Integer(Alarm.LEVEL_MINOR), attr);
    this.NON_EXISTENT = -3; //", new Integer(Alarm.NON_EXISTENT)
    this.NORMAL = 10; //", new Integer(Alarm.LEVEL_NORMAL), attr
    this.PENDING = -4; //", new Integer(Alarm.PENDING), attr);  
    this.UNKNOWN = 40; //", new Integer(Alarm.LEVEL_UNKNOWN), at
    this.WARNING = 20; //", new Integer(Alarm.LEVEL_MINOR), attr
}

var alarm = new MockGSMAlarmClass();

/**
 * VERY USEFULE!
 */
var GSM = MOCK;
GSM.alarm = alarm;


function Navigator() {}

Navigator.prototype.SNMPdriver = function (type, host, deviceClass, uniqueID) {
    log.info("new SNMPDrver..." + type + "-" + host + "-" + deviceClass+"-" + uniqueID);
    
    this.setDevicePathPrefix = function( path ) {};       
    this.setSNMPretries = function( retries) {};           
    this.setSNMPtimeout = function( timeout ) {};           
    this.setSNMPinterval = function(pollInterval ) {};     
    this.setSNMPReadCommunity = function( readCommunity ) {};
    this.setTrapHandler = function() {};
};

Navigator.prototype.Alarm = function () {
    log.info("new navigator.alarm");
    
    return MOCK.gsm;
};

var navigator = new Navigator();



function GSMPlugin(str) {}
function SNMPAgent(){
    this.getOID = function(var1, var2) {
        return ".1.1.1";
    };
}
var log = {};
log.info = function(str) {
    print("info...... " + str);
};
log.debug = function(str) {
    print("debug...... " + str);
};
log.warn = function(str) {
    print("warn...... " + str);
};
log.error =  function(str) {
    print("error...... " + str);
};


/**
 * MOCK.gsm 
 */

function gsmCTOR() {
    this.alarms = [];
}


MOCK.gsm = new gsmCTOR();

MOCK.gsm.addVirtualAlarm = function(vacfg, subs){
    log.info("MOCK.....gsm.addVirtualAlarm(): " + vacfg + "-" + subs);
};
 
MOCK.gsm.addAlarm = function(shortname, // alarmURI
                description,           // alarmName
                devicePath,                 // path
                deviceClass,                 // deviceClass
                deviceURI,                        // deviceURI
                gsmtype) {
    var mockGsmAlarm = new MockGSMAlarmClass(shortname, description,  devicePath, deviceClass, deviceURI, gsmtype);
    log.debug("mock .... gsm.addAlarm(" + shortname + ", " + description + ", " 
            + devicePath + ", " + deviceClass + ", " + deviceURI + ", " + gsmtype);
    
    //this.alarms.push(mockGsmAlarm);
    return mockGsmAlarm;
};

MOCK.snmp = {};// global snmp agent ?
MOCK.snmp.getOID = function(myMib, myVariable, index) {
   log.info("MOCK.......snmp.getOID(): " + myMib + "-" + myVariable + "-" + index);
};

MOCK.GSMAlarm = {};

MOCK.GSMAlarm.TYPE_TEXT = "111";
MOCK.GSMAlarm.TYPE_STATUS = "222";

