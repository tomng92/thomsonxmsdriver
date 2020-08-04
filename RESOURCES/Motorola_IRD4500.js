var myMIB = "IRD4500X-MIB";
var type = "IRD4500";

//Default values
var alarmPath = "IRD/Motorola/" + type + " (" + host + ")";
var pollInterval = 5;
var retries = 1;
var timeout = 5;
var uniqueID = "";
var signalTypeHD = false;

//For the OID verifier and initial state
snmp.retries = 1;
snmp.timeout = 5;

snmp.writeCommunity = "private";
snmp.readCommunity = "public";

if(this.parameters) {
   
   if (this.parameters['alarmPath']) {
      alarmPath = this.parameters['alarmPath'];
   }
   if (this.parameters['pollInterval']) {
      pollInterval = this.parameters['pollInterval'];
   }
   if (this.parameters['retries']) {
      retries = this.parameters['retries'];
   }
   if (this.parameters['timeout']) {
      timeout = this.parameters['timeout'];
   }
   if (this.parameters['uniqueID']) {
      uniqueID = this.parameters['uniqueID'];
   }
   if (this.parameters['signalTypeHD']) {
      signalTypeHD = this.parameters['signalTypeHD'];
   }
   if (this.parameters['writeCommunity']) {
	   snmp.writeCommunity = this.parameters['writeCommunity'];
   }
   if (this.parameters['readCommunity']) {
	   snmp.readCommunity = this.parameters['readCommunity'];
	   poller.readCommunity = this.parameters['readCommunity'];
   }
}

var prefixURI = "snmp://"+type+":"+host;
if(uniqueID != ""){
   prefixURI = "snmp://"+uniqueID+":"+type+":"+host;
}

//Set the Poller with correct values
poller.pollInterval = pollInterval;
poller.retries = retries;
poller.timeout = timeout;
poller.plugin = this;

var alarmState_OID = snmp.getOID(myMIB, 'alarmState');
var acquisitionState_OID = snmp.getOID(myMIB, 'acquisitionState');
var authorizationState_OID = snmp.getOID(myMIB, 'authorizationState');
var alarmTrigger_OID = snmp.getOID(myMIB, 'alarmTrigger');

//Misc Info OIDs
var ipAddress_OID = snmp.getOID(myMIB, 'ipAddress');
var subnetMask_OID = snmp.getOID(myMIB, 'subnetMask');
var defaultGateway_OID = snmp.getOID(myMIB, 'defaultGateway');
var macAddress_OID = snmp.getOID(myMIB, 'macAddress');
var identSoftwareVersion_OID = snmp.getOID(myMIB, 'identSoftwareVersion');
var identMIBVersion_OID = snmp.getOID(myMIB, 'identMIBVersion');
var identUnitModel_OID = snmp.getOID(myMIB, 'identUnitModel');

//Front panel LedStatus info OIDs
var digiCipherLED_OID = snmp.getOID(myMIB, 'digiCipherLED');
var authorizedLED_OID = snmp.getOID(myMIB, 'authorizedLED');
var bypassLED_OID = snmp.getOID(myMIB, 'bypassLED');
var relay1LED_OID = snmp.getOID(myMIB, 'relay1LED');
var relay2LED_OID = snmp.getOID(myMIB, 'relay2LED');
var relay3LED_OID = snmp.getOID(myMIB, 'relay3LED');

//HM related OIDs
var sysuptime_OID = snmp.getOID("RFC1213-MIB", "sysUpTime");

//Array to map Integer to Text
var relayState_textMap = ["Open",		//0
						  "Closed"];	//1

var acquisitionState_textMap = ["pause",          //Index: 0
                                "initHardware",   //1
                                "calibration",    //2
                                "tune",           //3
                                "sweep",          //4
                                "acquireViterbi", //5
                                "acqReedSolomon", //6
                                "fadeCntrl",      //7
                                "virChFound",     //8
                                "done"];          //9

var authorizationState_textMap =  ["authorized",               //Index: 0
                                   "other",                    //1
                                   "missingProgramRekey",      //2
                                   "missingWorkingKeyMesg",    //3
                                   "missingEventBlackOutMesg", //4
                                   "missingCategoryKey",       //5
                                   "oldCategorySequence",      //6
                                   "badSeedCheckSum",          //7
                                   "notSubscribed",            //8
                                   "regionalBlackOut",         //9
                                   "eventBlackOut",            //10
                                   "channelLockOut",           //11
                                   "missingVirtualMap",        //12
                                   "channelNotDefinedInVCM",   //13
                                   "notInSync",                //14
                                   "missingServiceStatus",     //15
                                   "undefinedService",         //16
                                   "tvpcCommProb",             //17
                                   "tvpcRequired",             //18
                                   "tvpcValidationFailure",    //19
                                   "invalidUnitKeyNumber",     //20
                                   "oldTvpcUnitAdd",           //21
                                   "tvpcNotMated",             //22
                                   "tvpcBaseUnitAddMismatch",  //23
                                   "newTvpcWrongVersionNum",   //24
                                   "tvpcUnitAddMismatch",      //25
                                   "tvpcRefusesToMate",        //26
                                   "tvpcPurPrgAtOtherUnit",    //27
                                   "tvpcAKNParityMismatch",    //28
                                   "indeterminateTvpcReason",  //29
                                   "incompletePrgRekeyChain"]; //30


