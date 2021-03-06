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
//var GSM = MOCK;
//GSM.alarm = alarm;


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

//
// navigator.SNMPdriver constructor
//

navigator.SNMPdriver
	= function SNMPdriver(type, devicehost, deviceClass, uniqueID) {

	this.type = type;
	this.host = devicehost;
	this.uniqueID = uniqueID;
	this.site = null;
	this.deviceClass = deviceClass;

	this.SNMPretries = 1;
	this.SNMPtimeout = 5;
	this.SNMPinterval = 10;
	/*
     * Time in ms spent between each SNMP get in order not to overwhelm the
     * KX. Set to undefined or 0 for no delay
     */
	this.throttlingDelay = undefined;
	this.SNMPrefresh = 300;
	this.SNMPPort = 161;
	this.SNMPTrapPort = 162;
	this.devicePathPrefix = "SNMP/";

	this.getSupported = true;

//	this.alarmpath = type + "/" + host;
	this.staticAlarmArray = [];
	this.dynAlarmArray = [];
	this.VAlarmArray = [];
	this.polledAlarms = [];

    //push readCommunity and writeCommunity
    this.SNMPReadCommunity = null;
    this.SNMPWriteCommunity = null;

	this.alarmToDyn = [];
	//this.trapArray = [];

	this.trapHandler = null;
	this.dynAlarmCreator = null;
	this.VAlarmCreator = null;
	this.uptime = null;
	this.lastupdatetime = 0;
	this.sysUpTimeAlarm = new navigator.Alarm("RFC1213-MIB",'sysUpTime',0,"sysUpTime", "System uptime", "textnotlogged",1,null);
	this.sysUpTimeAlarm.setABPath("Health Monitoring");
	this.deviceCommAlarm = new navigator.Alarm(null,null,0,"deviceCommAlarm", "Device Communication", "status",3,null);
	this.deviceCommAlarm.setABPath("Health Monitoring");
	this.deviceRestartAlarm = new navigator.Alarm(null, null, 0, "deviceRestartAlarm", "Device Restart", "status",3,null);
	this.deviceRestartAlarm.setABPath("Health Monitoring");
};

//
// navigator.genericSNMP constructor
//
navigator.genericSNMP = function genericSNMP() { };

//Functions

//SNMPdriver.prototype.setParameters = function(parameters) {
//	this.parameters = parameters
//}

navigator.SNMPdriver.prototype.setSNMPrefresh = function(refresh) {
	this.SNMPrefresh = refresh;
}
navigator.SNMPdriver.prototype.setSNMPretries = function(retries) {
	this.SNMPretries = retries;
}
navigator.SNMPdriver.prototype.setSNMPtimeout = function(timeout) {
	this.SNMPtimeout = timeout;
}
navigator.SNMPdriver.prototype.setSNMPinterval = function(interval) {
	this.SNMPinterval = interval;
}

//readCommunity
navigator.SNMPdriver.prototype.setSNMPReadCommunity = function(Community) {
    this.SNMPReadCommunity = Community;
    MOCK.snmp.readCommunity = Community;// MOCKing.....
}

//writeCommunity
navigator.SNMPdriver.prototype.setSNMPWriteCommunity = function(Community) {
    this.SNMPWriteCommunity = Community;
    //Abbas: dont ask me which "snmp" object is this one, I'm just filling the blank
    //naaaaaaahhh, just kidding, this is the global one
    MOCK.snmp.writeCommunity = Community; 
}

navigator.SNMPdriver.prototype.setThrottlingDelay = function(delay) {
	this.throttlingDelay = delay;
}

navigator.SNMPdriver.prototype.setStaticAlarm = function(staticAlarmArray) {
	this.staticAlarmArray = staticAlarmArray;
}
navigator.SNMPdriver.prototype.addStaticAlarm = function(staticAlarm) {
	this.staticAlarmArray[staticAlarm.OID] = staticAlarm;
}
navigator.SNMPdriver.prototype.addDynAlarms = function(handler) {
	this.dynAlarmCreator = handler;
	//for (var alm in dynAlarms.dependsOnAlarms) {
	//	var oid = dynAlarms.dependsOnAlarms[alm].OID;
	//	this.alarmToDyn[oid] = dynAlarms;
	//}
}
navigator.SNMPdriver.prototype.addVAlarms = function(handler) {
	this.VAlarmCreator = handler;
}

// This method is called at construction, periodicly on SNMPrefresh and on some
// other occasions to recreate all the dynamic alarms.
navigator.SNMPdriver.prototype.recreateDyn = function() {
	//Request the list of dynamic alarms that SHOULD Be
	var newDynAlarmArray = [];
	if (this.dynAlarmCreator != null) {
		var newAlarms = this.dynAlarmCreator();
		for (var dalm in newAlarms) {
			var myAlm = newAlarms[dalm];
			newDynAlarmArray[myAlm.OID] = myAlm;
		}
	}

	//Clean up the alarms that are active rigth now
	//Remove the useless alarms from the GSM. Carefully not removing the alarms
	// that we only want to UPDATE
	if (this.dynAlarmArray != undefined) {
		for (var almIndex in this.dynAlarmArray) {
			// if new version oid don't exist in the new list, we have to remove
			// the current alarm
			if (newDynAlarmArray[almIndex] == undefined) {
    			this.dynAlarmArray[almIndex].gsmAlarm.live = false;
    			delete this.dynAlarmArray[almIndex];
			}
		}
	}

	//UPDATE all pertinent alarms
	if (this.dynAlarmCreator != null) {
		for (var dalm in newAlarms) {
			var myAlm = newAlarms[dalm];
			myAlm.addAlarm(myAlm.alternateURI ? this.alternateDeviceURI
			                                  : this.deviceURI,
			               this.devicePath, this.deviceClass);
		}

		//Replace old dynAlarmArray with new one
		this.dynAlarmArray = newDynAlarmArray;
	}
}

navigator.SNMPdriver.prototype.enableGet = function(status) {
	this.getSupported = status;
};

/**
 * This method is called at construction, periodically on SNMPrefresh and on
 * some other occasions to recreate all the virtual alarms.
 */
navigator.SNMPdriver.prototype.recreateVA = function() {
	// Request the list of dynamic alarms that SHOULD Be
	var newVAAlarmArray = [];
	if (this.VAlarmCreator != null) {
		var newAlarms = this.VAlarmCreator();
		for (var dalm in newAlarms) {
			var myAlm = newAlarms[dalm];
			newVAAlarmArray[myAlm.OID] = myAlm;
		}
	}

	// Clean up the alarms that are active right now.
	// Remove the useless alarms from the GSM.  Carefully not removing the alarms
	// that we only want to UPDATE
	if (this.VAlarmArray != undefined) {
		for (var almIndex in this.VAlarmArray) {
		    //if new version oid don't exist in the new list, we have to remove the current alarm
		    if (newVAAlarmArray[almIndex] == undefined) {
    			this.VAlarmArray[almIndex].gsmAlarm.live = false;
    			delete this.VAlarmArray[almIndex];
		    }
		}
	}

	// UPDATE all pertinent alarms
	if (this.VAlarmCreator != null) {
		for (var dalm in newAlarms) {
			var myAlm = newAlarms[dalm];
			myAlm.addVAlarm(myAlm.alternateURI ? this.alternateDeviceURI
			                                   : this.deviceURI, this.devicePath);
		}

		// Replace old dynAlarmArray with new one
		this.VAlarmArray = newVAAlarmArray;
	}
};


//navigator.SNMPdriver.prototype.addTrap = function(trap) {
//	this.trapArray[trap.OID] = trap;
//}
navigator.SNMPdriver.prototype.setTrapHandler = function(handler) {
	this.trapHandler = handler;
};

/*
 * Give a different prefix to the alarm path. Default is "SNMP/"
 * Set to undefined to remove
 */
navigator.SNMPdriver.prototype.setDevicePathPrefix = function(prefix) {
   this.devicePathPrefix = prefix;
};

navigator.SNMPdriver.prototype.start = function() {
	this.devicePath = this.type + "/" + this.host;
	this.deviceURI = "alarm://" + this.uniqueID + "/snmp/" + this.devicePath;
	if (this.devicePathPrefix) {
		this.devicePath = this.devicePathPrefix + this.devicePath;
	}
	this.alternateDeviceURI = "alarm://" + this.uniqueID + "/snmp/" + this.type
	                        + "/" + this.site;

	var usetraps = false;

	var staticOIDs = [];

	if (this.getSupported) {
		this.sysUpTimeAlarm.addAlarm(this.deviceURI, this.devicePath,
		                             this.deviceClass);
		this.addStaticAlarm(this.sysUpTimeAlarm);
		this.deviceCommAlarm.addAlarm(this.deviceURI, this.devicePath,
		                              this.deviceClass);
		this.addStaticAlarm(this.deviceCommAlarm);
		this.deviceRestartAlarm.addAlarm(this.deviceURI, this.devicePath,
		                                 this.deviceClass);
		this.addStaticAlarm(this.deviceRestartAlarm);
	}

	// Create static alarms
	for (var oid in this.staticAlarmArray) {
		var myAlarm = this.staticAlarmArray[oid];
		myAlarm.addAlarm(myAlarm.alternateURI ? this.alternateDeviceURI
		                                      : this.deviceURI,
		                 this.devicePath, this.deviceClass);

		switch (myAlarm.mode) {
			case 1:
				// Continuous poll, no traps
				this.polledAlarms[oid] = myAlarm;
				staticOIDs.push(oid);
				break;
			case 2:
				// Initial polling, trap for changes, periodic repoll
				//trapenabledOIDs.push(oid);
				break;
			case 3:
				// No polling, no trap, internal variable.
				break;
			case 4:
			   // No initial polling, no continous and periodic polling, trap for
			   // changes
				break;
			default:
				break;
		}
	}

	if (this.trapHandler != null) {
		this.trapReceiver = new SNMPTrapReceiver();
		this.trapReceiver.communityEnabled = false;
		this.trapReceiver.plugin = this;
		this.trapReceiver.port = this.SNMPTrapPort;
		this.trapReceiver.onTrap = this.trapHandler;
	}

	this.snmp = new SNMPAgent();
	this.snmp.targetHost = this.host;
	this.snmp.targetPort = this.SNMPPort;
	this.snmp.retries = this.SNMPretries;
	this.snmp.timeout = this.SNMPtimeout;
    
    if(this.SNMPReadCommunity != null){ 
        this.snmp.readCommunity = this.SNMPReadCommunity;
    }
    
    if(this.SNMPWriteCommunity != null){
        this.snmp.writeCommunity = this.SNMPWriteCommunity;
    }

	// Mutex to avoid running multiple onResult at the same time.
	this.inPoller = 0;

	if (this.getSupported) {
		this.heartbeatPoller = new SNMPPoller();
		this.heartbeatPoller.targetHost = this.host;
		this.heartbeatPoller.targetPort = this.SNMPPort;
		this.heartbeatPoller.plugin = this;
		this.heartbeatPoller.retries = this.SNMPretries;
		this.heartbeatPoller.timeout = this.SNMPtimeout;
		this.heartbeatPoller.pollInterval = this.SNMPinterval;
        
        //Abbas: push readCommunity if any
        if(this.SNMPReadCommunity != null){ 
            this.heartbeatPoller.readCommunity = this.SNMPReadCommunity;
            log.error("Abbas : " + this.host + ": this.heartbeatPoller.readCommunity - "+ this.heartbeatPoller.readCommunity + ", this.SNMPReadCommunity - " + this.SNMPReadCommunity);
        }
        
		this.heartbeatPoller.objectIDs = staticOIDs; //We start only with static alarms, dynamic are created later.
		this.heartbeatPoller.onResult = function(event) {
			try {
				this.plugin.inPoller++;
				if (this.plugin.inPoller > 1) {    //check for re-entry
					log.error("Called poller for " + this.plugin.type + " (" + this.plugin.host + ") before previous call was finished " + this.plugin.inPoller);
					return;
			  	}

				if (event.success) {
					for (var oid in event.variables) {
						var result = event.variables[oid];
						var myAlarm = this.plugin.polledAlarms[oid];
						myAlarm.handler(result);
					}
					var uptime = java.lang.Long(this.plugin.sysUpTimeAlarm.gsmAlarm.text)
					this.plugin.deviceCommAlarm.gsmAlarm.status = alarm.NORMAL; //we have communication

					// Check if the driver was never initialized, if the device was
					// rebooted, if we previously reported an error or if we haven't
					// refreshed this for a long time>SNMPrefresh.
					if (   (this.plugin.uptime == null)
					    || (uptime.compareTo(this.plugin.uptime) < 0)
					    || ((uptime-this.plugin.lastupdatetime)>this.plugin.SNMPrefresh*100)
					    || (alarm.status != alarm.NORMAL)) {

						alarm.status = alarm.NORMAL;

						//Specific if the device was rebooted
						if (this.plugin.uptime != null && uptime.compareTo(this.plugin.uptime) < 0) {
							//Warn that the device was restarted. It will turn green on next poll.
							this.plugin.deviceRestartAlarm.gsmAlarm.status = alarm.WARNING;
						} else {
							this.plugin.deviceRestartAlarm.gsmAlarm.status = alarm.NORMAL;
						}

						this.plugin.uptime = uptime;
						this.plugin.lastupdatetime = uptime;


						//Refresh all the alarms. We may have lost notifications.
						this.plugin.refresh(this.plugin.staticAlarmArray);


						//Create/Recreate Dynamic alarms
						this.plugin.recreateDyn();
						//Create/Recreate virtual alarms alarms
						this.plugin.recreateVA();

						//Poll the dynamic alarms
						this.plugin.refresh(this.plugin.dynAlarmArray);

						this.plugin.clearPoller();
						this.plugin.addPollerVar(this.plugin.dynAlarmArray);
						this.plugin.addPollerVar(this.plugin.staticAlarmArray);


					} else {
				         //The box wasn't rebooted. We don't need to re-fetch the initial statuses
				         this.plugin.uptime = uptime;
				         this.plugin.deviceRestartAlarm.gsmAlarm.status = alarm.NORMAL;

				         //TODO: auto refresh of the unknown alarms
					}

				} else {
					log.error("Driver: " + this.plugin.type + " Host: "
					        + this.plugin.host + " Message: " + event.error);

					for (var ar in [this.plugin.staticAlarmArray,
					                this.plugin.dynAlarmArray]) {

						var mylist = (ar == 0) ? this.plugin.staticAlarmArray
						                       : this.plugin.dynAlarmArray;
						for (var oid in mylist) {
							var myAlarm = mylist[oid];
							if (myAlarm.mode != 4 && myAlarm.mode != 3) {
								switch (myAlarm.type) {
									case "status":
									case "statusnotlogged":
										myAlarm.gsmAlarm.status = alarm.UNKNOWN;
										break;
									case "text":
									case "statustext":
									case "textnotlogged":
										myAlarm.gsmAlarm.status = alarm.UNKNOWN;
										myAlarm.gsmAlarm.text = "~";
										break;
								}
							} else {
							   myAlarm.lostComm();
							}
						}
					}
					// We have communication
					this.plugin.deviceCommAlarm.gsmAlarm.status = alarm.ERROR;

					// Remove the dynamic alarms from the poller because they may not
					// exist when communication is back, resulting in poll error
					this.plugin.resetPollerAfterLostComm();
				}
			} catch (exc) {
				log.error("Driver: " + this.plugin.type + " Host: "
				        + this.plugin.host + " Exception Message: "
				        + exc.rhinoException);
			}
			this.plugin.inPoller = 0;
		}
	}
};

// Reload the status of the alarm that are not polled every 5 seconds (type 1)
// and alarm that we never poll (type 3);
navigator.SNMPdriver.prototype.refresh = function(alarms) {
	for (var key in alarms) {
		var myAlarm = alarms[key];
		if (myAlarm.mode != 1 && myAlarm.mode != 3 && myAlarm.mode != 4) {
			var status = this.snmp.get(myAlarm.OID);
			myAlarm.handler(status);
			if (this.throttlingDelay) {
            java.lang.Thread.sleep(this.throttlingDelay);
         }
		}
	}
};

navigator.SNMPdriver.prototype.clearPoller = function() {
	this.polledAlarms = [];
	this.heartbeatPoller.objectIDs = [];
};

/*
 * In case of a lost communication with the device, the default bahaviour is
 * to keep only the static alarms in the poller, with the idea that the
 * dynamic alarms will be added as soon as communication is re-etablished.
 * Unfortunately this is right only for plugins that refresh their dynamic
 * alarms often (with a low SNMPrefresh value). Other plugins are free to
 * override thi function to do nothing or something else to the poller alarms
 * is communication is lost.
 */
navigator.SNMPdriver.prototype.resetPollerAfterLostComm = function() {
	this.clearPoller();
	this.addPollerVar(this.staticAlarmArray);
}


navigator.SNMPdriver.prototype.addPollerVar = function(allAlarms) {
	//Recreate the list of alarms to poll every round
	//Add the dynamic alarms that need poll
	for (var oid in allAlarms) {
		var myAlarm = allAlarms[oid];

		switch (myAlarm.mode) {
			case 1: 				//continuous poll, no traps
				this.polledAlarms[oid] = myAlarm;;
				this.heartbeatPoller.addObjectID(oid);
				break;
			case 2:					//initial polling, trap for changes, periodic repoll
				break;
			case 3://No polling, no trap, internal variable.
				break;
			case 4://No initial polling, No continous and periodic polling, trap for changes
				break;
			default:
				break;
		}
	}
}

navigator.SNMPdriver.prototype.getAlarmbyName = function(name) {

	for (var oid in this.staticAlarmArray) {
		var myAlarm = this.staticAlarmArray[oid];
		if (myAlarm.shortname == name) {
			return myAlarm;
		}
	}
	for (var oid in this.dynAlarmArray) {
		var myAlarm = this.dynAlarmArray[oid];
		if (myAlarm.shortname == name) {
			return myAlarm;
		}
	}
	return undefined;

}

//Function to find an alarm from the OID
navigator.SNMPdriver.prototype.getAlarmByOID = function(oid) {
	for (var i in this.staticAlarmArray) {
		if (i == oid) {
			return this.staticAlarmArray[i];
			break;
		}
	}
	for (var i in this.dynAlarmArray) {
		if (i == oid) {
			return this.dynAlarmArray[i];
			break;
		}
	}
	return undefined;
}

navigator.VirtualAlarm = function(shortname, mode) {
	this.shortname = shortname;	//name of the alarm, to be used in the URI
	this.mode = mode;
	this.subs = [];
	this.vacfg = { };

	this.setSubPath = function(subpath) {
		this.subpath = subpath;
	}

	this.addSub = function(alm) {
		this.subs.push(alm.gsmAlarm.uri);
	}

	this.addSubArray = function(almArray) {
		for (var i in almArray) {
			this.subs.push(almArray[i].gsmAlarm.uri);
		}
	}

	this.addVAlarm = function addVAlarm(deviceURI,devicePath) {
		var URI = deviceURI;
		if (this.subpath != undefined && this.subpath != "") {
   		URI = deviceURI + "/" + this.subpath.replace(/\s/g, "_");
   		devicePath = devicePath + "/" + this.subpath;
   	}

   	this.vacfg.path = devicePath;
		this.vacfg.name = URI + this.shortname;
		this.vacfg.mode = this.mode;
		this.gsmAlarm = MOCK.gsm.addVirtualAlarm(this.vacfg, this.subs);

		return this.gsmAlarm;
	}
};

/**
 * @param mib         Mib file
 * @param variable    OID variable name
 * @param index       Index for the variable. 0 if not a table.
 * @param shortname   Name of the alarm, to be used in the URI
 * @param description Description of the alarm
 * @param type        Status, text or both
 * @param mode        true if we need to poll this alarm
 *                    (i.e. no trap associated)  
 * @param alarmMap    
 */
navigator.Alarm = function(mib, variable, index, shortname, description, type,
                           mode, alarmMap) {

	this.mib = mib;
	this.variable = variable;
	this.index = index;
	this.shortname = shortname;
	this.description = description;
	this.type = type;

	this.alternateURI = false;

	// Only for getOID
	//var snmp = new SNMPAgent();

	switch (type) {
		case "textnotlogged":			// Text alarm that we don't want to log
			this.gsmtype = 20; // Number(GSMAlarm.TYPE_TEXT | GSMAlarm.TYPE_NOT_LOGGED); // 20
			break;
		case "text":
			this.gsmtype = "text";
			break;
		case "statustext":
			this.gsmtype = MOCK.GSMAlarm.TYPE_STATUS | MOCK.GSMAlarm.TYPE_TEXT;
			break;
		case "statusnotlogged":
			this.gsmtype = 17; // Number(GSMAlarm.TYPE_STATUS | GSMAlarm.TYPE_NOT_LOGGED) //17;
			break;
		case "status":
		default:
			this.gsmtype = "status";
			break;
	}


	this.mode = mode;
	this.alarmMap = alarmMap;

	this.gsmAlarm = undefined; //will contain the gsm alarm, once created

	try {
		if (this.mode != 4 && this.mode != 3) {
			this.OID = MOCK.snmp.getOID(mib, variable, index);
		} else {
			this.OID = shortname;
		}
	} catch (e) {
		log.info("ERROR::ERROR::ERROR::ERROR::ERROR::ERROR while getOID >>>  root cause = " + e);
		this.OID = shortname;
	}


	this.addAlarm = function addAlarm(deviceURI, devicePath, deviceclass) {
		var URI = deviceURI;
		if (this.subpath != undefined && this.subpath != "") {
   		URI = deviceURI + "/" + this.subpath.replace(/\s/g, "_");
   		devicePath = devicePath + "/" + this.subpath;
   	}
   	if (this.ABPath != undefined) {
   		devicePath = devicePath + "/" + this.ABPath;
   	}
		this.gsmAlarm = MOCK.gsm.addAlarm(URI + "/" + this.shortname, // alarmURI
                                   this.description,           // alarmName
                                   devicePath,                 // path
                                   deviceclass,          		// deviceClass
                                   URI,               		   // deviceURI
                                   this.gsmtype);              // type
		return this.gsmAlarm;
	};

	this.handler = function(result) {
		switch (this.type) {
			case "status":
			case "statusnotlogged":
				var result_alarm = this.alarmMap[result];
				if (result_alarm == undefined) {
					result_alarm = alarm.UNKNOWN;
				}
				this.gsmAlarm.status = result_alarm;
				break;
			case "textnotlogged":
			case "text":
				//TODO: add regexp to keep only a-z, 0-9 caracters.
				if (this.alarmMap == undefined) {
					this.gsmAlarm.text = result;
				} else {
					this.gsmAlarm.text = this.alarmMap[result];
				}

				// This is only text alarm, so if status was set to UNKNOWN because
				// of communication failure, reset it back to NORMAL
				if (this.gsmAlarm.status != alarm.NORMAL) {
					this.gsmAlarm.status = alarm.NORMAL;
				}

				break;
			case "statustext":
				// TODO: add regexp to keep only a-z, 0-9 caracters.
				this.gsmAlarm.text = result;
				var result_alarm = this.alarmMap[result];
				if (result_alarm == undefined) {
					result_alarm = alarm.UNKNOWN;
				}
				this.gsmAlarm.status = result_alarm;
				break;
		}
	};

	this.setHandler = function(handler) {
		this.handler = handler;
	};

	this.setSubPath = function(subpath) {
		this.subpath = subpath;
	};

	//Set the Alarm Browser Path if you want to define a folder that you don't
	//want in the URI, only in the alarm browser.
	this.setABPath = function(subpath) {
		this.ABPath = subpath;
	};

	// This function is called when communication is lost.  Can be used to a grey
	// status on mode 3 and 4 alarms.
	this.lostComm = function() {

	};
};


/**
 * Function to find the content of an object inside a trap.  This function is
 * necessary when dealing with traps returning information from a table:  the
 * last number of the OID is not ".0" and there's no easy way to guess it, so we
 * ignore this last number.
 * @param eventvar_array The event.variables array sent by the trap
 * @param oid            The oid of the object we're expecting
 *                       (with a trailing ".0")
 */
navigator.genericSNMP.getVariable = function getVariable(eventvar_array, oid) {
	var prefixOID = oid.substring(0, oid.lastIndexOf("."));
	for (var i in eventvar_array) {
		if (i.indexOf(prefixOID) != -1) {
			return eventvar_array[i];
			break;
		}
	}
};


navigator.genericSNMP.stripOID = function(oid) {
	return oid.substring(0, oid.lastIndexOf("."));
};

/**
 *  Get the OIDs of alarms from a "row" of a table.
 *  parameters:
 *    mib: mib
 *    startPoint: the textual starting point of the row
 *    arr: The array to add to.
 */
navigator.SNMPdriver.prototype.getTableIndexOID
	 = function (myMib, startPoint, arr) {

   this.myMib = myMib;
   this.startPoint = startPoint;
   this.arr = arr;

   var vb;

   //
   // Get the OID of the parent.
   // For some reason we need to remove an ending .0 before we can start
   // walking the column of the table.
   //

	try {
		// TODO which snmp is this one?
   	this.parentOID = MOCK.snmp.getOID(myMib, startPoint);
   } catch (e) {
		log.error("getTableIndexOID - failed while getOID for startPoint="
		        + startPoint + ": " + e);
   }
   this.parentOID = navigator.genericSNMP.stripOID(this.parentOID);

   var oid = this.parentOID;

   for (var i=1; ; i++) {

      vb = this.snmp.getNextVB(oid);
      if (this.throttlingDelay) {
         java.lang.Thread.sleep(this.throttlingDelay);
      }

      if (vb == undefined) {
			break;
      }

      oid = vb.oid;

      //
      // The oid of the elements of the "column" should contain the parent as
      // the prefix. If not we overshot the column
      //
      if ((oid.indexOf(this.parentOID) != 0) || (vb == undefined)) {
         break;
      }
      if (oid in this.arr) {
         continue;
      }
      this.arr.push(oid);
	}
   return this.arr;
}

/*
 *  Get the VBs of alarms from a "row" of a table.
 *  parameters:
 *    mib: mib
 *    startPoint: the textual starting point of the row
 *    arr: The array of OID to add to
 *    this.vbTable: The array of VB to return.
 */
navigator.SNMPdriver.prototype.getTableIndexVB
	 = function(myMib, startPoint, arr) {

   this.myMib = myMib;
   this.startPoint = startPoint;
   this.arr = arr;

   this.vbTable = [];
   var vb;

   //
   // Get the OID of the parent.
   // For some reason we need to remove an ending .0 before we can start
   // walking the column of the table.
   //

   try {
   	this.parentOID = MOCK.snmp.getOID(myMib, startPoint);
   } catch(e) {
		log.error("getTableIndexVB - failed while getOID for startPoint="
		        + startPoint + ": " + e);
   }
   this.parentOID = navigator.genericSNMP.stripOID(this.parentOID);

   var oid = this.parentOID;

   for (var i=1; ; i++) {

      vb = this.snmp.getNextVB(oid);
      if (this.throttlingDelay) {
         java.lang.Thread.sleep(this.throttlingDelay);
      }

      if (vb == undefined) {
   		break;
   	}

      oid = vb.oid;

      //
      // The oid of the elements of the "column" should contain the parent as
      // the prefix. If not we overshot the column
      //
      if ((oid.indexOf(this.parentOID) != 0) || (vb == undefined)) {
         break;
      }
      if (oid in this.arr) {
         continue;
      }
      this.arr.push(oid);
      this.vbTable.push(vb);
	}
	return this.vbTable;
};


/**
 *  Get the VB of alarms from a specified index of a table.
 *  parameters:
 *    mib: mib
 *    startPoint: the textual starting point of the row
 *    index: the index of the variable to look for
 */
navigator.SNMPdriver.prototype.getIndexVB = function (mib, startPoint, index) {
	this.mib = mib;
	this.startPoint = startPoint;
	this.index = index;
	this.vbTable = [];

	try {
   	this.parentOID = MOCK.snmp.getOID(this.mib, this.startPoint);
   } catch (e) {
		log.error("getIndexVB - failed while getOID for startPoint=" + startPoint
		        + ": " + e);
   }
   this.parentOID = navigator.genericSNMP.stripOID(this.parentOID);

   var oid = this.parentOID+ "." + index;

   var vb = this.snmp.getVB(oid);

   this.vbTable.push(vb);

   return this.vbTable;
};
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
/**
 * WalkParser.js
 * Parses a walk file and put all variables found in a list.
 */
try {
importClass(java.io.BufferedReader);
importClass(java.io.FileReader);
} catch(ex) {}


/**
 * 
 */
function WalkReader() {
	
	/**
	 * varBag contains the variables extracted from the walk. It is an array of array. 
	 *    Values can be accessed like: 
	 *        var myval = this.varBag["signalHighlightAlarmDevices"][3].
	 *    Values can also be keyed on a string. Example:
	 *        var myval = this.variables["signalHighlightAlarmDevices"]["EM187"].
	 */
	
	this._curBag; // current bag
	this._bags = [];
    
	/**
	 * Select the current bag.
	 */
    this.selectBag = function(bagname) {
    	if (!bagname) {
    		this._curBag = this._bags["_TOP_"];
    	}
		this._curBag =  this._bags[bagname];;
	};
	
	/**
	 * Get this variable.
	 */
	this.get = function(varName, key) {
		return this._curBag.get(varName, key);
	};
	
	/**
	 * Get values for variable in the form of an object.
	 * @return array containing values, or undefined if not found.
	 */
	this.getAll = function(varName) {
		return this._curBag.getAll(varName);
	};
	this.getAllInArray = function(varName) {
		return this._curBag.getAllInArray(varName);
	};
	
	/**
	 * Add this bag to my bags.
	 * Also set the curBag to it.
	 */
	this._addBag = function(bag) {
		this._bags[bag.name] = bag;
		this._curBag = bag;
	};
	
    
    /**
     * Read this walk file and store variables in my _bags.
     * 
     * @param fileName
     * @returns nothing
     */
    this.read = function(fileName) {
        
        var lineNo = 0;
        var toplevelBag = new BagOfVariables("_TOP_"); 
        this._addBag(toplevelBag);// defaults to toplevel bag
        var bagStack = []; // push when we START a new bag, and pop when we END a bag
        bagStack.push(toplevelBag);// first bag
        
        try {
            var fileReader = new FileReader(fileName);
            var br = new BufferedReader(fileReader);
            var curline;
            while (curline = br.readLine()) {
                lineNo++;
                var jsLine = "";
                jsLine = curline + "";// convert to a js string
                
                if (lineNo % 100 == 0) {
                    //print(lineNo);// + ". " + jsLine);
                    //print(lineNo + ". " + jsLine);
                }
                parseline(this, jsLine, bagStack, lineNo);
            }

        } catch (e) {
            log.error("Error at line " + lineNo + " of " + fileName + ":" + e);
        }
    }; 
    
    this.readSuperBIGString = function(bigString) {
        
        var lineNo = 0;
        var toplevelBag = new BagOfVariables("_TOP_"); 
        this._addBag(toplevelBag);// defaults to toplevel bag
        var bagStack = []; // push when we START a new bag, and pop when we END a bag
        bagStack.push(toplevelBag);// first bag
        
        var lines = bigString.split("\n");
        
        try {
            var curline;

            for (var i = 0; i < lines.length; i++) {
            //while (curline = br.readLine()) {
                lineNo = i + 1;
                curline = lines[i];
                var jsLine = "";
                jsLine = curline + "";// convert to a js string
                
                if (lineNo % 100 == 0) {
                    //print(lineNo);// + ". " + jsLine);
                    log.debug(lineNo + ". " + jsLine);
                }
                parseline(this, jsLine, bagStack, lineNo);
            }

        } catch (e) {
            log.error("Error at line " + lineNo + " of " + fileName + ":" + e);
        }
    }; 
    
    this.toString = function() {
   	 var ret = "";
    	for (key in this._bags) {
    		var bag = this._bags[key];
    		ret += (ret ? ", ":"") + bag.toString();
   		
    	}
    	return "current:" + this._curBag.name + ", bags:" + ret;
    };
    
    /**
     * A line contains something like this:
     *   numberOfSignals.0:-->2
     *   signalSummary.1:-->0
     *   signalSummary.2:-->0
     *   signalMajorAlarmDevices.1:-->abc
     *   signalMajorAlarmDevices.2:-->abc
     *   signalHighlightAlarmDevices.1:-->abc
     *   signalHighlightAlarmDevices.2:-->abc
     *   signalName.1:-->Signal Numero Uno
     *   signalName.2:-->Signal Numero Dos
     *   @return none.
     */
    function parseline(reader, line, bagStack, lineNo) {
    	
    	/**
    	 * Process the command line
    	 * "[>>    START   BAG_A \"This is the bag of variables that will be loaded at point T2\" ";
    	 */
    	if (line.indexOf("[>>") == 0) {
    		processCommand(reader, bagStack, line, lineNo);
    		log.warn(reader.toString());
    		return;
    	}
    	
        var lineRegex = /(.*):-->(.*)/;
        var extract = lineRegex.exec(line);
        if (!extract) return;
        
        
        // example line: "pncPlatformSystemDate.0:-->abc"
        var fullVariable = extract[1]; // 'pncPlatformSystemDate.0'
        var value = extract[2]; // 'abc'

        /**
         * Extract variable name: "pncPlatformSystemDate" from "pncPlatformSystemDate.0"
         */
        var varRegex = /(\w*)\.(.*)/; // \w means 'alphanumeric character'. Extracts 'myVar' out of 'myVar.0.1.2.3'
        var varExtract = varRegex.exec(fullVariable);
        if (!varExtract) {
            throw "Line cannot be parsed: " + line;
        }

        var varName = varExtract[1];
        var dsv = varExtract[2]; // dsv, dot separated value, like '0.11.22.33' from 'myVar.0.11.22.33'
        
        
        /**
         * Put variable in variable list
         */
        var bagVars = reader._curBag.vars[varName];
        if (!bagVars) {
        	bagVars = {};// still empty: create object to store variables (Note: we create an Object, not an Array)
        	reader._curBag.vars[varName] = bagVars;
        }
        
        // check if key already exist
        if (bagVars[dsv]) {
        	throw "Variable " + varName + " has duplicate key '" + dsv + "'. Line " + lineNo;  
        }      
        
        bagVars[dsv] = value; // store value at key dsv
        //print(reader.toString());
    }
    
    /**
     * Process a command line, i.e. a line starting with "[>>".
     * Actions can be START or END, or no action.
     */
    function processCommand(reader, bagStack, line, lineNo) {
		
		// find and remove comment 
		var posComment = line.indexOf('--');
		if (posComment != -1) { 
			line = line.substring(0, posComment); // remove comment part '[>> xxx -- comment' -to-> '[>> xxx' 
		}
		
		line = trimStr(line);
		
		var parts = line.split(/\s+/);
		parts.splice(0, 1);// remove the '[>>' 
		
		if (parts.length == 0) { // nothing to do
			return;
		}
		
		var action = parts[0];// action can be "START" or "END"
		
		/**
		 * Process the command.
		 * Current valid are 'START' and 'END'.
		 */
		// Example "[>> START BAG_B extends BAG_A"
		if (action.toUpperCase() == "START") {
			var bagName = parts[1];
			var newBag = new BagOfVariables(bagName);
			reader._addBag(newBag);
			bagStack.push(newBag);
			
			if (parts[2] && parts[3]) {
				var parentName = parts[3];
				var parent = reader._bags[parentName];
				if (!parent) {
					throw "Line " + lineNo + ". Parent " + parentName + " of bag " + bagName + " not found!";
				}
				newBag.parent = parent;
			}
		} else if (action == "END") {
			// Exit this current bag and 
			// use the easy route: Simply go to the top level
			var endedBag = bagStack.pop();
			if (!endedBag) {
				throw "Line " + lineNo + "of walk. Stack empty at END command. Too many END statements ?";
			}
			reader._curBag = bagStack[bagStack.length - 1];// set current
		} else {
			throw "Unknown command " + action + " at line " + lineNo;
		}
    }
}

/**
 * Holder of variables.
 * Bags are hierarchical.
 */
function BagOfVariables(name, parent) {
	this.name = name;
	this.parent = parent;// parent bag name
	this.vars = {};
	
	/**
	 * find this variable. 
	 * Go up the parent chain until found or no more parent.
	 */
    this.getOLD = function(varName, key) { 
        var bag = this;
        while (bag) {
            if (bag.vars[varName] && bag.vars[varName][key]) {
                return bag.vars[varName][key];
            }   
            bag = bag.parent;// find parent
        }
        return undefined;
    };
    
    this.get = function(varName, key) { 
        key = key ? key : 0;
        var bag = this;
        while (bag) {
            if (bag.vars[varName] && bag.vars[varName][key]) {
                return bag.vars[varName][key];
            }   
            bag = bag.parent;// find parent
        }
        return undefined;
    };
    
	/**
	 * Get all values of this variable. If bag inherits, add its parent's variable values too.
	 * For now, we do a clone of the variables.
	 */
	this.getAll = function(varName) {
		var vals = undefined;
		/**
		 * TODO: To do this in recursive manner!!
		 */
		if (this.parent && this.parent.vars[varName]) {
			vals = mergeObj({}, this.parent.vars[varName]);
		}
		
		if (this.vars[varName]) {
			return mergeObj(vals ? vals:{}, this.vars[varName]);
		}
		return vals;
	};
	
	this.getAllInArray = function(varName) {
		var vals = this.getAll(varName);
		var arr = [];
		return copyIntoArray(arr, vals);
	};
	
	// copy all values for a variable into an array 
	function copyIntoArray(arr, obj) {
		if (!obj) return arr;
		for (key in obj) {
		    if (obj.hasOwnProperty(key)) {
		    	arr.push(obj[key]);
		    }
		}
		return arr;
	}
	

	// merge mergeObj into sourceObj objects
	function mergeObj(sourceObj, mergeObj) {
		if (!mergeObj) return sourceObj;
		for (key in mergeObj) {
			if (mergeObj.hasOwnProperty(key)) {
				sourceObj[key] = mergeObj[key];
			}
		}
		return sourceObj;
	}

	this.toString = function() {
		return this.name + (this.parent ? "-extends->" + this.parent.name:"") + ":" + arrayToString(this.vars);
	};
}

