/************************************************************************************
 * ProStream 1000 driver.
 * 30 Oct 2013.
 * 
 * There is no poller. Alarms are updated via traps.
 * Alarms are kept in a stack. Newer alarms push down alarms of equal severity.
 * Higher severity alarms are at the top of stack.
 * We only display a few top elements.
 * 
 *
 *                 Event stack       Alarm A cleared    Alarms B,C cleared
 *                                   D, B move up.      
 *             /  +-------------+    +-------------+    +-------------+
 *  Alarms    /   |Alarm C - Hi |    |Alarm C - Hi |    |Alarm D - Med|
 *  displayed \   +-------------+    +-------------+    +-------------+
 *             \  |Alarm A - Med|    |Alarm D - Med|    |             |
 *              \ +-------------+    +-------------+    +-------------+
 *                |Alarm D - Med|    |Alarm B - Low|
 *                +-------------+    +-------------+
 *                |Alarm B - Low|
 *                +-------------+
 * 
 * Behavior is controlled by parameters below:
 *   - cleanupInterval: interval to remove old alarms
 *   - dropOldAlarms:  Default is false. If true, stack length is fixed at nb displayed (usually 2 items).
 *   - timeToLive: life span of lower severity alarms (NOTICE, INFO severity).
 */


function ProStreamPlugin(parameters) {
  
   this.mib = 'HARMONIC-PROSTREAM-MIB';
   this.deviceClass = "NMS";
   this.type = "PROSTREAM1000";
   //this.readCommunity = 'public';
   //this.retries = 3;
   //this.timeout = 10; // 
   this.cleanupInterval = 30; // in seconds. Time to periodically cleanup alarm stacks
   this.dropOldAlarms = false; // stack behavior. If true, we remove alarms that are not visible in navigator.
   this.timeToLive = 600;// in seconds. Cleanup of INFORM and NOTICE alarms
   this.uniqueID = "";
   
   this.path = "SNMP/";
   
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
       if (parameters['uniqueID']) {
           this.uniqueID = parameters['uniqueID'];
       }
       
       if (parameters['dropOldAlarms']) {
           this.dropOldAlarms = parameters['dropOldAlarms'];
       }
       if (parameters['timeToLive']) {
           this.timeToLive = parameters['timeToLive'];
       }
    }
   
   
    this.pathPrefix = this.path + this.type + "/" + host;
    this.devicePath = this.path + this.type + "/" + host;
    this.deviceURI = "snmp://" + this.type + ":" + host;
    this.prefixURI = "snmp://" + this.type + ":" + host;
    
    /**
     * AlarmManager
     */
    this.alarmManager = new AlarmManager();
    this.severityManager = ProstreamSeverityManager;

    if(this.uniqueID != ""){
        this.prefixURI = "snmp://" + this.uniqueID + ":" + this.type + ":" + host;
    }
    
    /**
     * AlarmCategories
     */
    this.alarmCategories = [];
    this.alarmTypes = [];


    /**
     * Create alarms from the trap categories.
     * Call this after the SNMP is created.
     */
    this.createAlarms = function(alarmCategoriesTable) {

        this.createAlarmsForCategory(this.alarmManager.miscHolder.category);
        
        /**
         * Loop over the categories, and for each cat, add the generic alarms to the manager.
         */
        for (var i = 0; i < AlarmData.alarmCategories.length; i++) {
            var category = AlarmData.alarmCategories[i];
            this.alarmCategories[category.catId] = category;
            
            if (category.enableGeneric) {// If generic, add alarms to the manager                
                // Add alarm holder
                this.alarmManager.addHolder(category, this.timeToLive, this.dropOldAlarms);
                this.createAlarmsForCategory(category);
            }           
        }    
               
        /**
         * Add all alarm types
         */
        for (var i = 0; i < AlarmData.alarmEntries.length; i++) {
            var type = AlarmData.alarmEntries[i];
            this.alarmTypes[type.catId + ":" + type.alarmId] = type;
        }
    };
    
    
    this.createAlarmsForCategory = function(category) {
        for (var index = 0; index < category.nbGeneric; index++) {
            var uri = category.name + "/" + category.name + (index+1); 
            var path = category.name;
            var desc = category.desc + " alarm " + (index+1);
            var gsmAlarm = createGsmAlarm(uri, desc, path);
            this.alarmManager.addGsmAlarm(category, index, gsmAlarm); // add gsm alarm to holder  
        }
    };
    
    /**
     * Create an alarm given the alarm config entry.
     * @param uri example "snmp://PROSTREAM:10.12.250.55/hPlatform/hPlatform1"
     * @param desc example "Platform alarm 1"
     * @param path example "SNMP/PROSTREAM/10.12.250.55/hPlatform"
     * @return the gsm alarm created.
     */
    function createGsmAlarm(uri, desc, path) {
        
        log.info("createAlarm: " + uri + "  |  " + desc + "  |  " + path );
        var newAlarm = new navigator.Alarm(MyPlugin.mib, 
                                        uri, // eg. "hPlatform/hPlatform1""
                                        0, // no index
                                        uri, // shortname (NOT USED ?)
                                        desc, // desc,
                                        "statustext",// alarm type
                                        2, // mode
                                        null); // alarmMap

        var gsmAlarm = newAlarm.addAlarm(MyPlugin.deviceURI, MyPlugin.pathPrefix + "/" + path, MyPlugin.deviceClass);
        gsmAlarm.status = alarm.NORMAL;
        return gsmAlarm;
    }
    
    /**
     * Periodic cleanup of alarm stacks.
     * Invoked periodically to remove old items or reduce stack length.
     */
    
    this.cleanupAlarmStacks = function(scope) {
        
        return function() {
        
            log.info("cleanup of prostream stacks");
            
            // cleanup regular holders
            if (scope.alarmManager && scope.alarmManager.holders) {// may not be there yet!
                for (var i = 0; i < scope.alarmManager.holders.length; i++) {
                    if (scope.alarmManager.holders[i]) {
                        cleanupHolder(scope.alarmManager.holders[i]);
                    }
                }

                // cleanup of miscHolder
                if (scope.alarmManager.miscHolder) {
                    cleanupHolder(scope.alarmManager.miscHolder);
                }
            }
        };
    };
    
    // Cleanup an event holder
    function cleanupHolder(holder) {
        holder.cleanup();// remove old stuff
        // We have cleaned the stack, now update associated gsm alarms
        for (var i = 0; i < holder.gsmAlarms.length; i++) {
            var alarmEvent = holder.stack[i];
            var gsmAlarm = holder.gsmAlarms[i];
            if (alarmEvent) {
                gsmAlarm.status = alarmEvent.severity.convertToGsm();
                gsmAlarm.text = alarmEvent.text;
            } else {
                gsmAlarm.status = alarm.NORMAL;
                gsmAlarm.text = "";
            }
        }
    }      
    

    try {
        navigator.setInterval(this.cleanupAlarmStacks(this), this.cleanupInterval * 1000 );
    } catch (ex) {
        log.error(ex);
    } 
}


/**
 * AlarmEvent: contains fields received from the trap.
  
 * Triggered by a trap.
 * 
 */
function AlarmEvent(alarmType, sev, text) {
    this.type = alarmType;
    this.severity = sev; // original one from the device, not gsm value
    this.text = text;
    this.lastUpdate = new Date();// time this alarm is last updated
    
    // Note: Test code depends on toString(). If you modify, please also modify the tests.
    this.toString = function() {
        return this.type.name + "-" + this.severity.toString();// example "alarmA-MED".
    };
}