this.alarmState = createAlarm("alarmState", "Video Presence", "status", alarmPath);
this.acquisitionState_text = createAlarm("acquisitionState_text", "Acquisition State", "text", alarmPath);
this.authorizationState = createAlarm("authorizationState", "Authorization", "status", alarmPath);
this.authorizationState_text = createAlarm("authorizationState_text", "Authorization", "text", alarmPath);
this.channelMode_text = createAlarm("channelMode","Channel Mode","text", alarmPath);
this.alarmTrigger_text = createAlarm("alarmTrigger","Alarm Trigger Value","text", alarmPath);


//Misc Info OIDs
var alarmPathI = alarmPath + "/Misc Info";
this.ipAddress = createAlarm("ipAddress", "IP Address", "text", alarmPathI);
this.subnetMask = createAlarm("subnetMask", "Subnet Mask", "text", alarmPathI);
this.defaultGateway = createAlarm("defaultGateway", "Gateway", "text", alarmPathI);
this.macAddress = createAlarm("macAddress", "MAC", "text", alarmPathI);
this.identSoftwareVersion = createAlarm("identSoftwareVersion", "Software Version", "text", alarmPathI);
this.identMIBVersion = createAlarm("identMIBVersion", "MIB Version", "text", alarmPathI);
this.identUnitModel = createAlarm("identUnitModel", "Unit Model", "text", alarmPathI);

//Front panel LedStatus info OIDs
var alarmPathLEDs = alarmPath + "/Front panel LEDs";
this.digiCipherLED = createAlarm("digiCipherLED", "DigiCipher", "status", alarmPathLEDs);
this.authorizedLED = createAlarm("authorizedLED", "Authorized", "status", alarmPathLEDs);
this.bypassLED = createAlarm("bypassLED", "Bypass", "status", alarmPathLEDs);
this.relay1LED = createAlarm("relay1noLED", "Relay 1", "text", alarmPathLEDs);
this.relay2LED = createAlarm("relay2noLED", "Relay 2", "text", alarmPathLEDs);
this.relay3LED = createAlarm("relay3noLED", "Relay 3", "text", alarmPathLEDs);

//Health Monitoring Alarm
var alarmPathHM = alarmPath + "/Health Monitoring";
this.powerCycle = createAlarm("powerCycle", "Device Reboot", "status", alarmPathHM);
this.commStatus = createAlarm("commStatus", "Communication Status", "status", alarmPathHM);


//Set the Array of objects to pool
var objectIDs = [ alarmState_OID,
                  acquisitionState_OID,
                  authorizationState_OID,
                  sysuptime_OID,
                  digiCipherLED_OID,
                  authorizedLED_OID,
                  bypassLED_OID,
                  relay1LED_OID,
                  relay2LED_OID,
                  relay3LED_OID];

poller.objectIDs = objectIDs;

this.init = false;
this.uptime = 0;


//Function to create the GSM Alarm
function createAlarm (alarmName, description, alarmType, alarmPath) {
   return gsm.addAlarm(prefixURI+"/"+alarmName,             //alarmURI
                       description,                         //alarmName
                       alarmPath,                           //path
                       "Motorola IRD4500",                  //deviceClass
                       prefixURI,                           //deviceURI
                       alarmType );                         //type
}


