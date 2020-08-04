/**************************************************************************************
 * File: topoReader.js
 * Tests the TopoReader.
 * nov13.2013
 */

// load the required scripts
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\lib\\jsHamcrest-0.7.0.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\lib\\jsMockito-1.0.4.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\lib\\mockObjects.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\src\\deviceTypes.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\src\\utilities.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\src\\thomsonAlarms.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\src\\alarmStacks.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\src\\topoReader.js"); // topoReader requires DeviceManager to be instanciated.
JsHamcrest.Integration.Rhino(); // use the Rhino library


var DeviceManager = new DeviceManagerCtor();
var ThomsonSeverityManager = new ThomsonSeverityManagerCtor();
var AlarmManager = new AlarmManagerCtor();
var pluginDummy = {mib:"Dummy-MIB"};
var TopologyReader = new TopologyReaderCtor(pluginDummy);



/**
 * Use jsMockito to fake function extractIndexedValuesInTable().
 * Tell it to return required values to build the hierarchy below:
 * 
 *      XMS
 *       +---XMU_01                  +--ENC1  (ENC1->ENC8 automatically created by the subdevicesCreatorFunction)
 *            +----EM187-------------+--...
 *            +----NFP248            +--ENC8
 *            +----MY-ANY-DEVICE
 * 
 * Values required in the XMS topology group:
 * 
 *   topoElementIndex.1:-->1
 *   topoElementIndex.2:-->2
 *   topoElementIndex.3:-->3
 *   
 *   topoElementIndex.4:-->4
 *   topoElementName.1:-->XMU_01
 *   topoElementName.2:-->EM187
 *   topoElementName.3:-->NFP248
 *   topoElementName.4:-->MY-ANY-DEVICE
 *   topoElementParentIndex.1:-->0
 *   topoElementParentIndex.2:-->1
 *   topoElementParentIndex.3:-->1
 *   topoElementParentIndex.4:-->1
 *   
 */
var extractIndexedValuesInTable = JsMockito.mockFunction("extractIndexedValuesInTable");
JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementIndex').thenReturn([1,2,3,4]);
JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementName').thenReturn(["XMU_01", "EM187", "NFP248", "MY-ANY-DEVICE"]);
JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementParentIndex').thenReturn([0, 1, 1, 1]);
JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementType').thenReturn([4, 16, 12, 13]); // device types
JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementExtType').thenReturn([5, 9, 19, 888]);// device extTtypes

/**
 * Verifying readTopology().
 */
var rootXms = TopologyReader.readTopology();
assertThat(TopologyReader.deviceList.length, equalTo(5 + 8), "Nb devices");// 8 is the nb subdevices ENC1..ENC8 created under EM187.
assertThat(rootXms.type, equalTo(DeviceManager.XMS), "Root should be XMS");


var xmu  = TopologyReader._devicesByIndex[1];
assertThat(xmu.name, equalTo("XMU_01"), "--- Device name");
assertThat(xmu.type, equalTo(DeviceManager.XMU), "type");
assertThat(xmu.parent, equalTo(rootXms), "parent");
assertThat(xmu.path(), equalTo("XMS/SubDevices/XMU_01"), "path");

var em187 = TopologyReader._devicesByIndex[2];
assertThat(em187.name, equalTo("EM187"), "--- Device name");
assertThat(em187.type, equalTo(DeviceManager.EM4008),"type");
assertThat(em187.parent, equalTo(TopologyReader._devicesByIndex[1]), "parent");
assertThat(em187.path(), equalTo("XMS/SubDevices/XMU_01/SubDevices/EM187"), "path");

var nfp248 = TopologyReader._devicesByIndex[3];
assertThat(nfp248.name, equalTo("NFP248"), "--- Device name");
assertThat(nfp248.type, equalTo(DeviceManager.AmethystASI), "type");
assertThat(nfp248.parent, equalTo(TopologyReader._devicesByIndex[1]), "parent");
assertThat(nfp248.path(), equalTo("XMS/SubDevices/XMU_01/SubDevices/NFP248"), "path");

// check the subdevices created under the EM187
var subDeviceEnc1 = TopologyReader.getDeviceByName("EM187:ENC1");
assertThat(subDeviceEnc1.name, equalTo("ENC1"), "--- Device name");
assertThat(subDeviceEnc1.type, equalTo(DeviceManager.EM4008_ENC), "type");
assertThat(subDeviceEnc1.parent, equalTo(TopologyReader.getDeviceByName("EM187")), "type");
assertThat(subDeviceEnc1.path(), equalTo("XMS/SubDevices/XMU_01/SubDevices/EM187/SubDevices/ENC1"), "path");

function createGsmAlarmFunc(plugin, uri, desc, path) {
    //log.info("createAlarm: " + uri + "  |  " + desc + "  |  " + path );
    return {uri:uri, desc:desc, path:path};// create the fake alarm for testing purpose.
}


/**
 * Now create the GSM alarms
 */