/**
 * Class ProStreamSeverity
 * @param value
 * @param name
 * @param toGsmFct Conversion to GSM severity
 */
function ProStreamSeverity(value, name) {
    this.value = value;
    this.name = name;
    
    this.compareTo = function(anotherSev) { // >1 is more severe, 0 = same, <1 is less severe
        return this.value - anotherSev.value;// based on numeric value
    };
    
    this.convertToGsm = function() {
        switch (this.value) {
        case 1:  return alarm.NORMAL; // inform(1)
        case 2:  return alarm.NORMAL; // notice(2)
        case 3:  return alarm.WARNING; // warning(3)
        case 4:  return alarm.ERROR; // error(4)
        case 5:  return alarm.ERROR; // critical(5)
        case 6:  return alarm.ERROR; // alert(6)
        case 7:  return alarm.ERROR; // emergency(7)
        default: 
            log.error("Unknown severity " + severity);
            return this.alarm.UNKNOWN;
        }
    };

    
   // Note: Test code depends on toString(). If you modify, please also modify the tests.
   this.toString = function() {
        return name;
    }; 
 }


/**
 * Alarm holder keeps a stack (==arrays) of alarms for a category. 
 * Alarms 
 * The function getStack() return the nb alarms most severe.
 * We keep only a certain number of alarms. By default, it is 3 times the nbElems.
 * The reason we keep more is that if a top alarm is removed, the lower severity alarms are still active (ie. in the list)
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
 *  
 */
var MAX_STACK_LENGTH = 20;// default length. Modified by dropOldAlarms.

var synchronize = synchronize || function(func) {
    return new Packages.org.mozilla.javascript.Synchronizer(func);
};

