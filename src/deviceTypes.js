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

