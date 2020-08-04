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
