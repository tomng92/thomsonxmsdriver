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


