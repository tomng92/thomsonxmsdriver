/**************************************************************************************
 * File: alarmStackTest.js
 * Tests of alarm stacks.
 * nov18.2013
 */

var myBasePath = "C:/Users/consultant/git/ThomsonXMSDriver";

// load the required scripts
load(myBasePath + "/lib/jsHamcrest-0.7.0.js");
load(myBasePath + "/lib/jsHamcrest-0.7.0.js");
load(myBasePath + "/lib/jsMockito-1.0.4.js");
load(myBasePath + "/lib/mockObjects.js");
load(myBasePath + "/src/deviceTypes.js");
load(myBasePath + "/src/thomsonAlarms.js");
load(myBasePath + "/src/alarmStacks.js");

JsHamcrest.Integration.Rhino(); // use the Rhino library

var DeviceManager = new DeviceManagerCtor();
var ThomsonSeverityManager = new ThomsonSeverityManagerCtor();
var AlarmManager = new AlarmManagerCtor();

/**
 * Testing the AlarmObj sameResourceAs() function
 */
var obj1 = new AlarmObj(undefined, 22, ThomsonSeverityManager.MINOR, "blah");
var obj2 = new AlarmObj("resid1", 22, ThomsonSeverityManager.MINOR, "blah");
var obj3 = new AlarmObj(undefined, 22, ThomsonSeverityManager.MINOR, "blah");
var obj4 = new AlarmObj(undefined, 222, ThomsonSeverityManager.MINOR, "blah");
var obj5 = new AlarmObj("resid1", 22, ThomsonSeverityManager.MINOR, "blah");
var obj6 = new AlarmObj("resid1", 8899, ThomsonSeverityManager.MINOR, "blah");

assertThat(obj1.sameResourceAs(obj2), equalTo(false), obj1.toString() + " not equal to " + obj2.toString());
assertThat(obj1.sameResourceAs(obj3), equalTo(true), obj1.toString() + " is equal to " + obj3.toString());
assertThat(obj1.sameResourceAs(obj4), equalTo(false), obj1.toString() + " is not equal to " + obj3.toString());

assertThat(obj2.sameResourceAs(obj5), equalTo(true), obj2.toString() + " is equal to " + obj5.toString());
assertThat(obj2.sameResourceAs(obj6), equalTo(false), obj2.toString() + " is not equal to " + obj6.toString());

/**
 * Test the alarm stack. 
 */
var stack = new AlarmStack("Stack1");
stack.addEvent(obj1);
stack.addEvent(obj2);
assertThat(stack.toString(), equalTo("Stack1[[resid1, 22, MINOR], [undefined, 22, MINOR]]")); // obj2 is on top of stack because it has same sev as obj1

// now we re-add obj1.The stack will stay same
stack.addEvent(obj1);
assertThat(stack.toString(), equalTo("Stack1[[undefined, 22, MINOR], [resid1, 22, MINOR]]"));

// now bump up the severity of obj1, and readd it. It should on top of stack because more severe.
obj1.severity = ThomsonSeverityManager.MAJOR;
stack.addEvent(obj1);
assertThat(stack.toString(), equalTo("Stack1[[undefined, 22, MAJOR], [resid1, 22, MINOR]]"));

// testing the removal of alarms
stack.removeEvent(obj1);
assertThat(stack.toString(), equalTo("Stack1[[resid1, 22, MINOR]]"));

// remove the last element
stack.removeEvent(obj2);
assertThat(stack.toString(), equalTo("Stack1[]")); // should be empty