poller.onResult = function onResult(event) {
   if (event.success) {

      //The device is connected!
      this.plugin.commStatus.status = alarm.NORMAL;
      
      var j;
      var uptime = this.plugin.uptime;
      if( (j = event.variables[sysuptime_OID]) != undefined ) {
         this.plugin.uptime = java.lang.Long(event.variables[sysuptime_OID]);
         
         if (this.plugin.uptime.compareTo(uptime) < 0) {
            //Device restarted
            this.plugin.init = false;
            this.plugin.powerCycle.status = alarm.WARNING;
            
         } else {
            this.plugin.powerCycle.status = alarm.NORMAL;
         }
      }
      
      if(!this.plugin.init) {
         //Box reconnected or rebooted
         this.plugin.ipAddress.text = snmp.get(ipAddress_OID);
         this.plugin.subnetMask.text = snmp.get(subnetMask_OID);
         this.plugin.defaultGateway.text = snmp.get(defaultGateway_OID);
         this.plugin.macAddress.text = snmp.get(macAddress_OID);
         this.plugin.identSoftwareVersion.text = snmp.get(identSoftwareVersion_OID);
         this.plugin.identMIBVersion.text = snmp.get(identMIBVersion_OID);
         this.plugin.identUnitModel.text = snmp.get(identUnitModel_OID);
         
         //Video signal presence alarm
         //Here we need to set the trigger to detect video presence
         //We set the trigger to 1 if the signal is HD, else (if SD)
         //we set it to 0.
         if(signalTypeHD == true){
            snmp.set(alarmTrigger_OID, 1);
            this.plugin.channelMode_text.text = "HD";
         } else {
            snmp.set(alarmTrigger_OID, 0);
            this.plugin.channelMode_text.text = "SD";
         }
         
         //We display the AlarmTrigger value
         this.plugin.alarmTrigger_text.text = snmp.get(alarmTrigger_OID);
         
         this.plugin.init = true;
      }
      
      
      if( (j = event.variables[alarmState_OID]) != undefined) {        
         this.plugin.alarmState.status = (j == 0) ? alarm.ERROR : alarm.NORMAL;   
      }
      
      if( (j = event.variables[acquisitionState_OID]) != undefined) {
         this.plugin.acquisitionState_text.text = acquisitionState_textMap[j];
      }
      
      if( (j = event.variables[authorizationState_OID]) != undefined) {
         this.plugin.authorizationState.status = (j == 0) ? alarm.NORMAL : alarm.ERROR;
         this.plugin.authorizationState_text.text = authorizationState_textMap[j]; 
      }
      
       if( (j = event.variables[digiCipherLED_OID]) != undefined) {        
          this.plugin.digiCipherLED.status = (j == 1) ? alarm.NORMAL : alarm.ERROR;   
       }
       if( (j = event.variables[authorizedLED_OID]) != undefined) {        
          this.plugin.authorizedLED.status = (j == 1) ? alarm.NORMAL : alarm.ERROR;   
       }
       if( (j = event.variables[bypassLED_OID]) != undefined) {        
          this.plugin.bypassLED.status = (j == 0) ? alarm.NORMAL : alarm.ERROR;   
       }
       if( (j = event.variables[relay1LED_OID]) != undefined) {        
          this.plugin.relay1LED.text = relayState_textMap[j];
       }
        
       if( (j = event.variables[relay2LED_OID]) != undefined) {        
          this.plugin.relay2LED.text = relayState_textMap[j];
       }
        
       if( (j = event.variables[relay3LED_OID]) != undefined) {        
          this.plugin.relay3LED.text = relayState_textMap[j];
       }

   } else {
      //Error communicating with device...
      log.error(host + ": " + "Error: " + event.error);
      this.plugin.commStatus.status = alarm.ERROR;

      //Set all other Alarms to UNKNOWN
      this.plugin.alarmState.status = alarm.UNKNOWN;
      this.plugin.acquisitionState_text.text = '~';
      this.plugin.authorizationState.status = alarm.UNKNOWN;
      this.plugin.authorizationState_text.text = '~';
      this.plugin.channelMode_text.text = '~';
      this.plugin.alarmTrigger_text.text = '~';
      this.plugin.ipAddress.text = '~';
      this.plugin.subnetMask.text = '~';
      this.plugin.defaultGateway.text = '~';
      this.plugin.macAddress.text = '~';
      this.plugin.identSoftwareVersion.text = '~';
      this.plugin.identMIBVersion.text = '~';
      this.plugin.identUnitModel.text = '~';
      this.plugin.powerCycle.status = alarm.UNKNOWN;
      
      this.plugin.digiCipherLED.status = alarm.UNKNOWN;
      this.plugin.authorizedLED.status = alarm.UNKNOWN;
      this.plugin.bypassLED.status = alarm.UNKNOWN;
      this.plugin.relay1LED.text = '~';
      this.plugin.relay2LED.text = '~';
      this.plugin.relay3LED.text = '~';
      
      this.plugin.init = false;  //We should re-init the box
   }
};


//Virtual Overall Alarm Creation
var alarmOverall = new Object();
var subs = new Array();

alarmOverall.path = alarmPath;
alarmOverall.name = prefixURI + "/Overall";
alarmOverall.mode = "OR";

subs[0] = this.alarmState.uri;
subs[1] = this.authorizationState.uri; 

gsm.addVirtualAlarm(alarmOverall, subs);


//HM Overall alarm
var alarmOverallHM = new Object();
var subs = new Array();

alarmOverallHM.path = alarmPathHM;
alarmOverallHM.name = prefixURI + "/OverallHM";
alarmOverallHM.mode = "OR";

subs[0] = this.commStatus.uri;
subs[1] = this.powerCycle.uri;

gsm.addVirtualAlarm(alarmOverallHM, subs);
