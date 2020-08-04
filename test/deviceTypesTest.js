/**************************************************************************************
 * File: deviceTypes.js
 * Test for device types.
 * nov 13, 2013.
 **************************************************************************************/

// load the required scripts
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\lib\\jsHamcrest-0.7.0.js");
//load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\lib\\jsMockito-1.0.4.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\src\\deviceTypes.js");
JsHamcrest.Integration.Rhino(); // use the Rhino library

var DeviceManager = new DeviceManagerCtor();

assertThat(DeviceManager.find(0, 0), equalTo(DeviceManager.XMS), "DeviceManager.find(0, 0)");
assertThat(DeviceManager.find(2, 3), equalTo(DeviceManager.NetProcessor9040), "DeviceManager.find(2, 3)");
assertThat(DeviceManager.find(95, 1), equalTo(DeviceManager.CP6000Chassis), "DeviceManager.find(95, 1)");

/**
 * 
 */
assertThat(DeviceManager.find(13,0), equalTo(DeviceManager.IP_SWITCH), "DeviceManager.find(13,0)");

/*
 * NOTE: device(12, 19) is AmethystASI, but (12,29) and (12,32) point to GENERIC_SWITCH!!!
 *       We allow for defined extype and undefined one!
 */
assertThat(DeviceManager.find(12, 19), equalTo(DeviceManager.AmethystASI), "DeviceManager.find(12, 19)");
assertThat(DeviceManager.find(12, 29), equalTo(DeviceManager.NEVION_SWITCH), "DeviceManager.find(12,29)");
assertThat(DeviceManager.find(12, 32), equalTo(DeviceManager.NEVION_SWITCH_RESOURCE), "DeviceManager.find(12,32)");


/**
 * ANY_DEVICE for any device that is not defined.!
 */
assertThat(DeviceManager.find(2, undefined), equalTo(DeviceManager.ANY_DEVICE), "DeviceManager.find(2, undefined)");
assertThat(DeviceManager.find(undefined, undefined), equalTo(DeviceManager.ANY_DEVICE), "DeviceManager.find(undefined, undefined");

/**
 * Test the EM4008 resourceId parser.
 */
var resIdValue = "ENC6/VIDEO.IN";
assertThat(em4008ResourceIdParser("ENC1/VIDEO.IN"), equalTo("ENC1"), "em4008ResourceIdParser('ENC1/VIDEO.IN') Ok");
assertThat(em4008ResourceIdParser("ENC6/VIDEO.IN"), equalTo("ENC6"), "em4008ResourceIdParser('ENC6/VIDEO.IN') Ok");
assertThat(em4008ResourceIdParser("ENC9/VIDEO.IN"), equalTo(undefined), "em4008ResourceIdParser('ENC9/VIDEO.IN') should be ENC1->ENC8");
assertThat(em4008ResourceIdParser("ENC/VIDEO.IN"), equalTo(undefined), "em4008ResourceIdParser('ENC/VIDEO.IN') should be ENC1->ENC8)");
assertThat(em4008ResourceIdParser("ENC6 VIDEO.IN"), equalTo(undefined), "em4008ResourceIdParser('ENC6 VIDEO.IN') contains no slash");
