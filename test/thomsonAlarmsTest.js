/**************************************************************************************
 * File: thomsonAlarmsTest.js
 * Tests of alarms.
 * nov13.2013
 */

// load the required scripts
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\lib\\jsHamcrest-0.7.0.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\lib\\jsMockito-1.0.4.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\lib\\mockObjects.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\src\\deviceTypes.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\src\\thomsonAlarms.js");
//load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\src\\topoReader.js");
JsHamcrest.Integration.Rhino(); // use the Rhino library

var DeviceManager = new DeviceManagerCtor();
var ThomsonSeverityManager = new ThomsonSeverityManagerCtor();
var AlarmManager = new AlarmManagerCtor();

/*
assertThat(ThomsonSeverityManager.get(1), equalTo(ThomsonSeverityManager.INFORM), "ThomsonSeverityManager.get(1)");
assertThat(ThomsonSeverityManager.get(4), equalTo(ThomsonSeverityManager.MINOR), "ThomsonSeverityManager.get(4)");
assertThat(ThomsonSeverityManager.get(999), equalTo(undefined), "ThomsonSeverityManager.get(999)");
*/

assertThat(ThomsonSeverityManager.convertSeverityValueToThomsonSeverity("severityIndeterminate(2)"), equalTo(ThomsonSeverityManager.INDETERMINATE), "ThomsonSeverityManager.convertSeverityValueToThomsonSeverity('severityIndeterminate(2)')");
assertThat(ThomsonSeverityManager.convertSeverityValueToThomsonSeverity("severityCritical(6)"), equalTo(ThomsonSeverityManager.CRITICAL), "ThomsonSeverityManager.convertSeverityValueToThomsonSeverity('severityIndeterminate(2)')");
assertThat(ThomsonSeverityManager.convertSeverityValueToThomsonSeverity("blah"), equalTo(undefined), "ThomsonSeverityManager.convertSeverityValueToThomsonSeverity('blah')");

/**
 * Tests severity values.
 */
assertThat(ThomsonSeverityManager.get(1), is(ThomsonSeverityManager.INFORM), "ThomsonSeverityManager.get(1)");
assertThat(ThomsonSeverityManager.get(5), is(ThomsonSeverityManager.MAJOR), "ThomsonSeverityManager.get(5)");
assertThat(ThomsonSeverityManager.get(999), is(undefined), "ThomsonSeverityManager.get(999)");


/**
 * Verify that DeviceType's have their alarms.
 * The number of alarms per device type are simply counted from the list.
 */
assertThat(DeviceManager.XMS.alarms.length, equalTo(8), "XMS key alarms.");
assertThat(DeviceManager.XMU.alarms.length, equalTo(14), "XMU key alarms.");
assertThat(DeviceManager.EM4008.alarms.length, equalTo(17), "EM4008 key alarms.");
assertThat(DeviceManager.Sapphire.alarms.length, equalTo(3), "Sapphire key alarms.");
assertThat(DeviceManager.AmethystASI.alarms.length, equalTo(10), "AmethystASI key alarms.");
assertThat(DeviceManager.AmethystIP.alarms.length, equalTo(8), "AmethystIP key alarms.");
assertThat(DeviceManager.NetProcessor9030.alarms.length, equalTo(21), "NetProcessor9030 key alarms.");
assertThat(DeviceManager.NetProcessor9040.alarms.length, equalTo(21), "NetProcessor9040 key alarms.");
assertThat(DeviceManager.CP6000Chassis.alarms.length, equalTo(20), "CP6000Chassis key alarms.");
