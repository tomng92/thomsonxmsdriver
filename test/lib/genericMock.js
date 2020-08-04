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
