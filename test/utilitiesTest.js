/**************************************************************************************
 * File: utilitiesTest.js
 * Tests of utilities.
 * nov22.2013
 */

// load the required scripts
var myBasePath = "C:/Users/consultant/git/ThomsonXMSDriver";
load(myBasePath + "/lib/jsHamcrest-0.7.0.js");
load(myBasePath + "/src/utilities.js");
JsHamcrest.Integration.Rhino(); // use the Rhino library

assertThat(composeBaseAlarmPath("SNMP", "Thomson", "XMS3500", "10.12.170.59"), equalTo("SNMP/Thomson/XMS3500(10.12.170.59)"));
assertThat(composeBaseAlarmPath(undefined, "Thomson", "XMS3500", "10.12.170.59"), equalTo("Thomson/XMS3500(10.12.170.59)"));
assertThat(composeBaseAlarmPath(undefined, undefined, "XMS3500", "10.12.170.59"), equalTo("XMS3500(10.12.170.59)"), "verify for empty category and manuf");
assertThat(composeBaseAlarmPath("  ", "\t ", "XMS3500", "10.12.170.59"), equalTo("XMS3500(10.12.170.59)"), "category and manufacturer should be trimmed");


assertThat(composePrefixURI("SNMP", "Thomson", "XMS3500", "10.12.170.59", "Buiding3-Rack122"), equalTo("SNMP://Buiding3-Rack122:Thomson/XMS3500:10.12.170.59"), "normal case");
assertThat(composePrefixURI("SNMP", "", "XMS3500", "10.12.170.59", "Buiding3-Rack122"), equalTo("SNMP://Buiding3-Rack122:XMS3500:10.12.170.59"), "empty manufacturer");
assertThat(composePrefixURI("SNMP", "", "XMS3500", "10.12.170.59", undefined), equalTo("SNMP://XMS3500:10.12.170.59"), "empty uniqueID");
