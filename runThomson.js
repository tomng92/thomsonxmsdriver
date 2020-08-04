// load the required scripts
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\lib\\jsHamcrest-0.7.0.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\lib\\jsMockito-1.0.4.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\lib\\mockObjects.js");
load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\lib\\genericMock.js");

BOOO! just testing ...

var snmp = MOCK.snmp;

var extractIndexedValuesInTable = JsMockito.mockFunction("extractIndexedValuesInTable");
JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementIndex').thenReturn([1,2,3,4]);
JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementName').thenReturn(["XMU_01", "EM187", "NFP248", "MY-ANY-DEVICE"]);
JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementParentIndex').thenReturn([0, 1, 1, 1]);
JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementType').thenReturn([4, 16, 12, 13]); // device types
JsMockito.when(extractIndexedValuesInTable)(JsHamcrest.Matchers.anything(), 'topoElementExtType').thenReturn([5, 9, 19, 888]);// device extTtypes

load("C:\\Users\\consultant\\git\\ThomsonXMSDriver\\OUTfullThomson.txt"); // topoReader requires DeviceManager to be instanciated.