var nonkeyDefinition = [
                        {value: GSM.alarm.CRITICAL, name:"Critical"},
                        {value: GSM.alarm.MAJOR, name:"Major"},
                        {value: GSM.alarm.MINOR, name:"Minor"},
];
TopologyReader.createGsmAlarms(createGsmAlarmFunc, // creator function
                                nonkeyDefinition,// non-key alarm list
                                3); // size of non-key alarm stacks


// verify the alarms created;
var xmsNbAlarms = DeviceManager.XMS.alarms.length;
// assertThat(xms.gsmAlarms.length, equalTo(xmsNbAlarms), "Our device XMS have the same nb of alarms as the XMS-type");
var nonKeyStackCritical = rootXms.nonKeyAlarms[alarm.CRITICAL];
assertThat(nonKeyStackCritical.gsmAlarms.length, equalTo(3));

//assertThat(stack.gsmAlarms.length, equalTo(5), "XMS: PowerSupplyFailure is at [78]");

/**
 * Add & remove key alarm for device EM187
 */
// Add a key alarm
var device = TopologyReader.getDeviceByName("EM187");
updateAlarm(device, undefined, 154, ThomsonSeverityManager.MAJOR, "dummy problem", "");

// check that the first alarm in the stack is the 154 alarm
var alarm = device.keyAlarms[154];
assertThat(alarm.text, equalTo("dummy problem"), "Alarm text");
assertThat(alarm.desc , equalTo("outOfCPUCycles"), "Alarm desc");
assertThat(alarm.path, equalTo("XMS/SubDevices/XMU_01/SubDevices/EM187/Health"), "Alarm path");
assertThat(alarm.uri, equalTo("EM4008/EM187/outOfCPUCycles"), "Alarm uri");

// now remove alarm 154
updateAlarm(device, undefined, 154, ThomsonSeverityManager.CLEAR_ALARM); // severityCleared(1) clears alarm
assertThat(alarm.text, equalTo(""), "Alarm cleared");

/**
 * Create alarm for subdevice "EM187:ENC3"
 */
device = TopologyReader.getDeviceByName("EM187:ENC6");
updateAlarm(device, "ENC6/VIDEO.IN", 2222, ThomsonSeverityManager.MAJOR, "dummy problem", "");
var gsmSev = ThomsonSeverityManager.MAJOR.convertToGsm();
var alarmStack = device.nonKeyAlarms[gsmSev];

// verify that alarm 2222 is found
var found = false;
for (var i = 0; i < alarmStack.stack.length; i++) {
    if (alarmStack.stack[i].alarmId == 2222) {
        found = true;
    }
}
assertThat(found, equalTo(true), "find alarm 2222");

// Now clear alarm 2222
updateAlarm(device, "ENC6/VIDEO.IN", 2222, ThomsonSeverityManager.CLEAR_ALARM);
found = false;
for (var i = 0; i < alarmStack.stack.length; i++) {
    if (alarmStack.stack[i].alarmId == 2222) {
        found = true;
        //assertThat();
    }
}
assertThat(found, equalTo(false), "find alarm 2222");



/**
 * Test adding & removing a non-key alarm.
 * NOTE: A non-key alarm is simply any alarm that is not associated with the device.
 */
updateAlarm(device, undefined, 99999, ThomsonSeverityManager.MAJOR, "dummy problem"); // 9999 is of course not a key alarm
var severity = ThomsonSeverityManager.convertSeverityValueToThomsonSeverity( "severityMajor(5)");
var gsmSeverity = severity.convertToGsm();
var nonKeyAlarmStack = device.nonKeyAlarms[gsmSeverity];
alarmObj = nonKeyAlarmStack.stack[0];
assertThat(alarmObj.alarmId, equalTo(99999), "Alarm should be 99999");

//now remove alarm 9999
updateAlarm(device, undefined, 99999, ThomsonSeverityManager.CLEAR_ALARM, "dummy problem"); // severityCleared(1) clears alarm
assertThat(nonKeyAlarmStack.stack[0], equalTo(undefined), "Alarm 99999 should be removed");

/**
 * ANY_DEVICE should be functionning normally too.
 * (ANY_DEVICE does not have any key alarms)
 */
var device = TopologyReader.getDeviceByName("MY-ANY-DEVICE");
updateAlarm(device, undefined, 99999, ThomsonSeverityManager.MAJOR, "dummy problem"); // 9999 is of course not a key alarm
var severity = ThomsonSeverityManager.convertSeverityValueToThomsonSeverity( "severityMajor(5)");
var gsmSeverity = severity.convertToGsm();
var nonKeyAlarmStack = device.nonKeyAlarms[gsmSeverity];
alarmObj = nonKeyAlarmStack.stack[0];
assertThat(alarmObj.alarmId, equalTo(99999), "Alarm should be 99999");

//now remove alarm 9999
updateAlarm(device, undefined, 99999, ThomsonSeverityManager.CLEAR_ALARM, "dummy problem"); // severityCleared(1) clears alarm
assertThat(nonKeyAlarmStack.stack[0], equalTo(undefined), "Alarm 99999 should be removed");
