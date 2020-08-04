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
        //for (var i = 0; i < mibIndices.length; i++) {
        for (i in mibIndices) {
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
        //for (var i = 0; i < mibIndices.length; i++) {
        for (i in mibIndices) {
            
            var device = this._devicesByName[mibNames[i]];            
            device.parent = this._devicesByIndex[mibParents[i]];
        }   
        
        
        // For each device that have subdevice creator function, invoke it to create subdevices
        //for (var i = 1; i < this._devicesByIndex.length; i++) {    // start from 1 because we can skip the XMS        
        for (i in this._devicesByIndex) {    // start from 1 because we can skip the XMS
        	if (i == 0) continue;// skip xms
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

