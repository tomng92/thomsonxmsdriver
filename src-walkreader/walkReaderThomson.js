/**
 * WalkReaderTest.js
 * 29 nov 2013 thnguyen
 */
var basedir = "C:\\Users\\consultant\\git\\ThomsonXMSDriver";// "C:\\Users\\consultant\\git\\CBC-Cisco-D9190\\CBC-Cisco-D9190"; 

// load the required scripts
load(basedir + "\\lib\\jsHamcrest-0.7.0.js");
JsHamcrest.Integration.Rhino(); // use the Rhino library

load(basedir + "\\src\\utilities.js");// read snmpwalks
load(basedir + "\\src-walkreader\\Walk-on-Remote.js");// read snmpwalks
load(basedir + "\\src-walkreader\\walkReader.js");// read snmpwalks

var reader = new WalkReader();
//reader.read(basedir + "\\src-walkreader\\testwalk.txt");
reader.readSuperBIGString(walkString);

/**
 * Verification:
 *   -  wrong parent
 *   - no parent
 *   - too many END
 *   - same key for 2 variabls
 *   
 */

//var fileContent = "hilo\n" + "hila\n" + "the\nend.\n";
//print(objToString(fileContent.split("\n")));

var names = reader.getAll("topoElementName");
print(objToString(names));

var softwareVersion = reader.get("genSoftwareVersion");
print("======>" + softwareVersion);


//// regular
//reader.selectBag("BAG_A");
//assertThat(reader.get("signalName", 1), equalTo("Signal 1 of BAG_A"), "BAG_A get(\"signalName\", 1)");
//
//// value that is inherited
//reader.selectBag("BAG_B");
//assertThat(reader.get("signalName", 2), equalTo("Signal 2 of BAG_B"), "BAG_B get(\"signalName\", 2)");
//assertThat(reader.get("signalName", 1), equalTo("Signal 1 of BAG_A"), "BAG_B get(\"signalName\", 1) inherited value");
//
//// check if values of BAG_B are merged in BAG_A
//var signalNameValues = reader.getAll("signalName");
//assertThat(signalNameValues[1], equalTo("Signal 1 of BAG_A"), "BAG_B signalNameValues[1])");
//assertThat(signalNameValues[2], equalTo("Signal 2 of BAG_B"), "BAG_B signalNameValues[2])");
//
//assertThat(reader.getAll("XXXXX"), equalTo(undefined), "getAll(bidon)");
//
//var signalNameArray = reader.getAllInArray("signalName");

//assertThat(arrayToString(signalNameArray), equalTo("[0:Signal 1 of BAG_A, 1:Signal 2 of BAG_B]"), "");