function AlarmHolder(category, timeToLiveSecs, dropOldAlarms) {
	this.category = category;
    this.stack = []; // list of alarms, ordered by severity and chronology. Top of stack is at index 0. 
    this.gsmAlarms = [];
    this.timeToLiveMsecs = timeToLiveSecs * 1000;// in seconds. Life span of NOTICE and INFORM alarm events.
    this.dropOldAlarms = dropOldAlarms; // if false, we keep a long stack. If true, stack length = gsmAlarm length.
    this.severityCutoffLevel = ProstreamSeverityManager.NOTICE; // level at which we clean by age
    
    /**
     * Return the alarms stack.
     * If nb = undefined or <0, return all.
     */
    this.getStack = function() {
       return this.stack;
    };

    /**
     * Remove this alarm.
     */
    var scope = this;

    function removeEventNoSynch(alarmType) {
        var index = findElem(scope, alarmType);
        if (index == -1) {
            log.info("Cannot find alarm " + alarmType.toString() + "! (may have been removed)"); // a new alarm may have pushed it out
        } else {
            scope.stack.splice(index, 1); // remove element
        }
    }


    /**
     *  New alarm to add.
     */
    function addEventNoSynch(alarmType, sev, text) {   	
        
        // first remove element if it exists
        var elemIndex = findElem(scope, alarmType);
        if (elemIndex != -1) {
            scope.stack.splice(elemIndex, 1); // remove element
        }
        
        // add new alarm
        var newElem = new AlarmEvent(alarmType, sev, text);
        var insertAt = findInsertionPoint(scope, sev);
        scope.stack.splice(insertAt, 0, newElem);
        
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
    function findElem(that, alarm) {
        for (var i = 0; i < that.stack.length; i++) {
            if (that.stack[i].type.catId == alarm.catId && that.stack[i].type.alarmId === alarm.alarmId) {
                return i;
            } 
        }
        return -1;// did not find alarm
    }
    
    /**
     * Find the place to insert alarm given the severity.
     * (more severe items are at top of stack)
     */
    function findInsertionPoint(that, severity) {
        for (var i = 0; i < that.stack.length; i++) {
            if (severity.compareTo(that.stack[i].severity) >= 0) {
                return i;
            } else {
                continue;
            }
        }
        return that.stack.length; // insert at end
    }

    /**
     * Prints the list of alarms.
     * Example "MyCategory[Alarm1-HI, Alarm2-Med]".
     * Note: Test code depends on toString(). If you modify, please also modify the tests.
     */
    this.toString = function() {
    	var buf = this.category.name + "[";
    	for (var i = 0; i < this.stack.length; i++) {
    		buf += this.stack[i].toString() + (i < this.stack.length -1 ? ", ":"");
    	}
    	buf += "]";
        return buf;
    };
}


/**
 * AlarmManager keeps all holders.
 * If an event comes for an unknown category, we put it in a "miscHolder" holder. 
 */
function AlarmManager() {
	this.holders = []; // map of holders keyed on category id
	this.miscHolder = new AlarmHolder(new AlarmCategory(0, "Others", "", true, 4));// a holder that stores all miscHolder events. Its category is not used.

	this.addHolder = function(alarmCategory, timeToLive, dropOldAlarms) {
		var holder = new AlarmHolder(alarmCategory, timeToLive, dropOldAlarms);
	    this.holders[alarmCategory.catId] = holder;
	};
	
    this.addEvent = function(cat, alarmType, sev, text) {
       this.getHolder(cat).addEvent(alarmType, sev, text);
    };

    this.removeEvent = function(cat, alarmType) {
        this.getHolder(cat).removeEvent(alarmType);
    };
    this.cleanup = function(cat) {
        this.getHolder(cat).cleanup();
    };
    this.getStack = function(cat) {
        return this.getHolder(cat).getStack();
    };
    this.addGsmAlarm = function(cat, index, gsmAlarm) {
        this.getHolder(cat).gsmAlarms[index] = gsmAlarm;
    };
    this.getGsmAlarm = function(cat, index) {
        return this.getHolder(cat).gsmAlarms[index];
    };
    
     /**
     * getHolder finds the holder for category.
     * If not found, returns the miscHolder.
     */
	this.getHolder = function(alarmCategory) {
		var holder = this.holders[alarmCategory.catId];
		if (holder) {
		    return holder;
		}
		return this.miscHolder;
	};
	
    /**
     * Prints the list of alarms.
     * Example: "AlarmManager:Cat1[Alarm1-HI, Alarm2-Med], Cat2[], Others[AlarmC-LOW]"
     * Note: Test code depends on toString(). If you modify, please also modify the tests.
     */
    this.toString = function() {
        var buf = "AlarmManager:";
        for (var key in this.holders) {
            if (this.holders.hasOwnProperty(key)) {}
            buf += this.holders[key] + ", ";
        }
        
        buf += this.miscHolder.toString();
        return buf;
    };
}


/**
 * Manages the severities related to Prostream.
 */
var ProstreamSeverityManager = {
        
    INFORM: new ProStreamSeverity(1, "INFORM"),
    NOTICE: new ProStreamSeverity(2, "NOTICE"),
    WARNING: new ProStreamSeverity(3, "WARNING"),
    ERROR: new ProStreamSeverity(4, "ERROR"),
    CRITICAL: new ProStreamSeverity(5, "CRITICAL"),
    ALERT: new ProStreamSeverity(6, "ALERT"),
    EMERGENCY: new ProStreamSeverity(7, "EMERGENCY"),

    
    getSeverity: function(value) {
        switch (value) {
        case 1:  return this.INFORM; // inform(1)
        case 2:  return this.NOTICE; // notice(2)
        case 3:  return this.WARNING; // warning(3)
        case 4:  return this.ERROR; // error(4)
        case 5:  return this.CRITICAL; // critical(5)
        case 6:  return this.ALERT; // alert(6)
        case 7:  return this.EMERGENCY; // emergency(7)
        default: return null;
        };
    },
        
    /**
     * Convert to GSM severity
     */
    proStreamtoGSM: function(sev) {
        switch (sev.value) {
        case 1:  return alarm.NORMAL; // inform(1)
        case 2:  return alarm.NORMAL; // notice(2)
        case 3:  return alarm.WARNING; // warning(3)
        case 4:  return alarm.ERROR; // error(4)
        case 5:  return alarm.ERROR; // critical(5)
        case 6:  return alarm.ERROR; // alert(6)
        case 7:  return alarm.ERROR; // emergency(7)
        default: 
            log.error("Unknown severity " + severity);
            return this.alarm.UNKNOWN;
        }
    }
};


/**
 * TrapCategory. From configuration or MIB.
 */
function AlarmCategory(catId, name, desc, enableGeneric, nbGeneric) {
    this.catId = catId; // numeric
    this.name = name; // e.g. ""hGbeCard"
    this.desc = desc; // e.g. "Gbe Pro Card"
    this.enableGeneric = enableGeneric; // whether we use generic alarms
    this.nbGeneric = nbGeneric; // used to create generic alarms. Example "Slot alarm"
    //this.alarms = {}; // map of AlarmType keyed on the alarmId
    this.toString = function() {
        return "cat:" + catId + "," + name;
    };
}


/**
 * Alarm object. From configuration or MIB.
 */
function AlarmType(catId, alarmId, name, desc, comment) {
    this.catId = catId; // category id
    this.alarmId = alarmId; // numeric
    this.name = name; // e.g. 'hPlatformHhpSlaveOnId'
    this.desc = desc; // e.g. "Slave ON state"
    this.comment = comment; // may be missing
    this.lightweight = null; //load if parameters.lightweight 
    this.toString = function() {
        return "alm:" + catId + "," + alarmId + "," + name;
    };
}


/**
 * Variables containing data tables. 
 * Comes from configuration, such as MIB, parameters, etc.
 */
var AlarmData = {
    initialize: function() {
        
        throw "No needed anymore !!!!!";
        /*
        log.info("AlarmData.initialize()...");
        
        for (var index = 0; index < this.alarmCategories.length; index++) {
            var category = this.alarmCategories[index];
            if (category.enableGeneric) {// take only the generic
                log.info("Adding " + category.toString());
                this.alarmCategoriesMap[category.catId] = category;  
            }
        }
        */
         
        /*
        var count = 0;
        for (var index = 0; index < this.alarmEntries.length; index++) {
            var alarm = this.alarmEntries[index];
            var category = this.alarmCategoriesMap[alarm.catId];
            
            // the entries table category should have a typo !!!
            if (!category) {
                log.error("the entries table category " + alarm.catId + " does not exist. Typo ?");
            }
            
            if (!alarm.name) { // add only if alarm is fully defined
                continue;
            }
            
            category.alarms[alarm.alarmId] = alarm;    
            count++;
            log.debug("adding alarm " + count + " ...AlarmData.alarmCategories[" + alarm.catId + "/" + alarm.alarmId + "] -> " + category.alarms[alarm.alarmId].name);
           
        }   
        */     
    },

    /*
     * Map of categories keyed on catId
     */
    alarmCategoriesMap: {}, // hashmap of alarm categories
        
     /*
     * All alarm categories. Note: some are not used (like ServiceOut)
     */
    alarmCategories: [
         new AlarmCategory(2, "hPlatform", "Platform", true, 2),
         new AlarmCategory(3, "hSlot", "Slot", true, 1),
         new AlarmCategory(4, "hGbeCard", "GbE Pro Card", true, 2),
         new AlarmCategory(5, "hGbePort", "GbE Port", true, 2),

         new AlarmCategory(6, "hGbeInputSocket", "GbE Input Socket"),
         new AlarmCategory(7, "hGbeOutSocket", "GbE Output Access Point"),
         new AlarmCategory(8, "hTsIn", "hTsIn"),
         new AlarmCategory(9, "hRefService", "Reference Service"),
         new AlarmCategory(10, "hStreamOut", "Stream Out"),
         new AlarmCategory(11, "hServiceOut", "Service Out"),
         new AlarmCategory(12, "hServiceIn", "Service In"),
         new AlarmCategory(13, "hAsiOutTs", "Asi Out TS"),
         new AlarmCategory(14, "hDsr", "DSR"),
         new AlarmCategory(15, "hAceTs", "hAceTs"),
         new AlarmCategory(16, "hAceCard", "hAceCard")
         ],
 
         
     /*
      * All alarms.
      */
     alarmEntries: [
         // ========= 2 hPlatform (Platform) ===========
         new AlarmType(2, undefined, "CPC Card Hw Failure"),
         new AlarmType(2, undefined, "CPC Card Temp. Sense Exceed Limits"),
         new AlarmType(2, undefined, "CPC Card Voltage Error"),
         
         new AlarmType(2, 11, 'hPlatformNtpDisconnectionId', "NTP Connection Failure"),
         // new AlarmType(2, 13, 'hPlatformHhpMasterbackoffId', "Master OFF state"),
         // new AlarmType(2, 15, 'hPlatformHhpSlaveOnId', "Slave ON state"),
         new AlarmType(2, 16, 'hPlatformFrontPanelNotExistsId', "Front Panel Not Present"),
         // new AlarmType(2, 17, 'hPlatformCwGeneratingFailureId', "Failure generating CW"),
         // new AlarmType(2, 18, 'hPlatformMoreThanOneNmxId', "More Than One NMX Connected To The Device"),
         new AlarmType(2, 19, 'hPlatformGotNewConfigId', "Got New Configuration"),
         
         // new AlarmType(2, 20, 'hPlatformChng2BackupId', "Platform change to be backup"),
         // new AlarmType(2, 21, 'hPlatformChng2PrimaryId', "Platform change to be primary"),
         // new AlarmType(2, 22, 'hPlatformChngDtmuxPriorityId', "DT Mux priority changed"),
         new AlarmType(2, 23, 'hPlatformPlatformInitialization', "Platform Initializing", "Occur every power-up"),
         new AlarmType(2, 24, 'hPlatformEthAutoNeg0', "Auto-negotiation failed: management network"),
         new AlarmType(2, 25, 'hPlatformEthAutoNeg1', "Auto-negotiation failed: CAS network"),
         // new AlarmType(2, 26, 'hPlatformCouldNotReserveMaxDpiEnginesId', "Could not reserve max Splice engines"),
    
         // new AlarmType(2, 31, 'hPlatformBgDlResetRequired', "Reset required after successful DL"),
         new AlarmType(2, 32, 'hPlatformBgDlInProgressStarted', "Background Download in progress", "Raise from starting download process till device is reset"),
         new AlarmType(2, 33, 'hPlatformBgDlInProgressRetrying', "Background Download in progress - retrying"),
         new AlarmType(2, 34, 'hPlatformBgDlTftpError', "Background Download Failed: TFTP error"),
         new AlarmType(2, 35, 'hPlatformBgDlDiskFull', "Background Download Failed: Disk Full"),
         new AlarmType(2, 36, 'hPlatformBgDlFailed', "Background Download Failed with an error"),
         new AlarmType(2, 37, 'hPlatformBgDlFailed', "Background Download was cancelled"),
         // new AlarmType(2, 38, 'hPlatformReservedBrInSafeMode', "Reserved BR in safe mode"),
         // new AlarmType(2, 39, 'hPlatformEduOnNot1gDevice', "EDU not supported in this HW model"),
    
         // new AlarmType(2, 40, 'hPlatformEduNoControlSocket', "No control channel configured for EDU"),
         // new AlarmType(2, 41, 'hPlatformEduNoPortAvailiable', "EDU - mandatory GBE port is not active"),
         // new AlarmType(2, 42, 'hPlatformEduNoVcasServerConn', "Failed to connect to VCAS Server"),
         // new AlarmType(2, 43, 'hPlatformEduNoTdtRecieved', "No TDT recieved for more than 5 seconds"),
         // new AlarmType(2, 44, 'hPlatformEduNoCatRecieved', "No CAT on control channel more than 5 sec"),
         // new AlarmType(2, 45, 'hPlatformAceReallocRequiredId', "Transcoding Engines Re-Allocation Required"),
         // new AlarmType(2, 46, 'hPlatformEduNotInCat', "Edu doesn't exists in the recieved CAT"),
         // new AlarmType(2, 47, 'hPlatformEduConfNotFound', "RCC missing for more than 5 sec"),
         
         // ========= 3 hSlot (Slot) ===========
         new AlarmType(3, 11, 'hSlotCardMissing', "Card Missing"),
         new AlarmType(3, 12, 'hSlotCardMismatch', "Card Mismatch"),
         
         // ========= 4 hGbeCard (Gbe Pro Card) ===========
         new AlarmType(4, 7, 'hGbeCardInit', "GbE Card Initializing"),
         new AlarmType(4, 6, 'hGbeCardHwFail', "GbE Card HW Failure"),
         new AlarmType(4, 4, 'hGbeCardTempEx', "GbE Card Sensed Temp. Exceeds Limit"),
         new AlarmType(4, 5, 'hGbeCardVoltErr', "GbE Card Voltage Error"),
         new AlarmType(4, 11, 'hGbeCardOutMcastBuffOverflow', "GbE Output Multicast Buffer Overflow"),
         new AlarmType(4, 13, 'hGbeCardInDescrRateExceed', "GbE Input Descrambling Bitrate Exceeded", "Try to descramble more than 500Mb"),
         new AlarmType(4, 8, 'hGbeCardInDataLoss', "GbE Card Input Data Loss"),
         new AlarmType(4, 12, 'hGbeCardPacerClockErr', "Pacer Clock Error"),
         new AlarmType(4, 14, 'hGbeCardFlashUpgrade', "GbE flash upgrade in process", "During SW upgrade"),
         
         // ========= 5 hGbePort (Gbe Port) ===========
         new AlarmType(5, 11, 'hGbePortLinkDisconnect', "GbE Port Link Down-Cable Disconnect"),
         new AlarmType(5, 12, 'hGbePortSfpMissing', "GbE Port SFP Missing"),
         new AlarmType(5, 15, 'hGbePortOutMpegBuffOverflow', "GbE Output MPEG Buffer Overflow"),
         new AlarmType(5, 20, 'hGbePortInNonMPegBuffOverflow', "GbE Input Non MPEG Buffer Overflow"),
         new AlarmType(5, 21, 'hGbePortInterPackGapSmall', "GbE Input Inter Packet Gap Too Small", "Less than 12 clks"),
         new AlarmType(5, 22, 'hGbePortInInvalidPacketLen', "GbE Input Invalid IP/UDP Packet Length"),
         new AlarmType(5, 17, 'hGbePortAutoNegFail', "GbE Auto-Negotiation Failed"),
         new AlarmType(5, 24, 'hGbePortInPacketMissing', "GbE Input IP Packet Missing"),
         new AlarmType(5, 16, 'hGbePortInPacketCrcErr', "GbE Input IP Packet CRC Error"),
         new AlarmType(5, 25, 'hGbePortSlaveChanActive', "GbE Slave Channel Activated", "For port redundancy"),
         new AlarmType(5, 26, 'hGbePortFailed', "GbE Port Failed"),
         
         // ========= 6 hGbeInputSocket (Gbe Input Socket) ===========
         // =concatenate("new AlarmType(6, "& D15& ",'"& C15 & "' , '"& E15&"'),")
         new AlarmType(6, 42,'hGbeInSockPrimaryNotActive' , 'GbE Input Primary Socket Not Active'),
         new AlarmType(6, 41,'hGbeInSockBackNotActive' , 'GbE Input Backup Socket Not Active'),
         new AlarmType(6, 21,'hGbeInSockBuffOverflow' , 'GbE Input Socket Buffer Overflow'),
         new AlarmType(6, 22,'hGbeInSockInvalidClkFreq' , 'Invalid Source Clock Frequency'),
         new AlarmType(6, 24,'hGbeInSockLostPCR' , 'GbE Input Socket Lost PCR'),
         new AlarmType(6, 25,'hGbeInSockErrPCR' , 'GbE Input Socket Erred PCR'),
         new AlarmType(6, 26,'hGbeInSockCbrRateChange' , 'GbE Input Socket CBR Rate Changed', "For input MPTS only"),
         new AlarmType(6, 27,'hGbeInSockMaxJitterEx' , 'GbE Input Socket Max. Jitter Exceeded'),
         new AlarmType(6, 28,'hGbeInSockTimestampErr' , 'GbE Input Socket Timestamp Error'),
         new AlarmType(6, 39,'hGbeInSockBackupActive' , 'GbE Backup Socket Activated'),
         new AlarmType(6, 43,'hGbeInSockQdepthThreshPass' , 'Queue depth threshold passed'),
         new AlarmType(6, 44,'hGbeInSockPrimaryAvMissing' , 'GbE Input Primary Socket-A/V missing'),
         new AlarmType(6, 45,'hGbeInSockBackupAvMissing' , 'GbE Input Backup Socket-A/V missing'),
         
         // new AlarmType(6, 11,'hGbeInSockFailed' , 'GbE Socket Failed'),
         // new AlarmType(6, 51,'hGbeInSockControlFailed' , 'Control channel Failed'),
         // new AlarmType(6, 52,'hGbeInSockPrimaryPatMissing' , 'GbE Input Primary Socket-PAT Missing'),
         // new AlarmType(6, 53,'hGbeInSockBackupPatMissing' , 'GbE Input Backup Socket-PAT Missing'),
         // new AlarmType(6, 54,'hGbeInSockPrimaryPmtMissing' , 'GbE Input Primary Socket-PMT Missing'),
         // new AlarmType(6, 55,'hGbeInSockBackupPmtMissing' , 'GbE Input Backup Socket-PMT Missing'),
         // new AlarmType(6, 56,'hGbeInSockPrimaryCcErr' , 'GbE Input Primary Detected CC Error'),
         // new AlarmType(6, 57,'hGbeInSockBackupCcErr' , 'GbE Input Backup Detected CC Error'),
         // new AlarmType(6, 58,'hGbeInSockPrimaryScr' , 'GbE In Primary Detected Scrambled PID'),
         // new AlarmType(6, 59,'hGbeInSockBackupScr' , 'GbE In Backup Detected Scrambled PID'),
         
         // ========= 7 hGbeOutSocket (Gbe output access point) ===========
         new AlarmType(7, 12,'hGbeOutSockNotTransmit' , 'Gbe Output Socket Not Transmitted', "Can be only in unicast"),
         new AlarmType(7, 13,'hGbeOutSockUnreachableDest' , 'Gbe Output Socket - Unreachable Dest.', "Can be only in unicast"),
         new AlarmType(7, 16,'hGbeOutBuffOverflowHigh' , 'Gbe Output Buffer Overflow Level = High'),
         new AlarmType(7, 17,'hGbeOutBuffOverflowNormal' , 'Gbe Output Buffer Overflow Level = Normal'),
         new AlarmType(7, 18,'hGbeOutBuffOverflowMedium' , 'Gbe Output Buffer Overflow Level = Medium'),
         new AlarmType(7, 19,'hGbeOutBuffOverflowLow' , 'Gbe Output Buffer Overflow Level = Low'),
         
         // ========= 8 hTsIn ===========
         new AlarmType(8, 9, 'hTsInCcErrDetected' , 'TsIn CC Error Detected'),
         new AlarmType(8, 10, 'hTsInMpegSyncLoss' , 'TsIn MPEG Sync Loss'),
         new AlarmType(8, 20, 'hTsInInvalidCasMode' , 'Invalid CAS mode'),
         
         // ========= 9 hRefService (Reference Service) ===========
         new AlarmType(9, 11, 'hRefSrvRemapRangeOverflow', 'Remap Range Overflow', "More PIDs than defined in the range"),
         new AlarmType(9, 12, 'hRefSrvInServiceMissing', 'Input Service Missing', "Not found PMT for this service"),
         new AlarmType(9, 13, 'hRefSrvInRssPidMissing', 'PID From Input RSS Is Missing', "At least one PID"),
         
         // ========= 10 hStreamOut (STREAM OUT) =========
         // new AlarmType(10, 11, 'hStreamOutPidMissingErrorId' , 'PID Missing'),
         // new AlarmType(10, 13, 'hStreamOutUnsupportChromaModeId' , 'Unsupported Chroma Sampling Mode'),
         // new AlarmType(10, 14, 'hStreamOutLowDelayVideoDetectedId' , 'Low-delay Video Stream Detected'),
         // new AlarmType(10, 15, 'hStreamOutHdStreamDetectedId' , 'HD Stream Detected'),
         // new AlarmType(10, 16, 'hStreamOutUnsupportFrameRateId' , 'Unsupported Frame Rate'),
         // new AlarmType(10, 17, 'hStreamOutUnsupportResolutionId' , 'Unsupported Resolution'),
         // new AlarmType(10, 18, 'hStreamOutEncrypdtedPidId' , 'Encrypted PID'),
         // new AlarmType(10, 20, 'hStreamOutNoDtsPtsDetectedId' , 'No DTS/PTS Detected at Input'),
         // new AlarmType(10, 21, 'hStreamOutBadIlligalDtsDetectedId' , 'Invalid DTS at Input'),
         // new AlarmType(10, 22, 'hStreamOutSequenceHeaderErrId' , 'Sequence Header Error'),
         // new AlarmType(10, 23, 'hStreamOutPictureHeaderErrId' , 'Picture Header Error'),
         // new AlarmType(10, 24, 'hStreamOutVideoMacroBlockLevelErrId' , 'Video Macroblock Level Error'),
         // new AlarmType(10, 25, 'hStreamOutVideoMpeg1UnsupportedId' , 'MPEG1 Stream Detected'),
         // new AlarmType(10, 26, 'hStreamOutVideoProRefreshUnsupportedId' , 'Progressive Refresh Stream Detected'),
         // new AlarmType(10, 27, 'hStreamOutVideoFiledPicUnsupportedId' , 'Field Pictures Detected'),
         // new AlarmType(10, 28, 'hStreamOutVideoWrongFormatId' , 'Unexpected Frame Rate (Video Standard)'),
         // new AlarmType(10, 29, 'hStreamOutUnableToDecodeId' , 'Unable to Decode Input Stream'),
         // new AlarmType(10, 30, 'hStreamOutCorruptedInputTsId' , 'Corrupt Input TS'),
         // new AlarmType(10, 31, 'hStreamOutRefPcrIntervalErrorId' , 'Reference PCR PID Interval Error'),
         // new AlarmType(10, 32, 'hStreamOutInputCodecNotSupported' , 'Input Codec Not Supported'),
         // new AlarmType(10, 33, 'hStreamOutOutputCodecNotSupported' , 'Output Codec Not Supported'),
         // new AlarmType(10, 34, 'hStreamOutNotHd2hdXcoding' , 'SD Transcoding Not Supported'),
         
         // new AlarmType(10, 40, 'hStreamOutProcessingInputPidMissing' , 'Processing Input PID Missing'),
         // new AlarmType(10, 41, 'hStreamOutWrongVideoStandard' , 'Wrong Video Standard (MPEG2/H264)'),
         // new AlarmType(10, 42, 'hStreamOutVideoVresInputMismatch' , 'Input Vertical Resolution Mismatch'),
         // new AlarmType(10, 43, 'hStreamOutVideoVresInputChange' , 'Vertical Resolution Changed on Input'),
         // new AlarmType(10, 44, 'hStreamOutVideoInvalidPictureType' , 'Invalid Picture Type (not I, P or B)'),
         // new AlarmType(10, 45, 'hStreamOutPidXcodingFailureId' , 'PID Xcoding Failure'),
         // new AlarmType(10, 46, 'hStreamOutWrongVideoFormatId' , 'Wrong Video Format (SD/HD)'),
         // new AlarmType(10, 50, 'hStreamOutRmuxModePidMissingId' , 'Input component not detected'),
         // new AlarmType(10, 999, 'hStreamOutPidRecodingFailureId' , 'PID Recoding Failure'),
         
         
         // ========= 11 hServiceOut (Service Out) =========
         new AlarmType(11, undefined, undefined , 'Failed to Receive CW for the Service'),
         new AlarmType(11, undefined, undefined , 'Invalid Response from VM Client'),
         new AlarmType(11, undefined, undefined , 'Missing ECM'),
         new AlarmType(11, undefined, undefined , 'Missing CA information'),
         new AlarmType(11, undefined, undefined , 'Undefined scrambling algorithm'),
         new AlarmType(11, undefined, undefined , 'Unsupported scrambling algorithm'),         
         
         new AlarmType(11, 14, 'hServiceOutBackupSrv1ActivatedId' , 'Backup Service1 Is Activated', "For service redundancy"),
         // new AlarmType(11, 15, 'hServiceOutBackupSrv2ActivatedId' , "Backup Service2 Is Activated"),
         // new AlarmType(11, 16, 'hServiceOutBackupSrv3ActivatedId' , "Backup Service3 Is Activated"),
         new AlarmType(11, 17, 'hServiceOutServiceFailureId' , "Service Failure"),
         // new AlarmType(11, 18, 'hServiceOutServiceRecodingUnitFailureId' , "Recoding Unit Failure"),
         // new AlarmType(11, 19, 'hServiceOutServiceInputPcrIntervalErrId' , "Input PCR Interval Error"),

         // new AlarmType(11, 20, 'hServiceOutServiceCorruptedInputPcrId' , "Corrupted Input PCR"),
         // new AlarmType(11, 21, 'hServiceOutServicePcrOnUnsupportPidId' , "PCR On Unsupported Component"),
         // new AlarmType(11, 22, 'hServiceOutServiceTooManyEsId' , "Too Many ES"),
         // new AlarmType(11, 23, 'hServiceOutServiceCouldNotAllocRecoderId' , "Could Not Allocate Recoding Unit"),
         // new AlarmType(11, 24, 'hServiceOutServiceExceedNonVidRate' , "Excessive Non-Video Rate"),
         // new AlarmType(11, 25, 'hServiceOutServiceDroppedIFrame' , "I-Frame Dropped"),
         // new AlarmType(11, 26, 'hServiceOutServiceRequiredVideoEs' , "ReEncoded Service Required Video ES"),
         // new AlarmType(11, 27, 'hServiceOutServiceRateTooLow' , "ReEncoded Service Rate Too Low"),
         // new AlarmType(11, 28, 'hServiceOutServiceEasActiveId' , "EAS is Activated"),
         // new AlarmType(11, 29, 'hServiceOutServiceEasInpMissingId' , "EAS Input Service Missing"),
                   
         // new AlarmType(11, 30, 'hServiceOutServicePtExceededMaxRate' , "Pass-Through Service Exceeded Max Rate"),
         // new AlarmType(11, 31, 'hServiceOutSlateSrvActivatedId' , "Slate Service is Activated"),
         // new AlarmType(11, 32, 'hServiceOutSlateSrvFailureId' , "Slate Service Failure"),
         new AlarmType(11, 33, 'hServiceOutPrimarySrvFailureId' , "Primary Service Failure"),
         new AlarmType(11, 34, 'hServiceOutBackupSrv1FailureId' , "Backup Service1 Failure"),
         // new AlarmType(11, 35, 'hServiceOutBackupSrv2FailureId' , "Backup Service2 Failure"),
         // new AlarmType(11, 36, 'hServiceOutBackupSrv3FailureId' , "Backup Service3 Failure"),
         // new AlarmType(11, 37, 'hServiceOutServiceInvalidCasMode' , "Invalid CAS mode"),
         // new AlarmType(11, 38, 'hServiceOutServiceNameScte30ErrorId' , "Service Name SCTE30 Error"),
         // new AlarmType(11, 39, 'hServiceOutServiceSplExceedEsCapacityId' , "Exceeded Spliceable ESs Capacity"),

         // new AlarmType(11, 40, 'hServiceOutServiceInpPmtErrorId' , "Input PMT Missing"),
         // new AlarmType(11, 41, 'hServiceOutServiceInpVctErrorId' , "Input VCT Missing"),
         // new AlarmType(11, 42, 'hServiceOutServiceSplNoScte30ConnId' , "No SCTE30 Connection"),
         // new AlarmType(11, 43, 'hServiceOutServiceSplAdChannelMissingId' , "Insertion channel is missing"),
         // new AlarmType(11, 44, 'hServiceOutServiceCouldNotAllocXcoderId' , "Could Not Allocate Transcoding Unit"),
         // new AlarmType(11, 45, 'hServiceOutServiceCouldNotAllocXcoderId' , "Could Not Allocate Transcoding Unit"),
         // new AlarmType(11, 46, 'hServiceOutServiceXcodingUnitFailureId' , "Transcoding Unit Failure"),
         // new AlarmType(11, 47, 'hServiceOutServiceWrongProccSelectionId' , "Processing conflict (ReEnc and Trans)"),
         // new AlarmType(11, 48, 'hServiceOutServiceXcodingGapDetectedId' , "Transcoding Unit Gap Detected"),
         // new AlarmType(11, 49, 'hServiceOutServiceXcodingVdspAssertId' , "Transcoding Unit VIdeo Processing Error"),

         // new AlarmType(11, 50, 'hServiceOutServiceXcodingGeneralErrorId' , "Transcoding Unit General Error"),
         // new AlarmType(11, 51, 'hServiceOutServiceXcodingRateTooLowId' , "Transcoding Unit Rate is Too Low"),
         // new AlarmType(11, 52, 'hServiceOutServiceXcodingRateTooHighId' , "Transcoding Unit Rate is Too High"),
         // new AlarmType(11, 53, 'hServiceOutServiceXcodingMissingRateId' , "Transcoding Unit Rate is Missing"),
         // new AlarmType(11, 54, 'hServiceOutServiceXcodingMissingCxId' , "Transcoding Unit Complexity is Missing"),
         // new AlarmType(11, 55, 'hServiceOutBoSrv1ActivatedId' , "Alternative  1 Is Activated"),
         // new AlarmType(11, 56, 'hServiceOutBoSrv2ActivatedId' , "Alternative  2 Is Activated"),
         // new AlarmType(11, 57, 'hServiceOutBoSrv3ActivatedId' , "Alternative  3 Is Activated"),
         // new AlarmType(11, 58, 'hServiceOutBoSrv4ActivatedId' , "Alternative  4 Is Activated"),
         // new AlarmType(11, 59, 'hServiceOutBoSrv5ActivatedId' , "Alternative  5 Is Activated"), 
         
         // new AlarmType(11, 60, 'hServiceOutBoSrv1FailureId' , "Alternative  1 Failure"),
         // new AlarmType(11, 61, 'hServiceOutBoSrv2FailureId' , "Alternative  2 Failure"),
         // new AlarmType(11, 62, 'hServiceOutBoSrv3FailureId' , "Alternative  3 Failure"),
         // new AlarmType(11, 63, 'hServiceOutBoSrv4FailureId' , "Alternative  4 Failure"),
         // new AlarmType(11, 64, 'hServiceOutBoSrv5FailureId' , "Alternative  5 Failure"),
         // new AlarmType(11, 65, 'hServiceOutUnconServActFailureId' , "Try to switch to illegal Alternative"),
         // new AlarmType(11, 66, 'hServiceOutServSubstFailureId' , "Service substitution failure"),

         // new AlarmType(11, 70, 'hServiceOutPrimaryBdsSocketMissingId' , "Primary BDS Socket Missing"),
         // new AlarmType(11, 71, 'hServiceOutBackupBdsSocketMissingId' , "Backup BDS Socket Missing"),
         // new AlarmType(11, 72, 'hServiceOutBdsSocketFailedId' , "BDS Socket Failed"),
         // new AlarmType(11, 73, 'hServiceOutPrimaryBdsSetupFailedId' , "Primary BDS Setup Failed"),
         // new AlarmType(11, 74, 'hServiceOutBackupBdsSetupFailedId' , "Backup BDS Setup Failed"),
         // new AlarmType(11, 75, 'hServiceOutBackupBdsSocketActivatedId' , "Backup BDS Socket Activated"),
         // new AlarmType(11, 76, 'hServiceOutOffairBdsIsActivatedId' , "OffAir BDS is activated"),
         
         // new AlarmType(11, 80, 'hServiceOutBoSrv1IdenDescrMissId' , "Alternative 1 miss some Ident descriptors"),
         // new AlarmType(11, 81, 'hServiceOutBoSrv2IdenDescrMissId' , "Alternative 2 miss some Ident descriptors"),
         // new AlarmType(11, 82, 'hServiceOutBoSrv3IdenDescrMissId' , "Alternative 3 miss some Ident descriptors"),
         // new AlarmType(11, 83, 'hServiceOutBoSrv4IdenDescrMissId' , "Alternative 4 miss some Ident descriptors"),
         // new AlarmType(11, 84, 'hServiceOutBoSrv5IdenDescrMissId' , "Alternative 5 miss some Ident descriptors"),
         // new AlarmType(11, 85, 'hServiceOutPrimaryIdenDescrMissId' , "Primary Service miss some Ident descriptors"),

         // new AlarmType(11, 999, 'hServiceOutServiceMissRate' , "ReEncoded Service Missed Rate"),
         
         
         // ========= 12 hServiceIn (Service In) =========
         // new AlarmType(12, 12, 'hServiceInInvalidVmClientResponse' , "Invalid Response from VM Client"),
         // new AlarmType(12, 13, 'hServiceInEcmMissing' , "Missing ECM"),
         // new AlarmType(12, 14, 'hServiceInCaInfoMissing' , "Missing CA information"),
         // new AlarmType(12, 15, 'hServiceInCwReceiveFail' , "Failed to Receive CW for the Service"),

         // ========= 13 hAsiOutTs (Asi Out TS ) =========
         // new AlarmType(13, 14, 'hAsiOutTsAsiOutTsUnderflow' , "ASI Output Underflow"),
         // new AlarmType(13, 2,  'hAsiOutTsProvisionErrorId' , "AsiOutAp Provision Error"),
         // new AlarmType(13, 11, 'hAsiOutTsTsInvalidRegenMode' , "DVB Regen. not supported in this HW model"),
         // new AlarmType(13, 16, 'hAsiOutTsTsBufOverflowHighId' , "ASI Output Overflow Level = High"),
         // new AlarmType(13, 17, 'hAsiOutTsTsBufOverflowNormalId' , "ASI Output Overflow Level = Normal"),
         // new AlarmType(13, 18, 'hAsiOutTsTsBufOverflowMediumId' , "ASI Output Overflow Level=Medium"),
         // new AlarmType(13, 19, 'hAsiOutTsTsBufOverflowLowId' , "ASI Output Overflow Level=Low"),
         // new AlarmType(13, 20, 'hAsiOutTsTsInvalidCasMode' , "Invalid CAS mode"),
         // new AlarmType(13, 21, 'hAsiOutTsAsiOutLocalDsrBufOverflow' , "DSR Inserted bitrate too high"),
         // new AlarmType(13, 22, 'hAsiOutTsAsiOutNationalDsrBufOverflow' , "DSR National output bitrate exceeded"),
         // new AlarmType(13, 23, 'hAsiOutTsAsiOutLocalDsrBufUnderflow' , "DSR Local output underflow"),
         // new AlarmType(13, 24, 'hAsiOutTsAsiOutNationalDsrBufUnderflow' , "DSR National output underflow"),
         
         // ========= 14 hDsr (DSR) =========
         // new AlarmType(14, 1, 'hDsrDsrNationalSyncLoss' , "National input Sync Loss"),
         // new AlarmType(14, 2, 'hDsrDsrNationalCcErrors' , "National input CC Errors"),
         // new AlarmType(14, 3, 'hDsrDsrLocalSyncLoss' , "Local Input Sync Loss"),
         // new AlarmType(14, 4, 'hDsrDsrLocalCcErrors' , "Local Input CC Errors"),
         // new AlarmType(14, 5, 'hDsrDsrMipMissing' , "MIP PID is missing on input"),
         // new AlarmType(14, 6, 'hDsrDsrIrpOff' , "IRP DSR mode is off"),
         
         // ========= 15 hAceTs =========
         // new AlarmType(15, 10, 'hAceTsAcetsCommProblem' , "No Comm with TransEngine"),
         // new AlarmType(15, 20, 'hAceTsAcetsLossOfInputStream' , "Loss of Input Transport Stream (no nulls)"),
         // new AlarmType(15, 21, 'hAceTsAcetsApplicationError' , "TransEngine Application Error (no output)"),
         // new AlarmType(15, 23, 'hAceTsAcetsHostEngineSyncError' , "Host-TransEngine Sync Error (time change)"),
         // new AlarmType(15, 24, 'hAceTsAcetsRxOverflowError' , "TS RX Overflow Error"),
         // new AlarmType(15, 25, 'hAceTsAcetsTxUnderflowError' , "TS TX Underflow Error"),
         // new AlarmType(15, 26, 'hAceTsAcetsCriticalError' , "Critical Error- request for reset"),
         // new AlarmType(15, 11, 'hAceTsAcetsSignalLoss' , "TransEngine FPGA Signal Loss"),
         // new AlarmType(15, 12, 'hAceTsAcetsSyncLoss' , "TransEngine FPGA Sync Loss"),
         // new AlarmType(15, 16, 'hAceTsTsBufOverflowHighId' , "TransEngine FPGA Output Overflow"),
         
         // ========= 16 hAceCard  =========
         // new AlarmType(16, 4, 'hAceCardCardHighTemperatureId' , "Ace Card Temp. Sense Exceed Limits"),
         // new AlarmType(16, 5, 'hAceCardCardVoltageErrorId' , "Ace Card Voltage Error"),
         // new AlarmType(16, 6, 'hAceCardCardFailureId' , "Ace Card Failure"),
         // new AlarmType(16, 7, 'hAceCardCardInitId' , "Ace Card Initializing"),
         //new AlarmType(16, 21, 'hAceCardCardNotSupportedInHwId' , "Ace Card not supported in the HW model")
      ],

};




/***************************************************************
 * Initialize my driver and our variables
 ***************************************************************/

var MyPlugin = new ProStreamPlugin(this.parameters);// passing empty parameters


/***************************************************************
 * Creation of a new SNMP driver (using generic.js)
 ***************************************************************/

function synchronize(func) {
    return new Packages.org.mozilla.javascript.Synchronizer(func);
}

var SNMP;

var StartGeneric = synchronize(function() {
//var StartGeneric = function() {
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
//};
});

StartGeneric();

/**
 * Read incoming parameters.
 */


MyPlugin.createAlarms(AlarmData.alarmCategoriesMap);
SNMP.setDevicePathPrefix( MyPlugin.path );
SNMP.setSNMPretries( MyPlugin.retries );
SNMP.setSNMPtimeout( MyPlugin.timeout );
//SNMP.setSNMPinterval( MyPlugin.pollInterval );
SNMP.setSNMPReadCommunity( MyPlugin.readCommunity );
SNMP.enableGet(false);// device does support snmpget (no polling)


/**
 * TrapHandler
 *   2013-10-29 12:23:58,018 [Thread-11] WARN  Trap Counter 10.12.170.55  - *************** Start *****************
 *   2013-10-29 12:23:58,018 [Thread-11] WARN  Trap Counter 10.12.170.55  - community: public
 *   2013-10-29 12:23:58,019 [Thread-11] WARN  Trap Counter 10.12.170.55  - enterprise: null
 *   2013-10-29 12:23:58,019 [Thread-11] WARN  Trap Counter 10.12.170.55  - remotehostIP: undefined
 *   2013-10-29 12:23:58,022 [Thread-11] WARN  Trap Counter 10.12.170.55  - remotePort: 161
 *   2013-10-29 12:23:58,022 [Thread-11] WARN  Trap Counter 10.12.170.55  - specificType: 0
 *   2013-10-29 12:23:58,023 [Thread-11] WARN  Trap Counter 10.12.170.55  - trapOID: .1.3.6.1.4.1.1563.1.1.3.8.0.9
 *   2013-10-29 12:23:58,023 [Thread-11] WARN  Trap Counter 10.12.170.55  - trapType: 0
 *   2013-10-29 12:23:58,023 [Thread-11] WARN  Trap Counter 10.12.170.55  - upTime: 753300
 *   2013-10-29 12:23:58,024 [Thread-11] WARN  Trap Counter 10.12.170.55  - version: 1
 *   2013-10-29 12:23:58,026 [Thread-11] WARN  Trap Counter 10.12.170.55  - Variable .1.3.6.1.2.1.1.3.0 : 753300
 *   2013-10-29 12:23:58,026 [Thread-11] WARN  Trap Counter 10.12.170.55  - Variable .1.3.6.1.6.3.1.1.4.1.0 : .1.3.6.1.4.1.1563.1.1.3.8.0.9
 *   2013-10-29 12:23:58,026 [Thread-11] WARN  Trap Counter 10.12.170.55  - Variable .1.3.6.1.4.1.1563.1.1.3.1.1.0 : 9
 *   2013-10-29 12:23:58,026 [Thread-11] WARN  Trap Counter 10.12.170.55  - Variable .1.3.6.1.4.1.1563.1.1.3.1.2.0 : 4000015
 *   2013-10-29 12:23:58,026 [Thread-11] WARN  Trap Counter 10.12.170.55  - Variable .1.3.6.1.4.1.1563.1.1.3.1.3.0 : 4
 *   2013-10-29 12:23:58,027 [Thread-11] WARN  Trap Counter 10.12.170.55  - Variable .1.3.6.1.4.1.1563.1.1.3.1.4.0 : ASI@005.003
 *   2013-10-29 12:23:58,027 [Thread-11] WARN  Trap Counter 10.12.170.55  - Variable .1.3.6.1.4.1.1563.1.1.3.1.5.0 : 24/10/2013
 *   2013-10-29 12:23:58,030 [Thread-11] WARN  Trap Counter 10.12.170.55  - Variable .1.3.6.1.4.1.1563.1.1.3.1.6.0 : 1
 *   2013-10-29 12:23:58,030 [Thread-11] WARN  Trap Counter 10.12.170.55  - ***************  End  *****************

 */




SNMP.setTrapHandler(function(event) {

    var Oids = {
            snmp: new SNMPAgent(),
            trapAlarmID: snmp.getOID(MyPlugin.mib,'trapAlarmID'),
            //trapPhysicalIndex: snmp.getOID(MyPlugin.mib,'trapPhysicalIndex'), 
            trapSeverity: snmp.getOID(MyPlugin.mib,'trapSeverity'),
            trapInfoString: snmp.getOID(MyPlugin.mib,'trapInfoString'),
            trapAssertTime: snmp.getOID(MyPlugin.mib,'trapAssertTime'),
            trapAlarmState: snmp.getOID(MyPlugin.mib,'trapAlarmState')
    };

    try {
        
    
        //We got a Trap, we make sure it comes from the host we are watching
        if (event.agentAddress != host) {
           log.error("agentAddress " + event.agentAddress + " vs " + host);
           return;
        }
        
        //logging trap information
        log.info("*************** Start *****************[" + Oids.trapAlarmID +"]");

        log.info("community: " + event.community);
        log.info("enterprise: " + event.enterprise);
        log.info("remotehostIP: " + event.remotehostIP);
        log.info("remotePort: " + event.remotePort);
        log.info("specificType: " + event.specificType);
        log.info("trapOID: " + event.trapOID);
        log.info("trapType: " + event.trapType);
        log.info("upTime: " + event.upTime);
        log.info("version: " + event.version);
        log.info("--------: ");
        log.info("Oids.trapSeverity  : " + Oids.trapSeverity);
        log.info("Oids.trapInfoString: " + Oids.trapInfoString);
        for ( var ii in event.variables) {
            log.info("Variable " + ii + " : " + event.variables[ii]);
        }
        log.info("***************  End  *****************");
           
        var alarmId = event.variables[Oids.trapAlarmID];// 9
        var trapSeverity = event.variables[Oids.trapSeverity]; // e.g. 4
        var trapInfoString = event.variables[Oids.trapInfoString];// e.g. " ASI@005.003 TsIn CC Error Detected"
        var trapAssertTime = event.variables[Oids.trapAssertTime];// eg. "24/10/2013 14:21:10"
        var trapAlarmState = event.variables[Oids.trapAlarmState];// eg. 2   
        
        log.info("processingtrap +++++++++>>" + event.trapOID + " - " +  alarmId + " - " +  trapSeverity + " - "
                +  trapInfoString + " - " +  trapAssertTime + " - " +  trapAlarmState);

        TrapProcessor.process(event.trapOID, alarmId, trapSeverity, trapInfoString, trapAssertTime, trapAlarmState);
             
    } catch (ex) {
        log.error("Error in setTrapHandler(): " + ex);
    }       
 });  


/**
 * TrapProcessor processes traps: validate trap values and update associated alarm.
 */
var TrapProcessor = {
        
        /**
         * Process a trap: validate trap values and update associated alarm.
         * @param trapOID eg ".1.3.6.1.4.1.1563.1.1.3.8.0.9"
         */
        
        process: function(trapOID, alarmId, sev, infoStr, assertTime, alarmState) {
            /**
             * extract category id.
             * Example "8" from ".1.3.6.1.4.1.1563.1.1.3.8"
             */
            var oidValues = trapOID.split(".");
            var catId = oidValues[11];
            
            var category = MyPlugin.alarmCategories[catId];
            log.info("TrapProcessor.process: " + trapOID + "catId:" + catId + " - alarmId:" + alarmId + " - sev:" + sev 
                    + " - infoStr:" + infoStr + " - assertTime:" + assertTime + " - alarmState:" + alarmState);
            
            /**
             * 
             */
            category = MyPlugin.alarmManager.getHolder(category).category;// query the category (unmanaged events will go to the 'othersHolder'
            
            if (!category) {
                log.error("Unknown alarm category " + catId + " (alarmId=" + alarmId + " " + infoStr + ")");
                return;
            }
            
            
            var severity = MyPlugin.severityManager.getSeverity(parseInt(sev));
            if (!severity) {
                log.error("Unknown alarm severity " + sev + " (alarmId=" + alarmId + " " + infoStr + ")");
                return;
            }

            var alarmType = MyPlugin.alarmTypes[catId + ":" + alarmId];
            if (!alarmType) {
                var error = "[" + catId + ":" + alarmId + "] Unknown alarm type " + alarmId + " " + infoStr + " Creating new....";
                log.error(error);
                alarmType = new AlarmType(catId, alarmId, infoStr, infoStr); // use infoStr for alarm name
            }
            
            
            /**
             * Add or remove events
             */
            var isOn = (alarmState == 1); // 1=on, 2=off

            if (isOn) {
                MyPlugin.alarmManager.addEvent(category, alarmType, severity, infoStr);
            } else {
                MyPlugin.alarmManager.removeEvent(category, alarmType);
            }
            
            /**
             * Update the gsm alarms
             */
            var eventStack = MyPlugin.alarmManager.getStack(category);
 
            for (var i = 0; i < category.nbGeneric; i++) {
                
                var gsmAlarm = MyPlugin.alarmManager.getGsmAlarm(category, i);
                
                if (eventStack[i]) {
                    log.info(">> Updating gsmAlarm: " + alarmType.toString());
                    var alarmEvent = eventStack[i];
                    this.updateGsmAlarm(gsmAlarm, alarmEvent);
                } else {
                    log.info(">> Clearing gsmAlarm: " + alarmType.toString());
                    this.clearGsmAlarm(gsmAlarm);
                }
            }
            
        },

        updateGsmAlarm: function(gsmAlarm, alarmEvent) {
            gsmAlarm.status = alarmEvent.severity.convertToGsm();
            gsmAlarm.text = alarmEvent.text;
            
        },
        clearGsmAlarm: function(gsmAlarm) {
            gsmAlarm.status = alarm.NORMAL;
            gsmAlarm.text = "";
            
        }
};


/**********************************
 * Start plugin.
 **********************************/
try {
    SNMP.start();
} catch(ex) {};