/**
 * Trim a string. See http://blog.stevenlevithan.com/archives/faster-trim-javascript.
 * @return Example " hello " -> "hello"
 */
function trimStr(str) {
    if (!str) return str;
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

/**
 * Return easy to read contents of an array. Example '[tom:111, b:[a:22, b:44], 2:[0:65, 1:57, 2:111]]'.
 * NOTE: This function does not work with associative array:
 * Works recursively.
 * NOTE: Need to understand why this function does not work with this form:
 *    var myvar = []; // note the [] instead of {}
 *    myvar['.1'] = 22;
 *    myvar['.2.22'] = 44;
 *    print(arrayToString(myvar);
 * @param arr
 * @returns {String}
 */
function arrayToString(arr) {
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

var walkString = '\
genManagerIpAddress.10.1.101.81.162:-->10.1.101.81\n\
genManagerIpAddress.10.1.117.11.162:-->10.1.117.11\n\
genManagerPort.10.1.101.81.162:-->162\n\
genManagerPort.10.1.117.11.162:-->162\n\
genManagerTrapEnable.10.1.101.81.162:-->true(1)\n\
genManagerTrapEnable.10.1.117.11.162:-->true(1)\n\
genManagerTrapTypeSelection.10.1.101.81.162:-->1\n\
genManagerTrapTypeSelection.10.1.117.11.162:-->1\n\
genManagerEventTrapSeverityFilter.10.1.101.81.162:-->severityMajor(5)\n\
genManagerEventTrapSeverityFilter.10.1.117.11.162:-->severityMajor(5)\n\
genManagerRowStatus.10.1.101.81.162:-->active(1)\n\
genManagerRowStatus.10.1.117.11.162:-->active(1)\n\
genAlarmIndex.7.78.79.67.95.88.77.85.31:-->31\n\
genAlarmIndex.10.78.79.67.95.77.85.88.95.48.49.770:-->770\n\
genAlarmIndex.10.78.79.67.95.77.85.88.95.48.50.767:-->767\n\
genAlarmIndex.10.78.79.67.95.77.85.88.95.66.85.775:-->775\n\
genAlarmIndex.11.87.74.67.84.95.77.85.88.95.48.49.1980:-->1980\n\
genAlarmIndex.11.87.80.66.65.95.77.85.88.95.48.49.1056:-->1056\n\
genAlarmIndex.13.78.79.67.95.67.80.54.48.48.48.95.48.49.754:-->754\n\
genAlarmIndex.13.78.79.67.95.67.80.54.48.48.48.95.48.50.762:-->762\n\
genAlarmIndex.13.78.79.67.95.67.80.54.48.48.48.95.48.51.765:-->765\n\
genAlarmIndex.13.78.79.67.95.67.80.54.48.48.48.95.66.85.778:-->778\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.782:-->782\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.788:-->788\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.790:-->790\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.791:-->791\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.792:-->792\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.794:-->794\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.795:-->795\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.797:-->797\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.798:-->798\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.799:-->799\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.801:-->801\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.802:-->802\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.803:-->803\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.807:-->807\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.808:-->808\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1543:-->1543\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1842:-->1842\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1844:-->1844\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1845:-->1845\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1846:-->1846\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1847:-->1847\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.573:-->573\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.574:-->574\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.584:-->584\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.591:-->591\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.592:-->592\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.604:-->604\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.605:-->605\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.606:-->606\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.607:-->607\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.608:-->608\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.609:-->609\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.619:-->619\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.620:-->620\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.621:-->621\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.622:-->622\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.623:-->623\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.625:-->625\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1567:-->1567\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1568:-->1568\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1577:-->1577\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1578:-->1578\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1579:-->1579\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1580:-->1580\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1584:-->1584\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.736:-->736\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.739:-->739\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.740:-->740\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.741:-->741\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.742:-->742\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.743:-->743\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.745:-->745\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.746:-->746\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.749:-->749\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.750:-->750\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.751:-->751\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.752:-->752\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.753:-->753\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1561:-->1561\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1569:-->1569\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1570:-->1570\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1571:-->1571\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1572:-->1572\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1573:-->1573\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1574:-->1574\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1575:-->1575\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1576:-->1576\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1986:-->1986\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.627:-->627\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.628:-->628\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.637:-->637\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.638:-->638\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.639:-->639\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.640:-->640\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.641:-->641\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.643:-->643\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.644:-->644\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.645:-->645\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.647:-->647\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.648:-->648\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.649:-->649\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.650:-->650\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.651:-->651\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.652:-->652\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.653:-->653\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.655:-->655\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.656:-->656\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.657:-->657\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.658:-->658\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.660:-->660\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.661:-->661\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.663:-->663\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.668:-->668\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1558:-->1558\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1559:-->1559\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1560:-->1560\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1581:-->1581\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1582:-->1582\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1583:-->1583\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1585:-->1585\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1586:-->1586\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1587:-->1587\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1588:-->1588\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1589:-->1589\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1590:-->1590\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.636:-->636\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.669:-->669\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.695:-->695\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.697:-->697\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.698:-->698\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.699:-->699\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.700:-->700\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.701:-->701\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.702:-->702\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.704:-->704\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.705:-->705\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.717:-->717\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.718:-->718\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.719:-->719\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.720:-->720\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.721:-->721\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.722:-->722\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.723:-->723\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.725:-->725\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.727:-->727\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.48.53.728:-->728\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.631:-->631\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.671:-->671\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.672:-->672\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.674:-->674\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.675:-->675\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.676:-->676\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.678:-->678\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.679:-->679\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.680:-->680\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.683:-->683\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.685:-->685\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.686:-->686\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.689:-->689\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.691:-->691\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.692:-->692\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.693:-->693\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.694:-->694\n\
genAlarmIndex.13.78.79.67.95.69.77.52.48.48.48.95.66.85.696:-->696\n\
genAlarmIndex.13.87.74.67.84.95.83.97.112.112.104.105.114.101.6:-->6\n\
genAlarmIndex.13.87.80.66.65.95.83.97.112.112.104.105.114.101.1053:-->1053\n\
genAlarmIndex.14.87.74.67.84.95.67.80.54.48.48.48.95.48.49.1985:-->1985\n\
genAlarmIndex.14.87.80.66.65.95.67.80.54.48.48.48.95.48.49.1054:-->1054\n\
genAlarmIndex.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.49.167:-->167\n\
genAlarmIndex.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.50.12:-->12\n\
genAlarmIndex.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1983:-->1983\n\
genAlarmIndex.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1984:-->1984\n\
genAlarmIndex.16.87.80.66.65.95.65.109.101.116.104.121.115.116.95.48.49.1052:-->1052\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.816:-->816\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.825:-->825\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.829:-->829\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.836:-->836\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.813:-->813\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.815:-->815\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.831:-->831\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.834:-->834\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.812:-->812\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.818:-->818\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.822:-->822\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.828:-->828\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.821:-->821\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.823:-->823\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.826:-->826\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.827:-->827\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.819:-->819\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.840:-->840\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.833:-->833\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.839:-->839\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.857:-->857\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.859:-->859\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.886:-->886\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.1598:-->1598\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1206:-->1206\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1209:-->1209\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1214:-->1214\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1215:-->1215\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1217:-->1217\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1218:-->1218\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1436:-->1436\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1439:-->1439\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1440:-->1440\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1441:-->1441\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1444:-->1444\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1447:-->1447\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1438:-->1438\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1442:-->1442\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.866:-->866\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.867:-->867\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.868:-->868\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.869:-->869\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1435:-->1435\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1437:-->1437\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1443:-->1443\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1445:-->1445\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1446:-->1446\n\
genAlarmIndex.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1448:-->1448\n\
genAlarmIndex.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1981:-->1981\n\
genAlarmIndex.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1982:-->1982\n\
genAlarmOrigin.7.78.79.67.95.88.77.85.31:-->NOC_XMU\n\
genAlarmOrigin.10.78.79.67.95.77.85.88.95.48.49.770:-->NOC_MUX_01\n\
genAlarmOrigin.10.78.79.67.95.77.85.88.95.48.50.767:-->NOC_MUX_02\n\
genAlarmOrigin.10.78.79.67.95.77.85.88.95.66.85.775:-->NOC_MUX_BU\n\
genAlarmOrigin.11.87.74.67.84.95.77.85.88.95.48.49.1980:-->WJCT_MUX_01\n\
genAlarmOrigin.11.87.80.66.65.95.77.85.88.95.48.49.1056:-->WPBA_MUX_01\n\
genAlarmOrigin.13.78.79.67.95.67.80.54.48.48.48.95.48.49.754:-->NOC_CP6000_01\n\
genAlarmOrigin.13.78.79.67.95.67.80.54.48.48.48.95.48.50.762:-->NOC_CP6000_02\n\
genAlarmOrigin.13.78.79.67.95.67.80.54.48.48.48.95.48.51.765:-->NOC_CP6000_03\n\
genAlarmOrigin.13.78.79.67.95.67.80.54.48.48.48.95.66.85.778:-->NOC_CP6000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.782:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.788:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.790:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.791:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.792:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.794:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.795:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.797:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.798:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.799:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.801:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.802:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.803:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.807:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.808:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1543:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1842:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1844:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1845:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1846:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1847:-->NOC_EM4000_01\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.573:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.574:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.584:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.591:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.592:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.604:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.605:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.606:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.607:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.608:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.609:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.619:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.620:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.621:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.622:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.623:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.625:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1567:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1568:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1577:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1578:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1579:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1580:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1584:-->NOC_EM4000_02\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.736:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.739:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.740:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.741:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.742:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.743:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.745:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.746:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.749:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.750:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.751:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.752:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.753:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1561:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1569:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1570:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1571:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1572:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1573:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1574:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1575:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1576:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1986:-->NOC_EM4000_03\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.627:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.628:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.637:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.638:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.639:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.640:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.641:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.643:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.644:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.645:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.647:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.648:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.649:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.650:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.651:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.652:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.653:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.655:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.656:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.657:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.658:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.660:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.661:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.663:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.668:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1558:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1559:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1560:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1581:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1582:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1583:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1585:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1586:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1587:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1588:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1589:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1590:-->NOC_EM4000_04\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.636:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.669:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.695:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.697:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.698:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.699:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.700:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.701:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.702:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.704:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.705:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.717:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.718:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.719:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.720:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.721:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.722:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.723:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.725:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.727:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.48.53.728:-->NOC_EM4000_05\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.631:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.671:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.672:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.674:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.675:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.676:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.678:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.679:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.680:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.683:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.685:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.686:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.689:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.691:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.692:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.693:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.694:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.78.79.67.95.69.77.52.48.48.48.95.66.85.696:-->NOC_EM4000_BU\n\
genAlarmOrigin.13.87.74.67.84.95.83.97.112.112.104.105.114.101.6:-->WJCT_Sapphire\n\
genAlarmOrigin.13.87.80.66.65.95.83.97.112.112.104.105.114.101.1053:-->WPBA_Sapphire\n\
genAlarmOrigin.14.87.74.67.84.95.67.80.54.48.48.48.95.48.49.1985:-->WJCT_CP6000_01\n\
genAlarmOrigin.14.87.80.66.65.95.67.80.54.48.48.48.95.48.49.1054:-->WPBA_CP6000_01\n\
genAlarmOrigin.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.49.167:-->NOC_Amethyst_01\n\
genAlarmOrigin.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.50.12:-->NOC_Amethyst_02\n\
genAlarmOrigin.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1983:-->WJCT_Amethyst_01\n\
genAlarmOrigin.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1984:-->WJCT_Amethyst_01\n\
genAlarmOrigin.16.87.80.66.65.95.65.109.101.116.104.121.115.116.95.48.49.1052:-->WPBA_Amethyst_01\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.816:-->NOC_CP6000_01_mpeg_dec_01\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.825:-->NOC_CP6000_01_mpeg_dec_01\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.829:-->NOC_CP6000_01_mpeg_dec_01\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.836:-->NOC_CP6000_01_mpeg_dec_01\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.813:-->NOC_CP6000_01_mpeg_dec_02\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.815:-->NOC_CP6000_01_mpeg_dec_02\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.831:-->NOC_CP6000_01_mpeg_dec_02\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.834:-->NOC_CP6000_01_mpeg_dec_02\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.812:-->NOC_CP6000_01_mpeg_dec_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.818:-->NOC_CP6000_01_mpeg_dec_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.822:-->NOC_CP6000_01_mpeg_dec_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.828:-->NOC_CP6000_01_mpeg_dec_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.821:-->NOC_CP6000_01_mpeg_dec_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.823:-->NOC_CP6000_01_mpeg_dec_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.826:-->NOC_CP6000_01_mpeg_dec_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.827:-->NOC_CP6000_01_mpeg_dec_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.819:-->NOC_CP6000_02_mpeg_dec_02\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.840:-->NOC_CP6000_02_mpeg_dec_02\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.833:-->NOC_CP6000_02_mpeg_dec_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.839:-->NOC_CP6000_02_mpeg_dec_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.857:-->NOC_CP6000_02_mpeg_dec_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.859:-->NOC_CP6000_02_mpeg_dec_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.886:-->NOC_CP6000_02_mpeg_dec_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.1598:-->NOC_CP6000_02_mpeg_dec_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1206:-->NOC_CP6000_03_mpeg_enc_02\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1209:-->NOC_CP6000_03_mpeg_enc_02\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1214:-->NOC_CP6000_03_mpeg_enc_02\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1215:-->NOC_CP6000_03_mpeg_enc_02\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1217:-->NOC_CP6000_03_mpeg_enc_02\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1218:-->NOC_CP6000_03_mpeg_enc_02\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1436:-->NOC_CP6000_03_mpeg_enc_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1439:-->NOC_CP6000_03_mpeg_enc_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1440:-->NOC_CP6000_03_mpeg_enc_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1441:-->NOC_CP6000_03_mpeg_enc_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1444:-->NOC_CP6000_03_mpeg_enc_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1447:-->NOC_CP6000_03_mpeg_enc_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1438:-->NOC_CP6000_03_mpeg_enc_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1442:-->NOC_CP6000_03_mpeg_enc_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.866:-->NOC_CP6000_BU_mpeg_dec_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.867:-->NOC_CP6000_BU_mpeg_dec_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.868:-->NOC_CP6000_BU_mpeg_dec_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.869:-->NOC_CP6000_BU_mpeg_dec_03\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1435:-->NOC_CP6000_BU_mpeg_enc_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1437:-->NOC_CP6000_BU_mpeg_enc_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1443:-->NOC_CP6000_BU_mpeg_enc_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1445:-->NOC_CP6000_BU_mpeg_enc_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1446:-->NOC_CP6000_BU_mpeg_enc_04\n\
genAlarmOrigin.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1448:-->NOC_CP6000_BU_mpeg_enc_04\n\
genAlarmOrigin.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1981:-->WJCT_CP6000_01_mpeg_enc_04\n\
genAlarmOrigin.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1982:-->WJCT_CP6000_01_mpeg_enc_04\n\
genAlarmResourceId.7.78.79.67.95.88.77.85.31:-->\n\
genAlarmResourceId.10.78.79.67.95.77.85.88.95.48.49.770:-->PS2\n\
genAlarmResourceId.10.78.79.67.95.77.85.88.95.48.50.767:-->PS2\n\
genAlarmResourceId.10.78.79.67.95.77.85.88.95.66.85.775:-->PS2\n\
genAlarmResourceId.11.87.74.67.84.95.77.85.88.95.48.49.1980:-->PS2\n\
genAlarmResourceId.11.87.80.66.65.95.77.85.88.95.48.49.1056:-->PS2\n\
genAlarmResourceId.13.78.79.67.95.67.80.54.48.48.48.95.48.49.754:-->SHELF, PSU2\n\
genAlarmResourceId.13.78.79.67.95.67.80.54.48.48.48.95.48.50.762:-->SHELF, PSU2\n\
genAlarmResourceId.13.78.79.67.95.67.80.54.48.48.48.95.48.51.765:-->SHELF, PSU2\n\
genAlarmResourceId.13.78.79.67.95.67.80.54.48.48.48.95.66.85.778:-->SHELF, PSU2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.782:-->ENC7/VIDEO.IN\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.788:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.790:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.791:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.792:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.794:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.795:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.797:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.798:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.799:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.801:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.802:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.803:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.807:-->PSU_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.808:-->PSU_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1543:-->ENC1/AUDIO_3\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1842:-->ENC1/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1844:-->ENC1/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1845:-->ENC1/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1846:-->ENC1/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1847:-->ENC1/AUDIO_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.573:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.574:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.584:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.591:-->PSU_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.592:-->PSU_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.604:-->ENC3/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.605:-->ENC3/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.606:-->ENC3/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.607:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.608:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.609:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.619:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.620:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.621:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.622:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.623:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.625:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1567:-->ENC2/AUDIO_3\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1568:-->ENC2/AUDIO_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1577:-->ENC1/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1578:-->ENC1/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1579:-->ENC1/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1580:-->ENC1/AUDIO_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1584:-->ENC1/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.736:-->ENC7/VIDEO.IN\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.739:-->ENC8/VIDEO.IN\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.740:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.741:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.742:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.743:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.745:-->PSU_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.746:-->PSU_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.749:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.750:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.751:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.752:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.753:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1561:-->ENC6/VIDEO.IN\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1569:-->ENC1/AUDIO_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1570:-->ENC1/AUDIO_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1571:-->ENC1/AUDIO_3\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1572:-->ENC1/AUDIO_3\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1573:-->ENC1/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1574:-->ENC1/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1575:-->ENC1/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1576:-->ENC1/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1986:-->VIDEO_Board3\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.627:-->ENC5/VIDEO.IN\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.628:-->ENC1/VIDEO.IN\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.637:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.638:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.639:-->ENC4/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.640:-->ENC4/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.641:-->ENC4/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.643:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.644:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.645:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.647:-->ENC3/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.648:-->ENC3/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.649:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.650:-->ENC5/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.651:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.652:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.653:-->ENC1/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.655:-->PSU_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.656:-->PSU_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.657:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.658:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.660:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.661:-->ENC3/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.663:-->ENC8/VIDEO.IN\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.668:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1558:-->ENC6/AUDIO_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1559:-->ENC6/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1560:-->ENC6/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1581:-->ENC6/AUDIO_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1582:-->ENC6/AUDIO_3\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1583:-->ENC6/AUDIO_3\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1585:-->ENC7/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1586:-->ENC7/AUDIO_1\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1587:-->ENC7/AUDIO_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1588:-->ENC7/AUDIO_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1589:-->ENC7/AUDIO_3\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1590:-->ENC7/AUDIO_3\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.636:-->ENC5/VIDEO.IN\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.669:-->ENC1/VIDEO.IN\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.695:-->PSU_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.697:-->ENC3/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.698:-->ENC3/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.699:-->PSU_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.700:-->ENC3/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.701:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.702:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.704:-->ENC5/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.705:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.717:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.718:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.719:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.720:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.721:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.722:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.723:-->ENC1/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.725:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.727:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.48.53.728:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.631:-->ENC1/VIDEO.IN\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.671:-->ENC2/VIDEO.IN\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.672:-->ENC6/VIDEO.IN\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.674:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.675:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.676:-->ENC7/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.678:-->PSU_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.679:-->PSU_2\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.680:-->ENC1/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.683:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.685:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.686:-->ENC8/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.689:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.691:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.692:-->ENC2/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.693:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.694:-->ENC6/VBI\n\
genAlarmResourceId.13.78.79.67.95.69.77.52.48.48.48.95.66.85.696:-->ENC6/VBI\n\
genAlarmResourceId.13.87.74.67.84.95.83.97.112.112.104.105.114.101.6:-->\n\
genAlarmResourceId.13.87.80.66.65.95.83.97.112.112.104.105.114.101.1053:-->\n\
genAlarmResourceId.14.87.74.67.84.95.67.80.54.48.48.48.95.48.49.1985:-->SHELF, PSU2\n\
genAlarmResourceId.14.87.80.66.65.95.67.80.54.48.48.48.95.48.49.1054:-->SHELF, PSU2\n\
genAlarmResourceId.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.49.167:-->\n\
genAlarmResourceId.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.50.12:-->\n\
genAlarmResourceId.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1983:-->\n\
genAlarmResourceId.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1984:-->\n\
genAlarmResourceId.16.87.80.66.65.95.65.109.101.116.104.121.115.116.95.48.49.1052:-->\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.816:-->MPEG_DEC (1), TS1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.825:-->MPEG_DEC (1), TS2, IP_RX2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.829:-->MPEG_DEC (1), ETH1, IP_RX2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.836:-->MPEG_DEC (1), ETH1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.813:-->MPEG_DEC (2), TS1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.815:-->MPEG_DEC (2), TS2, IP_RX2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.831:-->MPEG_DEC (2), ETH1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.834:-->MPEG_DEC (2), ETH1, IP_RX2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.812:-->MPEG_DEC (3), TS1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.818:-->MPEG_DEC (3), ETH1, IP_RX2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.822:-->MPEG_DEC (3), TS2, IP_RX2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.828:-->MPEG_DEC (3), ETH1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.821:-->MPEG_DEC (4), TS1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.823:-->MPEG_DEC (4), TS2, IP_RX2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.826:-->MPEG_DEC (4), ETH1, IP_RX2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.827:-->MPEG_DEC (4), ETH1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.819:-->MPEG_DEC (2), TS1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.840:-->MPEG_DEC (2), ETH1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.833:-->MPEG_DEC (3), ETH1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.839:-->MPEG_DEC (3), TS1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.857:-->MPEG_DEC (4), ETH1, IP_RX2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.859:-->MPEG_DEC (4), TS2, IP_RX2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.886:-->MPEG_DEC (4), SDI.IN1, VIDEO1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.1598:-->MPEG_DEC (4), TS1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1206:-->MPEG_ENC (2), SDI.IN1, AUDIO2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1209:-->MPEG_ENC (2), SDI.IN1, AUDIO1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1214:-->MPEG_ENC (2), SDI.IN1, AUDIO5\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1215:-->MPEG_ENC (2), SDI.IN1, AUDIO4\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1217:-->MPEG_ENC (2), SDI.IN3\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1218:-->MPEG_ENC (2), SDI.IN1, AUDIO3\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1436:-->MPEG_ENC (3), SDI.IN3, AUDIO4\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1439:-->MPEG_ENC (3), SDI.IN3, AUDIO5\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1440:-->MPEG_ENC (3), SDI.IN3, AUDIO1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1441:-->MPEG_ENC (3), SDI.IN3, AUDIO2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1444:-->MPEG_ENC (3), SDI.IN3, AUDIO3\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1447:-->MPEG_ENC (3), SDI.IN1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1438:-->MPEG_ENC (4), SDI.IN3\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1442:-->MPEG_ENC (4), SDI.IN1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.866:-->MPEG_DEC (3), ETH1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.867:-->MPEG_DEC (3), ETH1, IP_RX2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.868:-->MPEG_DEC (3), TS1, IP_RX1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.869:-->MPEG_DEC (3), TS2, IP_RX2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1435:-->MPEG_ENC (4), SDI.IN3, AUDIO2\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1437:-->MPEG_ENC (4), SDI.IN3, AUDIO3\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1443:-->MPEG_ENC (4), SDI.IN3, AUDIO1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1445:-->MPEG_ENC (4), SDI.IN1\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1446:-->MPEG_ENC (4), SDI.IN3, AUDIO4\n\
genAlarmResourceId.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1448:-->MPEG_ENC (4), SDI.IN3, AUDIO5\n\
genAlarmResourceId.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1981:-->MPEG_ENC (4), SDI.IN3\n\
genAlarmResourceId.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1982:-->MPEG_ENC (4), SDI.IN1\n\
genAlarmProbableCause.7.78.79.67.95.88.77.85.31:-->78\n\
genAlarmProbableCause.10.78.79.67.95.77.85.88.95.48.49.770:-->78\n\
genAlarmProbableCause.10.78.79.67.95.77.85.88.95.48.50.767:-->78\n\
genAlarmProbableCause.10.78.79.67.95.77.85.88.95.66.85.775:-->78\n\
genAlarmProbableCause.11.87.74.67.84.95.77.85.88.95.48.49.1980:-->78\n\
genAlarmProbableCause.11.87.80.66.65.95.77.85.88.95.48.49.1056:-->78\n\
genAlarmProbableCause.13.78.79.67.95.67.80.54.48.48.48.95.48.49.754:-->78\n\
genAlarmProbableCause.13.78.79.67.95.67.80.54.48.48.48.95.48.50.762:-->78\n\
genAlarmProbableCause.13.78.79.67.95.67.80.54.48.48.48.95.48.51.765:-->78\n\
genAlarmProbableCause.13.78.79.67.95.67.80.54.48.48.48.95.66.85.778:-->78\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.782:-->8\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.788:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.790:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.791:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.792:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.794:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.795:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.797:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.798:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.799:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.801:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.802:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.803:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.807:-->1076\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.808:-->58\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1543:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1842:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1844:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1845:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1846:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1847:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.573:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.574:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.584:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.591:-->1076\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.592:-->58\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.604:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.605:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.606:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.607:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.608:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.609:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.619:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.620:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.621:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.622:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.623:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.625:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1567:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1568:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1577:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1578:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1579:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1580:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1584:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.736:-->1064\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.739:-->1064\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.740:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.741:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.742:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.743:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.745:-->1076\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.746:-->58\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.749:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.750:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.751:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.752:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.753:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1561:-->1064\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1569:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1570:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1571:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1572:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1573:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1574:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1575:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1576:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1986:-->123\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.627:-->1064\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.628:-->8\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.637:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.638:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.639:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.640:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.641:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.643:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.644:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.645:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.647:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.648:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.649:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.650:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.651:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.652:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.653:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.655:-->1076\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.656:-->58\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.657:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.658:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.660:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.661:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.663:-->8\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.668:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1558:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1559:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1560:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1581:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1582:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1583:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1585:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1586:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1587:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1588:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1589:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1590:-->1330\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.636:-->1064\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.669:-->8\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.695:-->58\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.697:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.698:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.699:-->1076\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.700:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.701:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.702:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.704:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.705:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.717:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.718:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.719:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.720:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.721:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.722:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.723:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.725:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.727:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.48.53.728:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.631:-->8\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.671:-->8\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.672:-->8\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.674:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.675:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.676:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.678:-->58\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.679:-->1076\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.680:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.683:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.685:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.686:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.689:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.691:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.692:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.693:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.694:-->1049\n\
genAlarmProbableCause.13.78.79.67.95.69.77.52.48.48.48.95.66.85.696:-->1049\n\
genAlarmProbableCause.13.87.74.67.84.95.83.97.112.112.104.105.114.101.6:-->22\n\
genAlarmProbableCause.13.87.80.66.65.95.83.97.112.112.104.105.114.101.1053:-->22\n\
genAlarmProbableCause.14.87.74.67.84.95.67.80.54.48.48.48.95.48.49.1985:-->78\n\
genAlarmProbableCause.14.87.80.66.65.95.67.80.54.48.48.48.95.48.49.1054:-->78\n\
genAlarmProbableCause.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.49.167:-->78\n\
genAlarmProbableCause.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.50.12:-->78\n\
genAlarmProbableCause.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1983:-->1108\n\
genAlarmProbableCause.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1984:-->78\n\
genAlarmProbableCause.16.87.80.66.65.95.65.109.101.116.104.121.115.116.95.48.49.1052:-->78\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.816:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.825:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.829:-->1287\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.836:-->1287\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.813:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.815:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.831:-->1287\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.834:-->1287\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.812:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.818:-->1287\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.822:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.828:-->1287\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.821:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.823:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.826:-->1287\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.827:-->1287\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.819:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.840:-->1287\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.833:-->1287\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.839:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.857:-->1287\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.859:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.886:-->1198\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.1598:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1206:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1209:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1214:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1215:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1217:-->1064\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1218:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1436:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1439:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1440:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1441:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1444:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1447:-->1064\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1438:-->1064\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1442:-->1064\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.866:-->1287\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.867:-->1287\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.868:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.869:-->1059\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1435:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1437:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1443:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1445:-->1064\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1446:-->1062\n\
genAlarmProbableCause.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1448:-->1062\n\
genAlarmProbableCause.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1981:-->1065\n\
genAlarmProbableCause.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1982:-->1065\n\
genAlarmSpecificProblem.7.78.79.67.95.88.77.85.31:-->[cause="PSU 2"]\n\
genAlarmSpecificProblem.10.78.79.67.95.77.85.88.95.48.49.770:-->\n\
genAlarmSpecificProblem.10.78.79.67.95.77.85.88.95.48.50.767:-->\n\
genAlarmSpecificProblem.10.78.79.67.95.77.85.88.95.66.85.775:-->\n\
genAlarmSpecificProblem.11.87.74.67.84.95.77.85.88.95.48.49.1980:-->\n\
genAlarmSpecificProblem.11.87.80.66.65.95.77.85.88.95.48.49.1056:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.67.80.54.48.48.48.95.48.49.754:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.67.80.54.48.48.48.95.48.50.762:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.67.80.54.48.48.48.95.48.51.765:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.67.80.54.48.48.48.95.66.85.778:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.782:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.788:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.790:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.791:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.792:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.794:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.795:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.797:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.798:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.799:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.801:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.802:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.803:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.807:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.808:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1543:-->channel="left"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1842:-->channel="center"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1844:-->channel="LFE"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1845:-->channel="left surround"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1846:-->channel="right surround"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1847:-->channel="left"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.573:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.574:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.584:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.591:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.592:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.604:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.605:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.606:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.607:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.608:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.609:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.619:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.620:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.621:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.622:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.623:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.625:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1567:-->channel="left"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1568:-->channel="left"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1577:-->channel="LFE"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1578:-->channel="left surround"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1579:-->channel="right surround"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1580:-->channel="left"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1584:-->channel="center"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.736:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.739:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.740:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.741:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.742:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.743:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.745:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.746:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.749:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.750:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.751:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.752:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.753:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1561:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1569:-->channel="left"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1570:-->channel="right"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1571:-->channel="left"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1572:-->channel="right"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1573:-->channel="center"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1574:-->channel="LFE"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1575:-->channel="left surround"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1576:-->channel="right surround"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1986:-->code="3"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.627:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.628:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.637:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.638:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.639:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.640:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.641:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.643:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.644:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.645:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.647:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.648:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.649:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.650:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.651:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.652:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.653:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.655:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.656:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.657:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.658:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.660:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.661:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.663:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.668:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1558:-->channel="left"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1559:-->channel="right"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1560:-->channel="left"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1581:-->channel="right"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1582:-->channel="left"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1583:-->channel="right"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1585:-->channel="left"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1586:-->channel="right"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1587:-->channel="left"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1588:-->channel="right"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1589:-->channel="left"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1590:-->channel="right"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.636:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.669:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.695:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.697:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.698:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.699:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.700:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.701:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.702:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.704:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.705:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.717:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.718:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.719:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.720:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.721:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.722:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.723:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.725:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.727:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.48.53.728:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.631:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.671:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.672:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.674:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.675:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.676:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.678:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.679:-->\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.680:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.683:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.685:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.686:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.689:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.691:-->line_index="284"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.692:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.693:-->line_index="21"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.694:-->line_index="DTVCC"\n\
genAlarmSpecificProblem.13.78.79.67.95.69.77.52.48.48.48.95.66.85.696:-->line_index="284"\n\
genAlarmSpecificProblem.13.87.74.67.84.95.83.97.112.112.104.105.114.101.6:-->\n\
genAlarmSpecificProblem.13.87.80.66.65.95.83.97.112.112.104.105.114.101.1053:-->\n\
genAlarmSpecificProblem.14.87.74.67.84.95.67.80.54.48.48.48.95.48.49.1985:-->\n\
genAlarmSpecificProblem.14.87.80.66.65.95.67.80.54.48.48.48.95.48.49.1054:-->\n\
genAlarmSpecificProblem.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.49.167:-->\n\
genAlarmSpecificProblem.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.50.12:-->\n\
genAlarmSpecificProblem.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1983:-->Amethyst switches are in their local maintenance mode\n\
genAlarmSpecificProblem.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1984:-->\n\
genAlarmSpecificProblem.16.87.80.66.65.95.65.109.101.116.104.121.115.116.95.48.49.1052:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.816:-->Service Id 1\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.825:-->Service Id 1\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.829:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.836:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.813:-->Service Id 1\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.815:-->Service Id 1\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.831:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.834:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.812:-->Service Id 1\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.818:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.822:-->Service Id 1\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.828:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.821:-->Service Id 1\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.823:-->Service Id 1\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.826:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.827:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.819:-->Service Id 1\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.840:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.833:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.839:-->Service Id 1\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.857:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.859:-->Service Id 2\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.886:-->code CP6K-LD-MP2SD-422\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.1598:-->Service Id 2\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1206:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1209:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1214:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1215:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1217:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1218:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1436:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1439:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1440:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1441:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1444:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1447:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1438:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1442:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.866:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.867:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.868:-->Service Id 1\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.869:-->Service Id 1\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1435:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1437:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1443:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1445:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1446:-->\n\
genAlarmSpecificProblem.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1448:-->\n\
genAlarmSpecificProblem.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1981:-->\n\
genAlarmSpecificProblem.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1982:-->\n\
genAlarmSeverity.7.78.79.67.95.88.77.85.31:-->severityMajor(5)\n\
genAlarmSeverity.10.78.79.67.95.77.85.88.95.48.49.770:-->severityMajor(5)\n\
genAlarmSeverity.10.78.79.67.95.77.85.88.95.48.50.767:-->severityMajor(5)\n\
genAlarmSeverity.10.78.79.67.95.77.85.88.95.66.85.775:-->severityMajor(5)\n\
genAlarmSeverity.11.87.74.67.84.95.77.85.88.95.48.49.1980:-->severityMajor(5)\n\
genAlarmSeverity.11.87.80.66.65.95.77.85.88.95.48.49.1056:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.67.80.54.48.48.48.95.48.49.754:-->severityCritical(6)\n\
genAlarmSeverity.13.78.79.67.95.67.80.54.48.48.48.95.48.50.762:-->severityCritical(6)\n\
genAlarmSeverity.13.78.79.67.95.67.80.54.48.48.48.95.48.51.765:-->severityCritical(6)\n\
genAlarmSeverity.13.78.79.67.95.67.80.54.48.48.48.95.66.85.778:-->severityCritical(6)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.782:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.788:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.790:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.791:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.792:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.794:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.795:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.797:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.798:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.799:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.801:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.802:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.803:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.807:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.808:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1543:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1842:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1844:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1845:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1846:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1847:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.573:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.574:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.584:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.591:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.592:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.604:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.605:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.606:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.607:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.608:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.609:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.619:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.620:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.621:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.622:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.623:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.625:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1567:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1568:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1577:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1578:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1579:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1580:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1584:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.736:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.739:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.740:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.741:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.742:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.743:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.745:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.746:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.749:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.750:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.751:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.752:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.753:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1561:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1569:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1570:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1571:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1572:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1573:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1574:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1575:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1576:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1986:-->severityCritical(6)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.627:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.628:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.637:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.638:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.639:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.640:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.641:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.643:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.644:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.645:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.647:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.648:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.649:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.650:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.651:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.652:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.653:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.655:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.656:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.657:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.658:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.660:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.661:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.663:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.668:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1558:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1559:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1560:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1581:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1582:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1583:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1585:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1586:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1587:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1588:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1589:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1590:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.636:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.669:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.695:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.697:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.698:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.699:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.700:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.701:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.702:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.704:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.705:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.717:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.718:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.719:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.720:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.721:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.722:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.723:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.725:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.727:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.48.53.728:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.631:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.671:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.672:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.674:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.675:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.676:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.678:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.679:-->severityMajor(5)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.680:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.683:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.685:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.686:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.689:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.691:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.692:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.693:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.694:-->severityWarning(3)\n\
genAlarmSeverity.13.78.79.67.95.69.77.52.48.48.48.95.66.85.696:-->severityWarning(3)\n\
genAlarmSeverity.13.87.74.67.84.95.83.97.112.112.104.105.114.101.6:-->severityMajor(5)\n\
genAlarmSeverity.13.87.80.66.65.95.83.97.112.112.104.105.114.101.1053:-->severityMajor(5)\n\
genAlarmSeverity.14.87.74.67.84.95.67.80.54.48.48.48.95.48.49.1985:-->severityCritical(6)\n\
genAlarmSeverity.14.87.80.66.65.95.67.80.54.48.48.48.95.48.49.1054:-->severityCritical(6)\n\
genAlarmSeverity.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.49.167:-->severityCritical(6)\n\
genAlarmSeverity.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.50.12:-->severityCritical(6)\n\
genAlarmSeverity.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1983:-->severityWarning(3)\n\
genAlarmSeverity.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1984:-->severityCritical(6)\n\
genAlarmSeverity.16.87.80.66.65.95.65.109.101.116.104.121.115.116.95.48.49.1052:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.816:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.825:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.829:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.836:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.813:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.815:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.831:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.834:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.812:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.818:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.822:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.828:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.821:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.823:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.826:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.827:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.819:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.840:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.833:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.839:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.857:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.859:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.886:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.1598:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1206:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1209:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1214:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1215:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1217:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1218:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1436:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1439:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1440:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1441:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1444:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1447:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1438:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1442:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.866:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.867:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.868:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.869:-->severityMajor(5)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1435:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1437:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1443:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1445:-->severityCritical(6)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1446:-->severityMinor(4)\n\
genAlarmSeverity.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1448:-->severityMinor(4)\n\
genAlarmSeverity.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1981:-->severityCritical(6)\n\
genAlarmSeverity.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1982:-->severityCritical(6)\n\
genAlarmCategory.7.78.79.67.95.88.77.85.31:-->equipment(4)\n\
genAlarmCategory.10.78.79.67.95.77.85.88.95.48.49.770:-->equipment(4)\n\
genAlarmCategory.10.78.79.67.95.77.85.88.95.48.50.767:-->equipment(4)\n\
genAlarmCategory.10.78.79.67.95.77.85.88.95.66.85.775:-->equipment(4)\n\
genAlarmCategory.11.87.74.67.84.95.77.85.88.95.48.49.1980:-->equipment(4)\n\
genAlarmCategory.11.87.80.66.65.95.77.85.88.95.48.49.1056:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.67.80.54.48.48.48.95.48.49.754:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.67.80.54.48.48.48.95.48.50.762:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.67.80.54.48.48.48.95.48.51.765:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.67.80.54.48.48.48.95.66.85.778:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.782:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.788:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.790:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.791:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.792:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.794:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.795:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.797:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.798:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.799:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.801:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.802:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.803:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.807:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.808:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1543:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1842:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1844:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1845:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1846:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1847:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.573:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.574:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.584:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.591:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.592:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.604:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.605:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.606:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.607:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.608:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.609:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.619:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.620:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.621:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.622:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.623:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.625:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1567:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1568:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1577:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1578:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1579:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1580:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1584:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.736:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.739:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.740:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.741:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.742:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.743:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.745:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.746:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.749:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.750:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.751:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.752:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.753:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1561:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1569:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1570:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1571:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1572:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1573:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1574:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1575:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1576:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1986:-->environment(5)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.627:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.628:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.637:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.638:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.639:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.640:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.641:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.643:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.644:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.645:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.647:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.648:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.649:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.650:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.651:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.652:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.653:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.655:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.656:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.657:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.658:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.660:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.661:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.663:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.668:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1558:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1559:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1560:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1581:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1582:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1583:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1585:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1586:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1587:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1588:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1589:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1590:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.636:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.669:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.695:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.697:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.698:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.699:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.700:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.701:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.702:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.704:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.705:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.717:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.718:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.719:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.720:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.721:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.722:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.723:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.725:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.727:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.48.53.728:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.631:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.671:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.672:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.674:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.675:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.676:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.678:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.679:-->equipment(4)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.680:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.683:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.685:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.686:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.689:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.691:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.692:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.693:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.694:-->communication(1)\n\
genAlarmCategory.13.78.79.67.95.69.77.52.48.48.48.95.66.85.696:-->communication(1)\n\
genAlarmCategory.13.87.74.67.84.95.83.97.112.112.104.105.114.101.6:-->communication(1)\n\
genAlarmCategory.13.87.80.66.65.95.83.97.112.112.104.105.114.101.1053:-->communication(1)\n\
genAlarmCategory.14.87.74.67.84.95.67.80.54.48.48.48.95.48.49.1985:-->equipment(4)\n\
genAlarmCategory.14.87.80.66.65.95.67.80.54.48.48.48.95.48.49.1054:-->equipment(4)\n\
genAlarmCategory.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.49.167:-->equipment(4)\n\
genAlarmCategory.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.50.12:-->equipment(4)\n\
genAlarmCategory.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1983:-->equipment(4)\n\
genAlarmCategory.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1984:-->equipment(4)\n\
genAlarmCategory.16.87.80.66.65.95.65.109.101.116.104.121.115.116.95.48.49.1052:-->equipment(4)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.816:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.825:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.829:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.836:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.813:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.815:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.831:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.834:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.812:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.818:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.822:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.828:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.821:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.823:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.826:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.827:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.819:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.840:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.833:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.839:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.857:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.859:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.886:-->processing(3)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.1598:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1206:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1209:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1214:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1215:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1217:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1218:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1436:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1439:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1440:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1441:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1444:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1447:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1438:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1442:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.866:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.867:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.868:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.869:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1435:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1437:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1443:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1445:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1446:-->communication(1)\n\
genAlarmCategory.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1448:-->communication(1)\n\
genAlarmCategory.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1981:-->communication(1)\n\
genAlarmCategory.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1982:-->communication(1)\n\
genAlarmLabel.7.78.79.67.95.88.77.85.31:-->Power supply failure: [cause="PSU 2"]\n\
genAlarmLabel.10.78.79.67.95.77.85.88.95.48.49.770:-->Power supply failure\n\
genAlarmLabel.10.78.79.67.95.77.85.88.95.48.50.767:-->Power supply failure\n\
genAlarmLabel.10.78.79.67.95.77.85.88.95.66.85.775:-->Power supply failure\n\
genAlarmLabel.11.87.74.67.84.95.77.85.88.95.48.49.1980:-->Power supply failure\n\
genAlarmLabel.11.87.80.66.65.95.77.85.88.95.48.49.1056:-->Power supply failure\n\
genAlarmLabel.13.78.79.67.95.67.80.54.48.48.48.95.48.49.754:-->Power supply failure\n\
genAlarmLabel.13.78.79.67.95.67.80.54.48.48.48.95.48.50.762:-->Power supply failure\n\
genAlarmLabel.13.78.79.67.95.67.80.54.48.48.48.95.48.51.765:-->Power supply failure\n\
genAlarmLabel.13.78.79.67.95.67.80.54.48.48.48.95.66.85.778:-->Power supply failure\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.782:-->Loss of signal\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.788:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.790:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.791:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.792:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.794:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.795:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.797:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.798:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.799:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.801:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.802:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.803:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.807:-->Ventilation failure\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.808:-->Power problem\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1543:-->Detected silence: channel="left"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1842:-->Detected silence: channel="center"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1844:-->Detected silence: channel="LFE"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1845:-->Detected silence: channel="left surround"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1846:-->Detected silence: channel="right surround"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.49.1847:-->Detected silence: channel="left"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.573:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.574:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.584:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.591:-->Ventilation failure\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.592:-->Power problem\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.604:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.605:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.606:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.607:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.608:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.609:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.619:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.620:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.621:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.622:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.623:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.625:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1567:-->Detected silence: channel="left"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1568:-->Detected silence: channel="left"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1577:-->Detected silence: channel="LFE"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1578:-->Detected silence: channel="left surround"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1579:-->Detected silence: channel="right surround"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1580:-->Detected silence: channel="left"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.50.1584:-->Detected silence: channel="center"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.736:-->Video standard mismatch\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.739:-->Video standard mismatch\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.740:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.741:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.742:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.743:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.745:-->Ventilation failure\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.746:-->Power problem\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.749:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.750:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.751:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.752:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.753:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1561:-->Video standard mismatch\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1569:-->Detected silence: channel="left"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1570:-->Detected silence: channel="right"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1571:-->Detected silence: channel="left"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1572:-->Detected silence: channel="right"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1573:-->Detected silence: channel="center"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1574:-->Detected silence: channel="LFE"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1575:-->Detected silence: channel="left surround"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1576:-->Detected silence: channel="right surround"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.51.1986:-->High temperature: code="3"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.627:-->Video standard mismatch\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.628:-->Loss of signal\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.637:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.638:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.639:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.640:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.641:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.643:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.644:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.645:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.647:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.648:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.649:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.650:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.651:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.652:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.653:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.655:-->Ventilation failure\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.656:-->Power problem\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.657:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.658:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.660:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.661:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.663:-->Loss of signal\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.668:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1558:-->Detected silence: channel="left"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1559:-->Detected silence: channel="right"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1560:-->Detected silence: channel="left"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1581:-->Detected silence: channel="right"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1582:-->Detected silence: channel="left"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1583:-->Detected silence: channel="right"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1585:-->Detected silence: channel="left"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1586:-->Detected silence: channel="right"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1587:-->Detected silence: channel="left"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1588:-->Detected silence: channel="right"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1589:-->Detected silence: channel="left"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.52.1590:-->Detected silence: channel="right"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.636:-->Video standard mismatch\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.669:-->Loss of signal\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.695:-->Power problem\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.697:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.698:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.699:-->Ventilation failure\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.700:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.701:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.702:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.704:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.705:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.717:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.718:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.719:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.720:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.721:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.722:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.723:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.725:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.727:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.48.53.728:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.631:-->Loss of signal\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.671:-->Loss of signal\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.672:-->Loss of signal\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.674:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.675:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.676:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.678:-->Power problem\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.679:-->Ventilation failure\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.680:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.683:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.685:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.686:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.689:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.691:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.692:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.693:-->No CC in signal: line_index="21"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.694:-->No CC in signal: line_index="DTVCC"\n\
genAlarmLabel.13.78.79.67.95.69.77.52.48.48.48.95.66.85.696:-->No CC in signal: line_index="284"\n\
genAlarmLabel.13.87.74.67.84.95.83.97.112.112.104.105.114.101.6:-->Connection establishment error\n\
genAlarmLabel.13.87.80.66.65.95.83.97.112.112.104.105.114.101.1053:-->Connection establishment error\n\
genAlarmLabel.14.87.74.67.84.95.67.80.54.48.48.48.95.48.49.1985:-->Power supply failure\n\
genAlarmLabel.14.87.80.66.65.95.67.80.54.48.48.48.95.48.49.1054:-->Power supply failure\n\
genAlarmLabel.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.49.167:-->Power supply failure\n\
genAlarmLabel.15.78.79.67.95.65.109.101.116.104.121.115.116.95.48.50.12:-->Power supply failure\n\
genAlarmLabel.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1983:-->Function not operating: Amethyst switches are in their local maintenance mode\n\
genAlarmLabel.16.87.74.67.84.95.65.109.101.116.104.121.115.116.95.48.49.1984:-->Power supply failure\n\
genAlarmLabel.16.87.80.66.65.95.65.109.101.116.104.121.115.116.95.48.49.1052:-->Power supply failure\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.816:-->ServiceId not present: Service Id 1\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.825:-->ServiceId not present: Service Id 1\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.829:-->No stream received\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.49.836:-->No stream received\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.813:-->ServiceId not present: Service Id 1\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.815:-->ServiceId not present: Service Id 1\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.831:-->No stream received\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.50.834:-->No stream received\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.812:-->ServiceId not present: Service Id 1\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.818:-->No stream received\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.822:-->ServiceId not present: Service Id 1\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.51.828:-->No stream received\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.821:-->ServiceId not present: Service Id 1\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.823:-->ServiceId not present: Service Id 1\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.826:-->No stream received\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.100.101.99.95.48.52.827:-->No stream received\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.819:-->ServiceId not present: Service Id 1\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.50.840:-->No stream received\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.833:-->No stream received\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.51.839:-->ServiceId not present: Service Id 1\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.857:-->No stream received\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.859:-->ServiceId not present: Service Id 2\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.886:-->Option missing: code CP6K-LD-MP2SD-422\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.50.95.109.112.101.103.95.100.101.99.95.48.52.1598:-->ServiceId not present: Service Id 2\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1206:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1209:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1214:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1215:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1217:-->Video standard mismatch\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.50.1218:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1436:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1439:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1440:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1441:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1444:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.51.1447:-->Video standard mismatch\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1438:-->Video standard mismatch\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.48.51.95.109.112.101.103.95.101.110.99.95.48.52.1442:-->Video standard mismatch\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.866:-->No stream received\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.867:-->No stream received\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.868:-->ServiceId not present: Service Id 1\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.100.101.99.95.48.51.869:-->ServiceId not present: Service Id 1\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1435:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1437:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1443:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1445:-->Video standard mismatch\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1446:-->No embedded signal\n\
genAlarmLabel.25.78.79.67.95.67.80.54.48.48.48.95.66.85.95.109.112.101.103.95.101.110.99.95.48.52.1448:-->No embedded signal\n\
genAlarmLabel.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1981:-->Video standard unknown\n\
genAlarmLabel.26.87.74.67.84.95.67.80.54.48.48.48.95.48.49.95.109.112.101.103.95.101.110.99.95.48.52.1982:-->Video standard unknown\n\
genEventRecordId.6404:-->6404\n\
genEventRecordId.6405:-->6405\n\
genEventRecordId.6406:-->6406\n\
genEventRecordId.6407:-->6407\n\
genEventRecordId.6408:-->6408\n\
genEventRecordId.6409:-->6409\n\
genEventRecordId.6410:-->6410\n\
genEventRecordId.6411:-->6411\n\
genEventRecordId.6412:-->6412\n\
genEventRecordId.6413:-->6413\n\
genEventRecordId.6414:-->6414\n\
genEventRecordId.6415:-->6415\n\
genEventRecordId.6416:-->6416\n\
genEventRecordId.6417:-->6417\n\
genEventRecordId.6418:-->6418\n\
genEventRecordId.6419:-->6419\n\
genEventRecordId.6420:-->6420\n\
genEventRecordId.6421:-->6421\n\
genEventRecordId.6422:-->6422\n\
genEventRecordId.6423:-->6423\n\
genEventRecordId.6424:-->6424\n\
genEventRecordId.6425:-->6425\n\
genEventRecordId.6426:-->6426\n\
genEventRecordId.6427:-->6427\n\
genEventRecordId.6428:-->6428\n\
genEventRecordId.6429:-->6429\n\
genEventRecordId.6430:-->6430\n\
genEventRecordId.6431:-->6431\n\
genEventRecordId.6432:-->6432\n\
genEventRecordId.6433:-->6433\n\
genEventRecordId.6434:-->6434\n\
genEventRecordId.6435:-->6435\n\
genEventRecordId.6436:-->6436\n\
genEventRecordId.6437:-->6437\n\
genEventRecordId.6438:-->6438\n\
genEventRecordId.6439:-->6439\n\
genEventRecordId.6440:-->6440\n\
genEventRecordId.6441:-->6441\n\
genEventRecordId.6442:-->6442\n\
genEventRecordId.6443:-->6443\n\
genEventRecordId.6444:-->6444\n\
genEventRecordId.6445:-->6445\n\
genEventRecordId.6446:-->6446\n\
genEventRecordId.6447:-->6447\n\
genEventRecordId.6448:-->6448\n\
genEventRecordId.6449:-->6449\n\
genEventRecordId.6450:-->6450\n\
genEventRecordId.6451:-->6451\n\
genEventRecordId.6452:-->6452\n\
genEventRecordId.6453:-->6453\n\
genEventRecordId.6454:-->6454\n\
genEventRecordId.6455:-->6455\n\
genEventRecordId.6456:-->6456\n\
genEventRecordId.6457:-->6457\n\
genEventRecordId.6458:-->6458\n\
genEventRecordId.6459:-->6459\n\
genEventRecordId.6460:-->6460\n\
genEventRecordId.6461:-->6461\n\
genEventRecordId.6462:-->6462\n\
genEventRecordId.6463:-->6463\n\
genEventRecordId.6464:-->6464\n\
genEventRecordId.6465:-->6465\n\
genEventRecordId.6466:-->6466\n\
genEventRecordId.6467:-->6467\n\
genEventRecordId.6468:-->6468\n\
genEventRecordId.6469:-->6469\n\
genEventRecordId.6470:-->6470\n\
genEventRecordId.6471:-->6471\n\
genEventRecordId.6472:-->6472\n\
genEventRecordId.6473:-->6473\n\
genEventRecordId.6474:-->6474\n\
genEventRecordId.6475:-->6475\n\
genEventRecordId.6476:-->6476\n\
genEventRecordId.6477:-->6477\n\
genEventRecordId.6478:-->6478\n\
genEventRecordId.6479:-->6479\n\
genEventRecordId.6480:-->6480\n\
genEventRecordId.6481:-->6481\n\
genEventRecordId.6482:-->6482\n\
genEventRecordId.6483:-->6483\n\
genEventRecordId.6484:-->6484\n\
genEventRecordId.6485:-->6485\n\
genEventRecordId.6486:-->6486\n\
genEventRecordId.6487:-->6487\n\
genEventRecordId.6488:-->6488\n\
genEventRecordId.6489:-->6489\n\
genEventRecordId.6490:-->6490\n\
genEventRecordId.6491:-->6491\n\
genEventRecordId.6492:-->6492\n\
genEventRecordId.6493:-->6493\n\
genEventRecordId.6494:-->6494\n\
genEventRecordId.6495:-->6495\n\
genEventRecordId.6496:-->6496\n\
genEventRecordId.6497:-->6497\n\
genEventRecordId.6498:-->6498\n\
genEventRecordId.6499:-->6499\n\
genEventRecordId.6500:-->6500\n\
genEventRecordId.6501:-->6501\n\
genEventRecordId.6502:-->6502\n\
genEventRecordId.6503:-->6503\n\
genEventRecordId.6504:-->6504\n\
genEventRecordId.6505:-->6505\n\
genEventRecordId.6506:-->6506\n\
genEventRecordId.6507:-->6507\n\
genEventRecordId.6508:-->6508\n\
genEventRecordId.6509:-->6509\n\
genEventRecordId.6510:-->6510\n\
genEventRecordId.6511:-->6511\n\
genEventRecordId.6512:-->6512\n\
genEventRecordId.6513:-->6513\n\
genEventRecordId.6514:-->6514\n\
genEventRecordId.6515:-->6515\n\
genEventRecordId.6516:-->6516\n\
genEventRecordId.6517:-->6517\n\
genEventRecordId.6518:-->6518\n\
genEventRecordId.6519:-->6519\n\
genEventRecordId.6520:-->6520\n\
genEventRecordId.6521:-->6521\n\
genEventRecordId.6522:-->6522\n\
genEventRecordId.6523:-->6523\n\
genEventRecordId.6524:-->6524\n\
genEventRecordId.6525:-->6525\n\
genEventRecordId.6526:-->6526\n\
genEventRecordId.6527:-->6527\n\
genEventRecordId.6528:-->6528\n\
genEventRecordId.6529:-->6529\n\
genEventRecordId.6530:-->6530\n\
genEventRecordId.6531:-->6531\n\
genEventRecordId.6532:-->6532\n\
genEventRecordId.6533:-->6533\n\
genEventRecordId.6534:-->6534\n\
genEventRecordId.6535:-->6535\n\
genEventRecordId.6536:-->6536\n\
genEventRecordId.6537:-->6537\n\
genEventRecordId.6538:-->6538\n\
genEventRecordId.6539:-->6539\n\
genEventRecordId.6540:-->6540\n\
genEventRecordId.6541:-->6541\n\
genEventRecordId.6542:-->6542\n\
genEventRecordId.6543:-->6543\n\
genEventRecordId.6544:-->6544\n\
genEventRecordId.6545:-->6545\n\
genEventRecordId.6546:-->6546\n\
genEventRecordId.6547:-->6547\n\
genEventRecordId.6548:-->6548\n\
genEventRecordId.6549:-->6549\n\
genEventRecordId.6550:-->6550\n\
genEventRecordId.6551:-->6551\n\
genEventRecordId.6552:-->6552\n\
genEventRecordId.6553:-->6553\n\
genEventRecordId.6554:-->6554\n\
genEventRecordId.6555:-->6555\n\
genEventRecordId.6556:-->6556\n\
genEventRecordId.6557:-->6557\n\
genEventRecordId.6558:-->6558\n\
genEventRecordId.6559:-->6559\n\
genEventRecordId.6560:-->6560\n\
genEventRecordId.6561:-->6561\n\
genEventRecordId.6562:-->6562\n\
genEventRecordId.6563:-->6563\n\
genEventRecordId.6564:-->6564\n\
genEventRecordId.6565:-->6565\n\
genEventRecordId.6566:-->6566\n\
genEventRecordId.6567:-->6567\n\
genEventRecordId.6568:-->6568\n\
genEventRecordId.6569:-->6569\n\
genEventRecordId.6570:-->6570\n\
genEventRecordId.6571:-->6571\n\
genEventRecordId.6572:-->6572\n\
genEventRecordId.6573:-->6573\n\
genEventRecordId.6574:-->6574\n\
genEventRecordId.6575:-->6575\n\
genEventRecordId.6576:-->6576\n\
genEventRecordId.6577:-->6577\n\
genEventRecordId.6578:-->6578\n\
genEventRecordId.6579:-->6579\n\
genEventRecordId.6580:-->6580\n\
genEventRecordId.6581:-->6581\n\
genEventRecordId.6582:-->6582\n\
genEventRecordId.6583:-->6583\n\
genEventRecordId.6584:-->6584\n\
genEventRecordId.6585:-->6585\n\
genEventRecordId.6586:-->6586\n\
genEventRecordId.6587:-->6587\n\
genEventRecordId.6588:-->6588\n\
genEventRecordId.6589:-->6589\n\
genEventRecordId.6590:-->6590\n\
genEventRecordId.6591:-->6591\n\
genEventRecordId.6592:-->6592\n\
genEventRecordId.6593:-->6593\n\
genEventRecordId.6594:-->6594\n\
genEventRecordId.6595:-->6595\n\
genEventRecordId.6596:-->6596\n\
genEventRecordId.6597:-->6597\n\
genEventRecordId.6598:-->6598\n\
genEventRecordId.6599:-->6599\n\
genEventRecordId.6600:-->6600\n\
genEventRecordId.6601:-->6601\n\
genEventRecordId.6602:-->6602\n\
genEventRecordId.6603:-->6603\n\
genEventType.6404:-->typeAlarm(5)\n\
genEventType.6405:-->typeAlarm(5)\n\
genEventType.6406:-->typeAlarm(5)\n\
genEventType.6407:-->typeAlarm(5)\n\
genEventType.6408:-->typeAlarm(5)\n\
genEventType.6409:-->typeAlarm(5)\n\
genEventType.6410:-->typeAlarm(5)\n\
genEventType.6411:-->typeAlarm(5)\n\
genEventType.6412:-->typeAlarm(5)\n\
genEventType.6413:-->typeAlarm(5)\n\
genEventType.6414:-->typeAlarm(5)\n\
genEventType.6415:-->typeAlarm(5)\n\
genEventType.6416:-->typeAlarm(5)\n\
genEventType.6417:-->typeAlarm(5)\n\
genEventType.6418:-->typeAlarm(5)\n\
genEventType.6419:-->typeAlarm(5)\n\
genEventType.6420:-->typeAlarm(5)\n\
genEventType.6421:-->typeAlarm(5)\n\
genEventType.6422:-->typeAlarm(5)\n\
genEventType.6423:-->typeAlarm(5)\n\
genEventType.6424:-->typeAlarm(5)\n\
genEventType.6425:-->typeAlarm(5)\n\
genEventType.6426:-->typeAlarm(5)\n\
genEventType.6427:-->typeAlarm(5)\n\
genEventType.6428:-->typeAlarm(5)\n\
genEventType.6429:-->typeAlarm(5)\n\
genEventType.6430:-->typeAlarm(5)\n\
genEventType.6431:-->typeAlarm(5)\n\
genEventType.6432:-->typeAlarm(5)\n\
genEventType.6433:-->typeAlarm(5)\n\
genEventType.6434:-->typeAlarm(5)\n\
genEventType.6435:-->typeAlarm(5)\n\
genEventType.6436:-->typeActionPerformed(6)\n\
genEventType.6437:-->typeActionPerformed(6)\n\
genEventType.6438:-->typeAlarm(5)\n\
genEventType.6439:-->typeAlarm(5)\n\
genEventType.6440:-->typeAlarm(5)\n\
genEventType.6441:-->typeAlarm(5)\n\
genEventType.6442:-->typeAlarm(5)\n\
genEventType.6443:-->typeAlarm(5)\n\
genEventType.6444:-->typeAlarm(5)\n\
genEventType.6445:-->typeAlarm(5)\n\
genEventType.6446:-->typeAlarm(5)\n\
genEventType.6447:-->typeAlarm(5)\n\
genEventType.6448:-->typeAlarm(5)\n\
genEventType.6449:-->typeAlarm(5)\n\
genEventType.6450:-->typeAlarm(5)\n\
genEventType.6451:-->typeAlarm(5)\n\
genEventType.6452:-->typeAlarm(5)\n\
genEventType.6453:-->typeAlarm(5)\n\
genEventType.6454:-->typeAlarm(5)\n\
genEventType.6455:-->typeAlarm(5)\n\
genEventType.6456:-->typeAlarm(5)\n\
genEventType.6457:-->typeAlarm(5)\n\
genEventType.6458:-->typeAlarm(5)\n\
genEventType.6459:-->typeAlarm(5)\n\
genEventType.6460:-->typeAlarm(5)\n\
genEventType.6461:-->typeAlarm(5)\n\
genEventType.6462:-->typeAlarm(5)\n\
genEventType.6463:-->typeAlarm(5)\n\
genEventType.6464:-->typeAlarm(5)\n\
genEventType.6465:-->typeAlarm(5)\n\
genEventType.6466:-->typeAlarm(5)\n\
genEventType.6467:-->typeAlarm(5)\n\
genEventType.6468:-->typeAlarm(5)\n\
genEventType.6469:-->typeAlarm(5)\n\
genEventType.6470:-->typeAlarm(5)\n\
genEventType.6471:-->typeAlarm(5)\n\
genEventType.6472:-->typeAlarm(5)\n\
genEventType.6473:-->typeAlarm(5)\n\
genEventType.6474:-->typeAlarm(5)\n\
genEventType.6475:-->typeAlarm(5)\n\
genEventType.6476:-->typeAlarm(5)\n\
genEventType.6477:-->typeAlarm(5)\n\
genEventType.6478:-->typeAlarm(5)\n\
genEventType.6479:-->typeAlarm(5)\n\
genEventType.6480:-->typeAlarm(5)\n\
genEventType.6481:-->typeAlarm(5)\n\
genEventType.6482:-->typeAlarm(5)\n\
genEventType.6483:-->typeAlarm(5)\n\
genEventType.6484:-->typeAlarm(5)\n\
genEventType.6485:-->typeAlarm(5)\n\
genEventType.6486:-->typeAlarm(5)\n\
genEventType.6487:-->typeAlarm(5)\n\
genEventType.6488:-->typeAlarm(5)\n\
genEventType.6489:-->typeAlarm(5)\n\
genEventType.6490:-->typeAlarm(5)\n\
genEventType.6491:-->typeAlarm(5)\n\
genEventType.6492:-->typeAlarm(5)\n\
genEventType.6493:-->typeAlarm(5)\n\
genEventType.6494:-->typeAlarm(5)\n\
genEventType.6495:-->typeAlarm(5)\n\
genEventType.6496:-->typeAlarm(5)\n\
genEventType.6497:-->typeAlarm(5)\n\
genEventType.6498:-->typeAlarm(5)\n\
genEventType.6499:-->typeAlarm(5)\n\
genEventType.6500:-->typeAlarm(5)\n\
genEventType.6501:-->typeAlarm(5)\n\
genEventType.6502:-->typeAlarm(5)\n\
genEventType.6503:-->typeAlarm(5)\n\
genEventType.6504:-->typeAlarm(5)\n\
genEventType.6505:-->typeAlarm(5)\n\
genEventType.6506:-->typeAlarm(5)\n\
genEventType.6507:-->typeAlarm(5)\n\
genEventType.6508:-->typeAlarm(5)\n\
genEventType.6509:-->typeAlarm(5)\n\
genEventType.6510:-->typeAlarm(5)\n\
genEventType.6511:-->typeAlarm(5)\n\
genEventType.6512:-->typeAlarm(5)\n\
genEventType.6513:-->typeAlarm(5)\n\
genEventType.6514:-->typeAlarm(5)\n\
genEventType.6515:-->typeAlarm(5)\n\
genEventType.6516:-->typeAlarm(5)\n\
genEventType.6517:-->typeAlarm(5)\n\
genEventType.6518:-->typeAlarm(5)\n\
genEventType.6519:-->typeAlarm(5)\n\
genEventType.6520:-->typeAlarm(5)\n\
genEventType.6521:-->typeAlarm(5)\n\
genEventType.6522:-->typeAlarm(5)\n\
genEventType.6523:-->typeAlarm(5)\n\
genEventType.6524:-->typeAlarm(5)\n\
genEventType.6525:-->typeAlarm(5)\n\
genEventType.6526:-->typeAlarm(5)\n\
genEventType.6527:-->typeAlarm(5)\n\
genEventType.6528:-->typeAlarm(5)\n\
genEventType.6529:-->typeAlarm(5)\n\
genEventType.6530:-->typeAlarm(5)\n\
genEventType.6531:-->typeAlarm(5)\n\
genEventType.6532:-->typeAlarm(5)\n\
genEventType.6533:-->typeAlarm(5)\n\
genEventType.6534:-->typeAlarm(5)\n\
genEventType.6535:-->typeAlarm(5)\n\
genEventType.6536:-->typeAlarm(5)\n\
genEventType.6537:-->typeAlarm(5)\n\
genEventType.6538:-->typeAlarm(5)\n\
genEventType.6539:-->typeAlarm(5)\n\
genEventType.6540:-->typeAlarm(5)\n\
genEventType.6541:-->typeAlarm(5)\n\
genEventType.6542:-->typeAlarm(5)\n\
genEventType.6543:-->typeAlarm(5)\n\
genEventType.6544:-->typeAlarm(5)\n\
genEventType.6545:-->typeAlarm(5)\n\
genEventType.6546:-->typeAlarm(5)\n\
genEventType.6547:-->typeAlarm(5)\n\
genEventType.6548:-->typeAlarm(5)\n\
genEventType.6549:-->typeAlarm(5)\n\
genEventType.6550:-->typeAlarm(5)\n\
genEventType.6551:-->typeAlarm(5)\n\
genEventType.6552:-->typeAlarm(5)\n\
genEventType.6553:-->typeAlarm(5)\n\
genEventType.6554:-->typeAlarm(5)\n\
genEventType.6555:-->typeAlarm(5)\n\
genEventType.6556:-->typeAlarm(5)\n\
genEventType.6557:-->typeAlarm(5)\n\
genEventType.6558:-->typeActionPerformed(6)\n\
genEventType.6559:-->typeActionPerformed(6)\n\
genEventType.6560:-->typeAlarm(5)\n\
genEventType.6561:-->typeAlarm(5)\n\
genEventType.6562:-->typeAlarm(5)\n\
genEventType.6563:-->typeAlarm(5)\n\
genEventType.6564:-->typeAlarm(5)\n\
genEventType.6565:-->typeAlarm(5)\n\
genEventType.6566:-->typeAlarm(5)\n\
genEventType.6567:-->typeAlarm(5)\n\
genEventType.6568:-->typeAlarm(5)\n\
genEventType.6569:-->typeAlarm(5)\n\
genEventType.6570:-->typeAlarm(5)\n\
genEventType.6571:-->typeAlarm(5)\n\
genEventType.6572:-->typeAlarm(5)\n\
genEventType.6573:-->typeAlarm(5)\n\
genEventType.6574:-->typeAlarm(5)\n\
genEventType.6575:-->typeAlarm(5)\n\
genEventType.6576:-->typeActionPerformed(6)\n\
genEventType.6577:-->typeActionPerformed(6)\n\
genEventType.6578:-->typeAlarm(5)\n\
genEventType.6579:-->typeAlarm(5)\n\
genEventType.6580:-->typeAlarm(5)\n\
genEventType.6581:-->typeAlarm(5)\n\
genEventType.6582:-->typeAlarm(5)\n\
genEventType.6583:-->typeAlarm(5)\n\
genEventType.6584:-->typeAlarm(5)\n\
genEventType.6585:-->typeAlarm(5)\n\
genEventType.6586:-->typeAlarm(5)\n\
genEventType.6587:-->typeAlarm(5)\n\
genEventType.6588:-->typeAlarm(5)\n\
genEventType.6589:-->typeAlarm(5)\n\
genEventType.6590:-->typeAlarm(5)\n\
genEventType.6591:-->typeAlarm(5)\n\
genEventType.6592:-->typeAlarm(5)\n\
genEventType.6593:-->typeActionPerformed(6)\n\
genEventType.6594:-->typeActionPerformed(6)\n\
genEventType.6595:-->typeAlarm(5)\n\
genEventType.6596:-->typeAlarm(5)\n\
genEventType.6597:-->typeAlarm(5)\n\
genEventType.6598:-->typeAlarm(5)\n\
genEventType.6599:-->typeAlarm(5)\n\
genEventType.6600:-->typeAlarm(5)\n\
genEventType.6601:-->typeAlarm(5)\n\
genEventType.6602:-->typeAlarm(5)\n\
genEventType.6603:-->typeAlarm(5)\n\
\n\
\n\
genEventOrigin.6404:-->NOC_EM4000_05\n\
genEventOrigin.6405:-->NOC_EM4000_05\n\
genEventOrigin.6406:-->NOC_EM4000_02\n\
genEventOrigin.6407:-->NOC_EM4000_02\n\
genEventOrigin.6408:-->NOC_EM4000_02\n\
genEventOrigin.6409:-->NOC_EM4000_05\n\
genEventOrigin.6410:-->NOC_EM4000_05\n\
genEventOrigin.6411:-->NOC_EM4000_05\n\
genEventOrigin.6412:-->NOC_EM4000_05\n\
genEventOrigin.6413:-->NOC_EM4000_05\n\
genEventOrigin.6414:-->NOC_EM4000_05\n\
genEventOrigin.6415:-->NOC_EM4000_05\n\
genEventOrigin.6416:-->NOC_EM4000_05\n\
genEventOrigin.6417:-->NOC_EM4000_05\n\
genEventOrigin.6418:-->NOC_EM4000_05\n\
genEventOrigin.6419:-->NOC_EM4000_05\n\
genEventOrigin.6420:-->NOC_EM4000_05\n\
genEventOrigin.6421:-->NOC_EM4000_05\n\
genEventOrigin.6422:-->NOC_EM4000_05\n\
genEventOrigin.6423:-->NOC_EM4000_05\n\
genEventOrigin.6424:-->NOC_EM4000_05\n\
genEventOrigin.6425:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6426:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6427:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6428:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6429:-->NOC_EM4000_02\n\
genEventOrigin.6430:-->NOC_EM4000_02\n\
genEventOrigin.6431:-->NOC_EM4000_02\n\
genEventOrigin.6432:-->NOC_EM4000_01\n\
genEventOrigin.6433:-->NOC_EM4000_02\n\
genEventOrigin.6434:-->NOC_EM4000_01\n\
genEventOrigin.6435:-->NOC_EM4000_02\n\
genEventOrigin.6436:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6437:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6438:-->NOC_EM4000_01\n\
genEventOrigin.6439:-->NOC_EM4000_01\n\
genEventOrigin.6440:-->NOC_EM4000_01\n\
genEventOrigin.6441:-->NOC_EM4000_01\n\
genEventOrigin.6442:-->NOC_EM4000_01\n\
genEventOrigin.6443:-->NOC_EM4000_01\n\
genEventOrigin.6444:-->NOC_EM4000_01\n\
genEventOrigin.6445:-->NOC_EM4000_BU\n\
genEventOrigin.6446:-->NOC_EM4000_BU\n\
genEventOrigin.6447:-->NOC_EM4000_BU\n\
genEventOrigin.6448:-->NOC_EM4000_BU\n\
genEventOrigin.6449:-->NOC_EM4000_BU\n\
genEventOrigin.6450:-->NOC_EM4000_BU\n\
genEventOrigin.6451:-->NOC_EM4000_BU\n\
genEventOrigin.6452:-->NOC_EM4000_BU\n\
genEventOrigin.6453:-->NOC_EM4000_03\n\
genEventOrigin.6454:-->NOC_EM4000_03\n\
genEventOrigin.6455:-->NOC_EM4000_03\n\
genEventOrigin.6456:-->NOC_EM4000_03\n\
genEventOrigin.6457:-->NOC_EM4000_03\n\
genEventOrigin.6458:-->NOC_EM4000_03\n\
genEventOrigin.6459:-->NOC_EM4000_03\n\
genEventOrigin.6460:-->NOC_EM4000_03\n\
genEventOrigin.6461:-->NOC_EM4000_03\n\
genEventOrigin.6462:-->NOC_EM4000_03\n\
genEventOrigin.6463:-->NOC_EM4000_03\n\
genEventOrigin.6464:-->NOC_EM4000_03\n\
genEventOrigin.6465:-->NOC_EM4000_BU\n\
genEventOrigin.6466:-->NOC_EM4000_BU\n\
genEventOrigin.6467:-->NOC_EM4000_BU\n\
genEventOrigin.6468:-->NOC_EM4000_BU\n\
genEventOrigin.6469:-->NOC_EM4000_04\n\
genEventOrigin.6470:-->NOC_EM4000_04\n\
genEventOrigin.6471:-->NOC_EM4000_01\n\
genEventOrigin.6472:-->NOC_EM4000_04\n\
genEventOrigin.6473:-->NOC_EM4000_04\n\
genEventOrigin.6474:-->NOC_EM4000_04\n\
genEventOrigin.6475:-->NOC_EM4000_04\n\
genEventOrigin.6476:-->NOC_EM4000_04\n\
genEventOrigin.6477:-->NOC_EM4000_04\n\
genEventOrigin.6478:-->NOC_EM4000_04\n\
genEventOrigin.6479:-->NOC_EM4000_04\n\
genEventOrigin.6480:-->NOC_EM4000_04\n\
genEventOrigin.6481:-->NOC_EM4000_02\n\
genEventOrigin.6482:-->NOC_EM4000_02\n\
genEventOrigin.6483:-->NOC_EM4000_04\n\
genEventOrigin.6484:-->NOC_EM4000_02\n\
genEventOrigin.6485:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6486:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6487:-->NOC_EM4000_04\n\
genEventOrigin.6488:-->NOC_EM4000_04\n\
genEventOrigin.6489:-->NOC_EM4000_04\n\
genEventOrigin.6490:-->NOC_EM4000_04\n\
genEventOrigin.6491:-->NOC_EM4000_01\n\
genEventOrigin.6492:-->NOC_EM4000_01\n\
genEventOrigin.6493:-->NOC_EM4000_01\n\
genEventOrigin.6494:-->NOC_EM4000_01\n\
genEventOrigin.6495:-->NOC_EM4000_05\n\
genEventOrigin.6496:-->NOC_EM4000_05\n\
genEventOrigin.6497:-->NOC_EM4000_05\n\
genEventOrigin.6498:-->NOC_EM4000_05\n\
genEventOrigin.6499:-->NOC_EM4000_04\n\
genEventOrigin.6500:-->NOC_EM4000_04\n\
genEventOrigin.6501:-->NOC_EM4000_05\n\
genEventOrigin.6502:-->NOC_EM4000_05\n\
genEventOrigin.6503:-->NOC_EM4000_01\n\
genEventOrigin.6504:-->NOC_EM4000_01\n\
genEventOrigin.6505:-->NOC_EM4000_01\n\
genEventOrigin.6506:-->NOC_EM4000_01\n\
genEventOrigin.6507:-->NOC_EM4000_BU\n\
genEventOrigin.6508:-->NOC_EM4000_BU\n\
genEventOrigin.6509:-->NOC_EM4000_BU\n\
genEventOrigin.6510:-->NOC_EM4000_BU\n\
genEventOrigin.6511:-->NOC_EM4000_05\n\
genEventOrigin.6512:-->NOC_EM4000_05\n\
genEventOrigin.6513:-->NOC_EM4000_05\n\
genEventOrigin.6514:-->NOC_EM4000_05\n\
genEventOrigin.6515:-->NOC_EM4000_05\n\
genEventOrigin.6516:-->NOC_EM4000_05\n\
genEventOrigin.6517:-->NOC_EM4000_05\n\
genEventOrigin.6518:-->NOC_EM4000_05\n\
genEventOrigin.6519:-->NOC_EM4000_02\n\
genEventOrigin.6520:-->NOC_EM4000_02\n\
genEventOrigin.6521:-->NOC_EM4000_05\n\
genEventOrigin.6522:-->NOC_EM4000_05\n\
genEventOrigin.6523:-->NOC_EM4000_05\n\
genEventOrigin.6524:-->NOC_EM4000_05\n\
genEventOrigin.6525:-->NOC_EM4000_05\n\
genEventOrigin.6526:-->NOC_EM4000_05\n\
genEventOrigin.6527:-->NOC_EM4000_05\n\
genEventOrigin.6528:-->NOC_EM4000_05\n\
genEventOrigin.6529:-->NOC_EM4000_05\n\
genEventOrigin.6530:-->NOC_EM4000_05\n\
genEventOrigin.6531:-->NOC_EM4000_05\n\
genEventOrigin.6532:-->NOC_EM4000_05\n\
genEventOrigin.6533:-->NOC_EM4000_05\n\
genEventOrigin.6534:-->NOC_EM4000_05\n\
genEventOrigin.6535:-->NOC_EM4000_05\n\
genEventOrigin.6536:-->NOC_EM4000_05\n\
genEventOrigin.6537:-->NOC_EM4000_02\n\
genEventOrigin.6538:-->NOC_EM4000_02\n\
genEventOrigin.6539:-->NOC_EM4000_02\n\
genEventOrigin.6540:-->NOC_EM4000_01\n\
genEventOrigin.6541:-->NOC_EM4000_02\n\
genEventOrigin.6542:-->NOC_EM4000_01\n\
genEventOrigin.6543:-->NOC_EM4000_02\n\
genEventOrigin.6544:-->NOC_EM4000_02\n\
genEventOrigin.6545:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6546:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6547:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6548:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6549:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6550:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6551:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6552:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6553:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6554:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6555:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6556:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6557:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6558:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6559:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6560:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6561:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6562:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6563:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6564:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6565:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6566:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6567:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6568:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6569:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6570:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6571:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6572:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6573:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6574:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6575:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6576:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6577:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6578:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6579:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6580:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6581:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6582:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6583:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6584:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6585:-->NOC_CP6000_02_mpeg_dec_02\n\
genEventOrigin.6586:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6587:-->WJCT_CP6000_01_mpeg_enc_04\n\
genEventOrigin.6588:-->WJCT_Amethyst_01\n\
genEventOrigin.6589:-->WJCT_MUX_01\n\
genEventOrigin.6590:-->WJCT_CP6000_01\n\
genEventOrigin.6591:-->NOC_CP6000_02_mpeg_dec_04\n\
genEventOrigin.6592:-->WJCT_MUX_01\n\
genEventOrigin.6593:-->WJCT_CP6000_01\n\
genEventOrigin.6594:-->WJCT_CP6000_01\n\
genEventOrigin.6595:-->WJCT_CP6000_01_mpeg_enc_04\n\
genEventOrigin.6596:-->WJCT_CP6000_01_mpeg_enc_04\n\
genEventOrigin.6597:-->WJCT_Amethyst_01\n\
genEventOrigin.6598:-->WJCT_Amethyst_01\n\
genEventOrigin.6599:-->WJCT_CP6000_01\n\
genEventOrigin.6600:-->NOC_EM4000_03\n\
genEventOrigin.6601:-->NOC_EM4000_03\n\
genEventOrigin.6602:-->NOC_EM4000_04\n\
genEventOrigin.6603:-->NOC_EM4000_04\n\
genEventResourceId.6404:-->ENC7/AUDIO_3\n\
genEventResourceId.6405:-->ENC7/AUDIO_3\n\
genEventResourceId.6406:-->ENC3/AUDIO_1\n\
genEventResourceId.6407:-->ENC2/AUDIO_1\n\
genEventResourceId.6408:-->ENC2/AUDIO_1\n\
genEventResourceId.6409:-->ENC6/AUDIO_1\n\
genEventResourceId.6410:-->ENC6/AUDIO_1\n\
genEventResourceId.6411:-->ENC3/AUDIO_3\n\
genEventResourceId.6412:-->ENC3/AUDIO_3\n\
genEventResourceId.6413:-->ENC3/AUDIO_2\n\
genEventResourceId.6414:-->ENC3/AUDIO_2\n\
genEventResourceId.6415:-->ENC3/AUDIO_1\n\
genEventResourceId.6416:-->ENC3/AUDIO_1\n\
genEventResourceId.6417:-->ENC7/AUDIO_2\n\
genEventResourceId.6418:-->ENC7/AUDIO_2\n\
genEventResourceId.6419:-->ENC7/AUDIO_1\n\
genEventResourceId.6420:-->ENC7/AUDIO_1\n\
genEventResourceId.6421:-->ENC6/AUDIO_3\n\
genEventResourceId.6422:-->ENC6/AUDIO_3\n\
genEventResourceId.6423:-->ENC6/AUDIO_2\n\
genEventResourceId.6424:-->ENC6/AUDIO_2\n\
genEventResourceId.6425:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6426:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6427:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6428:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6429:-->ENC3/AUDIO_3\n\
genEventResourceId.6430:-->ENC3/AUDIO_3\n\
genEventResourceId.6431:-->ENC3/AUDIO_2\n\
genEventResourceId.6432:-->ENC1/AUDIO_1\n\
genEventResourceId.6433:-->ENC3/AUDIO_2\n\
genEventResourceId.6434:-->ENC1/AUDIO_1\n\
genEventResourceId.6435:-->ENC3/AUDIO_1\n\
genEventResourceId.6436:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6437:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6438:-->ENC5/AUDIO_1\n\
genEventResourceId.6439:-->ENC5/AUDIO_1\n\
genEventResourceId.6440:-->ENC5/AUDIO_1\n\
genEventResourceId.6441:-->ENC5/AUDIO_1\n\
genEventResourceId.6442:-->ENC5/AUDIO_1\n\
genEventResourceId.6443:-->ENC5/AUDIO_2\n\
genEventResourceId.6444:-->ENC5/AUDIO_1\n\
genEventResourceId.6445:-->ENC7/AUDIO_1\n\
genEventResourceId.6446:-->ENC7/AUDIO_1\n\
genEventResourceId.6447:-->ENC7/AUDIO_2\n\
genEventResourceId.6448:-->ENC7/AUDIO_3\n\
genEventResourceId.6449:-->ENC5/AUDIO_1\n\
genEventResourceId.6450:-->ENC5/AUDIO_1\n\
genEventResourceId.6451:-->ENC5/AUDIO_2\n\
genEventResourceId.6452:-->ENC5/AUDIO_3\n\
genEventResourceId.6453:-->ENC5/AUDIO_1\n\
genEventResourceId.6454:-->ENC5/AUDIO_1\n\
genEventResourceId.6455:-->ENC1/AUDIO_1\n\
genEventResourceId.6456:-->ENC1/AUDIO_1\n\
genEventResourceId.6457:-->ENC5/AUDIO_1\n\
genEventResourceId.6458:-->ENC5/AUDIO_1\n\
genEventResourceId.6459:-->ENC5/AUDIO_1\n\
genEventResourceId.6460:-->ENC5/AUDIO_1\n\
genEventResourceId.6461:-->ENC5/AUDIO_3\n\
genEventResourceId.6462:-->ENC5/AUDIO_3\n\
genEventResourceId.6463:-->ENC5/AUDIO_2\n\
genEventResourceId.6464:-->ENC5/AUDIO_2\n\
genEventResourceId.6465:-->ENC5/AUDIO_1\n\
genEventResourceId.6466:-->ENC5/AUDIO_1\n\
genEventResourceId.6467:-->ENC5/AUDIO_1\n\
genEventResourceId.6468:-->ENC5/AUDIO_1\n\
genEventResourceId.6469:-->ENC2/AUDIO_1\n\
genEventResourceId.6470:-->ENC2/AUDIO_2\n\
genEventResourceId.6471:-->ENC5/AUDIO_3\n\
genEventResourceId.6472:-->ENC2/AUDIO_1\n\
genEventResourceId.6473:-->ENC2/AUDIO_3\n\
genEventResourceId.6474:-->ENC4/AUDIO_1\n\
genEventResourceId.6475:-->ENC2/AUDIO_2\n\
genEventResourceId.6476:-->ENC2/AUDIO_3\n\
genEventResourceId.6477:-->ENC4/AUDIO_2\n\
genEventResourceId.6478:-->ENC4/AUDIO_3\n\
genEventResourceId.6479:-->ENC4/AUDIO_1\n\
genEventResourceId.6480:-->ENC4/AUDIO_2\n\
genEventResourceId.6481:-->ENC1/AUDIO_1\n\
genEventResourceId.6482:-->ENC1/AUDIO_3\n\
genEventResourceId.6483:-->ENC4/AUDIO_3\n\
genEventResourceId.6484:-->ENC1/AUDIO_1\n\
genEventResourceId.6485:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6486:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6487:-->ENC3/AUDIO_1\n\
genEventResourceId.6488:-->ENC3/AUDIO_1\n\
genEventResourceId.6489:-->ENC3/AUDIO_2\n\
genEventResourceId.6490:-->ENC3/AUDIO_2\n\
genEventResourceId.6491:-->ENC8/AUDIO_1\n\
genEventResourceId.6492:-->ENC8/AUDIO_1\n\
genEventResourceId.6493:-->ENC8/AUDIO_3\n\
genEventResourceId.6494:-->ENC8/AUDIO_2\n\
genEventResourceId.6495:-->ENC2/AUDIO_2\n\
genEventResourceId.6496:-->ENC2/AUDIO_2\n\
genEventResourceId.6497:-->ENC2/AUDIO_3\n\
genEventResourceId.6498:-->ENC2/AUDIO_3\n\
genEventResourceId.6499:-->ENC3/AUDIO_3\n\
genEventResourceId.6500:-->ENC3/AUDIO_3\n\
genEventResourceId.6501:-->ENC2/AUDIO_1\n\
genEventResourceId.6502:-->ENC2/AUDIO_1\n\
genEventResourceId.6503:-->ENC6/AUDIO_1\n\
genEventResourceId.6504:-->ENC6/AUDIO_1\n\
genEventResourceId.6505:-->ENC6/AUDIO_2\n\
genEventResourceId.6506:-->ENC6/AUDIO_3\n\
genEventResourceId.6507:-->ENC8/AUDIO_1\n\
genEventResourceId.6508:-->ENC8/AUDIO_1\n\
genEventResourceId.6509:-->ENC8/AUDIO_2\n\
genEventResourceId.6510:-->ENC8/AUDIO_3\n\
genEventResourceId.6511:-->ENC8/AUDIO_3\n\
genEventResourceId.6512:-->ENC8/AUDIO_3\n\
genEventResourceId.6513:-->ENC8/AUDIO_2\n\
genEventResourceId.6514:-->ENC8/AUDIO_2\n\
genEventResourceId.6515:-->ENC8/AUDIO_1\n\
genEventResourceId.6516:-->ENC8/AUDIO_1\n\
genEventResourceId.6517:-->ENC7/AUDIO_3\n\
genEventResourceId.6518:-->ENC7/AUDIO_3\n\
genEventResourceId.6519:-->ENC2/AUDIO_1\n\
genEventResourceId.6520:-->ENC2/AUDIO_1\n\
genEventResourceId.6521:-->ENC6/AUDIO_1\n\
genEventResourceId.6522:-->ENC6/AUDIO_1\n\
genEventResourceId.6523:-->ENC3/AUDIO_3\n\
genEventResourceId.6524:-->ENC3/AUDIO_3\n\
genEventResourceId.6525:-->ENC3/AUDIO_2\n\
genEventResourceId.6526:-->ENC3/AUDIO_2\n\
genEventResourceId.6527:-->ENC3/AUDIO_1\n\
genEventResourceId.6528:-->ENC3/AUDIO_1\n\
genEventResourceId.6529:-->ENC7/AUDIO_2\n\
genEventResourceId.6530:-->ENC7/AUDIO_2\n\
genEventResourceId.6531:-->ENC7/AUDIO_1\n\
genEventResourceId.6532:-->ENC7/AUDIO_1\n\
genEventResourceId.6533:-->ENC6/AUDIO_3\n\
genEventResourceId.6534:-->ENC6/AUDIO_3\n\
genEventResourceId.6535:-->ENC6/AUDIO_2\n\
genEventResourceId.6536:-->ENC6/AUDIO_2\n\
genEventResourceId.6537:-->ENC3/AUDIO_1\n\
genEventResourceId.6538:-->ENC3/AUDIO_3\n\
genEventResourceId.6539:-->ENC3/AUDIO_3\n\
genEventResourceId.6540:-->ENC1/AUDIO_1\n\
genEventResourceId.6541:-->ENC3/AUDIO_2\n\
genEventResourceId.6542:-->ENC1/AUDIO_1\n\
genEventResourceId.6543:-->ENC3/AUDIO_2\n\
genEventResourceId.6544:-->ENC3/AUDIO_1\n\
genEventResourceId.6545:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6546:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6547:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6548:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6549:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6550:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6551:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6552:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6553:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6554:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6555:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6556:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6557:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6558:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6559:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6560:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6561:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6562:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6563:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6564:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6565:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6566:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6567:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6568:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6569:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6570:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6571:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6572:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6573:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6574:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6575:-->MPEG_DEC (2), SDI.IN2, AUDIO3\n\
genEventResourceId.6576:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6577:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6578:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6579:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6580:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6581:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6582:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6583:-->MPEG_DEC (2), IP_RX2\n\
genEventResourceId.6584:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6585:-->MPEG_DEC (2), SDI.IN2, AUDIO3\n\
genEventResourceId.6586:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6587:-->\n\
genEventResourceId.6588:-->\n\
genEventResourceId.6589:-->\n\
genEventResourceId.6590:-->\n\
genEventResourceId.6591:-->MPEG_DEC (4), IP_RX1\n\
genEventResourceId.6592:-->PS2\n\
genEventResourceId.6593:-->SHELF\n\
genEventResourceId.6594:-->SHELF\n\
genEventResourceId.6595:-->MPEG_ENC (4), SDI.IN3\n\
genEventResourceId.6596:-->MPEG_ENC (4), SDI.IN1\n\
genEventResourceId.6597:-->\n\
genEventResourceId.6598:-->\n\
genEventResourceId.6599:-->SHELF, PSU2\n\
genEventResourceId.6600:-->VIDEO_Board3\n\
genEventResourceId.6601:-->VIDEO_Board3\n\
genEventResourceId.6602:-->ENC2/VIDEO.IN\n\
genEventResourceId.6603:-->ENC2/VIDEO.IN\n\
genEventProbableCause.6404:-->1330\n\
genEventProbableCause.6405:-->1330\n\
genEventProbableCause.6406:-->1330\n\
genEventProbableCause.6407:-->1330\n\
genEventProbableCause.6408:-->1330\n\
genEventProbableCause.6409:-->1330\n\
genEventProbableCause.6410:-->1330\n\
genEventProbableCause.6411:-->1330\n\
genEventProbableCause.6412:-->1330\n\
genEventProbableCause.6413:-->1330\n\
genEventProbableCause.6414:-->1330\n\
genEventProbableCause.6415:-->1330\n\
genEventProbableCause.6416:-->1330\n\
genEventProbableCause.6417:-->1330\n\
genEventProbableCause.6418:-->1330\n\
genEventProbableCause.6419:-->1330\n\
genEventProbableCause.6420:-->1330\n\
genEventProbableCause.6421:-->1330\n\
genEventProbableCause.6422:-->1330\n\
genEventProbableCause.6423:-->1330\n\
genEventProbableCause.6424:-->1330\n\
genEventProbableCause.6425:-->1238\n\
genEventProbableCause.6426:-->1238\n\
genEventProbableCause.6427:-->1238\n\
genEventProbableCause.6428:-->1238\n\
genEventProbableCause.6429:-->1330\n\
genEventProbableCause.6430:-->1330\n\
genEventProbableCause.6431:-->1330\n\
genEventProbableCause.6432:-->1330\n\
genEventProbableCause.6433:-->1330\n\
genEventProbableCause.6434:-->1330\n\
genEventProbableCause.6435:-->1330\n\
genEventProbableCause.6436:-->0\n\
genEventProbableCause.6437:-->0\n\
genEventProbableCause.6438:-->1330\n\
genEventProbableCause.6439:-->1330\n\
genEventProbableCause.6440:-->1330\n\
genEventProbableCause.6441:-->1330\n\
genEventProbableCause.6442:-->1330\n\
genEventProbableCause.6443:-->1330\n\
genEventProbableCause.6444:-->1330\n\
genEventProbableCause.6445:-->1330\n\
genEventProbableCause.6446:-->1330\n\
genEventProbableCause.6447:-->1330\n\
genEventProbableCause.6448:-->1330\n\
genEventProbableCause.6449:-->1330\n\
genEventProbableCause.6450:-->1330\n\
genEventProbableCause.6451:-->1330\n\
genEventProbableCause.6452:-->1330\n\
genEventProbableCause.6453:-->1330\n\
genEventProbableCause.6454:-->1330\n\
genEventProbableCause.6455:-->1330\n\
genEventProbableCause.6456:-->1330\n\
genEventProbableCause.6457:-->1330\n\
genEventProbableCause.6458:-->1330\n\
genEventProbableCause.6459:-->1330\n\
genEventProbableCause.6460:-->1330\n\
genEventProbableCause.6461:-->1330\n\
genEventProbableCause.6462:-->1330\n\
genEventProbableCause.6463:-->1330\n\
genEventProbableCause.6464:-->1330\n\
genEventProbableCause.6465:-->1330\n\
genEventProbableCause.6466:-->1330\n\
genEventProbableCause.6467:-->1330\n\
genEventProbableCause.6468:-->1330\n\
genEventProbableCause.6469:-->1330\n\
genEventProbableCause.6470:-->1330\n\
genEventProbableCause.6471:-->1330\n\
genEventProbableCause.6472:-->1330\n\
genEventProbableCause.6473:-->1330\n\
genEventProbableCause.6474:-->1330\n\
genEventProbableCause.6475:-->1330\n\
genEventProbableCause.6476:-->1330\n\
genEventProbableCause.6477:-->1330\n\
genEventProbableCause.6478:-->1330\n\
genEventProbableCause.6479:-->1330\n\
genEventProbableCause.6480:-->1330\n\
genEventProbableCause.6481:-->1330\n\
genEventProbableCause.6482:-->1330\n\
genEventProbableCause.6483:-->1330\n\
genEventProbableCause.6484:-->1330\n\
genEventProbableCause.6485:-->1238\n\
genEventProbableCause.6486:-->1238\n\
genEventProbableCause.6487:-->1330\n\
genEventProbableCause.6488:-->1330\n\
genEventProbableCause.6489:-->1330\n\
genEventProbableCause.6490:-->1330\n\
genEventProbableCause.6491:-->1330\n\
genEventProbableCause.6492:-->1330\n\
genEventProbableCause.6493:-->1330\n\
genEventProbableCause.6494:-->1330\n\
genEventProbableCause.6495:-->1330\n\
genEventProbableCause.6496:-->1330\n\
genEventProbableCause.6497:-->1330\n\
genEventProbableCause.6498:-->1330\n\
genEventProbableCause.6499:-->1330\n\
genEventProbableCause.6500:-->1330\n\
genEventProbableCause.6501:-->1330\n\
genEventProbableCause.6502:-->1330\n\
genEventProbableCause.6503:-->1330\n\
genEventProbableCause.6504:-->1330\n\
genEventProbableCause.6505:-->1330\n\
genEventProbableCause.6506:-->1330\n\
genEventProbableCause.6507:-->1330\n\
genEventProbableCause.6508:-->1330\n\
genEventProbableCause.6509:-->1330\n\
genEventProbableCause.6510:-->1330\n\
genEventProbableCause.6511:-->1330\n\
genEventProbableCause.6512:-->1330\n\
genEventProbableCause.6513:-->1330\n\
genEventProbableCause.6514:-->1330\n\
genEventProbableCause.6515:-->1330\n\
genEventProbableCause.6516:-->1330\n\
genEventProbableCause.6517:-->1330\n\
genEventProbableCause.6518:-->1330\n\
genEventProbableCause.6519:-->1330\n\
genEventProbableCause.6520:-->1330\n\
genEventProbableCause.6521:-->1330\n\
genEventProbableCause.6522:-->1330\n\
genEventProbableCause.6523:-->1330\n\
genEventProbableCause.6524:-->1330\n\
genEventProbableCause.6525:-->1330\n\
genEventProbableCause.6526:-->1330\n\
genEventProbableCause.6527:-->1330\n\
genEventProbableCause.6528:-->1330\n\
genEventProbableCause.6529:-->1330\n\
genEventProbableCause.6530:-->1330\n\
genEventProbableCause.6531:-->1330\n\
genEventProbableCause.6532:-->1330\n\
genEventProbableCause.6533:-->1330\n\
genEventProbableCause.6534:-->1330\n\
genEventProbableCause.6535:-->1330\n\
genEventProbableCause.6536:-->1330\n\
genEventProbableCause.6537:-->1330\n\
genEventProbableCause.6538:-->1330\n\
genEventProbableCause.6539:-->1330\n\
genEventProbableCause.6540:-->1330\n\
genEventProbableCause.6541:-->1330\n\
genEventProbableCause.6542:-->1330\n\
genEventProbableCause.6543:-->1330\n\
genEventProbableCause.6544:-->1330\n\
genEventProbableCause.6545:-->1238\n\
genEventProbableCause.6546:-->1238\n\
genEventProbableCause.6547:-->1238\n\
genEventProbableCause.6548:-->1238\n\
genEventProbableCause.6549:-->1238\n\
genEventProbableCause.6550:-->1238\n\
genEventProbableCause.6551:-->1238\n\
genEventProbableCause.6552:-->1238\n\
genEventProbableCause.6553:-->1238\n\
genEventProbableCause.6554:-->1238\n\
genEventProbableCause.6555:-->1238\n\
genEventProbableCause.6556:-->1238\n\
genEventProbableCause.6557:-->1238\n\
genEventProbableCause.6558:-->0\n\
genEventProbableCause.6559:-->0\n\
genEventProbableCause.6560:-->1238\n\
genEventProbableCause.6561:-->1238\n\
genEventProbableCause.6562:-->1238\n\
genEventProbableCause.6563:-->1238\n\
genEventProbableCause.6564:-->1238\n\
genEventProbableCause.6565:-->1238\n\
genEventProbableCause.6566:-->1238\n\
genEventProbableCause.6567:-->1238\n\
genEventProbableCause.6568:-->1238\n\
genEventProbableCause.6569:-->1238\n\
genEventProbableCause.6570:-->1238\n\
genEventProbableCause.6571:-->1238\n\
genEventProbableCause.6572:-->1238\n\
genEventProbableCause.6573:-->1238\n\
genEventProbableCause.6574:-->1238\n\
genEventProbableCause.6575:-->1040\n\
genEventProbableCause.6576:-->0\n\
genEventProbableCause.6577:-->0\n\
genEventProbableCause.6578:-->1238\n\
genEventProbableCause.6579:-->1238\n\
genEventProbableCause.6580:-->1238\n\
genEventProbableCause.6581:-->1238\n\
genEventProbableCause.6582:-->1238\n\
genEventProbableCause.6583:-->1238\n\
genEventProbableCause.6584:-->1238\n\
genEventProbableCause.6585:-->1040\n\
genEventProbableCause.6586:-->1238\n\
genEventProbableCause.6587:-->1217\n\
genEventProbableCause.6588:-->22\n\
genEventProbableCause.6589:-->22\n\
genEventProbableCause.6590:-->22\n\
genEventProbableCause.6591:-->1238\n\
genEventProbableCause.6592:-->78\n\
genEventProbableCause.6593:-->0\n\
genEventProbableCause.6594:-->0\n\
genEventProbableCause.6595:-->1065\n\
genEventProbableCause.6596:-->1065\n\
genEventProbableCause.6597:-->1108\n\
genEventProbableCause.6598:-->78\n\
genEventProbableCause.6599:-->78\n\
genEventProbableCause.6600:-->123\n\
genEventProbableCause.6601:-->123\n\
genEventProbableCause.6602:-->8\n\
genEventProbableCause.6603:-->8\n\
genEventSpecificProblem.6404:-->channel="right"\n\
genEventSpecificProblem.6405:-->channel="left"\n\
genEventSpecificProblem.6406:-->channel="left"\n\
genEventSpecificProblem.6407:-->channel="right"\n\
genEventSpecificProblem.6408:-->channel="left"\n\
genEventSpecificProblem.6409:-->channel="left"\n\
genEventSpecificProblem.6410:-->channel="right"\n\
genEventSpecificProblem.6411:-->channel="left"\n\
genEventSpecificProblem.6412:-->channel="right"\n\
genEventSpecificProblem.6413:-->channel="left"\n\
genEventSpecificProblem.6414:-->channel="right"\n\
genEventSpecificProblem.6415:-->channel="left"\n\
genEventSpecificProblem.6416:-->channel="right"\n\
genEventSpecificProblem.6417:-->channel="left"\n\
genEventSpecificProblem.6418:-->channel="right"\n\
genEventSpecificProblem.6419:-->channel="left"\n\
genEventSpecificProblem.6420:-->channel="right"\n\
genEventSpecificProblem.6421:-->channel="left"\n\
genEventSpecificProblem.6422:-->channel="right"\n\
genEventSpecificProblem.6423:-->channel="left"\n\
genEventSpecificProblem.6424:-->channel="right"\n\
genEventSpecificProblem.6425:-->Continuity counter error on PID 17\n\
genEventSpecificProblem.6426:-->Continuity counter error on PID 120\n\
genEventSpecificProblem.6427:-->Continuity counter error on PID 120\n\
genEventSpecificProblem.6428:-->Continuity counter error on PID 110\n\
genEventSpecificProblem.6429:-->channel="right"\n\
genEventSpecificProblem.6430:-->channel="left"\n\
genEventSpecificProblem.6431:-->channel="right"\n\
genEventSpecificProblem.6432:-->channel="right"\n\
genEventSpecificProblem.6433:-->channel="left"\n\
genEventSpecificProblem.6434:-->channel="left"\n\
genEventSpecificProblem.6435:-->channel="right"\n\
genEventSpecificProblem.6436:-->\n\
genEventSpecificProblem.6437:-->\n\
genEventSpecificProblem.6438:-->channel="left"\n\
genEventSpecificProblem.6439:-->channel="center"\n\
genEventSpecificProblem.6440:-->channel="right"\n\
genEventSpecificProblem.6441:-->channel="left surround"\n\
genEventSpecificProblem.6442:-->channel="LFE"\n\
genEventSpecificProblem.6443:-->channel="left"\n\
genEventSpecificProblem.6444:-->channel="right surround"\n\
genEventSpecificProblem.6445:-->channel="left"\n\
genEventSpecificProblem.6446:-->channel="right"\n\
genEventSpecificProblem.6447:-->channel="left"\n\
genEventSpecificProblem.6448:-->channel="left"\n\
genEventSpecificProblem.6449:-->channel="left surround"\n\
genEventSpecificProblem.6450:-->channel="right surround"\n\
genEventSpecificProblem.6451:-->channel="left"\n\
genEventSpecificProblem.6452:-->channel="left"\n\
genEventSpecificProblem.6453:-->channel="right"\n\
genEventSpecificProblem.6454:-->channel="left"\n\
genEventSpecificProblem.6455:-->channel="right"\n\
genEventSpecificProblem.6456:-->channel="left"\n\
genEventSpecificProblem.6457:-->channel="right surround"\n\
genEventSpecificProblem.6458:-->channel="left surround"\n\
genEventSpecificProblem.6459:-->channel="LFE"\n\
genEventSpecificProblem.6460:-->channel="center"\n\
genEventSpecificProblem.6461:-->channel="right"\n\
genEventSpecificProblem.6462:-->channel="left"\n\
genEventSpecificProblem.6463:-->channel="right"\n\
genEventSpecificProblem.6464:-->channel="left"\n\
genEventSpecificProblem.6465:-->channel="LFE"\n\
genEventSpecificProblem.6466:-->channel="center"\n\
genEventSpecificProblem.6467:-->channel="right"\n\
genEventSpecificProblem.6468:-->channel="left"\n\
genEventSpecificProblem.6469:-->channel="right"\n\
genEventSpecificProblem.6470:-->channel="left"\n\
genEventSpecificProblem.6471:-->channel="left"\n\
genEventSpecificProblem.6472:-->channel="left"\n\
genEventSpecificProblem.6473:-->channel="right"\n\
genEventSpecificProblem.6474:-->channel="left"\n\
genEventSpecificProblem.6475:-->channel="right"\n\
genEventSpecificProblem.6476:-->channel="left"\n\
genEventSpecificProblem.6477:-->channel="right"\n\
genEventSpecificProblem.6478:-->channel="left"\n\
genEventSpecificProblem.6479:-->channel="right"\n\
genEventSpecificProblem.6480:-->channel="left"\n\
genEventSpecificProblem.6481:-->channel="right"\n\
genEventSpecificProblem.6482:-->channel="left"\n\
genEventSpecificProblem.6483:-->channel="right"\n\
genEventSpecificProblem.6484:-->channel="left"\n\
genEventSpecificProblem.6485:-->Continuity counter error on PID 110\n\
genEventSpecificProblem.6486:-->Continuity counter error on PID 140\n\
genEventSpecificProblem.6487:-->channel="right"\n\
genEventSpecificProblem.6488:-->channel="left"\n\
genEventSpecificProblem.6489:-->channel="right"\n\
genEventSpecificProblem.6490:-->channel="left"\n\
genEventSpecificProblem.6491:-->channel="right"\n\
genEventSpecificProblem.6492:-->channel="left"\n\
genEventSpecificProblem.6493:-->channel="left"\n\
genEventSpecificProblem.6494:-->channel="left"\n\
genEventSpecificProblem.6495:-->channel="right"\n\
genEventSpecificProblem.6496:-->channel="left"\n\
genEventSpecificProblem.6497:-->channel="right"\n\
genEventSpecificProblem.6498:-->channel="left"\n\
genEventSpecificProblem.6499:-->channel="right"\n\
genEventSpecificProblem.6500:-->channel="left"\n\
genEventSpecificProblem.6501:-->channel="right"\n\
genEventSpecificProblem.6502:-->channel="left"\n\
genEventSpecificProblem.6503:-->channel="left"\n\
genEventSpecificProblem.6504:-->channel="right"\n\
genEventSpecificProblem.6505:-->channel="left"\n\
genEventSpecificProblem.6506:-->channel="left"\n\
genEventSpecificProblem.6507:-->channel="left"\n\
genEventSpecificProblem.6508:-->channel="right"\n\
genEventSpecificProblem.6509:-->channel="left"\n\
genEventSpecificProblem.6510:-->channel="left"\n\
genEventSpecificProblem.6511:-->channel="right"\n\
genEventSpecificProblem.6512:-->channel="left"\n\
genEventSpecificProblem.6513:-->channel="right"\n\
genEventSpecificProblem.6514:-->channel="left"\n\
genEventSpecificProblem.6515:-->channel="right"\n\
genEventSpecificProblem.6516:-->channel="left"\n\
genEventSpecificProblem.6517:-->channel="right"\n\
genEventSpecificProblem.6518:-->channel="left"\n\
genEventSpecificProblem.6519:-->channel="right"\n\
genEventSpecificProblem.6520:-->channel="left"\n\
genEventSpecificProblem.6521:-->channel="left"\n\
genEventSpecificProblem.6522:-->channel="right"\n\
genEventSpecificProblem.6523:-->channel="left"\n\
genEventSpecificProblem.6524:-->channel="right"\n\
genEventSpecificProblem.6525:-->channel="left"\n\
genEventSpecificProblem.6526:-->channel="right"\n\
genEventSpecificProblem.6527:-->channel="left"\n\
genEventSpecificProblem.6528:-->channel="right"\n\
genEventSpecificProblem.6529:-->channel="left"\n\
genEventSpecificProblem.6530:-->channel="right"\n\
genEventSpecificProblem.6531:-->channel="left"\n\
genEventSpecificProblem.6532:-->channel="right"\n\
genEventSpecificProblem.6533:-->channel="left"\n\
genEventSpecificProblem.6534:-->channel="right"\n\
genEventSpecificProblem.6535:-->channel="left"\n\
genEventSpecificProblem.6536:-->channel="right"\n\
genEventSpecificProblem.6537:-->channel="left"\n\
genEventSpecificProblem.6538:-->channel="right"\n\
genEventSpecificProblem.6539:-->channel="left"\n\
genEventSpecificProblem.6540:-->channel="right"\n\
genEventSpecificProblem.6541:-->channel="right"\n\
genEventSpecificProblem.6542:-->channel="left"\n\
genEventSpecificProblem.6543:-->channel="left"\n\
genEventSpecificProblem.6544:-->channel="right"\n\
genEventSpecificProblem.6545:-->Continuity counter error on PID 110\n\
genEventSpecificProblem.6546:-->Continuity counter error on PID 110\n\
genEventSpecificProblem.6547:-->Continuity counter error on PID 140\n\
genEventSpecificProblem.6548:-->Continuity counter error on PID 130\n\
genEventSpecificProblem.6549:-->Continuity counter error on PID 130\n\
genEventSpecificProblem.6550:-->Continuity counter error on PID 130\n\
genEventSpecificProblem.6551:-->Continuity counter error on PID 130\n\
genEventSpecificProblem.6552:-->Continuity counter error on PID 140\n\
genEventSpecificProblem.6553:-->Continuity counter error on PID 140\n\
genEventSpecificProblem.6554:-->Continuity counter error on PID 140\n\
genEventSpecificProblem.6555:-->Continuity counter error on PID 140\n\
genEventSpecificProblem.6556:-->Continuity counter error on PID 0\n\
genEventSpecificProblem.6557:-->Continuity counter error on PID 160\n\
genEventSpecificProblem.6558:-->\n\
genEventSpecificProblem.6559:-->\n\
genEventSpecificProblem.6560:-->Continuity counter error on PID 0\n\
genEventSpecificProblem.6561:-->Continuity counter error on PID 160\n\
genEventSpecificProblem.6562:-->Continuity counter error on PID 1\n\
genEventSpecificProblem.6563:-->Continuity counter error on PID 1\n\
genEventSpecificProblem.6564:-->Continuity counter error on PID 1\n\
genEventSpecificProblem.6565:-->Continuity counter error on PID 1\n\
genEventSpecificProblem.6566:-->Continuity counter error on PID 130\n\
genEventSpecificProblem.6567:-->Continuity counter error on PID 130\n\
genEventSpecificProblem.6568:-->Continuity counter error on PID 130\n\
genEventSpecificProblem.6569:-->Continuity counter error on PID 130\n\
genEventSpecificProblem.6570:-->Continuity counter error on PID 160\n\
genEventSpecificProblem.6571:-->Continuity counter error on PID 160\n\
genEventSpecificProblem.6572:-->Continuity counter error on PID 160\n\
genEventSpecificProblem.6573:-->Continuity counter error on PID 160\n\
genEventSpecificProblem.6574:-->Continuity counter error on PID 160\n\
genEventSpecificProblem.6575:-->PID 140\n\
genEventSpecificProblem.6576:-->\n\
genEventSpecificProblem.6577:-->\n\
genEventSpecificProblem.6578:-->Continuity counter error on PID 140\n\
genEventSpecificProblem.6579:-->Continuity counter error on PID 140\n\
genEventSpecificProblem.6580:-->Continuity counter error on PID 140\n\
genEventSpecificProblem.6581:-->Continuity counter error on PID 160\n\
genEventSpecificProblem.6582:-->Continuity counter error on PID 160\n\
genEventSpecificProblem.6583:-->Continuity counter error on PID 140\n\
genEventSpecificProblem.6584:-->Continuity counter error on PID 160\n\
genEventSpecificProblem.6585:-->PID 140\n\
genEventSpecificProblem.6586:-->Continuity counter error on PID 1\n\
genEventSpecificProblem.6587:-->\n\
genEventSpecificProblem.6588:-->\n\
genEventSpecificProblem.6589:-->\n\
genEventSpecificProblem.6590:-->\n\
genEventSpecificProblem.6591:-->Continuity counter error on PID 1\n\
genEventSpecificProblem.6592:-->\n\
genEventSpecificProblem.6593:-->\n\
genEventSpecificProblem.6594:-->\n\
genEventSpecificProblem.6595:-->\n\
genEventSpecificProblem.6596:-->\n\
genEventSpecificProblem.6597:-->Amethyst switches are in their local maintenance mode\n\
genEventSpecificProblem.6598:-->\n\
genEventSpecificProblem.6599:-->\n\
genEventSpecificProblem.6600:-->code="3"\n\
genEventSpecificProblem.6601:-->code="3"\n\
genEventSpecificProblem.6602:-->\n\
genEventSpecificProblem.6603:-->\n\
genEventSeverity.6404:-->severityWarning(3)\n\
genEventSeverity.6405:-->severityWarning(3)\n\
genEventSeverity.6406:-->severityWarning(3)\n\
genEventSeverity.6407:-->severityWarning(3)\n\
genEventSeverity.6408:-->severityWarning(3)\n\
genEventSeverity.6409:-->severityWarning(3)\n\
genEventSeverity.6410:-->severityWarning(3)\n\
genEventSeverity.6411:-->severityWarning(3)\n\
genEventSeverity.6412:-->severityWarning(3)\n\
genEventSeverity.6413:-->severityWarning(3)\n\
genEventSeverity.6414:-->severityWarning(3)\n\
genEventSeverity.6415:-->severityWarning(3)\n\
genEventSeverity.6416:-->severityWarning(3)\n\
genEventSeverity.6417:-->severityWarning(3)\n\
genEventSeverity.6418:-->severityWarning(3)\n\
genEventSeverity.6419:-->severityWarning(3)\n\
genEventSeverity.6420:-->severityWarning(3)\n\
genEventSeverity.6421:-->severityWarning(3)\n\
genEventSeverity.6422:-->severityWarning(3)\n\
genEventSeverity.6423:-->severityWarning(3)\n\
genEventSeverity.6424:-->severityWarning(3)\n\
genEventSeverity.6425:-->severityCleared(1)\n\
genEventSeverity.6426:-->severityCleared(1)\n\
genEventSeverity.6427:-->severityCleared(1)\n\
genEventSeverity.6428:-->severityWarning(3)\n\
genEventSeverity.6429:-->severityWarning(3)\n\
genEventSeverity.6430:-->severityWarning(3)\n\
genEventSeverity.6431:-->severityWarning(3)\n\
genEventSeverity.6432:-->severityWarning(3)\n\
genEventSeverity.6433:-->severityWarning(3)\n\
genEventSeverity.6434:-->severityWarning(3)\n\
genEventSeverity.6435:-->severityWarning(3)\n\
genEventSeverity.6436:-->severityIndeterminate(2)\n\
genEventSeverity.6437:-->severityIndeterminate(2)\n\
genEventSeverity.6438:-->severityCleared(1)\n\
genEventSeverity.6439:-->severityCleared(1)\n\
genEventSeverity.6440:-->severityCleared(1)\n\
genEventSeverity.6441:-->severityCleared(1)\n\
genEventSeverity.6442:-->severityCleared(1)\n\
genEventSeverity.6443:-->severityCleared(1)\n\
genEventSeverity.6444:-->severityCleared(1)\n\
genEventSeverity.6445:-->severityCleared(1)\n\
genEventSeverity.6446:-->severityCleared(1)\n\
genEventSeverity.6447:-->severityCleared(1)\n\
genEventSeverity.6448:-->severityCleared(1)\n\
genEventSeverity.6449:-->severityCleared(1)\n\
genEventSeverity.6450:-->severityCleared(1)\n\
genEventSeverity.6451:-->severityCleared(1)\n\
genEventSeverity.6452:-->severityCleared(1)\n\
genEventSeverity.6453:-->severityCleared(1)\n\
genEventSeverity.6454:-->severityCleared(1)\n\
genEventSeverity.6455:-->severityCleared(1)\n\
genEventSeverity.6456:-->severityCleared(1)\n\
genEventSeverity.6457:-->severityCleared(1)\n\
genEventSeverity.6458:-->severityCleared(1)\n\
genEventSeverity.6459:-->severityCleared(1)\n\
genEventSeverity.6460:-->severityCleared(1)\n\
genEventSeverity.6461:-->severityCleared(1)\n\
genEventSeverity.6462:-->severityCleared(1)\n\
genEventSeverity.6463:-->severityCleared(1)\n\
genEventSeverity.6464:-->severityCleared(1)\n\
genEventSeverity.6465:-->severityCleared(1)\n\
genEventSeverity.6466:-->severityCleared(1)\n\
genEventSeverity.6467:-->severityCleared(1)\n\
genEventSeverity.6468:-->severityCleared(1)\n\
genEventSeverity.6469:-->severityCleared(1)\n\
genEventSeverity.6470:-->severityCleared(1)\n\
genEventSeverity.6471:-->severityCleared(1)\n\
genEventSeverity.6472:-->severityCleared(1)\n\
genEventSeverity.6473:-->severityCleared(1)\n\
genEventSeverity.6474:-->severityCleared(1)\n\
genEventSeverity.6475:-->severityCleared(1)\n\
genEventSeverity.6476:-->severityCleared(1)\n\
genEventSeverity.6477:-->severityCleared(1)\n\
genEventSeverity.6478:-->severityCleared(1)\n\
genEventSeverity.6479:-->severityCleared(1)\n\
genEventSeverity.6480:-->severityCleared(1)\n\
genEventSeverity.6481:-->severityCleared(1)\n\
genEventSeverity.6482:-->severityCleared(1)\n\
genEventSeverity.6483:-->severityCleared(1)\n\
genEventSeverity.6484:-->severityCleared(1)\n\
genEventSeverity.6485:-->severityWarning(3)\n\
genEventSeverity.6486:-->severityWarning(3)\n\
genEventSeverity.6487:-->severityCleared(1)\n\
genEventSeverity.6488:-->severityCleared(1)\n\
genEventSeverity.6489:-->severityCleared(1)\n\
genEventSeverity.6490:-->severityCleared(1)\n\
genEventSeverity.6491:-->severityCleared(1)\n\
genEventSeverity.6492:-->severityCleared(1)\n\
genEventSeverity.6493:-->severityCleared(1)\n\
genEventSeverity.6494:-->severityCleared(1)\n\
genEventSeverity.6495:-->severityCleared(1)\n\
genEventSeverity.6496:-->severityCleared(1)\n\
genEventSeverity.6497:-->severityCleared(1)\n\
genEventSeverity.6498:-->severityCleared(1)\n\
genEventSeverity.6499:-->severityCleared(1)\n\
genEventSeverity.6500:-->severityCleared(1)\n\
genEventSeverity.6501:-->severityCleared(1)\n\
genEventSeverity.6502:-->severityCleared(1)\n\
genEventSeverity.6503:-->severityCleared(1)\n\
genEventSeverity.6504:-->severityCleared(1)\n\
genEventSeverity.6505:-->severityCleared(1)\n\
genEventSeverity.6506:-->severityCleared(1)\n\
genEventSeverity.6507:-->severityCleared(1)\n\
genEventSeverity.6508:-->severityCleared(1)\n\
genEventSeverity.6509:-->severityCleared(1)\n\
genEventSeverity.6510:-->severityCleared(1)\n\
genEventSeverity.6511:-->severityCleared(1)\n\
genEventSeverity.6512:-->severityCleared(1)\n\
genEventSeverity.6513:-->severityCleared(1)\n\
genEventSeverity.6514:-->severityCleared(1)\n\
genEventSeverity.6515:-->severityCleared(1)\n\
genEventSeverity.6516:-->severityCleared(1)\n\
genEventSeverity.6517:-->severityCleared(1)\n\
genEventSeverity.6518:-->severityCleared(1)\n\
genEventSeverity.6519:-->severityCleared(1)\n\
genEventSeverity.6520:-->severityCleared(1)\n\
genEventSeverity.6521:-->severityCleared(1)\n\
genEventSeverity.6522:-->severityCleared(1)\n\
genEventSeverity.6523:-->severityCleared(1)\n\
genEventSeverity.6524:-->severityCleared(1)\n\
genEventSeverity.6525:-->severityCleared(1)\n\
genEventSeverity.6526:-->severityCleared(1)\n\
genEventSeverity.6527:-->severityCleared(1)\n\
genEventSeverity.6528:-->severityCleared(1)\n\
genEventSeverity.6529:-->severityCleared(1)\n\
genEventSeverity.6530:-->severityCleared(1)\n\
genEventSeverity.6531:-->severityCleared(1)\n\
genEventSeverity.6532:-->severityCleared(1)\n\
genEventSeverity.6533:-->severityCleared(1)\n\
genEventSeverity.6534:-->severityCleared(1)\n\
genEventSeverity.6535:-->severityCleared(1)\n\
genEventSeverity.6536:-->severityCleared(1)\n\
genEventSeverity.6537:-->severityCleared(1)\n\
genEventSeverity.6538:-->severityCleared(1)\n\
genEventSeverity.6539:-->severityCleared(1)\n\
genEventSeverity.6540:-->severityCleared(1)\n\
genEventSeverity.6541:-->severityCleared(1)\n\
genEventSeverity.6542:-->severityCleared(1)\n\
genEventSeverity.6543:-->severityCleared(1)\n\
genEventSeverity.6544:-->severityCleared(1)\n\
genEventSeverity.6545:-->severityCleared(1)\n\
genEventSeverity.6546:-->severityCleared(1)\n\
genEventSeverity.6547:-->severityCleared(1)\n\
genEventSeverity.6548:-->severityWarning(3)\n\
genEventSeverity.6549:-->severityWarning(3)\n\
genEventSeverity.6550:-->severityCleared(1)\n\
genEventSeverity.6551:-->severityCleared(1)\n\
genEventSeverity.6552:-->severityWarning(3)\n\
genEventSeverity.6553:-->severityWarning(3)\n\
genEventSeverity.6554:-->severityCleared(1)\n\
genEventSeverity.6555:-->severityCleared(1)\n\
genEventSeverity.6556:-->severityWarning(3)\n\
genEventSeverity.6557:-->severityWarning(3)\n\
genEventSeverity.6558:-->severityIndeterminate(2)\n\
genEventSeverity.6559:-->severityIndeterminate(2)\n\
genEventSeverity.6560:-->severityCleared(1)\n\
genEventSeverity.6561:-->severityCleared(1)\n\
genEventSeverity.6562:-->severityWarning(3)\n\
genEventSeverity.6563:-->severityWarning(3)\n\
genEventSeverity.6564:-->severityCleared(1)\n\
genEventSeverity.6565:-->severityCleared(1)\n\
genEventSeverity.6566:-->severityWarning(3)\n\
genEventSeverity.6567:-->severityWarning(3)\n\
genEventSeverity.6568:-->severityCleared(1)\n\
genEventSeverity.6569:-->severityCleared(1)\n\
genEventSeverity.6570:-->severityWarning(3)\n\
genEventSeverity.6571:-->severityCleared(1)\n\
genEventSeverity.6572:-->severityWarning(3)\n\
genEventSeverity.6573:-->severityCleared(1)\n\
genEventSeverity.6574:-->severityWarning(3)\n\
genEventSeverity.6575:-->severityMajor(5)\n\
genEventSeverity.6576:-->severityIndeterminate(2)\n\
genEventSeverity.6577:-->severityIndeterminate(2)\n\
genEventSeverity.6578:-->severityWarning(3)\n\
genEventSeverity.6579:-->severityWarning(3)\n\
genEventSeverity.6580:-->severityCleared(1)\n\
genEventSeverity.6581:-->severityWarning(3)\n\
genEventSeverity.6582:-->severityCleared(1)\n\
genEventSeverity.6583:-->severityCleared(1)\n\
genEventSeverity.6584:-->severityCleared(1)\n\
genEventSeverity.6585:-->severityCleared(1)\n\
genEventSeverity.6586:-->severityWarning(3)\n\
genEventSeverity.6587:-->severityCleared(1)\n\
genEventSeverity.6588:-->severityCleared(1)\n\
genEventSeverity.6589:-->severityCleared(1)\n\
genEventSeverity.6590:-->severityCleared(1)\n\
genEventSeverity.6591:-->severityCleared(1)\n\
genEventSeverity.6592:-->severityMajor(5)\n\
genEventSeverity.6593:-->severityIndeterminate(2)\n\
genEventSeverity.6594:-->severityIndeterminate(2)\n\
genEventSeverity.6595:-->severityCritical(6)\n\
genEventSeverity.6596:-->severityCritical(6)\n\
genEventSeverity.6597:-->severityWarning(3)\n\
genEventSeverity.6598:-->severityCritical(6)\n\
genEventSeverity.6599:-->severityCritical(6)\n\
genEventSeverity.6600:-->severityCleared(1)\n\
genEventSeverity.6601:-->severityCritical(6)\n\
genEventSeverity.6602:-->severityMajor(5)\n\
genEventSeverity.6603:-->severityCleared(1)\n\
genEventCategory.6404:-->communication(1)\n\
genEventCategory.6405:-->communication(1)\n\
genEventCategory.6406:-->communication(1)\n\
genEventCategory.6407:-->communication(1)\n\
genEventCategory.6408:-->communication(1)\n\
genEventCategory.6409:-->communication(1)\n\
genEventCategory.6410:-->communication(1)\n\
genEventCategory.6411:-->communication(1)\n\
genEventCategory.6412:-->communication(1)\n\
genEventCategory.6413:-->communication(1)\n\
genEventCategory.6414:-->communication(1)\n\
genEventCategory.6415:-->communication(1)\n\
genEventCategory.6416:-->communication(1)\n\
genEventCategory.6417:-->communication(1)\n\
genEventCategory.6418:-->communication(1)\n\
genEventCategory.6419:-->communication(1)\n\
genEventCategory.6420:-->communication(1)\n\
genEventCategory.6421:-->communication(1)\n\
genEventCategory.6422:-->communication(1)\n\
genEventCategory.6423:-->communication(1)\n\
genEventCategory.6424:-->communication(1)\n\
genEventCategory.6425:-->qualityOfService(2)\n\
genEventCategory.6426:-->qualityOfService(2)\n\
genEventCategory.6427:-->qualityOfService(2)\n\
genEventCategory.6428:-->qualityOfService(2)\n\
genEventCategory.6429:-->communication(1)\n\
genEventCategory.6430:-->communication(1)\n\
genEventCategory.6431:-->communication(1)\n\
genEventCategory.6432:-->communication(1)\n\
genEventCategory.6433:-->communication(1)\n\
genEventCategory.6434:-->communication(1)\n\
genEventCategory.6435:-->communication(1)\n\
genEventCategory.6436:-->other(6)\n\
genEventCategory.6437:-->other(6)\n\
genEventCategory.6438:-->communication(1)\n\
genEventCategory.6439:-->communication(1)\n\
genEventCategory.6440:-->communication(1)\n\
genEventCategory.6441:-->communication(1)\n\
genEventCategory.6442:-->communication(1)\n\
genEventCategory.6443:-->communication(1)\n\
genEventCategory.6444:-->communication(1)\n\
genEventCategory.6445:-->communication(1)\n\
genEventCategory.6446:-->communication(1)\n\
genEventCategory.6447:-->communication(1)\n\
genEventCategory.6448:-->communication(1)\n\
genEventCategory.6449:-->communication(1)\n\
genEventCategory.6450:-->communication(1)\n\
genEventCategory.6451:-->communication(1)\n\
genEventCategory.6452:-->communication(1)\n\
genEventCategory.6453:-->communication(1)\n\
genEventCategory.6454:-->communication(1)\n\
genEventCategory.6455:-->communication(1)\n\
genEventCategory.6456:-->communication(1)\n\
genEventCategory.6457:-->communication(1)\n\
genEventCategory.6458:-->communication(1)\n\
genEventCategory.6459:-->communication(1)\n\
genEventCategory.6460:-->communication(1)\n\
genEventCategory.6461:-->communication(1)\n\
genEventCategory.6462:-->communication(1)\n\
genEventCategory.6463:-->communication(1)\n\
genEventCategory.6464:-->communication(1)\n\
genEventCategory.6465:-->communication(1)\n\
genEventCategory.6466:-->communication(1)\n\
genEventCategory.6467:-->communication(1)\n\
genEventCategory.6468:-->communication(1)\n\
genEventCategory.6469:-->communication(1)\n\
genEventCategory.6470:-->communication(1)\n\
genEventCategory.6471:-->communication(1)\n\
genEventCategory.6472:-->communication(1)\n\
genEventCategory.6473:-->communication(1)\n\
genEventCategory.6474:-->communication(1)\n\
genEventCategory.6475:-->communication(1)\n\
genEventCategory.6476:-->communication(1)\n\
genEventCategory.6477:-->communication(1)\n\
genEventCategory.6478:-->communication(1)\n\
genEventCategory.6479:-->communication(1)\n\
genEventCategory.6480:-->communication(1)\n\
genEventCategory.6481:-->communication(1)\n\
genEventCategory.6482:-->communication(1)\n\
genEventCategory.6483:-->communication(1)\n\
genEventCategory.6484:-->communication(1)\n\
genEventCategory.6485:-->qualityOfService(2)\n\
genEventCategory.6486:-->qualityOfService(2)\n\
genEventCategory.6487:-->communication(1)\n\
genEventCategory.6488:-->communication(1)\n\
genEventCategory.6489:-->communication(1)\n\
genEventCategory.6490:-->communication(1)\n\
genEventCategory.6491:-->communication(1)\n\
genEventCategory.6492:-->communication(1)\n\
genEventCategory.6493:-->communication(1)\n\
genEventCategory.6494:-->communication(1)\n\
genEventCategory.6495:-->communication(1)\n\
genEventCategory.6496:-->communication(1)\n\
genEventCategory.6497:-->communication(1)\n\
genEventCategory.6498:-->communication(1)\n\
genEventCategory.6499:-->communication(1)\n\
genEventCategory.6500:-->communication(1)\n\
genEventCategory.6501:-->communication(1)\n\
genEventCategory.6502:-->communication(1)\n\
genEventCategory.6503:-->communication(1)\n\
genEventCategory.6504:-->communication(1)\n\
genEventCategory.6505:-->communication(1)\n\
genEventCategory.6506:-->communication(1)\n\
genEventCategory.6507:-->communication(1)\n\
genEventCategory.6508:-->communication(1)\n\
genEventCategory.6509:-->communication(1)\n\
genEventCategory.6510:-->communication(1)\n\
genEventCategory.6511:-->communication(1)\n\
genEventCategory.6512:-->communication(1)\n\
genEventCategory.6513:-->communication(1)\n\
genEventCategory.6514:-->communication(1)\n\
genEventCategory.6515:-->communication(1)\n\
genEventCategory.6516:-->communication(1)\n\
genEventCategory.6517:-->communication(1)\n\
genEventCategory.6518:-->communication(1)\n\
genEventCategory.6519:-->communication(1)\n\
genEventCategory.6520:-->communication(1)\n\
genEventCategory.6521:-->communication(1)\n\
genEventCategory.6522:-->communication(1)\n\
genEventCategory.6523:-->communication(1)\n\
genEventCategory.6524:-->communication(1)\n\
genEventCategory.6525:-->communication(1)\n\
genEventCategory.6526:-->communication(1)\n\
genEventCategory.6527:-->communication(1)\n\
genEventCategory.6528:-->communication(1)\n\
genEventCategory.6529:-->communication(1)\n\
genEventCategory.6530:-->communication(1)\n\
genEventCategory.6531:-->communication(1)\n\
genEventCategory.6532:-->communication(1)\n\
genEventCategory.6533:-->communication(1)\n\
genEventCategory.6534:-->communication(1)\n\
genEventCategory.6535:-->communication(1)\n\
genEventCategory.6536:-->communication(1)\n\
genEventCategory.6537:-->communication(1)\n\
genEventCategory.6538:-->communication(1)\n\
genEventCategory.6539:-->communication(1)\n\
genEventCategory.6540:-->communication(1)\n\
genEventCategory.6541:-->communication(1)\n\
genEventCategory.6542:-->communication(1)\n\
genEventCategory.6543:-->communication(1)\n\
genEventCategory.6544:-->communication(1)\n\
genEventCategory.6545:-->qualityOfService(2)\n\
genEventCategory.6546:-->qualityOfService(2)\n\
genEventCategory.6547:-->qualityOfService(2)\n\
genEventCategory.6548:-->qualityOfService(2)\n\
genEventCategory.6549:-->qualityOfService(2)\n\
genEventCategory.6550:-->qualityOfService(2)\n\
genEventCategory.6551:-->qualityOfService(2)\n\
genEventCategory.6552:-->qualityOfService(2)\n\
genEventCategory.6553:-->qualityOfService(2)\n\
genEventCategory.6554:-->qualityOfService(2)\n\
genEventCategory.6555:-->qualityOfService(2)\n\
genEventCategory.6556:-->qualityOfService(2)\n\
genEventCategory.6557:-->qualityOfService(2)\n\
genEventCategory.6558:-->other(6)\n\
genEventCategory.6559:-->other(6)\n\
genEventCategory.6560:-->qualityOfService(2)\n\
genEventCategory.6561:-->qualityOfService(2)\n\
genEventCategory.6562:-->qualityOfService(2)\n\
genEventCategory.6563:-->qualityOfService(2)\n\
genEventCategory.6564:-->qualityOfService(2)\n\
genEventCategory.6565:-->qualityOfService(2)\n\
genEventCategory.6566:-->qualityOfService(2)\n\
genEventCategory.6567:-->qualityOfService(2)\n\
genEventCategory.6568:-->qualityOfService(2)\n\
genEventCategory.6569:-->qualityOfService(2)\n\
genEventCategory.6570:-->qualityOfService(2)\n\
genEventCategory.6571:-->qualityOfService(2)\n\
genEventCategory.6572:-->qualityOfService(2)\n\
genEventCategory.6573:-->qualityOfService(2)\n\
genEventCategory.6574:-->qualityOfService(2)\n\
genEventCategory.6575:-->communication(1)\n\
genEventCategory.6576:-->other(6)\n\
genEventCategory.6577:-->other(6)\n\
genEventCategory.6578:-->qualityOfService(2)\n\
genEventCategory.6579:-->qualityOfService(2)\n\
genEventCategory.6580:-->qualityOfService(2)\n\
genEventCategory.6581:-->qualityOfService(2)\n\
genEventCategory.6582:-->qualityOfService(2)\n\
genEventCategory.6583:-->qualityOfService(2)\n\
genEventCategory.6584:-->qualityOfService(2)\n\
genEventCategory.6585:-->communication(1)\n\
genEventCategory.6586:-->qualityOfService(2)\n\
genEventCategory.6587:-->processing(3)\n\
genEventCategory.6588:-->communication(1)\n\
genEventCategory.6589:-->communication(1)\n\
genEventCategory.6590:-->communication(1)\n\
genEventCategory.6591:-->qualityOfService(2)\n\
genEventCategory.6592:-->equipment(4)\n\
genEventCategory.6593:-->other(6)\n\
genEventCategory.6594:-->other(6)\n\
genEventCategory.6595:-->communication(1)\n\
genEventCategory.6596:-->communication(1)\n\
genEventCategory.6597:-->equipment(4)\n\
genEventCategory.6598:-->equipment(4)\n\
genEventCategory.6599:-->equipment(4)\n\
genEventCategory.6600:-->environment(5)\n\
genEventCategory.6601:-->environment(5)\n\
genEventCategory.6602:-->communication(1)\n\
genEventCategory.6603:-->communication(1)\n\
genEventLabel.6404:-->Detected silence: channel="right"\n\
genEventLabel.6405:-->Detected silence: channel="left"\n\
genEventLabel.6406:-->Detected silence: channel="left"\n\
genEventLabel.6407:-->Detected silence: channel="right"\n\
genEventLabel.6408:-->Detected silence: channel="left"\n\
genEventLabel.6409:-->Detected silence: channel="left"\n\
genEventLabel.6410:-->Detected silence: channel="right"\n\
genEventLabel.6411:-->Detected silence: channel="left"\n\
genEventLabel.6412:-->Detected silence: channel="right"\n\
genEventLabel.6413:-->Detected silence: channel="left"\n\
genEventLabel.6414:-->Detected silence: channel="right"\n\
genEventLabel.6415:-->Detected silence: channel="left"\n\
genEventLabel.6416:-->Detected silence: channel="right"\n\
genEventLabel.6417:-->Detected silence: channel="left"\n\
genEventLabel.6418:-->Detected silence: channel="right"\n\
genEventLabel.6419:-->Detected silence: channel="left"\n\
genEventLabel.6420:-->Detected silence: channel="right"\n\
genEventLabel.6421:-->Detected silence: channel="left"\n\
genEventLabel.6422:-->Detected silence: channel="right"\n\
genEventLabel.6423:-->Detected silence: channel="left"\n\
genEventLabel.6424:-->Detected silence: channel="right"\n\
genEventLabel.6425:-->TR 101 290 First priority error.: Continuity counter error on PID 17\n\
genEventLabel.6426:-->TR 101 290 First priority error.: Continuity counter error on PID 120\n\
genEventLabel.6427:-->TR 101 290 First priority error.: Continuity counter error on PID 120\n\
genEventLabel.6428:-->TR 101 290 First priority error.: Continuity counter error on PID 110\n\
genEventLabel.6429:-->Detected silence: channel="right"\n\
genEventLabel.6430:-->Detected silence: channel="left"\n\
genEventLabel.6431:-->Detected silence: channel="right"\n\
genEventLabel.6432:-->Detected silence: channel="right"\n\
genEventLabel.6433:-->Detected silence: channel="left"\n\
genEventLabel.6434:-->Detected silence: channel="left"\n\
genEventLabel.6435:-->Detected silence: channel="right"\n\
genEventLabel.6436:-->PLL locked\n\
genEventLabel.6437:-->PLL locked\n\
genEventLabel.6438:-->Detected silence: channel="left"\n\
genEventLabel.6439:-->Detected silence: channel="center"\n\
genEventLabel.6440:-->Detected silence: channel="right"\n\
genEventLabel.6441:-->Detected silence: channel="left surround"\n\
genEventLabel.6442:-->Detected silence: channel="LFE"\n\
genEventLabel.6443:-->Detected silence: channel="left"\n\
genEventLabel.6444:-->Detected silence: channel="right surround"\n\
genEventLabel.6445:-->Detected silence: channel="left"\n\
genEventLabel.6446:-->Detected silence: channel="right"\n\
genEventLabel.6447:-->Detected silence: channel="left"\n\
genEventLabel.6448:-->Detected silence: channel="left"\n\
genEventLabel.6449:-->Detected silence: channel="left surround"\n\
genEventLabel.6450:-->Detected silence: channel="right surround"\n\
genEventLabel.6451:-->Detected silence: channel="left"\n\
genEventLabel.6452:-->Detected silence: channel="left"\n\
genEventLabel.6453:-->Detected silence: channel="right"\n\
genEventLabel.6454:-->Detected silence: channel="left"\n\
genEventLabel.6455:-->Detected silence: channel="right"\n\
genEventLabel.6456:-->Detected silence: channel="left"\n\
genEventLabel.6457:-->Detected silence: channel="right surround"\n\
genEventLabel.6458:-->Detected silence: channel="left surround"\n\
genEventLabel.6459:-->Detected silence: channel="LFE"\n\
genEventLabel.6460:-->Detected silence: channel="center"\n\
genEventLabel.6461:-->Detected silence: channel="right"\n\
genEventLabel.6462:-->Detected silence: channel="left"\n\
genEventLabel.6463:-->Detected silence: channel="right"\n\
genEventLabel.6464:-->Detected silence: channel="left"\n\
genEventLabel.6465:-->Detected silence: channel="LFE"\n\
genEventLabel.6466:-->Detected silence: channel="center"\n\
genEventLabel.6467:-->Detected silence: channel="right"\n\
genEventLabel.6468:-->Detected silence: channel="left"\n\
genEventLabel.6469:-->Detected silence: channel="right"\n\
genEventLabel.6470:-->Detected silence: channel="left"\n\
genEventLabel.6471:-->Detected silence: channel="left"\n\
genEventLabel.6472:-->Detected silence: channel="left"\n\
genEventLabel.6473:-->Detected silence: channel="right"\n\
genEventLabel.6474:-->Detected silence: channel="left"\n\
genEventLabel.6475:-->Detected silence: channel="right"\n\
genEventLabel.6476:-->Detected silence: channel="left"\n\
genEventLabel.6477:-->Detected silence: channel="right"\n\
genEventLabel.6478:-->Detected silence: channel="left"\n\
genEventLabel.6479:-->Detected silence: channel="right"\n\
genEventLabel.6480:-->Detected silence: channel="left"\n\
genEventLabel.6481:-->Detected silence: channel="right"\n\
genEventLabel.6482:-->Detected silence: channel="left"\n\
genEventLabel.6483:-->Detected silence: channel="right"\n\
genEventLabel.6484:-->Detected silence: channel="left"\n\
genEventLabel.6485:-->TR 101 290 First priority error.: Continuity counter error on PID 110\n\
genEventLabel.6486:-->TR 101 290 First priority error.: Continuity counter error on PID 140\n\
genEventLabel.6487:-->Detected silence: channel="right"\n\
genEventLabel.6488:-->Detected silence: channel="left"\n\
genEventLabel.6489:-->Detected silence: channel="right"\n\
genEventLabel.6490:-->Detected silence: channel="left"\n\
genEventLabel.6491:-->Detected silence: channel="right"\n\
genEventLabel.6492:-->Detected silence: channel="left"\n\
genEventLabel.6493:-->Detected silence: channel="left"\n\
genEventLabel.6494:-->Detected silence: channel="left"\n\
genEventLabel.6495:-->Detected silence: channel="right"\n\
genEventLabel.6496:-->Detected silence: channel="left"\n\
genEventLabel.6497:-->Detected silence: channel="right"\n\
genEventLabel.6498:-->Detected silence: channel="left"\n\
genEventLabel.6499:-->Detected silence: channel="right"\n\
genEventLabel.6500:-->Detected silence: channel="left"\n\
genEventLabel.6501:-->Detected silence: channel="right"\n\
genEventLabel.6502:-->Detected silence: channel="left"\n\
genEventLabel.6503:-->Detected silence: channel="left"\n\
genEventLabel.6504:-->Detected silence: channel="right"\n\
genEventLabel.6505:-->Detected silence: channel="left"\n\
genEventLabel.6506:-->Detected silence: channel="left"\n\
genEventLabel.6507:-->Detected silence: channel="left"\n\
genEventLabel.6508:-->Detected silence: channel="right"\n\
genEventLabel.6509:-->Detected silence: channel="left"\n\
genEventLabel.6510:-->Detected silence: channel="left"\n\
genEventLabel.6511:-->Detected silence: channel="right"\n\
genEventLabel.6512:-->Detected silence: channel="left"\n\
genEventLabel.6513:-->Detected silence: channel="right"\n\
genEventLabel.6514:-->Detected silence: channel="left"\n\
genEventLabel.6515:-->Detected silence: channel="right"\n\
genEventLabel.6516:-->Detected silence: channel="left"\n\
genEventLabel.6517:-->Detected silence: channel="right"\n\
genEventLabel.6518:-->Detected silence: channel="left"\n\
genEventLabel.6519:-->Detected silence: channel="right"\n\
genEventLabel.6520:-->Detected silence: channel="left"\n\
genEventLabel.6521:-->Detected silence: channel="left"\n\
genEventLabel.6522:-->Detected silence: channel="right"\n\
genEventLabel.6523:-->Detected silence: channel="left"\n\
genEventLabel.6524:-->Detected silence: channel="right"\n\
genEventLabel.6525:-->Detected silence: channel="left"\n\
genEventLabel.6526:-->Detected silence: channel="right"\n\
genEventLabel.6527:-->Detected silence: channel="left"\n\
genEventLabel.6528:-->Detected silence: channel="right"\n\
genEventLabel.6529:-->Detected silence: channel="left"\n\
genEventLabel.6530:-->Detected silence: channel="right"\n\
genEventLabel.6531:-->Detected silence: channel="left"\n\
genEventLabel.6532:-->Detected silence: channel="right"\n\
genEventLabel.6533:-->Detected silence: channel="left"\n\
genEventLabel.6534:-->Detected silence: channel="right"\n\
genEventLabel.6535:-->Detected silence: channel="left"\n\
genEventLabel.6536:-->Detected silence: channel="right"\n\
genEventLabel.6537:-->Detected silence: channel="left"\n\
genEventLabel.6538:-->Detected silence: channel="right"\n\
genEventLabel.6539:-->Detected silence: channel="left"\n\
genEventLabel.6540:-->Detected silence: channel="right"\n\
genEventLabel.6541:-->Detected silence: channel="right"\n\
genEventLabel.6542:-->Detected silence: channel="left"\n\
genEventLabel.6543:-->Detected silence: channel="left"\n\
genEventLabel.6544:-->Detected silence: channel="right"\n\
genEventLabel.6545:-->TR 101 290 First priority error.: Continuity counter error on PID 110\n\
genEventLabel.6546:-->TR 101 290 First priority error.: Continuity counter error on PID 110\n\
genEventLabel.6547:-->TR 101 290 First priority error.: Continuity counter error on PID 140\n\
genEventLabel.6548:-->TR 101 290 First priority error.: Continuity counter error on PID 130\n\
genEventLabel.6549:-->TR 101 290 First priority error.: Continuity counter error on PID 130\n\
genEventLabel.6550:-->TR 101 290 First priority error.: Continuity counter error on PID 130\n\
genEventLabel.6551:-->TR 101 290 First priority error.: Continuity counter error on PID 130\n\
genEventLabel.6552:-->TR 101 290 First priority error.: Continuity counter error on PID 140\n\
genEventLabel.6553:-->TR 101 290 First priority error.: Continuity counter error on PID 140\n\
genEventLabel.6554:-->TR 101 290 First priority error.: Continuity counter error on PID 140\n\
genEventLabel.6555:-->TR 101 290 First priority error.: Continuity counter error on PID 140\n\
genEventLabel.6556:-->TR 101 290 First priority error.: Continuity counter error on PID 0\n\
genEventLabel.6557:-->TR 101 290 First priority error.: Continuity counter error on PID 160\n\
genEventLabel.6558:-->PLL locked\n\
genEventLabel.6559:-->PLL locked\n\
genEventLabel.6560:-->TR 101 290 First priority error.: Continuity counter error on PID 0\n\
genEventLabel.6561:-->TR 101 290 First priority error.: Continuity counter error on PID 160\n\
genEventLabel.6562:-->TR 101 290 First priority error.: Continuity counter error on PID 1\n\
genEventLabel.6563:-->TR 101 290 First priority error.: Continuity counter error on PID 1\n\
genEventLabel.6564:-->TR 101 290 First priority error.: Continuity counter error on PID 1\n\
genEventLabel.6565:-->TR 101 290 First priority error.: Continuity counter error on PID 1\n\
genEventLabel.6566:-->TR 101 290 First priority error.: Continuity counter error on PID 130\n\
genEventLabel.6567:-->TR 101 290 First priority error.: Continuity counter error on PID 130\n\
genEventLabel.6568:-->TR 101 290 First priority error.: Continuity counter error on PID 130\n\
genEventLabel.6569:-->TR 101 290 First priority error.: Continuity counter error on PID 130\n\
genEventLabel.6570:-->TR 101 290 First priority error.: Continuity counter error on PID 160\n\
genEventLabel.6571:-->TR 101 290 First priority error.: Continuity counter error on PID 160\n\
genEventLabel.6572:-->TR 101 290 First priority error.: Continuity counter error on PID 160\n\
genEventLabel.6573:-->TR 101 290 First priority error.: Continuity counter error on PID 160\n\
genEventLabel.6574:-->TR 101 290 First priority error.: Continuity counter error on PID 160\n\
genEventLabel.6575:-->Component error: PID 140\n\
genEventLabel.6576:-->PLL locked\n\
genEventLabel.6577:-->PLL locked\n\
genEventLabel.6578:-->TR 101 290 First priority error.: Continuity counter error on PID 140\n\
genEventLabel.6579:-->TR 101 290 First priority error.: Continuity counter error on PID 140\n\
genEventLabel.6580:-->TR 101 290 First priority error.: Continuity counter error on PID 140\n\
genEventLabel.6581:-->TR 101 290 First priority error.: Continuity counter error on PID 160\n\
genEventLabel.6582:-->TR 101 290 First priority error.: Continuity counter error on PID 160\n\
genEventLabel.6583:-->TR 101 290 First priority error.: Continuity counter error on PID 140\n\
genEventLabel.6584:-->TR 101 290 First priority error.: Continuity counter error on PID 160\n\
genEventLabel.6585:-->Component error: PID 140\n\
genEventLabel.6586:-->TR 101 290 First priority error.: Continuity counter error on PID 1\n\
genEventLabel.6587:-->Alarm collection impossible\n\
genEventLabel.6588:-->Connection establishment error\n\
genEventLabel.6589:-->Connection establishment error\n\
genEventLabel.6590:-->Connection establishment error\n\
genEventLabel.6591:-->TR 101 290 First priority error.: Continuity counter error on PID 1\n\
genEventLabel.6592:-->Power supply failure\n\
genEventLabel.6593:-->Configuration SPOKE-CODEC activated by Network Management System (10.1.114.101)\n\
genEventLabel.6594:-->Extended MIB updated\n\
genEventLabel.6595:-->Video standard unknown\n\
genEventLabel.6596:-->Video standard unknown\n\
genEventLabel.6597:-->Function not operating: Amethyst switches are in their local maintenance mode\n\
genEventLabel.6598:-->Power supply failure\n\
genEventLabel.6599:-->Power supply failure\n\
genEventLabel.6600:-->High temperature: code="3"\n\
genEventLabel.6601:-->High temperature: code="3"\n\
genEventLabel.6602:-->Loss of signal\n\
genEventLabel.6603:-->Loss of signal\n\
genSoftwareVersion.0:-->XMS_04.71.00 - 23/10/2013\n\
genTrapTopoChangeType.0:-->genTrapObjectChange(3)\n\
genTrapRedundancyStatusVar.0:-->active(2)\n\
genTrapRedundancyGroupType.0:-->1\n\
genTrapRedundancyGroupIndex.0:-->5\n\
genTrapRedundancyElementIndex.0:-->28\n\
genTrapRedundancyChangeType.0:-->genTrapObjectChange(3)\n\
genTrapRedundancyElementName.0:-->NOC_EM4000_BU\n\
genTrapEncoderInputElementIndex.0:-->20\n\
genTrapEncoderInputElementName.0:-->NOC_EM4000_02\n\
topoElementIndex.1:-->1\n\
topoElementIndex.2:-->2\n\
topoElementIndex.3:-->3\n\
topoElementIndex.4:-->4\n\
topoElementIndex.5:-->5\n\
topoElementIndex.6:-->6\n\
topoElementIndex.7:-->7\n\
topoElementIndex.8:-->8\n\
topoElementIndex.9:-->9\n\
topoElementIndex.10:-->10\n\
topoElementIndex.11:-->11\n\
topoElementIndex.12:-->12\n\
topoElementIndex.13:-->13\n\
topoElementIndex.14:-->14\n\
topoElementIndex.15:-->15\n\
topoElementIndex.16:-->16\n\
topoElementIndex.18:-->18\n\
topoElementIndex.19:-->19\n\
topoElementIndex.20:-->20\n\
topoElementIndex.21:-->21\n\
topoElementIndex.22:-->22\n\
topoElementIndex.23:-->23\n\
topoElementIndex.24:-->24\n\
topoElementIndex.25:-->25\n\
topoElementIndex.26:-->26\n\
topoElementIndex.27:-->27\n\
topoElementIndex.28:-->28\n\
topoElementIndex.29:-->29\n\
topoElementIndex.30:-->30\n\
topoElementIndex.31:-->31\n\
topoElementIndex.32:-->32\n\
topoElementIndex.33:-->33\n\
topoElementIndex.34:-->34\n\
topoElementIndex.35:-->35\n\
topoElementIndex.36:-->36\n\
topoElementIndex.37:-->37\n\
topoElementIndex.38:-->38\n\
topoElementIndex.39:-->39\n\
topoElementIndex.40:-->40\n\
topoElementIndex.41:-->41\n\
topoElementIndex.42:-->42\n\
topoElementIndex.43:-->43\n\
topoElementIndex.44:-->44\n\
topoElementIndex.45:-->45\n\
topoElementIndex.46:-->46\n\
topoElementIndex.47:-->47\n\
topoElementIndex.48:-->48\n\
topoElementIndex.49:-->49\n\
topoElementIndex.50:-->50\n\
topoElementIndex.51:-->51\n\
topoElementIndex.52:-->52\n\
topoElementIndex.53:-->53\n\
topoElementIndex.54:-->54\n\
topoElementIndex.55:-->55\n\
topoElementIndex.56:-->56\n\
topoElementName.1:-->WJCT_CP6000_01\n\
topoElementName.2:-->WJCT_CP6000_01_mpeg_enc_04\n\
topoElementName.3:-->NOC_CP6000_03\n\
topoElementName.4:-->NOC_CP6000_03_mpeg_enc_04\n\
topoElementName.5:-->NOC_CP6000_03_mpeg_enc_02\n\
topoElementName.6:-->NOC_CP6000_03_mpeg_enc_03\n\
topoElementName.7:-->NOC_CP6000_02\n\
topoElementName.8:-->NOC_CP6000_02_mpeg_dec_03\n\
topoElementName.9:-->NOC_CP6000_02_mpeg_dec_04\n\
topoElementName.10:-->NOC_CP6000_02_mpeg_dec_02\n\
topoElementName.11:-->NOC_CP6000_01\n\
topoElementName.12:-->NOC_CP6000_01_mpeg_dec_02\n\
topoElementName.13:-->NOC_CP6000_01_mpeg_dec_03\n\
topoElementName.14:-->NOC_CP6000_01_mpeg_dec_01\n\
topoElementName.15:-->NOC_CP6000_01_mpeg_dec_04\n\
topoElementName.16:-->NOC_XMU\n\
topoElementName.18:-->NOC_NVision_Router\n\
topoElementName.19:-->NOC_MUX_BU\n\
topoElementName.20:-->NOC_EM4000_02\n\
topoElementName.21:-->NOC_EM4000_03\n\
topoElementName.22:-->NOC_EM4000_04\n\
topoElementName.23:-->NOC_RTR_SRC\n\
topoElementName.24:-->NOC_EM4000_05\n\
topoElementName.25:-->NOC_EM4000_01\n\
topoElementName.26:-->NOC_MUX_02\n\
topoElementName.27:-->NOC_MUX_01\n\
topoElementName.28:-->NOC_EM4000_BU\n\
topoElementName.29:-->WJCT_Amethyst_01\n\
topoElementName.30:-->NOC_CP6000_BU\n\
topoElementName.31:-->NOC_CP6000_BU_mpeg_enc_04\n\
topoElementName.32:-->NOC_CP6000_BU_mpeg_dec_03\n\
topoElementName.33:-->WPBA_Amethyst_01\n\
topoElementName.34:-->WJCT_MUX_01\n\
topoElementName.35:-->NOC_FS_MILW_XVP\n\
topoElementName.36:-->NOC_Amethyst_02\n\
topoElementName.37:-->NOC_Amethyst_01\n\
topoElementName.38:-->NOC_Amethyst_01_SwitchIp5\n\
topoElementName.39:-->NOC_Amethyst_01_SwitchIp4\n\
topoElementName.40:-->NOC_Amethyst_01_SwitchIp1\n\
topoElementName.41:-->NOC_Amethyst_01_SwitchIp2\n\
topoElementName.42:-->NOC_Amethyst_01_SwitchIp3\n\
topoElementName.43:-->NOC_Nevion_Switch\n\
topoElementName.44:-->Nevion_Switch1\n\
topoElementName.45:-->WPBA_CP6000_01\n\
topoElementName.46:-->WPBA_Sapphire\n\
topoElementName.47:-->WPBA_MUX_01\n\
topoElementName.48:-->WJCT_Sapphire\n\
topoElementName.49:-->NOC_IP_SWITCH_BU\n\
topoElementName.50:-->NOC_IP_SWITCH_MAIN\n\
topoElementName.51:-->NOC_FSYNC\n\
topoElementName.52:-->NOC_Amethyst_02_SwitchIp2\n\
topoElementName.53:-->NOC_Amethyst_02_SwitchIp1\n\
topoElementName.54:-->NOC_Amethyst_02_SwitchIp5\n\
topoElementName.55:-->NOC_Amethyst_02_SwitchIp4\n\
topoElementName.56:-->NOC_Amethyst_02_SwitchIp3\n\
topoElementType.1:-->95\n\
topoElementType.2:-->95\n\
topoElementType.3:-->95\n\
topoElementType.4:-->95\n\
topoElementType.5:-->95\n\
topoElementType.6:-->95\n\
topoElementType.7:-->95\n\
topoElementType.8:-->95\n\
topoElementType.9:-->95\n\
topoElementType.10:-->95\n\
topoElementType.11:-->95\n\
topoElementType.12:-->95\n\
topoElementType.13:-->95\n\
topoElementType.14:-->95\n\
topoElementType.15:-->95\n\
topoElementType.16:-->4\n\
topoElementType.18:-->12\n\
topoElementType.19:-->2\n\
topoElementType.20:-->16\n\
topoElementType.21:-->16\n\
topoElementType.22:-->16\n\
topoElementType.23:-->13\n\
topoElementType.24:-->16\n\
topoElementType.25:-->16\n\
topoElementType.26:-->2\n\
topoElementType.27:-->2\n\
topoElementType.28:-->16\n\
topoElementType.29:-->96\n\
topoElementType.30:-->95\n\
topoElementType.31:-->95\n\
topoElementType.32:-->95\n\
topoElementType.33:-->96\n\
topoElementType.34:-->2\n\
topoElementType.35:-->13\n\
topoElementType.36:-->96\n\
topoElementType.37:-->96\n\
topoElementType.38:-->12\n\
topoElementType.39:-->12\n\
topoElementType.40:-->12\n\
topoElementType.41:-->12\n\
topoElementType.42:-->12\n\
topoElementType.43:-->12\n\
topoElementType.44:-->12\n\
topoElementType.45:-->95\n\
topoElementType.46:-->22\n\
topoElementType.47:-->2\n\
topoElementType.48:-->22\n\
topoElementType.49:-->13\n\
topoElementType.50:-->13\n\
topoElementType.51:-->13\n\
topoElementType.52:-->12\n\
topoElementType.53:-->12\n\
topoElementType.54:-->12\n\
topoElementType.55:-->12\n\
topoElementType.56:-->12\n\
topoElementExtType.1:-->1\n\
topoElementExtType.2:-->4\n\
topoElementExtType.3:-->1\n\
topoElementExtType.4:-->4\n\
topoElementExtType.5:-->4\n\
topoElementExtType.6:-->4\n\
topoElementExtType.7:-->1\n\
topoElementExtType.8:-->5\n\
topoElementExtType.9:-->5\n\
topoElementExtType.10:-->5\n\
topoElementExtType.11:-->1\n\
topoElementExtType.12:-->5\n\
topoElementExtType.13:-->5\n\
topoElementExtType.14:-->5\n\
topoElementExtType.15:-->5\n\
topoElementExtType.16:-->5\n\
topoElementExtType.18:-->7\n\
topoElementExtType.19:-->1\n\
topoElementExtType.20:-->9\n\
topoElementExtType.21:-->9\n\
topoElementExtType.22:-->9\n\
topoElementExtType.23:-->1\n\
topoElementExtType.24:-->9\n\
topoElementExtType.25:-->9\n\
topoElementExtType.26:-->1\n\
topoElementExtType.27:-->1\n\
topoElementExtType.28:-->9\n\
topoElementExtType.29:-->1\n\
topoElementExtType.30:-->1\n\
topoElementExtType.31:-->4\n\
topoElementExtType.32:-->5\n\
topoElementExtType.33:-->1\n\
topoElementExtType.34:-->3\n\
topoElementExtType.35:-->0\n\
topoElementExtType.36:-->1\n\
topoElementExtType.37:-->1\n\
topoElementExtType.38:-->25\n\
topoElementExtType.39:-->25\n\
topoElementExtType.40:-->25\n\
topoElementExtType.41:-->25\n\
topoElementExtType.42:-->25\n\
topoElementExtType.43:-->29\n\
topoElementExtType.44:-->32\n\
topoElementExtType.45:-->1\n\
topoElementExtType.46:-->4\n\
topoElementExtType.47:-->3\n\
topoElementExtType.48:-->4\n\
topoElementExtType.49:-->0\n\
topoElementExtType.50:-->0\n\
topoElementExtType.51:-->0\n\
topoElementExtType.52:-->25\n\
topoElementExtType.53:-->25\n\
topoElementExtType.54:-->25\n\
topoElementExtType.55:-->25\n\
topoElementExtType.56:-->25\n\
topoElementParentIndex.1:-->0\n\
topoElementParentIndex.2:-->1\n\
topoElementParentIndex.3:-->0\n\
topoElementParentIndex.4:-->3\n\
topoElementParentIndex.5:-->3\n\
topoElementParentIndex.6:-->3\n\
topoElementParentIndex.7:-->0\n\
topoElementParentIndex.8:-->7\n\
topoElementParentIndex.9:-->7\n\
topoElementParentIndex.10:-->7\n\
topoElementParentIndex.11:-->0\n\
topoElementParentIndex.12:-->11\n\
topoElementParentIndex.13:-->11\n\
topoElementParentIndex.14:-->11\n\
topoElementParentIndex.15:-->11\n\
topoElementParentIndex.16:-->0\n\
topoElementParentIndex.18:-->16\n\
topoElementParentIndex.19:-->16\n\
topoElementParentIndex.20:-->16\n\
topoElementParentIndex.21:-->16\n\
topoElementParentIndex.22:-->16\n\
topoElementParentIndex.23:-->16\n\
topoElementParentIndex.24:-->16\n\
topoElementParentIndex.25:-->16\n\
topoElementParentIndex.26:-->16\n\
topoElementParentIndex.27:-->16\n\
topoElementParentIndex.28:-->16\n\
topoElementParentIndex.29:-->0\n\
topoElementParentIndex.30:-->0\n\
topoElementParentIndex.31:-->30\n\
topoElementParentIndex.32:-->30\n\
topoElementParentIndex.33:-->0\n\
topoElementParentIndex.34:-->0\n\
topoElementParentIndex.35:-->0\n\
topoElementParentIndex.36:-->0\n\
topoElementParentIndex.37:-->0\n\
topoElementParentIndex.38:-->37\n\
topoElementParentIndex.39:-->37\n\
topoElementParentIndex.40:-->37\n\
topoElementParentIndex.41:-->37\n\
topoElementParentIndex.42:-->37\n\
topoElementParentIndex.43:-->0\n\
topoElementParentIndex.44:-->43\n\
topoElementParentIndex.45:-->0\n\
topoElementParentIndex.46:-->0\n\
topoElementParentIndex.47:-->0\n\
topoElementParentIndex.48:-->0\n\
topoElementParentIndex.49:-->0\n\
topoElementParentIndex.50:-->0\n\
topoElementParentIndex.51:-->0\n\
topoElementParentIndex.52:-->36\n\
topoElementParentIndex.53:-->36\n\
topoElementParentIndex.54:-->36\n\
topoElementParentIndex.55:-->36\n\
topoElementParentIndex.56:-->36\n\
topoElementMaintenanceStatus.1:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.2:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.3:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.4:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.5:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.6:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.7:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.8:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.9:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.10:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.11:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.12:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.13:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.14:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.15:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.16:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.18:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.19:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.20:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.21:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.22:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.23:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.24:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.25:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.26:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.27:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.28:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.29:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.30:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.31:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.32:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.33:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.34:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.35:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.36:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.37:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.38:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.39:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.40:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.41:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.42:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.43:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.44:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.45:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.46:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.47:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.48:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.49:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.50:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.51:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.52:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.53:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.54:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.55:-->maintenanceModeOff(0)\n\
topoElementMaintenanceStatus.56:-->maintenanceModeOff(0)\n\
topoElementIdleStatus.1:-->idleModeOff(0)\n\
topoElementIdleStatus.2:-->idleModeOff(0)\n\
topoElementIdleStatus.3:-->idleModeOff(0)\n\
topoElementIdleStatus.4:-->idleModeOff(0)\n\
topoElementIdleStatus.5:-->idleModeOff(0)\n\
topoElementIdleStatus.6:-->idleModeOff(0)\n\
topoElementIdleStatus.7:-->idleModeOff(0)\n\
topoElementIdleStatus.8:-->idleModeOff(0)\n\
topoElementIdleStatus.9:-->idleModeOff(0)\n\
topoElementIdleStatus.10:-->idleModeOff(0)\n\
topoElementIdleStatus.11:-->idleModeOff(0)\n\
topoElementIdleStatus.12:-->idleModeOff(0)\n\
topoElementIdleStatus.13:-->idleModeOff(0)\n\
topoElementIdleStatus.14:-->idleModeOff(0)\n\
topoElementIdleStatus.15:-->idleModeOff(0)\n\
topoElementIdleStatus.16:-->idleModeOff(0)\n\
topoElementIdleStatus.18:-->idleModeOff(0)\n\
topoElementIdleStatus.19:-->idleModeOff(0)\n\
topoElementIdleStatus.20:-->idleModeOff(0)\n\
topoElementIdleStatus.21:-->idleModeOff(0)\n\
topoElementIdleStatus.22:-->idleModeOff(0)\n\
topoElementIdleStatus.23:-->idleModeOff(0)\n\
topoElementIdleStatus.24:-->idleModeOff(0)\n\
topoElementIdleStatus.25:-->idleModeOff(0)\n\
topoElementIdleStatus.26:-->idleModeOff(0)\n\
topoElementIdleStatus.27:-->idleModeOff(0)\n\
topoElementIdleStatus.28:-->idleModeOff(0)\n\
topoElementIdleStatus.29:-->idleModeOff(0)\n\
topoElementIdleStatus.30:-->idleModeOff(0)\n\
topoElementIdleStatus.31:-->idleModeOff(0)\n\
topoElementIdleStatus.32:-->idleModeOff(0)\n\
topoElementIdleStatus.33:-->idleModeOff(0)\n\
topoElementIdleStatus.34:-->idleModeOff(0)\n\
topoElementIdleStatus.35:-->idleModeOff(0)\n\
topoElementIdleStatus.36:-->idleModeOff(0)\n\
topoElementIdleStatus.37:-->idleModeOff(0)\n\
topoElementIdleStatus.38:-->idleModeOff(0)\n\
topoElementIdleStatus.39:-->idleModeOff(0)\n\
topoElementIdleStatus.40:-->idleModeOff(0)\n\
topoElementIdleStatus.41:-->idleModeOff(0)\n\
topoElementIdleStatus.42:-->idleModeOff(0)\n\
topoElementIdleStatus.43:-->idleModeOff(0)\n\
topoElementIdleStatus.44:-->idleModeOff(0)\n\
topoElementIdleStatus.45:-->idleModeOff(0)\n\
topoElementIdleStatus.46:-->idleModeOff(0)\n\
topoElementIdleStatus.47:-->idleModeOff(0)\n\
topoElementIdleStatus.48:-->idleModeOff(0)\n\
topoElementIdleStatus.49:-->idleModeOff(0)\n\
topoElementIdleStatus.50:-->idleModeOff(0)\n\
topoElementIdleStatus.51:-->idleModeOff(0)\n\
topoElementIdleStatus.52:-->idleModeOff(0)\n\
topoElementIdleStatus.53:-->idleModeOff(0)\n\
topoElementIdleStatus.54:-->idleModeOff(0)\n\
topoElementIdleStatus.55:-->idleModeOff(0)\n\
topoElementIdleStatus.56:-->idleModeOff(0)\n\
topoElementOfflineStatus.1:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.2:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.3:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.4:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.5:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.6:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.7:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.8:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.9:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.10:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.11:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.12:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.13:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.14:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.15:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.16:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.18:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.19:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.20:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.21:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.22:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.23:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.24:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.25:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.26:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.27:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.28:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.29:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.30:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.31:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.32:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.33:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.34:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.35:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.36:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.37:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.38:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.39:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.40:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.41:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.42:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.43:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.44:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.45:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.46:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.47:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.48:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.49:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.50:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.51:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.52:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.53:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.54:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.55:-->offlineStatusOnline(0)\n\
topoElementOfflineStatus.56:-->offlineStatusOnline(0)\n\
topoElementRid.1:-->RID Information\n\
 Additional Rid info\n\
 Commercial ref:  \n\
 Serial number:  RN07LGE\n\
 software version:  CP6000 02.60.02 C\n\
topoElementRid.2:-->No info available\n\
topoElementRid.3:-->RID Information\n\
 Additional Rid info\n\
 Commercial ref:  \n\
 Serial number:  RN07LG9\n\
 software version:  CP6000 02.60.02 C\n\
topoElementRid.4:-->No info available\n\
topoElementRid.5:-->No info available\n\
topoElementRid.6:-->No info available\n\
topoElementRid.7:-->RID Information\n\
 Additional Rid info\n\
 Commercial ref:  \n\
 Serial number:  RN07LG6\n\
 software version:  CP6000 02.60.02 C\n\
topoElementRid.8:-->No info available\n\
topoElementRid.9:-->No info available\n\
topoElementRid.10:-->No info available\n\
topoElementRid.11:-->RID Information\n\
 Additional Rid info\n\
 Commercial ref:  \n\
 Serial number:  RN07LG5\n\
 software version:  CP6000 02.60.02 C\n\
topoElementRid.12:-->No info available\n\
topoElementRid.13:-->No info available\n\
topoElementRid.14:-->No info available\n\
topoElementRid.15:-->No info available\n\
topoElementRid.16:-->RID Information\n\
 Additional Rid info\n\
 product number: N350HXMUAC\n\
 serial number (HP): CZ3334LTBK\n\
 software version: XMU_04.71.00\n\
 firmware version: XMU_FIRM_01.04.002_CG\n\
 Equipment info\n\
 Equipment type : Mediation Unit / Management System\n\
 Extended type : XMU\n\
 Chassis : 4\n\
 Additional Rid info\n\
 XMU platform\n\
 Number of serial ports : 0\n\
 Ethernet info\n\
 Default gateway : 10.1.114.1\n\
 Nb Ethernet ports : 2\n\
 Ethernet ports\n\
 Ethernet port : 0\n\
 MAC address : D8 9D 67 26 D2 48\n\
 IP address : 192.168.20.1\n\
 Netmask : 255.255.255.0\n\
 Ethernet port : 1\n\
 MAC address : D8 9D 67 26 D2 49\n\
 IP address : 10.1.114.102\n\
 Netmask : 255.255.255.0\n\
topoElementRid.18:-->No info available\n\
topoElementRid.19:-->RID Information\n\
 Additional Rid info\n\
 product number: N9030\n\
 serial number: RN07EEV\n\
 software version: 04.80.00.021 C\n\
 Software info\n\
 Nb softwares : 1\n\
 Software : 0\n\
 Package : 0\n\
 Status : 1\n\
 Version : 04.80.00.021 C\n\
 Equipment info\n\
 Equipment type : Multiplexor\n\
 Extended type : NetProcessor 9030\n\
 Chassis : 1\n\
 Additional Rid info\n\
 Main board : CRBF\n\
 Number of serial ports : 0\n\
 Board info\n\
 Base slot number : 0\n\
 nb Boards : 1\n\
 Boards\n\
 Slot number : 6\n\
 Board type declared : NFP_DSIB\n\
 Board type detected : NFP_DSIB\n\
 Additional Rid info\n\
 Board name : DSIB\n\
 Serial number : LV00ZIT\n\
 Option info\n\
 Device code : \n\
 nb Options : 1\n\
 Options\n\
 Option : 0\n\
 Option code : N903ST0XAA\n\
 Option type : 1\n\
 Option amount : 4\n\
 Ethernet info\n\
 Default gateway : 0.0.0.0\n\
 Nb Ethernet ports : 2\n\
 Ethernet ports\n\
 Ethernet port : 0\n\
 MAC address : 00 90 64 01 06 00\n\
 IP address : 0.0.0.6\n\
 Netmask : 255.255.255.240\n\
 Ethernet port : 1\n\
 MAC address : BC C2 3A 00 19 F5\n\
 IP address : 0.0.0.0\n\
 Netmask : 0.0.0.0\n\
topoElementRid.20:-->RID Information\n\
 Additional Rid info\n\
 product number: NEM40IN8AA\n\
 serial number: RN07NE6\n\
 software version: 02.51.00\n\
 Software info\n\
 Nb softwares : 1\n\
 Software : 0\n\
 Package : 0\n\
 Status : 1\n\
 Version : 02.51.00\n\
 Package : 1\n\
 Status : 2\n\
 Version : 02.50.01\n\
 Option info\n\
 Device code : \n\
 nb Options : 5\n\
 Options\n\
 Option : 0\n\
 Option code : NEMS4D0L:DD-DD+ stereo encoding (one 2.0)\n\
 Option type : 1\n\
 Option amount : 19\n\
 Option : 1\n\
 Option code : NEMS4D51:DD-DD+ surround encoding (one 5.1 or three 2.0)\n\
 Option type : 1\n\
 Option amount : 2\n\
 Option : 2\n\
 Option code : NEMS4FLE:Flextream btw equipment located on the same site\n\
 Option type : 1\n\
 Option amount : 7\n\
 Option : 3\n\
 Option code : NEMS4H2A:HD MPEG2 encoding\n\
 Option type : 1\n\
 Option amount : 2\n\
 Option : 4\n\
 Option code : NEMS4S2A:SD MPEG2 encoding\n\
 Option type : 1\n\
 Option amount : 5\n\
 Ethernet info\n\
 Default gateway : 10.1.114.1\n\
 Nb Ethernet ports : 3\n\
 Ethernet ports\n\
 Ethernet port : 0\n\
 MAC address : 00 25 90 A3 74 D2\n\
 IP address : 10.1.114.12\n\
 Netmask : 255.255.255.0\n\
 Ethernet port : 1\n\
 MAC address : 68 05 CA 18 14 16\n\
 IP address : 10.1.113.12\n\
 Netmask : 255.255.255.0\n\
 Ethernet port : 2\n\
 MAC address : 68 05 CA 18 14 17\n\
 IP address : 10.1.113.13\n\
 Netmask : 255.255.255.0\n\
topoElementRid.21:-->RID Information\n\
 Additional Rid info\n\
 product number: NEM40IN8AA\n\
 serial number: RN07NE4\n\
 software version: 02.51.00\n\
 Software info\n\
 Nb softwares : 1\n\
 Software : 0\n\
 Package : 0\n\
 Status : 1\n\
 Version : 02.51.00\n\
 Package : 1\n\
 Status : 2\n\
 Version : 02.50.01\n\
 Option info\n\
 Device code : \n\
 nb Options : 5\n\
 Options\n\
 Option : 0\n\
 Option code : NEMS4D0L:DD-DD+ stereo encoding (one 2.0)\n\
 Option type : 1\n\
 Option amount : 12\n\
 Option : 1\n\
 Option code : NEMS4D51:DD-DD+ surround encoding (one 5.1 or three 2.0)\n\
 Option type : 1\n\
 Option amount : 3\n\
 Option : 2\n\
 Option code : NEMS4FLE:Flextream btw equipment located on the same site\n\
 Option type : 1\n\
 Option amount : 4\n\
 Option : 3\n\
 Option code : NEMS4H2A:HD MPEG2 encoding\n\
 Option type : 1\n\
 Option amount : 3\n\
 Option : 4\n\
 Option code : NEMS4S2A:SD MPEG2 encoding\n\
 Option type : 1\n\
 Option amount : 2\n\
 Ethernet info\n\
 Default gateway : 10.1.114.1\n\
 Nb Ethernet ports : 3\n\
 Ethernet ports\n\
 Ethernet port : 0\n\
 MAC address : 00 25 90 A3 74 A8\n\
 IP address : 10.1.114.13\n\
 Netmask : 255.255.255.0\n\
 Ethernet port : 1\n\
 MAC address : 68 05 CA 18 14 22\n\
 IP address : 10.1.113.14\n\
 Netmask : 255.255.255.0\n\
 Ethernet port : 2\n\
 MAC address : 68 05 CA 18 14 23\n\
 IP address : 10.1.113.15\n\
 Netmask : 255.255.255.0\n\
topoElementRid.22:-->RID Information\n\
 Additional Rid info\n\
 product number: NEM40IN8AA\n\
 serial number: RN07NE9\n\
 software version: 02.51.00\n\
 Software info\n\
 Nb softwares : 1\n\
 Software : 0\n\
 Package : 0\n\
 Status : 1\n\
 Version : 02.51.00\n\
 Package : 1\n\
 Status : 2\n\
 Version : 02.50.01\n\
 Option info\n\
 Device code : \n\
 nb Options : 5\n\
 Options\n\
 Option : 0\n\
 Option code : NEMS4D0L:DD-DD+ stereo encoding (one 2.0)\n\
 Option type : 1\n\
 Option amount : 22\n\
 Option : 1\n\
 Option code : NEMS4D51:DD-DD+ surround encoding (one 5.1 or three 2.0)\n\
 Option type : 1\n\
 Option amount : 2\n\
 Option : 2\n\
 Option code : NEMS4FLE:Flextream btw equipment located on the same site\n\
 Option type : 1\n\
 Option amount : 8\n\
 Option : 3\n\
 Option code : NEMS4H2A:HD MPEG2 encoding\n\
 Option type : 1\n\
 Option amount : 2\n\
 Option : 4\n\
 Option code : NEMS4S2A:SD MPEG2 encoding\n\
 Option type : 1\n\
 Option amount : 6\n\
 Ethernet info\n\
 Default gateway : 10.1.114.1\n\
 Nb Ethernet ports : 3\n\
 Ethernet ports\n\
 Ethernet port : 0\n\
 MAC address : 00 25 90 A3 75 7C\n\
 IP address : 10.1.114.14\n\
 Netmask : 255.255.255.0\n\
 Ethernet port : 1\n\
 MAC address : 68 05 CA 18 15 46\n\
 IP address : 10.1.113.16\n\
 Netmask : 255.255.255.0\n\
 Ethernet port : 2\n\
 MAC address : 68 05 CA 18 15 47\n\
 IP address : 10.1.113.17\n\
 Netmask : 255.255.255.0\n\
topoElementRid.23:-->No info available\n\
topoElementRid.24:-->RID Information\n\
 Additional Rid info\n\
 product number: NEM40IN8AA\n\
 serial number: RN07NE7\n\
 software version: 02.51.00\n\
 Software info\n\
 Nb softwares : 1\n\
 Software : 0\n\
 Package : 0\n\
 Status : 1\n\
 Version : 02.51.00\n\
 Package : 1\n\
 Status : 2\n\
 Version : 02.50.01\n\
 Option info\n\
 Device code : \n\
 nb Options : 5\n\
 Options\n\
 Option : 0\n\
 Option code : NEMS4D0L:DD-DD+ stereo encoding (one 2.0)\n\
 Option type : 1\n\
 Option amount : 19\n\
 Option : 1\n\
 Option code : NEMS4D51:DD-DD+ surround encoding (one 5.1 or three 2.0)\n\
 Option type : 1\n\
 Option amount : 2\n\
 Option : 2\n\
 Option code : NEMS4FLE:Flextream btw equipment located on the same site\n\
 Option type : 1\n\
 Option amount : 7\n\
 Option : 3\n\
 Option code : NEMS4H2A:HD MPEG2 encoding\n\
 Option type : 1\n\
 Option amount : 2\n\
 Option : 4\n\
 Option code : NEMS4S2A:SD MPEG2 encoding\n\
 Option type : 1\n\
 Option amount : 5\n\
 Ethernet info\n\
 Default gateway : 10.1.114.1\n\
 Nb Ethernet ports : 3\n\
 Ethernet ports\n\
 Ethernet port : 0\n\
 MAC address : 00 25 90 A6 18 1C\n\
 IP address : 10.1.114.15\n\
 Netmask : 255.255.255.0\n\
 Ethernet port : 1\n\
 MAC address : 68 05 CA 14 28 76\n\
 IP address : 10.1.113.18\n\
 Netmask : 255.255.255.0\n\
 Ethernet port : 2\n\
 MAC address : 68 05 CA 14 28 77\n\
 IP address : 10.1.113.19\n\
 Netmask : 255.255.255.0\n\
topoElementRid.25:-->RID Information\n\
 Additional Rid info\n\
 product number: NEM40IN8AA\n\
 serial number: RN07NE5\n\
 software version: 02.51.00\n\
 Software info\n\
 Nb softwares : 1\n\
 Software : 0\n\
 Package : 0\n\
 Status : 1\n\
 Version : 02.51.00\n\
 Package : 1\n\
 Status : 2\n\
 Version : 02.50.01\n\
 Option info\n\
 Device code : \n\
 nb Options : 5\n\
 Options\n\
 Option : 0\n\
 Option code : NEMS4D0L:DD-DD+ stereo encoding (one 2.0)\n\
 Option type : 1\n\
 Option amount : 16\n\
 Option : 1\n\
 Option code : NEMS4D51:DD-DD+ surround encoding (one 5.1 or three 2.0)\n\
 Option type : 1\n\
 Option amount : 2\n\
 Option : 2\n\
 Option code : NEMS4FLE:Flextream btw equipment located on the same site\n\
 Option type : 1\n\
 Option amount : 6\n\
 Option : 3\n\
 Option code : NEMS4H2A:HD MPEG2 encoding\n\
 Option type : 1\n\
 Option amount : 2\n\
 Option : 4\n\
 Option code : NEMS4S2A:SD MPEG2 encoding\n\
 Option type : 1\n\
 Option amount : 4\n\
 Ethernet info\n\
 Default gateway : 10.1.114.1\n\
 Nb Ethernet ports : 3\n\
 Ethernet ports\n\
 Ethernet port : 0\n\
 MAC address : 00 25 90 A3 74 4E\n\
 IP address : 10.1.114.11\n\
 Netmask : 255.255.255.0\n\
 Ethernet port : 1\n\
 MAC address : 68 05 CA 18 15 44\n\
 IP address : 10.1.113.10\n\
 Netmask : 255.255.255.0\n\
 Ethernet port : 2\n\
 MAC address : 68 05 CA 18 15 45\n\
 IP address : 10.1.113.11\n\
 Netmask : 255.255.255.0\n\
topoElementRid.26:-->RID Information\n\
 Additional Rid info\n\
 product number: N9030\n\
 serial number: RN07EES\n\
 software version: 04.80.00.021 C\n\
 Software info\n\
 Nb softwares : 1\n\
 Software : 0\n\
 Package : 0\n\
 Status : 1\n\
 Version : 04.80.00.021 C\n\
 Equipment info\n\
 Equipment type : Multiplexor\n\
 Extended type : NetProcessor 9030\n\
 Chassis : 1\n\
 Additional Rid info\n\
 Main board : CRBF\n\
 Number of serial ports : 0\n\
 Board info\n\
 Base slot number : 0\n\
 nb Boards : 1\n\
 Boards\n\
 Slot number : 6\n\
 Board type declared : NFP_DSIB\n\
 Board type detected : NFP_DSIB\n\
 Additional Rid info\n\
 Board name : DSIB\n\
 Serial number : LV00ZIK\n\
 Option info\n\
 Device code : \n\
 nb Options : 1\n\
 Options\n\
 Option : 0\n\
 Option code : N903ST0XAA\n\
 Option type : 1\n\
 Option amount : 4\n\
 Ethernet info\n\
 Default gateway : 0.0.0.0\n\
 Nb Ethernet ports : 2\n\
 Ethernet ports\n\
 Ethernet port : 0\n\
 MAC address : 00 90 64 01 06 00\n\
 IP address : 0.0.0.6\n\
 Netmask : 255.255.255.240\n\
 Ethernet port : 1\n\
 MAC address : BC C2 3A 00 19 D6\n\
 IP address : 10.13.113.58\n\
 Netmask : 255.255.255.0\n\
topoElementRid.27:-->RID Information\n\
 Additional Rid info\n\
 product number: N9030\n\
 serial number: RN07EEY\n\
 software version: 04.80.00.021 C\n\
 Software info\n\
 Nb softwares : 1\n\
 Software : 0\n\
 Package : 0\n\
 Status : 1\n\
 Version : 04.80.00.021 C\n\
 Equipment info\n\
 Equipment type : Multiplexor\n\
 Extended type : NetProcessor 9030\n\
 Chassis : 1\n\
 Additional Rid info\n\
 Main board : CRBF\n\
 Number of serial ports : 0\n\
 Board info\n\
 Base slot number : 0\n\
 nb Boards : 1\n\
 Boards\n\
 Slot number : 6\n\
 Board type declared : NFP_DSIB\n\
 Board type detected : NFP_DSIB\n\
 Additional Rid info\n\
 Board name : DSIB\n\
 Serial number : LV00ZJ1\n\
 Option info\n\
 Device code : \n\
 nb Options : 1\n\
 Options\n\
 Option : 0\n\
 Option code : N903ST0XAA\n\
 Option type : 1\n\
 Option amount : 4\n\
 Ethernet info\n\
 Default gateway : 0.0.0.0\n\
 Nb Ethernet ports : 2\n\
 Ethernet ports\n\
 Ethernet port : 0\n\
 MAC address : 00 90 64 01 06 00\n\
 IP address : 0.0.0.6\n\
 Netmask : 255.255.255.240\n\
 Ethernet port : 1\n\
 MAC address : BC C2 3A 00 19 C6\n\
 IP address : 10.1.113.54\n\
 Netmask : 255.255.255.0\n\
topoElementRid.28:-->RID Information\n\
 Additional Rid info\n\
 product number: NEM40IN8AA\n\
 serial number: RN07NE8\n\
 software version: 02.51.00\n\
 Software info\n\
 Nb softwares : 1\n\
 Software : 0\n\
 Package : 0\n\
 Status : 1\n\
 Version : 02.51.00\n\
 Package : 1\n\
 Status : 2\n\
 Version : 02.50.01\n\
 Option info\n\
 Device code : \n\
 nb Options : 5\n\
 Options\n\
 Option : 0\n\
 Option code : NEMS4D0L:DD-DD+ stereo encoding (one 2.0)\n\
 Option type : 1\n\
 Option amount : 24\n\
 Option : 1\n\
 Option code : NEMS4D51:DD-DD+ surround encoding (one 5.1 or three 2.0)\n\
 Option type : 1\n\
 Option amount : 3\n\
 Option : 2\n\
 Option code : NEMS4FLE:Flextream btw equipment located on the same site\n\
 Option type : 1\n\
 Option amount : 8\n\
 Option : 3\n\
 Option code : NEMS4H2A:HD MPEG2 encoding\n\
 Option type : 1\n\
 Option amount : 3\n\
 Option : 4\n\
 Option code : NEMS4S2A:SD MPEG2 encoding\n\
 Option type : 1\n\
 Option amount : 6\n\
 Ethernet info\n\
 Default gateway : 10.1.114.1\n\
 Nb Ethernet ports : 3\n\
 Ethernet ports\n\
 Ethernet port : 0\n\
 MAC address : 00 25 90 A3 76 CA\n\
 IP address : 10.1.114.16\n\
 Netmask : 255.255.255.0\n\
 Ethernet port : 1\n\
 MAC address : 68 05 CA 14 2B 36\n\
 IP address : 10.1.113.20\n\
 Netmask : 255.255.255.0\n\
 Ethernet port : 2\n\
 MAC address : 68 05 CA 14 2B 37\n\
 IP address : 10.1.113.21\n\
 Netmask : 255.255.255.0\n\
topoElementRid.29:-->RID Information\n\
 Additional Rid info\n\
 Commercial ref:  AM3-BASE-FULL : Amethyst III base unit (with full front panel)\n\
 Product number:  NAMBFULLAA\n\
 Serial number:  RN07NDA\n\
 software version:  02.20.01\n\
topoElementRid.30:-->RID Information\n\
 Additional Rid info\n\
 Commercial ref:  \n\
 Serial number:  RN07LG8\n\
 software version:  CP6000 02.60.02 C\n\
topoElementRid.31:-->No info available\n\
topoElementRid.32:-->No info available\n\
topoElementRid.33:-->RID Information\n\
 Additional Rid info\n\
 Commercial ref:  AM3-BASE-FULL : Amethyst III base unit (with full front panel)\n\
 Product number:  NAMBFULLAA\n\
 Serial number:  RN07F2S\n\
 software version:  02.20.01\n\
topoElementRid.34:-->RID Information\n\
 Additional Rid info\n\
 Product number:  N9040\n\
 Serial number:  RN07EF1\n\
 software version:  04.80.00.021 C\n\
topoElementRid.35:-->No info available\n\
topoElementRid.36:-->RID Information\n\
 Additional Rid info\n\
 Commercial ref:  AM3-BASE-FULL : Amethyst III base unit (with full front panel)\n\
 Product number:  NAMBFULLAA\n\
 Serial number:  RN06VWN\n\
 software version:  02.20.01\n\
topoElementRid.37:-->RID Information\n\
 Additional Rid info\n\
 Commercial ref:  AM3-BASE-FULL : Amethyst III base unit (with full front panel)\n\
 Product number:  NAMBFULLAA\n\
 Serial number:  RN07ND6\n\
 software version:  02.20.01\n\
topoElementRid.38:-->No info available\n\
topoElementRid.39:-->No info available\n\
topoElementRid.40:-->No info available\n\
topoElementRid.41:-->No info available\n\
topoElementRid.42:-->No info available\n\
topoElementRid.43:-->RID Information\n\
 Additional Rid info\n\
 software version: 2.6.3\n\
topoElementRid.44:-->No info available\n\
topoElementRid.45:-->RID Information\n\
 Additional Rid info\n\
 Commercial ref:  \n\
 Serial number:  RN07LGA\n\
 software version:  CP6000 02.60.02 C\n\
topoElementRid.46:-->No info available\n\
topoElementRid.47:-->RID Information\n\
 Additional Rid info\n\
 Product number:  N9040\n\
 Serial number:  RN07EEF\n\
 software version:  04.80.00.021 C\n\
topoElementRid.48:-->No info available\n\
topoElementRid.49:-->No info available\n\
topoElementRid.50:-->No info available\n\
topoElementRid.51:-->No info available\n\
topoElementRid.52:-->No info available\n\
topoElementRid.53:-->No info available\n\
topoElementRid.54:-->No info available\n\
topoElementRid.55:-->No info available\n\
topoElementRid.56:-->No info available\n\
ipResourceIndex.1:-->1\n\
ipResourceIndex.2:-->2\n\
ipResourceIndex.3:-->3\n\
ipResourceIndex.4:-->4\n\
ipResourceIndex.5:-->5\n\
ipResourceIndex.6:-->6\n\
ipResourceIndex.7:-->7\n\
ipResourceIndex.8:-->8\n\
ipResourceIndex.9:-->9\n\
ipResourceIndex.10:-->10\n\
ipResourceIndex.11:-->11\n\
ipResourceIndex.12:-->12\n\
ipResourceIndex.13:-->13\n\
ipResourceIndex.14:-->14\n\
ipResourceIndex.15:-->15\n\
ipResourceIndex.16:-->16\n\
ipResourceIndex.17:-->17\n\
ipResourceIndex.18:-->18\n\
ipResourceIndex.19:-->19\n\
ipResourceIndex.20:-->20\n\
ipResourceIndex.21:-->21\n\
ipResourceIndex.22:-->22\n\
ipResourceIndex.23:-->23\n\
ipResourceIndex.24:-->24\n\
ipResourceIndex.25:-->25\n\
ipResourceIndex.26:-->26\n\
ipResourceIndex.27:-->27\n\
ipResourceIndex.28:-->28\n\
ipResourceIndex.29:-->29\n\
ipResourceIndex.30:-->30\n\
ipResourceIndex.31:-->31\n\
ipResourceIndex.32:-->32\n\
ipResourceIndex.33:-->33\n\
ipResourceIndex.34:-->34\n\
ipResourceIndex.35:-->35\n\
ipResourceIndex.36:-->36\n\
ipResourceIndex.37:-->37\n\
ipResourceIndex.38:-->38\n\
ipResourceIndex.39:-->39\n\
ipResourceIndex.40:-->40\n\
ipResourceIndex.41:-->41\n\
ipResourceIndex.42:-->42\n\
ipResourceIndex.43:-->43\n\
ipResourceIndex.44:-->44\n\
ipResourceIndex.45:-->45\n\
ipResourceIndex.46:-->46\n\
ipResourceIndex.47:-->47\n\
ipResourceIndex.48:-->48\n\
ipResourceIndex.49:-->49\n\
ipResourceIndex.50:-->50\n\
ipResourceIndex.51:-->51\n\
ipResourceIndex.52:-->52\n\
ipResourceIndex.53:-->53\n\
ipResourceIndex.54:-->54\n\
ipResourceIndex.55:-->55\n\
ipResourceIndex.56:-->56\n\
ipResourceIndex.57:-->57\n\
ipResourceIndex.58:-->58\n\
ipResourceIndex.59:-->59\n\
ipResourceIndex.60:-->60\n\
ipResourceIndex.61:-->61\n\
ipResourceIndex.62:-->62\n\
ipResourceIndex.63:-->63\n\
ipResourceIndex.64:-->64\n\
ipResourceIndex.65:-->65\n\
ipResourceIndex.66:-->66\n\
ipResourceIndex.67:-->67\n\
ipResourceIndex.68:-->68\n\
ipResourceIndex.69:-->69\n\
ipResourceIndex.70:-->70\n\
ipResourceIndex.71:-->71\n\
ipResourceIndex.72:-->72\n\
ipResourceIndex.73:-->73\n\
ipResourceIndex.74:-->74\n\
ipResourceIndex.75:-->75\n\
ipResourceIndex.76:-->76\n\
ipResourceIndex.77:-->77\n\
ipResourceIndex.78:-->78\n\
ipResourceIndex.79:-->79\n\
ipResourceIndex.80:-->80\n\
ipResourceIndex.81:-->81\n\
ipResourceIndex.82:-->82\n\
ipResourceIndex.83:-->83\n\
ipResourceIndex.84:-->84\n\
ipResourceIndex.85:-->85\n\
ipResourceIndex.86:-->86\n\
ipResourceIndex.87:-->87\n\
ipResourceIndex.88:-->88\n\
ipResourceIndex.89:-->89\n\
ipResourceIndex.90:-->90\n\
ipResourceIndex.91:-->91\n\
ipResourceIndex.92:-->92\n\
ipResourceIndex.93:-->93\n\
ipResourceIndex.94:-->94\n\
ipResourceIndex.95:-->95\n\
ipResourceIndex.96:-->96\n\
ipResourceIndex.97:-->97\n\
ipResourceIndex.98:-->98\n\
ipResourceIndex.99:-->99\n\
ipResourceIndex.100:-->100\n\
ipResourceIndex.101:-->101\n\
ipResourceIndex.102:-->102\n\
ipResourceIndex.103:-->103\n\
ipResourceIndex.104:-->104\n\
ipResourceIndex.105:-->105\n\
ipResourceIndex.106:-->106\n\
ipResourceIndex.107:-->107\n\
ipResourceIndex.108:-->108\n\
ipResourceIndex.109:-->109\n\
ipResourceIndex.110:-->110\n\
ipResourceIndex.111:-->111\n\
ipResourceIndex.112:-->112\n\
ipResourceIndex.113:-->113\n\
ipResourceElementIndex.1:-->0\n\
ipResourceElementIndex.2:-->16\n\
ipResourceElementIndex.3:-->28\n\
ipResourceElementIndex.4:-->28\n\
ipResourceElementIndex.5:-->28\n\
ipResourceElementIndex.6:-->19\n\
ipResourceElementIndex.7:-->18\n\
ipResourceElementIndex.8:-->24\n\
ipResourceElementIndex.9:-->24\n\
ipResourceElementIndex.10:-->24\n\
ipResourceElementIndex.11:-->22\n\
ipResourceElementIndex.12:-->22\n\
ipResourceElementIndex.13:-->22\n\
ipResourceElementIndex.14:-->21\n\
ipResourceElementIndex.15:-->21\n\
ipResourceElementIndex.16:-->21\n\
ipResourceElementIndex.17:-->20\n\
ipResourceElementIndex.18:-->20\n\
ipResourceElementIndex.19:-->20\n\
ipResourceElementIndex.20:-->25\n\
ipResourceElementIndex.21:-->25\n\
ipResourceElementIndex.22:-->25\n\
ipResourceElementIndex.23:-->26\n\
ipResourceElementIndex.24:-->26\n\
ipResourceElementIndex.25:-->26\n\
ipResourceElementIndex.26:-->26\n\
ipResourceElementIndex.27:-->26\n\
ipResourceElementIndex.28:-->27\n\
ipResourceElementIndex.29:-->27\n\
ipResourceElementIndex.30:-->27\n\
ipResourceElementIndex.31:-->27\n\
ipResourceElementIndex.32:-->27\n\
ipResourceElementIndex.33:-->45\n\
ipResourceElementIndex.34:-->49\n\
ipResourceElementIndex.35:-->49\n\
ipResourceElementIndex.36:-->49\n\
ipResourceElementIndex.37:-->49\n\
ipResourceElementIndex.38:-->49\n\
ipResourceElementIndex.39:-->50\n\
ipResourceElementIndex.40:-->50\n\
ipResourceElementIndex.41:-->50\n\
ipResourceElementIndex.42:-->50\n\
ipResourceElementIndex.43:-->50\n\
ipResourceElementIndex.44:-->47\n\
ipResourceElementIndex.45:-->34\n\
ipResourceElementIndex.46:-->3\n\
ipResourceElementIndex.47:-->7\n\
ipResourceElementIndex.48:-->11\n\
ipResourceElementIndex.49:-->36\n\
ipResourceElementIndex.50:-->1\n\
ipResourceElementIndex.51:-->43\n\
ipResourceElementIndex.52:-->37\n\
ipResourceElementIndex.53:-->48\n\
ipResourceElementIndex.54:-->46\n\
ipResourceElementIndex.55:-->33\n\
ipResourceElementIndex.56:-->29\n\
ipResourceElementIndex.57:-->30\n\
ipResourceElementIndex.58:-->50\n\
ipResourceElementIndex.59:-->26\n\
ipResourceElementIndex.60:-->27\n\
ipResourceElementIndex.61:-->26\n\
ipResourceElementIndex.62:-->49\n\
ipResourceElementIndex.63:-->49\n\
ipResourceElementIndex.64:-->26\n\
ipResourceElementIndex.65:-->49\n\
ipResourceElementIndex.66:-->49\n\
ipResourceElementIndex.67:-->26\n\
ipResourceElementIndex.68:-->26\n\
ipResourceElementIndex.69:-->27\n\
ipResourceElementIndex.70:-->27\n\
ipResourceElementIndex.71:-->25\n\
ipResourceElementIndex.72:-->24\n\
ipResourceElementIndex.73:-->50\n\
ipResourceElementIndex.74:-->49\n\
ipResourceElementIndex.75:-->27\n\
ipResourceElementIndex.76:-->49\n\
ipResourceElementIndex.77:-->27\n\
ipResourceElementIndex.78:-->27\n\
ipResourceElementIndex.79:-->26\n\
ipResourceElementIndex.80:-->50\n\
ipResourceElementIndex.81:-->50\n\
ipResourceElementIndex.82:-->27\n\
ipResourceElementIndex.83:-->27\n\
ipResourceElementIndex.84:-->27\n\
ipResourceElementIndex.85:-->49\n\
ipResourceElementIndex.86:-->28\n\
ipResourceElementIndex.87:-->20\n\
ipResourceElementIndex.88:-->21\n\
ipResourceElementIndex.89:-->22\n\
ipResourceElementIndex.90:-->21\n\
ipResourceElementIndex.91:-->22\n\
ipResourceElementIndex.92:-->49\n\
ipResourceElementIndex.93:-->26\n\
ipResourceElementIndex.94:-->26\n\
ipResourceElementIndex.95:-->27\n\
ipResourceElementIndex.96:-->49\n\
ipResourceElementIndex.97:-->24\n\
ipResourceElementIndex.98:-->49\n\
ipResourceElementIndex.99:-->50\n\
ipResourceElementIndex.100:-->50\n\
ipResourceElementIndex.101:-->50\n\
ipResourceElementIndex.102:-->20\n\
ipResourceElementIndex.103:-->50\n\
ipResourceElementIndex.104:-->50\n\
ipResourceElementIndex.105:-->25\n\
ipResourceElementIndex.106:-->26\n\
ipResourceElementIndex.107:-->50\n\
ipResourceElementIndex.108:-->26\n\
ipResourceElementIndex.109:-->28\n\
ipResourceElementIndex.110:-->49\n\
ipResourceElementIndex.111:-->50\n\
ipResourceElementIndex.112:-->49\n\
ipResourceElementIndex.113:-->50\n\
ipResourceElementName.1:-->XMS Server\n\
ipResourceElementName.2:-->NOC_XMU\n\
ipResourceElementName.3:-->NOC_EM4000_BU\n\
ipResourceElementName.4:-->NOC_EM4000_BU\n\
ipResourceElementName.5:-->NOC_EM4000_BU\n\
ipResourceElementName.6:-->NOC_MUX_BU\n\
ipResourceElementName.7:-->NOC_NVision_Router\n\
ipResourceElementName.8:-->NOC_EM4000_05\n\
ipResourceElementName.9:-->NOC_EM4000_05\n\
ipResourceElementName.10:-->NOC_EM4000_05\n\
ipResourceElementName.11:-->NOC_EM4000_04\n\
ipResourceElementName.12:-->NOC_EM4000_04\n\
ipResourceElementName.13:-->NOC_EM4000_04\n\
ipResourceElementName.14:-->NOC_EM4000_03\n\
ipResourceElementName.15:-->NOC_EM4000_03\n\
ipResourceElementName.16:-->NOC_EM4000_03\n\
ipResourceElementName.17:-->NOC_EM4000_02\n\
ipResourceElementName.18:-->NOC_EM4000_02\n\
ipResourceElementName.19:-->NOC_EM4000_02\n\
ipResourceElementName.20:-->NOC_EM4000_01\n\
ipResourceElementName.21:-->NOC_EM4000_01\n\
ipResourceElementName.22:-->NOC_EM4000_01\n\
ipResourceElementName.23:-->NOC_MUX_02\n\
ipResourceElementName.24:-->NOC_MUX_02\n\
ipResourceElementName.25:-->NOC_MUX_02\n\
ipResourceElementName.26:-->NOC_MUX_02\n\
ipResourceElementName.27:-->NOC_MUX_02\n\
ipResourceElementName.28:-->NOC_MUX_01\n\
ipResourceElementName.29:-->NOC_MUX_01\n\
ipResourceElementName.30:-->NOC_MUX_01\n\
ipResourceElementName.31:-->NOC_MUX_01\n\
ipResourceElementName.32:-->NOC_MUX_01\n\
ipResourceElementName.33:-->WPBA_CP6000_01\n\
ipResourceElementName.34:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.35:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.36:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.37:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.38:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.39:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.40:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.41:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.42:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.43:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.44:-->WPBA_MUX_01\n\
ipResourceElementName.45:-->WJCT_MUX_01\n\
ipResourceElementName.46:-->NOC_CP6000_03\n\
ipResourceElementName.47:-->NOC_CP6000_02\n\
ipResourceElementName.48:-->NOC_CP6000_01\n\
ipResourceElementName.49:-->NOC_Amethyst_02\n\
ipResourceElementName.50:-->WJCT_CP6000_01\n\
ipResourceElementName.51:-->NOC_Nevion_Switch\n\
ipResourceElementName.52:-->NOC_Amethyst_01\n\
ipResourceElementName.53:-->WJCT_Sapphire\n\
ipResourceElementName.54:-->WPBA_Sapphire\n\
ipResourceElementName.55:-->WPBA_Amethyst_01\n\
ipResourceElementName.56:-->WJCT_Amethyst_01\n\
ipResourceElementName.57:-->NOC_CP6000_BU\n\
ipResourceElementName.58:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.59:-->NOC_MUX_02\n\
ipResourceElementName.60:-->NOC_MUX_01\n\
ipResourceElementName.61:-->NOC_MUX_02\n\
ipResourceElementName.62:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.63:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.64:-->NOC_MUX_02\n\
ipResourceElementName.65:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.66:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.67:-->NOC_MUX_02\n\
ipResourceElementName.68:-->NOC_MUX_02\n\
ipResourceElementName.69:-->NOC_MUX_01\n\
ipResourceElementName.70:-->NOC_MUX_01\n\
ipResourceElementName.71:-->NOC_EM4000_01\n\
ipResourceElementName.72:-->NOC_EM4000_05\n\
ipResourceElementName.73:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.74:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.75:-->NOC_MUX_01\n\
ipResourceElementName.76:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.77:-->NOC_MUX_01\n\
ipResourceElementName.78:-->NOC_MUX_01\n\
ipResourceElementName.79:-->NOC_MUX_02\n\
ipResourceElementName.80:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.81:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.82:-->NOC_MUX_01\n\
ipResourceElementName.83:-->NOC_MUX_01\n\
ipResourceElementName.84:-->NOC_MUX_01\n\
ipResourceElementName.85:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.86:-->NOC_EM4000_BU\n\
ipResourceElementName.87:-->NOC_EM4000_02\n\
ipResourceElementName.88:-->NOC_EM4000_03\n\
ipResourceElementName.89:-->NOC_EM4000_04\n\
ipResourceElementName.90:-->NOC_EM4000_03\n\
ipResourceElementName.91:-->NOC_EM4000_04\n\
ipResourceElementName.92:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.93:-->NOC_MUX_02\n\
ipResourceElementName.94:-->NOC_MUX_02\n\
ipResourceElementName.95:-->NOC_MUX_01\n\
ipResourceElementName.96:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.97:-->NOC_EM4000_05\n\
ipResourceElementName.98:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.99:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.100:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.101:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.102:-->NOC_EM4000_02\n\
ipResourceElementName.103:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.104:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.105:-->NOC_EM4000_01\n\
ipResourceElementName.106:-->NOC_MUX_02\n\
ipResourceElementName.107:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.108:-->NOC_MUX_02\n\
ipResourceElementName.109:-->NOC_EM4000_BU\n\
ipResourceElementName.110:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.111:-->NOC_IP_SWITCH_MAIN\n\
ipResourceElementName.112:-->NOC_IP_SWITCH_BU\n\
ipResourceElementName.113:-->NOC_IP_SWITCH_MAIN\n\
ipResourceNetwork.1:-->Control\n\
ipResourceNetwork.2:-->Control\n\
ipResourceNetwork.3:-->Control\n\
ipResourceNetwork.4:-->Data\n\
ipResourceNetwork.5:-->Data\n\
ipResourceNetwork.6:-->Control\n\
ipResourceNetwork.7:-->Control\n\
ipResourceNetwork.8:-->Control\n\
ipResourceNetwork.9:-->Data\n\
ipResourceNetwork.10:-->Data\n\
ipResourceNetwork.11:-->Control\n\
ipResourceNetwork.12:-->Data\n\
ipResourceNetwork.13:-->Data\n\
ipResourceNetwork.14:-->Control\n\
ipResourceNetwork.15:-->Data\n\
ipResourceNetwork.16:-->Data\n\
ipResourceNetwork.17:-->Control\n\
ipResourceNetwork.18:-->Data\n\
ipResourceNetwork.19:-->Data\n\
ipResourceNetwork.20:-->Control\n\
ipResourceNetwork.21:-->Data\n\
ipResourceNetwork.22:-->Data\n\
ipResourceNetwork.23:-->Control\n\
ipResourceNetwork.24:-->Data\n\
ipResourceNetwork.25:-->Data\n\
ipResourceNetwork.26:-->Data\n\
ipResourceNetwork.27:-->Data\n\
ipResourceNetwork.28:-->Control\n\
ipResourceNetwork.29:-->Data\n\
ipResourceNetwork.30:-->Data\n\
ipResourceNetwork.31:-->Data\n\
ipResourceNetwork.32:-->Data\n\
ipResourceNetwork.33:-->Control\n\
ipResourceNetwork.34:-->Data\n\
ipResourceNetwork.35:-->Data\n\
ipResourceNetwork.36:-->Data\n\
ipResourceNetwork.37:-->Data\n\
ipResourceNetwork.38:-->Data\n\
ipResourceNetwork.39:-->Data\n\
ipResourceNetwork.40:-->Data\n\
ipResourceNetwork.41:-->Data\n\
ipResourceNetwork.42:-->Data\n\
ipResourceNetwork.43:-->Data\n\
ipResourceNetwork.44:-->Control\n\
ipResourceNetwork.45:-->Control\n\
ipResourceNetwork.46:-->Control\n\
ipResourceNetwork.47:-->Control\n\
ipResourceNetwork.48:-->Control\n\
ipResourceNetwork.49:-->Control\n\
ipResourceNetwork.50:-->Control\n\
ipResourceNetwork.51:-->Control\n\
ipResourceNetwork.52:-->Control\n\
ipResourceNetwork.53:-->Control\n\
ipResourceNetwork.54:-->Control\n\
ipResourceNetwork.55:-->Control\n\
ipResourceNetwork.56:-->Control\n\
ipResourceNetwork.57:-->Control\n\
ipResourceNetwork.58:-->Data\n\
ipResourceNetwork.59:-->Data\n\
ipResourceNetwork.60:-->Data\n\
ipResourceNetwork.61:-->Data\n\
ipResourceNetwork.62:-->Data\n\
ipResourceNetwork.63:-->Data\n\
ipResourceNetwork.64:-->Data\n\
ipResourceNetwork.65:-->Data\n\
ipResourceNetwork.66:-->Data\n\
ipResourceNetwork.67:-->Data\n\
ipResourceNetwork.68:-->Data\n\
ipResourceNetwork.69:-->Data\n\
ipResourceNetwork.70:-->Data\n\
ipResourceNetwork.71:-->Data\n\
ipResourceNetwork.72:-->Data\n\
ipResourceNetwork.73:-->Data\n\
ipResourceNetwork.74:-->Data\n\
ipResourceNetwork.75:-->Data\n\
ipResourceNetwork.76:-->Data\n\
ipResourceNetwork.77:-->Data\n\
ipResourceNetwork.78:-->Data\n\
ipResourceNetwork.79:-->Data\n\
ipResourceNetwork.80:-->Data\n\
ipResourceNetwork.81:-->Data\n\
ipResourceNetwork.82:-->Data\n\
ipResourceNetwork.83:-->Data\n\
ipResourceNetwork.84:-->Data\n\
ipResourceNetwork.85:-->Data\n\
ipResourceNetwork.86:-->Data\n\
ipResourceNetwork.87:-->Data\n\
ipResourceNetwork.88:-->Data\n\
ipResourceNetwork.89:-->Data\n\
ipResourceNetwork.90:-->Data\n\
ipResourceNetwork.91:-->Data\n\
ipResourceNetwork.92:-->Data\n\
ipResourceNetwork.93:-->Data\n\
ipResourceNetwork.94:-->Data\n\
ipResourceNetwork.95:-->Data\n\
ipResourceNetwork.96:-->Data\n\
ipResourceNetwork.97:-->Data\n\
ipResourceNetwork.98:-->Data\n\
ipResourceNetwork.99:-->Data\n\
ipResourceNetwork.100:-->Data\n\
ipResourceNetwork.101:-->Data\n\
ipResourceNetwork.102:-->Data\n\
ipResourceNetwork.103:-->Data\n\
ipResourceNetwork.104:-->Data\n\
ipResourceNetwork.105:-->Data\n\
ipResourceNetwork.106:-->Data\n\
ipResourceNetwork.107:-->Data\n\
ipResourceNetwork.108:-->Data\n\
ipResourceNetwork.109:-->Data\n\
ipResourceNetwork.110:-->Data\n\
ipResourceNetwork.111:-->Data\n\
ipResourceNetwork.112:-->Data\n\
ipResourceNetwork.113:-->Data\n\
ipResourceType.1:-->Physical interface\n\
ipResourceType.2:-->Physical interface\n\
ipResourceType.3:-->Physical interface\n\
ipResourceType.4:-->Physical interface\n\
ipResourceType.5:-->Physical interface\n\
ipResourceType.6:-->Physical interface\n\
ipResourceType.7:-->Physical interface\n\
ipResourceType.8:-->Physical interface\n\
ipResourceType.9:-->Physical interface\n\
ipResourceType.10:-->Physical interface\n\
ipResourceType.11:-->Physical interface\n\
ipResourceType.12:-->Physical interface\n\
ipResourceType.13:-->Physical interface\n\
ipResourceType.14:-->Physical interface\n\
ipResourceType.15:-->Physical interface\n\
ipResourceType.16:-->Physical interface\n\
ipResourceType.17:-->Physical interface\n\
ipResourceType.18:-->Physical interface\n\
ipResourceType.19:-->Physical interface\n\
ipResourceType.20:-->Physical interface\n\
ipResourceType.21:-->Physical interface\n\
ipResourceType.22:-->Physical interface\n\
ipResourceType.23:-->Physical interface\n\
ipResourceType.24:-->Physical interface\n\
ipResourceType.25:-->Physical interface\n\
ipResourceType.26:-->Physical interface\n\
ipResourceType.27:-->Physical interface\n\
ipResourceType.28:-->Physical interface\n\
ipResourceType.29:-->Physical interface\n\
ipResourceType.30:-->Physical interface\n\
ipResourceType.31:-->Physical interface\n\
ipResourceType.32:-->Physical interface\n\
ipResourceType.33:-->Physical interface\n\
ipResourceType.34:-->Physical interface\n\
ipResourceType.35:-->Physical interface\n\
ipResourceType.36:-->Physical interface\n\
ipResourceType.37:-->Physical interface\n\
ipResourceType.38:-->Physical interface\n\
ipResourceType.39:-->Physical interface\n\
ipResourceType.40:-->Physical interface\n\
ipResourceType.41:-->Physical interface\n\
ipResourceType.42:-->Physical interface\n\
ipResourceType.43:-->Physical interface\n\
ipResourceType.44:-->Physical interface\n\
ipResourceType.45:-->Physical interface\n\
ipResourceType.46:-->Physical interface\n\
ipResourceType.47:-->Physical interface\n\
ipResourceType.48:-->Physical interface\n\
ipResourceType.49:-->Physical interface\n\
ipResourceType.50:-->Physical interface\n\
ipResourceType.51:-->Physical interface\n\
ipResourceType.52:-->Physical interface\n\
ipResourceType.53:-->Physical interface\n\
ipResourceType.54:-->Physical interface\n\
ipResourceType.55:-->Physical interface\n\
ipResourceType.56:-->Physical interface\n\
ipResourceType.57:-->Physical interface\n\
ipResourceType.58:-->Multicast group\n\
ipResourceType.59:-->Multicast group\n\
ipResourceType.60:-->Multicast group\n\
ipResourceType.61:-->Multicast group\n\
ipResourceType.62:-->Multicast group\n\
ipResourceType.63:-->Multicast group\n\
ipResourceType.64:-->Multicast group\n\
ipResourceType.65:-->Multicast group\n\
ipResourceType.66:-->Multicast group\n\
ipResourceType.67:-->Multicast group\n\
ipResourceType.68:-->Multicast group\n\
ipResourceType.69:-->Multicast group\n\
ipResourceType.70:-->Multicast group\n\
ipResourceType.71:-->Multicast group\n\
ipResourceType.72:-->Multicast group\n\
ipResourceType.73:-->Multicast group\n\
ipResourceType.74:-->Multicast group\n\
ipResourceType.75:-->Multicast group\n\
ipResourceType.76:-->Multicast group\n\
ipResourceType.77:-->Multicast group\n\
ipResourceType.78:-->Multicast group\n\
ipResourceType.79:-->Multicast group\n\
ipResourceType.80:-->Multicast group\n\
ipResourceType.81:-->Multicast group\n\
ipResourceType.82:-->Multicast group\n\
ipResourceType.83:-->Multicast group\n\
ipResourceType.84:-->Multicast group\n\
ipResourceType.85:-->Multicast group\n\
ipResourceType.86:-->Multicast group\n\
ipResourceType.87:-->Multicast group\n\
ipResourceType.88:-->Multicast group\n\
ipResourceType.89:-->Multicast group\n\
ipResourceType.90:-->Multicast group\n\
ipResourceType.91:-->Multicast group\n\
ipResourceType.92:-->Multicast group\n\
ipResourceType.93:-->Multicast group\n\
ipResourceType.94:-->Multicast group\n\
ipResourceType.95:-->Multicast group\n\
ipResourceType.96:-->Multicast group\n\
ipResourceType.97:-->Multicast group\n\
ipResourceType.98:-->Multicast group\n\
ipResourceType.99:-->Multicast group\n\
ipResourceType.100:-->Multicast group\n\
ipResourceType.101:-->Multicast group\n\
ipResourceType.102:-->Multicast group\n\
ipResourceType.103:-->Multicast group\n\
ipResourceType.104:-->Multicast group\n\
ipResourceType.105:-->Multicast group\n\
ipResourceType.106:-->Multicast group\n\
ipResourceType.107:-->Multicast group\n\
ipResourceType.108:-->Multicast group\n\
ipResourceType.109:-->Multicast group\n\
ipResourceType.110:-->Virtual interface\n\
ipResourceType.111:-->Virtual interface\n\
ipResourceType.112:-->Virtual interface\n\
ipResourceType.113:-->Virtual interface\n\
ipResourceLabel.1:-->C&C Eth\n\
ipResourceLabel.2:-->NIC2\n\
ipResourceLabel.3:-->CONTROL 1\n\
ipResourceLabel.4:-->GEth.OUT2\n\
ipResourceLabel.5:-->GEth.OUT1\n\
ipResourceLabel.6:-->CMD 1\n\
ipResourceLabel.7:-->C&C Eth\n\
ipResourceLabel.8:-->CONTROL 1\n\
ipResourceLabel.9:-->GEth.OUT2\n\
ipResourceLabel.10:-->GEth.OUT1\n\
ipResourceLabel.11:-->CONTROL 1\n\
ipResourceLabel.12:-->GEth.OUT2\n\
ipResourceLabel.13:-->GEth.OUT1\n\
ipResourceLabel.14:-->CONTROL 1\n\
ipResourceLabel.15:-->GEth.OUT2\n\
ipResourceLabel.16:-->GEth.OUT1\n\
ipResourceLabel.17:-->CONTROL 1\n\
ipResourceLabel.18:-->GEth.OUT2\n\
ipResourceLabel.19:-->GEth.OUT1\n\
ipResourceLabel.20:-->CONTROL 1\n\
ipResourceLabel.21:-->GEth.OUT2\n\
ipResourceLabel.22:-->GEth.OUT1\n\
ipResourceLabel.23:-->CMD 1\n\
ipResourceLabel.24:-->GEth.IN01/GEth.OUT01\n\
ipResourceLabel.25:-->GEth.IN02/GEth.OUT02\n\
ipResourceLabel.26:-->GEth.OUT03\n\
ipResourceLabel.27:-->GEth.OUT04\n\
ipResourceLabel.28:-->CMD 1\n\
ipResourceLabel.29:-->GEth.IN01/GEth.OUT01\n\
ipResourceLabel.30:-->GEth.IN02/GEth.OUT02\n\
ipResourceLabel.31:-->GEth.OUT03\n\
ipResourceLabel.32:-->GEth.OUT04\n\
ipResourceLabel.33:-->C&C Eth\n\
ipResourceLabel.34:-->GEth_OUT.1\n\
ipResourceLabel.35:-->GEth_OUT.2\n\
ipResourceLabel.36:-->GEth_IN.2\n\
ipResourceLabel.37:-->GEth_IN.3\n\
ipResourceLabel.38:-->GEth_IN.1\n\
ipResourceLabel.39:-->GEth_IN.2\n\
ipResourceLabel.40:-->GEth_OUT.2\n\
ipResourceLabel.41:-->GEth_OUT.1\n\
ipResourceLabel.42:-->GEth_IN.3\n\
ipResourceLabel.43:-->GEth_IN.1\n\
ipResourceLabel.44:-->CMD 1\n\
ipResourceLabel.45:-->CMD 1\n\
ipResourceLabel.46:-->C&C Eth\n\
ipResourceLabel.47:-->C&C Eth\n\
ipResourceLabel.48:-->C&C Eth\n\
ipResourceLabel.49:-->C&C Eth\n\
ipResourceLabel.50:-->C&C Eth\n\
ipResourceLabel.51:-->C&C Eth\n\
ipResourceLabel.52:-->C&C Eth\n\
ipResourceLabel.53:-->C&C Eth\n\
ipResourceLabel.54:-->C&C Eth\n\
ipResourceLabel.55:-->C&C Eth\n\
ipResourceLabel.56:-->C&C Eth\n\
ipResourceLabel.57:-->C&C Eth\n\
ipResourceLabel.58:-->Stream - KERA_SW_A\n\
ipResourceLabel.59:-->Stream - WILL_A\n\
ipResourceLabel.60:-->Stream - WTTW_B\n\
ipResourceLabel.61:-->Stream - WILL_B\n\
ipResourceLabel.62:-->Stream - WEDU_SW_B\n\
ipResourceLabel.63:-->Stream - WUCF_SW_B\n\
ipResourceLabel.64:-->Stream - WPBA_A\n\
ipResourceLabel.65:-->Stream - KERA_SW_B\n\
ipResourceLabel.66:-->Stream - WFSU_SW_B\n\
ipResourceLabel.67:-->Stream - WEFS_A\n\
ipResourceLabel.68:-->Stream - WPBA_B\n\
ipResourceLabel.69:-->Stream - WEDU_B\n\
ipResourceLabel.70:-->Stream - WTTW_A\n\
ipResourceLabel.71:-->Stream - Encoder_01B\n\
ipResourceLabel.72:-->Stream - Encoder_05A\n\
ipResourceLabel.73:-->Stream - WPBT_SW_A\n\
ipResourceLabel.74:-->Stream - WPBT_SW_B\n\
ipResourceLabel.75:-->Stream - KERA_A\n\
ipResourceLabel.76:-->Stream - WJCT_SW_B\n\
ipResourceLabel.77:-->Stream - WJCT_B\n\
ipResourceLabel.78:-->Stream - WPBT_A\n\
ipResourceLabel.79:-->Stream - WEFS_B\n\
ipResourceLabel.80:-->Stream - WUCF_SW_A\n\
ipResourceLabel.81:-->Stream - WTTW_SW_A\n\
ipResourceLabel.82:-->Stream - WPBT_B\n\
ipResourceLabel.83:-->Stream - WJCT_A\n\
ipResourceLabel.84:-->Stream - WEDU_A\n\
ipResourceLabel.85:-->Stream - WTTW_SW_B\n\
ipResourceLabel.86:-->Stream - Encoder_BU_B\n\
ipResourceLabel.87:-->Stream - Encoder_02B\n\
ipResourceLabel.88:-->Stream - Encoder_03A\n\
ipResourceLabel.89:-->Stream - Encoder_04A\n\
ipResourceLabel.90:-->Stream - Encoder_03B\n\
ipResourceLabel.91:-->Stream - Encoder_04B\n\
ipResourceLabel.92:-->Stream - WEFS_SW_B\n\
ipResourceLabel.93:-->Stream - WUCF_B\n\
ipResourceLabel.94:-->Stream - WFSU_A\n\
ipResourceLabel.95:-->Stream - KERA_B\n\
ipResourceLabel.96:-->Stream - WILL_SW_B\n\
ipResourceLabel.97:-->Stream - Encoder_05B\n\
ipResourceLabel.98:-->Stream - WPBA_SW_B\n\
ipResourceLabel.99:-->Stream - WILL_SW_A\n\
ipResourceLabel.100:-->Stream - WFSU_SW_A\n\
ipResourceLabel.101:-->Stream - WEDU_SW_A\n\
ipResourceLabel.102:-->Stream - Encoder_02A\n\
ipResourceLabel.103:-->Stream - WPBA_SW_A\n\
ipResourceLabel.104:-->Stream - WJCT_SW_A\n\
ipResourceLabel.105:-->Stream - Encoder_01A\n\
ipResourceLabel.106:-->Stream - WUCF_A\n\
ipResourceLabel.107:-->Stream - WEFS_SW_A\n\
ipResourceLabel.108:-->Stream - WFSU_B\n\
ipResourceLabel.109:-->Stream - Encoder_BU_A\n\
ipResourceLabel.110:-->\n\
ipResourceLabel.111:-->\n\
ipResourceLabel.112:-->\n\
ipResourceLabel.113:-->\n\
ipResourceAddress.1:-->10.1.114.101\n\
ipResourceAddress.2:-->10.1.114.102\n\
ipResourceAddress.3:-->10.1.114.16\n\
ipResourceAddress.4:-->10.1.113.21\n\
ipResourceAddress.5:-->10.1.113.20\n\
ipResourceAddress.6:-->10.1.114.53\n\
ipResourceAddress.7:-->10.1.116.100\n\
ipResourceAddress.8:-->10.1.114.15\n\
ipResourceAddress.9:-->10.1.113.19\n\
ipResourceAddress.10:-->10.1.113.18\n\
ipResourceAddress.11:-->10.1.114.14\n\
ipResourceAddress.12:-->10.1.113.17\n\
ipResourceAddress.13:-->10.1.113.16\n\
ipResourceAddress.14:-->10.1.114.13\n\
ipResourceAddress.15:-->10.1.113.15\n\
ipResourceAddress.16:-->10.1.113.14\n\
ipResourceAddress.17:-->10.1.114.12\n\
ipResourceAddress.18:-->10.1.113.13\n\
ipResourceAddress.19:-->10.1.113.12\n\
ipResourceAddress.20:-->10.1.114.11\n\
ipResourceAddress.21:-->10.1.113.11\n\
ipResourceAddress.22:-->10.1.113.10\n\
ipResourceAddress.23:-->10.1.114.52\n\
ipResourceAddress.24:-->10.13.113.58\n\
ipResourceAddress.25:-->10.13.113.59\n\
ipResourceAddress.26:-->10.1.113.60\n\
ipResourceAddress.27:-->10.1.113.61\n\
ipResourceAddress.28:-->10.1.114.51\n\
ipResourceAddress.29:-->10.1.113.54\n\
ipResourceAddress.30:-->10.1.113.55\n\
ipResourceAddress.31:-->10.1.113.56\n\
ipResourceAddress.32:-->10.1.113.57\n\
ipResourceAddress.33:-->10.6.114.31\n\
ipResourceAddress.34:-->0.0.0.0\n\
ipResourceAddress.35:-->0.0.0.0\n\
ipResourceAddress.36:-->0.0.0.0\n\
ipResourceAddress.37:-->0.0.0.0\n\
ipResourceAddress.38:-->0.0.0.0\n\
ipResourceAddress.39:-->0.0.0.0\n\
ipResourceAddress.40:-->0.0.0.0\n\
ipResourceAddress.41:-->0.0.0.0\n\
ipResourceAddress.42:-->0.0.0.0\n\
ipResourceAddress.43:-->0.0.0.0\n\
ipResourceAddress.44:-->10.6.114.51\n\
ipResourceAddress.45:-->10.7.114.51\n\
ipResourceAddress.46:-->10.1.114.33\n\
ipResourceAddress.47:-->10.1.114.32\n\
ipResourceAddress.48:-->10.1.114.31\n\
ipResourceAddress.49:-->10.1.114.92\n\
ipResourceAddress.50:-->10.7.114.31\n\
ipResourceAddress.51:-->10.1.114.2\n\
ipResourceAddress.52:-->10.1.114.91\n\
ipResourceAddress.53:-->10.7.114.101\n\
ipResourceAddress.54:-->10.6.114.101\n\
ipResourceAddress.55:-->10.6.114.91\n\
ipResourceAddress.56:-->10.7.114.91\n\
ipResourceAddress.57:-->10.1.114.34\n\
ipResourceAddress.58:-->225.1.10.32\n\
ipResourceAddress.59:-->225.1.10.55\n\
ipResourceAddress.60:-->225.1.10.45\n\
ipResourceAddress.61:-->225.1.10.65\n\
ipResourceAddress.62:-->225.1.10.43\n\
ipResourceAddress.63:-->225.1.10.63\n\
ipResourceAddress.64:-->225.1.10.51\n\
ipResourceAddress.65:-->225.1.10.42\n\
ipResourceAddress.66:-->225.1.10.64\n\
ipResourceAddress.67:-->225.1.10.52\n\
ipResourceAddress.68:-->225.1.10.61\n\
ipResourceAddress.69:-->225.1.10.43\n\
ipResourceAddress.70:-->225.1.10.35\n\
ipResourceAddress.71:-->225.1.10.11\n\
ipResourceAddress.72:-->225.1.10.15\n\
ipResourceAddress.73:-->225.1.10.34\n\
ipResourceAddress.74:-->225.1.10.44\n\
ipResourceAddress.75:-->225.1.10.32\n\
ipResourceAddress.76:-->225.1.10.41\n\
ipResourceAddress.77:-->225.1.10.41\n\
ipResourceAddress.78:-->225.1.10.34\n\
ipResourceAddress.79:-->225.1.10.62\n\
ipResourceAddress.80:-->225.1.10.53\n\
ipResourceAddress.81:-->225.1.10.35\n\
ipResourceAddress.82:-->225.1.10.44\n\
ipResourceAddress.83:-->225.1.10.31\n\
ipResourceAddress.84:-->225.1.10.33\n\
ipResourceAddress.85:-->225.1.10.45\n\
ipResourceAddress.86:-->225.1.10.16\n\
ipResourceAddress.87:-->225.1.10.12\n\
ipResourceAddress.88:-->225.1.10.13\n\
ipResourceAddress.89:-->225.1.10.14\n\
ipResourceAddress.90:-->225.1.10.13\n\
ipResourceAddress.91:-->225.1.10.14\n\
ipResourceAddress.92:-->225.1.10.62\n\
ipResourceAddress.93:-->225.1.10.63\n\
ipResourceAddress.94:-->225.1.10.54\n\
ipResourceAddress.95:-->225.1.10.42\n\
ipResourceAddress.96:-->225.1.10.65\n\
ipResourceAddress.97:-->225.1.10.15\n\
ipResourceAddress.98:-->225.1.10.61\n\
ipResourceAddress.99:-->225.1.10.55\n\
ipResourceAddress.100:-->225.1.10.54\n\
ipResourceAddress.101:-->225.1.10.33\n\
ipResourceAddress.102:-->225.1.10.12\n\
ipResourceAddress.103:-->225.1.10.51\n\
ipResourceAddress.104:-->225.1.10.31\n\
ipResourceAddress.105:-->225.1.10.11\n\
ipResourceAddress.106:-->225.1.10.53\n\
ipResourceAddress.107:-->225.1.10.52\n\
ipResourceAddress.108:-->225.1.10.64\n\
ipResourceAddress.109:-->225.1.10.16\n\
ipResourceAddress.110:-->10.1.113.57\n\
ipResourceAddress.111:-->10.1.113.60\n\
ipResourceAddress.112:-->10.1.113.61\n\
ipResourceAddress.113:-->10.1.113.56\n\
ipResourceDestinationPort.1:-->0\n\
ipResourceDestinationPort.2:-->0\n\
ipResourceDestinationPort.3:-->0\n\
ipResourceDestinationPort.4:-->0\n\
ipResourceDestinationPort.5:-->0\n\
ipResourceDestinationPort.6:-->0\n\
ipResourceDestinationPort.7:-->0\n\
ipResourceDestinationPort.8:-->0\n\
ipResourceDestinationPort.9:-->0\n\
ipResourceDestinationPort.10:-->0\n\
ipResourceDestinationPort.11:-->0\n\
ipResourceDestinationPort.12:-->0\n\
ipResourceDestinationPort.13:-->0\n\
ipResourceDestinationPort.14:-->0\n\
ipResourceDestinationPort.15:-->0\n\
ipResourceDestinationPort.16:-->0\n\
ipResourceDestinationPort.17:-->0\n\
ipResourceDestinationPort.18:-->0\n\
ipResourceDestinationPort.19:-->0\n\
ipResourceDestinationPort.20:-->0\n\
ipResourceDestinationPort.21:-->0\n\
ipResourceDestinationPort.22:-->0\n\
ipResourceDestinationPort.23:-->0\n\
ipResourceDestinationPort.24:-->0\n\
ipResourceDestinationPort.25:-->0\n\
ipResourceDestinationPort.26:-->0\n\
ipResourceDestinationPort.27:-->0\n\
ipResourceDestinationPort.28:-->0\n\
ipResourceDestinationPort.29:-->0\n\
ipResourceDestinationPort.30:-->0\n\
ipResourceDestinationPort.31:-->0\n\
ipResourceDestinationPort.32:-->0\n\
ipResourceDestinationPort.33:-->0\n\
ipResourceDestinationPort.34:-->0\n\
ipResourceDestinationPort.35:-->0\n\
ipResourceDestinationPort.36:-->0\n\
ipResourceDestinationPort.37:-->0\n\
ipResourceDestinationPort.38:-->0\n\
ipResourceDestinationPort.39:-->0\n\
ipResourceDestinationPort.40:-->0\n\
ipResourceDestinationPort.41:-->0\n\
ipResourceDestinationPort.42:-->0\n\
ipResourceDestinationPort.43:-->0\n\
ipResourceDestinationPort.44:-->0\n\
ipResourceDestinationPort.45:-->0\n\
ipResourceDestinationPort.46:-->0\n\
ipResourceDestinationPort.47:-->0\n\
ipResourceDestinationPort.48:-->0\n\
ipResourceDestinationPort.49:-->0\n\
ipResourceDestinationPort.50:-->0\n\
ipResourceDestinationPort.51:-->0\n\
ipResourceDestinationPort.52:-->0\n\
ipResourceDestinationPort.53:-->0\n\
ipResourceDestinationPort.54:-->0\n\
ipResourceDestinationPort.55:-->0\n\
ipResourceDestinationPort.56:-->0\n\
ipResourceDestinationPort.57:-->0\n\
ipResourceDestinationPort.58:-->5004\n\
ipResourceDestinationPort.59:-->5004\n\
ipResourceDestinationPort.60:-->5004\n\
ipResourceDestinationPort.61:-->5004\n\
ipResourceDestinationPort.62:-->5004\n\
ipResourceDestinationPort.63:-->5004\n\
ipResourceDestinationPort.64:-->5004\n\
ipResourceDestinationPort.65:-->5004\n\
ipResourceDestinationPort.66:-->5004\n\
ipResourceDestinationPort.67:-->5004\n\
ipResourceDestinationPort.68:-->5004\n\
ipResourceDestinationPort.69:-->5004\n\
ipResourceDestinationPort.70:-->5004\n\
ipResourceDestinationPort.71:-->5004\n\
ipResourceDestinationPort.72:-->5004\n\
ipResourceDestinationPort.73:-->5004\n\
ipResourceDestinationPort.74:-->5004\n\
ipResourceDestinationPort.75:-->5004\n\
ipResourceDestinationPort.76:-->5004\n\
ipResourceDestinationPort.77:-->5004\n\
ipResourceDestinationPort.78:-->5004\n\
ipResourceDestinationPort.79:-->5004\n\
ipResourceDestinationPort.80:-->5004\n\
ipResourceDestinationPort.81:-->5004\n\
ipResourceDestinationPort.82:-->5004\n\
ipResourceDestinationPort.83:-->5004\n\
ipResourceDestinationPort.84:-->5004\n\
ipResourceDestinationPort.85:-->5004\n\
ipResourceDestinationPort.86:-->5004\n\
ipResourceDestinationPort.87:-->5004\n\
ipResourceDestinationPort.88:-->5004\n\
ipResourceDestinationPort.89:-->5004\n\
ipResourceDestinationPort.90:-->5004\n\
ipResourceDestinationPort.91:-->5004\n\
ipResourceDestinationPort.92:-->5004\n\
ipResourceDestinationPort.93:-->5004\n\
ipResourceDestinationPort.94:-->5004\n\
ipResourceDestinationPort.95:-->5004\n\
ipResourceDestinationPort.96:-->5004\n\
ipResourceDestinationPort.97:-->5004\n\
ipResourceDestinationPort.98:-->5004\n\
ipResourceDestinationPort.99:-->5004\n\
ipResourceDestinationPort.100:-->5004\n\
ipResourceDestinationPort.101:-->5004\n\
ipResourceDestinationPort.102:-->5004\n\
ipResourceDestinationPort.103:-->5004\n\
ipResourceDestinationPort.104:-->5004\n\
ipResourceDestinationPort.105:-->5004\n\
ipResourceDestinationPort.106:-->5004\n\
ipResourceDestinationPort.107:-->5004\n\
ipResourceDestinationPort.108:-->5004\n\
ipResourceDestinationPort.109:-->5004\n\
ipResourceDestinationPort.110:-->0\n\
ipResourceDestinationPort.111:-->0\n\
ipResourceDestinationPort.112:-->0\n\
ipResourceDestinationPort.113:-->0\n\
encoderInputElementIndex.20.1:-->20\n\
encoderInputElementIndex.20.2:-->20\n\
encoderInputElementIndex.20.3:-->20\n\
encoderInputElementIndex.20.5:-->20\n\
encoderInputElementIndex.20.6:-->20\n\
encoderInputElementIndex.20.7:-->20\n\
encoderInputElementIndex.20.8:-->20\n\
encoderInputElementIndex.21.1:-->21\n\
encoderInputElementIndex.21.5:-->21\n\
encoderInputElementIndex.21.6:-->21\n\
encoderInputElementIndex.21.7:-->21\n\
encoderInputElementIndex.21.8:-->21\n\
encoderInputElementIndex.22.1:-->22\n\
encoderInputElementIndex.22.2:-->22\n\
encoderInputElementIndex.22.3:-->22\n\
encoderInputElementIndex.22.4:-->22\n\
encoderInputElementIndex.22.5:-->22\n\
encoderInputElementIndex.22.6:-->22\n\
encoderInputElementIndex.22.7:-->22\n\
encoderInputElementIndex.22.8:-->22\n\
encoderInputElementIndex.24.1:-->24\n\
encoderInputElementIndex.24.2:-->24\n\
encoderInputElementIndex.24.3:-->24\n\
encoderInputElementIndex.24.5:-->24\n\
encoderInputElementIndex.24.6:-->24\n\
encoderInputElementIndex.24.7:-->24\n\
encoderInputElementIndex.24.8:-->24\n\
encoderInputElementIndex.25.1:-->25\n\
encoderInputElementIndex.25.2:-->25\n\
encoderInputElementIndex.25.5:-->25\n\
encoderInputElementIndex.25.6:-->25\n\
encoderInputElementIndex.25.7:-->25\n\
encoderInputElementIndex.25.8:-->25\n\
encoderInputIndex.20.1:-->1\n\
encoderInputIndex.20.2:-->2\n\
encoderInputIndex.20.3:-->3\n\
encoderInputIndex.20.5:-->5\n\
encoderInputIndex.20.6:-->6\n\
encoderInputIndex.20.7:-->7\n\
encoderInputIndex.20.8:-->8\n\
encoderInputIndex.21.1:-->1\n\
encoderInputIndex.21.5:-->5\n\
encoderInputIndex.21.6:-->6\n\
encoderInputIndex.21.7:-->7\n\
encoderInputIndex.21.8:-->8\n\
encoderInputIndex.22.1:-->1\n\
encoderInputIndex.22.2:-->2\n\
encoderInputIndex.22.3:-->3\n\
encoderInputIndex.22.4:-->4\n\
encoderInputIndex.22.5:-->5\n\
encoderInputIndex.22.6:-->6\n\
encoderInputIndex.22.7:-->7\n\
encoderInputIndex.22.8:-->8\n\
encoderInputIndex.24.1:-->1\n\
encoderInputIndex.24.2:-->2\n\
encoderInputIndex.24.3:-->3\n\
encoderInputIndex.24.5:-->5\n\
encoderInputIndex.24.6:-->6\n\
encoderInputIndex.24.7:-->7\n\
encoderInputIndex.24.8:-->8\n\
encoderInputIndex.25.1:-->1\n\
encoderInputIndex.25.2:-->2\n\
encoderInputIndex.25.5:-->5\n\
encoderInputIndex.25.6:-->6\n\
encoderInputIndex.25.7:-->7\n\
encoderInputIndex.25.8:-->8\n\
encoderInputSource.20.1:-->sdi(1)\n\
encoderInputSource.20.2:-->sdi(1)\n\
encoderInputSource.20.3:-->sdi(1)\n\
encoderInputSource.20.5:-->sdi(1)\n\
encoderInputSource.20.6:-->sdi(1)\n\
encoderInputSource.20.7:-->sdi(1)\n\
encoderInputSource.20.8:-->sdi(1)\n\
encoderInputSource.21.1:-->sdi(1)\n\
encoderInputSource.21.5:-->sdi(1)\n\
encoderInputSource.21.6:-->sdi(1)\n\
encoderInputSource.21.7:-->sdi(1)\n\
encoderInputSource.21.8:-->sdi(1)\n\
encoderInputSource.22.1:-->sdi(1)\n\
encoderInputSource.22.2:-->sdi(1)\n\
encoderInputSource.22.3:-->sdi(1)\n\
encoderInputSource.22.4:-->sdi(1)\n\
encoderInputSource.22.5:-->sdi(1)\n\
encoderInputSource.22.6:-->sdi(1)\n\
encoderInputSource.22.7:-->sdi(1)\n\
encoderInputSource.22.8:-->sdi(1)\n\
encoderInputSource.24.1:-->sdi(1)\n\
encoderInputSource.24.2:-->sdi(1)\n\
encoderInputSource.24.3:-->sdi(1)\n\
encoderInputSource.24.5:-->sdi(1)\n\
encoderInputSource.24.6:-->sdi(1)\n\
encoderInputSource.24.7:-->sdi(1)\n\
encoderInputSource.24.8:-->sdi(1)\n\
encoderInputSource.25.1:-->sdi(1)\n\
encoderInputSource.25.2:-->sdi(1)\n\
encoderInputSource.25.5:-->sdi(1)\n\
encoderInputSource.25.6:-->sdi(1)\n\
encoderInputSource.25.7:-->sdi(1)\n\
encoderInputSource.25.8:-->sdi(1)\n\
redGroupIndex.1:-->1\n\
redGroupIndex.2:-->2\n\
redGroupIndex.3:-->3\n\
redGroupIndex.4:-->4\n\
redGroupIndex.5:-->5\n\
redGroupIndex.6:-->6\n\
redGroupIndex.7:-->7\n\
redGroupIndex.8:-->8\n\
redGroupName.1:-->CP6000_DEC\n\
redGroupName.2:-->CP6000_ENC\n\
redGroupName.3:-->Amethyst\n\
redGroupName.4:-->NOC_XMU_fixedGroup_2\n\
redGroupName.5:-->NOC_XMU_fixedGroup_1\n\
redGroupName.6:-->NOC_XMU_group_1\n\
redGroupName.7:-->NOC_XMU_group_3\n\
redGroupName.8:-->NOC_XMU_group_2\n\
redGroupType.1:-->fixed(1)\n\
redGroupType.2:-->fixed(1)\n\
redGroupType.3:-->fixed(1)\n\
redGroupType.4:-->fixed(1)\n\
redGroupType.5:-->fixed(1)\n\
redGroupType.6:-->floating(3)\n\
redGroupType.7:-->floating(3)\n\
redGroupType.8:-->floating(3)\n\
redResFixedGroupIndex.1.8:-->1\n\
redResFixedGroupIndex.1.9:-->1\n\
redResFixedGroupIndex.1.10:-->1\n\
redResFixedGroupIndex.1.12:-->1\n\
redResFixedGroupIndex.1.13:-->1\n\
redResFixedGroupIndex.1.14:-->1\n\
redResFixedGroupIndex.1.15:-->1\n\
redResFixedGroupIndex.1.32:-->1\n\
redResFixedGroupIndex.2.4:-->2\n\
redResFixedGroupIndex.2.5:-->2\n\
redResFixedGroupIndex.2.6:-->2\n\
redResFixedGroupIndex.2.31:-->2\n\
redResFixedGroupIndex.3.49:-->3\n\
redResFixedGroupIndex.3.50:-->3\n\
redResFixedGroupIndex.4.19:-->4\n\
redResFixedGroupIndex.4.26:-->4\n\
redResFixedGroupIndex.4.27:-->4\n\
redResFixedGroupIndex.5.20:-->5\n\
redResFixedGroupIndex.5.21:-->5\n\
redResFixedGroupIndex.5.22:-->5\n\
redResFixedGroupIndex.5.24:-->5\n\
redResFixedGroupIndex.5.25:-->5\n\
redResFixedGroupIndex.5.28:-->5\n\
redResFixedElementIndex.1.8:-->8\n\
redResFixedElementIndex.1.9:-->9\n\
redResFixedElementIndex.1.10:-->10\n\
redResFixedElementIndex.1.12:-->12\n\
redResFixedElementIndex.1.13:-->13\n\
redResFixedElementIndex.1.14:-->14\n\
redResFixedElementIndex.1.15:-->15\n\
redResFixedElementIndex.1.32:-->32\n\
redResFixedElementIndex.2.4:-->4\n\
redResFixedElementIndex.2.5:-->5\n\
redResFixedElementIndex.2.6:-->6\n\
redResFixedElementIndex.2.31:-->31\n\
redResFixedElementIndex.3.49:-->49\n\
redResFixedElementIndex.3.50:-->50\n\
redResFixedElementIndex.4.19:-->19\n\
redResFixedElementIndex.4.26:-->26\n\
redResFixedElementIndex.4.27:-->27\n\
redResFixedElementIndex.5.20:-->20\n\
redResFixedElementIndex.5.21:-->21\n\
redResFixedElementIndex.5.22:-->22\n\
redResFixedElementIndex.5.24:-->24\n\
redResFixedElementIndex.5.25:-->25\n\
redResFixedElementIndex.5.28:-->28\n\
redResFixedRedundancyStatus.1.8:-->active(2)\n\
redResFixedRedundancyStatus.1.9:-->active(2)\n\
redResFixedRedundancyStatus.1.10:-->active(2)\n\
redResFixedRedundancyStatus.1.12:-->active(2)\n\
redResFixedRedundancyStatus.1.13:-->active(2)\n\
redResFixedRedundancyStatus.1.14:-->active(2)\n\
redResFixedRedundancyStatus.1.15:-->active(2)\n\
redResFixedRedundancyStatus.1.32:-->standby(1)\n\
redResFixedRedundancyStatus.2.4:-->active(2)\n\
redResFixedRedundancyStatus.2.5:-->active(2)\n\
redResFixedRedundancyStatus.2.6:-->active(2)\n\
redResFixedRedundancyStatus.2.31:-->standby(1)\n\
redResFixedRedundancyStatus.3.49:-->standby(1)\n\
redResFixedRedundancyStatus.3.50:-->active(2)\n\
redResFixedRedundancyStatus.4.19:-->standby(1)\n\
redResFixedRedundancyStatus.4.26:-->active(2)\n\
redResFixedRedundancyStatus.4.27:-->active(2)\n\
redResFixedRedundancyStatus.5.20:-->active(2)\n\
redResFixedRedundancyStatus.5.21:-->active(2)\n\
redResFixedRedundancyStatus.5.22:-->active(2)\n\
redResFixedRedundancyStatus.5.24:-->active(2)\n\
redResFixedRedundancyStatus.5.25:-->active(2)\n\
redResFixedRedundancyStatus.5.28:-->standby(1)\n\
redResFixedFunction.1.8:-->nominal(0)\n\
redResFixedFunction.1.9:-->nominal(0)\n\
redResFixedFunction.1.10:-->nominal(0)\n\
redResFixedFunction.1.12:-->nominal(0)\n\
redResFixedFunction.1.13:-->nominal(0)\n\
redResFixedFunction.1.14:-->nominal(0)\n\
redResFixedFunction.1.15:-->nominal(0)\n\
redResFixedFunction.1.32:-->redundant(1)\n\
redResFixedFunction.2.4:-->nominal(0)\n\
redResFixedFunction.2.5:-->nominal(0)\n\
redResFixedFunction.2.6:-->nominal(0)\n\
redResFixedFunction.2.31:-->redundant(1)\n\
redResFixedFunction.3.49:-->redundant(1)\n\
redResFixedFunction.3.50:-->nominal(0)\n\
redResFixedFunction.4.19:-->redundant(1)\n\
redResFixedFunction.4.26:-->nominal(0)\n\
redResFixedFunction.4.27:-->nominal(0)\n\
redResFixedFunction.5.20:-->nominal(0)\n\
redResFixedFunction.5.21:-->nominal(0)\n\
redResFixedFunction.5.22:-->nominal(0)\n\
redResFixedFunction.5.24:-->nominal(0)\n\
redResFixedFunction.5.25:-->nominal(0)\n\
redResFixedFunction.5.28:-->redundant(1)\n\
redResFixedSwitchMode.1.8:-->manual(0)\n\
redResFixedSwitchMode.1.9:-->manual(0)\n\
redResFixedSwitchMode.1.10:-->manual(0)\n\
redResFixedSwitchMode.1.12:-->manual(0)\n\
redResFixedSwitchMode.1.13:-->manual(0)\n\
redResFixedSwitchMode.1.14:-->manual(0)\n\
redResFixedSwitchMode.1.15:-->manual(0)\n\
redResFixedSwitchMode.1.32:-->manual(0)\n\
redResFixedSwitchMode.2.4:-->manual(0)\n\
redResFixedSwitchMode.2.5:-->manual(0)\n\
redResFixedSwitchMode.2.6:-->manual(0)\n\
redResFixedSwitchMode.2.31:-->manual(0)\n\
redResFixedSwitchMode.3.49:-->manual(0)\n\
redResFixedSwitchMode.3.50:-->auto_controlled_by_switcher(6)\n\
redResFixedSwitchMode.4.19:-->none(4)\n\
redResFixedSwitchMode.4.26:-->manual(0)\n\
redResFixedSwitchMode.4.27:-->manual(0)\n\
redResFixedSwitchMode.5.20:-->manual(0)\n\
redResFixedSwitchMode.5.21:-->manual(0)\n\
redResFixedSwitchMode.5.22:-->manual(0)\n\
redResFixedSwitchMode.5.24:-->manual(0)\n\
redResFixedSwitchMode.5.25:-->manual(0)\n\
redResFixedSwitchMode.5.28:-->none(4)\n\
redResFixedMirroredElementIndex.1.8:-->8\n\
redResFixedMirroredElementIndex.1.9:-->9\n\
redResFixedMirroredElementIndex.1.10:-->10\n\
redResFixedMirroredElementIndex.1.12:-->12\n\
redResFixedMirroredElementIndex.1.13:-->13\n\
redResFixedMirroredElementIndex.1.14:-->14\n\
redResFixedMirroredElementIndex.1.15:-->15\n\
redResFixedMirroredElementIndex.1.32:-->14\n\
redResFixedMirroredElementIndex.2.4:-->4\n\
redResFixedMirroredElementIndex.2.5:-->5\n\
redResFixedMirroredElementIndex.2.6:-->6\n\
redResFixedMirroredElementIndex.2.31:-->6\n\
redResFixedMirroredElementIndex.3.49:-->50\n\
redResFixedMirroredElementIndex.3.50:-->50\n\
redResFixedMirroredElementIndex.4.19:-->27\n\
redResFixedMirroredElementIndex.4.26:-->26\n\
redResFixedMirroredElementIndex.4.27:-->27\n\
redResFixedMirroredElementIndex.5.20:-->20\n\
redResFixedMirroredElementIndex.5.21:-->21\n\
redResFixedMirroredElementIndex.5.22:-->22\n\
redResFixedMirroredElementIndex.5.24:-->24\n\
redResFixedMirroredElementIndex.5.25:-->25\n\
redResFixedMirroredElementIndex.5.28:-->25\n\
redResFixedBackupElementIndex.1.8:-->0\n\
redResFixedBackupElementIndex.1.9:-->0\n\
redResFixedBackupElementIndex.1.10:-->0\n\
redResFixedBackupElementIndex.1.12:-->0\n\
redResFixedBackupElementIndex.1.13:-->0\n\
redResFixedBackupElementIndex.1.14:-->0\n\
redResFixedBackupElementIndex.1.15:-->0\n\
redResFixedBackupElementIndex.1.32:-->0\n\
redResFixedBackupElementIndex.2.4:-->0\n\
redResFixedBackupElementIndex.2.5:-->0\n\
redResFixedBackupElementIndex.2.6:-->0\n\
redResFixedBackupElementIndex.2.31:-->0\n\
redResFixedBackupElementIndex.3.49:-->0\n\
redResFixedBackupElementIndex.3.50:-->0\n\
redResFixedBackupElementIndex.4.19:-->0\n\
redResFixedBackupElementIndex.4.26:-->0\n\
redResFixedBackupElementIndex.4.27:-->0\n\
redResFixedBackupElementIndex.5.20:-->0\n\
redResFixedBackupElementIndex.5.21:-->0\n\
redResFixedBackupElementIndex.5.22:-->0\n\
redResFixedBackupElementIndex.5.24:-->0\n\
redResFixedBackupElementIndex.5.25:-->0\n\
redResFixedBackupElementIndex.5.28:-->0\n\
redResFixedSwitchCommand.1.8:-->0\n\
redResFixedSwitchCommand.1.9:-->0\n\
redResFixedSwitchCommand.1.10:-->0\n\
redResFixedSwitchCommand.1.12:-->0\n\
redResFixedSwitchCommand.1.13:-->0\n\
redResFixedSwitchCommand.1.14:-->0\n\
redResFixedSwitchCommand.1.15:-->0\n\
redResFixedSwitchCommand.1.32:-->0\n\
redResFixedSwitchCommand.2.4:-->0\n\
redResFixedSwitchCommand.2.5:-->0\n\
redResFixedSwitchCommand.2.6:-->0\n\
redResFixedSwitchCommand.2.31:-->0\n\
redResFixedSwitchCommand.3.49:-->0\n\
redResFixedSwitchCommand.3.50:-->0\n\
redResFixedSwitchCommand.4.19:-->0\n\
redResFixedSwitchCommand.4.26:-->0\n\
redResFixedSwitchCommand.4.27:-->0\n\
redResFixedSwitchCommand.5.20:-->0\n\
redResFixedSwitchCommand.5.21:-->0\n\
redResFixedSwitchCommand.5.22:-->0\n\
redResFixedSwitchCommand.5.24:-->0\n\
redResFixedSwitchCommand.5.25:-->0\n\
redResFixedSwitchCommand.5.28:-->0\n\
redResFixedRestoreMode.1.8:-->manual(1)\n\
redResFixedRestoreMode.1.9:-->manual(1)\n\
redResFixedRestoreMode.1.10:-->manual(1)\n\
redResFixedRestoreMode.1.12:-->manual(1)\n\
redResFixedRestoreMode.1.13:-->manual(1)\n\
redResFixedRestoreMode.1.14:-->manual(1)\n\
redResFixedRestoreMode.1.15:-->manual(1)\n\
redResFixedRestoreMode.1.32:-->manual(1)\n\
redResFixedRestoreMode.2.4:-->manual(1)\n\
redResFixedRestoreMode.2.5:-->manual(1)\n\
redResFixedRestoreMode.2.6:-->manual(1)\n\
redResFixedRestoreMode.2.31:-->manual(1)\n\
redResFixedRestoreMode.3.49:-->manual(1)\n\
redResFixedRestoreMode.3.50:-->switchBackOnNominalOutputFaultless(4)\n\
redResFixedRestoreMode.4.19:-->manual(1)\n\
redResFixedRestoreMode.4.26:-->manual(1)\n\
redResFixedRestoreMode.4.27:-->manual(1)\n\
redResFixedRestoreMode.5.20:-->manual(1)\n\
redResFixedRestoreMode.5.21:-->manual(1)\n\
redResFixedRestoreMode.5.22:-->manual(1)\n\
redResFixedRestoreMode.5.24:-->manual(1)\n\
redResFixedRestoreMode.5.25:-->manual(1)\n\
redResFixedRestoreMode.5.28:-->manual(1)\n\
';
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
 *   Amethyst ch�ssis    96 (multiple switch)          1    Not entered
 *   Amethyst IP         12 (switch/router)            25
 *   Amethyst ASI        12 (switch/router)            19
 *   NetProcessor 9030   2 (multiplexor)               1
 *   Netprocessor 9040   2 (multiplexor)               3
 *   CP6000 ch�ssis      95 (contribution platform)    1    CP6000 all have the same alarms   
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
    this.deviceList = [];// = this._devicesByIndex; // return list of devices.
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
        this.deviceList.push(this._rootXMSDevice);// push the first in!! 
        
        // Loop over the mib values to create the devices
        for (var i = 0; i < mibIndices.length; i++) {
            var name = mibNames[i];
            var type = DeviceManager.find(mibTypes[i], mibExtTypes[i]);
            if (!type) {               
                throw "Type not found for device " + name + " type=" + mibTypes[i] + " extType=" + mibExtTypes[i];
            }
            
            var device = new Device(name, type);
            log.warn("Creating device " + device.toString());
            this._devicesByName[name] = device;
            this._devicesByIndex[mibIndices[i]] = device;
            this.deviceList.push(device);
        }
        
        // Now create parent link to build the device hierarchy
        for (var i = 0; i < mibIndices.length; i++) {
            
            var device = this._devicesByName[mibNames[i]];            
            device.parent = this._devicesByIndex[mibParents[i]];
        }   
        
        
        // For each device that have subdevice creator function, invoke it to create subdevices
        for (var i = 1; i < this._devicesByIndex.length; i++) {    // start from 1 because we can skip the XMS        
            var device = this._devicesByIndex[i];   
            if (!device) continue; // remember, table is sparse
            log.warn("checking subCreatorFunct for " + device.toString());
            if (device.type.subDevicesCreatorFunc) {
                var subdevices = device.type.subDevicesCreatorFunc(device);
                for (var j = 0; j < subdevices.length; j++) {
                    var subdevice = subdevices[j];
                    log.warn("creating subdev " + subdevice.toString() + " for " + device.toString());
                    // the children device
                    this._devicesByName[device.name + ":" + subdevice.name] = subdevice; // eg. Compose an unique name for the subdevice, like "NOC_EM4008_01:ENC1"
                    this.deviceList.push(subdevice);
                    //log.warn("Adding subdevice " + subdevice.toString());
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
            log.warn("+ createing alarms for device " + device.toString());
            
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
                log.warn("creating path " + path);
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
try {
	GSM.alarm = alarm;// put some order by using  namespace!
	//GSM.snmp = snmp;
	GSM.gsm = GSM.alarm;
} catch(ex) {
	GSM.alarm = MOCK.alarm;// put some order by using  namespace!
	//GSM.snmp = MOCK.snmp;
	GSM.gsm = MOCK.gsm;
}


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

poller.addObjectID(snmp.getOID(MyPlugin.mib, "genSoftwareVersion"));// add dummy oid to wake up poller
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
    genEventRecordId: removeEndingZero(snmp.getOID(MyPlugin.mib,'genEventRecordId')),
    //genTrapLastNumber: snmp.getOID(MyPlugin.mib,'genTrapLastNumber'),
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
   // do nothing
}
